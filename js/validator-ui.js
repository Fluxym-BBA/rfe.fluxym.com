/**
 * VALIDATOR-UI.JS — Re·Form·E
 * Console de validation XML : éditeur à gauche, résultats en bas, exécution
 * du Schematron FNFE en temps réel via js/schematron-engine.js.
 */

const ValidatorUI = (() => {

    const MANIFEST_URL = './data/schematron/manifest.json';
    const DEBOUNCE_MS = 700;
    const STORAGE_KEY = 'reforme.validateur.xml';

    let manifest = null;
    let activePackId = null;
    let debounceTimer = null;
    let lastResult = null;
    let currentFilter = 'all';

    const el = (id) => document.getElementById(id);

    /* ===================================================================
       ÉDITEUR : textarea + gouttière + coloration
       =================================================================== */

    const escapeHtml = (s) => s
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const highlightXml = (text) => escapeHtml(text)
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xh-comment">$1</span>')
        .replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span class="xh-pi">$1</span>')
        .replace(/(&lt;\/?)([\w.-]+:)?([\w.-]+)/g,
            '$1<span class="xh-ns">$2</span><span class="xh-tag">$3</span>')
        .replace(/([\w.-]+)=(&quot;|")((?:[^"&]|&(?!quot;))*)(&quot;|")/g,
            '<span class="xh-attr">$1</span>=<span class="xh-value">"$3"</span>');

    const renderGutter = (lineCount, markers) => {
        const rows = [];
        for (let i = 1; i <= lineCount; i++) {
            const m = markers.get(i);
            const cls = m ? ' gutter-line--' + m : '';
            rows.push('<div class="gutter-line' + cls + '" data-line="' + i + '">' + i + '</div>');
        }
        el('ed-gutter').innerHTML = rows.join('');
    };

    const refreshEditor = () => {
        const text = el('ed-input').value;
        el('ed-highlight').innerHTML = highlightXml(text) + '\n';
        const markers = new Map();
        if (lastResult) {
            lastResult.violations.forEach((v) => {
                if (v.severity === 'error') markers.set(v.line, 'error');
                else if (!markers.has(v.line)) markers.set(v.line, 'warning');
            });
        }
        renderGutter(text.split('\n').length, markers);
        syncScroll();
        updateCursorPosition();
    };

    const syncScroll = () => {
        const input = el('ed-input');
        el('ed-highlight').scrollTop = input.scrollTop;
        el('ed-highlight').scrollLeft = input.scrollLeft;
        el('ed-gutter').scrollTop = input.scrollTop;
    };

    const updateCursorPosition = () => {
        const input = el('ed-input');
        const upTo = input.value.slice(0, input.selectionStart);
        const line = upTo.split('\n').length;
        const col = upTo.length - upTo.lastIndexOf('\n');
        el('status-caret').textContent = 'Ligne ' + line + ', col ' + col;
    };

    const jumpToLine = (line) => {
        const input = el('ed-input');
        const lines = input.value.split('\n');
        const start = lines.slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
        const end = start + (lines[line - 1] || '').length;
        input.focus();
        input.setSelectionRange(start, end);
        const lineHeight = input.scrollHeight / Math.max(lines.length, 1);
        input.scrollTop = Math.max(0, (line - 6) * lineHeight);
        syncScroll();
        updateCursorPosition();
    };

    /* ===================================================================
       MANIFESTE & SÉLECTION DES SCHÉMAS
       =================================================================== */

    const loadManifest = async () => {
        const res = await fetch(MANIFEST_URL, { cache: 'no-cache' });
        if (!res.ok) throw new Error('manifest.json introuvable (' + res.status + ')');
        manifest = await res.json();
        el('pack-version').textContent = manifest.package;
        el('pack-date').textContent = manifest.publishedAt;

        el('pack-select').innerHTML = manifest.packs
            .map((p) => '<option value="' + p.id + '">' + p.label + '</option>').join('');

        (manifest.codeDatabases || []).forEach((db) => {
            SchematronEngine.loadCodeDatabase(db.name, db.url);
        });

        setPack(manifest.packs[0].id);
    };

    const currentPack = () => manifest.packs.find((p) => p.id === activePackId);

    const setPack = (packId) => {
        activePackId = packId;
        el('pack-select').value = packId;
        const pack = currentPack();
        el('pack-description').textContent = pack.description;
        el('schema-list').innerHTML = pack.schemas.map((s) => `
            <label class="schema-toggle" title="${s.note || ''}">
                <input type="checkbox" value="${s.id}" ${s.enabledByDefault ? 'checked' : ''}>
                <span class="schema-name">${s.label}</span>
                <span class="schema-file">${s.file}</span>
                <span class="schema-sev schema-sev--${s.defaultSeverity}">${s.defaultSeverity === 'warning' ? 'avertissements' : 'erreurs'}</span>
            </label>`).join('');
        el('schema-list').querySelectorAll('input').forEach((cb) =>
            cb.addEventListener('change', () => scheduleRun(0)));
        scheduleRun(0);
    };

    const selectedSchemas = () => {
        const pack = currentPack();
        const ids = Array.from(el('schema-list').querySelectorAll('input:checked')).map((c) => c.value);
        return pack.schemas.filter((s) => ids.includes(s.id));
    };

    /** Détecte le pack adapté à la racine du document. */
    const autoDetectPack = (xmlDoc) => {
        const root = xmlDoc.documentElement;
        if (!root) return;
        const local = root.localName;
        const ns = root.namespaceURI || '';
        const match = manifest.packs.find((p) =>
            (p.detect.roots || []).includes(local)
            && (!p.detect.namespace || ns.includes(p.detect.namespace)));
        if (match && match.id !== activePackId) {
            setPack(match.id);
            log('Format détecté : ' + match.label);
            return true;
        }
        return false;
    };

    /* ===================================================================
       VALIDATION
       =================================================================== */

    const setStatus = (state, text) => {
        const badge = el('status-state');
        badge.className = 'status-badge status-badge--' + state;
        badge.textContent = text;
    };

    const log = (msg) => {
        const box = el('console-log');
        const stamp = new Date().toLocaleTimeString('fr-FR');
        box.insertAdjacentHTML('afterbegin',
            '<div class="log-line"><span class="log-time">' + stamp + '</span>' + msg + '</div>');
    };

    const scheduleRun = (delay = DEBOUNCE_MS) => {
        clearTimeout(debounceTimer);
        setStatus('pending', 'Modifié…');
        debounceTimer = setTimeout(run, delay);
    };

    const run = async () => {
        const text = el('ed-input').value;
        localStorage.setItem(STORAGE_KEY, text);

        if (!text.trim()) {
            lastResult = null;
            renderResults({ violations: [], skipped: [], stats: { schemas: [], durationMs: 0, assertionsEvaluated: 0, rulesFired: 0 } });
            setStatus('idle', 'En attente d\'un fichier');
            refreshEditor();
            return;
        }

        // Niveau 1 : XML bien formé
        const xmlDoc = new DOMParser().parseFromString(text, 'application/xml');
        const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
        if (parseError) {
            lastResult = {
                violations: [{
                    id: 'XML-WELLFORMED', severity: 'error', kind: 'assert',
                    message: parseError.textContent.replace(/\s+/g, ' ').trim(),
                    schema: 'Niveau 1 — XML bien formé', schemaId: 'wellformed',
                    pattern: '—', context: '—', path: '—', test: '—',
                    line: extractErrorLine(parseError.textContent),
                }],
                skipped: [],
                stats: { schemas: [], durationMs: 0, assertionsEvaluated: 0, rulesFired: 0 },
            };
            renderResults(lastResult);
            setStatus('error', 'XML non valide');
            refreshEditor();
            return;
        }

        autoDetectPack(xmlDoc);
        setStatus('running', 'Validation…');

        try {
            const metas = selectedSchemas().map((s) => ({
                id: s.id, label: s.label, file: s.file, url: s.url,
                defaultSeverity: s.defaultSeverity,
            }));
            const schemas = [];
            for (const meta of metas) {
                schemas.push(await SchematronEngine.loadSchema(meta));
            }
            lastResult = SchematronEngine.validate(xmlDoc, text, schemas);
            renderResults(lastResult);
            const errors = lastResult.violations.filter((v) => v.severity === 'error').length;
            setStatus(errors ? 'error' : 'ok', errors ? errors + ' erreur' + (errors > 1 ? 's' : '') : 'Conforme');
        } catch (e) {
            log('<span class="log-err">Échec : ' + e.message + '</span>');
            setStatus('error', 'Erreur moteur');
        }
        refreshEditor();
    };

    const extractErrorLine = (msg) => {
        const m = msg.match(/[Ll]ine[^\d]*(\d+)/) || msg.match(/ligne[^\d]*(\d+)/);
        return m ? parseInt(m[1], 10) : 1;
    };

    /* ===================================================================
       RENDU DES RÉSULTATS
       =================================================================== */

    const renderResults = (result) => {
        const errors = result.violations.filter((v) => v.severity === 'error');
        const warnings = result.violations.filter((v) => v.severity === 'warning');

        el('tab-count-errors').textContent = errors.length;
        el('tab-count-warnings').textContent = warnings.length;
        el('tab-count-skipped').textContent = result.skipped.reduce((s, k) => s + (k.assertions || 1), 0);

        const list = currentFilter === 'errors' ? errors
            : currentFilter === 'warnings' ? warnings
                : result.violations;

        if (currentFilter === 'skipped') {
            el('console-results').innerHTML = result.skipped.length
                ? result.skipped.map((s) => `
                    <div class="result-row result-row--skipped">
                        <span class="result-sev result-sev--skipped">non évaluée</span>
                        <div class="result-body">
                            <div class="result-head"><strong>${s.id || s.pattern}</strong>
                                <span class="result-schema">${s.schema}</span></div>
                            <div class="result-msg">${escapeHtml(s.reason)}</div>
                            <div class="result-meta"><code>${escapeHtml(s.test || s.ruleContext)}</code></div>
                        </div>
                    </div>`).join('')
                : '<div class="console-empty">Aucune règle écartée : toutes les assertions des schémas sélectionnés ont été évaluées.</div>';
        } else if (!list.length) {
            el('console-results').innerHTML = result.stats.assertionsEvaluated
                ? '<div class="console-empty console-empty--ok">✅ Aucune anomalie sur ce filtre — '
                + result.stats.assertionsEvaluated.toLocaleString('fr-FR')
                + ' assertions évaluées en ' + result.stats.durationMs + ' ms.</div>'
                : '<div class="console-empty">Déposez ou saisissez un fichier XML pour lancer les contrôles.</div>';
        } else {
            el('console-results').innerHTML = list.map((v) => `
                <div class="result-row result-row--${v.severity}" data-line="${v.line}">
                    <span class="result-sev result-sev--${v.severity}">${v.severity === 'error' ? 'erreur' : 'avertissement'}</span>
                    <div class="result-body">
                        <div class="result-head">
                            <strong>${escapeHtml(v.id)}</strong>
                            <span class="result-line">ligne ${v.line}</span>
                            <span class="result-schema">${escapeHtml(v.schema)}</span>
                        </div>
                        <div class="result-msg">${escapeHtml(v.message)}</div>
                        <div class="result-meta"><code>${escapeHtml(v.path)}</code></div>
                    </div>
                </div>`).join('');
            el('console-results').querySelectorAll('.result-row[data-line]').forEach((row) =>
                row.addEventListener('click', () => jumpToLine(parseInt(row.dataset.line, 10))));
        }

        el('status-metrics').textContent = result.stats.assertionsEvaluated
            ? result.stats.assertionsEvaluated.toLocaleString('fr-FR') + ' assertions · '
            + result.stats.rulesFired.toLocaleString('fr-FR') + ' règles déclenchées · '
            + result.stats.durationMs + ' ms'
            : '—';

        el('schema-stats').innerHTML = result.stats.schemas.map((s) => `
            <div class="schema-stat">
                <span class="schema-stat-label">${escapeHtml(s.label)}</span>
                <span class="schema-stat-num schema-stat-num--err">${s.errors}</span>
                <span class="schema-stat-num schema-stat-num--warn">${s.warnings}</span>
                <span class="schema-stat-num schema-stat-num--skip">${s.skipped}</span>
            </div>`).join('');
    };

    /* ===================================================================
       ENTRÉES / SORTIES
       =================================================================== */

    /** Extrait le XML CII embarqué dans un PDF Factur-X. */
    const extractXmlFromPdf = async (buffer) => {
        const bytes = new Uint8Array(buffer);
        const raw = new TextDecoder('latin1').decode(bytes);
        const candidates = [];
        const re = /stream\r?\n?/g;
        let m;
        while ((m = re.exec(raw)) !== null) {
            const start = m.index + m[0].length;
            const end = raw.indexOf('endstream', start);
            if (end === -1) continue;
            candidates.push([start, end]);
        }
        for (const [start, end] of candidates) {
            const slice = bytes.slice(start, end);
            const direct = new TextDecoder('utf-8').decode(slice.slice(0, 200));
            if (direct.includes('<?xml') || direct.includes('CrossIndustryInvoice')) {
                return new TextDecoder('utf-8').decode(slice);
            }
            try {
                const ds = new DecompressionStream('deflate');
                const inflated = await new Response(
                    new Blob([slice]).stream().pipeThrough(ds)
                ).arrayBuffer();
                const txt = new TextDecoder('utf-8').decode(inflated);
                if (txt.includes('CrossIndustryInvoice')) return txt;
            } catch (e) { /* flux non déflaté : on continue */ }
        }
        return null;
    };

    const loadFile = async (file) => {
        const name = file.name.toLowerCase();
        if (name.endsWith('.pdf')) {
            log('Lecture du PDF Factur-X : extraction du XML embarqué…');
            const xml = await extractXmlFromPdf(await file.arrayBuffer());
            if (!xml) {
                log('<span class="log-err">Aucun XML CII trouvé dans ce PDF.</span>');
                return;
            }
            el('ed-input').value = xml.trim();
            log('XML CII extrait de <strong>' + file.name + '</strong>');
        } else {
            el('ed-input').value = (await file.text()).trim();
            log('Fichier chargé : <strong>' + file.name + '</strong>');
        }
        refreshEditor();
        scheduleRun(0);
    };

    const buildReport = () => {
        if (!lastResult) return '';
        const now = new Date().toLocaleString('fr-FR');
        const lines = [
            '# Rapport de validation — Re·Form·E',
            '',
            '- Date : ' + now,
            '- Paquet de règles : ' + manifest.package + ' (' + manifest.publishedAt + ')',
            '- Profil : ' + currentPack().label,
            '- Schémas appliqués : ' + selectedSchemas().map((s) => s.file).join(', '),
            '- Assertions évaluées : ' + lastResult.stats.assertionsEvaluated,
            '- Durée : ' + lastResult.stats.durationMs + ' ms',
            '',
            '## Synthèse',
            '',
            '| Sévérité | Nombre |',
            '| --- | --- |',
            '| Erreurs | ' + lastResult.violations.filter((v) => v.severity === 'error').length + ' |',
            '| Avertissements | ' + lastResult.violations.filter((v) => v.severity === 'warning').length + ' |',
            '| Règles non évaluées | ' + lastResult.skipped.length + ' |',
            '',
            '## Détail',
            '',
        ];
        if (!lastResult.violations.length) {
            lines.push('Aucune anomalie détectée.');
        } else {
            lines.push('| Sévérité | Règle | Ligne | Chemin | Message |', '| --- | --- | --- | --- | --- |');
            lastResult.violations.forEach((v) => lines.push(
                '| ' + v.severity + ' | ' + v.id + ' | ' + v.line + ' | `' + v.path + '` | '
                + v.message.replace(/\|/g, '\\|') + ' |'));
        }
        if (lastResult.skipped.length) {
            lines.push('', '## Règles non évaluées', '');
            lastResult.skipped.forEach((s) => lines.push('- ' + (s.id || s.pattern) + ' — ' + s.reason));
        }
        return lines.join('\n');
    };

    const download = (content, filename, type) => {
        const url = URL.createObjectURL(new Blob([content], { type }));
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    /** Réindente le XML sans rien modifier au contenu. */
    const formatXml = () => {
        const text = el('ed-input').value;
        const doc = new DOMParser().parseFromString(text, 'application/xml');
        if (doc.getElementsByTagName('parsererror').length) {
            log('<span class="log-err">Formatage impossible : le XML n\'est pas bien formé.</span>');
            return;
        }
        const serialize = (node, depth) => {
            const pad = '  '.repeat(depth);
            if (node.nodeType === 3) return node.nodeValue.trim();
            if (node.nodeType === 8) return pad + '<!--' + node.nodeValue + '-->';
            const attrs = Array.from(node.attributes || [])
                .map((a) => ' ' + a.name + '="' + a.value.replace(/"/g, '&quot;') + '"').join('');
            const children = Array.from(node.childNodes)
                .filter((c) => c.nodeType !== 3 || c.nodeValue.trim());
            if (!children.length) return pad + '<' + node.nodeName + attrs + '/>';
            if (children.length === 1 && children[0].nodeType === 3) {
                return pad + '<' + node.nodeName + attrs + '>'
                    + escapeHtml(children[0].nodeValue.trim()) + '</' + node.nodeName + '>';
            }
            return pad + '<' + node.nodeName + attrs + '>\n'
                + children.map((c) => serialize(c, depth + 1)).filter(Boolean).join('\n')
                + '\n' + pad + '</' + node.nodeName + '>';
        };
        const decl = text.startsWith('<?xml') ? text.slice(0, text.indexOf('?>') + 2) + '\n' : '';
        el('ed-input').value = decl + serialize(doc.documentElement, 0);
        refreshEditor();
        scheduleRun(0);
        log('XML réindenté.');
    };

    /* ===================================================================
       INITIALISATION
       =================================================================== */

    const initEditorEvents = () => {
        const input = el('ed-input');
        input.addEventListener('input', () => { refreshEditor(); scheduleRun(); });
        input.addEventListener('scroll', syncScroll);
        input.addEventListener('keyup', updateCursorPosition);
        input.addEventListener('click', updateCursorPosition);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const s = input.selectionStart;
                input.setRangeText('  ', s, input.selectionEnd, 'end');
                refreshEditor();
                scheduleRun();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                scheduleRun(0);
            }
        });
    };

    const initToolbar = () => {
        el('pack-select').addEventListener('change', (e) => setPack(e.target.value));
        el('btn-run').addEventListener('click', () => scheduleRun(0));
        el('btn-format').addEventListener('click', formatXml);
        el('btn-clear').addEventListener('click', () => {
            el('ed-input').value = '';
            refreshEditor();
            scheduleRun(0);
        });
        el('btn-open').addEventListener('click', () => el('file-input').click());
        el('file-input').addEventListener('change', (e) => {
            if (e.target.files[0]) loadFile(e.target.files[0]);
            e.target.value = '';
        });
        el('btn-download-xml').addEventListener('click', () =>
            download(el('ed-input').value, 'facture.xml', 'application/xml'));
        el('btn-report').addEventListener('click', () => {
            if (!lastResult) return;
            download(buildReport(), 'rapport-validation.md', 'text/markdown');
        });
        el('btn-copy-report').addEventListener('click', async () => {
            if (!lastResult) return;
            await navigator.clipboard.writeText(buildReport());
            log('Rapport copié dans le presse-papiers.');
        });
        el('btn-toggle-console').addEventListener('click', () => {
            document.querySelector('.vld-workspace').classList.toggle('console-collapsed');
        });

        document.querySelectorAll('.console-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.console-tab').forEach((t) => t.classList.remove('is-active'));
                tab.classList.add('is-active');
                currentFilter = tab.dataset.filter;
                if (lastResult) renderResults(lastResult);
                else renderResults({ violations: [], skipped: [], stats: { schemas: [], durationMs: 0, assertionsEvaluated: 0, rulesFired: 0 } });
            });
        });

        const drop = document.querySelector('.vld-editor');
        ['dragover', 'dragenter'].forEach((evt) => drop.addEventListener(evt, (e) => {
            e.preventDefault();
            drop.classList.add('is-dropping');
        }));
        ['dragleave', 'drop'].forEach((evt) => drop.addEventListener(evt, (e) => {
            e.preventDefault();
            drop.classList.remove('is-dropping');
        }));
        drop.addEventListener('drop', (e) => {
            if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
        });
    };

    const init = async () => {
        initEditorEvents();
        initToolbar();
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) el('ed-input').value = saved;
        refreshEditor();
        try {
            await loadManifest();
            log('Paquet de règles chargé : <strong>' + manifest.package + '</strong>');
        } catch (e) {
            log('<span class="log-err">Chargement des schémas impossible : ' + e.message + '</span>');
            setStatus('error', 'Schémas indisponibles');
        }
    };

    return { init, jumpToLine };
})();

document.addEventListener('DOMContentLoaded', ValidatorUI.init);
