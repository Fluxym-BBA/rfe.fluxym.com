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
                    </ul>
                </li>
                <li class="nav-dropdown">
                    <a href="#" class="nav-link nav-link--dropdown nav-link--disabled">Approfondir <span class="nav-arrow">▾</span></a>
                    <ul class="nav-submenu">
                        <li><span class="nav-coming">Bientôt disponible</span></li>
                    </ul>
                </li>
                <li><a href="#" class="nav-link nav-link--disabled">Cas d'usage</a></li>
            </ul>
        </div>`;
    },

    renderFooter() {
        const footer = document.getElementById('main-footer');
        if (!footer) return;
        footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-grid">
                <div class="footer-col">
                    <div class="footer-brand">
                        <img src="./assets/fluxym_logo_2018_sansdescriptif_blanc.png" alt="Fluxym" class="footer-logo">
                        <span class="footer-academy">E-Invoicing Academy</span>
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
                    <h4>À venir</h4>
                    <ul>
                        <li><a href="#">Écosystème</a></li>
                        <li><a href="#">Flux & Cycle de vie</a></li>
                        <li><a href="#">Cas d'usage</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Sources officielles</h4>
                    <ul>
                        <li><a href="https://www.impots.gouv.fr/facturation-electronique" target="_blank" rel="noopener">DGFiP ↗</a></li>
                        <li><a href="https://www.chorus-pro.gouv.fr" target="_blank" rel="noopener">Chorus Pro ↗</a></li>
                        <li><a href="https://fnfe-mpe.org" target="_blank" rel="noopener">FNFE-MPE ↗</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© ${new Date().getFullYear()} Fluxym — E-Invoicing Academy · Basé sur les spécifications DGFiP v3.1 et normes AFNOR.</p>
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

    // Glassmorphism effect on scroll
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