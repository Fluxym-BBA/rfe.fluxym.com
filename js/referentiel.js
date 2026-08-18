/**
 * REFERENTIEL.JS — Page « Référentiel & versions »
 * Source de vérité unique : data/referentiel.json
 */
const ReferentielPage = {
    data: null,

    async init() {
        try {
            const res = await fetch('./data/referentiel.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.data = (await res.json()).referentiel;
        } catch (err) {
            this.renderError(err);
            return;
        }
        this.renderHero();
        this.renderNormes();
        this.renderTelechargements();
        this.renderCouverture();
        this.renderNouveautes();
        this.renderChangelog();
    },

    renderError(err) {
        const el = document.getElementById('ref-hero-badge');
        if (el) el.textContent = `Référentiel indisponible (${err.message})`;
    },

    renderHero() {
        const d = this.data;
        const badge = document.getElementById('ref-hero-badge');
        if (badge) badge.textContent = `Socle : ${d.socleNormatif} — ${this.fmtDate(d.socleDate)}`;

        const resume = document.getElementById('ref-resume');
        if (resume) resume.textContent = d.resume;

        const cards = document.getElementById('ref-key-cards');
        if (!cards) return;
        const items = [
            { label: 'Norme de référence', value: d.socleNormatif, sub: `publiée le ${this.fmtDate(d.socleDate)}` },
            { label: 'Spécifications externes', value: `v${d.specsExternes}`, sub: 'DGFiP' },
            { label: 'Version du site', value: d.versionSite, sub: `mise à jour le ${this.fmtDate(d.dateMiseAJour)}` }
        ];
        cards.innerHTML = items.map(i => `
            <div class="ref-key-card">
                <span class="ref-key-label">${this.esc(i.label)}</span>
                <span class="ref-key-value">${this.esc(i.value)}</span>
                <span class="ref-key-sub">${this.esc(i.sub)}</span>
            </div>`).join('');
    },

    renderNormes() {
        const tb = document.getElementById('ref-normes-body');
        if (!tb) return;
        tb.innerHTML = this.data.normes.map(n => `
            <tr>
                <td><strong>${this.esc(n.code)}</strong></td>
                <td><span class="ref-version-pill">${this.esc(n.version)}</span></td>
                <td>${this.fmtDate(n.date)}</td>
                <td>${this.esc(n.titre)}</td>
                <td>${this.esc(n.usage)}</td>
            </tr>`).join('');
    },

    renderTelechargements() {
        const wrap = document.getElementById('ref-downloads');
        if (!wrap) return;
        wrap.innerHTML = this.data.telechargements.map(t => `
            <a href="${this.esc(t.url)}" target="_blank" rel="noopener"
               class="ref-dl-card${t.recommande ? ' ref-dl-card--featured' : ''}">
                <div class="ref-dl-head">
                    <span class="ref-dl-type">${this.esc(t.type)}</span>
                    ${t.recommande ? '<span class="ref-dl-flag">Recommandé</span>' : ''}
                </div>
                <h3 class="ref-dl-title">${this.esc(t.libelle)}</h3>
                <p class="ref-dl-desc">${this.esc(t.description)}</p>
                <span class="ref-dl-host">Hébergé par ${this.esc(t.hebergeur)} ↗</span>
            </a>`).join('');
    },

    renderCouverture() {
        const tb = document.getElementById('ref-couverture-body');
        if (!tb) return;
        const labels = { complet: 'Complet', partiel: 'Partiel', absent: 'Non couvert' };
        tb.innerHTML = this.data.couverture.map(c => `
            <tr>
                <td>${this.esc(c.domaine)}</td>
                <td><span class="ref-state ref-state--${this.esc(c.etat)}">${this.esc(labels[c.etat] || c.etat)}</span></td>
                <td>${this.esc(c.detail)}</td>
            </tr>`).join('');
    },

    renderNouveautes() {
        const wrap = document.getElementById('ref-nouveautes');
        if (!wrap) return;
        const labels = { traite: 'Intégré', 'en-cours': 'En cours', 'a-traiter': 'À intégrer' };
        wrap.innerHTML = this.data.nouveautesV14.map(n => `
            <div class="ref-novelty">
                <div class="ref-novelty-head">
                    <h3>${this.esc(n.sujet)}</h3>
                    <span class="ref-state ref-state--${this.esc(n.statut)}">${this.esc(labels[n.statut] || n.statut)}</span>
                </div>
                <p>${this.esc(n.detail)}</p>
            </div>`).join('');
    },

    renderChangelog() {
        const wrap = document.getElementById('ref-changelog');
        if (!wrap) return;
        wrap.innerHTML = this.data.changelog.map(c => `
            <div class="ref-log">
                <div class="ref-log-meta">
                    <span class="ref-log-version">v${this.esc(c.version)}</span>
                    <span class="ref-log-date">${this.fmtDate(c.date)}</span>
                    <span class="ref-log-socle">${this.esc(c.socle)}</span>
                </div>
                <div class="ref-log-body">
                    <h3>${this.esc(c.titre)}</h3>
                    <ul class="styled-list">
                        ${c.items.map(i => `<li>${this.esc(i)}</li>`).join('')}
                    </ul>
                </div>
            </div>`).join('');
    },

    fmtDate(iso) {
        if (!iso) return '';
        const [y, m, d] = iso.split('-');
        const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        return `${parseInt(d, 10)} ${mois[parseInt(m, 10) - 1]} ${y}`;
    },

    esc(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => ReferentielPage.init());
