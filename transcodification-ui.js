/**
 * TRANSCODIFICATION-UI.JS — Re·Form·E
 * Outil de préparation d'une matrice de transcodification.
 *
 * L'utilisateur sélectionne les cas d'usage applicables à une entreprise,
 * l'outil produit un classeur Excel (.xlsx) contenant :
 *   - un onglet « socle » des champs obligatoires de toute facture ;
 *   - un onglet récapitulatif des cas retenus ;
 *   - un onglet par cas d'usage, avec ses champs supplémentaires.
 *
 * Les deux dernières colonnes de chaque onglet sont laissées vierges :
 * elles sont destinées au mapping ERP / balise XML côté client.
 *
 * Données : data/transcodification.json (source unique).
 * Dépendances : JSZip (CDN) + js/xlsx-writer.js
 */
const TranscoTool = {

    data: null,
    selected: new Set(),

    async init() {
        const list = document.getElementById('transco-list');
        try {
            const res = await fetch('./data/transcodification.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.data = await res.json();
        } catch (err) {
            if (list) {
                list.innerHTML = `<p class="transco-error">Impossible de charger le référentiel des cas d'usage (${err.message}).</p>`;
            }
            return;
        }
        this.renderMeta();
        this.renderList();
        this.bindEvents();
        this.updateSummary();
    },

    renderMeta() {
        const socleCount = document.getElementById('transco-socle-count');
        const casCount = document.getElementById('transco-cas-count');
        const fieldCount = document.getElementById('transco-field-count');
        const version = document.getElementById('transco-version');
        if (socleCount) socleCount.textContent = this.data.socle.champs.length;
        if (casCount) casCount.textContent = this.data.cas.length;
        if (fieldCount) {
            fieldCount.textContent = this.data.cas.reduce((sum, c) => sum + c.champs.length, 0);
        }
        if (version) {
            version.textContent = `Référentiel v${this.data.meta.version} — mis à jour le ${this.data.meta.dateMiseAJour}`;
        }
    },

    renderList() {
        const list = document.getElementById('transco-list');
        if (!list) return;

        const groups = this.data.meta.categories.map(categorie => ({
            categorie,
            cas: this.data.cas.filter(c => c.categorie === categorie)
        })).filter(group => group.cas.length > 0);

        list.innerHTML = groups.map(group => `
            <div class="transco-group" data-categorie="${this.escapeAttr(group.categorie)}">
                <div class="transco-group-head">
                    <h3>${this.escapeHtml(group.categorie)}</h3>
                    <button type="button" class="transco-link-btn" data-group-toggle="${this.escapeAttr(group.categorie)}">Tout sélectionner</button>
                </div>
                <div class="transco-cards">
                    ${group.cas.map(c => this.renderCard(c)).join('')}
                </div>
            </div>`).join('');
    },

    renderCard(cas) {
        return `
            <label class="transco-card" for="cas-${this.escapeAttr(cas.id)}">
                <input type="checkbox" id="cas-${this.escapeAttr(cas.id)}" value="${this.escapeAttr(cas.id)}" data-cas>
                <span class="transco-card-body">
                    <span class="transco-card-head">
                        <span class="transco-card-badge">${this.escapeHtml(cas.code)}</span>
                        <span class="transco-card-count">${cas.champs.length} champ${cas.champs.length > 1 ? 's' : ''}</span>
                    </span>
                    <span class="transco-card-title">${this.escapeHtml(cas.titre)}</span>
                    <span class="transco-card-desc">${this.escapeHtml(cas.objectif)}</span>
                    <span class="transco-card-ref">${this.escapeHtml(cas.refNorme)}</span>
                </span>
            </label>`;
    },

    bindEvents() {
        const list = document.getElementById('transco-list');
        if (list) {
            list.addEventListener('change', event => {
                const input = event.target.closest('input[data-cas]');
                if (!input) return;
                if (input.checked) this.selected.add(input.value);
                else this.selected.delete(input.value);
                this.updateSummary();
            });
            list.addEventListener('click', event => {
                const btn = event.target.closest('[data-group-toggle]');
                if (!btn) return;
                event.preventDefault();
                const categorie = btn.getAttribute('data-group-toggle');
                const inputs = [...list.querySelectorAll(`.transco-group[data-categorie="${CSS.escape(categorie)}"] input[data-cas]`)];
                const shouldCheck = inputs.some(i => !i.checked);
                inputs.forEach(i => {
                    i.checked = shouldCheck;
                    if (shouldCheck) this.selected.add(i.value);
                    else this.selected.delete(i.value);
                });
                btn.textContent = shouldCheck ? 'Tout désélectionner' : 'Tout sélectionner';
                this.updateSummary();
            });
        }

        const selectAll = document.getElementById('btn-select-all');
        const selectNone = document.getElementById('btn-select-none');
        const generate = document.getElementById('btn-transco-generate');
        const generateAll = document.getElementById('btn-transco-generate-all');

        if (selectAll) selectAll.addEventListener('click', () => this.setAll(true));
        if (selectNone) selectNone.addEventListener('click', () => this.setAll(false));
        if (generate) generate.addEventListener('click', () => this.generate(false));
        if (generateAll) generateAll.addEventListener('click', () => this.generate(true));
    },

    setAll(checked) {
        document.querySelectorAll('input[data-cas]').forEach(input => {
            input.checked = checked;
            if (checked) this.selected.add(input.value);
            else this.selected.delete(input.value);
        });
        document.querySelectorAll('[data-group-toggle]').forEach(btn => {
            btn.textContent = checked ? 'Tout désélectionner' : 'Tout sélectionner';
        });
        this.updateSummary();
    },

    selectedCas() {
        return this.sortCas(this.data.cas.filter(c => this.selected.has(c.id)));
    },

    /** Ordonne les cas par numéro croissant (1, 2, 19a, 19b, 20…). */
    sortCas(cas) {
        return [...cas].sort((a, b) => {
            const na = parseInt(a.id, 10);
            const nb = parseInt(b.id, 10);
            return na === nb ? a.id.localeCompare(b.id) : na - nb;
        });
    },

    updateSummary() {
        const cas = this.selectedCas();
        const extra = cas.reduce((sum, c) => sum + c.champs.length, 0);
        const total = this.data.socle.champs.length + extra;

        const casEl = document.getElementById('summary-cas');
        const champsEl = document.getElementById('summary-champs');
        const ongletsEl = document.getElementById('summary-onglets');
        const btn = document.getElementById('btn-transco-generate');

        if (casEl) casEl.textContent = cas.length;
        if (champsEl) champsEl.textContent = total;
        if (ongletsEl) ongletsEl.textContent = cas.length + 2;
        if (btn) btn.disabled = cas.length === 0;

        const hint = document.getElementById('summary-hint');
        if (hint) {
            hint.textContent = cas.length === 0
                ? 'Sélectionnez au moins un cas d’usage, ou générez directement la matrice complète.'
                : `Le classeur contiendra le socle obligatoire (${this.data.socle.champs.length} champs) plus ${extra} champ${extra > 1 ? 's' : ''} spécifique${extra > 1 ? 's' : ''}.`;
        }
    },

    context() {
        const value = id => (document.getElementById(id)?.value || '').trim();
        return {
            client: value('transco-client'),
            projet: value('transco-projet'),
            consultant: value('transco-consultant').toUpperCase()
        };
    },

    contextLine(ctx) {
        const parts = [];
        if (ctx.client) parts.push(`Client : ${ctx.client}`);
        if (ctx.projet) parts.push(`Projet : ${ctx.projet}`);
        if (ctx.consultant) parts.push(`Consultant : ${ctx.consultant}`);
        parts.push(`Généré le ${new Date().toLocaleDateString('fr-FR')}`);
        return parts.join('  ·  ');
    },

    /** En-tête de tableau commun à tous les onglets. */
    headerRow(secondLabel) {
        const S = XlsxWriter.STYLE;
        const [ref, , erp, xml] = this.data.meta.colonnes;
        return [
            { v: ref, s: S.HEADER },
            { v: secondLabel, s: S.HEADER },
            { v: erp, s: S.HEADER },
            { v: xml, s: S.HEADER }
        ];
    },

    fieldRows(champs) {
        const S = XlsxWriter.STYLE;
        return champs.map(champ => ([
            { v: champ.ref, s: S.REF },
            { v: champ.label, s: S.TEXT },
            { v: '', s: S.INPUT },
            { v: '', s: S.INPUT }
        ]));
    },

    buildSocleSheet(ctx) {
        const S = XlsxWriter.STYLE;
        const socle = this.data.socle;
        return {
            name: '00 - Champs obligatoires',
            cols: [26, 74, 34, 40],
            freeze: 7,
            rows: [
                [{ v: socle.titre, s: S.TITLE }],
                [{ v: socle.referentiel, s: S.SUBTITLE }],
                [{ v: socle.definition, s: S.PARAGRAPH }],
                [{ v: this.contextLine(ctx), s: S.BADGE }],
                [],
                [{ v: 'Ces champs sont requis pour toute facture, indépendamment des cas d’usage retenus.', s: S.PARAGRAPH }],
                this.headerRow('Données obligatoires à inclure :'),
                ...this.fieldRows(socle.champs)
            ]
        };
    },

    buildIndexSheet(cas, ctx) {
        const S = XlsxWriter.STYLE;
        return {
            name: '01 - Liste de vos cas d’usage',
            cols: [14, 62, 44, 16],
            freeze: 6,
            rows: [
                [{ v: 'Cas d’usage retenus — Flux 1', s: S.TITLE }],
                [{ v: this.data.meta.source, s: S.SUBTITLE }],
                [{ v: this.contextLine(ctx), s: S.BADGE }],
                [],
                [{ v: `${cas.length} cas d’usage retenu${cas.length > 1 ? 's' : ''} — cliquez sur un intitulé pour ouvrir l’onglet correspondant.`, s: S.PARAGRAPH }],
                [
                    { v: 'N°', s: S.HEADER },
                    { v: 'Cas d’usage', s: S.HEADER },
                    { v: 'Catégorie', s: S.HEADER },
                    { v: 'Champs', s: S.HEADER }
                ],
                ...cas.map(c => ([
                    { v: c.code, s: S.REF },
                    { v: c.titre, s: S.TEXT },
                    { v: c.categorie, s: S.TEXT },
                    { v: String(c.champs.length), s: S.TEXT }
                ]))
            ]
        };
    },

    buildCasSheet(cas) {
        const S = XlsxWriter.STYLE;
        return {
            name: `${cas.code} - ${cas.titre}`,
            cols: [26, 74, 34, 40],
            freeze: 7,
            rows: [
                [
                    { v: `${cas.code} – ${cas.titre}`, s: S.TITLE },
                    null,
                    null,
                    { v: '← Retour au sommaire', s: S.LINK }
                ],
                [{ v: cas.refNorme, s: S.SUBTITLE }],
                [{ v: `Objectif : ${cas.objectif}`, s: S.PARAGRAPH }],
                [{ v: `Définition du cas d’usage : ${cas.definition}`, s: S.PARAGRAPH }],
                [],
                [{ v: 'Ces champs s’ajoutent au socle de l’onglet « 00 - Champs obligatoires ».', s: S.PARAGRAPH }],
                this.headerRow('Données supplémentaires à inclure :'),
                ...this.fieldRows(cas.champs)
            ]
        };
    },

    /**
     * Fige les noms d'onglets définitifs puis pose les hyperliens internes :
     * sommaire → onglet du cas, et onglet du cas → sommaire.
     * Les noms doivent être figés avant, car Excel exige la cible exacte
     * (nettoyée et tronquée à 31 caractères).
     */
    applyNavigation(sheets, casCount) {
        const S = XlsxWriter.STYLE;
        const used = new Set();
        sheets.forEach(sheet => { sheet.name = XlsxWriter.sheetName(sheet.name, used); });

        const index = sheets[1];
        const casSheets = sheets.slice(2);
        const firstDataRow = index.rows.length - casCount + 1;

        index.hyperlinks = casSheets.map((sheet, i) => {
            const excelRow = firstDataRow + i;
            const cell = index.rows[excelRow - 1][1];
            if (cell) cell.s = S.LINK;
            return {
                ref: `B${excelRow}`,
                location: XlsxWriter.location(sheet.name),
                display: sheet.name
            };
        });

        casSheets.forEach(sheet => {
            sheet.hyperlinks = [{
                ref: 'D1',
                location: XlsxWriter.location(index.name),
                display: index.name
            }];
        });

        return sheets;
    },

    filename(ctx, complete) {
        const slug = value => value
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Za-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40);
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const parts = ['Transcodification'];
        if (ctx.client) parts.push(slug(ctx.client));
        if (complete) parts.push('complet');
        parts.push(date);
        return `${parts.filter(Boolean).join('_')}.xlsx`;
    },

    async generate(complete) {
        const status = document.getElementById('transco-status');
        const cas = complete ? this.sortCas(this.data.cas) : this.selectedCas();
        if (cas.length === 0) {
            if (status) {
                status.className = 'transco-status transco-status--error';
                status.textContent = 'Sélectionnez au moins un cas d’usage avant de générer le classeur.';
            }
            return;
        }

        const ctx = this.context();
        const sheets = this.applyNavigation([
            this.buildSocleSheet(ctx),
            this.buildIndexSheet(cas, ctx),
            ...cas.map(c => this.buildCasSheet(c))
        ], cas.length);

        if (status) {
            status.className = 'transco-status';
            status.textContent = 'Génération du classeur…';
        }

        try {
            const name = this.filename(ctx, complete);
            await XlsxWriter.download(sheets, name);
            if (status) {
                status.className = 'transco-status transco-status--ok';
                status.textContent = `✅ ${name} — ${sheets.length} onglets (socle + récapitulatif + ${cas.length} cas).`;
            }
        } catch (err) {
            if (status) {
                status.className = 'transco-status transco-status--error';
                status.textContent = `Échec de la génération : ${err.message}`;
            }
        }
    },

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    escapeAttr(value) {
        return this.escapeHtml(value).replace(/"/g, '&quot;');
    }
};

document.addEventListener('DOMContentLoaded', () => TranscoTool.init());
