/**
 * TUTO-DOWNLOAD.JS — Re·Form·E — Téléchargement direct des fichiers de référence
 *
 * Problème traité : les fichiers .xsd servis par docs.oasis-open.org sont
 * renvoyés en text/xml. Un simple lien (même avec l'attribut `download`, ignoré
 * en cross-origin) ouvre donc le schéma dans le navigateur au lieu de le
 * télécharger. Ce module récupère le contenu et déclenche un vrai
 * téléchargement, avec le bon nom de fichier.
 *
 * Chaîne de repli (dans l'ordre) :
 *   1. copie locale du site        → data-local  (même origine, toujours autorisée)
 *   2. source officielle en fetch  → data-remote (nécessite CORS côté serveur)
 *   3. ouverture de l'URL officielle dans un nouvel onglet + message
 *
 * Balisage attendu :
 *   <button class="tuto-btn" data-download
 *           data-filename="UBL-Invoice-2.1.xsd"
 *           data-local="./assets/xsd/UBL-Invoice-2.1.xsd"
 *           data-remote="https://docs.oasis-open.org/.../UBL-Invoice-2.1.xsd">
 *     ⬇️ Télécharger le .xsd
 *   </button>
 */
const TutoDownload = {
    init() {
        document.querySelectorAll('[data-download]').forEach((btn) => {
            btn.addEventListener('click', (event) => this.handleClick(event, btn));
        });
    },

    async handleClick(event, btn) {
        event.preventDefault();
        if (btn.dataset.busy === 'true') return;

        const filename = btn.dataset.filename || 'fichier.xsd';
        const sources = [btn.dataset.local, btn.dataset.remote].filter(Boolean);
        const label = btn.innerHTML;

        this.setBusy(btn, true, '⏳ Récupération…');

        for (const url of sources) {
            const blob = await this.fetchBlob(url);
            if (blob) {
                this.saveBlob(blob, filename);
                this.setBusy(btn, false, '✅ Téléchargé');
                this.notify(btn, `${filename} enregistré dans vos téléchargements.`, 'ok');
                window.setTimeout(() => { btn.innerHTML = label; }, 2500);
                return;
            }
        }

        this.setBusy(btn, false, label);
        if (btn.dataset.remote) {
            this.notify(
                btn,
                `Téléchargement direct impossible depuis ce navigateur : la source officielle s'ouvre dans un nouvel onglet, enregistrez la page avec Ctrl+S (Cmd+S) sous le nom <code>${filename}</code>.`,
                'warn'
            );
            window.open(btn.dataset.remote, '_blank', 'noopener');
        }
    },

    async fetchBlob(url) {
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) return null;
            const blob = await response.blob();
            return blob.size > 0 ? blob : null;
        } catch (error) {
            return null;
        }
    },

    saveBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    setBusy(btn, busy, label) {
        btn.dataset.busy = busy ? 'true' : 'false';
        btn.disabled = busy;
        btn.innerHTML = label;
    },

    notify(btn, message, kind) {
        const card = btn.closest('.resource-card') || btn.parentElement;
        let zone = card.querySelector('.tuto-msg');
        if (!zone) {
            zone = document.createElement('p');
            zone.className = 'tuto-msg';
            card.appendChild(zone);
        }
        zone.className = `tuto-msg tuto-msg--${kind}`;
        zone.innerHTML = message;
    }
};

document.addEventListener('DOMContentLoaded', () => TutoDownload.init());
