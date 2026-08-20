/**
 * PDF-Annexes v1 — Bon de commande et bon de livraison fictifs
 * ============================================================
 * Produit deux pieces jointes PDF destinees a etre embarquees en base64 dans
 * la facture UBL, en plus du lisible :
 *
 *   - BON_COMMANDE  : emis par l'acheteur vers le vendeur, avec les prix
 *   - BON_LIVRAISON : emis par le vendeur, accompagne les biens, sans prix
 *
 * Objet : verifier le comportement d'une plateforme agreee face a une facture
 * portant PLUSIEURS occurrences de BG-24 cac:AdditionalDocumentReference.
 * Ces documents sont fictifs et le signalent explicitement.
 *
 * Conformite :
 *   - BT-123 est une liste fermee (BR-FR-17). BON_COMMANDE et BON_LIVRAISON
 *     en font partie ; LISIBLE reste unique par facture (BR-FR-18).
 *   - Aucun cbc:DocumentTypeCode sur ces occurrences : le code 130 est reserve
 *     a BT-18 (identifiant de l'objet facture).
 *   - Le nom de fichier reste sous 50 caracteres (BR-FR-CPRO-41).
 *
 * Le moteur PDF (metriques Helvetica, primitives de dessin, assemblage du
 * fichier, encodage base64) est herite de PDFLisible : aucune duplication.
 */

const PDFAnnexes = Object.create(PDFLisible);

Object.assign(PDFAnnexes, {

    // Anteriorite des documents par rapport a la facture, en jours
    ORDER_DAYS_BEFORE: 21,
    DESPATCH_DAYS_BEFORE: 5,

    HEAD_H: 18,
    ROW_H: 21,
    ROW_H2: 30,
    SUB_H: 10,

    // Colonnes du tableau valorise (bon de commande). Les colonnes numeriques
    // sont reperees par leur bord droit.
    COLP: { num: 38, desc: 66, unit: 296, qtyR: 400, puR: 480, totR: 557.28 },
    // Colonnes du tableau de livraison : aucun prix ne figure sur un bon de livraison.
    COLQ: { num: 38, desc: 66, ref: 330, unit: 436, qtyR: 557.28 },

    // ============================================================
    // OUTILS
    // ============================================================

    // Decalage d'une date ISO d'un nombre de jours, en UTC pour rester
    // deterministe quel que soit le fuseau du navigateur.
    _shift: function (iso, days) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
        if (!m) return iso;
        const t = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]) + days * 86400000);
        return t.getUTCFullYear() + '-' + String(t.getUTCMonth() + 1).padStart(2, '0') +
            '-' + String(t.getUTCDate()).padStart(2, '0');
    },

    // Numero d'annexe derive du numero de facture : deterministe et tracable.
    _annexNumber: function (prefix, invoiceNumber) {
        const tail = String(invoiceNumber || '').replace(/[^0-9]/g, '').slice(-10);
        return prefix + '-' + (tail || '0000000000');
    },

    _fileName: function (prefix, invoiceNumber) {
        let f = String(invoiceNumber || 'annexe').replace(/[^a-zA-Z0-9._-]/g, '-') + '_' + prefix + '.pdf';
        if (f.length > 50) f = f.slice(f.length - 50);
        return f;
    },

    // Destinataire physique de la livraison : BT-70 + BG-15 quand ils existent,
    // a defaut l'acheteur lui-meme.
    _shipTo: function (d) {
        if (d.delivery && (d.delivery.address || d.delivery.name)) {
            return {
                name: d.delivery.name || (d.buyer && d.buyer.name) || '-',
                address: d.delivery.address || (d.buyer && d.buyer.address) || {}
            };
        }
        return d.buyer;
    },

    // ============================================================
    // SPECIFICATIONS DES DEUX DOCUMENTS
    // ============================================================

    _orderSpec: function (d) {
        const number = d.orderReference || this._annexNumber('BC', d.invoiceNumber);
        const date = this._shift(d.issueDate, -this.ORDER_DAYS_BEFORE);
        const wanted = (d.delivery && d.delivery.date)
            ? d.delivery.date : this._shift(d.issueDate, -this.DESPATCH_DAYS_BEFORE);
        return {
            d: d,
            title: 'BON DE COMMANDE',
            attachCode: 'BON_COMMANDE',
            number: number,
            priced: true,
            floor: 262,
            fromLabel: 'DONNEUR D\u2019ORDRE (acheteur)',
            from: d.buyer,
            fromEndpoint: d.buyerEndpoint,
            toLabel: 'FOURNISSEUR',
            to: d.supplier,
            toEndpoint: d.supplierEndpoint,
            refs: [
                ['N\u00b0 de commande', number],
                ['Date de commande', this._date(date)],
                ['Livraison souhait\u00e9e', this._date(wanted)],
                ['R\u00e9f\u00e9rence acheteur (BT-10)', d.buyerReference || '-'],
                ['Facture rattach\u00e9e', d.invoiceNumber],
                ['Conditions de r\u00e8glement', d.paymentTerms || '-']
            ],
            mentions: [
                'Commande pass\u00e9e aux conditions g\u00e9n\u00e9rales d\u2019achat du donneur d\u2019ordre.',
                'Toute livraison doit \u00eatre accompagn\u00e9e d\u2019un bon de livraison rappelant le pr\u00e9sent num\u00e9ro de commande. Le num\u00e9ro de commande doit \u00e9galement figurer sur la facture (BT-13).',
                'Document fictif produit \u00e0 des fins de test d\u2019int\u00e9gration. Pi\u00e8ce jointe BG-24, BT-123 = BON_COMMANDE.'
            ],
            signatures: ['Cachet et signature du donneur d\u2019ordre', 'Accus\u00e9 de r\u00e9ception du fournisseur']
        };
    },

    _despatchSpec: function (d) {
        const number = this._annexNumber('BL', d.invoiceNumber);
        const date = (d.delivery && d.delivery.date)
            ? d.delivery.date : this._shift(d.issueDate, -this.DESPATCH_DAYS_BEFORE);
        return {
            d: d,
            title: 'BON DE LIVRAISON',
            attachCode: 'BON_LIVRAISON',
            number: number,
            priced: false,
            floor: 200,
            fromLabel: 'EXP\u00c9DITEUR (vendeur)',
            from: d.supplier,
            fromEndpoint: d.supplierEndpoint,
            toLabel: 'LIVR\u00c9 \u00c0',
            to: this._shipTo(d),
            toEndpoint: null,
            refs: [
                ['N\u00b0 de bon de livraison', number],
                ['Date de livraison (BT-72)', this._date(date)],
                ['N\u00b0 de commande (BT-13)', d.orderReference || '-'],
                ['Facture rattach\u00e9e', d.invoiceNumber],
                ['Destinataire factur\u00e9', (d.buyer && d.buyer.name) || '-'],
                ['Nombre de lignes', String((d.lines || []).length)]
            ],
            mentions: [
                'Les biens et services d\u00e9sign\u00e9s ci-dessus ont \u00e9t\u00e9 livr\u00e9s conform\u00e9ment \u00e0 la commande r\u00e9f\u00e9renc\u00e9e.',
                'R\u00e9serves : toute avarie ou tout manquant doit \u00eatre notifi\u00e9 au transporteur dans les trois jours suivant la r\u00e9ception, par acte extrajudiciaire ou par lettre recommand\u00e9e (article L. 133-3 du code de commerce).',
                'Le pr\u00e9sent document ne vaut pas facture et ne mentionne aucun prix ni aucune TVA.',
                'Document fictif produit \u00e0 des fins de test d\u2019int\u00e9gration. Pi\u00e8ce jointe BG-24, BT-123 = BON_LIVRAISON.'
            ],
            signatures: ['Cachet et signature du transporteur', 'Re\u00e7u conforme \u2014 le destinataire']
        };
    },

    // ============================================================
    // RENDU
    // ============================================================

    _rowH: function (spec, row) {
        const c = spec.priced ? this.COLP : this.COLQ;
        const maxW = (spec.priced ? c.unit : c.ref) - c.desc - 12;
        const label = ((row.ref || '') + '  ' + (row.desc || '')).trim();
        const base = this._wrap(label, 7.7, maxW, 2, true).length === 1 ? this.ROW_H : this.ROW_H2;
        return base + (spec.priced ? this.SUB_H * ((row.allowances || []).length) : 0);
    },

    _annexHeader: function (ctx, spec, pageNo, total) {
        const M = this.M, R = this.PAGE_W - this.M;
        let y = this.PAGE_H - this.M - 6;

        this._txt(ctx, M, y, spec.title, { size: 18, bold: true, color: this.C.navy });
        const bw = this._w(spec.number, 9, true) + 22;
        this._roundRect(ctx, R - bw, y - 5, bw, 21, 6, this.C.navy, null, 0);
        this._txt(ctx, R - bw / 2, y + 1.5, spec.number, { size: 9, bold: true, color: this.C.white, align: 'center' });

        y -= 14;
        this._txt(ctx, M, y, 'Pi\u00e8ce jointe de la facture ' + spec.d.invoiceNumber +
            '  \u2014  BG-24, BT-123 = ' + spec.attachCode, { size: 7.3, color: this.C.muted });
        y -= 9;
        this._hline(ctx, M, R, y, this.C.cyan, 1.4);
        y -= 17;

        if (pageNo > 1) {
            this._txt(ctx, M, y, spec.title + ' ' + spec.number + ' \u2014 suite',
                { size: 8.4, bold: true, color: this.C.muted });
            y -= 16;
        } else {
            // Cartes d'identite de l'emetteur et du destinataire
            const fromLines = this._partyLines(spec.from, spec.fromEndpoint);
            const toLines = this._partyLines(spec.to, spec.toEndpoint);
            const cardH = 26 + Math.max(fromLines.length, toLines.length) * 9.6;
            const cw = (R - M - 18) / 2;
            [[M, spec.fromLabel, fromLines], [M + cw + 18, spec.toLabel, toLines]].forEach((card) => {
                this._roundRect(ctx, card[0], y - cardH, cw, cardH, 6, this.C.light, this.C.hair, 0.6);
                this._txt(ctx, card[0] + 10, y - 14, card[1], { size: 6.5, bold: true, color: this.C.cyan });
                let ly = y - 26;
                card[2].forEach((t, i) => {
                    const sz = i === 0 ? 8.6 : 7.3;
                    this._txt(ctx, card[0] + 10, ly, this._fit(t, sz, cw - 20, i === 0),
                        { size: sz, bold: i === 0, color: i === 0 ? this.C.text : this.C.muted });
                    ly -= 9.6;
                });
            });
            y -= cardH + 13;

            // Carte des references, sur deux colonnes
            const refs = spec.refs;
            const half = Math.ceil(refs.length / 2);
            const refH = 15 + half * 12;
            const colW = (R - M) / 2;
            this._roundRect(ctx, M, y - refH, R - M, refH, 6, this.C.white, this.C.rule, 0.6);
            refs.forEach((r, i) => {
                const col = i < half ? 0 : 1;
                const x = M + 12 + col * colW;
                const ry = y - 15 - (i < half ? i : i - half) * 12;
                this._txt(ctx, x, ry, r[0], { size: 6.9, color: this.C.muted });
                this._txt(ctx, x + colW - 24, ry, this._fit(String(r[1]), 7.5, colW - 24 - this._w(r[0], 6.9, false) - 14, true),
                    { size: 7.5, bold: true, align: 'right' });
            });
            y -= refH + 15;
        }

        // Bandeau d'en-tete du tableau
        const c = spec.priced ? this.COLP : this.COLQ;
        this._fill(ctx, M, y - this.HEAD_H, R - M, this.HEAD_H, this.C.navy);
        const hy = y - this.HEAD_H + 6;
        const H = { size: 6.7, bold: true, color: this.C.white };
        this._txt(ctx, c.num + 6, hy, 'N\u00b0', H);
        this._txt(ctx, c.desc + 6, hy, 'D\u00c9SIGNATION', H);
        if (spec.priced) {
            this._txt(ctx, c.unit + 6, hy, 'UNIT\u00c9', H);
            this._txt(ctx, c.qtyR, hy, 'QUANTIT\u00c9', Object.assign({ align: 'right' }, H));
            this._txt(ctx, c.puR, hy, 'PRIX UNIT. HT', Object.assign({ align: 'right' }, H));
            this._txt(ctx, c.totR, hy, 'TOTAL HT', Object.assign({ align: 'right' }, H));
        } else {
            this._txt(ctx, c.ref + 6, hy, 'R\u00c9F\u00c9RENCE', H);
            this._txt(ctx, c.unit + 6, hy, 'UNIT\u00c9', H);
            this._txt(ctx, c.qtyR, hy, 'QUANTIT\u00c9 LIVR\u00c9E', Object.assign({ align: 'right' }, H));
        }
        return y - this.HEAD_H;
    },

    _annexRows: function (ctx, spec, rows, startY) {
        const M = this.M, R = this.PAGE_W - this.M;
        const c = spec.priced ? this.COLP : this.COLQ;
        const descW = (spec.priced ? c.unit : c.ref) - c.desc - 12;
        let y = startY;

        rows.forEach((row, i) => {
            const h = this._rowH(spec, row);
            if (i % 2 === 1) this._fill(ctx, M, y - h + 7, R - M, h, this.C.zebra);

            this._txt(ctx, c.num + 6, y, String(row.id || i + 1), { size: 7.4, color: this.C.muted });
            const lines = this._wrap(row.desc || '-', 7.9, descW, 2, false);
            lines.forEach((t, k) => {
                this._txt(ctx, c.desc + 6, y - k * 10, t, { size: 7.9 });
            });

            if (spec.priced) {
                this._txt(ctx, c.unit + 6, y, this._unit(row), { size: 7.2, color: this.C.muted });
                this._txt(ctx, c.qtyR, y, this._qty(row.qty), { size: 7.9, align: 'right' });
                this._txt(ctx, c.puR, y, this._amt(row.price), { size: 7.9, align: 'right' });
                this._txt(ctx, c.totR, y, this._amt(row.amount), { size: 8.0, bold: true, align: 'right' });

                // BG-27 / BG-28 : les remises et frais de ligne sont deja integres
                // dans le montant net. Les sous-lignes rendent le calcul verifiable.
                let sy = y - (lines.length > 1 ? 20 : 10);
                (row.allowances || []).forEach((ac) => {
                    const base = ac.baseAmount ? ' (base ' + this._amt(ac.baseAmount) + ')' : '';
                    this._txt(ctx, c.desc + 10, sy,
                        this._fit((ac.charge ? '+ ' : '- ') + (ac.reason || 'Ajustement') + base, 7.0, descW - 12),
                        { size: 7.0, color: this.C.muted });
                    this._txt(ctx, c.totR, sy, (ac.charge ? '' : '-') + this._amt(ac.amount),
                        { size: 7.0, color: this.C.muted, align: 'right' });
                    sy -= this.SUB_H;
                });
            } else {
                this._txt(ctx, c.ref + 6, y, this._fit(row.ref || '-', 7.2, c.unit - c.ref - 12),
                    { size: 7.2, color: this.C.muted });
                this._txt(ctx, c.unit + 6, y, this._unit(row), { size: 7.2, color: this.C.muted });
                this._txt(ctx, c.qtyR, y, this._qty(row.qty), { size: 8.4, bold: true, align: 'right' });
            }

            y -= h;
            this._hline(ctx, M, R, y + 6, this.C.hair, 0.5);
        });
        return y;
    },

    // Cartouche de totaux, bon de commande uniquement : un bon de livraison ne
    // porte ni prix ni TVA.
    _annexTotals: function (ctx, spec, topY) {
        const d = spec.d;
        const R = this.PAGE_W - this.M;
        const w = 250, x = R - w;
        const rows = [];
        if (this._num(d.allowanceTotal) !== 0 || this._num(d.chargeTotal) !== 0) {
            rows.push(['Total des lignes HT', this._money(d.lineExtensionAmount)]);
            if (this._num(d.allowanceTotal) !== 0) rows.push(['Remises', this._money(-this._num(d.allowanceTotal))]);
            if (this._num(d.chargeTotal) !== 0) rows.push(['Frais annexes', this._money(d.chargeTotal)]);
        }
        rows.push(['Total commande HT', this._money(d.taxExclusiveAmount)]);
        rows.push(['TVA', this._money(d.taxAmount)]);
        const h = 14 + rows.length * 13 + 22;
        const top = topY - 12;
        this._roundRect(ctx, x, top - h, w, h, 8, this.C.light, this.C.hair, 0.6);
        let ry = top - 16;
        rows.forEach((r) => {
            this._txt(ctx, x + 12, ry, r[0], { size: 7.4, color: this.C.muted });
            this._txt(ctx, x + w - 12, ry, r[1], { size: 7.8, align: 'right' });
            ry -= 13;
        });
        this._hline(ctx, x + 12, x + w - 12, ry + 6, this.C.rule, 0.6);
        this._txt(ctx, x + 12, ry - 8, 'TOTAL COMMANDE TTC', { size: 8.2, bold: true, color: this.C.navy });
        this._txt(ctx, x + w - 12, ry - 8, this._money(d.taxInclusiveAmount),
            { size: 9.4, bold: true, color: this.C.navy, align: 'right' });
        return top - h;
    },

    _annexFooter: function (ctx, spec, pageNo, total) {
        const M = this.M, R = this.PAGE_W - this.M;

        // Mentions
        let y = 186;
        this._txt(ctx, M, y, 'MENTIONS', { size: 6.5, bold: true, color: this.C.cyan });
        y -= 11;
        spec.mentions.forEach((m) => {
            this._wrap(m, 6.9, R - M, 3, false).forEach((t) => {
                this._txt(ctx, M, y, t, { size: 6.9, color: this.C.muted });
                y -= 8.4;
            });
            y -= 1.5;
        });

        // Deux cadres de signature
        const bw = (R - M - 18) / 2;
        spec.signatures.forEach((label, i) => {
            const x = M + i * (bw + 18);
            this._roundRect(ctx, x, 56, bw, 50, 6, null, this.C.rule, 0.6);
            this._txt(ctx, x + 10, 95, label, { size: 6.6, bold: true, color: this.C.muted });
        });

        // Pied de page
        this._hline(ctx, M, R, 44, this.C.hair, 0.5);
        this._txt(ctx, M, 34, (spec.from && spec.from.legalName) || (spec.from && spec.from.name) || '',
            { size: 6.7, color: this.C.muted });
        this._txt(ctx, R, 34, 'Document annexe fictif  \u2014  page ' + pageNo + '/' + total,
            { size: 6.7, color: this.C.muted, align: 'right' });
    },

    _paginateAnnex: function (spec) {
        const rows = spec.d.lines || [];
        const pages = [];
        let cur = [];
        // Premiere page : l'en-tete complet consomme davantage de hauteur que
        // les pages de continuation. On mesure au rendu pres en simulant.
        let avail = this._annexHeaderBottom(spec, 1) - spec.floor;
        rows.forEach((row) => {
            const h = this._rowH(spec, row);
            if (h > avail && cur.length) {
                pages.push(cur);
                cur = [];
                avail = this._annexHeaderBottom(spec, 2) - (spec.priced ? 262 : 200);
            }
            cur.push(row);
            avail -= h;
        });
        pages.push(cur);
        return pages;
    },

    // Hauteur consommee par l'en-tete : mesuree en rendant dans un tampon jetable,
    // pour que la geometrie ne puisse pas se desynchroniser du rendu reel.
    _annexHeaderBottom: function (spec, pageNo) {
        return this._annexHeader({ buf: [] }, spec, pageNo, 1);
    },

    _renderAnnex: function (spec) {
        const groups = this._paginateAnnex(spec);
        const total = groups.length;
        return groups.map((rows, i) => {
            const ctx = { buf: [] };
            const tableTop = this._annexHeader(ctx, spec, i + 1, total);
            const endY = this._annexRows(ctx, spec, rows, tableTop - 9);
            const last = i === total - 1;
            if (last && spec.priced) this._annexTotals(ctx, spec, endY);
            if (last) this._annexFooter(ctx, spec, i + 1, total);
            else this._txt(ctx, this.PAGE_W - this.M, spec.floor - 16, 'Suite page suivante ...',
                { size: 7.2, color: this.C.muted, align: 'right' });
            return ctx.buf.join('\n');
        });
    },

    // ============================================================
    // API PUBLIQUE — meme contrat que PDFLisible.build
    // build*(data) -> { raw, base64, filename, bytes, pages, description }
    // ============================================================

    _build: function (input, spec, prefix, description) {
        const pages = this._renderAnnex(spec);
        const raw = this._assemble(pages, spec.title + ' ' + spec.number);
        return {
            raw: raw,
            base64: this._toBase64(raw),
            filename: this._fileName(prefix, input.invoiceNumber),
            bytes: raw.length,
            pages: pages.length,
            number: spec.number,
            description: description
        };
    },

    buildOrder: function (input) {
        const d = this._normalize(input);
        this._cur = this.CUR_SYMBOLS[d.currency] || d.currency || '\u20ac';
        return this._build(d, this._orderSpec(d), 'bon-commande', 'BON_COMMANDE');
    },

    buildDespatch: function (input) {
        const d = this._normalize(input);
        this._cur = this.CUR_SYMBOLS[d.currency] || d.currency || '\u20ac';
        return this._build(d, this._despatchSpec(d), 'bon-livraison', 'BON_LIVRAISON');
    }
});
