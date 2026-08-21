/**
 * NAV.JS — Re·Form·E — Navigation + Footer + Scroll Spy
 * Le badge de référentiel est alimenté par data/referentiel.json (source unique).
 */
const SiteNav = {
    currentPage: window.location.pathname.split('/').pop() || 'index.html',

    init() {
        this.renderNav();
        this.renderFooter();
        this.renderReferentielBadge();
        this.setActiveLink();
        this.initMobileMenu();
        this.initScrollEffect();
        this.initScrollSpy();
    },

    renderNav() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        nav.innerHTML = `
        <div class="nav-container">
            <a href="./index.html" class="nav-logo">
                <img src="./assets/fluxym_logo_2018_sansdescriptif_blanc.png" alt="Fluxym" class="nav-logo-img" id="nav-logo-img">
                <span class="nav-logo-separator">|</span>
                <span class="nav-logo-text">Re·Form·E</span>
            </a>
            <button class="nav-toggle" aria-label="Menu">
                <span></span><span></span><span></span>
            </button>
            <ul class="nav-links">
                <li class="nav-dropdown">
                    <a href="#" class="nav-link nav-link--dropdown">Découverte <span class="nav-arrow">▾</span></a>
                    <ul class="nav-submenu">
                        <li><a href="./comprendre.html">📖 Comprendre</a></li>
                        <li><a href="./calendrier.html">📅 Calendrier</a></li>
                        <li><a href="./en-bref.html">⚡ En bref</a></li>
                    </ul>
                </li>
                <li class="nav-dropdown">
                    <a href="#" class="nav-link nav-link--dropdown">Écosystème <span class="nav-arrow">▾</span></a>
                    <ul class="nav-submenu">
                        <li><a href="./acteurs.html">👥 Les acteurs</a></li>
                        <li><a href="./plateformes-agreees.html">🏢 Plateformes agréées</a></li>
                        <li><a href="./e-invoicing.html">📨 E-invoicing</a></li>
                        <li><a href="./e-reporting.html">📊 E-reporting</a></li>
                        <li><a href="./chorus-pro.html">🏛️ Chorus Pro</a></li>
                        <li><a href="./b2g.html">🏗️ B2G / G2B</a></li>
                        <li><a href="./tva-preremplie.html">💶 TVA pré-remplie</a></li>
                        <li><a href="./peppol.html">🌍 Peppol</a></li>
                        <li><a href="./sanctions.html">⚖️ Sanctions</a></li>
                    </ul>
                </li>
                <li class="nav-dropdown">
                    <a href="#" class="nav-link nav-link--dropdown">Approfondir <span class="nav-arrow">▾</span></a>
                    <ul class="nav-submenu">
                        <li><a href="./schema-en-y.html">🔀 Schéma en Y</a></li>
                        <li><a href="./flux.html">📡 Les flux</a></li>
                        <li><a href="./cycle-de-vie.html">🔄 Cycle de vie</a></li>
                        <li><a href="./formats.html">📐 Les formats</a></li>
                        <li><a href="./regimes-tva.html">🧾 Régimes de TVA</a></li>
                    </ul>
                </li>
                <li class="nav-dropdown">
                    <a href="#" class="nav-link nav-link--dropdown">Pratique <span class="nav-arrow">▾</span></a>
                    <ul class="nav-submenu">
                        <li><a href="./champs.html">🔧 Les champs</a></li>
                        <li><a href="./cas-usage.html">📋 Cas d'usage</a></li>
                        <li><a href="./validation.html">🔍 Validation</a></li>
                        <li><a href="./technique.html">⚙️ APIs & technique</a></li>
                        <li><a href="./regles.html">📏 Les règles</a></li>
                        <li><a href="./se-preparer.html">🚀 Se préparer</a></li>
                    </ul>
                </li>
                <li class="nav-dropdown">
                    <a href="#" class="nav-link nav-link--dropdown">Ressources <span class="nav-arrow">▾</span></a>
                    <ul class="nav-submenu">
                        <li><a href="./glossaire.html">📖 Glossaire A→Z</a></li>
                        <li><a href="./faq.html">❓ FAQ</a></li>
                        <li><a href="./ressources.html">📚 Liens & outils</a></li>
                        <li><a href="./referentiel.html">🏷️ Référentiel & versions</a></li>
                    </ul>
                </li>
                <li class="nav-dropdown">
                    <a href="./outils.html" class="nav-link nav-cta">🧰 Outils <span class="nav-arrow">▾</span></a>
                    <ul class="nav-submenu">
                        <li><a href="./outils.html">🧰 Tous les outils</a></li>
                        <li><a href="./generateur.html">🏭 La Fabrique</a></li>
                        <li><a href="./validateur.html">🔍 Validateur XSD & Schematron</a></li>
                        <li><a href="./transcodification.html">🧭 Matrice de transcodification</a></li>
                        <li><a href="./tutoriels.html">🎬 Guide vidéo</a></li>
                    </ul>
                </li>
            </ul>
        </div>`;
    },

    renderFooter() {
        const footer = document.getElementById('main-footer');
        if (!footer) return;
        footer.innerHTML = `
        <div class="site-footer">
            <div class="footer-container">
                <div class="footer-grid">
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <img src="./assets/fluxym_logo_2018_sansdescriptif_blanc.png" alt="Fluxym" class="footer-logo-img" />
                            <span class="footer-title">Re·Form·E</span>
                        </div>
                        <p class="footer-desc">Un projet éducatif de <strong>Fluxym</strong>, cabinet de conseil spécialisé dans la dématérialisation des processus financiers.</p>
                    </div>
                    <div class="footer-col">
                        <h4>Découverte</h4>
                        <ul>
                            <li><a href="./comprendre.html">Comprendre</a></li>
                            <li><a href="./calendrier.html">Calendrier</a></li>
                            <li><a href="./en-bref.html">En bref</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Écosystème</h4>
                        <ul>
                            <li><a href="./acteurs.html">Les acteurs</a></li>
                            <li><a href="./plateformes-agreees.html">Plateformes agréées</a></li>
                            <li><a href="./e-invoicing.html">E-invoicing</a></li>
                            <li><a href="./e-reporting.html">E-reporting</a></li>
                            <li><a href="./chorus-pro.html">Chorus Pro</a></li>
                            <li><a href="./b2g.html">B2G / G2B</a></li>
                            <li><a href="./tva-preremplie.html">TVA pré-remplie</a></li>
                            <li><a href="./peppol.html">Peppol</a></li>
                            <li><a href="./sanctions.html">Sanctions</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Approfondir</h4>
                        <ul>
                            <li><a href="./schema-en-y.html">Schéma en Y</a></li>
                            <li><a href="./flux.html">Les flux</a></li>
                            <li><a href="./cycle-de-vie.html">Cycle de vie</a></li>
                            <li><a href="./formats.html">Les formats</a></li>
                            <li><a href="./regimes-tva.html">Régimes de TVA</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Mettre en pratique</h4>
                        <ul>
                            <li><a href="./champs.html">Les champs</a></li>
                            <li><a href="./cas-usage.html">Cas d'usage</a></li>
                            <li><a href="./validation.html">Validation</a></li>
                            <li><a href="./technique.html">APIs & technique</a></li>
                            <li><a href="./regles.html">Les règles</a></li>
                            <li><a href="./se-preparer.html">Se préparer</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Ressources</h4>
                        <ul>
                            <li><a href="./glossaire.html">Glossaire A→Z</a></li>
                            <li><a href="./faq.html">FAQ</a></li>
                            <li><a href="./ressources.html">Liens & outils</a></li>
                            <li><a href="./referentiel.html">Référentiel &amp; versions</a></li>
                            <li><a href="./outils.html">Les outils</a></li>
                            <li><a href="./generateur.html">La Fabrique</a></li>
                            <li><a href="./validateur.html">Validateur XSD &amp; Schematron</a></li>
                            <li><a href="./transcodification.html">Matrice de transcodification</a></li>
                            <li><a href="./tutoriels.html">Guide vidéo</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Sources officielles</h4>
                        <ul>
                            <li><a href="https://www.impots.gouv.fr/professionnel/facturation-electronique" target="_blank">DGFiP ↗</a></li>
                            <li><a href="https://www.boutique.afnor.org/fr-fr/norme/xp-z12012/formats-et-profils-des-messages-factures-et-statuts-de-cycle-de-vie-constit/fa301169/601641" target="_blank">AFNOR ↗</a></li>
                            <li><a href="https://chorus-pro.gouv.fr" target="_blank">Chorus Pro ↗</a></li>
                            <li><a href="https://www.fnfe-mpe.org" target="_blank">FNFE-MPE ↗</a></li>
                            <li><a href="https://piste.gouv.fr" target="_blank">PISTE ↗</a></li>
                            <li><a href="https://peppol.org" target="_blank">OpenPEPPOL ↗</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>© ${new Date().getFullYear()} Fluxym — Re·Form·E. Contenu éducatif basé sur les normes AFNOR XP Z12-012/013/014 et les spécifications externes DGFiP.</p>
                    <p><a href="./referentiel.html" class="footer-referentiel" id="footer-ref-badge">🏷️ Voir le référentiel utilisé</a></p>
                    <p class="footer-disclaimer">Ce site est un outil pédagogique. Il ne se substitue pas aux textes officiels. Consultez <a href="https://www.impots.gouv.fr/professionnel/facturation-electronique" target="_blank">impots.gouv.fr</a> pour les informations à valeur légale.</p>
                </div>
            </div>
        </div>`;
    },

    async renderReferentielBadge() {
        const badge = document.getElementById('footer-ref-badge');
        if (!badge) return;
        try {
            const res = await fetch('./data/referentiel.json');
            if (!res.ok) return;
            const ref = (await res.json()).referentiel;
            badge.textContent = `🏷️ Socle : ${ref.socleNormatif} · Specs DGFiP ${ref.specsExternes} · site v${ref.versionSite}`;
            badge.setAttribute('title', `Référentiel mis à jour le ${ref.dateMiseAJour}`);
        } catch (err) {
            /* le libellé par défaut du lien reste affiché */
        }
    },

    setActiveLink() {
        document.querySelectorAll('.nav-submenu a, .nav-links > li > a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(this.currentPage)) {
                link.classList.add('nav-link--active');
            }
        });
    },

    initMobileMenu() {
        const toggle = document.querySelector('.nav-toggle');
        const links = document.querySelector('.nav-links');
        if (!toggle || !links) return;
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('nav-toggle--open');
            links.classList.toggle('nav-links--open');
        });
    },

    initScrollEffect() {
        const nav = document.getElementById('main-nav');
        const logoImg = document.getElementById('nav-logo-img');
        if (!nav) return;

        const logoWhite = './assets/fluxym_logo_2018_sansdescriptif_blanc.png';
        const logoDark = './assets/fluxym_logo_2018_sansdescriptif_cmyk.png';

        const onScroll = () => {
            if (window.scrollY > 80) {
                nav.classList.add('scrolled');
                if (logoImg) logoImg.src = logoDark;
            } else {
                nav.classList.remove('scrolled');
                if (logoImg) logoImg.src = logoWhite;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    },

    initScrollSpy() {
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        if (sidebarLinks.length === 0) return;
        const sections = [];
        sidebarLinks.forEach(link => {
            const id = link.getAttribute('href')?.replace('#', '');
            const el = document.getElementById(id);
            if (el) sections.push({ el, link });
        });
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sidebarLinks.forEach(l => l.classList.remove('active'));
                    const match = sections.find(s => s.el === entry.target);
                    if (match) match.link.classList.add('active');
                }
            });
        }, { rootMargin: '-20% 0px -60% 0px' });
        sections.forEach(s => observer.observe(s.el));
    }
};

document.addEventListener('DOMContentLoaded', () => SiteNav.init());
