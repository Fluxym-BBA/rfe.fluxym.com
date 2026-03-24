/**
 * UBL-GENERATOR.JS v2 — Gère les 48 cas d'usage FNFE
 * Approche config-driven : chaque cas définit ses paramètres,
 * le moteur buildXML() génère le XML correspondant.
 */

const UBLGenerator = {

    // ═══════════════════════════════════════════
    // CONFIG PAR CAS D'USAGE
    // ═══════════════════════════════════════════
    caseConfig: {
        // --- NOMINAL ---
        "nominal":                     { typeCode: "380", profile: "S1", zip: false },
        "nominal-rejet-emission":      { typeCode: "380", profile: "S1", zip: false },
        "nominal-non-transmise":       { typeCode: "380", profile: "S1", zip: false },
        "nominal-rejet-reception":     { typeCode: "380", profile: "S1", zip: false },
        "nominal-refus":               { typeCode: "380", profile: "S1", zip: false },
        "nominal-litige-avoir":        { typeCode: "381", profile: "S1", zip: true, creditNote: true },
        "nominal-litige-rectificative":{ typeCode: "384", profile: "S1", zip: false, billingRef: true },
        // --- STANDARD ---
        "1":  { typeCode: "380", profile: "B1", zip: false, multiPO: true },
        "31": { typeCode: "380", profile: "M1", zip: false },
        // --- PAIEMENT & TIERS ---
        "2":  { typeCode: "380", profile: "S2", zip: false, prepaid: true },
        "3":  { typeCode: "380", profile: "S1", zip: false, tiersPayeur: true },
        "4":  { typeCode: "380", profile: "S1", zip: false, partialPrepaid: true },
        "5":  { typeCode: "380", profile: "S2", zip: false, prepaid: true, payeeType: "collaborateur" },
        "6":  { typeCode: "380", profile: "S7", zip: false },
        "7":  { typeCode: "380", profile: "B2", zip: false, prepaid: true, paymentMeans: "48" },
        // --- AFFACTURAGE ---
        "8":  { typeCode: "393", profile: "S1", zip: false, payeeType: "factor" },
        "9":  { typeCode: "380", profile: "S1", zip: false, payeeType: "distributeur" },
        "10": { typeCode: "380", profile: "S1", zip: false },
        // --- INTERMÉDIAIRES ---
        "11": { typeCode: "380", profile: "S1", zip: false },
        "12": { typeCode: "380", profile: "S1", zip: false },
        "15": { typeCode: "380", profile: "S1", zip: false },
        "16": { typeCode: "380", profile: "S1", zip: false },
        // --- SOUS/CO-TRAITANCE ---
        "13": { typeCode: "380", profile: "S1", zip: false },
        "14": { typeCode: "380", profile: "S6", zip: false, agentVendeur: true },
        // --- MARKETPLACE ---
        "17a": { typeCode: "380", profile: "S1", zip: false },
        "17b": { typeCode: "380", profile: "S1", zip: false, agentVendeur: true },
        // --- MANDAT & AUTO-FACTURATION ---
        "18":  { typeCode: "383", profile: "S1", zip: false, billingRef: true },
        "19a": { typeCode: "380", profile: "S1", zip: false, agentVendeur: true },
        "19b": { typeCode: "389", profile: "S1", zip: false, agentVendeur: true, selfBilling: true },
        // --- ACOMPTE & ESCOMPTE ---
        "20":  { typeCode: "386", profile: "S1", zip: false },
        "21":  { typeCode: "380", profile: "S4", zip: false, billingRef: true, negativeLines: true },
        "22a": { typeCode: "380", profile: "S1", zip: false },
        "22b": { typeCode: "380", profile: "B1", zip: false },
        // --- B2C / SPÉCIFIQUES ---
        "23": { typeCode: "380", profile: "S1", zip: false },
        "24": { typeCode: "380", profile: "S1", zip: false },
        "25": { typeCode: "380", profile: "S1", zip: false },
        "26": { typeCode: "380", profile: "S1", zip: false },
        "27": { typeCode: "380", profile: "S1", zip: false },
        "28": { typeCode: "380", profile: "S7", zip: false },
        "29": { typeCode: "380", profile: "S1", zip: false },
        "30": { typeCode: "380", profile: "S7", zip: false },
        "32": { typeCode: "386", profile: "S1", zip: false },
        "33": { typeCode: "380", profile: "S1", zip: false },
        "34": { typeCode: "380", profile: "S1", zip: false },
        "35": { typeCode: "380", profile: "S1", zip: false },
        "36": { typeCode: "380", profile: "S1", zip: false },
        "37": { typeCode: "380", profile: "S1", zip: false },
        "38": { typeCode: "380", profile: "S1", zip: false },
        "39": { typeCode: "380", profile: "S8", zip: false, agentVendeur: true },
        "40": { typeCode: "380", profile: "S1", zip: false },
        "41": { typeCode: "380", profile: "S1", zip: false },
        "42": { typeCode: "380", profile: "S1", zip: false },
        // --- PACKS ZIP (inchangés) ---
        "A": { typeCode: "380", profile: "B1", zip: true },
        "B": { typeCode: "380", profile: "B1", zip: true, creditNote: true }
    },

    // ═══════════════════════════════════════════
    // DONNÉES DE LIGNE PAR CAS
    // ═══════════════════════════════════════════
    getLineData: function(usecase) {
        switch(usecase) {
            // --- MULTI-COMMANDE ---
            case "1":
                return {
                    tax: ["3250.00", "650.00"],
                    totals: ["3250.00", "3250.00", "3900.00", "0.00", "3900.00"],
                    lines: [
                        { id: "1", qty: "10.00", amount: "1500.00", desc: "Licences logicielles", price: "150.00", po: { line: "10", id: "PO-1001" } },
                        { id: "2", qty: "2.00", amount: "1750.00", desc: "Jours de consulting Fluxym", price: "875.00", po: { line: "20", id: "PO-1002" } }
                    ]
                };

            // --- PRÉPAYÉ / NOTE DE FRAIS / CARTE LOGÉE ---
            case "2":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "1200.00", "0.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Prestation (deja payee)", price: "1000.00" }]
                };
            case "5":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "1200.00", "0.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Note de Frais (Billet Train)", price: "1000.00" }]
                };
            case "7":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "1200.00", "0.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Achat Materiel (Carte Logee)", price: "1000.00" }]
                };

            // --- ACOMPTE ---
            case "3":
            case "20":
            case "32":
                return {
                    tax: ["500.00", "100.00"],
                    totals: ["500.00", "500.00", "600.00", "0.00", "600.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "500.00", desc: "Acompte 50% sur projet", price: "500.00" }]
                };

            // --- PRISE EN CHARGE PARTIELLE ---
            case "4":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "500.00", "700.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Materiel avec subvention 500e", price: "1000.00" }]
                };

            // --- AFFACTURAGE ---
            case "8":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "0.00", "1200.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Prestation cedee au Factor", price: "1000.00" }]
                };
            case "9":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "0.00", "1200.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Prestation via Distributeur", price: "1000.00" }]
                };

            // --- FACTURE DÉFINITIVE APRÈS ACOMPTE ---
            case "21":
                return {
                    tax: ["500.00", "100.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "600.00", "600.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "1000.00", desc: "Prestation complete (total)", price: "1000.00" },
                        { id: "2", qty: "-1.00", amount: "-500.00", desc: "Deduction acompte (ref FAC-ACOMPTE)", price: "500.00" }
                    ]
                };

            // --- NOTE DE DÉBIT ---
            case "18":
                return {
                    tax: ["200.00", "40.00"],
                    totals: ["200.00", "200.00", "240.00", "0.00", "240.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "200.00", desc: "Penalites de retard (note de debit)", price: "200.00" }]
                };

            // --- AUTO-FACTURATION ---
            case "19b":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "0.00", "1200.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Auto-facturation (self-billing)", price: "1000.00" }]
                };

            // --- SOUS-LIGNES / KIT ---
            case "38":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "0.00", "1200.00"],
                    lines: [
                        { id: "1", qty: "1.00", amount: "1000.00", desc: "Kit Complet (ligne parent)", price: "1000.00" },
                        { id: "1.1", qty: "1.00", amount: "0.00", desc: "  └ Composant A (informatif)", price: "0.00" },
                        { id: "1.2", qty: "1.00", amount: "0.00", desc: "  └ Composant B (informatif)", price: "0.00" }
                    ]
                };

            // --- FACTURES MIXTES ---
            case "31":
                return {
                    tax: ["1500.00", "300.00"],
                    totals: ["1500.00", "1500.00", "1800.00", "0.00", "1800.00"],
                    lines: [
                        { id: "1", qty: "10.00", amount: "1000.00", desc: "Fournitures (biens)", price: "100.00" },
                        { id: "2", qty: "1.00", amount: "500.00", desc: "Installation (service)", price: "500.00" }
                    ]
                };

            // --- ESCOMPTE ---
            case "22a":
            case "22b":
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "0.00", "1200.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Prestation avec escompte applicable", price: "1000.00" }]
                };

            // --- TVA SUR LA MARGE ---
            case "33":
                return {
                    tax: ["166.67", "33.33"],
                    totals: ["1000.00", "1000.00", "1000.00", "0.00", "1000.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Bien d'occasion (TVA sur la marge)", price: "1000.00" }]
                };

            // --- ASSUJETTI UNIQUE ---
            case "29":
                return {
                    tax: ["1000.00", "0.00"],
                    totals: ["1000.00", "1000.00", "1000.00", "0.00", "1000.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Prestation intra-groupe (TVA = 0, assujetti unique)", price: "1000.00" }]
                };

            // --- DÉBOURS ---
            case "16":
                return {
                    tax: ["0.00", "0.00"],
                    totals: ["500.00", "500.00", "500.00", "0.00", "500.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "500.00", desc: "Debours (avance pour le compte du client, hors champ TVA)", price: "500.00" }]
                };

            // --- PACKS ZIP (existants) ---
            case "A":
            case "B":
                return null; // Géré dans la section ZIP

            // --- DÉFAUT : Prestation standard ---
            default:
                return {
                    tax: ["1000.00", "200.00"],
                    totals: ["1000.00", "1000.00", "1200.00", "0.00", "1200.00"],
                    lines: [{ id: "1", qty: "1.00", amount: "1000.00", desc: "Prestation standard", price: "1000.00" }]
                };
        }
    },

    // ═══════════════════════════════════════════
    // GÉNÉRATION DU FICHIER
    // ═══════════════════════════════════════════
    generateFile: function() {
        try {
            // 1. Récupération des saisies
            var trigramme = document.getElementById('trigramme').value.toUpperCase() || "UNK";
            var usecase = document.getElementById('usecase').value;
            var targetPlatform = document.getElementById('target-platform').value;

            var supplierId = document.getElementById('adv-supplier') ? document.getElementById('adv-supplier').value : null;
            var buyerId = document.getElementById('adv-buyer') ? document.getElementById('adv-buyer').value : null;
            var factorId = document.getElementById('adv-factor') ? document.getElementById('adv-factor').value : null;

            var data = window.APP_DATA.companies;
            var supplier = supplierId ? data.suppliers.find(function(s) { return s.id === supplierId; }) : data.suppliers[0];
            var buyer = buyerId ? data.buyers.find(function(b) { return b.id === buyerId; }) : data.buyers[0];
            var factor = factorId ? data.factors.find(function(f) { return f.id === factorId; }) : data.factors[0];

            if (!supplier || !buyer) {
                alert("Erreur: Données d'entreprise introuvables."); return;
            }

            // 2. Dates et Numéros
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

            // Échéance : 0 jours si prépayé, sinon 30 jours
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
            var platformSuffix = targetPlatform === 'basware' ? '_Basware' : '';

            // 3. Config du cas
            var invoiceTypeCode = cfg.typeCode;
            var profileId = cfg.profile;
            var isCreditNote = cfg.creditNote || false;

            var notes = [
                "#BAR#B2B",
                "#PMT#Indemnite forfaitaire pour frais de recouvrement : 40 euros.",
                "#PMD#En cas de retard de paiement, des penalites egales a 3 fois le taux d'interet legal seront appliquees.",
                "#AAB#Pas d'escompte pour paiement anticipe."
            ];

            // Notes spécifiques selon le cas
            if (usecase === "33") notes.push("#AAI#Regime TVA sur la marge - Article 297 A du CGI");
            if (usecase === "29") notes.push("#AAI#Facturation intra-groupe - Assujetti unique Art. 256 C du CGI");
            if (usecase === "16") notes.push("#AAI#Debours - Avance de frais pour le compte du client - Hors champ TVA");
            if (usecase === "6" || usecase === "28" || usecase === "30") notes.push("#AAI#TVA deja collectee via e-reporting B2C - Cadre S7");

            // ==========================================
            // FONCTION INTERNE : buildXML
            // ==========================================
            var self = this;
            var buildXML = function(numFacture, typeCode, asCreditNote, refOriginale, poNumber) {
                asCreditNote = asCreditNote || false;
                refOriginale = refOriginale || null;
                poNumber = poNumber || null;

                var xml = UBLTemplates.getHeader(numFacture, dateFactureXML, dateEcheanceXML, typeCode, profileId, notes, asCreditNote);

                if (asCreditNote && refOriginale) {
                    xml += UBLTemplates.getBillingReference(refOriginale, dateFactureXML);
                }
                if (cfg.billingRef && !asCreditNote) {
                    xml += UBLTemplates.getBillingReference("FAC-ORIGINE-REF", dateFactureXML);
                }

                xml += UBLTemplates.getSupplierParty(supplier);
                xml += UBLTemplates.getCustomerParty(buyer);

                // --- Parties spéciales ---
                if (cfg.payeeType === "factor" && factor) {
                    xml += UBLTemplates.getPayeeParty(factor.siren + "00001", factor.name, factor.siren);
                }
                if (cfg.payeeType === "distributeur") {
                    xml += UBLTemplates.getPayeeParty("88888888800001", "DISTRI-LOGISTIQUE SAS", "888888888");
                }
                if (cfg.payeeType === "collaborateur") {
                    xml += UBLTemplates.getPayeeParty("00000000000001", "DUPONT Jean (Employe)", "000000000");
                }
                if (cfg.tiersPayeur) {
                    xml += UBLTemplates.getPayeeParty("99999999900001", "Stark Industries (Tiers Payeur)", "999999999");
                }
                if (cfg.paymentMeans) {
                    xml += UBLTemplates.getPaymentMeans(cfg.paymentMeans);
                }

                // --- Lignes et Totaux ---
                if (asCreditNote) {
                    xml += UBLTemplates.getTaxTotal("6.32", "1.26");
                    xml += UBLTemplates.getLegalMonetaryTotal("6.32", "6.32", "7.58", "0.00", "7.58");
                    xml += UBLTemplates.getInvoiceLine("1", "-1.00", "6.32", "Annulation 1 unite CNT50922", "6.32", true, { line: "000003", id: poNumber });
                }
                else if (usecase === "A" || usecase === "B") {
                    xml += UBLTemplates.getTaxTotal("4934.70", "986.94");
                    xml += UBLTemplates.getLegalMonetaryTotal("4934.70", "4934.70", "5921.64", "0.00", "5921.64");
                    xml += UBLTemplates.getInvoiceLine("1", "1.00", "0.38", "CNT01160", "0.38", false, { line: "000001", id: poNumber });
                    xml += UBLTemplates.getInvoiceLine("2", "100.00", "136.00", "CNT31421", "1.36", false, { line: "000002", id: poNumber });
                    xml += UBLTemplates.getInvoiceLine("3", "186.00", "1175.52", "CNT50922", "6.32", false, { line: "000003", id: poNumber });
                    xml += UBLTemplates.getInvoiceLine("4", "30.00", "2113.20", "CNTUSB20", "70.44", false, { line: "000010", id: poNumber });
                    xml += UBLTemplates.getInvoiceLine("5", "1110.00", "1509.60", "CNT00443", "1.36", false, { line: "000020", id: poNumber });
                }
                else {
                    var ld = self.getLineData(usecase);
                    if (ld) {
                        xml += UBLTemplates.getTaxTotal(ld.tax[0], ld.tax[1]);
                        xml += UBLTemplates.getLegalMonetaryTotal(ld.totals[0], ld.totals[1], ld.totals[2], ld.totals[3], ld.totals[4]);
                        ld.lines.forEach(function(line) {
                            xml += UBLTemplates.getInvoiceLine(
                                line.id, line.qty, line.amount, line.desc, line.price,
                                asCreditNote, line.po || null
                            );
                        });
                    }
                }

                xml += UBLTemplates.getFooter(asCreditNote);
                return xml;
            };

            // ==========================================
            // 4. ROUTAGE : ZIP vs FICHIER SIMPLE
            // ==========================================
            if (cfg.zip) {
                if (typeof JSZip === 'undefined') {
                    alert("Erreur: La librairie JSZip n'est pas chargée."); return;
                }

                var zip = new JSZip();
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

                zip.file(originalInvoiceNum + "_Cas_" + usecase + "_Facture_Litige" + platformSuffix + ".xml",
                    buildXML(originalInvoiceNum, "380", false, null, poNumber));
                zip.file(creditNoteNum + "_Cas_" + usecase + "_Avoir" + platformSuffix + ".xml",
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

            } else {
                var xmlContent = buildXML(numeroFacture, invoiceTypeCode, false, null, "PO-1001");
                var blob = new Blob([xmlContent], { type: "application/xml" });
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                var fileName = numeroFacture + "_Cas_" + usecase + "_" + nomExplicatif + platformSuffix + ".xml";
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                if (typeof UIManager !== 'undefined') UIManager.showSuccess(fileName);
            }

        } catch (error) {
            console.error("Erreur critique :", error);
            alert("Erreur de génération ! " + error.message);
        }
    }
};