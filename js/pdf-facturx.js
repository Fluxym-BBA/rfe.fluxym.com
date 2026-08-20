/**
 * PDF-FACTURX.JS - Emballage PDF/A-3B et Factur-X
 *
 * Un Factur-X n'est pas un PDF avec un XML collé dedans. C'est un PDF/A-3,
 * c'est-a-dire un document d'archivage, auquel le XML est associe par le
 * mecanisme des fichiers associes (Associated Files) introduit par PDF/A-3.
 * Quatre exigences en decoulent, et chacune suffit a faire rejeter le fichier :
 *
 *   1. Toutes les polices doivent etre embarquees, y compris les quatorze
 *      polices standard du PDF. D'ou data/font-liberation.js.
 *   2. Le document doit declarer un OutputIntent portant un profil ICC reel.
 *      Ce profil est construit ici, en 468 octets, sans donnee externe.
 *   3. Les metadonnees XMP doivent declarer pdfaid:part 3 et conformance B,
 *      ET decrire le namespace Factur-X dans un schema d'extension PDF/A.
 *      Sans ce schema d'extension, un namespace inconnu invalide le document.
 *   4. Chaque fichier embarque doit etre reference par le tableau /AF du
 *      catalogue, avec un /AFRelationship explicite.
 *
 * Le XML porte /AFRelationship /Data. La valeur /Alternative que l'on rencontre
 * souvent est un heritage de ZUGFeRD 1.x, corrigee depuis. Les pieces jointes
 * documentaires portent /Supplement.
 *
 * Ce module herite de PDFLisible par delegation : le moteur de rendu, les
 * metriques et la pagination sont reutilises tels quels. Seul _assemble est
 * redefini, ce qui suffit puisque build() l'appelle via this.
 *
 * Dependances, dans cet ordre : js/pdf-lisible.js, data/font-liberation.js.
 */

const PDFFacturX = Object.create(PDFLisible);

Object.assign(PDFFacturX, {

    // Nom du fichier embarque : impose par la specification, sensible a la casse.
    XML_NAME: 'factur-x.xml',
    XMP_NS: 'urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#',
    FX_VERSION: '1.0',
    CONFORMANCE: 'EN 16931',
    PRODUCER: 'Re-Form-E PDF-FacturX v1',

    // ============================================================
    // PRIMITIVES BINAIRES
    // Le PDF est assemble comme une chaine latin1 dont chaque caractere vaut
    // un octet : c'est ce qui permet d'y inserer un programme de police ou un
    // profil ICC sans quitter le JavaScript.
    // ============================================================
    _u8: (v) => String.fromCharCode(v & 255),
    _u16: (v) => String.fromCharCode((v >> 8) & 255, v & 255),
    _u32: (v) => String.fromCharCode((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255),
    _s15: function (v) { return this._u32(Math.round(v * 65536)); },
    _pad4: function (s) { return s + '\0'.repeat((4 - s.length % 4) % 4); },

    // Une chaine JavaScript est faite de caracteres, un flux PDF d'octets. Un
    // accent ou un symbole euro pese deux ou trois octets en UTF-8 : sans cette
    // conversion, les longueurs declarees et la table xref seraient fausses.
    _utf8: function (str) {
        const b = new TextEncoder().encode(str);
        let s = '';
        for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
        return s;
    },

    // Decodage base64 vers chaine d'octets, en environnement navigateur ou Node.
    _fromB64: function (b64) {
        if (typeof atob === 'function') return atob(b64);
        return Buffer.from(b64, 'base64').toString('latin1');
    },

    _pdfDate: function (d) {
        const p = (n) => String(n).padStart(2, '0');
        const off = -d.getTimezoneOffset();
        const sign = off >= 0 ? '+' : '-';
        return 'D:' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate())
            + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds())
            + sign + p(Math.floor(Math.abs(off) / 60)) + "'" + p(Math.abs(off) % 60) + "'";
    },

    _isoDate: function (d) {
        const p = (n) => String(n).padStart(2, '0');
        const off = -d.getTimezoneOffset();
        const sign = off >= 0 ? '+' : '-';
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T'
            + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
            + sign + p(Math.floor(Math.abs(off) / 60)) + ':' + p(Math.abs(off) % 60);
    },

    // ============================================================
    // PROFIL ICC sRGB
    // Profil v2.1 matrice/TRC, 9 balises, construit octet par octet. Les trois
    // courbes de transfert etant identiques, elles partagent le meme offset :
    // le profil tient ainsi en moins de 500 octets, contre environ 3 Ko pour un
    // profil sRGB complet.
    // ============================================================
    _icc: function () {
        const u16 = this._u16, u32 = this._u32;
        const s15 = (v) => this._s15(v);
        const Z = '\0\0\0\0';
        const xyz = (x, y, z) => 'XYZ ' + Z + s15(x) + s15(y) + s15(z);
        const curv = (g) => 'curv' + Z + u32(1) + u16(Math.round(g * 256));
        const text = (s) => 'text' + Z + s + '\0';
        const desc = (s) => {
            const a = s + '\0';
            return 'desc' + Z + u32(a.length) + a + u32(0) + u32(0) + u16(0) + '\0' + '\0'.repeat(67);
        };

        // Primaires sRGB adaptees a l'illuminant D50 du PCS.
        const tags = [
            ['desc', desc('sRGB IEC61966-2.1')],
            ['cprt', text('Public Domain')],
            ['wtpt', xyz(0.9642, 1.0, 0.8249)],
            ['rXYZ', xyz(0.4360, 0.2225, 0.0139)],
            ['gXYZ', xyz(0.3851, 0.7169, 0.0971)],
            ['bXYZ', xyz(0.1431, 0.0606, 0.7141)],
            ['rTRC', curv(2.2)],
            ['gTRC', curv(2.2)],
            ['bTRC', curv(2.2)]
        ];

        const base = 128 + 4 + tags.length * 12;
        let body = '', entries = '';
        const seen = {};
        tags.forEach((t) => {
            let e = seen[t[1]];
            if (!e) {
                e = { off: base + body.length, size: t[1].length };
                seen[t[1]] = e;
                body += this._pad4(t[1]);
            }
            entries += t[0] + u32(e.off) + u32(e.size);
        });
        const total = base + body.length;

        const header = u32(total) + Z + u32(0x02100000) + 'mntr' + 'RGB ' + 'XYZ '
            + u16(2026) + u16(8) + u16(21) + u16(0) + u16(0) + u16(0)
            + 'acsp' + Z + u32(0) + Z + Z + '\0'.repeat(8) + u32(0)
            + s15(0.9642) + s15(1.0) + s15(0.8249) + Z + '\0'.repeat(44);

        return header + u32(tags.length) + entries + body;
    },

    // ============================================================
    // METADONNEES XMP
    // Le bloc pdfaExtension:schemas n'est pas decoratif : PDF/A impose que tout
    // namespace de metadonnees non standard soit decrit par un schema
    // d'extension enumerant ses proprietes. Le namespace Factur-X en fait
    // partie, et son omission est la cause d'echec la plus frequente alors que
    // tout le reste du fichier est correct.
    // ============================================================
    _xmp: function (m) {
        const e = (s) => String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const prop = (name, desc) => `
                                    <rdf:li rdf:parseType="Resource">
                                        <pdfaProperty:name>${name}</pdfaProperty:name>
                                        <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                                        <pdfaProperty:category>external</pdfaProperty:category>
                                        <pdfaProperty:description>${desc}</pdfaProperty:description>
                                    </rdf:li>`;

        return `<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:title>
                <rdf:Alt><rdf:li xml:lang="x-default">${e(m.title)}</rdf:li></rdf:Alt>
            </dc:title>
            <dc:creator>
                <rdf:Seq><rdf:li>${e(m.author)}</rdf:li></rdf:Seq>
            </dc:creator>
            <dc:description>
                <rdf:Alt><rdf:li xml:lang="x-default">${e(m.subject)}</rdf:li></rdf:Alt>
            </dc:description>
        </rdf:Description>
        <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
            <xmp:CreatorTool>${e(m.producer)}</xmp:CreatorTool>
            <xmp:CreateDate>${m.date}</xmp:CreateDate>
            <xmp:ModifyDate>${m.date}</xmp:ModifyDate>
            <xmp:MetadataDate>${m.date}</xmp:MetadataDate>
        </rdf:Description>
        <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
            <pdf:Producer>${e(m.producer)}</pdf:Producer>
        </rdf:Description>
        <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
            <pdfaid:part>3</pdfaid:part>
            <pdfaid:conformance>B</pdfaid:conformance>
        </rdf:Description>
        <rdf:Description rdf:about=""
                xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/"
                xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#"
                xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#">
            <pdfaExtension:schemas>
                <rdf:Bag>
                    <rdf:li rdf:parseType="Resource">
                        <pdfaSchema:schema>Factur-X PDFA Extension Schema</pdfaSchema:schema>
                        <pdfaSchema:namespaceURI>${this.XMP_NS}</pdfaSchema:namespaceURI>
                        <pdfaSchema:prefix>fx</pdfaSchema:prefix>
                        <pdfaSchema:property>
                            <rdf:Seq>${prop('DocumentFileName', 'name of the embedded XML invoice file')}${prop('DocumentType', 'INVOICE')}${prop('Version', 'The actual version of the standard applying to the embedded XML file')}${prop('ConformanceLevel', 'The conformance level of the embedded XML file')}
                            </rdf:Seq>
                        </pdfaSchema:property>
                    </rdf:li>
                </rdf:Bag>
            </pdfaExtension:schemas>
        </rdf:Description>
        <rdf:Description rdf:about="" xmlns:fx="${this.XMP_NS}">
            <fx:DocumentType>INVOICE</fx:DocumentType>
            <fx:DocumentFileName>${this.XML_NAME}</fx:DocumentFileName>
            <fx:Version>${this.FX_VERSION}</fx:Version>
            <fx:ConformanceLevel>${this.CONFORMANCE}</fx:ConformanceLevel>
        </rdf:Description>
    </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
    },

    // Identifiant de document, exige par PDF/A dans le dictionnaire trailer.
    // Derive du titre, donc stable d'une generation a l'autre : deux executions
    // sur la meme facture produisent un fichier identique, ce qui rend les tests
    // de non-regression possibles.
    _docId: function (seed) {
        let out = '';
        for (let k = 0; k < 4; k++) {
            let h = 0x811c9dc5 ^ k;
            for (let i = 0; i < seed.length; i++) {
                h ^= seed.charCodeAt(i);
                h = (h + ((h << 1) >>> 0) + ((h << 4) >>> 0) + ((h << 7) >>> 0)
                    + ((h << 8) >>> 0) + ((h << 24) >>> 0)) >>> 0;
            }
            out += h.toString(16).padStart(8, '0');
        }
        return out.toUpperCase();
    },

    // ============================================================
    // ASSEMBLAGE PDF/A-3B
    // Redefinit _assemble de PDFLisible. Les flux de contenu des pages ne sont
    // pas touches : ils continuent de referencer /F1 et /F2, qui designent
    // desormais des polices TrueType embarquees au lieu des polices standard.
    // Le rendu est donc rigoureusement le meme, le fichier ne l'est plus.
    // ============================================================
    _assemble: function (pages, title) {
        const nb = pages.length;
        const objs = [];
        const pageIds = [];
        for (let i = 0; i < nb; i++) pageIds.push(5 + i * 2);

        const infoId = 5 + nb * 2;
        const metaId = infoId + 1;
        const iccId = infoId + 2;
        const oiId = infoId + 3;
        const fdR = infoId + 4, ffR = infoId + 5;
        const fdB = infoId + 6, ffB = infoId + 7;

        let next = infoId + 8;
        const attached = ((this._fx && this._fx.files) || []).map((f) => {
            const o = { spec: next, stream: next + 1, f: f };
            next += 2;
            return o;
        });
        const lastId = next - 1;

        const now = this._fx && this._fx.now ? this._fx.now : new Date();
        const modDate = this._pdfDate(now);

        const stream = (dict, data) =>
            '<< ' + dict + ' /Length ' + data.length + ' >>\nstream\n' + data + '\nendstream';

        // --- Catalogue : Metadata, OutputIntents, /AF et l'arbre des noms ---
        // Les entrees d'un arbre de noms doivent etre triees par cle, sans quoi
        // la recherche binaire du lecteur echoue.
        const sorted = attached.slice().sort((a, b) => (a.f.name < b.f.name ? -1 : 1));
        let cat = '<< /Type /Catalog /Pages 2 0 R /Metadata ' + metaId + ' 0 R'
            + ' /OutputIntents [' + oiId + ' 0 R]';
        if (attached.length) {
            cat += ' /AF [' + attached.map((a) => a.spec + ' 0 R').join(' ') + ']'
                + ' /Names << /EmbeddedFiles << /Names ['
                + sorted.map((a) => '(' + this._esc(a.f.name) + ') ' + a.spec + ' 0 R').join(' ')
                + '] >> >>';
        }
        objs[1] = cat + ' >>';

        objs[2] = '<< /Type /Pages /Count ' + nb + ' /Kids ['
            + pageIds.map((id) => id + ' 0 R').join(' ') + '] >>';

        // --- Polices TrueType embarquees ---
        const fontDict = (f, dsc) => '<< /Type /Font /Subtype /TrueType /BaseFont /' + f.psName
            + ' /FirstChar ' + f.firstChar + ' /LastChar ' + f.lastChar
            + ' /Widths [' + f.widths.join(' ') + ']'
            + ' /FontDescriptor ' + dsc + ' 0 R /Encoding /WinAnsiEncoding >>';
        const fontDesc = (f, ff) => '<< /Type /FontDescriptor /FontName /' + f.psName
            + ' /Flags ' + f.flags + ' /FontBBox [' + f.bbox.join(' ') + ']'
            + ' /ItalicAngle ' + f.italicAngle + ' /Ascent ' + f.ascent
            + ' /Descent ' + f.descent + ' /CapHeight ' + f.capHeight
            + ' /StemV ' + f.stemV + ' /MissingWidth 0 /FontFile2 ' + ff + ' 0 R >>';

        const reg = FontLiberation.regular, bold = FontLiberation.bold;
        objs[3] = fontDict(reg, fdR);
        objs[4] = fontDict(bold, fdB);
        objs[fdR] = fontDesc(reg, ffR);
        objs[fdB] = fontDesc(bold, ffB);
        const regData = this._fromB64(reg.data);
        const boldData = this._fromB64(bold.data);
        objs[ffR] = stream('/Length1 ' + regData.length, regData);
        objs[ffB] = stream('/Length1 ' + boldData.length, boldData);

        // --- Pages : inchangees ---
        pages.forEach((content, i) => {
            const pid = pageIds[i];
            objs[pid] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + this.PAGE_W + ' ' + this.PAGE_H
                + '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + (pid + 1) + ' 0 R >>';
            objs[pid + 1] = '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream';
        });

        // --- Info : dc:title du XMP et /Title doivent concorder ---
        objs[infoId] = '<< /Title (' + this._esc(title) + ') /Producer (' + this.PRODUCER + ')'
            + ' /Creator (rfe.fluxym.com) /CreationDate (' + modDate + ') /ModDate (' + modDate + ') >>';

        // --- Metadonnees XMP et intention de sortie ---
        const xmp = this._utf8(this._xmp({
            title: title,
            author: (this._fx && this._fx.author) || 'rfe.fluxym.com',
            subject: 'Facture hybride Factur-X, profil ' + this.CONFORMANCE,
            producer: this.PRODUCER,
            date: this._isoDate(now)
        }));
        objs[metaId] = stream('/Type /Metadata /Subtype /XML', xmp);

        const icc = this._icc();
        objs[iccId] = stream('/N 3', icc);
        objs[oiId] = '<< /Type /OutputIntent /S /GTS_PDFA1'
            + ' /OutputConditionIdentifier (sRGB IEC61966-2.1) /Info (sRGB IEC61966-2.1)'
            + ' /RegistryName (http://www.color.org) /DestOutputProfile ' + iccId + ' 0 R >>';

        // --- Fichiers associes ---
        attached.forEach((a) => {
            objs[a.spec] = '<< /Type /Filespec /F (' + this._esc(a.f.name) + ')'
                + ' /UF (' + this._esc(a.f.name) + ')'
                + ' /Desc (' + this._esc(a.f.desc) + ')'
                + ' /AFRelationship /' + a.f.rel
                + ' /EF << /F ' + a.stream + ' 0 R >> >>';
            objs[a.stream] = stream('/Type /EmbeddedFile /Subtype /' + a.f.mime
                + ' /Params << /Size ' + a.f.data.length + ' /ModDate (' + modDate + ') >>', a.f.data);
        });

        // --- Serialisation. PDF/A impose la version 1.7 et un /ID au trailer ---
        let pdf = '%PDF-1.7\n%\xe2\xe3\xcf\xd3\n';
        const offsets = [];
        for (let i = 1; i <= lastId; i++) {
            offsets[i] = pdf.length;
            pdf += i + ' 0 obj\n' + (objs[i] === undefined ? '<< >>' : objs[i]) + '\nendobj\n';
        }
        const xref = pdf.length;
        pdf += 'xref\n0 ' + (lastId + 1) + '\n0000000000 65535 f \n';
        for (let i = 1; i <= lastId; i++) pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
        const id = this._docId(title + '|' + nb);
        pdf += 'trailer\n<< /Size ' + (lastId + 1) + ' /Root 1 0 R /Info ' + infoId + ' 0 R'
            + ' /ID [<' + id + '> <' + id + '>] >>\nstartxref\n' + xref + '\n%%EOF\n';
        return pdf;
    },

    // ============================================================
    // API PUBLIQUE
    // buildFacturX(donnees, xmlCII, piecesJointes) -> { raw, base64, filename }
    //
    // Le PDF ne peut pas etre sa propre piece jointe : en Factur-X, la valeur
    // LISIBLE du BT-123 disparait, le PDF ETANT le document lisible. Les autres
    // pieces sont embarquees comme fichiers associes du PDF/A-3, avec la
    // relation /Supplement, et non recopiees en base64 dans le XML.
    // ============================================================
    buildFacturX: function (input, ciiXml, attachments, opts) {
        opts = opts || {};
        const files = [{
            name: this.XML_NAME,
            desc: 'Facture electronique CII D22B, profil ' + this.CONFORMANCE,
            mime: 'text#2Fxml',
            rel: 'Data',
            data: this._utf8(ciiXml)
        }];

        (attachments || []).forEach((a) => {
            files.push({
                name: a.filename,
                desc: a.desc || a.description || 'Piece jointe',
                mime: a.mime || 'application#2Fpdf',
                rel: 'Supplement',
                data: a.raw !== undefined ? a.raw : this._fromB64(a.base64)
            });
        });

        this._fx = { files: files, now: opts.now || new Date(), author: opts.author };
        let doc;
        try {
            doc = this.build(input);
        } finally {
            this._fx = null;
        }

        let filename = String(input.invoiceNumber || 'facture')
            .replace(/[^a-zA-Z0-9._-]/g, '-') + '_facturx.pdf';
        if (filename.length > 50) filename = filename.slice(filename.length - 50);

        return {
            raw: doc.raw,
            base64: this._toBase64(doc.raw),
            filename: filename,
            bytes: doc.raw.length,
            pages: doc.pages,
            attachments: files.length
        };
    }
});
