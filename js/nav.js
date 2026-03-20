/**
 * NAV.JS — Navigation glassmorphism + Footer + Scroll Spy
 */
const SiteNav = {
    currentPage: window.location.pathname.split('/').pop() || 'index.html',

    init() {
        this.renderNav();
        this.renderFooter();
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
                <span class="nav-logo-text">E-Invoicing Academy</span>
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
                        <li><a href="./flux.html">📡 Les 14 flux</a></li>
                        <li><a href="./cycle-de-vie.html">🔄 Cycle de vie</a></li>
                        <li><a href="./formats.html">📐 Les formats</a></li>
                    </ul>
                </li>
                <li class="nav-dropdown">
                    <a href="#" class="nav-link nav-link--dropdown">Pratique <span class="nav-arrow">▾</span></a>
                    <ul class="nav-submenu">
                        <li><a href="./cas-usage.html">📋 Cas d'usage</a></li>
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
                            <span class="footer-title">E-Invoicing Academy</span>
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
                            <li><a href="./e-invoicing.html">E-invoicing</a></li>
                            <li><a href="./e-reporting.html">E-reporting</a></li>
                            <li><a href="./chorus-pro.html">Chorus Pro</a></li>
                            <li><a href="./peppol.html">Peppol</a></li>
                            <li><a href="./sanctions.html">Sanctions</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Approfondir</h4>
                        <ul>
                            <li><a href="./schema-en-y.html">Schéma en Y</a></li>
                            <li><a href="./flux.html">Les 14 flux</a></li>
                            <li><a href="./cycle-de-vie.html">Cycle de vie</a></li>
                            <li><a href="./formats.html">Les formats</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Mettre en pratique</h4>
                        <ul>
                            <li><a href="./cas-usage.html">Cas d'usage</a></li>
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
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Sources officielles</h4>
                        <ul>
                            <li><a href="https://www.impots.gouv.fr/professionnel/facturation-electronique" target="_blank">DGFiP ↗</a></li>
                            <li><a href="https://chorus-pro.gouv.fr" target="_blank">Chorus Pro ↗</a></li>
                            <li><a href="https://www.fnfe-mpe.org" target="_blank">FNFE-MPE ↗</a></li>
                            <li><a href="https://piste.gouv.fr" target="_blank">PISTE ↗</a></li>
                            <li><a href="https://peppol.org" target="_blank">OpenPEPPOL ↗</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>© ${new Date().getFullYear()} Fluxym — E-Invoicing Academy. Contenu éducatif basé sur les spécifications DGFIP v3.1 et normes AFNOR XP Z12-012/013/014.</p>
                    <p class="footer-disclaimer">Ce site est un outil pédagogique. Il ne se substitue pas aux textes officiels. Consultez <a href="https://www.impots.gouv.fr/professionnel/facturation-electronique" target="_blank">impots.gouv.fr</a> pour les informations à valeur légale.</p>
                </div>
            </div>
        </div>`;
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