/**
 * PDF-LISIBLE.JS v3
 * Generateur de la representation lisible de la facture (PDF 1.4 autonome).
 *
 * Ce PDF est destine a deux usages :
 *   1. telechargement direct par l'utilisateur ;
 *   2. encodage base64 dans BG-24 / BT-125 de la facture UBL
 *      (cac:AdditionalDocumentReference > cac:Attachment >
 *       cbc:EmbeddedDocumentBinaryObject), avec BT-123 = LISIBLE (BR-FR-17).
 *
 * Aucune dependance externe : le fichier PDF est ecrit octet par octet.
 * Polices : Helvetica / Helvetica-Bold (base 14 PDF), encodage WinAnsi.
 * Metriques de largeur reelles (AFM) pour un alignement exact.
 *
 * Auteur: Bruno BARTOLI - Fluxym / Re-Form-E
 */
'use strict';

const PDFLisible = {

    // ============================================================
    // GEOMETRIE (A4 portrait, unites = points PostScript)
    // ============================================================
    PAGE_W: 595.28,
    PAGE_H: 841.89,
    M: 38,                 // marge laterale
    HEADER_TOP: 803.89,    // premiere ligne utile (PAGE_H - 38)
    LAST_BOTTOM: 300,      // plancher du tableau sur la DERNIERE page (place pour les totaux)
    REG_BOTTOM: 90,        // plancher du tableau sur les pages de continuation

    COL: { line: 38, desc: 72, unit: 300, qty: 355, pu: 415, vat: 470, ht: 552.28 },

    // Palette Re-Form-E (identique aux variables CSS de pages.css)
    C: {
        navy:  [0.043, 0.125, 0.275],   // #0B2046
        cyan:  [0.000, 0.655, 0.882],   // #00A7E1
        text:  [0.122, 0.161, 0.216],   // #1F2937
        muted: [0.400, 0.439, 0.502],   // #667085
        light: [0.953, 0.961, 0.973],   // #F3F5F8
        rule:  [0.843, 0.863, 0.890],   // #D7DCE3
        zebra: [0.980, 0.984, 0.992],   // #FAFBFD
        hair:  [0.910, 0.922, 0.941],   // #E8EBF0
        white: [1, 1, 1]
    },

    // Libelles de document par InvoiceTypeCode (BT-3)
    DOC_LABELS: {
        '380': 'FACTURE',
        '381': 'AVOIR',
        '383': 'NOTE DE DEBIT',
        '384': 'FACTURE RECTIF.',
        '386': "FACTURE D'ACOMPTE",
        '389': 'AUTO-FACTURATION',
        '393': 'FACTURE CEDEE'
    },

    // BT-23 Cadre de facturation. La lettre de tete porte la categorie
    // d'operation, mention obligatoire au 01/09/2026 : B biens, S services,
    // M mixte (biens et services non accessoires).
    PROFILE_CATEGORY: { B: 'Biens', S: 'Services', M: 'Biens et services' },
    PROFILE_LABELS: {
        B1: 'Facture de bien', S1: 'Facture de prestation de service',
        M1: 'Facture double biens et services',
        B2: 'Facture de bien deja payee', S2: 'Facture de service deja payee',
        M2: 'Facture double deja payee',
        S3: 'Demande de paiement sous-traitant',
        B4: 'Facture de solde apres acompte', S4: 'Facture de solde apres acompte',
        M4: 'Facture de solde double apres acompte',
        S5: 'Facture de sous-traitant', S6: 'Facture de co-traitant',
        B7: 'Facture de bien deja e-reportee', S7: 'Facture de service deja e-reportee',
        B8: 'Facture multi-vendeurs de biens', S8: 'Facture multi-vendeurs de services',
        M8: 'Facture double multi-vendeurs',
        B9: 'Facture bidirectionnelle de biens', S9: 'Facture bidirectionnelle de services',
        M9: 'Facture double bidirectionnelle'
    },

    // Libelles d'unite lisibles a partir du code UN/ECE Rec 20 (BT-130)
    UNIT_LABELS: {
        C62: 'UN', H87: 'PCE', EA: 'UN', DAY: 'JOUR', MON: 'MOIS', ANN: 'AN',
        HUR: 'H', MIN: 'MIN', KGM: 'KG', GRM: 'G', TNE: 'T', LTR: 'L',
        MTR: 'M', MTK: 'M2', MTQ: 'M3', KMT: 'KM', SET: 'LOT', ZZ: 'DIV',
        E48: 'SERV', NAR: 'UN', PCE: 'PCE'
    },

    // Libelles des moyens de paiement (BT-81, codelist UNTDID 4461)
    MEANS_LABELS: {
        '10': 'Especes',
        '20': 'Cheque',
        '30': 'Virement bancaire',
        '31': 'Virement (debit de compte)',
        '42': 'Versement sur compte bancaire',
        '48': 'Carte bancaire',
        '49': 'Prelevement automatique',
        '58': 'Virement SEPA credit',
        '59': 'Prelevement SEPA',
        '97': 'Compensation entre comptes'
    },

    // ============================================================
    // METRIQUES HELVETICA (largeurs AFM, codes WinAnsi 32..255)
    // ============================================================
    _WREG_SRC: '278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,761,556,761,222,556,333,1000,556,556,333,1000,667,333,1000,761,611,761,761,222,222,333,333,350,556,1000,333,1000,500,333,944,761,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500',
    _WBOLD_SRC: '278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,761,556,761,278,556,500,1000,556,556,333,1000,667,333,1000,761,611,761,761,278,278,500,500,350,556,1000,333,1000,556,333,944,761,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556',
    _wreg: null,
    _wbold: null,

    _metrics: function (bold) {
        if (!this._wreg) {
            this._wreg = this._WREG_SRC.split(',').map(Number);
            this._wbold = this._WBOLD_SRC.split(',').map(Number);
        }
        return bold ? this._wbold : this._wreg;
    },

    // ============================================================
    // ENCODAGE WinAnsi : 1 caractere = 1 octet
    // ============================================================
    _WINANSI: {
        '\u2014': '\x97', '\u2013': '\x96', '\u2018': '\x91', '\u2019': '\x92',
        '\u201C': '\x93', '\u201D': '\x94', '\u2022': '\x95', '\u2026': '\x85',
        '\u20AC': '\x80', '\u2122': '\x99', '\u00A0': ' ', '\u0152': '\x8C',
        '\u0153': '\x9C', '\u0178': '\x9F', '\u017D': '\x8E', '\u017E': '\x9E',
        '\u0160': '\x8A', '\u0161': '\x9A', '\u0192': '\x83', '\u2039': '\x8B',
        '\u203A': '\x9B', '\u2020': '\x86', '\u2021': '\x87', '\u2030': '\x89'
    },

    _latin1: function (str) {
        const map = this._WINANSI;
        return String(str === null || str === undefined ? '' : str)
            .normalize('NFC')
            .split('')
            .map((c) => (map[c] ? map[c] : (c.charCodeAt(0) < 256 ? c : '?')))
            .join('');
    },

    _esc: function (str) {
        return this._latin1(str)
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/\r/g, ' ')
            .replace(/\n/g, ' ');
    },

    // Largeur exacte d'une chaine pour une taille donnee
    _w: function (str, size, bold) {
        const s = this._latin1(str);
        const m = this._metrics(bold);
        let total = 0;
        for (let i = 0; i < s.length; i++) {
            const code = s.charCodeAt(i);
            total += code < 32 ? 0 : (m[code - 32] || 0);
        }
        return (total * size) / 1000;
    },

    // ============================================================
    // TEXTE : troncature et retour a la ligne
    // ============================================================
    _fit: function (str, size, maxW, bold) {
        let s = this._latin1(str);
        if (this._w(s, size, bold) <= maxW) return s;
        while (s.length > 1 && this._w(s + '...', size, bold) > maxW) s = s.slice(0, -1);
        return s.replace(/\s+$/, '') + '...';
    },

    _wrap: function (str, size, maxW, maxLines, bold) {
        const words = this._latin1(str).split(/\s+/).filter((w) => w.length);
        const lines = [];
        let cur = '';
        words.forEach((word) => {
            const test = cur ? cur + ' ' + word : word;
            if (this._w(test, size, bold) <= maxW) { cur = test; return; }
            if (cur) lines.push(cur);
            cur = word;
        });
        if (cur) lines.push(cur);
        if (!lines.length) return [''];
        if (lines.length <= maxLines) return lines;
        const kept = lines.slice(0, maxLines);
        kept[maxLines - 1] = this._fit(lines.slice(maxLines - 1).join(' '), size, maxW, bold);
        return kept;
    },

    // ============================================================
    // FORMATAGE
    // ============================================================
    _num: function (v) {
        const n = Number(String(v === null || v === undefined ? 0 : v).replace(/\s/g, '').replace(',', '.'));
        return isFinite(n) ? n : 0;
    },

    _amt: function (v) {
        const n = this._num(v);
        const neg = n < 0;
        const parts = Math.abs(n).toFixed(2).split('.');
        const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
        return (neg ? '-' : '') + int + ',' + parts[1];
    },

    _money: function (v) { return this._amt(v) + ' \u20ac'; },

    _qty: function (v) {
        const n = this._num(v);
        if (Math.abs(n - Math.round(n)) < 0.005) return String(Math.round(n));
        return this._amt(n);
    },

    _date: function (v) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ''));
        return m ? m[3] + '/' + m[2] + '/' + m[1] : String(v || '-');
    },

    // ============================================================
    // PRIMITIVES DE DESSIN
    // ============================================================
    _rgb: (c) => c[0] + ' ' + c[1] + ' ' + c[2],
    _n: (v) => Number(v).toFixed(2),

    _txt: function (ctx, x, y, str, o) {
        const opt = o || {};
        const size = opt.size || 8.2;
        const bold = !!opt.bold;
        const color = opt.color || this.C.text;
        const s = String(str === null || str === undefined ? '' : str);
        let px = x;
        if (opt.align === 'right') px = x - this._w(s, size, bold);
        else if (opt.align === 'center') px = x - this._w(s, size, bold) / 2;
        ctx.buf.push('BT ' + this._rgb(color) + ' rg ' + (bold ? '/F2 ' : '/F1 ') + size +
            ' Tf 1 0 0 1 ' + this._n(px) + ' ' + this._n(y) + ' Tm (' + this._esc(s) + ') Tj ET');
    },

    _fill: function (ctx, x, y, w, h, color) {
        ctx.buf.push(this._rgb(color) + ' rg ' + this._n(x) + ' ' + this._n(y) + ' ' +
            this._n(w) + ' ' + this._n(h) + ' re f');
    },

    _stroke: function (ctx, x, y, w, h, color, lw) {
        ctx.buf.push(this._rgb(color || this.C.rule) + ' RG ' + this._n(lw || 0.6) + ' w ' +
            this._n(x) + ' ' + this._n(y) + ' ' + this._n(w) + ' ' + this._n(h) + ' re S');
    },

    // Rectangle a coins arrondis (courbes de Bezier)
    _roundPath: function (x, y, w, h, r) {
        const k = r * 0.5523, n = this._n;
        return [
            n(x + r) + ' ' + n(y) + ' m',
            n(x + w - r) + ' ' + n(y) + ' l',
            n(x + w - r + k) + ' ' + n(y) + ' ' + n(x + w) + ' ' + n(y + r - k) + ' ' + n(x + w) + ' ' + n(y + r) + ' c',
            n(x + w) + ' ' + n(y + h - r) + ' l',
            n(x + w) + ' ' + n(y + h - r + k) + ' ' + n(x + w - r + k) + ' ' + n(y + h) + ' ' + n(x + w - r) + ' ' + n(y + h) + ' c',
            n(x + r) + ' ' + n(y + h) + ' l',
            n(x + r - k) + ' ' + n(y + h) + ' ' + n(x) + ' ' + n(y + h - r + k) + ' ' + n(x) + ' ' + n(y + h - r) + ' c',
            n(x) + ' ' + n(y + r) + ' l',
            n(x) + ' ' + n(y + r - k) + ' ' + n(x + r - k) + ' ' + n(y) + ' ' + n(x + r) + ' ' + n(y) + ' c',
            'h'
        ].join(' ');
    },

    _roundRect: function (ctx, x, y, w, h, r, fillColor, strokeColor, lw) {
        let ops = '';
        if (fillColor) ops += this._rgb(fillColor) + ' rg ';
        if (strokeColor) ops += this._rgb(strokeColor) + ' RG ' + this._n(lw || 0.6) + ' w ';
        ops += this._roundPath(x, y, w, h, r) + ' ';
        if (fillColor && strokeColor) ops += 'B';
        else if (fillColor) ops += 'f';
        else ops += 'S';
        ctx.buf.push(ops);
    },

    _hline: function (ctx, x1, x2, y, color, lw) {
        ctx.buf.push(this._rgb(color || this.C.rule) + ' RG ' + this._n(lw || 0.6) + ' w ' +
            this._n(x1) + ' ' + this._n(y) + ' m ' + this._n(x2) + ' ' + this._n(y) + ' l S');
    },

    _vline: function (ctx, x, y1, y2, color, lw) {
        ctx.buf.push(this._rgb(color || this.C.rule) + ' RG ' + this._n(lw || 0.4) + ' w ' +
            this._n(x) + ' ' + this._n(y1) + ' m ' + this._n(x) + ' ' + this._n(y2) + ' l S');
    },

    // ============================================================
    // BLOCS D'IDENTITE
    // ============================================================
    // Lignes d'identite d'un tiers. `endpoint` porte l'adresse de facturation
    // electronique BT-34 / BT-49, mention obligatoire au 01/09/2026.
    _partyLines: function (p, endpoint) {
        if (!p) return ['-'];
        const out = [p.name || '-'];
        if (p.legalName && p.legalName !== p.name) out.push(p.legalName);
        const a = p.address || {};
        if (a.street) out.push(a.street);
        const cityLine = ((a.zip || '') + ' ' + (a.city || '')).trim();
        if (cityLine) out.push(cityLine);
        if (a.country) out.push(a.country === 'FR' ? 'FRANCE' : a.country);
        // Les identifiants sont conditionnels : une partie etablie hors de France
        // n'a ni SIREN ni SIRET, et un vendeur en franchise en base n'a pas de
        // numero de TVA (BT-31) mais un identifiant fiscal de substitution (BT-32).
        if (p.siren) {
            let ids = 'SIRET ' + p.siren + (p.nic || '00001');
            if (p.vatNumber) ids += '  |  TVA ' + p.vatNumber;
            out.push(ids);
        } else if (p.vatNumber) {
            out.push('TVA ' + p.vatNumber);
        }
        // BT-34 / BT-49 : le schema d'identification n'est pas toujours 0225
        // (9930 numero de TVA allemand, 9927 numero IDE suisse...).
        const ep = p.endpointId || endpoint;
        if (ep) out.push('Adr. \u00e9lectronique (' + (p.endpointScheme || '0225') + ') : ' + ep);
        return out;
    },

    // Lignes du destinataire de livraison (BT-70 + BG-15).
    _deliveryLines: function (d) {
        if (!d.delivery) return null;
        const out = [];
        if (d.delivery.name) out.push(d.delivery.name);
        const a = d.delivery.address;
        if (a) {
            if (a.street) out.push(a.street);
            const c = ((a.zip || '') + ' ' + (a.city || '')).trim();
            if (c) out.push(c);
            if (a.country) out.push(a.country === 'FR' ? 'FRANCE' : a.country);
        }
        return out.length ? out : null;
    },

    // Lignes de la carte d'identite du document. La reference a la facture
    // anterieure (BT-25) y figure quand elle existe : sur une facture
    // complementaire ou une facture de solde, elle doit etre lisible.
    _cardRefs: function (d) {
        const refs = [
            ['N\u00b0 facture', d.invoiceNumber],
            ['Date facture', this._date(d.issueDate)],
            ['\u00c9ch\u00e9ance', d.dueDate ? this._date(d.dueDate) : '-'],
            ['R\u00e9f\u00e9rence', d.buyerReference || '-']
        ];
        if (d.precedingInvoice && d.precedingInvoice.id) {
            refs.push(['Facture d\u2019origine', d.precedingInvoice.id]);
        }
        return refs;
    },

    _cardHeight: function (d) {
        return 93 + 15 * (this._cardRefs(d).length - 4);
    },

    _rowHeight: function (row) {
        const maxW = this.COL.unit - this.COL.desc - 12;
        const label = ((row.ref || '') + '  ' + (row.desc || '')).trim();
        return this._wrap(label, 7.7, maxW, 2, true).length === 1 ? 27 : 38;
    },

    // ============================================================
    // EN-TETE DE PAGE (repete a l'identique sur chaque page)
    // ============================================================
    // Hauteur de l'en-tete. Plutot que de dupliquer la formule de mise en page
    // (source classique de desynchronisation), on execute _header sur un
    // tampon jetable et on ne garde que la cote qu'il renvoie.
    _headerBottom: function (d) {
        return this._header({ buf: [] }, d, 1, 1);
    },

    _header: function (ctx, d, pageNo, pageTotal) {
        const M = this.M, R = this.PAGE_W - this.M;
        const top = this.HEADER_TOP;

        // Filet d'accent cyan
        this._fill(ctx, M, top - 3, R - M, 3, this.C.cyan);

        // --- Bloc emetteur (BG-4) ---
        this._txt(ctx, M, top - 25, d.supplier.name, { size: 15, bold: true, color: this.C.navy });
        let sy = top - 41;
        // La premiere ligne est le nom, deja affiche en titre juste au-dessus.
        this._partyLines(d.supplier, d.supplierEndpoint).slice(1, 8).forEach((l) => {
            this._txt(ctx, M, sy, this._fit(l, 8.0, 300), { size: 8.0, color: this.C.muted });
            sy -= 11;
        });

        // --- Carte d'identite du document ---
        const bx = 365, bw = R - 365, bh = this._cardHeight(d), by = top - 4 - bh;
        this._roundRect(ctx, bx, by, bw, bh, 5, this.C.light, this.C.rule);
        this._roundRect(ctx, bx, by + bh - 24, bw, 24, 5, this.C.navy, null);
        this._fill(ctx, bx, by + bh - 24, bw, 8, this.C.navy);
        // Le libelle est contraint a la place restante pour ne jamais
        // chevaucher la pagination (cas des types longs : 393, 384, 389).
        const pageStr = 'Page ' + pageNo + ' / ' + pageTotal;
        const labelMax = bw - 20 - this._w(pageStr, 7.3) - 10;
        this._txt(ctx, bx + 10, by + bh - 16, this._fit(d.docLabel, 11, labelMax, true),
            { size: 11, bold: true, color: this.C.white });
        this._txt(ctx, R - 10, by + bh - 16, pageStr, { size: 7.3, color: this.C.white, align: 'right' });

        const refs = this._cardRefs(d);
        let ry = by + bh - 39;
        refs.forEach((r) => {
            this._txt(ctx, bx + 10, ry, r[0], { size: 7.1, color: this.C.muted });
            const lw = this._w(r[0], 7.1) + 16;
            this._txt(ctx, R - 10, ry, this._fit(r[1], 8.0, bw - 20 - lw, true),
                { size: 8.0, bold: true, align: 'right' });
            ry -= 15;
        });

        // --- Facture a / Livre a (BG-7 / BG-13) ---
        let ay = Math.min(sy + 4, by) - 18;
        const half = (R - M) / 2;
        this._txt(ctx, M, ay, 'FACTUR\u00c9 \u00c0', { size: 7.4, bold: true, color: this.C.muted });
        this._txt(ctx, M + half, ay, 'LIVR\u00c9 \u00c0', { size: 7.4, bold: true, color: this.C.muted });
        ay -= 13;
        const left = this._partyLines(d.buyer, d.buyerEndpoint);
        const right = this._deliveryLines(d) || this._partyLines(d.buyer);
        const rows = Math.max(left.length, right.length);
        for (let i = 0; i < rows; i++) {
            const bold = i === 0;
            const color = bold ? this.C.navy : this.C.muted;
            if (i < left.length) {
                this._txt(ctx, M, ay, this._fit(left[i], 8.1, half - 12, bold), { size: 8.1, bold: bold, color: color });
            }
            if (i < right.length) {
                this._txt(ctx, M + half, ay, this._fit(right[i], 8.1, half - 12, bold), { size: 8.1, bold: bold, color: color });
            }
            ay -= 11;
        }

        // --- Bande de references (BT-23, BT-13, BT-72, BT-20) ---
        // BT-23 et BT-72 sont des mentions obligatoires : elles doivent etre
        // lisibles sur le document, pas seulement presentes dans le structure.
        ay -= 5;
        const bandLines = [];
        const cat = this.PROFILE_CATEGORY[String(d.profileId || '').charAt(0)];
        bandLines.push([
            'Cadre de facturation : ' + (d.profileId || '-') + (cat ? ' \u2014 ' + cat : ''),
            d.orderReference ? 'Bon de commande : ' + d.orderReference : null
        ]);
        bandLines.push([
            'Conditions de r\u00e8glement : ' + (d.paymentTerms || 'Paiement \u00e0 30 jours'),
            (d.delivery && d.delivery.date) ? 'Date de livraison : ' + this._date(d.delivery.date) : null
        ]);

        const bandH = 8 + 12 * bandLines.length;
        this._roundRect(ctx, M, ay + 13 - bandH, R - M, bandH, 3, this.C.light, null);
        let byy = ay + 2;
        bandLines.forEach((pair) => {
            if (pair[0]) this._txt(ctx, M + 8, byy, pair[0], { size: 7.6, color: this.C.muted });
            if (pair[1]) this._txt(ctx, R - 8, byy, pair[1], { size: 7.6, color: this.C.muted, align: 'right' });
            byy -= 12;
        });
        ay -= (bandH + 6);

        // --- En-tete du tableau de lignes ---
        const c = this.COL;
        this._fill(ctx, M, ay - 5, R - M, 19, this.C.navy);
        const th = { size: 7.1, bold: true, color: this.C.white };
        this._txt(ctx, c.line + 2, ay + 1, 'LIG.', th);
        this._txt(ctx, c.desc + 2, ay + 1, 'R\u00c9F\u00c9RENCE / D\u00c9SIGNATION', th);
        this._txt(ctx, c.unit + 2, ay + 1, 'UNIT\u00c9', th);
        this._txt(ctx, c.qty, ay + 1, 'QT\u00c9', { size: 7.1, bold: true, color: this.C.white, align: 'right' });
        this._txt(ctx, c.pu, ay + 1, 'PU HT', { size: 7.1, bold: true, color: this.C.white, align: 'right' });
        this._txt(ctx, c.vat, ay + 1, 'TVA %', { size: 7.1, bold: true, color: this.C.white, align: 'right' });
        this._txt(ctx, c.ht, ay + 1, 'TOTAL HT', { size: 7.1, bold: true, color: this.C.white, align: 'right' });

        return ay - 5;
    },

    // ============================================================
    // TABLEAU DE LIGNES (BG-25)
    // ============================================================
    _tableFrame: function (ctx, d, topY, bottomY) {
        const M = this.M, R = this.PAGE_W - this.M, c = this.COL;
        this._stroke(ctx, M, bottomY, R - M, topY - bottomY, this.C.rule, 0.6);
        [c.desc - 4, c.unit - 4, c.qty + 6, c.pu + 6, c.vat + 6].forEach((x) => {
            this._vline(ctx, x, bottomY, topY, this.C.rule, 0.4);
        });
    },

    _rows: function (ctx, d, rows, y) {
        const M = this.M, R = this.PAGE_W - this.M, c = this.COL;
        const descW = c.unit - c.desc - 12;
        let zebra = false;
        rows.forEach((row) => {
            const h = this._rowHeight(row);
            if (zebra) this._fill(ctx, M + 0.5, y - h + 7, R - M - 1, h, this.C.zebra);
            zebra = !zebra;

            const label = ((row.ref || '') + '  ' + (row.desc || '')).trim();
            const lines = this._wrap(label, 7.7, descW, 2, true);
            this._txt(ctx, c.line + 2, y, row.id, { size: 8.0, color: this.C.muted });
            this._txt(ctx, c.desc + 2, y, lines[0], { size: 7.7, bold: true, color: this.C.navy });
            if (lines.length > 1) {
                this._txt(ctx, c.desc + 2, y - 10, this._fit(lines[1], 7.3, descW), { size: 7.3, color: this.C.muted });
            }
            this._txt(ctx, c.unit + 2, y, this._unit(row), { size: 7.8, color: this.C.muted });
            this._txt(ctx, c.qty, y, this._qty(row.qty), { size: 8.0, align: 'right' });
            this._txt(ctx, c.pu, y, this._amt(row.price), { size: 8.0, align: 'right' });
            this._txt(ctx, c.vat, y, this._amt(row.vatPercent === undefined ? d.taxPercent : row.vatPercent),
                { size: 8.0, color: this.C.muted, align: 'right' });
            this._txt(ctx, c.ht, y, this._amt(row.amount), { size: 8.0, bold: true, align: 'right' });

            y -= h;
            this._hline(ctx, M, R, y + 7, this.C.hair, 0.35);
        });
        return y;
    },

    _unit: function (row) {
        if (row.unit) return row.unit;
        const code = row.unitCode || 'C62';
        return this.UNIT_LABELS[code] || code;
    },

    // ============================================================
    // CARTOUCHE DES TOTAUX + MENTIONS (derniere page uniquement)
    // ============================================================
    _summary: function (ctx, d, tableBottom) {
        const M = this.M, R = this.PAGE_W - this.M;
        const top = tableBottom - 18;
        const bx = 365, bw = R - 365;

        const subs = d.taxSubtotals && d.taxSubtotals.length ? d.taxSubtotals : null;
        const rows = [['Base HT (BT-109)', d.taxExclusiveAmount]];
        if (subs && subs.length > 1) {
            subs.forEach((s) => {
                rows.push(['TVA ' + this._amt(s.percent) + ' % sur ' + this._amt(s.taxable), s.amount]);
            });
        } else {
            rows.push(['TVA ' + this._amt(d.taxPercent) + ' % (BT-110)', d.taxAmount]);
        }
        rows.push(['Total TTC (BT-112)', d.taxInclusiveAmount]);
        if (this._num(d.prepaidAmount) !== 0) {
            rows.push([(d.prepaidLabel || 'Acompte d\u00e9j\u00e0 vers\u00e9') + ' (BT-113)',
                -this._num(d.prepaidAmount)]);
        }

        const boxH = rows.length * 16 + 29;
        const boxY = top - boxH + 10;
        this._roundRect(ctx, bx, boxY, bw, boxH, 4, null, this.C.rule);

        let yy = top - 2;
        rows.forEach((r) => {
            const val = this._money(r[1]);
            const vw = this._w(val, 8.1);
            this._txt(ctx, bx + 10, yy, this._fit(r[0], 7.8, bw - 26 - vw), { size: 7.8, color: this.C.muted });
            this._txt(ctx, R - 10, yy, val, { size: 8.1, align: 'right' });
            yy -= 16;
        });

        // Net a payer (BT-115)
        this._roundRect(ctx, bx, boxY, bw, 25, 4, this.C.navy, null);
        this._fill(ctx, bx, boxY + 10, bw, 15, this.C.navy);
        this._txt(ctx, bx + 10, boxY + 8, 'NET \u00c0 PAYER (BT-115)', { size: 8.6, bold: true, color: this.C.white });
        this._txt(ctx, R - 10, boxY + 8, this._money(d.payableAmount),
            { size: 9.7, bold: true, color: this.C.white, align: 'right' });

        // --- Mentions legales (BT-22) ---
        let my = top - 2;
        this._txt(ctx, M, my, 'MENTIONS ET CONDITIONS', { size: 7.4, bold: true, color: this.C.muted });
        my -= 13;
        (d.notes || []).slice(0, 5).forEach((note) => {
            this._wrap(note, 7.3, bx - M - 16, 2).forEach((ln) => {
                this._txt(ctx, M, my, ln, { size: 7.3, color: this.C.muted });
                my -= 10;
            });
        });

        // --- Bloc paiement (BG-16 / BG-17) ---
        my -= 6;
        const payLines = [
            "Date d'\u00e9ch\u00e9ance : " + this._date(d.dueDate),
            'Mode : ' + (d.paymentMeans || 'Virement bancaire')
        ];
        // BG-10 : quand le beneficiaire du paiement n'est pas le fournisseur
        // (facture cedee a un factor, tiers payeur), le lisible doit dire
        // sans ambiguite a qui le reglement doit etre effectue.
        if (d.payee && d.payee.name) {
            payLines.push('R\u00e8glement \u00e0 : ' + d.payee.name +
                (d.payee.siret ? '  (SIRET ' + d.payee.siret + ')' : ''));
        }
        if (d.iban) {
            payLines.push('IBAN : ' + d.iban + (d.bic ? '   BIC : ' + d.bic : ''));
        }

        const ph = 20 + 12 * payLines.length + 3;
        if (my - ph > 66) {
            const boxW = bx - M - 14;
            this._roundRect(ctx, M, my - ph, boxW, ph, 4, this.C.light, this.C.rule);
            this._txt(ctx, M + 9, my - 14, d.payee ? 'PAIEMENT \u2014 R\u00c8GLEMENT \u00c0 UN TIERS' : 'PAIEMENT',
                { size: 7.3, bold: true, color: this.C.navy });
            let py = my - 27;
            payLines.forEach((line) => {
                this._txt(ctx, M + 9, py, this._fit(line, 7.3, boxW - 18), { size: 7.3, color: this.C.muted });
                py -= 12;
            });
        }
    },

    // ============================================================
    // PIED DE PAGE
    // ============================================================
    _pageFooter: function (ctx, d, pageNo, pageTotal, isLast) {
        const M = this.M, R = this.PAGE_W - this.M;
        const s = d.supplier;
        this._hline(ctx, M, R, 57, this.C.rule, 0.6);
        this._txt(ctx, M, 43, s.name + (s.siren ? ' | SIRET ' + s.siren + (s.nic || '00001') : '') +
            (s.vatNumber ? ' | TVA ' + s.vatNumber : ''), { size: 6.8, color: this.C.muted });
        this._txt(ctx, R, 43, 'Page ' + pageNo + ' / ' + pageTotal, { size: 6.8, color: this.C.muted, align: 'right' });
        // BT-33 : forme juridique et capital social, mention obligatoire sur
        // tout document commercial (art. R123-237 du Code de commerce).
        if (s.legalForm) {
            this._txt(ctx, M, 31, s.legalForm, { size: 6.8, color: this.C.muted });
        }
        this._txt(ctx, M, s.legalForm ? 20 : 31, isLast
            ? 'Ce document PDF est la repr\u00e9sentation lisible compl\u00e8te de la facture \u00e9lectronique \u00e9mise au format structur\u00e9 UBL 2.1.'
            : 'Suite de la facture sur la page suivante.', { size: 6.7, color: this.C.muted });
    },

    // ============================================================
    // PAGINATION
    // ============================================================
    _paginate: function (d) {
        const pages = [];
        let remaining = (d.lines || []).slice();
        const y0 = this._headerBottom(d) - 9;
        const availableLast = y0 - this.LAST_BOTTOM;
        const availableRegular = y0 - this.REG_BOTTOM;

        while (remaining.length) {
            const totalH = remaining.reduce((sum, r) => sum + this._rowHeight(r), 0);
            if (totalH <= availableLast) {
                pages.push({ rows: remaining, last: true });
                remaining = [];
                break;
            }
            const take = [];
            let used = 0;
            for (let i = 0; i < remaining.length; i++) {
                const h = this._rowHeight(remaining[i]);
                if (take.length && used + h > availableRegular) break;
                take.push(remaining[i]);
                used += h;
            }
            pages.push({ rows: take, last: false });
            remaining = remaining.slice(take.length);
        }
        if (!pages.length) pages.push({ rows: [], last: true });
        return pages;
    },

    // ============================================================
    // NORMALISATION DU MODELE PIVOT
    // ============================================================
    _normalize: function (input) {
        const d = Object.assign({}, input);
        d.lines = (d.lines || []).map((l) => Object.assign({}, l));
        d.notes = (d.notes || []).slice();
        d.docLabel = d.docLabel || this.DOC_LABELS[String(d.typeCode)] || 'FACTURE';

        if (d.taxSubtotals && d.taxSubtotals.length) {
            const taxed = d.taxSubtotals.filter((s) => this._num(s.percent) > 0);
            d.taxPercent = d.taxPercent !== undefined ? d.taxPercent
                : (taxed.length ? taxed[0].percent : d.taxSubtotals[0].percent);
            // Motifs d'exoneration remontes en mentions
            d.taxSubtotals.forEach((s) => {
                if (s.reason && d.notes.indexOf(s.reason) === -1) {
                    d.notes.push('TVA ' + this._amt(s.percent) + ' % \u2014 cat\u00e9gorie ' + s.category +
                        (s.code ? ', code ' + s.code : '') + ' : ' + s.reason);
                }
            });
        }
        if (d.taxPercent === undefined) d.taxPercent = 0;
        return d;
    },

    // ============================================================
    // ASSEMBLAGE DU FICHIER PDF
    // ============================================================
    _assemble: function (pages, title) {
        const nb = pages.length;
        const objs = [];
        const pageIds = [];
        for (let i = 0; i < nb; i++) pageIds.push(5 + i * 2);

        objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        objs[2] = '<< /Type /Pages /Count ' + nb + ' /Kids [' +
            pageIds.map((id) => id + ' 0 R').join(' ') + '] >>';
        objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
        objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

        pages.forEach((content, i) => {
            const pid = pageIds[i];
            objs[pid] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + this.PAGE_W + ' ' + this.PAGE_H +
                '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + (pid + 1) + ' 0 R >>';
            objs[pid + 1] = '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream';
        });

        const infoId = 5 + nb * 2;
        objs[infoId] = '<< /Title (' + this._esc(title) + ') /Producer (Re-Form-E PDF-Lisible v3) ' +
            '/Creator (rfe.fluxym.com) >>';

        let pdf = '%PDF-1.4\n';
        const offsets = [];
        for (let i = 1; i <= infoId; i++) {
            offsets[i] = pdf.length;
            pdf += i + ' 0 obj\n' + objs[i] + '\nendobj\n';
        }
        const xref = pdf.length;
        pdf += 'xref\n0 ' + (infoId + 1) + '\n0000000000 65535 f \n';
        for (let i = 1; i <= infoId; i++) pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
        pdf += 'trailer\n<< /Size ' + (infoId + 1) + ' /Root 1 0 R /Info ' + infoId + ' 0 R >>\nstartxref\n' +
            xref + '\n%%EOF\n';
        return pdf;
    },

    // ============================================================
    // API PUBLIQUE
    // build(data) -> { raw, base64, filename, bytes, pages }
    // ============================================================
    build: function (input) {
        const d = this._normalize(input);
        const first = this._render(d, 0);
        const pages = this._render(d, first.length);
        const raw = this._assemble(pages, d.docLabel + ' ' + d.invoiceNumber);

        let filename = String(d.invoiceNumber).replace(/[^a-zA-Z0-9._-]/g, '-') + '_lisible.pdf';
        if (filename.length > 50) filename = filename.slice(filename.length - 50);

        return {
            raw: raw,
            base64: this._toBase64(raw),
            filename: filename,
            bytes: raw.length,
            pages: pages.length
        };
    },

    _render: function (d, totalPages) {
        const defs = this._paginate(d);
        const total = totalPages || defs.length;
        return defs.map((pg, i) => {
            const ctx = { buf: [] };
            const tableTop = this._header(ctx, d, i + 1, total);
            const bottom = pg.last ? this.LAST_BOTTOM : this.REG_BOTTOM;
            this._rows(ctx, d, pg.rows, tableTop - 9);
            this._tableFrame(ctx, d, tableTop, bottom);
            if (pg.last) this._summary(ctx, d, bottom);
            else this._txt(ctx, this.PAGE_W - this.M, bottom - 16, 'Suite page suivante ...',
                { size: 7.2, color: this.C.muted, align: 'right' });
            this._pageFooter(ctx, d, i + 1, total, pg.last);
            return ctx.buf.join('\n');
        });
    },

    // Base64 : navigateur (btoa) ou Node (Buffer), sur une chaine latin1
    _toBase64: function (raw) {
        if (typeof btoa === 'function') return btoa(raw);
        return Buffer.from(raw, 'latin1').toString('base64');
    },

    // Conversion en Uint8Array pour un Blob de telechargement
    toBytes: function (raw) {
        const out = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i) & 0xff;
        return out;
    },

    toBlob: function (raw) {
        return new Blob([this.toBytes(raw)], { type: 'application/pdf' });
    }
};
