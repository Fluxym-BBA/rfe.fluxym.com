/**
 * GENERATOR-UI.JS v2
 * Adapté pour 48 cas d'usage avec groupement par catégorie.
 */

const GeneratorUI = {

    // Mapping des catégories pour les optgroup
    categories: [
        { key: "nominal", label: "⚙️ Cas Nominal", cases: ["nominal", "nominal-rejet-emission", "nominal-non-transmise", "nominal-rejet-reception", "nominal-refus", "nominal-litige-avoir", "nominal-litige-rectificative"] },
        { key: "standard", label: "📦 Standard", cases: ["1", "31"] },
        { key: "paiement", label: "💳 Paiement & Tiers", cases: ["2", "3", "4", "5", "6", "7"] },
        { key: "affacturage", label: "🏦 Affacturage", cases: ["8", "9", "10"] },
        { key: "intermediaire", label: "🔀 Intermédiaires", cases: ["11", "12", "15", "16"] },
        { key: "soustraitance", label: "🏗️ Sous/Co-traitance", cases: ["13", "14"] },
        { key: "marketplace", label: "🛒 Marketplace", cases: ["17a", "17b"] },
        { key: "mandat", label: "📝 Mandat & Auto-fact.", cases: ["19a", "19b", "23"] },
        { key: "acompte", label: "💰 Acompte & Escompte", cases: ["20", "21", "22a", "22b"] },
        { key: "special", label: "⭐ Cas spécifiques", cases: ["18", "24", "25", "26", "27", "28", "29", "30", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42"] },
        { key: "packs", label: "📦 Packs de test (ZIP)", cases: ["A", "B"] }
    ],

    populateSelects: function() {
        var data = window.APP_DATA;

        // 1. Menu cas d'usage avec optgroup
        var usecaseSelect = document.getElementById('usecase');
        usecaseSelect.innerHTML = '';

        this.categories.forEach(function(cat) {
            var group = document.createElement('optgroup');
            group.label = cat.label;

            cat.cases.forEach(function(key) {
                if (data.pedagogy[key]) {
                    var option = document.createElement('option');
                    option.value = key;
                    option.textContent = data.pedagogy[key].label;
                    group.appendChild(option);
                }
            });

            if (group.children.length > 0) {
                usecaseSelect.appendChild(group);
            }
        });

        // 2. Paramètres avancés (Fournisseur, Acheteur, Factor)
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
                        return '<option value="' + b.id + '">' + b.name + ' (' + b.siren + ')</option>';
                    }).join('') +
                '</select>' +
            '</div>' +
            '<div class="gen-field hidden" id="group-factor">' +
                '<label>Factor (Affacturage)</label>' +
                '<select id="adv-factor">' +
                    data.companies.factors.map(function(f) {
                        return '<option value="' + f.id + '">' + f.name + '</option>';
                    }).join('') +
                '</select>' +
            '</div>';

        settingsContainer.innerHTML = html;
    },

    updateWithFade: function() {
        var el = document.getElementById('theory-content');
        el.style.opacity = '0';
        setTimeout(function() {
            GeneratorUI.updateInfoBox();
            el.style.opacity = '1';
        }, 150);
    },

    updateInfoBox: function() {
        var usecase = document.getElementById('usecase').value;
        var theory = window.APP_DATA.pedagogy[usecase];
        if (!theory) return;

        // Fiche pédagogique
        document.getElementById('theory-content').innerHTML =
            '<span class="gen-badge">' + theory.badge + '</span>' +
            '<h3 class="gen-theory-title">' + theory.title + '</h3>' +
            '<div class="gen-theory-body">' +
                '<p>' + theory.desc1 + '</p>' +
                '<p>' + theory.desc2 + '</p>' +
            '</div>';

        // Résumé technique
        document.getElementById('info-text').innerHTML = theory.info;

        // Factor visibility (cas 8, 9)
        var groupFactor = document.getElementById('group-factor');
        if (groupFactor) {
            if (usecase === '8' || usecase === '9') {
                groupFactor.classList.remove('hidden');
            } else {
                groupFactor.classList.add('hidden');
            }
        }

        // Reset success
        document.getElementById('success-msg').classList.add('hidden');
    },

    showSuccess: function(fileName) {
        var msg = document.getElementById('success-msg');
        document.getElementById('filename-display').innerText = fileName;
        msg.classList.remove('hidden');
    }
};

// ========================================
// INIT
// ========================================
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
        GeneratorUI.updateInfoBox();

        document.getElementById('usecase').addEventListener('change', function() {
            GeneratorUI.updateWithFade();
        });

        document.getElementById('btn-generate').addEventListener('click', function() {
            UBLGenerator.generateFile();
        });
    })
    .catch(function(error) {
        console.error('Erreur chargement données :', error);
        document.getElementById('theory-content').innerHTML =
            '<div class="callout callout--warning">' +
                '<div class="callout-icon">⚠️</div>' +
                '<div class="callout-content"><strong>Erreur :</strong> Impossible de charger les fichiers JSON. ' +
                'Vérifiez que le projet tourne via un serveur local (Live Server).</div>' +
            '</div>';
    });
});

// Rétrocompatibilité
var UIManager = {
    showSuccess: function(fileName) {
        GeneratorUI.showSuccess(fileName);
    }
};