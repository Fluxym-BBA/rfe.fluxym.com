/**
 * SCHEMATRON-ENGINE.JS — Re·Form·E
 * Interpréteur ISO Schematron exécuté intégralement dans le navigateur.
 *
 * Les Schematron FNFE sont en queryBinding="xslt2" : le moteur XPath natif des
 * navigateurs (1.0) ne sait pas les évaluer. L'évaluation est donc déléguée à
 * fontoxpath (moteur XPath 3.1 en JavaScript, licence MIT).
 *
 * Le moteur couvre le sous-ensemble Schematron réellement utilisé par la FNFE :
 *   - sch:ns, sch:let (schéma / pattern / règle), sch:pattern, sch:rule,
 *     sch:assert, sch:report, sch:value-of, sch:name, sch:phase
 *   - xsl:function déclaratives (xsl:param + xsl:variable + xsl:sequence),
 *     transpilées à la volée et enregistrées comme fonctions XPath custom
 *   - fn:document() résolue sur une base de codes préchargée (Factur-X)
 *
 * Sémantique respectée : dans un pattern, un nœud n'est traité que par la
 * PREMIÈRE règle dont le contexte le sélectionne (first-match-wins).
 *
 * Aucune donnée ne quitte le navigateur.
 */

const SchematronEngine = (() => {

    const SCH_NS = 'http://purl.oclc.org/dsdl/schematron';
    const XSL_NS = 'http://www.w3.org/1999/XSL/Transform';
    const XS_NS = 'http://www.w3.org/2001/XMLSchema';

    /** Cache des schémas compilés, clé = url. */
    const schemaCache = new Map();
    /** Documents auxiliaires (bases de codes) résolus par fn:document(). */
    const documentRegistry = new Map();
    /** Noms des fonctions custom déjà enregistrées auprès de fontoxpath. */
    const registeredFunctions = new Set();

    /**
     * Sources du moteur XPath, essayées dans l'ordre.
     * La copie locale passe en premier : elle rend le validateur totalement
     * autonome, y compris derrière un proxy qui bloque les CDN publics.
     */
    const ENGINE_SOURCES = [
        { kind: 'script', url: './lib/fontoxpath.js', label: 'copie locale du dépôt' },
        { kind: 'script', url: 'https://cdn.jsdelivr.net/npm/fontoxpath@3.33.1/dist/fontoxpath.js', label: 'jsDelivr' },
        { kind: 'script', url: 'https://unpkg.com/fontoxpath@3.33.1/dist/fontoxpath.js', label: 'unpkg' },
        { kind: 'module', url: 'https://cdn.jsdelivr.net/npm/fontoxpath@3.33.1/+esm', label: 'jsDelivr (module ES)' },
    ];

    let enginePromise = null;

    const loadScript = (url) => new Promise((resolve, reject) => {
        const tag = document.createElement('script');
        tag.src = url;
        tag.async = false;
        tag.onload = () => resolve();
        tag.onerror = () => reject(new Error('script non chargé'));
        document.head.appendChild(tag);
    });

    /**
     * Charge le moteur XPath 3.1 en essayant chaque source successivement.
     * @param {Function} onLog rapporte chaque tentative dans la console de la page
     */
    const ensureEngine = (onLog = () => {}) => {
        if (window.fontoxpath) return Promise.resolve(window.fontoxpath);
        if (enginePromise) return enginePromise;

        enginePromise = (async () => {
            const failures = [];
            for (const source of ENGINE_SOURCES) {
                try {
                    if (source.kind === 'script') {
                        await loadScript(source.url);
                    } else {
                        const mod = await import(source.url);
                        window.fontoxpath = mod.default && mod.default.evaluateXPath ? mod.default : mod;
                    }
                    if (window.fontoxpath && window.fontoxpath.evaluateXPath) {
                        onLog('Moteur XPath 3.1 chargé depuis <strong>' + source.label + '</strong>.');
                        return window.fontoxpath;
                    }
                    failures.push(source.label + ' : chargé mais aucun moteur exposé');
                } catch (e) {
                    failures.push(source.label + ' : inaccessible');
                }
            }
            enginePromise = null;
            const err = new Error('Moteur XPath 3.1 indisponible — ' + failures.join(' · '));
            err.isEngineMissing = true;
            throw err;
        })();

        return enginePromise;
    };

    const fx = () => {
        if (!window.fontoxpath) {
            const err = new Error('Le moteur XPath 3.1 (fontoxpath) n\'est pas chargé.');
            err.isEngineMissing = true;
            throw err;
        }
        return window.fontoxpath;
    };

    /* ===================================================================
       1. UTILITAIRES XPATH / TYPES
       =================================================================== */

    /** Traduit un type XSLT (@as) en type accepté par fontoxpath. */
    const mapType = (as) => {
        if (!as) return 'item()*';
        const t = as.trim();
        if (/^xs:string\??$/.test(t)) return 'xs:string?';
        if (/^xs:boolean\??$/.test(t)) return 'xs:boolean?';
        if (/^xs:(decimal|double|float|integer|int|long)\??$/.test(t)) return 'xs:double?';
        if (/^(element|node|attribute|document-node)\(\)?\??/.test(t)) return 'node()?';
        return 'item()*';
    };

    /** Type de retour + extracteur associé. */
    const mapReturn = (as) => {
        const t = (as || '').trim();
        if (/^xs:boolean\??$/.test(t)) return { type: 'xs:boolean', kind: 'boolean' };
        if (/^xs:string\??$/.test(t)) return { type: 'xs:string', kind: 'string' };
        if (/^xs:(decimal|double|float|integer|int|long)\??$/.test(t)) return { type: 'xs:double', kind: 'number' };
        return { type: 'item()*', kind: 'any' };
    };

    /**
     * Les variables Schematron/XSLT peuvent porter un préfixe (ex. $custom:eas-codes).
     * fontoxpath n'accepte que des clés simples : on réécrit les références.
     */
    const sanitizeExpression = (expr, renames) => {
        let out = expr;
        renames.forEach((safe, original) => {
            if (original === safe) return;
            const re = new RegExp('\\$' + original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w.-])', 'g');
            out = out.replace(re, '$' + safe);
        });
        return out;
    };

    const safeVarName = (name) => name.replace(/[^\w]/g, '_');

    /* ===================================================================
       2. COMPILATION D'UN SCHEMATRON
       =================================================================== */

    const localChildren = (parent, ns, name) =>
        Array.from(parent.childNodes).filter(
            (n) => n.nodeType === 1 && n.namespaceURI === ns && n.localName === name
        );

    const allDescendants = (root, ns, name) =>
        Array.from(root.getElementsByTagNameNS(ns, name));

    /** Compile les <xsl:function> déclaratives en fonctions XPath custom. */
    const compileFunctions = (schemaEl, nsMap) => {
        const compiled = [];
        allDescendants(schemaEl, XSL_NS, 'function').forEach((fnEl) => {
            const qname = fnEl.getAttribute('name');
            if (!qname || !qname.includes(':')) return;
            const [prefix, localName] = qname.split(':');
            const namespaceURI = nsMap[prefix];
            if (!namespaceURI) return;

            const renames = new Map();
            const params = localChildren(fnEl, XSL_NS, 'param').map((p) => {
                const n = p.getAttribute('name');
                const safe = safeVarName(n);
                renames.set(n, safe);
                return { name: safe, type: mapType(p.getAttribute('as')) };
            });

            const variables = localChildren(fnEl, XSL_NS, 'variable').map((v) => {
                const n = v.getAttribute('name');
                const safe = safeVarName(n);
                const select = v.getAttribute('select') || '()';
                renames.set(n, safe);
                return { name: safe, select };
            });

            const seq = localChildren(fnEl, XSL_NS, 'sequence')[0]
                || localChildren(fnEl, XSL_NS, 'value-of')[0];
            if (!seq) return;

            compiled.push({
                key: namespaceURI + '#' + localName + '#' + params.length,
                namespaceURI,
                localName,
                params,
                variables: variables.map((v) => ({ name: v.name, select: sanitizeExpression(v.select, renames) })),
                body: sanitizeExpression(seq.getAttribute('select') || '()', renames),
                ret: mapReturn(fnEl.getAttribute('as')),
            });
        });
        return compiled;
    };

    /** Enregistre auprès de fontoxpath les fonctions compilées (une seule fois). */
    const registerFunctions = (functions, nsResolver) => {
        const engine = fx();
        functions.forEach((f) => {
            if (registeredFunctions.has(f.key)) return;
            registeredFunctions.add(f.key);

            const argTypes = f.params.map((p) => p.type);
            engine.registerCustomXPathFunction(
                { namespaceURI: f.namespaceURI, localName: f.localName },
                argTypes,
                f.ret.type,
                (dynamicContext, ...args) => {
                    const vars = {};
                    f.params.forEach((p, i) => { vars[p.name] = args[i]; });
                    const options = { namespaceResolver: nsResolver, language: engine.evaluateXPath.XPATH_3_1_LANGUAGE };
                    f.variables.forEach((v) => {
                        vars[v.name] = engine.evaluateXPath(v.select, null, null, vars, engine.evaluateXPath.ANY_TYPE, options);
                    });
                    switch (f.ret.kind) {
                        case 'boolean': return engine.evaluateXPathToBoolean(f.body, null, null, vars, options);
                        case 'string': return engine.evaluateXPathToString(f.body, null, null, vars, options);
                        case 'number': return engine.evaluateXPathToNumber(f.body, null, null, vars, options);
                        default: {
                            const r = engine.evaluateXPath(f.body, null, null, vars, engine.evaluateXPath.ANY_TYPE, options);
                            return Array.isArray(r) ? r : (r === null || r === undefined ? [] : [r]);
                        }
                    }
                }
            );
        });
    };

    /** Enregistre fn:document() / custom:document() sur la base de codes préchargée. */
    const registerDocumentResolver = () => {
        const engine = fx();
        const key = 'fn#document#1';
        if (registeredFunctions.has(key)) return;
        registeredFunctions.add(key);
        try {
            engine.registerCustomXPathFunction(
            { namespaceURI: 'http://www.w3.org/2005/xpath-functions', localName: 'document' },
            ['xs:string?'],
            'node()*',
            (dynamicContext, href) => {
                if (!href) return [];
                const name = String(href).split('/').pop();
                const doc = documentRegistry.get(name) || documentRegistry.get(String(href));
                if (!doc) {
                    throw new Error('Base de codes absente : ' + name);
                }
                return [doc];
            }
            );
        } catch (e) {
            // Le moteur XPath peut refuser l'enregistrement dans l'espace de noms fn:.
            // Les règles utilisant document() basculeront alors dans « Non évaluées ».
        }
    };

    /** Extrait le message d'un assert/report, avec ses value-of dynamiques. */
    const compileMessage = (el) => {
        const parts = [];
        Array.from(el.childNodes).forEach((n) => {
            if (n.nodeType === 3) {
                parts.push({ kind: 'text', text: n.nodeValue });
            } else if (n.nodeType === 1 && n.namespaceURI === SCH_NS) {
                if (n.localName === 'value-of') {
                    parts.push({ kind: 'value-of', select: n.getAttribute('select') || '.' });
                } else if (n.localName === 'name') {
                    parts.push({ kind: 'name', select: n.getAttribute('path') || '.' });
                } else {
                    parts.push({ kind: 'text', text: n.textContent });
                }
            }
        });
        return parts;
    };

    /** Compile un fichier .sch en structure exploitable. */
    const compileSchematron = (text, meta) => {
        const doc = new DOMParser().parseFromString(text, 'application/xml');
        if (doc.getElementsByTagName('parsererror').length) {
            throw new Error('Schematron illisible : ' + meta.file);
        }
        const root = doc.documentElement;

        const nsMap = { xs: XS_NS, sch: SCH_NS };
        allDescendants(root, SCH_NS, 'ns').forEach((n) => {
            const p = n.getAttribute('prefix');
            const u = n.getAttribute('uri');
            if (p && u) nsMap[p] = u;
        });

        const functions = compileFunctions(root, nsMap);

        const readLets = (parent) => localChildren(parent, SCH_NS, 'let')
            .map((l) => ({ name: safeVarName(l.getAttribute('name')), raw: l.getAttribute('name'), select: l.getAttribute('value') }));

        const globalLets = readLets(root);

        const patterns = allDescendants(root, SCH_NS, 'pattern')
            .filter((p) => p.getAttribute('abstract') !== 'true')
            .map((p, pi) => ({
                id: p.getAttribute('id') || ('pattern-' + (pi + 1)),
                lets: readLets(p),
                rules: localChildren(p, SCH_NS, 'rule')
                    .filter((r) => r.getAttribute('abstract') !== 'true' && r.getAttribute('context'))
                    .map((r) => ({
                        context: r.getAttribute('context'),
                        lets: readLets(r),
                        assertions: Array.from(r.childNodes)
                            .filter((n) => n.nodeType === 1 && n.namespaceURI === SCH_NS
                                && (n.localName === 'assert' || n.localName === 'report'))
                            .map((a) => ({
                                isAssert: a.localName === 'assert',
                                id: a.getAttribute('id') || '',
                                test: a.getAttribute('test') || 'true()',
                                flag: a.getAttribute('flag') || '',
                                role: a.getAttribute('role') || '',
                                message: compileMessage(a),
                            })),
                    })),
            }));

        const totalRules = patterns.reduce((s, p) => s + p.rules.length, 0);
        const totalAssertions = patterns.reduce(
            (s, p) => s + p.rules.reduce((t, r) => t + r.assertions.length, 0), 0);

        return { ...meta, nsMap, functions, globalLets, patterns, totalRules, totalAssertions };
    };

    /* ===================================================================
       3. CHARGEMENT
       =================================================================== */

    const loadSchema = async (meta) => {
        if (schemaCache.has(meta.url)) return schemaCache.get(meta.url);
        const res = await fetch(meta.url, { cache: 'no-cache' });
        if (!res.ok) throw new Error('Schematron introuvable (' + res.status + ') : ' + meta.url);
        const compiled = compileSchematron(await res.text(), meta);
        schemaCache.set(meta.url, compiled);
        return compiled;
    };

    const loadCodeDatabase = async (name, url) => {
        if (documentRegistry.has(name)) return true;
        try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) return false;
            const doc = new DOMParser().parseFromString(await res.text(), 'application/xml');
            if (doc.getElementsByTagName('parsererror').length) return false;
            documentRegistry.set(name, doc);
            return true;
        } catch (e) {
            return false;
        }
    };

    /* ===================================================================
       4. LOCALISATION DES NŒUDS
       =================================================================== */

    /**
     * Associe à chaque élément du DOM sa ligne source.
     * DOMParser ne conserve pas les numéros de ligne : on scanne le texte brut
     * pour relever, dans l'ordre du document, la ligne de chaque balise
     * ouvrante, puis on aligne avec le parcours du DOM (même ordre).
     */
    const buildLineMap = (xmlText, xmlDoc) => {
        const starts = [];
        let line = 1;
        let i = 0;
        const len = xmlText.length;
        while (i < len) {
            const c = xmlText[i];
            if (c === '\n') { line++; i++; continue; }
            if (c !== '<') { i++; continue; }
            const next = xmlText[i + 1];
            if (next === '?' || next === '/') { i += 2; continue; }
            if (next === '!') {
                if (xmlText.startsWith('<!--', i)) {
                    const end = xmlText.indexOf('-->', i);
                    const seg = xmlText.slice(i, end === -1 ? len : end);
                    line += (seg.match(/\n/g) || []).length;
                    i = end === -1 ? len : end + 3;
                    continue;
                }
                if (xmlText.startsWith('<![CDATA[', i)) {
                    const end = xmlText.indexOf(']]>', i);
                    const seg = xmlText.slice(i, end === -1 ? len : end);
                    line += (seg.match(/\n/g) || []).length;
                    i = end === -1 ? len : end + 3;
                    continue;
                }
                i += 2;
                continue;
            }
            if (/[A-Za-z_]/.test(next || '')) { starts.push(line); }
            i++;
        }

        const map = new WeakMap();
        let idx = 0;
        const walk = (el) => {
            map.set(el, starts[idx] || 1);
            idx++;
            Array.from(el.children).forEach(walk);
        };
        if (xmlDoc.documentElement) walk(xmlDoc.documentElement);
        return map;
    };

    /** Chemin XPath lisible d'un nœud, avec index de position. */
    const nodePath = (node) => {
        if (!node) return '';
        if (node.nodeType === 2) return nodePath(node.ownerElement) + '/@' + node.nodeName;
        if (node.nodeType !== 1) return nodePath(node.parentNode);
        const segments = [];
        let cur = node;
        while (cur && cur.nodeType === 1) {
            const siblings = cur.parentNode && cur.parentNode.nodeType === 1
                ? Array.from(cur.parentNode.children).filter((s) => s.nodeName === cur.nodeName)
                : [cur];
            const pos = siblings.indexOf(cur) + 1;
            segments.unshift(cur.nodeName + (siblings.length > 1 ? '[' + pos + ']' : ''));
            cur = cur.parentNode;
        }
        return '/' + segments.join('/');
    };

    /* ===================================================================
       5. ÉVALUATION
       =================================================================== */

    /** Découpe une union XPath sur les « | » de premier niveau. */
    const splitUnion = (expr) => {
        const parts = [];
        let depth = 0;
        let buf = '';
        let quote = null;
        for (const ch of expr) {
            if (quote) {
                buf += ch;
                if (ch === quote) quote = null;
                continue;
            }
            if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
            if (ch === '(' || ch === '[') depth++;
            if (ch === ')' || ch === ']') depth--;
            if (ch === '|' && depth === 0) { parts.push(buf); buf = ''; continue; }
            buf += ch;
        }
        parts.push(buf);
        return parts.map((p) => p.trim()).filter(Boolean);
    };

    /** Transforme un contexte de règle (motif XSLT) en expression XPath absolue. */
    const contextToXPath = (context) => splitUnion(context)
        .map((branch) => {
            if (/^(\/|\(|descendant|child::|\.\/)/.test(branch)) return branch;
            return '//' + branch;
        })
        .join(' | ');

    const interpolate = (parts, node, vars, options, engine) => parts.map((p) => {
        if (p.kind === 'text') return p.text;
        try {
            if (p.kind === 'name') {
                const n = engine.evaluateXPathToFirstNode(p.select, node, null, vars, options);
                return n ? n.nodeName : node.nodeName;
            }
            return engine.evaluateXPathToString(p.select, node, null, vars, options);
        } catch (e) {
            return '';
        }
    }).join('').replace(/\s+/g, ' ').trim();

    const severityOf = (assertion, schema) => {
        const flag = (assertion.flag || assertion.role || '').toLowerCase();
        if (flag === 'warning' || flag === 'info') return 'warning';
        if (flag === 'fatal' || flag === 'error') return 'error';
        return schema.defaultSeverity || 'error';
    };

    /**
     * Valide un document XML contre une liste de schémas compilés.
     * @returns {{violations:Array, skipped:Array, stats:Object}}
     */
    const validate = (xmlDoc, xmlText, schemas) => {
        const engine = fx();
        registerDocumentResolver();

        const lineMap = buildLineMap(xmlText, xmlDoc);
        const violations = [];
        const skipped = [];
        const stats = { rulesFired: 0, assertionsEvaluated: 0, schemas: [] };
        const startedAt = performance.now();

        schemas.forEach((schema) => {
            const nsResolver = (prefix) => schema.nsMap[prefix] || null;
            const options = {
                namespaceResolver: nsResolver,
                language: engine.evaluateXPath.XPATH_3_1_LANGUAGE,
            };
            registerFunctions(schema.functions, nsResolver);

            const schemaStats = { id: schema.id, label: schema.label, rulesFired: 0, assertionsEvaluated: 0, errors: 0, warnings: 0, skipped: 0 };

            const globalVars = {};
            schema.globalLets.forEach((l) => {
                try {
                    globalVars[l.name] = engine.evaluateXPath(l.select, xmlDoc, null, globalVars, engine.evaluateXPath.ANY_TYPE, options);
                } catch (e) {
                    globalVars[l.name] = null;
                }
            });

            schema.patterns.forEach((pattern) => {
                const patternVars = { ...globalVars };
                pattern.lets.forEach((l) => {
                    try {
                        patternVars[l.name] = engine.evaluateXPath(l.select, xmlDoc, null, patternVars, engine.evaluateXPath.ANY_TYPE, options);
                    } catch (e) {
                        patternVars[l.name] = null;
                    }
                });

                const claimed = new Set();

                pattern.rules.forEach((rule) => {
                    let nodes;
                    try {
                        nodes = engine.evaluateXPathToNodes(contextToXPath(rule.context), xmlDoc, null, patternVars, options);
                    } catch (e) {
                        skipped.push({
                            schema: schema.label, pattern: pattern.id, ruleContext: rule.context,
                            reason: 'Contexte non évaluable : ' + e.message,
                            assertions: rule.assertions.length,
                        });
                        schemaStats.skipped += rule.assertions.length;
                        return;
                    }

                    nodes.forEach((node) => {
                        if (claimed.has(node)) return;
                        claimed.add(node);
                        stats.rulesFired++;
                        schemaStats.rulesFired++;

                        const vars = { ...patternVars };
                        rule.lets.forEach((l) => {
                            try {
                                vars[l.name] = engine.evaluateXPath(l.select, node, null, vars, engine.evaluateXPath.ANY_TYPE, options);
                            } catch (e) {
                                vars[l.name] = null;
                            }
                        });

                        rule.assertions.forEach((assertion) => {
                            let result;
                            try {
                                result = engine.evaluateXPathToBoolean(assertion.test, node, null, vars, options);
                            } catch (e) {
                                skipped.push({
                                    schema: schema.label, pattern: pattern.id, id: assertion.id,
                                    ruleContext: rule.context, test: assertion.test,
                                    reason: e.message, assertions: 1,
                                });
                                schemaStats.skipped++;
                                return;
                            }
                            stats.assertionsEvaluated++;
                            schemaStats.assertionsEvaluated++;

                            const violated = assertion.isAssert ? !result : result;
                            if (!violated) return;

                            const severity = severityOf(assertion, schema);
                            if (severity === 'warning') schemaStats.warnings++; else schemaStats.errors++;

                            violations.push({
                                id: assertion.id || '(sans identifiant)',
                                severity,
                                flag: assertion.flag || assertion.role || '',
                                kind: assertion.isAssert ? 'assert' : 'report',
                                message: interpolate(assertion.message, node, vars, options, engine) || assertion.test,
                                test: assertion.test,
                                schema: schema.label,
                                schemaId: schema.id,
                                pattern: pattern.id,
                                context: rule.context,
                                path: nodePath(node),
                                line: lineMap.get(node.nodeType === 2 ? node.ownerElement : node) || 1,
                            });
                        });
                    });
                });
            });

            stats.schemas.push(schemaStats);
        });

        stats.durationMs = Math.round(performance.now() - startedAt);
        violations.sort((a, b) => (a.line - b.line) || a.id.localeCompare(b.id));
        return { violations, skipped, stats };
    };

    /* ===================================================================
       6. API PUBLIQUE
       =================================================================== */

    return {
        ensureEngine,
        get isEngineReady() { return Boolean(window.fontoxpath && window.fontoxpath.evaluateXPath); },
        loadSchema,
        loadCodeDatabase,
        validate,
        nodePath,
        buildLineMap,
        get loadedSchemas() { return Array.from(schemaCache.values()); },
    };
})();
