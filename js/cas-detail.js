/**
 * CAS-DETAIL.JS — Rendu page détail + Diagramme de séquence SVG
 */
document.addEventListener('DOMContentLoaded', function() {

    // Get case ID from URL
    var params = new URLSearchParams(window.location.search);
    var caseId = params.get('id');
    if (!caseId) { window.location.href = './cas-usage.html'; return; }

    // Load JSON
    fetch('./data/cas-usage.json')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var cas = data.cases.find(function(c) { return c.id === caseId; });
            if (!cas) { window.location.href = './cas-usage.html'; return; }

            var caseIndex = data.cases.indexOf(cas);
            var prevCase = caseIndex > 0 ? data.cases[caseIndex - 1] : null;
            var nextCase = caseIndex < data.cases.length - 1 ? data.cases[caseIndex + 1] : null;
            var cat = data.categories[cas.category] || {};
            var actors = cas.actors || data.meta.baseActors;

            renderHero(cas, cat);
            renderPrinciple(cas);
            renderDiagram(actors, cas.steps || []);
            renderAttention(cas);
            renderBtFields(cas);
            renderStatuses(cas);
            renderRelated(cas, data);
            renderNav(prevCase, nextCase);
        })
        .catch(function(err) {
            console.error(err);
            document.getElementById('case-principle').innerHTML =
                '<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content">Erreur de chargement.</div></div>';
        });

    // =====================
    // RENDERERS
    // =====================

    function renderHero(cas, cat) {
        document.title = 'Cas ' + cas.num + ' — ' + cas.title + ' | E-Invoicing Academy';
        document.getElementById('page-title').textContent = document.title;
        document.getElementById('bc-title').textContent = 'Cas ' + cas.num;
        document.getElementById('case-badge').textContent = cat.icon + ' ' + cat.label + ' — Complexité ' + '●'.repeat(cas.complexity) + '○'.repeat(3 - cas.complexity);
        document.getElementById('case-title').textContent = 'Cas n°' + cas.num + ' — ' + cas.title;
        document.getElementById('case-subtitle').textContent = cas.subtitle || '';
    }

    function renderPrinciple(cas) {
        var html = '<div class="cudet-principle">' + cas.principle + '</div>';
        if (cas.inScope === false) {
            html += '<div class="callout callout--warning"><div class="callout-icon">🚫</div>' +
                '<div class="callout-content">Ce cas est <strong>hors du champ</strong> de la facturation électronique et du e-reporting.</div></div>';
        }
        document.getElementById('case-principle').innerHTML = html;
    }

    function renderAttention(cas) {
        var pts = cas.attentionPoints || [];
        if (pts.length === 0) {
            document.getElementById('attention').style.display = 'none';
            return;
        }
        document.getElementById('case-attention').innerHTML = pts.map(function(p) {
            return '<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content">' + p + '</div></div>';
        }).join('');
    }

    function renderBtFields(cas) {
        var fields = cas.btFields || [];
        if (fields.length === 0) {
            document.getElementById('technique').style.display = 'none';
            return;
        }
        var html = '<div class="comparison-table"><table>' +
            '<thead><tr><th>Champ</th><th>Nom</th><th>Valeur / Note</th></tr></thead><tbody>';
        fields.forEach(function(f) {
            html += '<tr><td><strong>' + f.bt + '</strong></td><td>' + f.name + '</td><td>' + (f.note || '—') + '</td></tr>';
        });
        html += '</tbody></table></div>';
        document.getElementById('case-bt-fields').innerHTML = html;
    }

    function renderStatuses(cas) {
        var statuses = cas.statuses || [];
        if (statuses.length === 0) {
            document.getElementById('statuts').style.display = 'none';
            return;
        }
        var statusColors = {
            'Déposée': '#6b7280', 'Émise': '#0ea5e9', 'Reçue': '#8b5cf6',
            'Mise à disposition': '#6366f1', 'Acceptée': '#10b981', 'Refusée': '#ef4444',
            'Encaissée': '#059669', 'Payée': '#059669', 'Rejetée': '#ef4444',
            'Litige': '#f59e0b', 'Suspendue': '#f59e0b', 'Affacturée': '#8b5cf6',
            'Paiement transmis': '#3b82f6'
        };
        document.getElementById('case-statuses').innerHTML =
            '<div class="cudet-statuses">' + statuses.map(function(s) {
                var color = statusColors[s] || '#6b7280';
                return '<span class="cudet-status" style="--status-color: ' + color + '">' + s + '</span>';
            }).join('<span class="cudet-status-arrow">→</span>') + '</div>';
    }

    function renderRelated(cas, data) {
        var related = cas.relatedCases || [];
        if (related.length === 0) { document.getElementById('case-related').innerHTML = ''; return; }
        var html = '<div class="cudet-related"><h4>Cas liés</h4><div class="cudet-related-grid">';
        related.forEach(function(rid) {
            var rc = data.cases.find(function(c) { return c.id === rid; });
            if (rc) {
                html += '<a href="./cas-detail.html?id=' + rc.id + '" class="cudet-related-card">' +
                    '<span class="cudet-related-num">' + rc.num + '</span>' +
                    '<span>' + rc.title + '</span></a>';
            }
        });
        html += '</div></div>';
        document.getElementById('case-related').innerHTML = html;
    }

    function renderNav(prev, next) {
        var navHtml = '';
        if (prev) {
            navHtml += '<a href="./cas-detail.html?id=' + prev.id + '" class="nav-prev">' +
                '<span class="nav-label">Cas précédent</span>' +
                '<span class="nav-title">← Cas ' + prev.num + ' — ' + prev.title + '</span></a>';
            document.getElementById('nav-prev-side').href = './cas-detail.html?id=' + prev.id;
            document.getElementById('nav-prev-side').textContent = '← Cas ' + prev.num;
        }
        if (next) {
            navHtml += '<a href="./cas-detail.html?id=' + next.id + '" class="nav-next">' +
                '<span class="nav-label">Cas suivant</span>' +
                '<span class="nav-title">Cas ' + next.num + ' — ' + next.title + ' →</span></a>';
            document.getElementById('nav-next-side').href = './cas-detail.html?id=' + next.id;
            document.getElementById('nav-next-side').textContent = 'Cas ' + next.num + ' →';
        }
        document.getElementById('case-nav-bottom').innerHTML = navHtml ||
            '<a href="./cas-usage.html" class="nav-prev"><span class="nav-label">Retour</span><span class="nav-title">← Tous les cas</span></a>';
    }

    // =====================
    // SVG SEQUENCE DIAGRAM
    // =====================
    function renderDiagram(actors, steps) {
        var wrap = document.getElementById('diagram-wrap');
        if (!steps || steps.length === 0) {
            wrap.innerHTML = '<div class="callout callout--info"><div class="callout-icon">ℹ️</div><div class="callout-content">Ce cas ne comporte pas de diagramme de séquence spécifique. Il suit le flux nominal standard.</div></div>';
            return;
        }

        var n = actors.length;
        var pad = 60;
        var colW = (940 - pad * 2) / (n - 1);
        var headerH = 70;
        var stepH = 56;
        var totalH = headerH + steps.length * stepH + 40;

        var typeColors = {
            doc: '#0b2046', flux: '#00a7e1', status: '#f59e0b',
            pay: '#10b981', reject: '#ef4444', info: '#6b7280'
        };
        var typeDash = {
            doc: '', flux: '', status: '6,4', pay: '', reject: '4,4', info: '2,4'
        };

        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ' + totalH + '" class="cudet-svg">';

        // Background
        svg += '<rect width="960" height="' + totalH + '" rx="16" fill="#fafbfc" stroke="#e5e7eb" stroke-width="1"/>';

        // Actor columns
        actors.forEach(function(actor, i) {
            var x = pad + i * colW;
            // Lifeline
            svg += '<line x1="' + x + '" y1="' + (headerH + 5) + '" x2="' + x + '" y2="' + (totalH - 20) + '" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>';
            // Header box
            var boxW = Math.min(colW - 10, 120);
            svg += '<rect x="' + (x - boxW/2) + '" y="12" width="' + boxW + '" height="40" rx="10" fill="#0b2046"/>';
            svg += '<text x="' + x + '" y="38" text-anchor="middle" fill="white" font-size="11" font-weight="700" font-family="Inter, sans-serif">' + actor + '</text>';
        });

        // Steps
        steps.forEach(function(step, i) {
            var y = headerH + 15 + i * stepH;
            var x1 = pad + step.f * colW;
            var x2 = pad + step.t * colW;
            var color = typeColors[step.c] || '#6b7280';
            var dash = typeDash[step.c] || '';
            var dir = x2 > x1 ? 1 : -1;
            var arrowX = x2 - dir * 8;

            // Arrow line
            svg += '<g class="cudet-step" data-step="' + i + '">';
            svg += '<line x1="' + x1 + '" y1="' + y + '" x2="' + arrowX + '" y2="' + y + '" stroke="' + color + '" stroke-width="2.5" ' + (dash ? 'stroke-dasharray="' + dash + '"' : '') + ' stroke-linecap="round"/>';

            // Arrowhead
            svg += '<polygon points="' + x2 + ',' + y + ' ' + (x2 - dir * 10) + ',' + (y - 5) + ' ' + (x2 - dir * 10) + ',' + (y + 5) + '" fill="' + color + '"/>';

            // Step number circle
            var circleX = (x1 + x2) / 2;
            svg += '<circle cx="' + circleX + '" cy="' + y + '" r="12" fill="white" stroke="' + color + '" stroke-width="2"/>';
            svg += '<text x="' + circleX + '" y="' + (y + 4) + '" text-anchor="middle" fill="' + color + '" font-size="10" font-weight="800" font-family="Inter, sans-serif">' + (i + 1) + '</text>';

            // Label
            var labelY = y - 16;
            svg += '<text x="' + circleX + '" y="' + labelY + '" text-anchor="middle" fill="#374151" font-size="10" font-weight="600" font-family="Inter, sans-serif">' + step.l + '</text>';

            svg += '</g>';
        });

        svg += '</svg>';
        wrap.innerHTML = svg;
    }
});