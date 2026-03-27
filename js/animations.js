/**
 * ANIMATIONS.JS — Scroll reveal + Countdown + Section visibility
 */
const Animations = {
    init() {
        this.initSectionVisibility();
        this.initCountdown();
        this.initScrollReveal();
    },

    // Sections entières qui apparaissent au scroll (comme la ref)
    initSectionVisibility() {
        const sections = document.querySelectorAll('.discover-section, .tool-section');
        if (!sections.length) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        sections.forEach(s => observer.observe(s));
    },

    // Countdown timers
    initCountdown() {
        const timers = document.querySelectorAll('.countdown-timer');
        if (!timers.length) return;
        const update = () => {
            timers.forEach((timer, i) => {
                const target = new Date(timer.dataset.target).getTime();
                const diff = target - Date.now();
                const days = Math.max(0, Math.floor(diff / 86400000));
                const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
                const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
                const p = `cd${i + 1}`;
                const d = document.getElementById(`${p}-days`);
                const h = document.getElementById(`${p}-hours`);
                const m = document.getElementById(`${p}-mins`);
                if (d) d.textContent = days;
                if (h) h.textContent = String(hours).padStart(2, '0');
                if (m) m.textContent = String(mins).padStart(2, '0');
            });
        };
        update();
        setInterval(update, 60000);
    },

    // Element-level scroll reveal with stagger
    initScrollReveal() {
        const els = document.querySelectorAll(
            '.content-section, .counter-card, .discover-card, .evo-step, ' +
            '.objective-card, .europe-card, .lt-item, .mt-block, .glossary-item, ' +
            '.action-step, .brief-section, .stat-card'
        );
        if (!els.length) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        els.forEach(el => {
            el.classList.add('reveal-on-scroll');
            observer.observe(el);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Animations.init());

// ═══ SCROLL SPY — Sidebar active section tracking ═══
(function() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    if (!sidebarLinks.length) return;

    // Récupère les sections cibles
    const sections = [];
    sidebarLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const section = document.getElementById(href.substring(1));
            if (section) sections.push({ el: section, link: link });
        }
    });

    if (!sections.length) return;

    let ticking = false;

    function updateActiveLink() {
        // Hauteur du header fixe (nav)
        const offset = 120;
        const scrollY = window.scrollY || window.pageYOffset;

        let current = sections[0]; // fallback = première section

        for (let i = sections.length - 1; i >= 0; i--) {
            if (scrollY >= sections[i].el.offsetTop - offset) {
                current = sections[i];
                break;
            }
        }

        sidebarLinks.forEach(function(link) {
            link.classList.remove('active');
        });
        current.link.classList.add('active');

        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateActiveLink);
            ticking = true;
        }
    }, { passive: true });

    // Init au chargement
    updateActiveLink();
})();