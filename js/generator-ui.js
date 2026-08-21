/**
 * GENERATOR-UI.JS v5 — La Fabrique de factures électroniques
 * Auteur: Bruno BARTOLI — Fluxym / Re·Form·E
 * Date: 2026-08-21
 *
 * Changelog v5a — les packs ZIP gardent le choix de la syntaxe :
 *   - Pour un cas à pack imposé (avoir de litige, rectificative, pack B),
 *     l'étage A reste affiché et l'utilisateur choisit UBL ou CII ; les étages
 *     B et C sont masqués, faute de prise sur un pack multi-documents.
 *   - Le Factur-X y reste désactivé : composer chaque document d'un pack est un
 *     chantier d'architecture, pas une case à cocher.
 *
 * Changelog v5 — composition hiérarchique de la facture :
 *   - L'étape 3 n'est plus une liste plate de livrables mais trois étages
 *     ordonnés : A le format de la facture (choix exclusif), B ce qui est
 *     embarqué dans le fichier de facture, C les PDF autonomes à côté.
 *   - Le format se choisit AVANT le contenu : on ne compose pas une pièce
 *     jointe sans savoir dans quoi elle voyage.
 *   - Factur-X : la représentation lisible est cochée et verrouillée, elle est
 *     inhérente au format (le PDF/A-3B EST le lisible).
 *   - Embarquer un bon de commande ou de livraison dans la facture et le
 *     récupérer en PDF autonome sont deux décisions séparées, dans deux étages
 *     distincts. L'étage C est décoché par défaut, toujours.
 *   - Les formules de départ (facture / lisible / pack complet) sont retirées :
 *     la hiérarchie des trois étages rend le raccourci inutile et ambigu.
 *   - Récapitulatif live : nom de fichier calculé par UBLGenerator.composeSuffix,
 *     donc strictement identique à ce qui sera téléchargé.
 *   - L'intention de l'utilisateur est mémorisée : changer de cas d'usage grise
 *     ce qui n'est pas produisible sans effacer les choix faits.
 */

window.CUSTOM_SUPPLIER = null;
window.CUSTOM_BUYER = null;
window.CUSTOM_THIRDPARTY = null;
window.COMPANY_MODE = 'default';

// Cas avec un tiers (PayeeParty)
const CASES_WITH_THIRDPARTY = ['5', '7', '8', '9', '10'];

// =====================================================
// TEMPLATE JSON VIERGE
// =====================================================
const BLANK_TEMPLATE = JSON.stringify({
    name: '',
    legalName: '',
    siren: '',
    nic: '',
    vatNumber: '',
    address: { street: '', city: '', zip: '', country: 'FR' }
}, null, 2);

// =====================================================
// VALIDATION JSON — NIC optionnel
// =====================================================
const REQUIRED_FIELDS = ['name', 'legalName', 'siren', 'vatNumber'];
const REQUIRED_ADDR = ['street', 'city', 'zip', 'country'];

const validateCompanyJSON = (data) => {
    const errors = [];
    const warnings = [];

    if (typeof data !== 'object' || data === null) {
        return { valid: false, errors: ["Le fichier n'est pas un objet JSON valide."], warnings: [] };
    }

    REQUIRED_FIELDS.forEach((f) => {
        if (!data[f] || String(data[f]).trim() === '') {
            errors.push(`Champ '${f}' manquant ou vide.`);
        }
    });

    if (!data.address || typeof data.address !== 'object') {
        errors.push("Bloc 'address' manquant.");
    } else {
        REQUIRED_ADDR.forEach((f) => {
            if (!data.address[f] || String(data.address[f]).trim() === '') {
                errors.push(`Champ 'address.${f}' manquant ou vide.`);
            }
        });
    }

    if (data.siren && !/^\d{9}$/.test(String(data.siren).trim())) {
        errors.push('Le SIREN doit contenir exactement 9 chiffres.');
    }

    if (data.nic && String(data.nic).trim() !== '') {
        if (!/^\d{5}$/.test(String(data.nic).trim())) {
            errors.push('Le NIC doit contenir exactement 5 chiffres.');
        }
    } else {
        warnings.push('NIC non renseigné — la valeur 00001 sera utilisée.');
    }

    if (data.vatNumber && !/^FR\d{2}\d{9}$/.test(String(data.vatNumber).trim())) {
        errors.push('Le n° TVA doit être au format FR + 2 chiffres + SIREN.');
    }

    return { valid: errors.length === 0, errors, warnings };
};

// Validation simplifiée pour le tiers (name + siren seulement)
const validateThirdPartyJSON = (data) => {
    const errors = [];
    const warnings = [];

    if (typeof data !== 'object' || data === null) {
        return { valid: false, errors: ["Le fichier n'est pas un objet JSON valide."], warnings: [] };
    }
    if (!data.name || String(data.name).trim() === '') {
        errors.push("Champ 'name' manquant ou vide.");
    }
    if (!data.siren || String(data.siren).trim() === '') {
        errors.push("Champ 'siren' manquant ou vide.");
    } else if (!/^\d{9}$/.test(String(data.siren).trim())) {
        errors.push('Le SIREN doit contenir exactement 9 chiffres.');
    }
    if (data.nic && String(data.nic).trim() !== '') {
        if (!/^\d{5}$/.test(String(data.nic).trim())) {
            errors.push('Le NIC doit contenir exactement 5 chiffres.');
        }
    } else {
        warnings.push('NIC non renseigné — 00001 par défaut.');
    }
    return { valid: errors.length === 0, errors, warnings };
};

// =====================================================
// PREVIEW
// =====================================================
const renderPreview = (data, warnings) => {
    const nic = (data.nic && String(data.nic).trim() !== '') ? data.nic : null;
    const siret = data.siren + (nic || '00001');
    const nicDisplay = nic
        ? `NIC ${nic}`
        : '<span class="company-warn">NIC absent — 00001 par défaut</span>';

    let html = '<div class="gen-preview-body">' +
        `<span class="company-name">${data.name}</span> — ` +
        `<span class="company-siren">${data.legalName}</span><br>` +
        `<span class="company-siren">SIRET : <strong>${siret}</strong> (SIREN ${data.siren} + ${nicDisplay})</span><br>` +
        `<span class="company-addr">${data.address.street}, ${data.address.zip} ${data.address.city} (${data.address.country})</span><br>` +
        `<span class="company-siren">TVA : ${data.vatNumber}</span>`;

    if (warnings && warnings.length > 0) {
        html += `<br><span class="company-warn">${warnings.join(' | ')}</span>`;
    }
    return `${html}</div>`;
};

// Preview simplifié pour le tiers
const renderThirdPartyPreview = (data, warnings) => {
    const nic = (data.nic && String(data.nic).trim() !== '') ? data.nic : null;
    const siret = data.siren + (nic || '00001');
    const nicDisplay = nic
        ? `NIC ${nic}`
        : '<span class="company-warn">NIC absent — 00001 par défaut</span>';

    let html = '<div class="gen-preview-body">' +
        `<span class="company-name">${data.name}</span><br>` +
        `<span class="company-siren">SIRET : <strong>${siret}</strong> (SIREN ${data.siren} + ${nicDisplay})</span>`;

    if (warnings && warnings.length > 0) {
        html += `<br><span class="company-warn">${warnings.join(' | ')}</span>`;
    }
    return `${html}</div>`;
};

// =====================================================
// CATALOGUE DE COMPOSITION
// =====================================================
// Étage A — le format de la facture. Choix exclusif : une facture s'écrit
// dans une syntaxe, pas dans trois. `needsPdf` marque les formats qui
// reposent sur la représentation lisible et ne sont donc proposés que pour
// les cas d'usage où sa cohérence avec les données structurées a été
// vérifiée (UBLGenerator.PDF_CASES).
const FORMATS = [
    { id: 'fmt-ubl',     value: 'ubl',     label: 'Facture UBL 2.1',  needsPdf: false },
    { id: 'fmt-cii',     value: 'cii',     label: 'Facture CII D22B', needsPdf: false },
    { id: 'fmt-facturx', value: 'facturx', label: 'Factur-X',         needsPdf: true }
];

// Étages B et C — les pièces. Une même pièce peut être embarquée dans le
// fichier de facture (étage B), livrée en PDF autonome (étage C), les deux,
// ou ni l'une ni l'autre. Toutes reposent sur le modèle pivot du lisible.
const PIECES = [
    { key: 'lisible',  embedId: 'embed-lisible',  sideId: 'side-lisible',
      embedLabel: 'Représentation lisible embarquée', sideLabel: 'PDF lisible autonome' },
    { key: 'order',    embedId: 'embed-order',    sideId: 'side-order',
      embedLabel: 'Bon de commande embarqué', sideLabel: 'Bon de commande en PDF' },
    { key: 'despatch', embedId: 'embed-despatch', sideId: 'side-despatch',
      embedLabel: 'Bon de livraison embarqué', sideLabel: 'Bon de livraison en PDF' }
];

// Cas a pack ZIP pour lesquels chaque document du pack dispose d'une
// representation lisible verifiee, et qui peuvent donc etre produits en
// Factur-X. Le pack B en fait partie : sa facture comme son avoir sont
// construits sur les memes lignes declaratives.
const ZIP_PDF_CASES = ['nominal-litige-avoir', 'nominal-litige-rectificative', 'B'];

const FORMAT_LABELS = { ubl: 'Facture UBL 2.1', cii: 'Facture CII D22B', facturx: 'Factur-X (PDF/A-3B)' };

// =====================================================
// GENERATOR UI
// =====================================================
const GeneratorUI = {

    // Intention de l'utilisateur, indépendante de la disponibilité du cas en
    // cours : on ne perd pas un choix en passant par un cas qui ne sait pas
    // produire de représentation lisible. Par défaut : une facture UBL nue,
    // et rien d'autre.
    state: {
        format: 'ubl',
        embed: { lisible: false, order: false, despatch: false },
        side:  { lisible: false, order: false, despatch: false }
    },

    categories: [
        { key: 'catA', label: 'A — Cas standards', cases: ['nominal', 'nominal-rejet-emission', 'nominal-non-transmise', 'nominal-rejet-reception', 'nominal-refus', 'nominal-litige-avoir', 'nominal-litige-rectificative', '1', '31'] },
        { key: 'catB', label: 'B — Paiements, frais & tiers payeurs', cases: ['2', '5', '3', '4', '7'] },
        { key: 'catC', label: 'C — Affacturage & tiers bénéficiaires', cases: ['8', '9', '10'] },
        { key: 'catD', label: 'D — Intermédiaires & mandataires', cases: ['11', '12', '15', '16'] },
        { key: 'catE', label: 'E — Sous-traitance & co-traitance', cases: ['13', '14'] },
        { key: 'catF', label: 'F — Auto-facturation & mandat', cases: ['17a', '17b', '19a', '19b'] },
        { key: 'catG', label: 'G — Factures complémentaires & rectificatives', cases: ['18'] },
        { key: 'catH', label: 'H — Acomptes & factures de solde', cases: ['20', '21', '32'] },
        { key: 'catI', label: 'I — Escompte', cases: ['22a', '22b'] },
        { key: 'catJ', label: 'J — Cas spéciaux', cases: ['23', '6', '28', '30', '25', '26', '42'] },
        { key: 'catK', label: 'K — Cas avancés & régimes spéciaux', cases: ['33', '34', '35', '36', '37', '38', '39', '40', '41'] },
        { key: 'catL', label: 'L — Régimes de TVA transverses', cases: ['T1', 'T2', 'T4', 'T6', 'T7', 'T8'] },
        { key: 'tests', label: 'Tests de robustesse', cases: ['A'] },
        { key: 'packs', label: 'Packs de test (ZIP)', cases: ['B'] },
        // Conservés pour leur valeur pédagogique, mais aucune facture n'est produite.
        { key: 'noinvoice', label: 'Hors périmètre e-invoicing — aucune facture', cases: ['24', '27', '29'] }
    ],

    populateSelects() {
        const data = window.APP_DATA;
        const usecaseSelect = document.getElementById('usecase');
        usecaseSelect.innerHTML = '';
        const alreadyAdded = {};

        this.categories.forEach((cat) => {
            const group = document.createElement('optgroup');
            group.label = cat.label;
            cat.cases.forEach((key) => {
                if (data.pedagogy[key] && !alreadyAdded[key]) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = data.pedagogy[key].label;
                    group.appendChild(option);
                    alreadyAdded[key] = true;
                }
            });
            if (group.children.length > 0) usecaseSelect.appendChild(group);
        });

        const settingsContainer = document.getElementById('companies-settings');
        settingsContainer.innerHTML =
            '<div class="gen-field">' +
                '<label for="adv-supplier">Fournisseur (émetteur)</label>' +
                '<select id="adv-supplier">' +
                    data.companies.suppliers.map((s) => `<option value="${s.id}">${s.name} (${s.siren})</option>`).join('') +
                '</select>' +
            '</div>' +
            '<div class="gen-field">' +
                '<label for="adv-buyer">Acheteur (récepteur)</label>' +
                '<select id="adv-buyer">' +
                    data.companies.buyers.map((b) => {
                        const siret = b.siren + (b.nic || '00001');
                        return `<option value="${b.id}">${b.name} (SIRET ${siret})</option>`;
                    }).join('') +
                '</select>' +
            '</div>';

        const buyerSelect = document.getElementById('adv-buyer');
        if (buyerSelect) {
            buyerSelect.addEventListener('change', () => GeneratorUI.syncBuyerReference());
        }
        this.syncBuyerReference();

        const factorSelect = document.getElementById('adv-factor');
        if (factorSelect) {
            factorSelect.innerHTML = data.companies.factors
                .map((f) => `<option value="${f.id}">${f.name}</option>`).join('');
        }
    },

    // BT-10 : pré-remplissage de la référence acheteur depuis companies.json.
    // Une valeur saisie par l'utilisateur n'est jamais écrasée.
    syncBuyerReference() {
        const field = document.getElementById('buyer-reference');
        const select = document.getElementById('adv-buyer');
        if (!field || !select || !window.APP_DATA || !window.APP_DATA.companies) return;

        const buyer = window.APP_DATA.companies.buyers.find((b) => b.id === select.value)
            || window.APP_DATA.companies.buyers[0];
        const trigrammeField = document.getElementById('trigramme');
        const fallback = `${((trigrammeField && trigrammeField.value) || 'BBA').toUpperCase()}-REF-001`;
        const previous = field.dataset.autofill || '';

        if (!field.value || field.value === previous) {
            field.value = (buyer && buyer.buyerReference) || fallback;
            field.dataset.autofill = field.value;
        }
    },

    initTabs() {
        const tabs = document.querySelectorAll('.gen-tab');
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const mode = tab.getAttribute('data-mode');
                window.COMPANY_MODE = mode;
                tabs.forEach((t) => {
                    t.classList.toggle('active', t === tab);
                    t.setAttribute('aria-selected', String(t === tab));
                });
                document.getElementById('mode-default').classList.toggle('hidden', mode !== 'default');
                document.getElementById('mode-custom').classList.toggle('hidden', mode !== 'custom');
            });
        });
    },

    initTemplateDownload() {
        const btn = document.getElementById('btn-download-template');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const blob = new Blob([BLANK_TEMPLATE], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'template_entreprise.json';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    },

    // =====================================================
    // DRAG & DROP + CLIC — Supplier, Buyer, Third Party
    // =====================================================
    initFileUploads() {
        ['supplier', 'buyer', 'thirdparty'].forEach((role) => {
            const area = document.getElementById(`area-${role}`);
            const fileInput = document.getElementById(`file-${role}`);
            if (!area || !fileInput) return;

            area.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                GeneratorUI.handleFileUpload(e.target.files[0], role);
                fileInput.value = '';
            });

            area.addEventListener('dragover', (e) => {
                e.preventDefault(); e.stopPropagation();
                area.classList.add('dragover');
            });
            area.addEventListener('dragleave', (e) => {
                e.preventDefault(); e.stopPropagation();
                area.classList.remove('dragover');
            });
            area.addEventListener('drop', (e) => {
                e.preventDefault(); e.stopPropagation();
                area.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    GeneratorUI.handleFileUpload(e.dataTransfer.files[0], role);
                }
            });
        });
    },

    handleFileUpload(file, role) {
        const previewEl = document.getElementById(`preview-${role}`);
        const areaEl = document.getElementById(`area-${role}`);
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            previewEl.innerHTML = '<div class="gen-upload-error">Le fichier doit être au format .json</div>';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const validation = (role === 'thirdparty')
                    ? validateThirdPartyJSON(data)
                    : validateCompanyJSON(data);

                if (!validation.valid) {
                    previewEl.innerHTML = `<div class="gen-upload-error">${validation.errors.join('<br>')}</div>`;
                    areaEl.classList.remove('loaded');
                    return;
                }

                if (role === 'supplier') window.CUSTOM_SUPPLIER = data;
                else if (role === 'buyer') window.CUSTOM_BUYER = data;
                else if (role === 'thirdparty') window.CUSTOM_THIRDPARTY = data;

                areaEl.classList.add('loaded');
                previewEl.innerHTML = (role === 'thirdparty')
                    ? renderThirdPartyPreview(data, validation.warnings)
                    : renderPreview(data, validation.warnings);
            } catch (err) {
                previewEl.innerHTML = `<div class="gen-upload-error">JSON invalide : ${err.message}</div>`;
                areaEl.classList.remove('loaded');
            }
        };
        reader.readAsText(file);
    },

    // =====================================================
    // ÉTAPE 3 — LA FACTURE (format, contenu, PDF autonomes)
    // =====================================================

    // Le lisible, les bons et le Factur-X reposent tous sur la représentation
    // lisible : ils ne sont proposés que si le cas d'usage sait la produire.
    pdfAvailable(usecase) {
        if (typeof UBLGenerator === 'undefined') return false;
        return UBLGenerator.supportsPdf(usecase);
    },

    // Composition effective = intention de l'utilisateur ∩ ce que le cas
    // d'usage sait produire. Miroir exact de UBLGenerator.getComposition.
    effectiveComposition(usecase) {
        const pdfOk = GeneratorUI.pdfAvailable(usecase);
        const st = GeneratorUI.state;
        const comp = {
            format: (!pdfOk && st.format === 'facturx') ? 'ubl' : st.format,
            embed: { ...st.embed },
            side: { ...st.side }
        };
        if (comp.format === 'facturx') comp.embed.lisible = true;
        if (!pdfOk) {
            comp.embed = { lisible: false, order: false, despatch: false };
            comp.side  = { lisible: false, order: false, despatch: false };
        }
        return comp;
    },

    // Liste des fichiers qui seront réellement téléchargés, dans l'ordre.
    plannedFiles(usecase) {
        const comp = GeneratorUI.effectiveComposition(usecase);
        const suffix = (typeof UBLGenerator !== 'undefined')
            ? UBLGenerator.composeSuffix(comp.format, comp.embed)
            : '_UBL.xml';

        const inside = [];
        if (comp.embed.lisible) inside.push(comp.format === 'facturx' ? 'lisible (PDF/A-3)' : 'lisible');
        if (comp.embed.order) inside.push('bon de commande');
        if (comp.embed.despatch) inside.push('bon de livraison');

        const lines = [{
            label: FORMAT_LABELS[comp.format] + (inside.length ? ` — avec ${inside.join(', ')}` : ' — nue'),
            suffix
        }];

        if (comp.side.lisible) lines.push({ label: 'PDF lisible autonome', suffix: '.pdf' });
        if (comp.side.order) lines.push({ label: 'Bon de commande', suffix: '.pdf' });
        if (comp.side.despatch) lines.push({ label: 'Bon de livraison', suffix: '.pdf' });

        return { lines, count: lines.length, comp };
    },

    // Applique l'intention à l'état réel des contrôles + met à jour l'affichage.
    syncComposition() {
        const usecaseEl = document.getElementById('usecase');
        if (!usecaseEl || typeof UBLGenerator === 'undefined') return;
        const usecase = usecaseEl.value;

        const group = document.getElementById('group-artifacts');
        const formatGroup = document.getElementById('group-format');
        const embedGroup = document.getElementById('group-embed');
        const sideGroup = document.getElementById('group-sidecars');
        const btn = document.getElementById('btn-generate');
        const box = document.getElementById('info-box');
        const info = document.getElementById('info-text');
        const recap = document.getElementById('fab-recap');

        const reason = UBLGenerator.NO_INVOICE_CASES[usecase] || null;
        const cfg = UBLGenerator.caseConfig[usecase] || {};

        // --- Cas hors périmètre e-invoicing : rien à composer, rien à produire.
        if (reason) {
            if (group) group.classList.add('hidden');
            if (recap) recap.classList.add('hidden');
            if (box) box.classList.add('out-of-scope');
            if (info) info.innerHTML = `<strong>Aucune facture à produire.</strong> ${reason}`;
            if (btn) {
                btn.disabled = true;
                btn.classList.add('disabled');
                btn.innerHTML = '<span class="gen-btn-icon">🚫</span> Aucune facture à produire';
            }
            return;
        }
        if (box) box.classList.remove('out-of-scope');

        // --- Cas à pack imposé : le CONTENU de chaque document est dicté par le
        // scénario (facture + avoir, ou originale + rectificative, plus les CSV
        // de données de référence), mais la SYNTAXE reste un choix légitime :
        // demander son pack en CII n'a rien d'absurde. On garde donc l'étage A
        // et on masque les étages B et C, qui n'ont pas de prise ici.
        if (cfg.zip) {
            if (group) group.classList.remove('hidden');
            if (formatGroup) formatGroup.classList.remove('hidden');
            if (embedGroup) embedGroup.classList.add('hidden');
            if (sideGroup) sideGroup.classList.add('hidden');
            if (recap) recap.classList.add('hidden');

            // Les trois syntaxes sont désormais ouvertes au pack. Le Factur-X
            // demandait de composer une représentation lisible pour CHAQUE
            // document du pack, et non pour un document unique : c'était bien
            // un chantier d'architecture, il est fait.
            // Le pack contient toujours la référence UBL, à laquelle s'ajoute
            // la syntaxe demandée. C'est ce qui permet de comparer, sur les
            // mêmes montants, l'expression d'un avoir ou d'une rectification
            // d'une syntaxe à l'autre.
            const pdfOkZip = ZIP_PDF_CASES.indexOf(usecase) !== -1;
            FORMATS.forEach((f) => {
                const input = document.getElementById(f.id);
                if (!input) return;
                const available = (f.value !== 'facturx') || pdfOkZip;
                input.disabled = !available;
                input.checked = available && GeneratorUI.state.format === f.value;
                const card = input.closest('.fab-opt');
                if (card) card.classList.toggle('is-disabled', !available);
            });
            if (GeneratorUI.state.format === 'facturx' && !pdfOkZip) {
                const fallback = document.getElementById('fmt-ubl');
                if (fallback) fallback.checked = true;
            }

            let zipFormat = 'ubl';
            if (GeneratorUI.state.format === 'cii') zipFormat = 'cii';
            if (GeneratorUI.state.format === 'facturx' && pdfOkZip) zipFormat = 'facturx';

            const ZIP_HINTS = {
                ubl: 'Ce scénario produit un pack multi-documents. Son contenu est dicté par le scénario ; seule la syntaxe se choisit.',
                cii: 'Le pack contiendra chaque document dans les deux syntaxes, UBL et CII, pour les comparer.',
                facturx: 'Le pack contiendra chaque document en UBL et en Factur-X : un PDF/A-3B par document, portant sa propre représentation lisible.'
            };
            const ZIP_BTN = {
                ubl: 'Télécharger le pack ZIP (UBL)',
                cii: 'Télécharger le pack ZIP (UBL + CII)',
                facturx: 'Télécharger le pack ZIP (UBL + Factur-X)'
            };
            const fmtHintZip = document.getElementById('format-hint');
            if (fmtHintZip) fmtHintZip.textContent = ZIP_HINTS[zipFormat];

            if (btn) {
                btn.disabled = false;
                btn.classList.remove('disabled');
                btn.innerHTML = '<span class="gen-btn-icon">📦</span> ' + ZIP_BTN[zipFormat];
            }
            return;
        }

        if (group) group.classList.remove('hidden');
        if (formatGroup) formatGroup.classList.remove('hidden');
        if (embedGroup) embedGroup.classList.remove('hidden');
        if (sideGroup) sideGroup.classList.remove('hidden');
        if (recap) recap.classList.remove('hidden');

        const pdfOk = GeneratorUI.pdfAvailable(usecase);
        const comp = GeneratorUI.effectiveComposition(usecase);

        // --- Étage A : le format.
        // Certains cas ne sont pas exprimables dans toutes les syntaxes : le
        // multi-vendeurs S8 n'existe pas en UBL, faute de vendeur de niveau
        // ligne. On grise la syntaxe plutôt que de produire un fichier qui
        // perdrait l'information sans le dire.
        const allowedFmt = (typeof UBLGenerator !== 'undefined' && UBLGenerator.allowedFormats)
            ? UBLGenerator.allowedFormats(usecase)
            : ['ubl', 'cii', 'facturx'];
        FORMATS.forEach((f) => {
            const input = document.getElementById(f.id);
            if (!input) return;
            const available = (!f.needsPdf || pdfOk) && allowedFmt.indexOf(f.value) !== -1;
            input.disabled = !available;
            input.checked = available && comp.format === f.value;
            const card = input.closest('.fab-opt');
            if (card) card.classList.toggle('is-disabled', !available);
        });

        const fmtHint = document.getElementById('format-hint');
        if (fmtHint) {
            if (allowedFmt.indexOf('ubl') === -1) {
                fmtHint.innerHTML = '⚠️ Ce cas d’usage repose sur des extensions du profil français <strong>EXTENDED-CTC-FR</strong> qui n’ont pas d’équivalent en UBL : la syntaxe est indisponible. Un UBL perdrait silencieusement l’identité des vendeurs de chaque ligne.';
            } else if (pdfOk) {
                fmtHint.innerHTML = 'Une facture s’écrit dans une seule syntaxe. Le contenu choisi ci-dessous s’applique au format retenu.';
            } else {
                fmtHint.innerHTML = '⚠️ La représentation lisible n’a pas encore été vérifiée pour ce cas d’usage : le Factur-X est indisponible, et la facture sera produite nue.';
            }
        }

        // --- Étage B : ce qui voyage dans le fichier de facture.
        const isFacturx = comp.format === 'facturx';
        PIECES.forEach((piece) => {
            const input = document.getElementById(piece.embedId);
            if (!input) return;
            const locked = isFacturx && piece.key === 'lisible';
            const available = pdfOk && !locked;
            input.disabled = !available;
            input.checked = comp.embed[piece.key];
            const card = input.closest('.fab-opt');
            if (card) card.classList.toggle('is-disabled', !pdfOk);
        });

        // Le lisible d'un Factur-X n'est pas une option : c'est le format.
        const tagLisible = document.getElementById('tag-embed-lisible');
        const descLisible = document.getElementById('desc-embed-lisible');
        const wrapLisible = document.getElementById('wrap-embed-lisible');
        if (tagLisible) tagLisible.textContent = isFacturx ? 'inhérent' : 'BT-125';
        if (descLisible) {
            descLisible.innerHTML = isFacturx
                ? 'Le <code>PDF/A-3B</code> <strong>est</strong> la représentation lisible : elle est incluse par construction, sans occurrence <code>BG-24</code>.'
                : 'Le rendu humain de la facture, encodé en base64 dans une occurrence <code>BG-24</code>.';
        }
        if (wrapLisible) wrapLisible.classList.toggle('is-locked', isFacturx);

        const embedHint = document.getElementById('embed-hint');
        if (embedHint) {
            embedHint.textContent = pdfOk
                ? 'Ces pièces voyagent À L’INTÉRIEUR du fichier de facture. Aucune ne génère de fichier séparé.'
                : 'Indisponible pour ce cas d’usage : aucune pièce jointe ne peut être produite sans représentation lisible vérifiée.';
        }

        // --- Étage C : les PDF autonomes, décochés par défaut.
        PIECES.forEach((piece) => {
            const input = document.getElementById(piece.sideId);
            if (!input) return;
            input.disabled = !pdfOk;
            input.checked = comp.side[piece.key];
            const card = input.closest('.fab-opt');
            if (card) card.classList.toggle('is-disabled', !pdfOk);
        });

        const sideHint = document.getElementById('side-hint');
        if (sideHint) {
            sideHint.textContent = pdfOk
                ? 'Utile pour une démonstration ou un test. Dès qu’une case est cochée ici, la livraison se fait en archive ZIP.'
                : 'Indisponible pour ce cas d’usage.';
        }

        GeneratorUI.syncRecap(usecase);
    },

    // Récapitulatif live : ce qui sera réellement téléchargé, fichier par fichier.
    syncRecap(usecase) {
        const { lines, count } = GeneratorUI.plannedFiles(usecase);
        const listEl = document.getElementById('fab-recap-list');
        const countEl = document.getElementById('fab-recap-count');
        const miniEl = document.getElementById('fab-mini-count');
        const btn = document.getElementById('btn-generate');

        if (listEl) {
            listEl.innerHTML = lines
                .map((l) => `<li><span class="fab-recap-name">${l.label}</span><span class="fab-recap-ext">${l.suffix}</span></li>`)
                .join('');
        }

        const wording = count > 1 ? `${count} fichiers · archive ZIP` : '1 fichier';
        if (countEl) countEl.textContent = wording;
        if (miniEl) miniEl.textContent = wording;

        if (btn) {
            btn.disabled = false;
            btn.classList.remove('disabled');
            btn.innerHTML = count > 1
                ? `<span class="gen-btn-icon">📦</span> Télécharger le ZIP (${count} fichiers)`
                : `<span class="gen-btn-icon">📥</span> Télécharger ${lines[0].label.split(' — ')[0]}`;
        }
    },

    initCompositionControls() {
        FORMATS.forEach((f) => {
            const input = document.getElementById(f.id);
            if (!input) return;
            input.addEventListener('change', () => {
                if (!input.checked) return;
                GeneratorUI.state.format = f.value;
                GeneratorUI.syncComposition();
            });
        });

        PIECES.forEach((piece) => {
            const embed = document.getElementById(piece.embedId);
            if (embed) {
                embed.addEventListener('change', () => {
                    GeneratorUI.state.embed[piece.key] = embed.checked;
                    GeneratorUI.syncComposition();
                });
            }
            const side = document.getElementById(piece.sideId);
            if (side) {
                side.addEventListener('change', () => {
                    GeneratorUI.state.side[piece.key] = side.checked;
                    GeneratorUI.syncComposition();
                });
            }
        });
    },

    // =====================================================
    // FICHE PÉDAGOGIQUE
    // =====================================================
    updateWithFade() {
        const el = document.getElementById('theory-content');
        el.style.opacity = '0';
        setTimeout(() => {
            GeneratorUI.updateInfoBox();
            el.style.opacity = '1';
        }, 150);
    },

    updateInfoBox() {
        const usecase = document.getElementById('usecase').value;
        const theory = window.APP_DATA.pedagogy[usecase];
        if (!theory) return;

        document.getElementById('theory-content').innerHTML =
            `<span class="gen-badge">${theory.badge}</span>` +
            `<h3 class="gen-theory-title">${theory.title}</h3>` +
            '<div class="gen-theory-body">' +
                `<p>${theory.desc1}</p>` +
                `<p>${theory.desc2}</p>` +
            '</div>';

        document.getElementById('info-text').innerHTML = theory.info;

        const cardThird = document.getElementById('card-thirdparty');
        if (cardThird) {
            cardThird.classList.toggle('hidden', CASES_WITH_THIRDPARTY.indexOf(usecase) === -1);
        }

        const groupFactor = document.getElementById('group-factor');
        if (groupFactor && typeof UBLGenerator !== 'undefined') {
            const cfg = UBLGenerator.caseConfig[usecase] || {};
            groupFactor.classList.toggle('hidden', cfg.payeeType !== 'factor');
        }

        GeneratorUI.syncComposition();
        document.getElementById('success-msg').classList.add('hidden');
    },

    showSuccess(fileName) {
        const msg = document.getElementById('success-msg');
        document.getElementById('filename-display').innerText = fileName;
        msg.classList.remove('hidden');
        msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        fetch('./data/pedagogy.json').then((r) => r.json()),
        fetch('./data/companies.json').then((r) => r.json())
    ])
    .then((results) => {
        window.APP_DATA = { pedagogy: results[0], companies: results[1] };

        GeneratorUI.populateSelects();
        GeneratorUI.initCompositionControls();
        GeneratorUI.updateInfoBox();
        GeneratorUI.initTabs();
        GeneratorUI.initTemplateDownload();
        GeneratorUI.initFileUploads();

        document.getElementById('usecase').addEventListener('change', () => GeneratorUI.updateWithFade());
        document.getElementById('btn-generate').addEventListener('click', () => UBLGenerator.generateFile());
    })
    .catch((error) => {
        console.error('Erreur chargement donnees :', error);
        const el = document.getElementById('theory-content');
        if (el) el.innerHTML = '<div class="gen-upload-error">Impossible de charger les référentiels du générateur. Rechargez la page.</div>';
    });
});

const UIManager = {
    showSuccess: (fileName) => GeneratorUI.showSuccess(fileName)
};
