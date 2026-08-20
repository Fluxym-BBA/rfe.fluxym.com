/**
 * GENERATOR-UI.JS v3c — avec upload tiers
 * Auteur: Bruno BARTOLI — Fluxym / Re·Form·E
 */

window.CUSTOM_SUPPLIER = null;
window.CUSTOM_BUYER = null;
window.CUSTOM_THIRDPARTY = null;
window.COMPANY_MODE = "default";

// Cas avec un tiers (PayeeParty)
var CASES_WITH_THIRDPARTY = ["5", "7", "8", "9", "10"];

// =====================================================
// TEMPLATE JSON VIERGE
// =====================================================
var BLANK_TEMPLATE = JSON.stringify({
    "name": "",
    "legalName": "",
    "siren": "",
    "nic": "",
    "vatNumber": "",
    "address": {
        "street": "",
        "city": "",
        "zip": "",
        "country": "FR"
    }
}, null, 2);

// =====================================================
// VALIDATION JSON — NIC optionnel
// =====================================================
var REQUIRED_FIELDS = ["name", "legalName", "siren", "vatNumber"];
var REQUIRED_ADDR = ["street", "city", "zip", "country"];

function validateCompanyJSON(data) {
    var errors = [];
    var warnings = [];

    if (typeof data !== 'object' || data === null) {
        return { valid: false, errors: ["Le fichier n'est pas un objet JSON valide."], warnings: [] };
    }

    REQUIRED_FIELDS.forEach(function(f) {
        if (!data[f] || String(data[f]).trim() === '') {
            errors.push("Champ '" + f + "' manquant ou vide.");
        }
    });

    if (!data.address || typeof data.address !== 'object') {
        errors.push("Bloc 'address' manquant.");
    } else {
        REQUIRED_ADDR.forEach(function(f) {
            if (!data.address[f] || String(data.address[f]).trim() === '') {
                errors.push("Champ 'address." + f + "' manquant ou vide.");
            }
        });
    }

    if (data.siren && !/^\d{9}$/.test(String(data.siren).trim())) {
        errors.push("Le SIREN doit contenir exactement 9 chiffres.");
    }

    if (data.nic && String(data.nic).trim() !== '') {
        if (!/^\d{5}$/.test(String(data.nic).trim())) {
            errors.push("Le NIC doit contenir exactement 5 chiffres.");
        }
    } else {
        warnings.push("NIC non renseigné — la valeur 00001 sera utilisée.");
    }

    if (data.vatNumber && !/^FR\d{2}\d{9}$/.test(String(data.vatNumber).trim())) {
        errors.push("Le n° TVA doit être au format FR + 2 chiffres + SIREN.");
    }

    return { valid: errors.length === 0, errors: errors, warnings: warnings };
}

// Validation simplifiée pour le tiers (name + siren seulement)
function validateThirdPartyJSON(data) {
    var errors = [];
    var warnings = [];

    if (typeof data !== 'object' || data === null) {
        return { valid: false, errors: ["Le fichier n'est pas un objet JSON valide."], warnings: [] };
    }
    if (!data.name || String(data.name).trim() === '') {
        errors.push("Champ 'name' manquant ou vide.");
    }
    if (!data.siren || String(data.siren).trim() === '') {
        errors.push("Champ 'siren' manquant ou vide.");
    } else if (!/^\d{9}$/.test(String(data.siren).trim())) {
        errors.push("Le SIREN doit contenir exactement 9 chiffres.");
    }
    if (data.nic && String(data.nic).trim() !== '') {
        if (!/^\d{5}$/.test(String(data.nic).trim())) {
            errors.push("Le NIC doit contenir exactement 5 chiffres.");
        }
    } else {
        warnings.push("NIC non renseigné — 00001 par défaut.");
    }
    return { valid: errors.length === 0, errors: errors, warnings: warnings };
}

// =====================================================
// PREVIEW
// =====================================================
function renderPreview(data, warnings) {
    var nic = (data.nic && String(data.nic).trim() !== '') ? data.nic : null;
    var siret = data.siren + (nic || '00001');
    var nicDisplay = nic
        ? 'NIC ' + nic
        : '<span class="company-warn">NIC absent — 00001 par défaut</span>';

    var html = '<div style="margin-top:8px; line-height:1.6;">' +
        '<span class="company-name">' + data.name + '</span> — ' +
        '<span class="company-siren">' + data.legalName + '</span><br>' +
        '<span class="company-siren">SIRET : <strong>' + siret + '</strong> (SIREN ' + data.siren + ' + ' + nicDisplay + ')</span><br>' +
        '<span class="company-addr">' + data.address.street + ', ' + data.address.zip + ' ' + data.address.city + ' (' + data.address.country + ')</span><br>' +
        '<span class="company-siren">TVA : ' + data.vatNumber + '</span>';

    if (warnings && warnings.length > 0) {
        html += '<br><span class="company-warn">' + warnings.join(' | ') + '</span>';
    }
    html += '</div>';
    return html;
}

// Preview simplifié pour le tiers
function renderThirdPartyPreview(data, warnings) {
    var nic = (data.nic && String(data.nic).trim() !== '') ? data.nic : null;
    var siret = data.siren + (nic || '00001');
    var nicDisplay = nic
        ? 'NIC ' + nic
        : '<span class="company-warn">NIC absent — 00001 par défaut</span>';

    var html = '<div style="margin-top:8px; line-height:1.6;">' +
        '<span class="company-name">' + data.name + '</span><br>' +
        '<span class="company-siren">SIRET : <strong>' + siret + '</strong> (SIREN ' + data.siren + ' + ' + nicDisplay + ')</span>';

    if (warnings && warnings.length > 0) {
        html += '<br><span class="company-warn">' + warnings.join(' | ') + '</span>';
    }
    html += '</div>';
    return html;
}

// =====================================================
// GENERATOR UI
// =====================================================
const GeneratorUI = {

    categories: [
        { key: "catA", label: "A — Cas standards", cases: ["nominal","nominal-rejet-emission","nominal-non-transmise","nominal-rejet-reception","nominal-refus","nominal-litige-avoir","nominal-litige-rectificative","1","31"] },
        { key: "catB", label: "B — Paiements, frais & tiers payeurs", cases: ["2","5","3","4","7"] },
        { key: "catC", label: "C — Affacturage & tiers bénéficiaires", cases: ["8","9","10"] },
        { key: "catD", label: "D — Intermédiaires & mandataires", cases: ["11","12","15","16"] },
        { key: "catE", label: "E — Sous-traitance & co-traitance", cases: ["13","14"] },
        { key: "catF", label: "F — Auto-facturation & mandat", cases: ["17a","17b","19a","19b"] },
        { key: "catG", label: "G — Factures complémentaires & rectificatives", cases: ["18"] },
        { key: "catH", label: "H — Acomptes & factures de solde", cases: ["20","21","32"] },
        { key: "catI", label: "I — Escompte", cases: ["22a","22b"] },
        { key: "catJ", label: "J — Cas spéciaux", cases: ["23","6","28","30","25","26","42"] },
        { key: "catK", label: "K — Cas avancés & régimes spéciaux", cases: ["33","34","35","36","37","38","39","40","41"] },
        { key: "catL", label: "L — Régimes de TVA transverses", cases: ["T1","T2","T4","T6","T7","T8"] },
        { key: "tests", label: "Tests de robustesse", cases: ["A"] },
        { key: "packs", label: "Packs de test (ZIP)", cases: ["B"] },
        // Conserves pour leur valeur pedagogique, mais aucune facture n'est produite.
        { key: "noinvoice", label: "Hors périmètre e-invoicing — aucune facture", cases: ["24","27","29"] }
    ],

    populateSelects: function() {
        var data = window.APP_DATA;
        var usecaseSelect = document.getElementById('usecase');
        usecaseSelect.innerHTML = '';
        var alreadyAdded = {};

        this.categories.forEach(function(cat) {
            var group = document.createElement('optgroup');
            group.label = cat.label;
            cat.cases.forEach(function(key) {
                if (data.pedagogy[key] && !alreadyAdded[key]) {
                    var option = document.createElement('option');
                    option.value = key;
                    option.textContent = data.pedagogy[key].label;
                    group.appendChild(option);
                    alreadyAdded[key] = true;
                }
            });
            if (group.children.length > 0) usecaseSelect.appendChild(group);
        });

        var settingsContainer = document.getElementById('companies-settings');
        var html =
            '<div class="gen-field">' +
                '<label>Fournisseur (Supplier)</label>' +
                '<select id="adv-supplier">' +
                    data.companies.suppliers.map(function(s) {
                        return '<option value="' + s.id + '">' + s.name + ' (' + s.siren + ')</option>';
                    }).join('') +
                '</select>' +
            '</div>' +
            '<div class="gen-field">' +
                '<label>Acheteur (Buyer)</label>' +
                '<select id="adv-buyer">' +
                    data.companies.buyers.map(function(b) {
                        var siret = b.siren + (b.nic || '00001');
                        return '<option value="' + b.id + '">' + b.name + ' (SIRET ' + siret + ')</option>';
                    }).join('') +
                '</select>' +
            '</div>';
        settingsContainer.innerHTML = html;

        var buyerSelect = document.getElementById('adv-buyer');
        if (buyerSelect) {
            buyerSelect.addEventListener('change', function() { GeneratorUI.syncBuyerReference(); });
        }
        this.syncBuyerReference();

        var factorSelect = document.getElementById('adv-factor');
        if (factorSelect) {
            factorSelect.innerHTML = data.companies.factors.map(function(f) {
                return '<option value="' + f.id + '">' + f.name + '</option>';
            }).join('');
        }
    },

    // BT-10 : pre-remplissage de la reference acheteur depuis companies.json.
    // Une valeur saisie par l'utilisateur n'est jamais ecrasee.
    syncBuyerReference: function() {
        const field = document.getElementById('buyer-reference');
        const select = document.getElementById('adv-buyer');
        if (!field || !select || !window.APP_DATA || !window.APP_DATA.companies) return;

        const buyer = window.APP_DATA.companies.buyers.find((b) => b.id === select.value)
            || window.APP_DATA.companies.buyers[0];
        const trigrammeField = document.getElementById('trigramme');
        const fallback = ((trigrammeField && trigrammeField.value) || 'BBA').toUpperCase() + '-REF-001';
        const previous = field.dataset.autofill || '';

        if (!field.value || field.value === previous) {
            field.value = (buyer && buyer.buyerReference) || fallback;
            field.dataset.autofill = field.value;
        }
    },

    initTabs: function() {
        var tabs = document.querySelectorAll('.gen-tab');
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var mode = this.getAttribute('data-mode');
                window.COMPANY_MODE = mode;
                tabs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                document.getElementById('mode-default').classList.toggle('hidden', mode !== 'default');
                document.getElementById('mode-custom').classList.toggle('hidden', mode !== 'custom');
            });
        });
    },

    initTemplateDownload: function() {
        var btn = document.getElementById('btn-download-template');
        if (btn) {
            btn.addEventListener('click', function() {
                var blob = new Blob([BLANK_TEMPLATE], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'template_entreprise.json';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
            });
        }
    },

    // =====================================================
    // DRAG & DROP + CLIC — Supplier, Buyer, Third Party
    // =====================================================
    initFileUploads: function() {
        var self = this;
        var roles = ['supplier', 'buyer', 'thirdparty'];

        roles.forEach(function(role) {
            var area = document.getElementById('area-' + role);
            var fileInput = document.getElementById('file-' + role);

            if (!area || !fileInput) return;

            area.addEventListener('click', function() { fileInput.click(); });
            fileInput.addEventListener('change', function(e) {
                self.handleFileUpload(e.target.files[0], role);
                fileInput.value = '';
            });

            area.addEventListener('dragover', function(e) {
                e.preventDefault(); e.stopPropagation();
                area.classList.add('dragover');
            });
            area.addEventListener('dragleave', function(e) {
                e.preventDefault(); e.stopPropagation();
                area.classList.remove('dragover');
            });
            area.addEventListener('drop', function(e) {
                e.preventDefault(); e.stopPropagation();
                area.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    self.handleFileUpload(e.dataTransfer.files[0], role);
                }
            });
        });
    },

    handleFileUpload: function(file, role) {
        var previewEl = document.getElementById('preview-' + role);
        var areaEl = document.getElementById('area-' + role);

        if (!file) return;

        if (!file.name.endsWith('.json')) {
            previewEl.innerHTML = '<div class="gen-upload-error">Le fichier doit être au format .json</div>';
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var data = JSON.parse(e.target.result);
                var validation = (role === 'thirdparty')
                    ? validateThirdPartyJSON(data)
                    : validateCompanyJSON(data);

                if (!validation.valid) {
                    previewEl.innerHTML = '<div class="gen-upload-error">' +
                        validation.errors.join('<br>') + '</div>';
                    areaEl.classList.remove('loaded');
                    return;
                }

                if (role === 'supplier') window.CUSTOM_SUPPLIER = data;
                else if (role === 'buyer') window.CUSTOM_BUYER = data;
                else if (role === 'thirdparty') window.CUSTOM_THIRDPARTY = data;

                areaEl.classList.add('loaded');
                var previewHtml = (role === 'thirdparty')
                    ? renderThirdPartyPreview(data, validation.warnings)
                    : renderPreview(data, validation.warnings);
                previewEl.innerHTML = previewHtml;

            } catch (err) {
                previewEl.innerHTML = '<div class="gen-upload-error">JSON invalide : ' + err.message + '</div>';
                areaEl.classList.remove('loaded');
            }
        };
        reader.readAsText(file);
    },

    // =====================================================
    // PEDAGOGY + show/hide third party card
    // =====================================================
    updateWithFade: function() {
        var el = document.getElementById('theory-content');
        el.style.opacity = '0';
        setTimeout(function() {
            GeneratorUI.updateInfoBox();
            el.style.opacity = '1';
        }, 150);
    },

    // =====================================================
    // CONTENU DU TELECHARGEMENT (triptyque)
    // =====================================================

    // Cas hors perimetre e-invoicing : le cas reste consultable pour sa
    // valeur pedagogique, mais la generation est bloquee et le motif
    // remplace la ligne de parametres injectes.
    // Retourne true si le cas selectionne n'est pas productible.
    syncScopeState: function(usecase) {
        if (typeof UBLGenerator === 'undefined') return false;

        const reason = UBLGenerator.NO_INVOICE_CASES[usecase] || null;
        const group = document.getElementById('group-artifacts');
        const btn = document.getElementById('btn-generate');
        const box = document.getElementById('info-box');
        const info = document.getElementById('info-text');

        if (group) group.classList.toggle('hidden', !!reason);
        if (btn) {
            btn.disabled = !!reason;
            btn.classList.toggle('disabled', !!reason);
        }
        if (box) box.classList.toggle('out-of-scope', !!reason);
        if (reason && info) {
            info.innerHTML = '<strong>Aucune facture à produire.</strong> ' + reason;
        }
        return !!reason;
    },

    // Active ou desactive les artefacts selon le cas selectionne :
    // le lisible n'est propose que pour les cas ou sa coherence
    // avec les donnees structurees a ete verifiee (UBLGenerator.PDF_CASES).
    syncArtifactOptions: function(usecase) {
        var group = document.getElementById('group-artifacts');
        if (!group || typeof UBLGenerator === 'undefined') return;

        // Hors perimetre : ni artefact, ni bouton actif.
        if (GeneratorUI.syncScopeState(usecase)) {
            GeneratorUI.syncGenerateLabel();
            return;
        }

        var cfg = UBLGenerator.caseConfig[usecase] || {};
        var hint = document.getElementById('artifacts-hint');

        // Les cas a pack ZIP produisent plusieurs documents : options sans objet.
        group.classList.toggle('hidden', !!cfg.zip);
        if (cfg.zip) {
            GeneratorUI.syncGenerateLabel();
            return;
        }

        var supported = UBLGenerator.supportsPdf(usecase);
        ['opt-ubl-pdf', 'opt-pdf', 'opt-annexes'].forEach(function(id) {
            var input = document.getElementById(id);
            if (!input) return;
            var wasDisabled = input.disabled;
            input.disabled = !supported;
            if (!supported) input.checked = false;
            else if (wasDisabled) input.checked = true;
            if (input.parentElement) input.parentElement.classList.toggle('disabled', !supported);
        });

        if (hint) {
            hint.innerHTML = supported
                ? 'Plusieurs fichiers cochés sont livrés dans une archive ZIP. Le PDF embarqué est identique au PDF autonome.'
                : 'Représentation lisible non encore disponible pour ce cas : seule la facture UBL est générée.';
        }
        GeneratorUI.syncGenerateLabel();
    },

    // Libelle du bouton, aligne sur ce qui sera reellement telecharge.
    syncGenerateLabel: function() {
        var btn = document.getElementById('btn-generate');
        if (!btn || typeof UBLGenerator === 'undefined') return;

        var usecase = document.getElementById('usecase').value;
        var cfg = UBLGenerator.caseConfig[usecase] || {};
        var label;

        if (UBLGenerator.NO_INVOICE_CASES[usecase]) {
            btn.innerHTML = '<span class="gen-btn-icon">🚫</span> Aucune facture à produire';
            return;
        }

        if (cfg.zip) {
            label = 'Télécharger le pack ZIP';
        } else {
            var opts = UBLGenerator.getArtifactOptions(usecase);
            // Les annexes ajoutent trois fichiers : la variante UBL a trois
            // pieces jointes, le bon de commande et le bon de livraison.
            // Les annexes ajoutent trois fichiers ; le CII en ajoute un, et un
            // second lorsque les pieces jointes sont demandees.
            var count = (opts.ubl ? 1 : 0) + (opts.ublWithPdf ? 1 : 0) + (opts.pdf ? 1 : 0) +
                (opts.annexes ? 3 : 0) + (opts.cii ? 1 : 0) + (opts.cii && opts.annexes ? 1 : 0) +
                (opts.facturx ? 1 : 0);
            if (count > 1) label = 'Télécharger le ZIP (' + count + ' fichiers)';
            else if (opts.pdf) label = 'Télécharger le PDF lisible';
            else label = 'Télécharger la facture UBL';
        }
        btn.innerHTML = '<span class="gen-btn-icon">📥</span> ' + label;
    },

    initArtifactOptions: function() {
        ['opt-ubl', 'opt-ubl-pdf', 'opt-pdf', 'opt-annexes', 'opt-cii', 'opt-facturx'].forEach(function(id) {
            var input = document.getElementById(id);
            if (input) input.addEventListener('change', function() { GeneratorUI.syncGenerateLabel(); });
        });
    },

    updateInfoBox: function() {
        var usecase = document.getElementById('usecase').value;
        var theory = window.APP_DATA.pedagogy[usecase];
        if (!theory) return;

        document.getElementById('theory-content').innerHTML =
            '<span class="gen-badge">' + theory.badge + '</span>' +
            '<h3 class="gen-theory-title">' + theory.title + '</h3>' +
            '<div class="gen-theory-body">' +
                '<p>' + theory.desc1 + '</p>' +
                '<p>' + theory.desc2 + '</p>' +
            '</div>';

        document.getElementById('info-text').innerHTML = theory.info;

        var cardThird = document.getElementById('card-thirdparty');
        if (cardThird) {
            var needsThird = CASES_WITH_THIRDPARTY.indexOf(usecase) !== -1;
            cardThird.classList.toggle('hidden', !needsThird);
        }

        GeneratorUI.syncArtifactOptions(usecase);

        document.getElementById('success-msg').classList.add('hidden');
    },

    showSuccess: function(fileName) {
        var msg = document.getElementById('success-msg');
        document.getElementById('filename-display').innerText = fileName;
        msg.classList.remove('hidden');
    }
};

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    Promise.all([
        fetch('./data/pedagogy.json').then(function(r) { return r.json(); }),
        fetch('./data/companies.json').then(function(r) { return r.json(); })
    ])
    .then(function(results) {
        window.APP_DATA = {
            pedagogy: results[0],
            companies: results[1]
        };

        GeneratorUI.populateSelects();
        GeneratorUI.initArtifactOptions();
        GeneratorUI.updateInfoBox();
        GeneratorUI.initTabs();
        GeneratorUI.initTemplateDownload();
        GeneratorUI.initFileUploads();

        document.getElementById('usecase').addEventListener('change', function() {
            GeneratorUI.updateWithFade();
        });
        document.getElementById('btn-generate').addEventListener('click', function() {
            UBLGenerator.generateFile();
        });
    })
    .catch(function(error) {
        console.error('Erreur chargement donnees :', error);
    });
});

var UIManager = {
    showSuccess: function(fileName) { GeneratorUI.showSuccess(fileName); }
};
