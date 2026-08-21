/**
 * UBL-GENERATOR.JS v4
 * Cas d'usage AFNOR XP Z12-014 — donnees uniques et realistes
 * Config-driven + ZIP pour litige-avoir, litige-rectificative, pack B
 *
 * Auteur: Bruno BARTOLI — Fluxym / Re-Form-E
 * Date: 2026-08-21
 * Changelog v4a — fidelite du pivot CII (lot L1) :
 *   - buildCiiPivot : le beneficiaire du paiement (BG-10) suit desormais la
 *     meme cascade que buildXML (tiers importe, factor, distributeur,
 *     collaborateur). Le CII perdait auparavant ce tiers pour les cas 5 et 9,
 *     ainsi qu'en mode donnees importees.
 *   - buildCiiPivot : le tiers PAYEUR (BG-2 etendu) est transporte et emis en
 *     ram:PayerTradeParty pour les seuls cas en profil EXTENDED-CTC-FR (1, 3, 4,
 *     14, 17b, 19a). Sous EN 16931 pur, il reste volontairement non emis.
 * Changelog v4b — lot L2 vague 1 :
 *   - resolvePayee : la cascade du beneficiaire du paiement est unifiee. Elle
 *     etait ecrite trois fois (UBL, pivot CII, lisible) et avait divergé : le
 *     lisible perdait le distributeur du cas 9 et le collaborateur du cas 5,
 *     exactement comme le CII avant correction.
 *   - PDF_CASES : 8 cas de la vague 1 ajoutes apres audit par lecture croisee.
 * Changelog v4c — lot L2 vague 2 :
 *   - Les mentions transmises au lisible conservent leur code sujet BT-21, ce
 *     qui permet de les hierarchiser : un motif d'exoneration de TVA (mention
 *     obligatoire, CGI art. 289) ne peut plus etre evince des cinq lignes
 *     affichables par une clause de penalites de retard commune aux 57 cas.
 *   - PDF_CASES : 7 cas de la vague 2, dont les fondements ont ete valides.
 * Changelog v4a suite :
 *   - Pack B : lignes et avoir passes en modele declaratif (getLineData /
 *     getPackBCreditData). Le cas gagne un modele pivot, donc le CII et
 *     l'eligibilite au lisible ; l'UBL reste identique au bloc cable.
 *   - Branche generique : BT-132 (ligne de commande) declaratif, et opt-out
 *     noItemRef pour les libelles qui sont deja des codes article.
 *   - PDF_CASES : les 4 variantes nominal-* rattachees au lisible nominal,
 *     dont elles partagent le XML a l'identique.
 *   - RESTE OUVERT : le tiers PAYEUR (cfg.payer) n'est toujours pas transporte
 *     dans le pivot CII, faute d'element normalise identifie dans la sequence
 *     XSD de ram:ApplicableHeaderTradeSettlement. Voir lot L1, point 1.
 * Changelog v4 — composition hierarchique de la facture (refonte ergonomique) :
 *   - getArtifactOptions (liste plate de 7 artefacts) remplace par getComposition :
 *     { format, embed, side }. Le format de la facture est un choix EXCLUSIF
 *     (UBL 2.1, CII D22B ou Factur-X), ce qui est embarque dans le fichier de
 *     facture est un choix independant, et les PDF autonomes en sont un troisieme
 *     - le bloc monolithique "3 pieces jointes" n'a plus cours : lisible, bon de
 *     commande et bon de livraison s'embarquent separement, dans n'importe quelle
 *     combinaison, en UBL comme en CII
 *   - demander l'embarquement d'un bon n'impose plus de telecharger son PDF, et
 *     reciproquement : les etages B et C ne se commandent plus l'un l'autre
 *   - Factur-X : la representation lisible est vraie par construction (le PDF/A-3B
 *     EST le lisible), donc aucun BG-24 LISIBLE n'est emis
 *   - composeSuffix : source unique du nom de fichier, partagee avec le
 *     recapitulatif affiche avant le clic
 * Changelog v3g — decouplage des pieces jointes (lot 5) :
 *   - getArtifactOptions expose annexFiles, distinct de annexes : embarquer les
 *     bons de commande et de livraison dans le XML (BG-24) et les telecharger en
 *     PDF autonomes sont desormais deux choix independants
 *   - le Factur-X est desactive pour les cas sans representation lisible verifiee
 *   - aucune valeur par defaut ne force un artefact : seul l'UBL nu est coche
 *   - nom d'archive unifie (Pack_...) — le "triptyque" n'a plus cours
 * Changelog v3f — pieces jointes multiples (lot 4) :
 *   - buildXML accepte un tableau de pieces jointes BG-24 : LISIBLE plus
 *     BON_COMMANDE et BON_LIVRAISON (BT-123, liste fermee BR-FR-17)
 *   - BT-16 cac:DespatchDocumentReference emis avec le bon de livraison
 *   - nouvel artefact _UBL_avec_3_PJ.xml, en plus de la variante mono-PJ
 *   - bon de commande et bon de livraison produits par js/pdf-annexes.js
 *     depuis le meme modele pivot que le lisible
 * Changelog v3e — devise etrangere et remises/frais (lot 3b) :
 *   - Cas T4 : BT-5 devise du document, BT-6 devise de comptabilisation,
 *     BT-111 montant de TVA en euros (second cac:TaxTotal sans sous-total)
 *   - Cas T6 : BG-20 / BG-21 au niveau document, BG-27 / BG-28 au niveau ligne,
 *     BT-107 / BT-108 dans les totaux, base de TVA recalculee (BR-CO-10)
 *   - computeTaxBreakdown integre les remises et frais de niveau document
 *   - toutes les briques XML acceptent une devise, EUR par defaut
 * Changelog v3d — regimes de TVA transverses (lot 3a) :
 *   - VAT: AUTOLIQ (AE / VATEX-FR-AE), FRANCHISE (E / VATEX-FR-FRANCHISE),
 *     INTRACOM (K / VATEX-EU-IC) ; EXPORT (G / VATEX-EU-G) reutilise
 *   - Cas T1 autoliquidation BTP, T2 franchise en base, T7 livraison
 *     intracommunautaire, T8 exportation hors UE
 *   - caseConfig.forceSupplier / forceBuyer : le regime impose la nature des parties
 *   - caseConfig.barCode : B2BINT pour les operations internationales (BR-FR-31)
 *   - Cles de TVA francaises recalculees dans companies.json (6 valeurs invalides)
 * Changelog v3c — recadrage du perimetre e-invoicing :
 *   - NO_INVOICE_CASES : cas hors perimetre e-invoicing (aucune facture produite)
 *     24 arrhes, 27 peages, 29 flux internes d'un assujetti unique
 *   - Cas MIXTE requalifies sur leur variante e-invoicing explicite (6, 25, 28, 32, 35, 42)
 *   - 33 TVA sur la marge : base sur la marge (E) + base taxee (S) sur la meme facture
 *   - nominal-litige-avoir : branche getLineData ajoutee, avoir partiel pilote par
 *     getCreditNoteData(), bloc avoir hardcode reserve au pack B
 * Changelog v3b:
 *   - nominal-litige-rectificative genere un ZIP (originale 380 + rectificative 384)
 *   - buildXML accepte overrideLineData pour surcharger les donnees de ligne
 *   - buildXML accepte attachment pour embarquer le lisible PDF (BG-24 / BT-125)
 *   - buildRenderData produit le modele pivot du lisible depuis les memes donnees
 *   - Labels avec numeros de cas d'usage dans pedagogy.json
 */

const UBLGenerator = {

    // =====================================================
    // CONFIG PAR CAS D'USAGE
    // =====================================================
    // =====================================================
    // PROFILS DE TVA (socle AFNOR / codelist VATEX)
    // BT-118 categorie, BT-119 taux, BT-121 code d'exoneration, BT-120 motif
    // =====================================================
    VAT: {
        STANDARD:  { category: "S", percent: "20.00", code: "", reason: "" },
        DEBOURS:   { category: "O", percent: "0.00", code: "VATEX-EU-O", reason: "Hors du perimetre d'application de la TVA" },
        GROUPE_TVA:{ category: "O", percent: "0.00", code: "VATEX-EU-O", reason: "Operations internes a l'assujetti unique - article 256 C du CGI" },
        MARGE:     { category: "E", percent: "0.00", code: "VATEX-EU-F", reason: "Regime particulier - Biens d'occasion - article 297 A du CGI" },
        EXPORT:    { category: "G", percent: "0.00", code: "VATEX-EU-G", reason: "Exoneration de TVA pour exportation hors UE - article 262-I du CGI" },
        // Regimes transverses : l'operation reste facturable en e-invoicing,
        // seule la ventilation de TVA change. Codes issus de la liste VATEX
        // publiee par la Commission (VATEX-FR-* reserves au domestique France).
        AUTOLIQ:   { category: "AE", percent: "0.00", code: "VATEX-FR-AE", reason: "Autoliquidation de la TVA par le preneur - article 283-2 nonies du CGI" },
        FRANCHISE: { category: "E",  percent: "0.00", code: "VATEX-FR-FRANCHISE", reason: "TVA non applicable - article 293 B du CGI" },
        INTRACOM:  { category: "K",  percent: "0.00", code: "VATEX-EU-IC", reason: "Exoneration de TVA - livraison intracommunautaire - article 262 ter I du CGI" }
    },

    // =====================================================
    // PERIMETRE : CAS SANS FACTURE E-INVOICING
    // =====================================================
    // Ces cas d'usage restent selectionnables pour leur valeur pedagogique
    // mais ne donnent lieu a AUCUNE facture electronique : l'operation
    // releve du e-reporting (flux 10) ou est hors du champ de la TVA.
    // Produire un XML pour ces cas serait trompeur pour un developpeur
    // qui s'en servirait comme reference.
    NO_INVOICE_CASES: {
        "24": "Les arrhes constituent une indemnite d'immobilisation (article 1590 du Code civil) : hors du champ de la TVA, elles ne donnent lieu a aucune facture. La vente qui suit releve du cas 1 ou du cas 20.",
        "27": "Le client n'est pas identifie au moment du passage au peage : l'operation est traitee en B2C et releve du e-reporting (flux 10.3 / 10.4), sans facture electronique.",
        "29": "Les operations internes a un assujetti unique sont hors du champ de la TVA (article 256 C du CGI) : aucune facture e-invoicing. Seules les factures B2B externes emises par l'assujetti unique entrent dans le perimetre — cas a creer."
    },

    // Un cas est productible s'il donne lieu a une facture e-invoicing.
    isProductible: function(usecase) {
        return !this.NO_INVOICE_CASES[usecase];
    },

    // Profil de TVA par cas d'usage. vat = profil applique a toutes les lignes.
    // lineVat = profil par identifiant de ligne (facture mixte).
    // customization = CustomizationID specifique (obligatoire si melange O + S).
    vatProfiles: {
        "16": {
            lineVat: { "1": "STANDARD", "2": "DEBOURS", "3": "DEBOURS" },
            customization: "urn:cen.eu:en16931:2017#conformant#urn.cpro.gouv.fr:1p0:extended-ctc-fr"
        },
        // 33 : la marge est exoneree (E / VATEX-EU-F), les prestations
        // annexes restent taxees au taux normal. Deux sous-totaux BG-23.
        "33": { lineVat: { "1": "MARGE", "2": "STANDARD" } },
        // Regimes de TVA transverses : un seul sous-total BG-23, taux 0.
        "T1": { vat: "AUTOLIQ" },
        "T2": { vat: "FRANCHISE" },
        "T7": { vat: "INTRACOM" },
        "T8": { vat: "EXPORT" }
    },

    // Profil de TVA applicable a une ligne donnee.
    getLineVat: function(usecase, lineId) {
        var profile = this.vatProfiles[usecase] || {};
        var key = (profile.lineVat && profile.lineVat[lineId]) || profile.vat || "STANDARD";
        return this.VAT[key] || this.VAT.STANDARD;
    },

    // Cas portant une extension EXT-FR-FE-* : le profil etendu est obligatoire.
    //   1        EXT-FR-FE-135    n° de commande au niveau ligne
    //   3, 4     EXT-FR-FE-BG-02  payeur de la facture (tiers payeur)
    //   14       EXT-FR-FE-BG-03  agent de vendeur
    //   17b, 19a EXT-FR-FE-BG-05  facturant (mandataire de facturation)
    EXTENDED_CASES: ["1", "3", "4", "14", "17b", "19a"],

    getCustomizationId: function(usecase) {
        var profile = this.vatProfiles[usecase] || {};
        if (profile.customization) return profile.customization;
        if (this.EXTENDED_CASES.indexOf(usecase) !== -1) {
            return "urn:cen.eu:en16931:2017#conformant#urn.cpro.gouv.fr:1p0:extended-ctc-fr";
        }
        return "urn:cen.eu:en16931:2017";
    },

    // Ventilation BG-23 : un sous-total par couple categorie / taux,
    // calcule a partir des lignes pour garantir BR-S-08 et BR-CO-*.
    computeTaxBreakdown: function(usecase, ld) {
        var self = this;
        var groups = {};
        var order = [];
        var add = function(vat, amount) {
            var key = vat.category + "|" + vat.percent;
            if (!groups[key]) { groups[key] = { vat: vat, taxable: 0 }; order.push(key); }
            groups[key].taxable += amount;
        };
        ld.lines.forEach(function(line) {
            add(self.getLineVat(usecase, line.id), parseFloat(line.amount));
        });
        // BR-S-08 etendue : la base d'un sous-total BG-23 integre les frais de niveau
        // document (BG-21) et retranche les remises de niveau document (BG-20)
        // rattaches a la meme categorie et au meme taux. Les remises et frais de
        // niveau ligne sont deja absorbes dans le montant net de la ligne (BT-131).
        (ld.allowanceCharges || []).forEach(function(ac) {
            add({ category: ac.category || "S", percent: ac.percent || "20.00", code: null, reason: null },
                (ac.charge ? 1 : -1) * parseFloat(ac.amount));
        });
        return order.map(function(key) {
            var g = groups[key];
            var taxable = Math.round(g.taxable * 100) / 100;
            var amount = Math.round(taxable * parseFloat(g.vat.percent)) / 100;
            return {
                taxable: taxable.toFixed(2),
                amount: amount.toFixed(2),
                category: g.vat.category,
                percent: g.vat.percent,
                code: g.vat.code,
                reason: g.vat.reason
            };
        });
    },

    caseConfig: {
        // --- A. CAS STANDARDS ---
        "nominal":                     { typeCode: "380", profile: "S1", zip: false },
        "nominal-rejet-emission":      { typeCode: "380", profile: "S1", zip: false },
        "nominal-non-transmise":       { typeCode: "380", profile: "S1", zip: false },
        "nominal-rejet-reception":     { typeCode: "380", profile: "S1", zip: false },
        "nominal-refus":               { typeCode: "380", profile: "S1", zip: false },
        "nominal-litige-avoir":        { typeCode: "381", profile: "S1", zip: true, creditNote: true },
        "nominal-litige-rectificative":{ typeCode: "384", profile: "S1", zip: true, rectificative: true },
        "1":  { typeCode: "380", profile: "B1", zip: false, multiPO: true },
        "31": { typeCode: "380", profile: "M1", zip: false },

        // --- B. PAIEMENTS, FRAIS & TIERS PAYEURS ---
        "2":  { typeCode: "380", profile: "S2", zip: false, prepaid: true },
        "3":  { typeCode: "380", profile: "S1", zip: false, payer: "opco_formation" },
        "4":  { typeCode: "380", profile: "S1", zip: false, partialPrepaid: true, payer: "opco_formation" },
        "5":  { typeCode: "380", profile: "S2", zip: false, prepaid: true, payeeType: "collaborateur" },
        "7":  { typeCode: "380", profile: "B2", zip: false, prepaid: true, paymentMeans: "48" },

        // --- C. AFFACTURAGE & TIERS BENEFICIAIRES ---
        "8":  { typeCode: "393", profile: "S1", zip: false, payeeType: "factor" },
        "9":  { typeCode: "380", profile: "S1", zip: false, payeeType: "distributeur" },
        "10": { typeCode: "380", profile: "S1", zip: false },

        // --- D. INTERMEDIAIRES & MANDATAIRES ---
        "11": { typeCode: "380", profile: "B1", zip: false },
        "12": { typeCode: "380", profile: "S1", zip: false, agentVendeur: true },
        "15": { typeCode: "380", profile: "B1", zip: false },
        "16": { typeCode: "380", profile: "S1", zip: false },

        // --- E. SOUS-TRAITANCE & CO-TRAITANCE ---
        "13": { typeCode: "380", profile: "S5", zip: false },
        "14": { typeCode: "380", profile: "S6", zip: false, agent: "seller_agent" },

        // --- F. MARKETPLACE & MANDAT ---
        "17a": { typeCode: "380", profile: "S1", zip: false },
        "17b": { typeCode: "380", profile: "S1", zip: false, facturant: "marketplace_fr" },
        "19a": { typeCode: "380", profile: "S1", zip: false, facturant: "criee_atlantique" },
        "19b": { typeCode: "389", profile: "S1", zip: false, agentVendeur: true, selfBilling: true },

        // --- G. FACTURES COMPLEMENTAIRES (383 interdit par BR-FR-04) ---
        "18":  { typeCode: "380", profile: "S1", zip: false, billingRef: true },

        // --- H. ACOMPTE & SOLDE ---
        "20":  { typeCode: "386", profile: "S1", zip: false },
        "21":  { typeCode: "380", profile: "S4", zip: false, billingRef: true },
        "32":  { typeCode: "386", profile: "S1", zip: false },

        // --- I. ESCOMPTE ---
        "22a": { typeCode: "380", profile: "S1", zip: false },
        "22b": { typeCode: "380", profile: "B1", zip: false },

        // --- J. CAS SPECIAUX ---
        "23": { typeCode: "380", profile: "S1", zip: false },
        "25": { typeCode: "380", profile: "S1", zip: false },
        "26": { typeCode: "380", profile: "S1", zip: false, retenue: "5" },
        "28": { typeCode: "380", profile: "S7", zip: false, prepaid: true },
        "30": { typeCode: "380", profile: "S7", zip: false, prepaid: true },
        // 24 arrhes, 27 peages, 29 flux internes d'un assujetti unique :
        // hors perimetre e-invoicing, voir NO_INVOICE_CASES.
        "6":  { typeCode: "380", profile: "S7", zip: false, prepaid: true },
        "42": { typeCode: "380", profile: "B7", zip: false, prepaid: true },

        // --- K. CAS AVANCES & REGIMES SPECIAUX ---
        "33": { typeCode: "380", profile: "B1", zip: false },
        "34": { typeCode: "380", profile: "S1", zip: false },
        "35": { typeCode: "380", profile: "S1", zip: false },
        "36": { typeCode: "380", profile: "S1", zip: false },
        "37": { typeCode: "380", profile: "S1", zip: false },
        "38": { typeCode: "380", profile: "S1", zip: false },
        "39": { typeCode: "380", profile: "S8", zip: false },
        "40": { typeCode: "380", profile: "S1", zip: false, paymentMeans: "97", netting: true },
        "41": { typeCode: "380", profile: "S1", zip: false },

        // --- L. REGIMES DE TVA TRANSVERSES ---
        // La categorie de TVA (BT-118) et le motif d'exoneration (BT-120 / BT-121)
        // portent tout le regime. La nature des parties est imposee par le cas :
        // une franchise en base suppose un vendeur sans numero de TVA, une livraison
        // intracommunautaire un acheteur assujetti dans un autre Etat membre.
        "T1": { typeCode: "380", profile: "S5", zip: false,
                forceSupplier: "st_batiment", forceBuyer: "constructeur_general" },
        "T2": { typeCode: "380", profile: "S1", zip: false,
                forceSupplier: "micro_conseil" },
        "T7": { typeCode: "380", profile: "S1", zip: false,
                forceBuyer: "technik_gmbh", barCode: "B2BINT" },
        "T8": { typeCode: "380", profile: "S1", zip: false,
                forceBuyer: "helvetia_sa", barCode: "B2BINT" },
        // T4 : la devise du document n'est pas l'euro. La TVA doit rester exprimee
        // en euros, d'ou BT-6 (devise de comptabilisation) et BT-111 (montant de
        // TVA converti). fxRate = nombre d'unites de devise pour 1 EUR.
        "T4": { typeCode: "380", profile: "S1", zip: false,
                currency: "USD", fxRate: "1.0860" },
        // T6 : remises et frais aux quatre emplacements prevus par la norme,
        // BG-20 et BG-21 au niveau document, BG-27 et BG-28 au niveau ligne.
        "T6": { typeCode: "380", profile: "S1", zip: false },

        // --- TESTS & PACKS ---
        "A": { typeCode: "999", profile: "S1", zip: false },
        "B": { typeCode: "380", profile: "B1", zip: true, creditNote: true }
    },

    // =====================================================
    // DONNEES DE LIGNE PAR CAS — Donnees uniques
    // BR-S-08 verifie pour chaque cas
    // =====================================================
    // Avoir du pack B : annulation d'une unite du PO 000003. Declaratif pour
    // les memes raisons que le pack lui-meme. Montants du bloc cable.
    getPackBCreditData: function() {
        return {
            tax: ["6.32", "1.26"],
            totals: ["6.32", "6.32", "7.58", "0.00", "7.58"],
            lines: [
                { id: "1", qty: "-1.00", amount: "6.32", desc: "Annulation 1 unite CNT50922",
                  price: "6.32", po: { line: "000003" }, noItemRef: true }
            ]
        };
        // BR-S-08: base 6.32 = ligne 6.32, TVA 20% = 1.26
    },

    getLineData: function(usecase) {
        switch(usecase) {

            // ================================================
            //  A — CAS STANDARDS
            // ================================================

            case "nominal":
                return {
                    tax: ["12000.00", "2400.00"],
                    totals: ["12000.00", "12000.00", "14400.00", "0.00", "14400.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "8400.00", desc: "Licence logiciel ERP Cloud - 12 mois", price: "8400.00" },
                        { id: "2", qty: "3.00", amount: "3600.00", desc: "Formation utilisateurs (3 jours)", price: "1200.00" }
                    ]
                };
                // BR-S-08: 8400+3600 = 12000

            case "nominal-rejet-emission":
                return {
                    tax: ["5750.00", "1150.00"],
                    totals: ["5750.00", "5750.00", "6900.00", "0.00", "6900.00"],
                    lines: [
                        { id: "1", qty: "5.00", amount: "5750.00", desc: "Consulting IT - Migration Cloud (5 jours)", price: "1150.00" }
                    ]
                };

            case "nominal-non-transmise":
                return {
                    tax: ["1122.00", "224.40"],
                    totals: ["1122.00", "1122.00", "1346.40", "0.00", "1346.40"],
                    lines: [
                        { id: "1", qty: "50.00", amount: "210.00", desc: "Ramettes papier A4 80g recycle", price: "4.20" },
                        { id: "2", qty: "6.00", amount: "537.00", desc: "Toner HP LaserJet 26X", price: "89.50" },
                        { id: "3", qty: "100.00", amount: "375.00", desc: "Classeurs levier A4 dos 80mm", price: "3.75" }
                    ]
                };

            case "nominal-rejet-reception":
                return {
                    tax: ["2850.00", "570.00"],
                    totals: ["2850.00", "2850.00", "3420.00", "0.00", "3420.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "2850.00", desc: "Location nacelle elevatrice 18m - Mars 2026", price: "2850.00" }
                    ]
                };

            case "nominal-refus":
                return {
                    tax: ["7200.00", "1440.00"],
                    totals: ["7200.00", "7200.00", "8640.00", "0.00", "8640.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "4500.00", desc: "Campagne marketing digital Q1 2026", price: "4500.00" },
                        { id: "2", qty: "1.00", amount: "2700.00", desc: "Creation contenu et visuels (15 posts)", price: "2700.00" }
                    ]
                };

            // nominal-litige-avoir : donnees de la FACTURE CONTESTEE (380).
            // L'avoir partiel (381) qui l'accompagne est dans getCreditNoteData().
            case "nominal-litige-avoir":
                return {
                    tax: ["3680.00", "736.00"],
                    totals: ["3680.00", "3680.00", "4416.00", "0.00", "4416.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "3200.00", desc: "Maintenance preventive CVC - Site de Rungis - T1 2026", price: "3200.00" },
                        { id: "2", qty: "4.00", amount: "480.00", desc: "Deplacements et frais de mission (poste contexte)", price: "120.00" }
                    ]
                };
                // BR-S-08: 3200+480 = 3680

            // nominal-litige-rectificative : donnees de la RECTIFICATIVE (corrigee)
            // Les donnees de la facture ORIGINALE (erronee) sont dans generateFile > ZIP
            case "nominal-litige-rectificative":
                return {
                    tax: ["49100.00", "9820.00"],
                    totals: ["49100.00", "49100.00", "58920.00", "0.00", "58920.00"],
                    lines: [
                        { id: "1", qty: "50000.00", amount: "47500.00", desc: "Impression documents securises Lot 2026-T1", price: "0.95" },
                        { id: "2", qty: "500.00", amount: "1600.00", desc: "Finition et reliure (prix corrige)", price: "3.20" }
                    ]
                };
                // BR-S-08: 47500+1600 = 49100

            case "1":
                return {
                    tax: ["3250.00", "650.00"],
                    totals: ["3250.00", "3250.00", "3900.00", "0.00", "3900.00"],
                    lines: [
                        { id: "1", qty: "10.00", amount: "1500.00", desc: "Licences logicielles ERP", price: "150.00", po: { line: "10", id: "PO-1001" } },
                        { id: "2", qty: "2.00", amount: "1750.00", desc: "Jours de consulting Fluxym", price: "875.00", po: { line: "20", id: "PO-1002" } }
                    ]
                };

            case "31":
                return {
                    tax: ["30910.00", "6182.00"],
                    totals: ["30910.00", "30910.00", "37092.00", "0.00", "37092.00"],
                    lines: [
                        { id: "1", qty: "2.00", amount: "13500.00", desc: "Serveur rack Dell PowerEdge R760", price: "6750.00" },
                        { id: "2", qty: "4.00", amount: "9360.00", desc: "Switch reseau Cisco Catalyst 9300", price: "2340.00" },
                        { id: "3", qty: "5.00", amount: "4750.00", desc: "Installation et cablage datacenter (jours)", price: "950.00" },
                        { id: "4", qty: "3.00", amount: "3300.00", desc: "Configuration reseau et tests (jours)", price: "1100.00" }
                    ]
                };

            // ================================================
            //  B — PAIEMENTS, FRAIS & TIERS
            // ================================================

            case "2":
                return {
                    tax: ["3600.00", "720.00"],
                    totals: ["3600.00", "3600.00", "4320.00", "4320.00", "0.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "3600.00", desc: "Abonnement annuel SaaS CRM - 12 mois", price: "3600.00" }
                    ]
                };

            case "5":
                return {
                    tax: ["772.50", "154.50"],
                    totals: ["772.50", "772.50", "927.00", "927.00", "0.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "187.50", desc: "Billet train A/R Paris-Lyon - Mission audit mars", price: "187.50" },
                        { id: "2", qty: "3.00", amount: "435.00", desc: "Hebergement hotel 3 nuits (12-14/03)", price: "145.00" },
                        { id: "3", qty: "6.00", amount: "150.00", desc: "Repas professionnels", price: "25.00" }
                    ]
                };

            case "3":
                return {
                    tax: ["4450.00", "890.00"],
                    totals: ["4450.00", "4450.00", "5340.00", "0.00", "5340.00"],
                    lines: [
                        { id: "1", qty: "5.00", amount: "4450.00", desc: "Formation Cybersecurite Niveau 2 (5 jours)", price: "890.00" }
                    ]
                };

            case "4":
                return {
                    tax: ["3600.00", "720.00"],
                    totals: ["3600.00", "3600.00", "4320.00", "3000.00", "1320.00"],
                    lines: [
                        { id: "1", qty: "3.00", amount: "3600.00", desc: "Formation IA Generative (3 jours)", price: "1200.00" }
                    ]
                };

            case "7":
                return {
                    tax: ["487.00", "97.40"],
                    totals: ["487.00", "487.00", "584.40", "584.40", "0.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "487.00", desc: "Billet avion A/R CDG-FCO 22/03 - Ref AFKLM-789234", price: "487.00" }
                    ]
                };

            // ================================================
            //  C — AFFACTURAGE & TIERS BENEFICIAIRES
            // ================================================

            case "8":
                return {
                    tax: ["22850.00", "4570.00"],
                    totals: ["22850.00", "22850.00", "27420.00", "0.00", "27420.00"],
                    lines: [
                        { id: "1", qty: "1500.00", amount: "18600.00", desc: "Pieces embouties carrosserie Lot 2026-M03", price: "12.40" },
                        { id: "2", qty: "5000.00", amount: "4250.00", desc: "Visserie inox speciale M8x25", price: "0.85" }
                    ]
                };

            case "9":
                return {
                    tax: ["4440.00", "888.00"],
                    totals: ["4440.00", "4440.00", "5328.00", "0.00", "5328.00"],
                    lines: [
                        { id: "1", qty: "2400.00", amount: "4440.00", desc: "Gel douche Bio Lavande 250ml (EAN 3401234567890)", price: "1.85" }
                    ]
                };

            case "10":
                return {
                    tax: ["7565.00", "1513.00"],
                    totals: ["7565.00", "7565.00", "9078.00", "0.00", "9078.00"],
                    lines: [
                        { id: "1", qty: "850.00", amount: "7565.00", desc: "Restauration collective mars 2026 (repas)", price: "8.90" }
                    ]
                };

            // ================================================
            //  D — INTERMEDIAIRES & MANDATAIRES
            // ================================================

            case "11":
                return {
                    tax: ["4500.00", "900.00"],
                    totals: ["4500.00", "4500.00", "5400.00", "0.00", "5400.00"],
                    lines: [
                        { id: "1", qty: "10000.00", amount: "4500.00", desc: "Composants electroniques PCB-X200", price: "0.45" }
                    ]
                };

            case "12":
                return {
                    tax: ["24100.00", "4820.00"],
                    totals: ["24100.00", "24100.00", "28920.00", "0.00", "28920.00"],
                    lines: [
                        { id: "1", qty: "20.00", amount: "17800.00", desc: "Chateau Margaux 2019 - Caisse 6 bouteilles", price: "890.00" },
                        { id: "2", qty: "15.00", amount: "6300.00", desc: "Saint-Emilion Grand Cru 2020 - Caisse 12", price: "420.00" }
                    ]
                };

            case "15":
                return {
                    tax: ["19600.00", "3920.00"],
                    totals: ["19600.00", "19600.00", "23520.00", "0.00", "23520.00"],
                    lines: [
                        { id: "1", qty: "8.00", amount: "19600.00", desc: "Imprimantes multifonctions A3 couleur", price: "2450.00" }
                    ]
                };

            case "16":
                return {
                    tax: ["22550.00", "0.00"],
                    totals: ["22550.00", "22550.00", "22550.00", "0.00", "22550.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "3200.00", desc: "Honoraires redaction acte de vente", price: "3200.00" },
                        { id: "2", qty: "1.00", amount: "18500.00", desc: "Droits enregistrement (debours)", price: "18500.00" },
                        { id: "3", qty: "1.00", amount: "850.00", desc: "Frais publication hypothecaire (debours)", price: "850.00" }
                    ]
                };

            // ================================================
            //  E — SOUS-TRAITANCE & CO-TRAITANCE
            // ================================================

            case "13":
                return {
                    tax: ["55400.00", "11080.00"],
                    totals: ["55400.00", "55400.00", "66480.00", "0.00", "66480.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "45600.00", desc: "Installation electrique niveaux R+3 a R+7", price: "45600.00" },
                        { id: "2", qty: "3500.00", amount: "9800.00", desc: "Cable categorie 6A (metres)", price: "2.80" }
                    ]
                };

            case "14":
                return {
                    tax: ["51800.00", "10360.00"],
                    totals: ["51800.00", "51800.00", "62160.00", "0.00", "62160.00"],
                    lines: [
                        { id: "1", qty: "280.00", amount: "51800.00", desc: "Tuyauterie vapeur DN150 - Gare technique Lyon Part-Dieu", price: "185.00" }
                    ]
                };

            // ================================================
            //  F — MARKETPLACE & MANDAT
            // ================================================

            case "17a":
                return {
                    tax: ["5600.00", "1120.00"],
                    totals: ["5600.00", "5600.00", "6720.00", "0.00", "6720.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "3500.00", desc: "Commission marketplace - Ventes mars 2026", price: "3500.00" },
                        { id: "2", qty: "1.00", amount: "2100.00", desc: "Services logistiques et livraison", price: "2100.00" }
                    ]
                };

            case "17b":
                return {
                    tax: ["9200.00", "1840.00"],
                    totals: ["9200.00", "9200.00", "11040.00", "0.00", "11040.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "9200.00", desc: "Services marketplace premium - Abonnement annuel", price: "9200.00" }
                    ]
                };

            case "19a":
                return {
                    tax: ["3660.00", "732.00"],
                    totals: ["3660.00", "3660.00", "4392.00", "0.00", "4392.00"],
                    lines: [
                        { id: "1", qty: "120.00", amount: "2220.00", desc: "Bar de ligne frais - Lot 2026-03-18 AM (kg)", price: "18.50" },
                        { id: "2", qty: "45.00", amount: "1440.00", desc: "Sole commune - Lot 2026-03-18 AM (kg)", price: "32.00" }
                    ]
                };

            case "19b":
                return {
                    tax: ["22472.50", "4494.50"],
                    totals: ["22472.50", "22472.50", "26967.00", "0.00", "26967.00"],
                    lines: [
                        { id: "1", qty: "18.50", amount: "4532.50", desc: "Ferraille triee categorie E40 - Mars 2026 (tonnes)", price: "245.00" },
                        { id: "2", qty: "2.30", amount: "17940.00", desc: "Cuivre denude categorie 1 (tonnes)", price: "7800.00" }
                    ]
                };

            // ================================================
            //  G — NOTES DE DEBIT
            // ================================================

            case "18":
                return {
                    tax: ["1735.00", "347.00"],
                    totals: ["1735.00", "1735.00", "2082.00", "0.00", "2082.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "1245.00", desc: "Supplement carburant mars 2026 (+3.2%)", price: "1245.00" },
                        { id: "2", qty: "14.00", amount: "490.00", desc: "Supplement livraison zones difficiles", price: "35.00" }
                    ]
                };

            // ================================================
            //  H — ACOMPTES & FACTURES DE SOLDE
            // ================================================

            case "20":
                return {
                    tax: ["18000.00", "3600.00"],
                    totals: ["18000.00", "18000.00", "21600.00", "0.00", "21600.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "18000.00", desc: "Acompte 30% - Maitrise d'oeuvre villa contemporaine", price: "18000.00" }
                    ]
                };

            case "21":
                return {
                    tax: ["60000.00", "12000.00"],
                    totals: ["60000.00", "60000.00", "72000.00", "43200.00", "28800.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "60000.00", desc: "Mission maitrise d'oeuvre villa - Solde definitif", price: "60000.00" }
                    ]
                };

            case "32":
                return {
                    tax: ["24000.00", "4800.00"],
                    totals: ["24000.00", "24000.00", "28800.00", "0.00", "28800.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "24000.00", desc: "Acompte 40% - Renovation bureaux open-space", price: "24000.00" }
                    ]
                };

            // ================================================
            //  I — ESCOMPTE
            // ================================================

            case "22a":
                return {
                    tax: ["13500.00", "2700.00"],
                    totals: ["13500.00", "13500.00", "16200.00", "0.00", "16200.00"],
                    lines: [
                        { id: "1", qty: "10.00", amount: "13500.00", desc: "Audit conformite RGPD (10 jours)", price: "1350.00" }
                    ]
                };

            case "22b":
                return {
                    tax: ["6520.00", "1304.00"],
                    totals: ["6520.00", "6520.00", "7824.00", "0.00", "7824.00"],
                    lines: [
                        { id: "1", qty: "12.00", amount: "5820.00", desc: "Cable fibre optique OS2 monomode (bobine 500m)", price: "485.00" },
                        { id: "2", qty: "200.00", amount: "700.00", desc: "Connecteurs LC duplex", price: "3.50" }
                    ]
                };

            // ================================================
            //  J — CAS SPECIAUX
            // ================================================

            case "23":
                return {
                    tax: ["685.00", "137.00"],
                    totals: ["685.00", "685.00", "822.00", "0.00", "822.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "125.00", desc: "Monture Rayban RB5154 Clubmaster", price: "125.00" },
                        { id: "2", qty: "2.00", amount: "560.00", desc: "Verres progressifs antireflet", price: "280.00" }
                    ]
                };

            // 6 : variante e-invoicing du cas — le collaborateur a paye a titre
            // personnel, l'entreprise demande une facture a son nom a posteriori.
            // La TVA a deja ete collectee via le e-reporting B2C : cadre S7.
            case "6":
                return {
                    tax: ["850.00", "170.00"],
                    totals: ["850.00", "850.00", "1020.00", "1020.00", "0.00"],
                    lines: [
                        { id: "1", qty: "2.00", amount: "620.00", desc: "Nuitee hotel - Seminaire Lyon Part-Dieu (regularisation)", price: "310.00" },
                        { id: "2", qty: "1.00", amount: "230.00", desc: "Restauration collaborateur - Justificatif du 12/03/2026", price: "230.00" }
                    ]
                };
                // BR-S-08: 620+230 = 850

            // 28 : variante e-invoicing du cas — note de restaurant superieure
            // a 150 EUR HT, facture demandee par l'assujetti apres la vente B2C.
            case "28":
                return {
                    tax: ["1580.00", "316.00"],
                    totals: ["1580.00", "1580.00", "1896.00", "1896.00", "0.00"],
                    lines: [
                        { id: "1", qty: "8.00", amount: "1420.00", desc: "Repas d'affaires - Menu groupe 8 couverts du 05/03/2026", price: "177.50" },
                        { id: "2", qty: "1.00", amount: "160.00", desc: "Location salon prive - Service et mise en place", price: "160.00" }
                    ]
                };
                // BR-S-08: 1420+160 = 1580

            case "30":
                return {
                    tax: ["4200.00", "840.00"],
                    totals: ["4200.00", "4200.00", "5040.00", "5040.00", "0.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "4200.00", desc: "Montres de luxe (vente post e-reporting B2C)", price: "4200.00" }
                    ]
                };

            // 25 : variante e-invoicing du cas — cession de bons a usage UNIQUE
            // (BUU) entre assujettis, TVA exigible des l'emission du bon.
            // Les bons a usage multiple (BUM) ne sont pas taxes a l'emission.
            case "25":
                return {
                    tax: ["3200.00", "640.00"],
                    totals: ["3200.00", "3200.00", "3840.00", "0.00", "3840.00"],
                    lines: [
                        { id: "1", qty: "200.00", amount: "3200.00", desc: "Bons d'achat a usage unique (BUU) - Valeur faciale 16 EUR", price: "16.00" }
                    ]
                };

            case "26":
                return {
                    tax: ["6500.00", "1300.00"],
                    totals: ["6500.00", "6500.00", "7800.00", "0.00", "7800.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "6500.00", desc: "Audit securite informatique - Pentest annuel", price: "6500.00" }
                    ]
                };

            case "42":
                return {
                    tax: ["2450.00", "490.00"],
                    totals: ["2450.00", "2450.00", "2940.00", "2940.00", "0.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "2450.00", desc: "Refacturation vente en detaxe - Bordereau PABLO DT2026-789012", price: "2450.00" }
                    ]
                };

            // ================================================
            //  K — CAS AVANCES & REGIMES SPECIAUX
            // ================================================

            // 33 : deux sous-totaux BG-23 sur une meme facture.
            // Ligne 1 : vehicule d'occasion sous le regime de la marge (E, 0 %).
            // Ligne 2 : prestation annexe taxee au taux normal (S, 20 %).
            case "33":
                return {
                    tax: ["96200.00", "240.00"],
                    totals: ["96200.00", "96200.00", "96440.00", "0.00", "96440.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "95000.00", desc: "Porsche 911 Carrera S (2019) - VIN WP0AB2A9XKS123456", price: "95000.00" },
                        { id: "2", qty: "1.00", amount: "1200.00", desc: "Preparation esthetique et controle technique", price: "1200.00" }
                    ]
                };
                // BR-S-08 : base S = 1200.00 (ligne 2) / base E = 95000.00 (ligne 1)

            case "34":
                return {
                    tax: ["15600.00", "3120.00"],
                    totals: ["15600.00", "15600.00", "18720.00", "0.00", "18720.00"],
                    lines: [
                        { id: "1", qty: "12.00", amount: "15600.00", desc: "Licence SAP Business One - Poste utilisateur/an", price: "1300.00" }
                    ]
                };

            // 35 : variante e-invoicing du cas — l'auteur assujetti facture
            // directement ses droits a l'editeur. Les releves de droits
            // etablis par l'editeur ne sont pas des factures.
            case "35":
                return {
                    tax: ["8900.00", "1780.00"],
                    totals: ["8900.00", "8900.00", "10680.00", "0.00", "10680.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "8900.00", desc: "Droits d'auteur - Ouvrage sur la facturation electronique - A-valoir 2026", price: "8900.00" }
                    ]
                };

            case "36":
                return {
                    tax: ["2450.00", "490.00"],
                    totals: ["2450.00", "2450.00", "2940.00", "0.00", "2940.00"],
                    lines: [
                        { id: "1", qty: "5.00", amount: "2450.00", desc: "Support technique N2 (demi-journees)", price: "490.00" }
                    ]
                };

            case "37":
                return {
                    tax: ["11200.00", "2240.00"],
                    totals: ["11200.00", "11200.00", "13440.00", "0.00", "13440.00"],
                    lines: [
                        { id: "1", qty: "2.00", amount: "7800.00", desc: "Ecrans interactifs 75 pouces salle de reunion", price: "3900.00" },
                        { id: "2", qty: "2.00", amount: "3400.00", desc: "Support mural motorise + installation", price: "1700.00" }
                    ]
                };

            case "38":
                return {
                    tax: ["5240.00", "1048.00"],
                    totals: ["5240.00", "5240.00", "6288.00", "0.00", "6288.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "4280.00", desc: "Kit videosurveillance 8 cameras", price: "4280.00" },
                        { id: "1.1", qty: "8.00", amount: "0.00", desc: "  |- Camera IP PoE 4K (385.00 EUR/u)", price: "0.00" },
                        { id: "1.2", qty: "1.00", amount: "0.00", desc: "  |- Enregistreur NVR 16 voies (890.00 EUR)", price: "0.00" },
                        { id: "1.3", qty: "1.00", amount: "0.00", desc: "  |- Cablage et installation (310.00 EUR)", price: "0.00" },
                        { id: "2", qty: "1.00", amount: "960.00", desc: "Maintenance annuelle", price: "960.00" }
                    ]
                };

            case "39":
                return {
                    tax: ["4250.00", "850.00"],
                    totals: ["4250.00", "4250.00", "5100.00", "0.00", "5100.00"],
                    lines: [
                        { id: "1", qty: "600.00", amount: "1680.00", desc: "[Vendeur 1: Blanchisserie Express] Draps king size", price: "2.80" },
                        { id: "2", qty: "1200.00", amount: "720.00", desc: "[Vendeur 1] Serviettes", price: "0.60" },
                        { id: "3", qty: "4.00", amount: "1400.00", desc: "[Vendeur 2: Fleurs & Deco] Compositions florales halls", price: "350.00" },
                        { id: "4", qty: "1.00", amount: "450.00", desc: "[Vendeur 2] Plantes vertes location mensuelle", price: "450.00" }
                    ]
                };

            // 40 : facture soldee par compensation avec la facture reciproque.
            // BT-81 = 97, BT-113 = montant compense, BT-115 = 0.
            case "40":
                return {
                    tax: ["3750.00", "750.00"],
                    totals: ["3750.00", "3750.00", "4500.00", "4500.00", "0.00"],
                    lines: [
                        { id: "1", qty: "3.00", amount: "3750.00", desc: "Expertise Salesforce CPQ (jours)", price: "1250.00" }
                    ]
                };

            case "41":
                return {
                    tax: ["6800.00", "1360.00"],
                    totals: ["6800.00", "6800.00", "8160.00", "0.00", "8160.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "4300.00", desc: "Mobilier ergonomique bureau direction", price: "4300.00" },
                        { id: "2", qty: "1.00", amount: "2500.00", desc: "Chaise Herman Miller Aeron Remastered", price: "2500.00" }
                    ]
                };

            // ================================================
            //  TESTS & PACKS
            // ================================================

            case "A":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "0.00", "1200.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "1000.00", desc: "Prestation standard (Facture en erreur volontaire)", price: "1000.00" }
                    ]
                };

            // Pack B : jeu de commandes multi-PO. Les lignes etaient cablees
            // dans le switch de buildXML, ce qui privait le cas de modele
            // pivot, donc de CII, de lisible et de Factur-X. Les montants
            // repris ici sont ceux du bloc cable, au centime.
            //
            // po.line porte la reference de ligne de commande (BT-132) ; le
            // numero de commande lui-meme (BT-13) est genere a l'execution et
            // injecte par buildXML. noItemRef reproduit l'absence de
            // cac:SellersItemIdentification du bloc cable : ces libelles SONT
            // deja des codes article, une reference derivee ferait doublon.
            case "B":
                return {
                    tax: ["4934.70", "986.94"],
                    totals: ["4934.70", "4934.70", "5921.64", "0.00", "5921.64"],
                    lines: [
                        { id: "1", qty: "1.00",    amount: "0.38",    desc: "CNT01160", price: "0.38",   po: { line: "000001" }, noItemRef: true },
                        { id: "2", qty: "100.00",  amount: "136.00",  desc: "CNT31421", price: "1.36",   po: { line: "000002" }, noItemRef: true },
                        { id: "3", qty: "186.00",  amount: "1175.52", desc: "CNT50922", price: "6.32",   po: { line: "000003" }, noItemRef: true },
                        { id: "4", qty: "30.00",   amount: "2113.20", desc: "CNTUSB20", price: "70.44",  po: { line: "000010" }, noItemRef: true },
                        { id: "5", qty: "1110.00", amount: "1509.60", desc: "CNT00443", price: "1.36",   po: { line: "000020" }, noItemRef: true }
                    ]
                };
                // BR-S-08: 0.38+136.00+1175.52+2113.20+1509.60 = 4934.70

            // ================================================
            //  L — REGIMES DE TVA TRANSVERSES
            //  Taux 0 : le total TTC (BT-112) est egal au total HT (BT-109)
            //  et le net a payer (BT-115) au total HT.
            // ================================================

            case "T1":
                return {
                    tax: ["24800.00", "0.00"],
                    totals: ["24800.00", "24800.00", "24800.00", "0.00", "24800.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "18500.00", desc: "Gros oeuvre - Dalle portee et elevation R+1 (lot 2)", price: "18500.00" },
                        { id: "2", qty: "420.00", amount: "6300.00", desc: "Coffrage banche - m2 mis en oeuvre", price: "15.00" }
                    ]
                };
                // BR-AE-08/09: 18500+6300 = 24800 base, TVA 0.00 autoliquidee par le preneur

            case "T2":
                return {
                    tax: ["5400.00", "0.00"],
                    totals: ["5400.00", "5400.00", "5400.00", "0.00", "5400.00"],
                    lines: [
                        { id: "1", qty: "12.00", amount: "5400.00", desc: "Conseil en organisation - 12 journees", price: "450.00" }
                    ]
                };
                // BR-E-08/09: 12 x 450 = 5400 base, TVA 0.00 (article 293 B du CGI)

            case "T7":
                return {
                    tax: ["9550.00", "0.00"],
                    totals: ["9550.00", "9550.00", "9550.00", "0.00", "9550.00"],
                    lines: [
                        { id: "1", qty: "40.00", amount: "7400.00", desc: "Module capteur industriel MCI-200", price: "185.00" },
                        { id: "2", qty: "1.00", amount: "2150.00", desc: "Outillage de calibrage dedie", price: "2150.00" }
                    ]
                };
                // BR-IC-08/09: 7400+2150 = 9550 base, TVA 0.00 (article 262 ter I du CGI)

            case "T8":
                return {
                    tax: ["8570.00", "0.00"],
                    totals: ["8570.00", "8570.00", "8570.00", "0.00", "8570.00"],
                    lines: [
                        { id: "1", qty: "12.00", amount: "7680.00", desc: "Vanne de regulation haute pression VRP-40", price: "640.00" },
                        { id: "2", qty: "1.00", amount: "890.00", desc: "Mise en conteneur et documents d'exportation", price: "890.00" }
                    ]
                };
                // BR-G-08/09: 7680+890 = 8570 base, TVA 0.00 (article 262-I du CGI)

            case "T4":
                return {
                    tax: ["10000.00", "2000.00"],
                    totals: ["10000.00", "10000.00", "12000.00", "0.00", "12000.00"],
                    lines: [
                        { id: "1", qty: "20.00", amount: "7600.00", desc: "Licence plateforme analytique - poste utilisateur", price: "380.00" },
                        { id: "2", qty: "1.00", amount: "2400.00", desc: "Parametrage et reprise des donnees", price: "2400.00" }
                    ]
                };
                // Montants en USD. TVA 20 % = 2000.00 USD, soit 1841.62 EUR au taux 1.0860 (BT-111)

            case "T6":
                return {
                    tax: ["8215.00", "1643.00"],
                    totals: ["8545.00", "8215.00", "9858.00", "0.00", "9858.00"],
                    // BG-20 / BG-21 : un bloc par couple (categorie de TVA, taux).
                    allowanceCharges: [
                        { charge: false, amount: "450.00", reasonCode: "95", reason: "Remise commerciale accord cadre 2026", category: "S", percent: "20.00" },
                        { charge: true, amount: "120.00", reasonCode: "FC", reason: "Frais de port et de manutention", category: "S", percent: "20.00" }
                    ],
                    lines: [
                        // BG-27 : remise de niveau ligne. 30 x 240.00 = 7200.00 - 200.00 = 7000.00
                        { id: "1", qty: "30.00", amount: "7000.00", desc: "Fauteuil de bureau ergonomique ERG-450", price: "240.00",
                          allowances: [{ charge: false, amount: "200.00", baseAmount: "7200.00", reasonCode: "95", reason: "Remise quantitative palier 30 unites" }] },
                        // BG-28 : frais de niveau ligne. 1 x 1500.00 = 1500.00 + 45.00 = 1545.00
                        { id: "2", qty: "1.00", amount: "1545.00", desc: "Table de reunion modulaire MOD-12", price: "1500.00",
                          allowances: [{ charge: true, amount: "45.00", reason: "Eco-participation mobilier (filiere REP)" }] }
                    ]
                };
                // BR-CO-10 : 8545.00 - 450.00 + 120.00 = 8215.00 -> TVA 1643.00 -> TTC 9858.00

            default:
                console.warn("getLineData: cas non gere: " + usecase);
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "0.00", "1200.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "1000.00", desc: "Prestation standard (cas non gere)", price: "1000.00" }
                    ]
                };
        }
    },

    // =====================================================
    // DONNEES DE L'AVOIR PARTIEL
    // Utilisee uniquement par le ZIP nominal-litige-avoir.
    // Seule la ligne contestee est creditee ; les montants d'un
    // avoir UBL 381 sont exprimes en positif.
    // =====================================================
    getCreditNoteData: function() {
        return {
            tax: ["480.00", "96.00"],
            totals: ["480.00", "480.00", "576.00", "0.00", "576.00"],
            lines: [
                { id: "1", qty: "4.00", amount: "480.00", desc: "Avoir sur frais de mission contestes - Geste commercial", price: "120.00" }
            ]
        };
        // BR-S-08: 480 = 480
    },

    // =====================================================
    // DONNEES DE LA FACTURE ORIGINALE (erronee)
    // Utilisee uniquement par le ZIP rectificative
    // =====================================================
    getOriginalInvoiceData: function() {
        return {
            tax: ["48000.00", "9600.00"],
            totals: ["48000.00", "48000.00", "57600.00", "0.00", "57600.00"],
            lines: [
                { id: "1", qty: "50000.00", amount: "47500.00", desc: "Impression documents securises Lot 2026-T1", price: "0.95" },
                { id: "2", qty: "500.00", amount: "500.00", desc: "Finition et reliure (ERREUR prix unitaire)", price: "1.00" }
            ]
        };
        // BR-S-08: 47500+500 = 48000
        // Erreur volontaire sur ligne 2 : prix unitaire 1.00 au lieu de 3.20
    },

    // Reference article vendeur (BT-155), derivee du libelle pour rester
    // stable et plausible sans avoir a saisir un referentiel article.
    makeItemRef: function(desc, index) {
        var base = String(desc || "ART").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3);
        return (base || "ART") + "-" + ("0000" + index).slice(-4);
    },

    // =====================================================
    // TRIPTYQUE : UBL nu / UBL + lisible / PDF lisible
    // =====================================================

    // Cas pour lesquels la representation lisible est disponible.
    // Un cas n'est ajoute ici qu'apres verification de la coherence
    // entre les donnees structurees et le rendu lisible.
    // Panier de reference : un cas representatif par categorie de cas d'usage,
    // chacun verifie individuellement (montants, TVA, blocs structurants).
    // Liste blanche des cas dont la representation lisible a ete verifiee
    // individuellement (concordance des montants, de la ventilation de TVA et
    // des blocs de parties avec les donnees structurees).
    //
    // Les quatre variantes nominal-* y entrent sans audit propre : elles
    // decrivent un STATUT DE CYCLE DE VIE (flux 2 : rejet a l'emission, non
    // transmise, rejet a la reception, refus), pas une facture differente.
    // Leur XML EST celui du cas nominal, donc leur lisible aussi, au centime
    // pres. Les auditer une par une n'aurait rien verifie de plus.
    PDF_CASES: ["nominal", "1", "2", "3", "8", "13", "14", "16", "17b", "18", "19b", "20",
        "21", "22a", "23", "26", "30", "31", "38", "40",
        "T1", "T2", "T4", "T6", "T7", "T8",
        "nominal-rejet-emission", "nominal-non-transmise",
        "nominal-rejet-reception", "nominal-refus",
        // Vague 1 (21/08/2026) : cas dont le rendu etait deja en place. Audit
        // par lecture croisee getLineData / buildRenderData / PDFLisible :
        //   4  prise en charge partielle : BT-113 rendu en ligne de deduction,
        //      tiers payeur OPCO porte par la mention #PAI#
        //   5  note de frais : beneficiaire personne physique, desormais rendu
        //      dans le bloc PAIEMENT sans SIRET (BT-59 seul)
        //   7  carte logee : BT-81 code 48 libelle "Carte bancaire", aucun IBAN
        //      affiche puisque hors virement, mention "Paiement comptant"
        //   9  distributeur : beneficiaire desormais rendu avec son SIRET
        //   10 subrogation apres emission : aucune specificite structurelle,
        //      le rendu nominal est donc exact
        //   11 commissionnaire a l'achat : cadre B1, rendu nominal
        //   12 commissionnaire a la vente : agent porte par la mention #DCL#
        //   15 UGAP : mandataire transparent porte par la mention #DCL#
        "4", "5", "7", "9", "10", "11", "12", "15",
        // Vague 2 (21/08/2026) : cas dont la specificite est portee par une
        // mention (BT-21/BT-22), desormais garantie visible par la hierarchie
        // des mentions du lisible. Fondements valides par @RFE_Expert :
        //   6, 28 cadre S7 : mention "TVA deja collectee via e-reporting B2C".
        //          Aucun bloc de partie dedie requis (Z12-014 cas 30 et 28).
        //   25 bons a usage unique : mention d'exigibilite des l'emission
        //          (CGI art. 256 ter). Cas explicitement non stabilise dans la
        //          Z12-014 V1.4 : a resurveiller a chaque version.
        //   32 acompte periodique : mention de regularisation au solde.
        //   42 detaxe : mention du bordereau PABLO, cadre B7.
        //   22b escompte sur biens : la clause AAB de droit commun est
        //          remplacee par la clause d'escompte reelle.
        //   19a mandat de facturation : mention "Facture etablie par X pour le
        //          compte de Y", formulation du BOFIP (CGI ann. II art. 242
        //          nonies A I 13). Un bloc FACTURANT distinct reste recommande
        //          en profil etendu : ameliration a prevoir, non bloquante.
        "6", "28", "25", "32", "42", "22b", "19a"],

    supportsPdf: function(usecase) {
        return typeof PDFLisible !== 'undefined' && this.PDF_CASES.indexOf(usecase) !== -1;
    },

    // Lecture de la composition demandee dans l'etape 3 de la Fabrique.
    // Le modele est hierarchique et non plus une liste plate d'artefacts :
    //   format  : la syntaxe de la facture, un choix exclusif
    //   embed   : ce qui voyage A L'INTERIEUR du fichier de facture (BG-24)
    //   side    : les memes pieces livrees en PDF autonomes, a cote
    // Distinguer embed de side est la raison d'etre de ce modele : embarquer
    // un bon de livraison dans le XML ne doit rien imposer sur les fichiers
    // telecharges, et inversement.
    getComposition: function(usecase) {
        var read = function(id) {
            var el = document.getElementById(id);
            return !!(el && el.checked);
        };
        var picked = document.querySelector('input[name="fab-format"]:checked');
        var comp = {
            format: (picked && picked.value) || 'ubl',
            embed: {
                lisible:  read('embed-lisible'),
                order:    read('embed-order'),
                despatch: read('embed-despatch')
            },
            side: {
                lisible:  read('side-lisible'),
                order:    read('side-order'),
                despatch: read('side-despatch')
            }
        };

        // Le Factur-X EST la representation lisible : le PDF/A-3B porte le
        // rendu humain par construction. La case est donc vraie d'office,
        // sans qu'aucun BG-24 LISIBLE ne soit emis (le PDF ne peut pas etre
        // sa propre piece jointe).
        if (comp.format === 'facturx') comp.embed.lisible = true;

        // Sans representation lisible verifiee pour le cas, on ne produit ni
        // PDF, ni hybride, ni piece jointe : la facture reste nue.
        if (!this.supportsPdf(usecase)) {
            if (comp.format === 'facturx') comp.format = 'ubl';
            comp.embed = { lisible: false, order: false, despatch: false };
            comp.side  = { lisible: false, order: false, despatch: false };
        }
        return comp;
    },

    // Suffixe du fichier de facture, deduit de la composition. Source unique
    // pour le nom reellement telecharge ET pour le recapitulatif affiche
    // avant le clic : l'ecart entre les deux serait un bug.
    composeSuffix: function(format, embed) {
        var tags = [];
        if (embed.lisible && format !== 'facturx') tags.push('lisible');
        if (embed.order) tags.push('BC');
        if (embed.despatch) tags.push('BL');
        if (format === 'facturx') {
            return tags.length ? '_FACTURX_avec_' + tags.join('-') + '.pdf' : '_FACTURX.pdf';
        }
        var base = (format === 'cii') ? '_CII' : '_UBL';
        return tags.length ? base + '_avec_' + tags.join('-') + '.xml' : base + '.xml';
    },

    // Declenche le telechargement d'un Blob sous un nom donne.
    triggerDownload: function(blob, fileName) {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        if (typeof UIManager !== 'undefined') UIManager.showSuccess(fileName);
    },

    // =====================================================
    // GENERATION DU FICHIER
    // =====================================================
    generateFile: function() {
        try {
            // 1. Recuperation des saisies
            var trigramme = document.getElementById('trigramme').value.toUpperCase() || "UNK";
            var usecase = document.getElementById('usecase').value;

            // Garde-fou de perimetre : certains cas d'usage ne donnent lieu a
            // aucune facture e-invoicing. On refuse de produire un XML plutot
            // que de livrer une facture qui ne devrait pas exister.
            if (!this.isProductible(usecase)) {
                console.warn("generateFile: cas hors perimetre e-invoicing: " + usecase);
                return;
            }

            // BT-10 Reference acheteur (obligatoire, BR-10) : saisie utilisateur prioritaire.
            var buyerRefField = document.getElementById('buyer-reference');
            var buyerRefInput = buyerRefField ? buyerRefField.value.trim() : "";

            var supplierId = document.getElementById('adv-supplier') ? document.getElementById('adv-supplier').value : null;
            var buyerId = document.getElementById('adv-buyer') ? document.getElementById('adv-buyer').value : null;
            var factorId = document.getElementById('adv-factor') ? document.getElementById('adv-factor').value : null;

            var data = window.APP_DATA.companies;
            var supplier = supplierId ? data.suppliers.find(function(s) { return s.id === supplierId; }) : data.suppliers[0];
            var buyer = buyerId ? data.buyers.find(function(b) { return b.id === buyerId; }) : data.buyers[0];
            // --- Custom data override ---
            if (window.COMPANY_MODE === 'custom') {
                if (window.CUSTOM_SUPPLIER) {
                    supplier = window.CUSTOM_SUPPLIER;
                }
                if (window.CUSTOM_BUYER) {
                    buyer = window.CUSTOM_BUYER;
                }
            }
            var factor = factorId ? data.factors.find(function(f) { return f.id === factorId; }) : data.factors[0];

            // Tiers du referentiel : payeur (BG-02), agent de vendeur (BG-03),
            // facturant (BG-05). Ils ne sont pas selectionnables dans l'UI :
            // ils sont attaches au cas d'usage par caseConfig.
            var findThirdParty = function(id) {
                if (!id || !data.thirdParties) return null;
                return data.thirdParties.find(function(t) { return t.id === id; }) || null;
            };

            // Certains regimes de TVA imposent la nature des parties : une facture
            // en franchise en base suppose un vendeur sans numero de TVA (BT-31
            // absent, BT-32 renseigne), une livraison intracommunautaire ou une
            // exportation un acheteur etabli hors de France. Le cas d'usage impose
            // donc la partie concernee, y compris en mode donnees personnalisees :
            // laisser le choix de l'UI produirait une facture incoherente.
            const regimeCfg = this.caseConfig[usecase] || {};
            if (regimeCfg.forceSupplier) {
                const forcedSupplier = findThirdParty(regimeCfg.forceSupplier);
                if (forcedSupplier) supplier = forcedSupplier;
            }
            if (regimeCfg.forceBuyer) {
                const forcedBuyer = findThirdParty(regimeCfg.forceBuyer);
                if (forcedBuyer) buyer = forcedBuyer;
            }

            if (!supplier || !buyer) {
                alert("Erreur: Donnees d'entreprise introuvables."); return;
            }

            // Repli en cascade : saisie UI, puis valeur par defaut du tiers, puis trigramme + cas.
            var buyerReference = buyerRefInput || buyer.buyerReference || (trigramme + "-REF-" + usecase);

            // 2. Dates et Numeros
            var now = new Date();
            var yy = String(now.getFullYear()).slice(-2);
            var yyyy = now.getFullYear();
            var MM = String(now.getMonth() + 1).padStart(2, '0');
            var dd = String(now.getDate()).padStart(2, '0');
            var HH = String(now.getHours()).padStart(2, '0');
            var mm = String(now.getMinutes()).padStart(2, '0');
            var ss = String(now.getSeconds()).padStart(2, '0');

            var dateStr = yy + MM + dd + HH + mm + ss;
            var numeroFacture = trigramme + "-" + dateStr;
            var dateFactureXML = yyyy + "-" + MM + "-" + dd;

            var echeance = new Date(now);
            var cfg = this.caseConfig[usecase] || { typeCode: "380", profile: "S1", zip: false };

            if (cfg.prepaid) {
                echeance.setDate(now.getDate());
            } else {
                echeance.setDate(now.getDate() + 30);
            }
            var dateEcheanceXML = echeance.getFullYear() + "-" + String(echeance.getMonth()+1).padStart(2,'0') + "-" + String(echeance.getDate()).padStart(2,'0');

            var nomExplicatif = "Export";
            if (window.APP_DATA.pedagogy && window.APP_DATA.pedagogy[usecase] && window.APP_DATA.pedagogy[usecase].title) {
                nomExplicatif = window.APP_DATA.pedagogy[usecase].title.replace(/[^a-zA-Z0-9]/g, '_');
            }
            

            // 3. Config du cas
            var invoiceTypeCode = cfg.typeCode;
            var profileId = cfg.profile;

            // 4. Notes
            // BT-5 devise du document. Des qu'elle n'est pas l'euro, la reglementation
            // impose que la TVA reste exprimee en euros : BT-6 (devise de
            // comptabilisation) et BT-111 (montant total de TVA converti) deviennent
            // obligatoires, et BT-111 est le seul montant du document autorise a
            // porter une autre devise que BT-5.
            const docCur = cfg.currency || "EUR";
            const taxCur = docCur === "EUR" ? null : "EUR";

            var notes = [
                // BR-FR-31 : B2B par defaut, B2BINT des que l'acheteur est hors de France.
                "#BAR#" + (cfg.barCode || "B2B"),
                "#PMT#Indemnité forfaitaire pour frais de recouvrement : 40 euros.",
                "#PMD#En cas de retard de paiement, des pénalités égales à 3 fois le taux d'intérêt légal seront appliquées.",
                "#AAB#Pas d'escompte pour paiement anticipé."
            ];

            if (usecase === "33") notes.push("#AAI#Regime TVA sur la marge - Article 297 A du CGI");
            if (usecase === "25") notes.push("#AAI#Cession de bons d'achat a usage unique (BUU) - TVA exigible des l'emission");
            if (usecase === "32") notes.push("#AAI#Mensualite facturee en acompte - Regularisation a la facture de solde");
            if (usecase === "16") notes.push("#AAI#Debours - Avance de frais pour le compte du client - Hors champ TVA");
            // Regimes de TVA transverses : la mention legale est obligatoire sur la facture.
            if (usecase === "T1") notes.push("#AAI#Autoliquidation de la TVA par le preneur - article 283-2 nonies du CGI. Sous-traitance de travaux immobiliers.");
            if (usecase === "T2") notes.push("#AAI#TVA non applicable - article 293 B du CGI. Le vendeur releve du regime de la franchise en base.");
            if (usecase === "T7") notes.push("#AAI#Exoneration de TVA - livraison intracommunautaire - article 262 ter I du CGI. TVA autoliquidee par l'acquereur dans son Etat membre.");
            if (usecase === "T8") notes.push("#AAI#Exoneration de TVA - exportation de biens hors Union europeenne - article 262-I du CGI.");
            // Le taux de change n'est pas un champ EN16931 et le mapping UBL du socle
            // ne retient pas cac:TaxExchangeRate : la mention est portee en note.
            if (taxCur) {
                const fxLd = this.getLineData(usecase);
                const fxVat = fxLd ? this.computeTaxBreakdown(usecase, fxLd).reduce(function(t, sub) { return t + parseFloat(sub.amount); }, 0) : 0;
                const fxEur = (Math.round((fxVat / parseFloat(cfg.fxRate)) * 100) / 100).toFixed(2);
                const fxEurTxt = fxEur.replace(/\B(?=(\d{3})+\.)/g, " ").replace(".", ",");
                notes.push("#AAI#Facture etablie en " + docCur + ". Taux de change applique : 1 EUR = "
                    + cfg.fxRate.replace(".", ",") + " " + docCur + " (taux de reference BCE du "
                    + dd + "/" + MM + "/" + yyyy + "). Montant total de TVA en euros : " + fxEurTxt + " EUR.");
            }
            if (usecase === "T6") notes.push("#BLU#Eco-participation refacturee au titre de la filiere REP mobilier (article L. 541-10-1 du code de l'environnement).");
            if (usecase === "6" || usecase === "28" || usecase === "30") notes.push("#AAI#TVA deja collectee via e-reporting B2C - Cadre S7");
            if (cfg.typeCode === "393") notes.push("#ACC#Facture cedee par subrogation conventionnelle. Reglement a effectuer exclusivement aupres du Factor.");
            // Mandat de facturation (BG-05) : mention obligatoire.
            var facturantParty = findThirdParty(cfg.facturant);
            if (facturantParty) {
                notes.push("#DCL#Facture etablie par " + facturantParty.legalName +
                    " au nom et pour le compte de " + supplier.legalName + ".");
            }
            // Agent de vendeur / mandataire de groupement (BG-03).
            var agentParty = findThirdParty(cfg.agent);
            if (agentParty) {
                notes.push("#DCL#" + agentParty.legalName +
                    " intervient en qualite de mandataire du groupement pour le compte de " +
                    supplier.legalName + ".");
            }
            // Tiers payeur (BG-02) : le beneficiaire reste le vendeur.
            var payerParty = findThirdParty(cfg.payer);
            if (payerParty) {
                notes.push("#PAI#Facture prise en charge par " + payerParty.legalName +
                    ", tiers payeur, au titre d'un accord de financement. Le beneficiaire du reglement reste " +
                    supplier.legalName + ".");
            }
            // Retenue de garantie : mention seule, le net a payer n'est pas reduit.
            if (cfg.retenue) {
                notes.push("#ABU#Retenue de garantie de " + cfg.retenue +
                    " % appliquee conformement au contrat. Liberation apres reception definitive des travaux.");
            }
            // Compensation : la facture est soldee sans mouvement de tresorerie.
            if (cfg.netting) {
                notes.push("#AAI#Facture soldee par compensation avec la facture reciproque, conformement a la convention de netting.");
            }
            if (usecase === "19b") notes.push("#DCL#Auto-facturation au sens de l'article 289-I-2 du CGI. Facture emise par l'acheteur pour le compte du vendeur.");
            if (usecase === "15") notes.push("#DCL#Commande passee par l'UGAP, mandataire transparent, pour le compte de l'acheteur final.");
            if (usecase === "22a" || usecase === "22b") {
                notes = notes.filter(function(n) { return n.indexOf("#AAB#") === -1; });
                notes.push("#AAB#Escompte de 2% pour paiement sous 10 jours.");
            }
            if (usecase === "23") notes.push("#AAI#Vente B2C - Destinee au e-reporting flux 10.");
            if (usecase === "42") notes.push("#AAI#Facture post-detaxe touriste - Bordereau PABLO DT2026-789012.");

            // ==========================================
            // FONCTION INTERNE : buildXML
            // Accepte overrideLineData pour surcharger
            // les donnees de ligne (ZIP rectificative)
            // ==========================================
            var self = this;
            // BG-17 : sur une facture cedee, le compte a crediter est celui du
            // factor (subrogation conventionnelle), pas celui du fournisseur.
            // Le lisible et le structure lisent la meme variable : ils ne
            // peuvent pas designer deux beneficiaires differents.
            var payAccount = (cfg.payeeType === "factor" && factor && factor.iban) ? factor : supplier;

            // BG-10 : beneficiaire du paiement, quand il n'est pas le fournisseur.
            // Seul le cas du factor est repris ici, les autres payeeType
            // (distributeur, collaborateur, tiers payeur) restent a couvrir.
            // ------------------------------------------------------------
            // BG-10 BENEFICIAIRE DU PAIEMENT : une cascade, trois usages
            // ------------------------------------------------------------
            // Le beneficiaire etait resolu TROIS fois, dans trois cascades
            // separees : une dans buildXML, une dans le pivot CII, une pour le
            // lisible. Elles avaient fini par divergent : le CII et le PDF ne
            // connaissaient que le factor et perdaient le distributeur du cas 9
            // comme le collaborateur du cas 5, que l'UBL declarait pourtant.
            // Une seule source, donc, et la divergence devient impossible.
            var resolvePayee = function() {
                if (window.COMPANY_MODE === 'custom' && window.CUSTOM_THIRDPARTY) {
                    var tp = window.CUSTOM_THIRDPARTY;
                    return { legalName: tp.name, siren: tp.siren, nic: tp.nic || "00001" };
                }
                if (cfg.payeeType === "factor" && factor) {
                    return { legalName: factor.name, siren: factor.siren, nic: factor.nic || "00001" };
                }
                if (cfg.payeeType === "distributeur") {
                    var distri = findThirdParty("distri_logistique");
                    return distri
                        ? { legalName: distri.legalName, siren: distri.siren, nic: distri.nic }
                        : null;
                }
                if (cfg.payeeType === "collaborateur") {
                    // Personne physique : ni SIREN ni SIRET, BT-59 seul.
                    return { legalName: "DUPONT Jean (Employe)", siren: null, nic: null };
                }
                return null;
            };
            var payeeParty = resolvePayee();
            var payeeSiret = (payeeParty && payeeParty.siren)
                ? payeeParty.siren + (payeeParty.nic || "00001")
                : null;

            // Le lisible affiche le beneficiaire dans son bloc PAIEMENT :
            // "Reglement a : X (SIRET ...)". Sans SIRET, le seul nom suffit.
            var payeeForPdf = payeeParty
                ? { name: payeeParty.legalName, siret: payeeSiret }
                : null;

            // BG-3 : reference a la facture anterieure (BT-25 + BT-26).
            // Attendue sur une facture complementaire comme sur une facture de
            // solde apres acompte, ou elle justifie le montant deja paye BT-113.
            var precedingRefId = null;
            var precedingDate = null;
            if (cfg.billingRef) {
                var prevMs = new Date(dateFactureXML + "T00:00:00").getTime() - (30 * 24 * 60 * 60 * 1000);
                precedingDate = new Date(prevMs).toISOString().slice(0, 10);
                precedingRefId = trigramme + "-ORIG-" + precedingDate.replace(/-/g, "").slice(2);
            }

            // BG-13 : la livraison est datee 5 jours avant la facture, ce qui
            // correspond au cas courant d'une facturation posterieure a la
            // livraison. BT-72 n'est obligatoire que si elle differe de BT-2.
            var deliveryDate = new Date(new Date(dateFactureXML + "T00:00:00").getTime() - (5 * 24 * 60 * 60 * 1000))
                .toISOString().slice(0, 10);
            var deliveryName = buyer.deliveryName || null;
            var deliveryAddress = buyer.deliveryAddress || null;
            // BT-71 : identifiant du lieu de livraison, en pratique le SIRET de
            // l'etablissement livre. BR-FR-09 impose que ses neuf premiers
            // chiffres reprennent le SIREN de l'acheteur.
            var deliveryLocationId = buyer.deliveryLocationId || null;

            // ----------------------------------------------------------------
            // SOCLE ENRICHI
            // Une facture de test n'a d'interet que si les champs que les
            // plateformes doivent restituer sont effectivement peuples : un
            // champ laisse vide parce que la norme l'autorise est un champ que
            // la recette ne pourra jamais verifier. Les valeurs ci-dessous sont
            // donc systematiquement emises, sauf lorsqu'elles n'ont pas de sens
            // pour le cas d'usage.
            // ----------------------------------------------------------------

            // BG-14 : periode de facturation, calee sur le mois de la facture.
            // BT-8 (cbc:DescriptionCode) porte le code de date d'exigibilite de
            // la TVA : 3 = date de facture, retenue par defaut car nos dates de
            // livraison et de facture appartiennent au meme mois. BT-7
            // cac:TaxPointDate n'est jamais emis, BR-CO-3 l'interdisant en
            // presence de BT-8.
            var invoicePeriod = (function() {
                var d = new Date(dateFactureXML + "T00:00:00");
                var pad = function(n) { return (n < 10 ? "0" : "") + n; };
                var y = d.getFullYear();
                var m = d.getMonth();
                var last = new Date(y, m + 1, 0).getDate();
                return {
                    start: y + "-" + pad(m + 1) + "-01",
                    end: y + "-" + pad(m + 1) + "-" + pad(last),
                    code: cfg.vatDateCode || "3"
                };
            })();

            // BT-19 reference comptable de l'acheteur et BT-12 reference de
            // contrat : portees par le referentiel acheteur, elles n'existent
            // donc que pour les acheteurs qui en declarent une.
            var accountingCost = buyer.accountingCost || null;
            var contractRef = buyer.contractRef || null;

            // BT-82 libelle du moyen de paiement et BT-85 nom du titulaire du
            // compte credite.
            // ATTENTION : BT-85 qualifie le titulaire du compte porte par
            // BT-84, PAS le beneficiaire BG-10. Les deux divergent : au cas 5,
            // le beneficiaire est le collaborateur alors que l'IBAN reste celui
            // du vendeur. Nommer le beneficiaire ici aurait laisse croire a un
            // detournement de coordonnees bancaires. On suit donc payAccount,
            // qui est la seule source du BT-84 reellement emis.
            var meansCodeSocle = cfg.paymentMeans || "30";
            var meansLabelSocle = (typeof PDFLisible !== "undefined" && PDFLisible.MEANS_LABELS[meansCodeSocle])
                ? PDFLisible.MEANS_LABELS[meansCodeSocle]
                : null;
            var accountName = payAccount.legalName || payAccount.name || null;

            var buildXML = function(numFacture, typeCode, asCreditNote, refOriginale, poNumber, overrideLineData, attachment) {
                asCreditNote = asCreditNote || false;
                refOriginale = refOriginale || null;
                poNumber = poNumber || null;
                overrideLineData = overrideLineData || null;
                attachment = attachment || null;

                var xml = UBLTemplates.getHeader(numFacture, dateFactureXML, dateEcheanceXML, typeCode, profileId, notes, asCreditNote, buyerReference, self.getCustomizationId(usecase), { cur: docCur, taxCur: taxCur, accountingCost: accountingCost, period: invoicePeriod });

                // BT-13 Reference de la commande de l'acheteur
                if (poNumber) {
                    xml += UBLTemplates.getOrderReference(poNumber);
                }

                // Billing reference (rectificative ou avoir)
                if (refOriginale) {
                    xml += UBLTemplates.getBillingReference(refOriginale, precedingDate || dateFactureXML);
                }

                // BG-24 Pieces jointes embarquees. Le parametre accepte un objet
                // unique ou un tableau : une facture peut porter plusieurs
                // occurrences, avec une seule valeur LISIBLE (BR-FR-18).
                var attachList = attachment ? (Array.isArray(attachment) ? attachment : [attachment]) : [];

                // BT-16 : la reference du bon de livraison n'est emise que lorsque
                // le bon de livraison est effectivement joint. Referencer un
                // document inexistant serait incoherent.
                var despatchAtt = attachList.filter(function(a) { return a.description === "BON_LIVRAISON"; })[0];
                if (despatchAtt && despatchAtt.docNumber) {
                    xml += UBLTemplates.getDespatchDocumentReference(despatchAtt.docNumber);
                }

                // BT-12 : reference de contrat. Position imposee dans la
                // sequence Invoice, apres cac:OriginatorDocumentReference et
                // avant cac:AdditionalDocumentReference.
                if (contractRef) {
                    xml += UBLTemplates.getContractDocumentReference(contractRef);
                }

                attachList.forEach(function(att) {
                    xml += UBLTemplates.getAdditionalDocumentReference(
                        att.id,
                        att.description || "LISIBLE",
                        att.mimeCode || "application/pdf",
                        att.filename,
                        att.base64
                    );
                });

                xml += UBLTemplates.getSupplierParty(supplier, findThirdParty(cfg.agent), findThirdParty(cfg.facturant));
                xml += UBLTemplates.getCustomerParty(buyer);

                // --- Parties speciales ---
                // BG-10 : un seul point d'emission, alimente par resolvePayee.
                if (payeeParty) {
                    xml += UBLTemplates.getPayeeParty(payeeSiret, payeeParty.legalName, payeeParty.siren);
                }
                // BG-16 est obligatoire (BR-49) : virement (30) par defaut.
                // BT-84 IBAN ajoute pour les codes 30 et 58 conformement a BR-50.
                var meansCode = cfg.paymentMeans || "30";
                // BG-13 Livraison : date effective, destinataire et adresse
                if (deliveryAddress || deliveryName || deliveryLocationId) {
                    xml += UBLTemplates.getDelivery(deliveryDate, deliveryName, deliveryAddress, deliveryLocationId);
                }

                // Un tiers PAYEUR se declare en BG-02 (PaymentMandate/PayerParty),
                // jamais en BG-10 PayeeParty qui designe le BENEFICIAIRE.
                // BT-82 libelle, BT-83 information de remise (la reference que
                // le vendeur attend en libelle de virement pour lettrer son
                // encaissement) et BT-85 nom du titulaire du compte.
                xml += UBLTemplates.getPaymentMeans(meansCode, payAccount.iban || null, payAccount.bic || null, findThirdParty(cfg.payer), {
                    meansLabel: meansLabelSocle,
                    paymentId: numFacture,
                    accountName: accountName,
                    mandateId: cfg.mandateId || null,
                    payerIban: cfg.payerIban || null
                });
                xml += UBLTemplates.getPaymentTerms();

                // --- Lignes et Totaux ---
                {
                    // Tous les cas passent par le modele declaratif : plus aucun
                    // bloc de lignes cable dans cette fonction.
                    var ld = overrideLineData || self.getLineData(usecase);
                    if (ld) {
                        // Ventilation recalculee depuis les lignes (BG-23, BR-S-08, BR-CO-*)
                        var breakdown = self.computeTaxBreakdown(usecase, ld);
                        var vatTotal = breakdown.reduce(function(sum, s) { return sum + parseFloat(s.amount); }, 0);
                        var taxExclusive = parseFloat(ld.totals[1]);
                        var prepaid = parseFloat(ld.totals[3]);
                        var taxInclusive = Math.round((taxExclusive + vatTotal) * 100) / 100;

                        // BG-20 / BG-21 : position imposee dans la sequence Invoice,
                        // apres cac:PaymentTerms et avant cac:TaxTotal.
                        var docAc = ld.allowanceCharges || [];
                        docAc.forEach(function(ac) {
                            xml += UBLTemplates.getAllowanceCharge(ac, docCur);
                        });
                        var sumAc = function(isCharge) {
                            return docAc.reduce(function(t, ac) {
                                return t + (!!ac.charge === isCharge ? parseFloat(ac.amount) : 0);
                            }, 0);
                        };
                        var allowanceTotal = Math.round(sumAc(false) * 100) / 100;
                        var chargeTotal = Math.round(sumAc(true) * 100) / 100;

                        // BT-111 : contre-valeur du montant total de TVA dans la devise
                        // de comptabilisation, arrondie a deux decimales.
                        var taxCurAmount = taxCur ? {
                            code: taxCur,
                            amount: (Math.round((vatTotal / parseFloat(cfg.fxRate)) * 100) / 100).toFixed(2)
                        } : null;

                        xml += UBLTemplates.getTaxTotal(breakdown, { cur: docCur, taxCur: taxCurAmount });
                        xml += UBLTemplates.getLegalMonetaryTotal(
                            ld.totals[0],
                            ld.totals[1],
                            taxInclusive.toFixed(2),
                            ld.totals[3],
                            (Math.round((taxInclusive - prepaid) * 100) / 100).toFixed(2),
                            {
                                cur: docCur,
                                allowanceTotal: allowanceTotal ? allowanceTotal.toFixed(2) : null,
                                chargeTotal: chargeTotal ? chargeTotal.toFixed(2) : null
                            }
                        );
                        ld.lines.forEach(function(line, idx) {
                            xml += UBLTemplates.getInvoiceLine(
                                line.id, line.qty, line.amount, line.desc, line.price,
                                asCreditNote,
                                // BT-132 : la ligne de commande est declarative,
                                // le numero de commande (BT-13) est genere a
                                // l'execution. On les reunit ici.
                                line.po ? { line: line.po.line, id: line.po.id || poNumber } : null,
                                self.getLineVat(usecase, line.id), line.unitCode || "C62",
                                line.ref || (line.noItemRef ? null : self.makeItemRef(line.desc, idx + 1)),
                                { cur: docCur, allowances: line.allowances || null }
                            );
                        });
                    }
                }

                xml += UBLTemplates.getFooter(asCreditNote);
                return xml;
            };

            // ==========================================
            // FONCTION INTERNE : buildRenderData
            // Construit le modele pivot du lisible a partir
            // des MEMES donnees que buildXML, pour garantir
            // la coherence entre structure et representation.
            // ==========================================
            var buildRenderData = function(numFacture, typeCode, overrideLineData) {
                var ld = overrideLineData || self.getLineData(usecase);
                if (!ld) return null;

                var breakdown = self.computeTaxBreakdown(usecase, ld);
                var vatTotal = breakdown.reduce(function(sum, sub) { return sum + parseFloat(sub.amount); }, 0);
                var taxExclusive = parseFloat(ld.totals[1]);
                var prepaid = parseFloat(ld.totals[3]);
                var taxInclusive = Math.round((taxExclusive + vatTotal) * 100) / 100;

                // Mentions lisibles : la note de cadre #BAR# est un code de
                // routage, pas une mention destinee au lecteur humain. Le code
                // sujet des autres est CONSERVE : le lisible ne peut afficher
                // que cinq mentions, il lui faut donc de quoi les hierarchiser
                // par valeur juridique plutot que par ordre d'insertion.
                var pdfNotes = notes
                    .filter(function(n) { return n.indexOf("#BAR#") !== 0; })
                    .map(function(n) {
                        var m = /^#([A-Z]{3})#/.exec(n);
                        return { code: m ? m[1] : "", text: n.replace(/^#[A-Z]{3}#/, "") };
                    });

                var pdfAc = ld.allowanceCharges || [];
                var meansCodePdf = cfg.paymentMeans || "30";
                var meansLabel = PDFLisible.MEANS_LABELS[meansCodePdf] || ("Code " + meansCodePdf);
                var withIban = (meansCodePdf === "30" || meansCodePdf === "58");

                return {
                    supplier: supplier,
                    buyer: buyer,
                    typeCode: typeCode,
                    // BT-23 Cadre de facturation : mention obligatoire au 01/09/2026,
                    // la lettre de tete portant la categorie d'operation (B/S/M).
                    profileId: profileId,
                    // BT-34 / BT-49 Adresses de facturation electronique (schemeID 0225)
                    supplierEndpoint: supplier.siren,
                    buyerEndpoint: buyer.siren,
                    // BT-13 Reference de la commande de l'acheteur
                    orderReference: "PO-1001",
                    // BG-13 / BG-15 Livraison
                    delivery: (deliveryAddress || deliveryName || deliveryLocationId) ? {
                        date: deliveryDate,
                        name: deliveryName,
                        address: deliveryAddress,
                        // BT-71 identifiant du lieu de livraison
                        locationId: deliveryLocationId
                    } : null,
                    invoiceNumber: numFacture,
                    issueDate: dateFactureXML,
                    dueDate: dateEcheanceXML,
                    buyerReference: buyerReference,
                    paymentTerms: cfg.prepaid ? "Paiement comptant" : "Paiement à 30 jours date de facture",
                    paymentMeans: meansLabel,
                    // --- Socle enrichi, commun a l'UBL, au CII et au lisible ---
                    // BT-19 reference comptable de l'acheteur
                    accountingCost: accountingCost,
                    // BT-12 reference du contrat
                    contractRef: contractRef,
                    // BG-14 periode de facturation + BT-8 code de date d'exigibilite
                    period: invoicePeriod,
                    // BT-83 information de remise : reference a rappeler au virement
                    paymentReference: numFacture,
                    // BT-85 nom du titulaire du compte credite
                    accountName: accountName,
                    iban: withIban ? (payAccount.iban || null) : null,
                    bic: withIban ? (payAccount.bic || null) : null,
                    payee: payeeForPdf,
                    precedingInvoice: precedingRefId ? { id: precedingRefId, date: precedingDate } : null,
                    prepaidLabel: cfg.prepaid ? "Deja paye" : "Acompte deja verse",
                    taxSubtotals: breakdown.map(function(sub) {
                        return {
                            category: sub.category,
                            code: sub.code || '',
                            percent: sub.percent,
                            taxable: sub.taxable,
                            amount: sub.amount,
                            reason: sub.reason || ""
                        };
                    }),
                    // BT-5 : devise reellement facturee.
                    currency: docCur,
                    // BT-106 / BT-107 / BT-108 : necessaires pour rendre lisible le
                    // passage du total des lignes a la base d'imposition.
                    lineExtensionAmount: ld.totals[0],
                    allowanceTotal: pdfAc.filter(function(a) { return !a.charge; })
                        .reduce(function(t, a) { return t + parseFloat(a.amount); }, 0).toFixed(2),
                    chargeTotal: pdfAc.filter(function(a) { return a.charge; })
                        .reduce(function(t, a) { return t + parseFloat(a.amount); }, 0).toFixed(2),
                    taxExclusiveAmount: ld.totals[1],
                    taxAmount: vatTotal.toFixed(2),
                    taxInclusiveAmount: taxInclusive.toFixed(2),
                    prepaidAmount: ld.totals[3],
                    payableAmount: (Math.round((taxInclusive - prepaid) * 100) / 100).toFixed(2),
                    notes: pdfNotes,
                    lines: ld.lines.map(function(line, idx) {
                        var vat = self.getLineVat(usecase, line.id);
                        return {
                            id: line.id,
                            ref: line.ref || self.makeItemRef(line.desc, idx + 1),
                            desc: line.desc,
                            qty: line.qty,
                            price: line.price,
                            amount: line.amount,
                            vatPercent: vat.percent,
                            // BT-151 : le lisible n'affiche que le taux, mais le CII
                            // exige la categorie dans ram:ApplicableTradeTax.
                            vatCategory: vat.category,
                            unitCode: line.unitCode || "C62",
                            // BG-27 / BG-28 rendus en sous-lignes du tableau
                            allowances: line.allowances || null
                        };
                    })
                };
            };

            // ==========================================
            // FONCTION INTERNE : buildCiiPivot
            // ------------------------------------------
            // Enrichit le pivot du lisible des donnees purement techniques que
            // le PDF n'affiche pas mais que le CII exige : devise de
            // comptabilisation, code du moyen de paiement, remises de document
            // detaillees, identifiant de specification, et notes NON nettoyees.
            //
            // Ce dernier point est le plus subtil. Une note interne s'ecrit
            // "#AAI#texte" : UBL concatene le prefixe au texte dans cbc:Note,
            // le lisible le supprime, mais CII le veut isole dans
            // ram:SubjectCode. Les notes brutes sont donc transmises telles
            // quelles, a charge pour CIITemplates.splitNote de les separer.
            // ==========================================
            var buildCiiPivot = function(numFacture, typeCode, overrideLineData, poNumber, attachments, refOriginale) {
                var p = buildRenderData(numFacture, typeCode, overrideLineData);
                if (!p) return null;
                var ld = overrideLineData || self.getLineData(usecase);

                // BT-24 : identifiant de specification, identique en UBL et en CII.
                p.customizationId = self.getCustomizationId(usecase);

                // BT-21 + BT-22 : notes brutes, prefixe technique conserve.
                p.notesRaw = notes;

                // BT-6 et BT-111 : seuls montants autorises dans une autre devise
                // que BT-5. Le calcul reprend celui de la note de taux de change,
                // afin que le XML et la mention lue par l'humain concordent.
                p.taxCurrency = taxCur;
                p.taxCurrencyAmount = (taxCur && cfg.fxRate)
                    ? (Math.round((parseFloat(p.taxAmount) / parseFloat(cfg.fxRate)) * 100) / 100).toFixed(2)
                    : null;

                // BT-81 : le pivot du lisible ne porte que le libelle humain.
                p.paymentMeansCode = cfg.paymentMeans || "30";

                // BG-20 / BG-21 : le lisible n'a besoin que des totaux, le CII
                // veut chaque remise avec son motif et sa categorie de TVA.
                p.allowanceCharges = ld.allowanceCharges || [];

                // BG-10 : restreint a BT-59, BT-60 et BT-61. Ni adresse, ni
                // numero de TVA ne sont admis sur le beneficiaire du paiement.
                //
                // Le beneficiaire est resolu selon EXACTEMENT la meme cascade
                // que buildXML : tiers importe, puis factor, distributeur,
                // collaborateur. Le pivot ne connaissait auparavant que le
                // factor, si bien que le CII perdait silencieusement un tiers
                // que l'UBL declarait (cas 5 et 9), sans qu'aucun controle ne
                // le signale. Toute divergence entre les deux cascades est un
                // bug : elles decrivent le meme fait.
                p.payee = payeeParty
                    ? { legalName: payeeParty.legalName, name: null, siren: payeeParty.siren,
                        nic: payeeParty.nic, address: null }
                    : null;

                // Tiers PAYEUR : la partie qui paie la facture sans en etre le
                // destinataire (un OPCO qui prend en charge une formation, par
                // exemple). ram:PayerTradeParty existe dans le XSD D22B mais
                // n'est admis que par le profil EXTENDED-CTC-FR : l'emettre sous
                // un CustomizationID EN 16931 pur ferait echouer le schematron.
                // On ne l'emet donc QUE si le cas declare le profil etendu, et
                // le montant pris en charge continue de passer par BT-113
                // (TotalPrepaidAmount), qui est du socle et vaut partout.
                p.extendedProfile = self.getCustomizationId(usecase).indexOf("extended-ctc-fr") !== -1;
                p.payer = null;
                if (cfg.payer) {
                    var payerParty = findThirdParty(cfg.payer);
                    if (payerParty) {
                        p.payer = { legalName: payerParty.legalName, name: null,
                                    siren: payerParty.siren, nic: payerParty.nic, address: null };
                    }
                }

                // BG-24 et BT-16 : le bon de livraison joint vaut reference
                // d'avis d'expedition, exactement comme en UBL.
                p.attachments = attachments || [];
                var bl = p.attachments.filter(function(a) { return a.description === "BON_LIVRAISON"; })[0];
                p.despatchId = bl ? (bl.docNumber || null) : null;

                // BT-9 : une date d'echeance n'a pas de sens sur un avoir.
                if (typeCode === "381") p.dueDate = null;

                // BG-3 : la reference explicite prime, exactement comme dans
                // buildXML, ou elle alimente getBillingReference.
                if (refOriginale) {
                    p.precedingInvoice = { id: refOriginale, date: precedingDate || dateFactureXML };
                }

                if (poNumber) p.orderReference = poNumber;

                // BT-83 : l'information de remise porte le numero de la facture
                // reellement emise, qui n'est pas celui du document pivot quand
                // buildCiiPivot est appele pour un avoir ou une rectificative.
                p.paymentReference = numFacture;

                return p;
            };

            // ==========================================
            // 5. ROUTAGE : ZIP vs FICHIER SIMPLE
            // ==========================================
            if (cfg.zip) {
                if (typeof JSZip === 'undefined') {
                    alert("Erreur: La librairie JSZip n'est pas chargee."); return;
                }

                var zip = new JSZip();

                if (cfg.rectificative) {
                    // ========================================
                    // ZIP RECTIFICATIVE : Originale + Corrigee
                    // ========================================
                    var originalNum = numeroFacture;
                    var rectNum = numeroFacture + "-RECT";

                    // 1. Facture originale (380) avec ERREUR sur ligne 2
                    var originalData = self.getOriginalInvoiceData();
                    zip.file(originalNum + "_Facture_Originale_380" + ".xml",
                        buildXML(originalNum, "380", false, null, null, originalData));

                    // 2. Facture rectificative (384) corrigee, reference l'originale
                    var rectData = self.getLineData("nominal-litige-rectificative");
                    zip.file(rectNum + "_Facture_Rectificative_384" + ".xml",
                        buildXML(rectNum, "384", false, originalNum, null, rectData));

                    // Les deux memes documents en syntaxe CII, pour comparer
                    // l'expression d'une rectification dans les deux formats.
                    if (self.getComposition(usecase).format === 'cii') {
                        var pOrig = buildCiiPivot(originalNum, "380", originalData, null, null, null);
                        if (pOrig) zip.file(originalNum + "_Facture_Originale_380_CII.xml", CIIGenerator.build(pOrig));
                        var pRect = buildCiiPivot(rectNum, "384", rectData, null, null, originalNum);
                        if (pRect) zip.file(rectNum + "_Facture_Rectificative_384_CII.xml", CIIGenerator.build(pRect));
                    }

                    zip.generateAsync({ type: "blob" }).then(function(content) {
                        var url = window.URL.createObjectURL(content);
                        var a = document.createElement("a");
                        var zipName = "Pack_" + trigramme + "_Rectificative_" + nomExplicatif + "_" + yyyy + MM + dd + "_" + HH + mm + ss + ".zip";
                        a.href = url;
                        a.download = zipName;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        if (typeof UIManager !== 'undefined') UIManager.showSuccess(zipName);
                    });

                } else {
                    // ========================================
                    // ZIP AVOIR : Facture + Avoir + CSV (cas B, nominal-litige-avoir)
                    // ========================================
                    var originalInvoiceNum = numeroFacture;
                    var creditNoteNum = numeroFacture + "-AV";
                    var poNumber = "PO" + yy + MM + dd + HH + mm;

                    var orderDateCSV = yyyy + "-" + MM + "-" + dd;
                    var supplierNameClean = supplier.name.replace(/[^a-zA-Z0-9]/g, '-');
                    var csvBaseName = supplierNameClean + "-" + yyyy + "-" + MM + "-" + dd + "-" + HH + "-" + mm;

                    // Les CSV Master Data (commandes) n'ont de sens que pour le
                    // pack B, construit autour d'un jeu de commandes multi-PO.
                    if (usecase === "B") {
                        var csvHeaders = UBLTemplates.getPOHeadersCSV();
                        csvHeaders += UBLTemplates.getPOHeadersRow(poNumber, orderDateCSV);
                        zip.file(csvBaseName + "__PurchaseorderHeaders__.csv", csvHeaders);

                        var csvItems = UBLTemplates.getPOItemsCSV();
                        csvItems += UBLTemplates.getPOItemsRow(poNumber);
                        zip.file(csvBaseName + "__PurchaseorderItems__.csv", csvItems);
                    }

                    // L'avoir du cas nominal-litige-avoir est un avoir PARTIEL :
                    // il ne credite que la ligne contestee, pas la facture entiere.
                    // L'avoir du cas nominal-litige-avoir est un avoir PARTIEL ;
                    // celui du pack B annule une unite d'une ligne de commande.
                    var creditData = usecase === "B" ? self.getPackBCreditData() : self.getCreditNoteData();

                    zip.file(originalInvoiceNum + "_Cas_" + usecase + "_Facture_Litige" + ".xml",
                        buildXML(originalInvoiceNum, "380", false, null, poNumber));
                    zip.file(creditNoteNum + "_Cas_" + usecase + "_Avoir" + ".xml",
                        buildXML(creditNoteNum, "381", true, originalInvoiceNum, poNumber, creditData));

                    // C'est ici que la difference structurelle entre les deux
                    // syntaxes se voit le mieux : l'avoir UBL change d'element
                    // racine (CreditNote au lieu d'Invoice) alors que l'avoir CII
                    // conserve rsm:CrossIndustryInvoice et se signale par le seul
                    // ram:TypeCode 381.
                    if (self.getComposition(usecase).format === 'cii') {
                        var pFac = buildCiiPivot(originalInvoiceNum, "380", null, poNumber, null, null);
                        if (pFac) zip.file(originalInvoiceNum + "_Cas_" + usecase + "_Facture_Litige_CII.xml", CIIGenerator.build(pFac));
                        var pAv = buildCiiPivot(creditNoteNum, "381", creditData, poNumber, null, originalInvoiceNum);
                        if (pAv) zip.file(creditNoteNum + "_Cas_" + usecase + "_Avoir_CII.xml", CIIGenerator.build(pAv));
                    }

                    zip.generateAsync({ type: "blob" }).then(function(content) {
                        var url = window.URL.createObjectURL(content);
                        var a = document.createElement("a");
                        var zipName = "Pack_" + trigramme + "_Cas" + usecase + "_" + nomExplicatif + "_" + yyyy + MM + dd + "_" + HH + mm + ss + ".zip";
                        a.href = url;
                        a.download = zipName;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        if (typeof UIManager !== 'undefined') UIManager.showSuccess(zipName);
                    });
                }

            } else {
                // ========================================
                // COMPOSITION A LA CARTE
                // Un seul fichier de facture, dans le format choisi, portant
                // exactement les pieces demandees. Les PDF autonomes ne sont
                // ajoutes que s'ils ont ete explicitement coches.
                // ========================================
                var comp = self.getComposition(usecase);
                var baseName = numeroFacture + "_Cas_" + usecase + "_" + nomExplicatif;
                var artifacts = [];
                var renderData = null;
                var pdfDoc = null, orderDoc = null, despatchDoc = null;

                var needLisible  = comp.embed.lisible || comp.side.lisible || comp.format === 'facturx';
                var needOrder    = comp.embed.order || comp.side.order;
                var needDespatch = comp.embed.despatch || comp.side.despatch;

                // Le modele pivot est construit UNE SEULE FOIS : lisible, bon de
                // commande et bon de livraison en descendent tous les trois, ce
                // qui garantit qu'ils concordent au centime avec la facture.
                if (needLisible || needOrder || needDespatch) {
                    renderData = buildRenderData(numeroFacture, invoiceTypeCode, null);
                    if (renderData) {
                        if (needLisible) pdfDoc = PDFLisible.build(renderData);
                        if (needOrder) orderDoc = PDFAnnexes.buildOrder(renderData);
                        if (needDespatch) despatchDoc = PDFAnnexes.buildDespatch(renderData);
                    } else {
                        // Repli : plutot que de livrer un hybride dont la face
                        // lisible n'a pas pu etre produite, on livre la facture nue.
                        comp.embed = { lisible: false, order: false, despatch: false };
                        comp.side  = { lisible: false, order: false, despatch: false };
                        if (comp.format === 'facturx') comp.format = 'ubl';
                    }
                }

                var toAttachment = function(doc) {
                    return {
                        id: numeroFacture + "-" + doc.description,
                        description: doc.description,
                        filename: doc.filename,
                        base64: doc.base64,
                        docNumber: doc.number
                    };
                };

                // BG-24 : les pieces embarquees dans le fichier de facture.
                // Une seule valeur LISIBLE au maximum (BR-FR-18).
                var embedded = [];
                if (comp.embed.lisible && comp.format !== 'facturx' && pdfDoc) {
                    embedded.push({
                        id: numeroFacture + "-LISIBLE",
                        description: "LISIBLE",
                        filename: pdfDoc.filename,
                        base64: pdfDoc.base64
                    });
                }
                if (comp.embed.order && orderDoc) embedded.push(toAttachment(orderDoc));
                if (comp.embed.despatch && despatchDoc) embedded.push(toAttachment(despatchDoc));
                var attList = embedded.length ? embedded : null;

                var suffix = self.composeSuffix(comp.format, comp.embed);

                if (comp.format === 'ubl') {
                    artifacts.push({
                        name: baseName + suffix,
                        blob: new Blob([buildXML(numeroFacture, invoiceTypeCode, false, precedingRefId, "PO-1001", null, attList)],
                            { type: "application/xml" })
                    });

                } else if (comp.format === 'cii') {
                    // Meme pivot que l'UBL : un ecart de montant entre les deux
                    // syntaxes serait un bug, pas une difference de format.
                    var ciiPivot = buildCiiPivot(numeroFacture, invoiceTypeCode, null, "PO-1001", attList);
                    if (ciiPivot) {
                        var ciiXml = CIIGenerator.build(ciiPivot);
                        var ciiErr = CIIGenerator.verify(ciiPivot, ciiXml);
                        if (ciiErr.length) console.warn("CII : incoherences detectees", ciiErr);
                        artifacts.push({
                            name: baseName + suffix,
                            blob: new Blob([ciiXml], { type: "application/xml" })
                        });
                    }

                } else if (comp.format === 'facturx' && renderData) {
                    // Le PDF ETANT le document lisible, la valeur LISIBLE du
                    // BT-123 n'a pas lieu d'etre. Les bons demandes voyagent
                    // comme fichiers associes du PDF/A-3 (relation /Supplement)
                    // plutot que recopies en base64 dans le XML, mais le BT-16
                    // reste emis : une reference documentaire garde son sens
                    // quel que soit le conteneur qui transporte le fichier.
                    var fxDocs = [];
                    if (comp.embed.order && orderDoc) fxDocs.push(orderDoc);
                    if (comp.embed.despatch && despatchDoc) fxDocs.push(despatchDoc);

                    var fxRefs = fxDocs.length ? fxDocs.map(function(a) {
                        return { description: a.description, docNumber: a.number };
                    }) : null;

                    var fxPivot = buildCiiPivot(numeroFacture, invoiceTypeCode, null, "PO-1001", fxRefs);
                    if (fxPivot) {
                        fxPivot.attachments = [];
                        var fxXml = CIIGenerator.build(fxPivot);
                        var fxErr = CIIGenerator.verify(fxPivot, fxXml);
                        if (fxErr.length) console.warn("Factur-X : incoherences detectees", fxErr);
                        var fxFiles = fxDocs.length ? fxDocs.map(function(a) {
                            return { filename: a.filename, desc: a.description, raw: a.raw };
                        }) : null;
                        var fxDoc = PDFFacturX.buildFacturX(renderData, fxXml, fxFiles);
                        artifacts.push({
                            name: baseName + suffix,
                            blob: PDFFacturX.toBlob(fxDoc.raw)
                        });
                    }
                }

                // Garde-fou : quoi qu'il arrive, on ne repart jamais les mains vides.
                if (!artifacts.length) {
                    artifacts.push({
                        name: baseName + "_UBL.xml",
                        blob: new Blob([buildXML(numeroFacture, invoiceTypeCode, false, precedingRefId, "PO-1001")],
                            { type: "application/xml" })
                    });
                }

                // Etage C : les memes pieces en PDF autonomes. Jamais cochees
                // par defaut, jamais imposees par un choix de l'etage B.
                if (comp.side.lisible && pdfDoc) {
                    artifacts.push({ name: pdfDoc.filename, blob: PDFLisible.toBlob(pdfDoc.raw) });
                }
                if (comp.side.order && orderDoc) {
                    artifacts.push({ name: orderDoc.filename, blob: PDFAnnexes.toBlob(orderDoc.raw) });
                }
                if (comp.side.despatch && despatchDoc) {
                    artifacts.push({ name: despatchDoc.filename, blob: PDFAnnexes.toBlob(despatchDoc.raw) });
                }

                if (artifacts.length === 1) {
                    self.triggerDownload(artifacts[0].blob, artifacts[0].name);
                } else {
                    if (typeof JSZip === 'undefined') {
                        alert("Erreur: La librairie JSZip n'est pas chargee."); return;
                    }
                    var zipSimple = new JSZip();
                    artifacts.forEach(function(item) { zipSimple.file(item.name, item.blob); });
                    var zipSimpleName = "Pack_" + trigramme + "_Cas" + usecase + "_" + nomExplicatif +
                        "_" + yyyy + MM + dd + "_" + HH + mm + ss + ".zip";
                    zipSimple.generateAsync({ type: "blob" }).then(function(content) {
                        self.triggerDownload(content, zipSimpleName);
                    });
                }
            }

        } catch (error) {
            console.error("Erreur critique :", error);
            alert("Erreur de generation ! " + error.message);
        }
    }
};
