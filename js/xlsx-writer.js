/**
 * XLSX-WRITER.JS — Re·Form·E
 * Générateur de classeurs Excel (.xlsx) en JavaScript natif.
 *
 * Produit un fichier OOXML SpreadsheetML minimal mais valide, compressé
 * avec JSZip (déjà utilisé par le générateur UBL, chargé via CDN).
 *
 * Aucune dépendance supplémentaire n'est introduite.
 *
 * Format d'entrée attendu par build() :
 *   [
 *     {
 *       name: 'Nom de l’onglet',              // tronqué à 31 caractères, caractères interdits nettoyés
 *       cols: [40, 60, 30, 30],               // largeurs de colonnes (optionnel)
 *       freeze: 7,                            // nombre de lignes figées en haut (optionnel)
 *       hyperlinks: [                         // liens internes au classeur (optionnel)
 *         { ref: 'B7', location: "'Cas 1 - …'!A1" }
 *       ],
 *       rows: [
 *         [{ v: 'Titre', s: XlsxWriter.STYLE.TITLE }],
 *         ['texte simple', { v: 'autre', s: 6 }]
 *       ]
 *     }
 *   ]
 *
 * Index de styles disponibles : voir XlsxWriter.STYLE.
 */
const XlsxWriter = {

    /** Index des styles déclarés dans styles.xml (cellXfs). */
    STYLE: {
        DEFAULT: 0,
        TITLE: 1,
        SUBTITLE: 2,
        PARAGRAPH: 3,
        HEADER: 4,
        REF: 5,
        TEXT: 6,
        INPUT: 7,
        BADGE: 8,
        LINK: 9
    },

    /** Référence de cellule interne au classeur, échappée pour un hyperlien. */
    location(sheetName, cell = 'A1') {
        return `'${String(sheetName).replace(/'/g, "''")}'!${cell}`;
    },

    /** Échappe les caractères interdits dans du XML. */
    esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            // eslint-disable-next-line no-control-regex
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    },

    /** Convertit un index de colonne (1 → A, 27 → AA). */
    colName(index) {
        let name = '';
        let n = index;
        while (n > 0) {
            const rest = (n - 1) % 26;
            name = String.fromCharCode(65 + rest) + name;
            n = Math.floor((n - rest) / 26);
        }
        return name;
    },

    /** Nettoie un nom d'onglet Excel (31 caractères max, caractères interdits). */
    sheetName(raw, used) {
        let name = String(raw || 'Feuille')
            .replace(/[\\/*?:[\]]/g, '-')
            .trim()
            .slice(0, 31)
            .replace(/[\s\-–·]+$/, '');
        if (!name) name = 'Feuille';
        if (!used) return name;
        let candidate = name;
        let i = 2;
        while (used.has(candidate.toLowerCase())) {
            const suffix = ` (${i})`;
            candidate = name.slice(0, 31 - suffix.length) + suffix;
            i += 1;
        }
        used.add(candidate.toLowerCase());
        return candidate;
    },

    /** Normalise une cellule : chaîne simple ou objet { v, s }. */
    normalizeCell(cell) {
        if (cell === null || cell === undefined) return null;
        if (typeof cell === 'object') {
            return { v: cell.v ?? '', s: Number.isInteger(cell.s) ? cell.s : 0 };
        }
        return { v: cell, s: 0 };
    },

    /** Construit le XML d'une feuille. */
    buildSheetXml(sheet) {
        const cols = (sheet.cols || []).map((width, i) => {
            const idx = i + 1;
            return `<col min="${idx}" max="${idx}" width="${width}" customWidth="1"/>`;
        }).join('');

        const rows = (sheet.rows || []).map((row, rowIndex) => {
            const r = rowIndex + 1;
            const cells = (row || []).map((raw, colIndex) => {
                const cell = this.normalizeCell(raw);
                if (!cell || cell.v === '') {
                    if (!cell || !cell.s) return '';
                    return `<c r="${this.colName(colIndex + 1)}${r}" s="${cell.s}"/>`;
                }
                const ref = `${this.colName(colIndex + 1)}${r}`;
                return `<c r="${ref}" s="${cell.s}" t="inlineStr"><is><t xml:space="preserve">${this.esc(cell.v)}</t></is></c>`;
            }).join('');
            const height = sheet.heights && sheet.heights[rowIndex]
                ? ` ht="${sheet.heights[rowIndex]}" customHeight="1"` : '';
            return `<row r="${r}"${height}>${cells}</row>`;
        }).join('');

        const freeze = sheet.freeze
            ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${sheet.freeze}" topLeftCell="A${sheet.freeze + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
            : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';

        const merges = (sheet.merges || []).length
            ? `<mergeCells count="${sheet.merges.length}">${sheet.merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>`
            : '';

        // Les hyperliens internes (attribut location) ne nécessitent aucune relation.
        const links = (sheet.hyperlinks || []).length
            ? `<hyperlinks>${sheet.hyperlinks.map(link => `<hyperlink ref="${this.esc(link.ref)}" location="${this.esc(link.location)}" display="${this.esc(link.display || link.location)}"/>`).join('')}</hyperlinks>`
            : '';

        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${freeze}${cols ? `<cols>${cols}</cols>` : ''}<sheetData>${rows}</sheetData>${merges}${links}</worksheet>`;
    },

    /** Feuille de styles partagée. */
    buildStylesXml() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="8">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="15"/><color rgb="FF0B2046"/><name val="Calibri"/></font>
<font><i/><sz val="10"/><color rgb="FF6B7280"/><name val="Calibri"/></font>
<font><sz val="10"/><color rgb="FF4B5563"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FF0B2046"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FF00A7E1"/><name val="Calibri"/></font>
<font><u/><b/><sz val="10"/><color rgb="FF0563C1"/><name val="Calibri"/></font>
</fonts>
<fills count="5">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF0B2046"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF9FAFB"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFFBEB"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFD1D5DB"/></left><right style="thin"><color rgb="FFD1D5DB"/></right><top style="thin"><color rgb="FFD1D5DB"/></top><bottom style="thin"><color rgb="FFD1D5DB"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="10">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="5" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="6" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="7" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
    },

    /**
     * Construit le classeur et déclenche son téléchargement.
     * @param {Array} sheets  Liste des feuilles.
     * @param {string} filename  Nom du fichier téléchargé.
     * @returns {Promise<void>}
     */
    async download(sheets, filename) {
        const blob = await this.build(sheets);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    },

    /**
     * Construit le classeur et renvoie un Blob .xlsx.
     * @param {Array} sheets  Liste des feuilles.
     * @returns {Promise<Blob>}
     */
    async build(sheets) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip est requis pour générer un fichier .xlsx.');
        }
        const used = new Set();
        const prepared = sheets.map(sheet => ({ ...sheet, name: this.sheetName(sheet.name, used) }));

        const zip = new JSZip();

        zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${prepared.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('\n')}
</Types>`);

        zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);

        const xl = zip.folder('xl');

        xl.file('workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
${prepared.map((sheet, i) => `<sheet name="${this.esc(sheet.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('\n')}
</sheets>
</workbook>`);

        xl.folder('_rels').file('workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${prepared.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('\n')}
<Relationship Id="rId${prepared.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

        xl.file('styles.xml', this.buildStylesXml());

        const worksheets = xl.folder('worksheets');
        prepared.forEach((sheet, i) => {
            worksheets.file(`sheet${i + 1}.xml`, this.buildSheetXml(sheet));
        });

        return zip.generateAsync({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            compression: 'DEFLATE'
        });
    }
};
