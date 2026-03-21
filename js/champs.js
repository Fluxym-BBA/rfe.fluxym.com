/**
 * CHAMPS.JS — Page interactive des champs BT/BG + TT/TG/TB (e-reporting)
 * Charge 4 JSON, gère 2 onglets, filtres, accordéons, deep linking
 */
document.addEventListener('DOMContentLoaded', function () {

    var DATA_EINV = {};
    var DATA_EREP = {};
    var DATA = {};
    var currentTab = 'einvoicing';
    var filtersbound = false;

    // ═══ LOAD ALL JSON FILES ═══
    Promise.all([
        fetch('./data/rfe_01_meta.json').then(function (r) { return r.json(); }),
        fetch('./data/rfe_02_regles.json').then(function (r) { return r.json(); }),
        fetch('./data/rfe_03_champs.json').then(function (r) { return r.json(); }),
        fetch('./data/rfe_04_ereporting.json').then(function (r) { return r.json(); })
    ])
    .then(function (parts) {
        DATA_EINV = Object.assign({}, parts[0], parts[1], parts[2]);
        DATA_EREP = parts[3];
        DATA_EREP.legalReferences = DATA_EINV.legalReferences || {};
        // AJOUTER ICI : Aplatir les groupes imbriqués du e-reporting
        flattenBlocks(DATA_EREP);
        DATA = DATA_EINV;
        init();
    })
    .catch(function (err) {
        console.error('❌ Erreur chargement:', err);
        document.getElementById('champs-results').innerHTML =
            '<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content">Erreur : <code>' + err.message + '</code></div></div>';
    });

    // ═══ INIT ═══
    function init() {
        // Bind tabs
        document.querySelectorAll('.ch-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                switchTab(this.dataset.tab);
            });
        });

        populateBlockFilter();
        renderCounters();
        renderBlocks(DATA.blocks);
        bindFilters();
        bindSearch();
        handleDeepLink();
    }

    // ═══ TAB SWITCHING ═══
    function switchTab(tab) {
        currentTab = tab;
        DATA = tab === 'einvoicing' ? DATA_EINV : DATA_EREP;

        // UI tabs
        document.querySelectorAll('.ch-tab').forEach(function (t) {
            t.classList.remove('ch-tab--active');
        });
        document.querySelector('[data-tab="' + tab + '"]').classList.add('ch-tab--active');

        // Show/hide sub-flow info
        var sfInfo = document.getElementById('subflow-info');
        if (tab === 'ereporting' && DATA_EREP.subFlows) {
            var html = '<div class="ch-subflows">';
            Object.keys(DATA_EREP.subFlows).forEach(function (key) {
                var sf = DATA_EREP.subFlows[key];
                html += '<div class="ch-subflow-card">';
                html += '<span class="ch-subflow-id">Flux ' + key + '</span>';
                html += '<strong>' + sf.name + '</strong>';
                html += '<p>' + sf.description + '</p>';
                html += '</div>';
            });
            html += '</div>';
            sfInfo.innerHTML = html;
            sfInfo.style.display = 'block';
        } else {
            sfInfo.style.display = 'none';
        }

        // Update badge
        var badge = document.getElementById('scope-badge');
        if (tab === 'einvoicing') {
            badge.textContent = '📄 E-invoicing — Flux F1/F2 — Champs BT/BG (EN 16931)';
            badge.className = 'ch-scope-badge ch-scope--einv';
        } else {
            badge.textContent = '📡 E-reporting — Flux F10 — Champs TT/TG/TB (DGFIP)';
            badge.className = 'ch-scope-badge ch-scope--erep';
        }

        // Reset search
        document.getElementById('champs-search').value = '';
        document.getElementById('filter-mandatory').value = '';
        document.getElementById('filter-format').value = '';
        document.getElementById('filter-type').value = '';

        populateBlockFilter();
        renderCounters();
        applyFilters();
    }

    // ═══ COUNTERS ═══
    function renderCounters() {
        var totalFields = 0;
        var mandatory = 0;
        (DATA.blocks || []).forEach(function (b) {
            (b.fields || []).forEach(function (f) {
                totalFields++;
                if (f.mandatory) mandatory++;
            });
        });
        document.getElementById('count-total').textContent = totalFields;
        document.getElementById('count-blocks').textContent = (DATA.blocks || []).length;
        document.getElementById('count-rules').textContent = Object.keys(DATA.rules || {}).length;
        document.getElementById('count-legal').textContent = Object.keys(DATA.legalReferences || {}).length;
        document.getElementById('stat-blocks').textContent = (DATA.blocks || []).length;
        document.getElementById('stat-visible').textContent = totalFields;
        document.getElementById('stat-mandatory').textContent = mandatory;
    }

    // ═══ POPULATE BLOCK FILTER ═══
    function populateBlockFilter() {
        var sel = document.getElementById('filter-block');
        // Reset options (garder uniquement la première)
        while (sel.options.length > 1) {
            sel.removeChild(sel.options[1]);
        }
        sel.value = '';
        (DATA.blocks || []).forEach(function (b) {
            var opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = b.id + ' — ' + (b.name || '');
            sel.appendChild(opt);
        });
    }

    // ═══ RENDER BLOCKS ═══
    function renderBlocks(blocks) {
        var container = document.getElementById('champs-results');
        var html = '';
        var visibleCount = 0;

        (blocks || []).forEach(function (block) {
            var fields = getFilteredFields(block.fields || []);
            if (fields.length === 0) return;
            visibleCount += fields.length;

            html += '<div class="ch-block" id="block-' + block.id + '">';
            html += '<div class="ch-block-header" onclick="this.parentElement.classList.toggle(\'ch-open\')">';
            html += '<div class="ch-block-title">';
            html += '<span class="ch-block-id">' + block.id + '</span>';
            html += '<span>' + (block.name || '') + '</span>';
            html += '<span class="ch-block-count">' + fields.length + ' champ' + (fields.length > 1 ? 's' : '') + '</span>';
            html += '</div>';
            html += '<span class="ch-block-chevron">▸</span>';
            html += '</div>';

            html += '<div class="ch-block-body">';
            if (block.description) {
                html += '<p class="ch-block-desc">' + block.description + '</p>';
            }

            fields.forEach(function (field) {
                html += renderField(field);
            });

            html += '</div></div>';
        });

        if (visibleCount === 0) {
            html = '<div class="callout callout--info"><div class="callout-icon">🔍</div><div class="callout-content">Aucun champ ne correspond à vos filtres.</div></div>';
        }

        container.innerHTML = html;
        document.getElementById('stat-visible').textContent = visibleCount;
    }

    // ═══ RENDER FIELD ═══
    function renderField(f) {
        // Valeurs par défaut
        var desc = f.description || '';
        var type = f.type || 'Texte';
        var cardinality = f.cardinality || '—';
        var rules = f.rules || [];
        var legalRefs = f.legalRefs || [];
        var tips = f.tips || '';
        var values = f.values || null;

        var html = '<div class="ch-field" id="field-' + f.id + '">';

        // Header
        html += '<div class="ch-field-header" onclick="this.parentElement.classList.toggle(\'ch-field-open\')">';
        html += '<div class="ch-field-main">';
        html += '<span class="ch-field-id">' + f.id + '</span>';
        html += '<span class="ch-field-name">' + (f.name || '') + '</span>';
        if (f.mandatory) {
            html += '<span class="ch-badge ch-badge--mandatory">Obligatoire</span>';
        } else {
            html += '<span class="ch-badge ch-badge--optional">Optionnel</span>';
        }
        html += '<span class="ch-badge ch-badge--type">' + type + '</span>';
        if (f.format === 'extended') {
            html += '<span class="ch-badge ch-badge--extended">Étendu</span>';
        }
        // Sub-flows badge (e-reporting)
        if (f.subFlows && f.subFlows.length > 0) {
            html += '<span class="ch-badge ch-badge--subflow">' + f.subFlows.join(', ') + '</span>';
        }
        // BT equivalent badge (e-reporting)
        if (f.btEquivalent) {
            html += '<span class="ch-badge ch-badge--btequiv">≈ ' + f.btEquivalent + '</span>';
        }
        html += '</div>';
        html += '<span class="ch-field-chevron">▸</span>';
        html += '</div>';

        // Body (hidden by default)
        html += '<div class="ch-field-body">';
        if (desc) {
            html += '<p class="ch-field-desc">' + desc + '</p>';
        }

        // Contraintes
        html += '<div class="ch-section"><h5>📏 Contraintes</h5>';
        html += '<div class="ch-props">';
        html += '<div class="ch-prop"><span>Cardinalité</span><strong>' + cardinality + '</strong></div>';
        if (f.maxLength) html += '<div class="ch-prop"><span>Longueur max</span><strong>' + f.maxLength + ' car.</strong></div>';
        if (f.truncatedTo) html += '<div class="ch-prop"><span>Tronqué à</span><strong>' + f.truncatedTo + ' car. (flux 1)</strong></div>';
        if (f.formatDetail) html += '<div class="ch-prop"><span>Format</span><strong>' + f.formatDetail + '</strong></div>';
        if (f.example) html += '<div class="ch-prop"><span>Exemple</span><code>' + f.example + '</code></div>';
        if (f.xPath) html += '<div class="ch-prop"><span>XPath</span><code>' + f.xPath + '</code></div>';
        html += '</div></div>';

        // BT Equivalent detail (e-reporting)
        if (f.btEquivalent) {
            html += '<div class="ch-tips"><span class="ch-tips-icon">🔗</span><span>Correspondance e-invoicing : <a href="./champs.html#field-' + f.btEquivalent + '"><strong>' + f.btEquivalent + '</strong></a></span></div>';
        }

        // Valeurs autorisées
        if (values && typeof values === 'object') {
            html += '<div class="ch-section"><h5>📋 Valeurs autorisées</h5>';
            html += '<div class="ch-values-table"><table>';
            html += '<thead><tr><th>Code</th><th>Libellé</th></tr></thead><tbody>';
            Object.keys(values).forEach(function (code) {
                html += '<tr><td><code>' + code + '</code></td><td>' + values[code] + '</td></tr>';
            });
            html += '</tbody></table></div></div>';
        }

        // Règles associées
        if (rules.length > 0) {
            html += '<div class="ch-section"><h5>📐 Règles de validation</h5>';
            html += '<div class="ch-rules">';
            rules.forEach(function (ruleId) {
                var rule = (DATA.rules || {})[ruleId];
                if (rule) {
                    var sevClass = rule.severity === 'Bloquant' ? 'ch-sev--bloquant' : rule.severity === 'Non-bloquant' ? 'ch-sev--warning' : 'ch-sev--info';
                    html += '<div class="ch-rule">';
                    html += '<div class="ch-rule-header">';
                    html += '<span class="ch-rule-id">' + ruleId + '</span>';
                    html += '<span class="ch-badge ' + sevClass + '">' + (rule.severity || 'Info') + '</span>';
                    html += '<span class="ch-rule-level">' + (rule.level || '') + '</span>';
                    html += '</div>';
                    html += '<p class="ch-rule-desc">' + (rule.description || '') + '</p>';
                    if (rule.explanation) html += '<p class="ch-rule-explain">💡 ' + rule.explanation + '</p>';
                    html += '</div>';
                } else {
                    html += '<div class="ch-rule"><span class="ch-rule-id">' + ruleId + '</span><span class="ch-rule-desc" style="color:#94a3b8;margin-left:8px;">Règle non documentée</span></div>';
                }
            });
            html += '</div></div>';
        }

        // Références juridiques
        if (legalRefs.length > 0) {
            html += '<div class="ch-section"><h5>⚖️ Références juridiques</h5>';
            html += '<div class="ch-legal-refs">';
            legalRefs.forEach(function (refId) {
                var ref = (DATA.legalReferences || {})[refId];
                if (ref) {
                    html += '<div class="ch-legal-ref">';
                    html += '<div class="ch-legal-header">';
                    html += '<span class="ch-legal-id">' + refId + '</span>';
                    html += '<span class="ch-legal-short">' + (ref.shortName || '') + '</span>';
                    html += '</div>';
                    html += '<p class="ch-legal-type">📖 ' + (ref.type || '') + ' — Émis par : <strong>' + (ref.issuer || '') + '</strong></p>';
                    html += '<p class="ch-legal-explain">' + (ref.explanation || '') + '</p>';
                    if (ref.impact) html += '<p class="ch-legal-impact">⚡ <strong>Impact :</strong> ' + ref.impact + '</p>';
                    if (ref.url) html += '<a href="' + ref.url + '" target="_blank" class="ch-legal-link">🔗 Voir le texte officiel</a>';
                    html += '</div>';
                }
            });
            html += '</div></div>';
        }

        // Tips
        if (tips) {
            html += '<div class="ch-tips"><span class="ch-tips-icon">💡</span><span>' + tips + '</span></div>';
        }

        html += '</div></div>';
        return html;
    }

    // ═══ FILTERS ═══
    function getFilteredFields(fields) {
        var search = (document.getElementById('champs-search').value || '').toLowerCase();
        var mandatoryFilter = document.getElementById('filter-mandatory').value;
        var formatFilter = document.getElementById('filter-format').value;
        var typeFilter = document.getElementById('filter-type').value;

        return fields.filter(function (f) {
            if (search) {
                var haystack = ((f.id || '') + ' ' + (f.name || '') + ' ' + (f.description || '') + ' ' + (f.tips || '')).toLowerCase();
                if (haystack.indexOf(search) === -1) return false;
            }
            if (mandatoryFilter && String(!!f.mandatory) !== mandatoryFilter) return false;
            if (formatFilter && f.format !== formatFilter) return false;
            if (typeFilter && f.type !== typeFilter) return false;
            return true;
        });
    }

    function applyFilters() {
        var blockFilter = document.getElementById('filter-block').value;
        var blocks = DATA.blocks || [];
        if (blockFilter) {
            blocks = blocks.filter(function (b) { return b.id === blockFilter; });
        }
        renderBlocks(blocks);
    }

    function bindFilters() {
        if (filtersbound) return;
        filtersbound = true;
        ['filter-block', 'filter-mandatory', 'filter-format', 'filter-type'].forEach(function (id) {
            document.getElementById(id).addEventListener('change', applyFilters);
        });
    }

    function bindSearch() {
        var searchInput = document.getElementById('champs-search');
        var timer;
        searchInput.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(applyFilters, 250);
        });
    }

    // ═══ DEEP LINKING ═══
    function handleDeepLink() {
        var hash = window.location.hash;
        if (!hash || !hash.startsWith('#field-')) return;

        var fieldId = hash.replace('#field-', '');
        var fieldEl = document.getElementById('field-' + fieldId);
        if (!fieldEl) return;

        // Ouvrir le bloc parent
        var block = fieldEl.closest('.ch-block');
        if (block) block.classList.add('ch-open');

        // Ouvrir le champ
        fieldEl.classList.add('ch-field-open');

        // Scroller vers le champ
        setTimeout(function () {
            fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            fieldEl.style.boxShadow = '0 0 0 3px #0284c7';
            setTimeout(function () { fieldEl.style.boxShadow = ''; }, 2000);
        }, 300);
    }

     // ═══ FLATTEN NESTED GROUPS ═══
    // Transforme les groups imbriqués en blocs plats pour l'affichage
    function flattenBlocks(data) {
        if (!data.blocks) return;
        var flatBlocks = [];

        function extractFromBlock(block, parentName) {
            // Créer un bloc plat avec les fields directs
            var flatBlock = {
                id: block.id,
                name: block.name || '',
                description: block.description || '',
                subFlows: block.subFlows || [],
                fields: (block.fields || []).slice() // copie
            };

            // Extraire les fields de chaque group et les ajouter comme blocs séparés
            if (block.groups && block.groups.length > 0) {
                block.groups.forEach(function (group) {
                    var groupBlock = {
                        id: group.id,
                        name: group.name || '',
                        description: group.description || (group.btEquivalent ? '≈ ' + group.btEquivalent + ' en e-invoicing' : ''),
                        subFlows: group.subFlows || [],
                        fields: (group.fields || []).slice()
                    };

                    // Récursion : si le group a des sous-groups
                    if (group.groups && group.groups.length > 0) {
                        group.groups.forEach(function (subGroup) {
                            var subBlock = {
                                id: subGroup.id,
                                name: subGroup.name || '',
                                description: subGroup.description || (subGroup.btEquivalent ? '≈ ' + subGroup.btEquivalent + ' en e-invoicing' : ''),
                                subFlows: subGroup.subFlows || [],
                                fields: (subGroup.fields || []).slice()
                            };
                            // Encore un niveau ?
                            if (subGroup.groups) {
                                subGroup.groups.forEach(function (sg) {
                                    subBlock.fields = subBlock.fields.concat(sg.fields || []);
                                });
                            }
                            if (subBlock.fields.length > 0) flatBlocks.push(subBlock);
                        });
                    }

                    if (groupBlock.fields.length > 0) flatBlocks.push(groupBlock);
                });
            }

            if (flatBlock.fields.length > 0) flatBlocks.push(flatBlock);
        }

        data.blocks.forEach(function (block) {
            extractFromBlock(block);
        });

        data.blocks = flatBlocks;
    }


});