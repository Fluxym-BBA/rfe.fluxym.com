/**
 * GENERATOR-UI.JS v4 — La Fabrique de factures électroniques
 * Auteur: Bruno BARTOLI — Fluxym / Re·Form·E
 * Date: 2026-08-21
 *
 * Changelog v4 — refonte ergonomique :
 *   - Parcours en trois étapes : le cas d'usage, les acteurs, les livrables.
 *   - Les livrables ne sont plus une liste de cases : trois formules de départ
 *     (Facture seule / Facture + lisible / Pack complet) et une composition
 *     détaillée repliable, en cartes à bascule groupées par famille.
 *   - Récapitulatif live : l'utilisateur voit ce qu'il va télécharger AVANT
 *     de cliquer, fichier par fichier.
 *   - Plus rien n'est imposé. Par défaut : la facture UBL nue, et rien d'autre.
 *   - Pièces jointes découplées : embarquer le bon de commande et le bon de
 *     livraison dans le XML (opt-annexes) et les récupérer en PDF autonomes
 *     (opt-annexes-files) sont désormais deux choix indépendants.
 *   - La sélection de l'utilisateur est mémorisée : changer de cas d'usage
 *     grise les livrables indisponibles sans effacer l'intention initiale.
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
// CATALOGUE DES LIVRABLES
// =====================================================
// Une seule source de vérité pour : l'état des cases, le décompte des
// fichiers, le récapitulatif et le libellé du bouton. Le champ `files`
// donne le nombre de fichiers réellement produits par l'option, ce qui
// évite l'écart entre ce qui est annoncé et ce qui est téléchargé.
// `needsPdf` marque les livrables qui reposent sur la représentation
// lisible : ils ne sont proposés que pour les cas où sa cohérence avec
// les données structurées a été vérifiée (UBLGenerator.PDF_CASES).
const ARTIFACTS = [
    { id: 'opt-ubl',           key: 'ubl',        files: 1, needsPdf: false, label: 'Facture UBL 2.1', suffix: '_UBL.xml' },
    { id: 'opt-cii',           key: 'cii',        files: 1, needsPdf: false, label: 'Facture CII D22B', suffix: '_CII.xml' },
    { id: 'opt-ubl-pdf',       key: 'ublWithPdf', files: 1, needsPdf: true,  label: 'UBL avec lisible embarqué', suffix: '_UBL_avec_lisible.xml' },
    { id: 'opt-pdf',           key: 'pdf',        files: 1, needsPdf: true,  label: 'PDF lisible autonome', suffix: '.pdf' },
    { id: 'opt-facturx',       key: 'facturx',    files: 1, needsPdf: true,  label: 'Factur-X (PDF/A-3B)', suffix: '.pdf' },
    { id: 'opt-annexes',       key: 'annexes',    files: 1, needsPdf: true,  label: 'UBL avec 3 pièces jointes', suffix: '_UBL_avec_3_PJ.xml' },
    { id: 'opt-annexes-files', key: 'annexFiles', files: 2, needsPdf: true,  label: 'Bon de commande + bon de livraison', suffix: '.pdf ×2' }
];

// Formules de départ. Elles ne verrouillent rien : cliquer une carte de
// livrable bascule simplement l'utilisateur en composition sur mesure.
const PRESETS = {
    facture: ['opt-ubl'],
    lisible: ['opt-ubl', 'opt-ubl-pdf', 'opt-pdf'],
    complet: ['opt-ubl', 'opt-cii', 'opt-ubl-pdf', 'opt-pdf', 'opt-facturx', 'opt-annexes', 'opt-annexes-files']
};

// =====================================================
// GENERATOR UI
// =====================================================
const GeneratorUI = {

    // Intention de l'utilisateur, indépendante de la disponibilité du cas
    // en cours : on ne perd pas une case cochée en passant par un cas qui
    // ne sait pas produire de lisible.
    desired: new Set(PRESETS.facture),

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
    // ÉTAPE 3 — LES LIVRABLES
    // =====================================================

    // Un livrable est disponible si le cas sait le produire. Seule la
    // famille « lisible » est conditionnée : UBL et CII sont toujours
    // produisibles dès lors que le cas donne lieu à une facture.
    isAvailable(artifact, usecase) {
        if (!artifact.needsPdf) return true;
        if (typeof UBLGenerator === 'undefined') return false;
        return UBLGenerator.supportsPdf(usecase);
    },

    // Sélection effective = intention de l'utilisateur ∩ livrables disponibles.
    currentSelection(usecase) {
        const selected = ARTIFACTS.filter((a) =>
            GeneratorUI.desired.has(a.id) && GeneratorUI.isAvailable(a, usecase));

        const lines = selected.map((a) => ({ label: a.label, files: a.files, suffix: a.suffix }));

        // La variante CII multi-pièces jointes n'est produite que si les deux
        // options sont demandées : elle n'a pas de case à elle seule.
        const wantsCii = selected.some((a) => a.id === 'opt-cii');
        const wantsAnnexes = selected.some((a) => a.id === 'opt-annexes');
        if (wantsCii && wantsAnnexes) {
            lines.push({ label: 'CII avec 3 pièces jointes', files: 1, suffix: '_CII_avec_3_PJ.xml' });
        }

        const count = lines.reduce((total, l) => total + l.files, 0);
        return { lines, count };
    },

    // Applique l'intention à l'état réel des cases + met à jour l'affichage.
    syncArtifacts() {
        const usecaseEl = document.getElementById('usecase');
        if (!usecaseEl || typeof UBLGenerator === 'undefined') return;
        const usecase = usecaseEl.value;

        const group = document.getElementById('group-artifacts');
        const hint = document.getElementById('artifacts-hint');
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
            if (hint) hint.textContent = '';
            if (btn) {
                btn.disabled = true;
                btn.classList.add('disabled');
                btn.innerHTML = '<span class="gen-btn-icon">🚫</span> Aucune facture à produire';
            }
            return;
        }
        if (box) box.classList.remove('out-of-scope');

        // --- Cas à pack imposé : le contenu est dicté par le scénario.
        if (cfg.zip) {
            if (group) group.classList.add('hidden');
            if (recap) recap.classList.add('hidden');
            if (hint) hint.textContent = '';
            if (btn) {
                btn.disabled = false;
                btn.classList.remove('disabled');
                btn.innerHTML = '<span class="gen-btn-icon">📦</span> Télécharger le pack ZIP';
            }
            return;
        }

        if (group) group.classList.remove('hidden');
        if (recap) recap.classList.remove('hidden');

        // --- Cases : cochées si voulues ET disponibles, grisées sinon.
        let pdfBlocked = false;
        ARTIFACTS.forEach((a) => {
            const input = document.getElementById(a.id);
            if (!input) return;
            const available = GeneratorUI.isAvailable(a, usecase);
            if (!available) pdfBlocked = true;
            input.disabled = !available;
            input.checked = available && GeneratorUI.desired.has(a.id);
            const card = input.closest('.fab-opt');
            if (card) {
                card.classList.toggle('is-disabled', !available);
                card.classList.toggle('is-on', input.checked);
            }
        });

        if (hint) {
            hint.innerHTML = pdfBlocked
                ? '⚠️ La représentation lisible n’a pas encore été vérifiée pour ce cas d’usage : les livrables qui en dépendent (PDF, Factur-X, pièces jointes) sont indisponibles.'
                : 'Dès que plusieurs fichiers sont sélectionnés, ils sont livrés ensemble dans une archive ZIP. Un seul fichier sélectionné = un seul téléchargement, sans ZIP.';
        }

        GeneratorUI.syncPresetState();
        GeneratorUI.syncRecap(usecase);
    },

    // Met en avant la formule qui correspond exactement à la sélection.
    syncPresetState() {
        const selected = ARTIFACTS
            .filter((a) => GeneratorUI.desired.has(a.id))
            .map((a) => a.id).sort().join('|');

        document.querySelectorAll('.fab-preset').forEach((el) => {
            const preset = PRESETS[el.dataset.preset] || [];
            const signature = preset.slice().sort().join('|');
            const match = signature === selected;
            el.classList.toggle('is-active', match);
            el.setAttribute('aria-pressed', String(match));
        });

        const custom = document.getElementById('fab-custom-flag');
        if (custom) {
            const known = Object.values(PRESETS)
                .some((p) => p.slice().sort().join('|') === selected);
            custom.classList.toggle('hidden', known);
        }
    },

    // Récapitulatif live : ce qui sera réellement téléchargé.
    syncRecap(usecase) {
        const { lines, count } = GeneratorUI.currentSelection(usecase);
        const listEl = document.getElementById('fab-recap-list');
        const countEl = document.getElementById('fab-recap-count');
        const miniEl = document.getElementById('fab-mini-count');
        const btn = document.getElementById('btn-generate');

        if (listEl) {
            listEl.innerHTML = lines.length
                ? lines.map((l) => `<li><span class="fab-recap-name">${l.label}</span><span class="fab-recap-ext">${l.suffix}</span></li>`).join('')
                : '<li class="fab-recap-empty">Aucun livrable sélectionné.</li>';
        }

        const wording = count === 0
            ? 'Rien à télécharger'
            : `${count} fichier${count > 1 ? 's' : ''}${count > 1 ? ' · archive ZIP' : ''}`;
        if (countEl) countEl.textContent = wording;
        if (miniEl) miniEl.textContent = wording;

        if (btn) {
            btn.disabled = count === 0;
            btn.classList.toggle('disabled', count === 0);
            if (count === 0) {
                btn.innerHTML = '<span class="gen-btn-icon">⚠️</span> Sélectionnez au moins un livrable';
            } else if (count === 1) {
                btn.innerHTML = `<span class="gen-btn-icon">📥</span> Télécharger ${lines[0].label}`;
            } else {
                btn.innerHTML = `<span class="gen-btn-icon">📦</span> Télécharger le ZIP (${count} fichiers)`;
            }
        }
    },

    initArtifactOptions() {
        ARTIFACTS.forEach((a) => {
            const input = document.getElementById(a.id);
            if (!input) return;
            input.addEventListener('change', () => {
                if (input.checked) GeneratorUI.desired.add(a.id);
                else GeneratorUI.desired.delete(a.id);
                GeneratorUI.syncArtifacts();
            });
        });

        document.querySelectorAll('.fab-preset').forEach((el) => {
            el.addEventListener('click', () => {
                GeneratorUI.desired = new Set(PRESETS[el.dataset.preset] || PRESETS.facture);
                GeneratorUI.syncArtifacts();
                const details = document.getElementById('fab-advanced');
                if (details && el.dataset.preset === 'complet') details.open = true;
            });
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

        GeneratorUI.syncArtifacts();
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
        GeneratorUI.initArtifactOptions();
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
