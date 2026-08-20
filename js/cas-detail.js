/**
 * CAS-DETAIL.JS — Rendu de la fiche d'un cas d'usage
 * ---------------------------------------------------
 * Sources de données :
 *   - data/cas-usage.json          → référentiel des cas (principe, steps, statuts, cas liés)
 *   - data/cas-enrichissement.json → socle de champs commun, champs spécifiques au cas,
 *                                    récit chronologique, justification des cas liés
 *
 * Le fichier d'enrichissement est optionnel : si un cas n'y figure pas encore,
 * la fiche s'affiche comme avant, sans section vide.
 */
document.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('id');
    if (!caseId) { window.location.href = './cas-usage.html'; return; }

    /** Attributs d'ouverture dans un nouvel onglet, pour ne jamais perdre la fiche en cours. */
    const NEW_TAB = 'target="_blank" rel="noopener"';

    const ACTOR_COLORS = {
        'Vendeur': '#0B2046',
        'Fournisseur': '#0B2046',
        'Acheteur': '#6366f1',
        'Client': '#6366f1',
        'PA-E': '#00A7E1',
        'PA-R': '#0ea5e9',
        'PPF': '#f59e0b',
        'CdD PPF': '#f59e0b',
        'PDP': '#00A7E1',
        'Factor': '#8b5cf6',
        'Tiers Payeur': '#10b981',
        'Tiers payeur': '#10b981',
        'Sous-traitant': '#059669',
        'Mandataire': '#8b5cf6'
    };

    const STATUS_COLORS = {
        'Déposée': '#6b7280', 'Émise': '#0ea5e9', 'Reçue': '#8b5cf6',
        'Mise à disposition': '#6366f1', 'Acceptée': '#10b981', 'Refusée': '#ef4444',
        'Encaissée': '#059669', 'Payée': '#059669', 'Rejetée': '#ef4444',
        'Litige': '#f59e0b', 'Suspendue': '#f59e0b', 'Affacturée': '#8b5cf6',
        'Paiement transmis': '#3b82f6'
    };

    const TYPE_COLORS = {
        doc: '#0b2046', flux: '#00a7e1', status: '#f59e0b',
        pay: '#10b981', reject: '#ef4444', info: '#6b7280'
    };

    const TYPE_DASH = {
        doc: '', flux: '', status: '6,4', pay: '', reject: '4,4', info: '2,4'
    };

    // =====================
    // CHARGEMENT
    // =====================
    Promise.all([
        fetch('./data/cas-usage.json').then((r) => r.json()),
        fetch('./data/cas-enrichissement.json').then((r) => (r.ok ? r.json() : null)).catch(() => null)
    ])
        .then(([data, enrich]) => {
            const cas = data.cases.find((c) => c.id === caseId);
            if (!cas) { window.location.href = './cas-usage.html'; return; }

            const caseIndex = data.cases.indexOf(cas);
            const prevCase = caseIndex > 0 ? data.cases[caseIndex - 1] : null;
            const nextCase = caseIndex < data.cases.length - 1 ? data.cases[caseIndex + 1] : null;
            const cat = data.categories[cas.category] || {};
            const actors = cas.actors || data.meta.baseActors;
            const extra = (enrich && enrich.cases && enrich.cases[caseId]) || null;
            const socle = (enrich && enrich.socle) || null;

            renderHero(cas, cat);
            renderPrinciple(cas);
            renderStory(extra);
            renderDiagram(actors, cas.steps || []);
            renderAttention(cas);
            renderFields(cas, extra, socle);
            renderStatuses(cas);
            renderRelated(cas, data, extra);
            renderNav(prevCase, nextCase);
            renderFamilies(data, cas);
            linkStoryToDiagram();
        })
        .catch((err) => {
            console.error(err);
            document.getElementById('case-principle').innerHTML =
                '<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content">Erreur de chargement.</div></div>';
        });

    // =====================
    // UTILITAIRES
    // =====================

    /** Masque une section de contenu et le lien de sommaire correspondant. */
    const hideSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'none';
        const link = document.querySelector(`#case-sidebar a[href="#${sectionId}"]`);
        if (link && link.parentElement) link.parentElement.style.display = 'none';
    };

    /** Rend un identifiant de champ : lien vers champs.html pour les BT, texte simple sinon. */
    const fieldId = (id) => {
        const btMatch = /^(BT-\d+[\w-]*)/.exec(id);
        if (btMatch) {
            return `<a href="./champs.html#field-${btMatch[1]}" class="cudet-flds-id" ${NEW_TAB}>${id}</a>`;
        }
        return `<span class="cudet-flds-id">${id}</span>`;
    };

    /** Classe CSS du badge d'obligation (sans accent ni casse). */
    const obligationClass = (obligation) => {
        const map = {
            'obligatoire': 'obligatoire',
            'conditionnel': 'conditionnel',
            'recommandé': 'recommande',
            'facultatif': 'facultatif'
        };
        return `cudet-tag cudet-tag--${map[obligation] || 'facultatif'}`;
    };

    /** Une ligne de tableau de champs. */
    const fieldRow = (f) => {
        const value = f.value || '—';
        const cond = f.cond ? `<span class="cudet-flds-cond">Condition : ${f.cond}</span>` : '';
        return '<tr>' +
            `<td>${fieldId(f.id)}</td>` +
            `<td class="cudet-flds-name">${f.name}</td>` +
            `<td><span class="cudet-tag cudet-tag--niveau">${f.level}</span></td>` +
            `<td><span class="${obligationClass(f.obligation)}">${f.obligation}</span></td>` +
            `<td class="cudet-flds-val">${value}${cond}</td>` +
            `<td class="cudet-flds-rule">${f.rule || '—'}</td>` +
            '</tr>';
    };

    /** Un tableau complet de champs. */
    const fieldTable = (fields) =>
        '<div class="cudet-flds"><table>' +
        '<thead><tr><th>Champ</th><th>Libellé</th><th>Niveau</th><th>Obligation</th><th>Valeur attendue / condition</th><th>Règle</th></tr></thead>' +
        `<tbody>${fields.map(fieldRow).join('')}</tbody>` +
        '</table></div>';

    // =====================
    // RENDERERS
    // =====================

    const renderHero = (cas, cat) => {
        document.title = `Cas ${cas.num} — ${cas.title} | Re·Form·E`;
        document.getElementById('page-title').textContent = document.title;
        document.getElementById('bc-title').textContent = `Cas ${cas.num}`;
        document.getElementById('case-badge').textContent =
            `${cat.icon} ${cat.label} — Complexité ${'●'.repeat(cas.complexity)}${'○'.repeat(3 - cas.complexity)}`;
        document.getElementById('case-title').textContent = `Cas n°${cas.num} — ${cas.title}`;
        document.getElementById('case-subtitle').textContent = cas.subtitle || '';
    };

    const renderPrinciple = (cas) => {
        let html = `<div class="cudet-principle">${cas.principle}</div>`;
        if (cas.inScope === false) {
            html += '<div class="callout callout--warning"><div class="callout-icon">🚫</div>' +
                '<div class="callout-content">Ce cas est <strong>hors du champ</strong> de la facturation électronique et du e-reporting.</div></div>';
        }
        document.getElementById('case-principle').innerHTML = html;
    };

    /** Récit chronologique « Temps 1 → Temps n » : qui fait quoi, quand, avec quels champs. */
    const renderStory = (extra) => {
        const narrative = extra && extra.narrative;
        const steps = (narrative && narrative.steps) || [];
        if (steps.length === 0) { hideSection('recit'); return; }

        const intro = narrative.intro ? `<div class="cudet-story-intro">${narrative.intro}</div>` : '';

        const items = steps.map((s) => {
            const color = ACTOR_COLORS[s.actor] || '#6b7280';
            const flux = (s.flux || []).map((fx) => `<span class="cudet-story-flux">${fx}</span>`).join('');
            const refs = (s.refs || []).map((ref) => {
                const btMatch = /^BT-\d+/.exec(ref);
                return btMatch
                    ? `<a class="bt-chip" href="./champs.html#field-${ref}" ${NEW_TAB}>${ref}</a>`
                    : `<span class="bt-chip">${ref}</span>`;
            }).join('');
            const refsHtml = refs ? `<div class="cudet-story-refs">${refs}</div>` : '';
            const diagramAttr = typeof s.diagram === 'number' ? ` data-diagram="${s.diagram}"` : '';

            return `<li class="cudet-story-step"${diagramAttr}>` +
                `<div class="cudet-story-time"><span>Temps</span><strong>${s.t}</strong></div>` +
                '<div class="cudet-story-body">' +
                `<div class="cudet-story-meta"><span class="cudet-story-actor" style="--actor-color: ${color}">${s.actor}</span>${flux}</div>` +
                `<h4>${s.title}</h4>` +
                `<p>${s.text}</p>` +
                refsHtml +
                '</div></li>';
        }).join('');

        document.getElementById('case-story').innerHTML = `${intro}<ol class="cudet-story">${items}</ol>`;
    };

    const renderAttention = (cas) => {
        const pts = cas.attentionPoints || [];
        if (pts.length === 0) { hideSection('attention'); return; }
        document.getElementById('case-attention').innerHTML = pts.map((p) =>
            `<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content">${p}</div></div>`
        ).join('');
    };

    /**
     * Champs à renseigner = champs propres au cas (delta) + socle commun repliable.
     * Le delta enrichi (cas-enrichissement.json) prend le pas sur l'ancien btFields
     * de cas-usage.json, qui reste supporté pour les cas non encore migrés.
     */
    const renderFields = (cas, extra, socle) => {
        const delta = (extra && extra.fields) || [];
        const legacy = cas.btFields || [];
        let html = '';

        if (delta.length > 0) {
            html += '<h3 class="cudet-flds-sub">Champs spécifiques à ce cas d\'usage</h3>';
            html += fieldTable(delta);
            if (extra.fieldsNote) html += `<div class="cudet-flds-note">${extra.fieldsNote}</div>`;
        } else if (legacy.length > 0) {
            html += '<h3 class="cudet-flds-sub">Champs spécifiques à ce cas d\'usage</h3>';
            html += '<div class="cudet-flds"><table>' +
                '<thead><tr><th>Champ</th><th>Libellé</th><th>Valeur / Note</th></tr></thead><tbody>' +
                legacy.map((f) =>
                    `<tr><td>${fieldId(f.bt)}</td><td class="cudet-flds-name">${f.name}</td><td>${f.note || '—'}</td></tr>`
                ).join('') +
                '</tbody></table></div>';
        }

        document.getElementById('case-bt-fields').innerHTML = html;
        renderSocle(socle);

        if (html === '' && !socle) hideSection('technique');
    };

    /** Socle obligatoire commun, affiché sur toutes les fiches en bloc repliable. */
    const renderSocle = (socle) => {
        const target = document.getElementById('case-socle');
        if (!socle || !(socle.groups || []).length) { target.innerHTML = ''; return; }

        const total = socle.groups.reduce((acc, g) => acc + (g.fields || []).length, 0);
        const groups = socle.groups.map((g) =>
            '<div class="cudet-socle-group">' +
            `<h5>${g.label}</h5>` +
            fieldTable(g.fields || []) +
            '</div>'
        ).join('');

        target.innerHTML = '<details class="cudet-socle">' +
            `<summary>🧱 ${socle.label} — ${total} champs</summary>` +
            '<div class="cudet-socle-inner">' +
            `<div class="cudet-socle-intro">${socle.intro || ''}</div>` +
            groups +
            (socle.note ? `<p class="cudet-socle-note">${socle.note}</p>` : '') +
            '</div></details>';
    };

    const renderStatuses = (cas) => {
        const statuses = cas.statuses || [];
        if (statuses.length === 0) { hideSection('statuts'); return; }
        document.getElementById('case-statuses').innerHTML =
            '<div class="cudet-statuses">' + statuses.map((s) => {
                const color = STATUS_COLORS[s] || '#6b7280';
                return `<span class="cudet-status" style="--status-color: ${color}">${s}</span>`;
            }).join('<span class="cudet-status-arrow">→</span>') + '</div>';
    };

    /** Cas liés, avec la nature du lien et son explication quand elle est documentée. */
    const renderRelated = (cas, data, extra) => {
        const related = cas.relatedCases || [];
        if (related.length === 0) { hideSection('lies'); return; }

        const why = (extra && extra.relatedWhy) || {};
        const cards = related.map((rid) => {
            const rc = data.cases.find((c) => c.id === rid);
            if (!rc) return '';
            const info = why[rid] || null;
            const badge = info && info.rel ? `<span class="cudet-lien-rel">${info.rel}</span>` : '';
            const text = info && info.why
                ? `<p class="cudet-lien-why">${info.why}</p>`
                : '<p class="cudet-lien-why">Cas connexe du même parcours.</p>';
            return `<a href="./cas-detail.html?id=${rc.id}" class="cudet-lien" ${NEW_TAB}>` +
                '<div class="cudet-lien-head">' +
                `<span class="cudet-lien-num">Cas ${rc.num}</span>` +
                `<span class="cudet-lien-title">${rc.title}</span>${badge}` +
                '</div>' + text + '</a>';
        }).join('');

        document.getElementById('case-related').innerHTML = `<div class="cudet-lien-grid">${cards}</div>`;
    };

    const renderNav = (prev, next) => {
        let navHtml = '';
        if (prev) {
            navHtml += `<a href="./cas-detail.html?id=${prev.id}" class="nav-prev">` +
                '<span class="nav-label">Cas précédent</span>' +
                `<span class="nav-title">← Cas ${prev.num} — ${prev.title}</span></a>`;
            document.getElementById('nav-prev-side').href = `./cas-detail.html?id=${prev.id}`;
            document.getElementById('nav-prev-side').textContent = `← Cas ${prev.num}`;
        }
        if (next) {
            navHtml += `<a href="./cas-detail.html?id=${next.id}" class="nav-next">` +
                '<span class="nav-label">Cas suivant</span>' +
                `<span class="nav-title">Cas ${next.num} — ${next.title} →</span></a>`;
            document.getElementById('nav-next-side').href = `./cas-detail.html?id=${next.id}`;
            document.getElementById('nav-next-side').textContent = `Cas ${next.num} →`;
        }
        document.getElementById('case-nav-bottom').innerHTML = navHtml ||
            '<a href="./cas-usage.html" class="nav-prev"><span class="nav-label">Retour</span><span class="nav-title">← Tous les cas</span></a>';
    };

    // =====================
    // NAVIGATEUR PAR FAMILLE (sidebar)
    // =====================

    /** Clé de mémorisation des familles ouvertes, d'une fiche à l'autre. */
    const FAM_STORE = 'cudet-fam-open';

    const readOpenFamilies = () => {
        try {
            const raw = sessionStorage.getItem(FAM_STORE);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    };

    const writeOpenFamilies = (keys) => {
        try { sessionStorage.setItem(FAM_STORE, JSON.stringify(keys)); } catch (e) { /* ignore */ }
    };

    /**
     * Construit l'accordéon des familles de cas d'usage : chaque famille est repliée,
     * seule celle du cas courant est dépliée. Un champ de filtre déplie automatiquement
     * les familles qui contiennent un résultat.
     */
    const renderFamilies = (data, current) => {
        const host = document.getElementById('fam-list');
        if (!host) return;

        // Taxonomie de référence : data.families (les familles A→L du hub).
        // À défaut, repli sur data.categories, puis sur toute famille orpheline.
        const byId = new Map(data.cases.map((c) => [c.id, c]));
        let families;

        if (Array.isArray(data.families) && data.families.length > 0) {
            families = data.families.map((fam) => ({
                key: fam.letter,
                badge: fam.letter,
                label: fam.short || fam.label,
                title: fam.label,
                cases: fam.cases.map((id) => byId.get(id)).filter(Boolean)
            }));
            const classed = new Set(data.families.flatMap((fam) => fam.cases));
            const orphans = data.cases.filter((c) => !classed.has(c.id));
            if (orphans.length > 0) {
                families.push({ key: 'ZZ', badge: '·', label: 'Autres cas', title: 'Autres cas', cases: orphans });
            }
        } else {
            const order = Object.keys(data.categories || {});
            data.cases.forEach((c) => { if (!order.includes(c.category)) order.push(c.category); });
            families = order.map((key) => {
                const cat = (data.categories || {})[key] || {};
                return {
                    key,
                    badge: '',
                    label: cat.label || key,
                    title: cat.label || key,
                    cases: data.cases.filter((c) => c.category === key)
                };
            });
        }

        const opened = readOpenFamilies();
        const groups = families.map((fam) => {
            const cases = fam.cases;
            if (cases.length === 0) return '';

            const hasCurrent = cases.some((c) => c.id === current.id);
            const isOpen = opened ? opened.includes(fam.key) : hasCurrent;

            const items = cases.map((c) => {
                const num = c.num ? `Cas ${c.num}` : 'Variante';
                const cls = c.id === current.id ? 'cudet-fam-item is-current' : 'cudet-fam-item';
                const search = `${c.num || ''} ${c.title} ${c.subtitle || ''} ${(c.tags || []).join(' ')}`
                    .toLowerCase().replace(/"/g, '');
                const aria = c.id === current.id ? ' aria-current="page"' : '';
                return `<a href="./cas-detail.html?id=${c.id}" class="${cls}" data-search="${search}"${aria} ` +
                    `title="${c.title.replace(/"/g, '')}"><strong>${num}</strong>${c.title}</a>`;
            }).join('');

            const classes = ['cudet-fam-group'];
            if (isOpen) classes.push('is-open');
            if (hasCurrent) classes.push('has-current');
            const badge = fam.badge ? `<span class="cudet-fam-letter">${fam.badge}</span>` : '';

            return `<div class="${classes.join(' ')}" data-cat="${fam.key}">` +
                `<button type="button" class="cudet-fam-toggle" aria-expanded="${isOpen}" ` +
                `title="${fam.title.replace(/"/g, '')}">${badge}` +
                `<span class="cudet-fam-label">${fam.label}</span>` +
                `<span class="cudet-fam-count">${cases.length}</span>` +
                '<span class="cudet-fam-chevron">&#9656;</span></button>' +
                `<div class="cudet-fam-body">${items}</div></div>`;
        }).join('');

        host.innerHTML = groups + '<div class="cudet-fam-empty is-hidden" id="fam-empty">Aucun cas ne correspond.</div>';

        const total = document.getElementById('fam-total');
        if (total) total.textContent = `${data.cases.length}`;

        // Déploiement / repliement d'une famille.
        host.querySelectorAll('.cudet-fam-toggle').forEach((btn) => {
            btn.addEventListener('click', () => {
                const group = btn.closest('.cudet-fam-group');
                const isOpen = group.classList.toggle('is-open');
                btn.setAttribute('aria-expanded', String(isOpen));
                writeOpenFamilies(
                    Array.from(host.querySelectorAll('.cudet-fam-group.is-open')).map((g) => g.dataset.cat)
                );
            });
        });

        bindFamilyFilter(host);
    };

    /** Filtre transversal : masque les cas et les familles sans correspondance. */
    const bindFamilyFilter = (host) => {
        const input = document.getElementById('fam-filter');
        if (!input) return;

        const empty = document.getElementById('fam-empty');
        const groups = Array.from(host.querySelectorAll('.cudet-fam-group'));

        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            let found = 0;

            groups.forEach((group) => {
                const items = Array.from(group.querySelectorAll('.cudet-fam-item'));
                let matches = 0;

                items.forEach((item) => {
                    const hit = q === '' || item.dataset.search.includes(q);
                    item.classList.toggle('is-hidden', !hit);
                    if (hit) matches += 1;
                });

                group.classList.toggle('is-hidden', matches === 0);
                found += matches;

                if (q === '') {
                    const hasCurrent = group.classList.contains('has-current');
                    group.classList.toggle('is-open', hasCurrent);
                    group.querySelector('.cudet-fam-toggle').setAttribute('aria-expanded', String(hasCurrent));
                } else {
                    group.classList.add('is-open');
                    group.querySelector('.cudet-fam-toggle').setAttribute('aria-expanded', 'true');
                }
            });

            if (empty) empty.classList.toggle('is-hidden', found > 0);
        });

        // Échap vide le filtre.
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                input.value = '';
                input.dispatchEvent(new Event('input'));
            }
        });
    };

    /** Survol d'une étape du récit → mise en évidence de l'étape correspondante du diagramme. */
    const linkStoryToDiagram = () => {
        const svg = document.querySelector('#diagram-wrap .cudet-svg');
        if (!svg) return;

        document.querySelectorAll('.cudet-story-step[data-diagram]').forEach((li) => {
            const target = svg.querySelector(`.cudet-step[data-step="${li.dataset.diagram}"]`);
            if (!target) return;
            li.addEventListener('mouseenter', () => {
                svg.classList.add('cudet-svg--focus');
                target.classList.add('cudet-step--hl');
            });
            li.addEventListener('mouseleave', () => {
                svg.classList.remove('cudet-svg--focus');
                target.classList.remove('cudet-step--hl');
            });
        });
    };

    // =====================
    // DIAGRAMME DE SÉQUENCE SVG (+ plein écran)
    // =====================
    function renderDiagram(actors, steps) {
        const wrap = document.getElementById('diagram-wrap');
        if (!steps || steps.length === 0) {
            wrap.innerHTML = '<div class="callout callout--info"><div class="callout-icon">ℹ️</div><div class="callout-content">Ce cas ne comporte pas de diagramme de séquence spécifique. Il suit le flux nominal standard.</div></div>';
            return;
        }

        const n = actors.length;
        const pad = 60;
        const colW = (940 - pad * 2) / (n - 1);
        const headerH = 70;
        const stepH = 56;
        const totalH = headerH + steps.length * stepH + 40;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${totalH}" class="cudet-svg">`;
        svg += `<rect width="960" height="${totalH}" rx="16" fill="#fafbfc" stroke="#e5e7eb" stroke-width="1"/>`;

        actors.forEach((actor, i) => {
            const x = pad + i * colW;
            svg += `<line x1="${x}" y1="${headerH + 5}" x2="${x}" y2="${totalH - 20}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>`;
            const boxW = Math.min(colW - 10, 120);
            svg += `<rect x="${x - boxW / 2}" y="12" width="${boxW}" height="40" rx="10" fill="#0b2046"/>`;
            svg += `<text x="${x}" y="38" text-anchor="middle" fill="white" font-size="11" font-weight="700" font-family="Inter, sans-serif">${actor}</text>`;
        });

        steps.forEach((step, i) => {
            const y = headerH + 15 + i * stepH;
            const x1 = pad + step.f * colW;
            const x2 = pad + step.t * colW;
            const color = TYPE_COLORS[step.c] || '#6b7280';
            const dash = TYPE_DASH[step.c] || '';
            const dir = x2 > x1 ? 1 : -1;
            const arrowX = x2 - dir * 8;

            svg += `<g class="cudet-step" data-step="${i}">`;
            svg += `<line x1="${x1}" y1="${y}" x2="${arrowX}" y2="${y}" stroke="${color}" stroke-width="2.5" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
            svg += `<polygon points="${x2},${y} ${x2 - dir * 10},${y - 5} ${x2 - dir * 10},${y + 5}" fill="${color}"/>`;

            const circleX = (x1 + x2) / 2;
            svg += `<circle cx="${circleX}" cy="${y}" r="12" fill="white" stroke="${color}" stroke-width="2"/>`;
            svg += `<text x="${circleX}" y="${y + 4}" text-anchor="middle" fill="${color}" font-size="10" font-weight="800" font-family="Inter, sans-serif">${i + 1}</text>`;
            svg += `<text x="${circleX}" y="${y - 16}" text-anchor="middle" fill="#374151" font-size="10" font-weight="600" font-family="Inter, sans-serif">${step.l}</text>`;
            svg += '</g>';
        });

        svg += '</svg>';
        wrap.innerHTML = svg;

        // ═══ PLEIN ÉCRAN ═══
        const expandBtn = document.createElement('button');
        expandBtn.className = 'cudet-expand-btn';
        expandBtn.innerHTML = '⛶ Plein écran';
        expandBtn.title = 'Voir en plein écran';
        wrap.style.position = 'relative';
        wrap.appendChild(expandBtn);

        expandBtn.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.className = 'cudet-fullscreen-overlay';

            const header = document.createElement('div');
            header.className = 'cudet-fs-header';
            header.innerHTML = '<span>📐 Diagramme de séquence</span><button class="cudet-fs-close">✕ Fermer</button>';
            overlay.appendChild(header);

            const svgContainer = document.createElement('div');
            svgContainer.className = 'cudet-fs-svg';
            svgContainer.innerHTML = svg;
            overlay.appendChild(svgContainer);

            const legend = document.createElement('div');
            legend.className = 'cudet-fs-legend';
            legend.innerHTML =
                '<span class="cudet-leg cudet-leg--doc">📄 Document</span>' +
                '<span class="cudet-leg cudet-leg--flux">📡 Flux</span>' +
                '<span class="cudet-leg cudet-leg--status">🔄 Statut</span>' +
                '<span class="cudet-leg cudet-leg--pay">💰 Paiement</span>' +
                '<span class="cudet-leg cudet-leg--reject">❌ Rejet</span>';
            overlay.appendChild(legend);

            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';

            requestAnimationFrame(() => overlay.classList.add('cudet-fs-active'));

            const closeFs = () => {
                overlay.classList.remove('cudet-fs-active');
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    document.body.style.overflow = '';
                }, 300);
            };

            overlay.querySelector('.cudet-fs-close').addEventListener('click', closeFs);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeFs(); });
            document.addEventListener('keydown', function handler(e) {
                if (e.key === 'Escape') { closeFs(); document.removeEventListener('keydown', handler); }
            });
        });
    }
});
