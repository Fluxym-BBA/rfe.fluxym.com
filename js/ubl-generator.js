/**
 * UBL-GENERATOR.JS v3b
 * 35+ cas d'usage FNFE — donnees uniques et realistes
 * Config-driven + ZIP pour litige-avoir, litige-rectificative, pack B
 *
 * Auteur: Bruno BARTOLI — Fluxym / Re-Form-E
 * Date: 2026-03-28
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
        EXPORT:    { category: "G", percent: "0.00", code: "VATEX-EU-G", reason: "Exoneration de TVA pour exportation hors UE - article 262-I du CGI" }
    },

    // Profil de TVA par cas d'usage. vat = profil applique a toutes les lignes.
    // lineVat = profil par identifiant de ligne (facture mixte).
    // customization = CustomizationID specifique (obligatoire si melange O + S).
    vatProfiles: {
        "16": {
            lineVat: { "1": "STANDARD", "2": "DEBOURS", "3": "DEBOURS" },
            customization: "urn:cen.eu:en16931:2017#conformant#urn.cpro.gouv.fr:1p0:extended-ctc-fr"
        },
        "29": { vat: "GROUPE_TVA" },
        "33": { vat: "MARGE" }
    },

    // Profil de TVA applicable a une ligne donnee.
    getLineVat: function(usecase, lineId) {
        var profile = this.vatProfiles[usecase] || {};
        var key = (profile.lineVat && profile.lineVat[lineId]) || profile.vat || "STANDARD";
        return this.VAT[key] || this.VAT.STANDARD;
    },

    getCustomizationId: function(usecase) {
        var profile = this.vatProfiles[usecase] || {};
        return profile.customization || "urn:cen.eu:en16931:2017";
    },

    // Ventilation BG-23 : un sous-total par couple categorie / taux,
    // calcule a partir des lignes pour garantir BR-S-08 et BR-CO-*.
    computeTaxBreakdown: function(usecase, ld) {
        var self = this;
        var groups = {};
        var order = [];
        ld.lines.forEach(function(line) {
            var vat = self.getLineVat(usecase, line.id);
            var key = vat.category + "|" + vat.percent;
            if (!groups[key]) { groups[key] = { vat: vat, taxable: 0 }; order.push(key); }
            groups[key].taxable += parseFloat(line.amount);
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
        "3":  { typeCode: "380", profile: "S1", zip: false, tiersPayeur: true },
        "4":  { typeCode: "380", profile: "S1", zip: false, partialPrepaid: true },
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
        "14": { typeCode: "380", profile: "S6", zip: false, agentVendeur: true },

        // --- F. MARKETPLACE & MANDAT ---
        "17a": { typeCode: "380", profile: "S1", zip: false },
        "17b": { typeCode: "380", profile: "S1", zip: false, agentVendeur: true },
        "19a": { typeCode: "380", profile: "S1", zip: false, agentVendeur: true },
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
        "24": { typeCode: "380", profile: "S1", zip: false },
        "25": { typeCode: "380", profile: "S1", zip: false },
        "26": { typeCode: "380", profile: "S1", zip: false },
        "27": { typeCode: "380", profile: "S1", zip: false },
        "28": { typeCode: "380", profile: "S7", zip: false, prepaid: true },
        "29": { typeCode: "380", profile: "S1", zip: false },
        "30": { typeCode: "380", profile: "S7", zip: false, prepaid: true },
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
        "40": { typeCode: "380", profile: "S1", zip: false },
        "41": { typeCode: "380", profile: "S1", zip: false },

        // --- TESTS & PACKS ---
        "A": { typeCode: "999", profile: "S1", zip: false },
        "B": { typeCode: "380", profile: "B1", zip: true, creditNote: true }
    },

    // =====================================================
    // DONNEES DE LIGNE PAR CAS — Donnees uniques
    // BR-S-08 verifie pour chaque cas
    // =====================================================
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

            case "6":
                return {
                    tax: ["850.00", "170.00"],
                    totals: ["850.00", "850.00", "1020.00", "1020.00", "0.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "850.00", desc: "Sac cuir artisanal (vente post e-reporting B2C)", price: "850.00" }
                    ]
                };

            case "28":
                return {
                    tax: ["1580.00", "316.00"],
                    totals: ["1580.00", "1580.00", "1896.00", "1896.00", "0.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "1580.00", desc: "Bijoux fantaisie (vente post e-reporting B2C)", price: "1580.00" }
                    ]
                };

            case "30":
                return {
                    tax: ["4200.00", "840.00"],
                    totals: ["4200.00", "4200.00", "5040.00", "5040.00", "0.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "4200.00", desc: "Montres de luxe (vente post e-reporting B2C)", price: "4200.00" }
                    ]
                };

            case "24":
                return {
                    tax: ["1850.00", "370.00"],
                    totals: ["1850.00", "1850.00", "2220.00", "0.00", "2220.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "1850.00", desc: "Entretien climatisation annuel - Batiment A", price: "1850.00" }
                    ]
                };

            case "25":
                return {
                    tax: ["3200.00", "640.00"],
                    totals: ["3200.00", "3200.00", "3840.00", "0.00", "3840.00"],
                    lines: [
                        { id: "1", qty: "4.00", amount: "3200.00", desc: "Pneus hiver Michelin Pilot Alpin 5 (jeu)", price: "800.00" }
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

            case "27":
                return {
                    tax: ["980.00", "196.00"],
                    totals: ["980.00", "980.00", "1176.00", "0.00", "1176.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "980.00", desc: "Abonnement telephonie VoIP - 12 postes/mois", price: "980.00" }
                    ]
                };

            case "29":
                return {
                    tax: ["21250.00", "0.00"],
                    totals: ["21250.00", "21250.00", "21250.00", "0.00", "21250.00"],
                    lines: [
                        { id: "1", qty: "500.00", amount: "21250.00", desc: "Gaz naturel (MWh) - Livraison usine mars 2026", price: "42.50" }
                    ]
                };

            case "42":
                return {
                    tax: ["2450.00", "490.00"],
                    totals: ["2450.00", "2450.00", "2940.00", "2940.00", "0.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "2450.00", desc: "Articles detaxes - Bordereau PABLO DT2026-789012", price: "2450.00" }
                    ]
                };

            // ================================================
            //  K — CAS AVANCES & REGIMES SPECIAUX
            // ================================================

            case "33":
                return {
                    tax: ["95000.00", "0.00"],
                    totals: ["95000.00", "95000.00", "95000.00", "0.00", "95000.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "95000.00", desc: "Porsche 911 Carrera S (2019) - VIN WP0AB2A9XKS123456", price: "95000.00" }
                    ]
                };

            case "34":
                return {
                    tax: ["15600.00", "3120.00"],
                    totals: ["15600.00", "15600.00", "18720.00", "0.00", "18720.00"],
                    lines: [
                        { id: "1", qty: "12.00", amount: "15600.00", desc: "Licence SAP Business One - Poste utilisateur/an", price: "1300.00" }
                    ]
                };

            case "35":
                return {
                    tax: ["8900.00", "1780.00"],
                    totals: ["8900.00", "8900.00", "10680.00", "0.00", "10680.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "8900.00", desc: "Developpement interface API REST sur mesure", price: "8900.00" }
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

            case "40":
                return {
                    tax: ["3750.00", "750.00"],
                    totals: ["3750.00", "3750.00", "4500.00", "0.00", "4500.00"],
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

            case "B":
                return null;

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

    // =====================================================
    // TRIPTYQUE : UBL nu / UBL + lisible / PDF lisible
    // =====================================================

    // Cas pour lesquels la representation lisible est disponible.
    // Un cas n'est ajoute ici qu'apres verification de la coherence
    // entre les donnees structurees et le rendu lisible.
    PDF_CASES: ["nominal"],

    supportsPdf: function(usecase) {
        return typeof PDFLisible !== 'undefined' && this.PDF_CASES.indexOf(usecase) !== -1;
    },

    // Lecture des cases a cocher "Contenu du telechargement".
    // Repli sur l'UBL nu seul si le lisible n'est pas disponible
    // pour le cas, ou si l'utilisateur a tout decoche.
    getArtifactOptions: function(usecase) {
        var read = function(id, fallback) {
            var el = document.getElementById(id);
            return el ? el.checked : fallback;
        };
        var opts = {
            ubl: read('opt-ubl', true),
            ublWithPdf: read('opt-ubl-pdf', true),
            pdf: read('opt-pdf', true)
        };
        if (!this.supportsPdf(usecase)) {
            opts.ublWithPdf = false;
            opts.pdf = false;
        }
        if (!opts.ubl && !opts.ublWithPdf && !opts.pdf) opts.ubl = true;
        return opts;
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
            var notes = [
                "#BAR#B2B",
                "#PMT#Indemnite forfaitaire pour frais de recouvrement : 40 euros.",
                "#PMD#En cas de retard de paiement, des penalites egales a 3 fois le taux d'interet legal seront appliquees.",
                "#AAB#Pas d'escompte pour paiement anticipe."
            ];

            if (usecase === "33") notes.push("#AAI#Regime TVA sur la marge - Article 297 A du CGI");
            if (usecase === "29") notes.push("#AAI#Facturation intra-groupe - Assujetti unique Art. 256 C du CGI");
            if (usecase === "16") notes.push("#AAI#Debours - Avance de frais pour le compte du client - Hors champ TVA");
            if (usecase === "6" || usecase === "28" || usecase === "30") notes.push("#AAI#TVA deja collectee via e-reporting B2C - Cadre S7");
            if (cfg.typeCode === "393") notes.push("#ACC#Facture cedee par subrogation conventionnelle. Reglement a effectuer exclusivement aupres du Factor.");
            if (usecase === "19a") notes.push("#DCL#Facture etablie par la Criee sous mandat pour le compte du vendeur.");
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
            var buildXML = function(numFacture, typeCode, asCreditNote, refOriginale, poNumber, overrideLineData, attachment) {
                asCreditNote = asCreditNote || false;
                refOriginale = refOriginale || null;
                poNumber = poNumber || null;
                overrideLineData = overrideLineData || null;
                attachment = attachment || null;

                var xml = UBLTemplates.getHeader(numFacture, dateFactureXML, dateEcheanceXML, typeCode, profileId, notes, asCreditNote, buyerReference, self.getCustomizationId(usecase));

                // Billing reference (rectificative ou avoir)
                if (refOriginale) {
                    xml += UBLTemplates.getBillingReference(refOriginale, dateFactureXML);
                }

                // BG-24 Representation lisible embarquee (BT-123 = LISIBLE, BR-FR-17)
                if (attachment) {
                    xml += UBLTemplates.getAdditionalDocumentReference(
                        attachment.id,
                        "LISIBLE",
                        "application/pdf",
                        attachment.filename,
                        attachment.base64
                    );
                }

                xml += UBLTemplates.getSupplierParty(supplier);
                xml += UBLTemplates.getCustomerParty(buyer);

                // --- Parties speciales ---
                // Si mode custom et tiers uploade : priorite aux donnees custom
                if (window.COMPANY_MODE === 'custom' && window.CUSTOM_THIRDPARTY) {
                    var tp = window.CUSTOM_THIRDPARTY;
                    var tpSiret = tp.siren + (tp.nic || '00001');
                    xml += UBLTemplates.getPayeeParty(tpSiret, tp.name, tp.siren);
                }
                // Sinon : comportement existant (donnees predefinies)
                else if (cfg.payeeType === "factor" && factor) {
                    xml += UBLTemplates.getPayeeParty(factor.siren + (factor.nic || "00001"), factor.name, factor.siren);
                }
                else if (cfg.payeeType === "distributeur") {
                    xml += UBLTemplates.getPayeeParty("88888888800001", "DISTRI-LOGISTIQUE SAS", "888888888");
                }
                else if (cfg.payeeType === "collaborateur") {
                    xml += UBLTemplates.getPayeeParty("00000000000001", "DUPONT Jean (Employe)", "000000000");
                }
                if (cfg.tiersPayeur && !(window.COMPANY_MODE === 'custom' && window.CUSTOM_THIRDPARTY)) {
                    xml += UBLTemplates.getPayeeParty("99999999900001", "Stark Industries (Tiers Payeur)", "999999999");
                }
                // BG-16 est obligatoire (BR-49) : virement (30) par defaut.
                // BT-84 IBAN ajoute pour les codes 30 et 58 conformement a BR-50.
                var meansCode = cfg.paymentMeans || "30";
                xml += UBLTemplates.getPaymentMeans(meansCode, supplier.iban || null, supplier.bic || null);
                xml += UBLTemplates.getPaymentTerms();

                // --- Lignes et Totaux ---
                if (asCreditNote) {
                    // Avoir (cas B ZIP)
                    xml += UBLTemplates.getTaxTotal([{ taxable: "6.32", amount: "1.26", category: "S", percent: "20.00", code: "", reason: "" }]);
                    xml += UBLTemplates.getLegalMonetaryTotal("6.32", "6.32", "7.58", "0.00", "7.58");
                    xml += UBLTemplates.getInvoiceLine("1", "-1.00", "6.32", "Annulation 1 unite CNT50922", "6.32", true, { line: "000003", id: poNumber });
                }
                else if (usecase === "B" && !overrideLineData) {
                    // Cas B : bloc hardcode multi-PO
                    xml += UBLTemplates.getTaxTotal([{ taxable: "4934.70", amount: "986.94", category: "S", percent: "20.00", code: "", reason: "" }]);
                    xml += UBLTemplates.getLegalMonetaryTotal("4934.70", "4934.70", "5921.64", "0.00", "5921.64");
                    xml += UBLTemplates.getInvoiceLine("1", "1.00", "0.38", "CNT01160", "0.38", false, { line: "000001", id: poNumber });
                    xml += UBLTemplates.getInvoiceLine("2", "100.00", "136.00", "CNT31421", "1.36", false, { line: "000002", id: poNumber });
                    xml += UBLTemplates.getInvoiceLine("3", "186.00", "1175.52", "CNT50922", "6.32", false, { line: "000003", id: poNumber });
                    xml += UBLTemplates.getInvoiceLine("4", "30.00", "2113.20", "CNTUSB20", "70.44", false, { line: "000010", id: poNumber });
                    xml += UBLTemplates.getInvoiceLine("5", "1110.00", "1509.60", "CNT00443", "1.36", false, { line: "000020", id: poNumber });
                }
                else {
                    // Tous les autres cas : overrideLineData OU getLineData()
                    var ld = overrideLineData || self.getLineData(usecase);
                    if (ld) {
                        // Ventilation recalculee depuis les lignes (BG-23, BR-S-08, BR-CO-*)
                        var breakdown = self.computeTaxBreakdown(usecase, ld);
                        var vatTotal = breakdown.reduce(function(sum, s) { return sum + parseFloat(s.amount); }, 0);
                        var taxExclusive = parseFloat(ld.totals[1]);
                        var prepaid = parseFloat(ld.totals[3]);
                        var taxInclusive = Math.round((taxExclusive + vatTotal) * 100) / 100;

                        xml += UBLTemplates.getTaxTotal(breakdown);
                        xml += UBLTemplates.getLegalMonetaryTotal(
                            ld.totals[0],
                            ld.totals[1],
                            taxInclusive.toFixed(2),
                            ld.totals[3],
                            (Math.round((taxInclusive - prepaid) * 100) / 100).toFixed(2)
                        );
                        ld.lines.forEach(function(line) {
                            xml += UBLTemplates.getInvoiceLine(
                                line.id, line.qty, line.amount, line.desc, line.price,
                                asCreditNote, line.po || null,
                                self.getLineVat(usecase, line.id), line.unitCode || "C62"
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

                // Mentions lisibles : on retire le prefixe technique #XXX#
                // et la note de cadre #BAR#, non destinee au lecteur humain.
                var pdfNotes = notes
                    .filter(function(n) { return n.indexOf("#BAR#") !== 0; })
                    .map(function(n) { return n.replace(/^#[A-Z]{3}#/, ""); });

                var meansCodePdf = cfg.paymentMeans || "30";
                var meansLabel = PDFLisible.MEANS_LABELS[meansCodePdf] || ("Code " + meansCodePdf);
                var withIban = (meansCodePdf === "30" || meansCodePdf === "58");

                return {
                    supplier: supplier,
                    buyer: buyer,
                    typeCode: typeCode,
                    profileId: profileId,
                    invoiceNumber: numFacture,
                    issueDate: dateFactureXML,
                    dueDate: dateEcheanceXML,
                    buyerReference: buyerReference,
                    paymentTerms: cfg.prepaid ? "Paiement comptant" : "Paiement a 30 jours date de facture",
                    paymentMeans: meansLabel,
                    iban: withIban ? (supplier.iban || null) : null,
                    bic: withIban ? (supplier.bic || null) : null,
                    taxSubtotals: breakdown.map(function(sub) {
                        return {
                            category: sub.category,
                            percent: sub.percent,
                            taxable: sub.taxable,
                            amount: sub.amount,
                            reason: sub.reason || ""
                        };
                    }),
                    taxExclusiveAmount: ld.totals[1],
                    taxAmount: vatTotal.toFixed(2),
                    taxInclusiveAmount: taxInclusive.toFixed(2),
                    prepaidAmount: ld.totals[3],
                    payableAmount: (Math.round((taxInclusive - prepaid) * 100) / 100).toFixed(2),
                    notes: pdfNotes,
                    lines: ld.lines.map(function(line) {
                        var vat = self.getLineVat(usecase, line.id);
                        return {
                            id: line.id,
                            ref: line.ref || "",
                            desc: line.desc,
                            qty: line.qty,
                            price: line.price,
                            amount: line.amount,
                            vatPercent: vat.percent,
                            unitCode: line.unitCode || "C62"
                        };
                    })
                };
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

                    var csvHeaders = UBLTemplates.getPOHeadersCSV();
                    csvHeaders += UBLTemplates.getPOHeadersRow(poNumber, orderDateCSV);
                    zip.file(csvBaseName + "__PurchaseorderHeaders__.csv", csvHeaders);

                    var csvItems = UBLTemplates.getPOItemsCSV();
                    csvItems += UBLTemplates.getPOItemsRow(poNumber);
                    zip.file(csvBaseName + "__PurchaseorderItems__.csv", csvItems);

                    zip.file(originalInvoiceNum + "_Cas_" + usecase + "_Facture_Litige" + ".xml",
                        buildXML(originalInvoiceNum, "380", false, null, poNumber));
                    zip.file(creditNoteNum + "_Cas_" + usecase + "_Avoir" + ".xml",
                        buildXML(creditNoteNum, "381", true, originalInvoiceNum, poNumber));

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
                // FICHIER SIMPLE ou TRIPTYQUE
                // UBL nu / UBL avec lisible embarque / PDF lisible
                // ========================================
                var opts = self.getArtifactOptions(usecase);
                var baseName = numeroFacture + "_Cas_" + usecase + "_" + nomExplicatif;
                var artifacts = [];
                var pdfDoc = null;

                // Le PDF est genere UNE SEULE FOIS et sert aux deux usages :
                // fichier autonome et objet binaire base64 de BT-125.
                if (opts.pdf || opts.ublWithPdf) {
                    var renderData = buildRenderData(numeroFacture, invoiceTypeCode, null);
                    if (renderData) {
                        pdfDoc = PDFLisible.build(renderData);
                    } else {
                        opts.pdf = false;
                        opts.ublWithPdf = false;
                        opts.ubl = true;
                    }
                }

                if (opts.ubl) {
                    artifacts.push({
                        name: baseName + "_UBL.xml",
                        blob: new Blob([buildXML(numeroFacture, invoiceTypeCode, false, null, "PO-1001")],
                            { type: "application/xml" })
                    });
                }

                if (opts.ublWithPdf && pdfDoc) {
                    var attachment = {
                        id: numeroFacture + "-LISIBLE",
                        filename: pdfDoc.filename,
                        base64: pdfDoc.base64
                    };
                    artifacts.push({
                        name: baseName + "_UBL_avec_lisible.xml",
                        blob: new Blob([buildXML(numeroFacture, invoiceTypeCode, false, null, "PO-1001", null, attachment)],
                            { type: "application/xml" })
                    });
                }

                if (opts.pdf && pdfDoc) {
                    artifacts.push({
                        name: pdfDoc.filename,
                        blob: PDFLisible.toBlob(pdfDoc.raw)
                    });
                }

                if (artifacts.length === 1) {
                    self.triggerDownload(artifacts[0].blob, artifacts[0].name);
                } else {
                    if (typeof JSZip === 'undefined') {
                        alert("Erreur: La librairie JSZip n'est pas chargee."); return;
                    }
                    var zipSimple = new JSZip();
                    artifacts.forEach(function(item) { zipSimple.file(item.name, item.blob); });
                    var zipSimpleName = "Triptyque_" + trigramme + "_Cas" + usecase + "_" + nomExplicatif +
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
