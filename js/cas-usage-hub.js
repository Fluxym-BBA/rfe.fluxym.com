/**
 * CAS-USAGE-HUB.JS — Hub filtrable des cas d'usage
 * Charge cas-usage.json et génère les cartes + filtres
 */
document.addEventListener('DOMContentLoaded', function() {

    var grid = document.getElementById('cuhub-grid');
    var filtersContainer = document.getElementById('cuhub-filters');
    var searchInput = document.getElementById('cuhub-search');
    var emptyMsg = document.getElementById('cuhub-empty');
    var allCases = [];
    var categories = {};

    // Load JSON
    fetch('./data/cas-usage.json')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            categories = data.categories;
            allCases = data.cases;
            renderFilters();
            renderCards(allCases);
            updateStats(allCases);
        })
        .catch(function(err) {
            console.error(err);
            grid.innerHTML = '<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content">Erreur de chargement. Vérifiez que le serveur local est actif.</div></div>';
        });

    // Render filter buttons from categories
    function renderFilters() {
        var html = '<button class="cuhub-filter active" data-cat="all">Tous</button>';
        for (var key in categories) {
            var cat = categories[key];
            html += '<button class="cuhub-filter" data-cat="' + key + '">' + cat.icon + ' ' + cat.label + '</button>';
        }
        filtersContainer.innerHTML = html;

        // Bind filter clicks
        filtersContainer.querySelectorAll('.cuhub-filter').forEach(function(btn) {
            btn.addEventListener('click', function() {
                filtersContainer.querySelectorAll('.cuhub-filter').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                applyFilters();
            });
        });
    }

    // Render case cards
    function renderCards(cases) {
        if (cases.length === 0) {
            grid.innerHTML = '';
            emptyMsg.classList.remove('hidden');
            return;
        }
        emptyMsg.classList.add('hidden');

        grid.innerHTML = cases.map(function(c) {
            var cat = categories[c.category] || { icon: '📄', label: c.category, color: 'gray' };
            var scopeClass = c.inScope === false ? 'cuhub-card--hors' : c.inScope === 'partial' ? 'cuhub-card--partial' : '';
            var complexDots = '';
            for (var i = 0; i < 3; i++) {
                complexDots += '<span class="cuhub-dot ' + (i < c.complexity ? 'cuhub-dot--on' : '') + '"></span>';
            }

            return '<a href="./cas-detail.html?id=' + c.id + '" class="cuhub-card ' + scopeClass + '">' +
                '<div class="cuhub-card-head">' +
                    '<span class="cuhub-card-num">' + c.num + '</span>' +
                    '<span class="cuhub-card-cat cuhub-card-cat--' + c.category + '">' + cat.icon + ' ' + cat.label + '</span>' +
                '</div>' +
                '<h3 class="cuhub-card-title">' + c.title + '</h3>' +
                '<p class="cuhub-card-sub">' + (c.subtitle || '') + '</p>' +
                '<div class="cuhub-card-foot">' +
                    '<div class="cuhub-card-complex">' + complexDots + '</div>' +
                    (c.inScope === false ? '<span class="cuhub-scope cuhub-scope--hors">Hors champ</span>' : '<span class="cuhub-scope cuhub-scope--in">Dans le champ</span>') +
                '</div>' +
            '</a>';
        }).join('');
    }

    // Stats
    function updateStats(cases) {
        document.getElementById('stat-total').textContent = cases.length;
        document.getElementById('stat-scope').textContent = cases.filter(function(c) { return c.inScope !== false; }).length;
        document.getElementById('stat-hors').textContent = cases.filter(function(c) { return c.inScope === false; }).length;
    }

    // Apply combined filters
    function applyFilters() {
        var activeCat = filtersContainer.querySelector('.cuhub-filter.active').dataset.cat;
        var query = (searchInput.value || '').toLowerCase().trim();

        var filtered = allCases.filter(function(c) {
            var matchCat = activeCat === 'all' || c.category === activeCat;
            var matchSearch = !query ||
                c.title.toLowerCase().indexOf(query) !== -1 ||
                (c.subtitle || '').toLowerCase().indexOf(query) !== -1 ||
                c.num.toLowerCase().indexOf(query) !== -1 ||
                (c.tags || []).join(' ').toLowerCase().indexOf(query) !== -1;
            return matchCat && matchSearch;
        });

        renderCards(filtered);
    }

    // Search
    if (searchInput) {
        var debounce;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounce);
            debounce = setTimeout(applyFilters, 200);
        });
    }
});