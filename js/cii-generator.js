/**
 * CII-GENERATOR.JS - Assemblage du message UN/CEFACT CII D22B
 *
 * Ce module ne calcule rien. Il consomme le modele pivot produit par
 * UBLGenerator (buildCiiPivot) et le projette dans la syntaxe CII, exactement
 * comme buildXML le projette dans la syntaxe UBL. Les deux sorties decrivent
 * donc rigoureusement la meme facture : montants, ventilation de TVA et
 * identifiants proviennent d'un unique calcul.
 *
 * C'est le point pedagogique de la page : une meme semantique EN 16931, deux
 * syntaxes. Un ecart de montant entre l'UBL et le CII d'un meme cas serait un
 * bug, jamais une difference de format.
 *
 * Dependances, dans cet ordre de chargement :
 *   data/ubl-templates.js  (xmlEsc)
 *   data/cii-templates.js  (CIITemplates)
 */

const CIIGenerator = {

    // BT-8 : la liste de codes n'est pas la meme dans les deux syntaxes.
    // Le pivot raisonne en codes UBL (cbc:DescriptionCode) ; cette table les
    // projette sur les codes CII (ram:DueDateTypeCode).
    //   3   -> 5   date de facture
    //   35  -> 29  date de livraison
    //   432 -> 72  date d'encaissement
    VAT_DATE_CODE_CII: { '3': '5', '35': '29', '432': '72' },

    // Profils rencontres, pour information de l'utilisateur.
    PROFILES: {
        EN16931: 'urn:cen.eu:en16931:2017',
        EXTENDED_FX: 'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:extended',
        EXTENDED_CTC_FR: 'urn:cen.eu:en16931:2017#conformant#urn.cpro.gouv.fr:1p0:extended-ctc-fr'
    },

    /**
     * Assemble le XML CII a partir du pivot.
     * @param {Object} p modele pivot issu de UBLGenerator.buildCiiPivot
     * @returns {String} document CII D22B complet
     */
    build: function(p) {
        if (!p) return null;

        let xml = CIITemplates.getEnvelope(p.profileId, p.customizationId);
        xml += CIITemplates.getDocument(p.invoiceNumber, p.typeCode, p.issueDate, p.notesRaw);

        // Les lignes viennent en premier dans SupplyChainTradeTransaction,
        // avant les trois blocs header. L'inverse de l'UBL, ou les parties
        // precedent les lignes.
        p.lines.forEach(function(line) {
            // Une ligne GROUP du cadre S8 ne porte pas de categorie de TVA :
            // le pivot laisse alors vatCategory a null et le gabarit omet le
            // bloc ram:ApplicableTradeTax. Le defaut 'S' aurait invente une
            // categorie sur un agregat.
            const lineVat = line.vatCategory
                ? { category: line.vatCategory, percent: line.vatPercent }
                : null;
            xml += CIITemplates.getLineItem(line, lineVat, line.orderRef || null);
        });

        xml += CIITemplates.getAgreement(
            p.buyerReference,
            p.supplier,
            p.buyer,
            p.orderReference,
            p.attachments,
            // BT-12 reference du contrat
            p.contractRef || null
        );

        xml += CIITemplates.getDelivery(p.delivery, p.despatchId);

        xml += CIITemplates.getSettlement({
            currency: p.currency,
            taxCurrency: p.taxCurrency,
            payee: p.payee,
            // Le tiers payeur n'est transmis au gabarit que sous profil etendu :
            // le filtre est ici, une seule fois, plutot que disperse dans le XML.
            payer: p.extendedProfile ? p.payer : null,
            meansCode: p.paymentMeansCode,
            // BT-82 libelle du moyen de paiement, BT-83 information de remise,
            // BT-85 nom du titulaire du compte credite.
            meansLabel: p.paymentMeans || null,
            paymentReference: p.paymentReference || null,
            accountName: p.accountName || null,
            payerIban: p.payerIban || null,
            iban: p.iban,
            bic: p.bic,
            // BG-14 periode de facturation, BT-8 exigibilite de la TVA,
            // BT-19 reference comptable de l'acheteur.
            period: p.period || null,
            vatDueDateTypeCode: (p.period && p.period.code)
                ? (CIIGenerator.VAT_DATE_CODE_CII[p.period.code] || null)
                : null,
            accountingCost: p.accountingCost || null,
            taxSubtotals: p.taxSubtotals,
            allowanceCharges: p.allowanceCharges,
            paymentTerms: p.paymentTerms,
            dueDate: p.dueDate,
            precedingInvoice: p.precedingInvoice,
            totals: {
                lineExtension: p.lineExtensionAmount,
                charge: p.chargeTotal,
                allowance: p.allowanceTotal,
                taxExclusive: p.taxExclusiveAmount,
                taxAmount: p.taxAmount,
                taxCurrencyAmount: p.taxCurrencyAmount,
                taxInclusive: p.taxInclusiveAmount,
                prepaid: p.prepaidAmount,
                payable: p.payableAmount
            }
        });

        xml += CIITemplates.getFooter();
        return xml;
    },

    /**
     * Controle de coherence UBL / CII sur les montants structurants.
     * Compare les valeurs du pivot a celles relues dans le XML CII produit.
     * Retourne la liste des ecarts : vide si tout concorde.
     */
    verify: function(p, xml) {
        const errors = [];

        // ram:LineTotalAmount existe A DEUX NIVEAUX en CII : dans chaque ligne
        // (SpecifiedTradeSettlementLineMonetarySummation) et dans le total du
        // document (SpecifiedTradeSettlementHeaderMonetarySummation). Chercher
        // le tag sur le document entier renverrait la premiere ligne au lieu du
        // total. La recherche est donc bornee au bloc des totaux.
        const sumMatch = xml.match(/<ram:SpecifiedTradeSettlementHeaderMonetarySummation>([\s\S]*?)<\/ram:SpecifiedTradeSettlementHeaderMonetarySummation>/);
        const scope = sumMatch ? sumMatch[1] : '';
        if (!scope) return ['ram:SpecifiedTradeSettlementHeaderMonetarySummation absent'];

        const grab = function(tag) {
            const m = scope.match(new RegExp('<ram:' + tag + '[^>]*>([^<]+)</ram:' + tag + '>'));
            return m ? m[1] : null;
        };
        const check = function(label, expected, found) {
            if (String(expected) !== String(found)) {
                errors.push(label + ' : attendu ' + expected + ', trouve ' + found);
            }
        };
        check('BT-106 LineTotalAmount', p.lineExtensionAmount, grab('LineTotalAmount'));
        check('BT-109 TaxBasisTotalAmount', p.taxExclusiveAmount, grab('TaxBasisTotalAmount'));
        check('BT-110 TaxTotalAmount', p.taxAmount, grab('TaxTotalAmount'));
        check('BT-112 GrandTotalAmount', p.taxInclusiveAmount, grab('GrandTotalAmount'));
        check('BT-115 DuePayableAmount', p.payableAmount, grab('DuePayableAmount'));

        // BR-CO-10 : BT-109 = BT-106 - BT-107 + BT-108
        const base = parseFloat(p.lineExtensionAmount)
            - parseFloat(p.allowanceTotal || '0')
            + parseFloat(p.chargeTotal || '0');
        if (Math.abs(base - parseFloat(p.taxExclusiveAmount)) > 0.005) {
            errors.push('BR-CO-10 : BT-106 - BT-107 + BT-108 = ' + base.toFixed(2)
                + ' mais BT-109 = ' + p.taxExclusiveAmount);
        }

        // Les tiers ne sont pas des montants, mais leur disparition est une
        // perte de sens aussi grave qu'un ecart de centime. verify() ne
        // regardait que les totaux : un CII pouvait perdre un beneficiaire de
        // paiement sans qu'aucun controle ne bronche. Un controle qui ne voit
        // pas ce qu'il perd n'est pas un controle.
        const hasParty = function(tag) {
            return xml.indexOf('<ram:' + tag + '>') !== -1;
        };
        const partyName = function(tag) {
            const m = xml.match(new RegExp('<ram:' + tag + '>[\\s\\S]*?<ram:Name>([^<]+)</ram:Name>'));
            return m ? m[1] : null;
        };
        if (!hasParty('SellerTradeParty')) errors.push('BG-4 : ram:SellerTradeParty absent');
        if (!hasParty('BuyerTradeParty')) errors.push('BG-7 : ram:BuyerTradeParty absent');

        const expectedPayee = p.payee ? (p.payee.legalName || p.payee.name) : null;
        if (expectedPayee && !hasParty('PayeeTradeParty')) {
            errors.push('BG-10 : beneficiaire "' + expectedPayee + '" declare dans le pivot mais absent du CII');
        }
        if (!expectedPayee && hasParty('PayeeTradeParty')) {
            errors.push('BG-10 : ram:PayeeTradeParty emis alors que le pivot ne declare aucun beneficiaire');
        }
        if (expectedPayee) {
            const foundPayee = partyName('PayeeTradeParty');
            if (foundPayee && foundPayee !== expectedPayee) {
                errors.push('BT-59 : attendu ' + expectedPayee + ', trouve ' + foundPayee);
            }
        }

        const expectedPayer = (p.extendedProfile && p.payer) ? (p.payer.legalName || p.payer.name) : null;
        if (expectedPayer && !hasParty('PayerTradeParty')) {
            errors.push('Tiers payeur "' + expectedPayer + '" declare dans le pivot mais absent du CII');
        }
        if (!expectedPayer && hasParty('PayerTradeParty')) {
            errors.push('ram:PayerTradeParty emis sans tiers payeur dans le pivot, ou hors profil EXTENDED-CTC-FR');
        }
        if (expectedPayer) {
            const foundPayer = partyName('PayerTradeParty');
            if (foundPayer && foundPayer !== expectedPayer) {
                errors.push('Tiers payeur : attendu ' + expectedPayer + ', trouve ' + foundPayer);
            }
        }

        // ------------------------------------------------------------------
        // SOCLE ENRICHI
        // Ces champs sont optionnels au sens de la norme, donc leur absence ne
        // declenche aucune alerte de schematron : c'est precisement pourquoi une
        // regression passerait inapercue. Le controle est donc fait ici.
        // ------------------------------------------------------------------
        const socle = [
            ['BT-83 information de remise', p.paymentReference, /<ram:PaymentReference>/],
            ['BT-12 reference de contrat', p.contractRef, /<ram:ContractReferencedDocument>/],
            ['BT-19 reference comptable acheteur', p.accountingCost, /<ram:ReceivableSpecifiedTradeAccountingAccount>/],
            ['BG-14 periode de facturation', p.period && p.period.start, /<ram:BillingSpecifiedPeriod>/],
            ['BT-8 exigibilite de la TVA', p.period && p.period.code, /<ram:DueDateTypeCode>/],
            ['BT-85 titulaire du compte', p.accountName && p.iban, /<ram:AccountName>/],
            ['BT-82 libelle du moyen de paiement', p.paymentMeans, /<ram:Information>/],
            ['BT-71 identifiant du lieu de livraison', p.delivery && p.delivery.locationId, /<ram:ShipToTradeParty>\s*<ram:ID>/],
            ['BG-6 contact du vendeur', p.supplier && p.supplier.contact, /<ram:SellerTradeParty>[\s\S]*?<ram:DefinedTradeContact>/],
            ['BG-9 contact de l\'acheteur', p.buyer && p.buyer.contact, /<ram:BuyerTradeParty>[\s\S]*?<ram:DefinedTradeContact>/]
        ];
        socle.forEach(function(entry) {
            if (entry[1] && !entry[2].test(xml)) {
                errors.push(entry[0] + ' : renseigne dans le pivot mais absent du CII');
            }
        });

        // Cadre S8 : les sommations de document ne portent QUE sur les lignes
        // DETAIL. Une ligne GROUP est un agregat, la compter reviendrait a
        // doubler les montants. C'est le defaut le plus probable d'une
        // reecriture de ce cas, on le verifie donc explicitement.
        const groupLines = (p.lines || []).filter(function(l) { return l.subtype === 'GROUP'; });
        if (groupLines.length) {
            const detail = (p.lines || []).filter(function(l) { return l.subtype === 'DETAIL'; });
            const sumDetail = Math.round(detail.reduce(function(a, l) { return a + parseFloat(l.amount); }, 0) * 100) / 100;
            if (p.totals && sumDetail.toFixed(2) !== parseFloat(p.totals.lineExtension).toFixed(2)) {
                errors.push('Multi-vendeurs : BT-106 ' + p.totals.lineExtension
                    + ' ne correspond pas a la somme des lignes DETAIL ' + sumDetail.toFixed(2));
            }
            groupLines.forEach(function(g) {
                const kids = detail.filter(function(l) { return l.parentId === g.id; });
                const sk = Math.round(kids.reduce(function(a, l) { return a + parseFloat(l.amount); }, 0) * 100) / 100;
                // BR-FR-MV-05
                if (sk.toFixed(2) !== parseFloat(g.amount).toFixed(2)) {
                    errors.push('Ligne GROUP ' + g.id + ' : BT-131 ' + g.amount
                        + ' ne correspond pas a la somme de ses lignes DETAIL ' + sk.toFixed(2));
                }
                // BR-FR-MV-10 : EXT-FR-FE-184 = BT-131 + EXT-FR-FE-181
                if (g.grandTotal && g.lineVatTotal) {
                    const tt = Math.round((parseFloat(g.amount) + parseFloat(g.lineVatTotal)) * 100) / 100;
                    if (tt.toFixed(2) !== parseFloat(g.grandTotal).toFixed(2)) {
                        errors.push('Ligne GROUP ' + g.id + ' : total TTC ' + g.grandTotal
                            + ' attendu ' + tt.toFixed(2));
                    }
                }
                // BR-FR-MV-07 : les lignes DETAIL reprennent l'AFL de leur GROUP
                const aflG = (g.lineRefs || []).filter(function(r) { return r.type === 'AFL'; })[0];
                kids.forEach(function(k) {
                    const aflK = (k.lineRefs || []).filter(function(r) { return r.type === 'AFL'; })[0];
                    if (!aflG || !aflK || aflG.id !== aflK.id) {
                        errors.push('Ligne DETAIL ' + k.id + ' : numero de facture vendeur absent ou different de celui de sa ligne GROUP');
                    }
                });
            });
        }

        // Socle enrichi, niveau ligne. La regle de coherence du prix unitaire
        // est la seule du lot qui soit reellement bloquante : BT-148 - BT-147
        // doit egaler BT-146 au centime. On la recalcule ligne par ligne plutot
        // que de faire confiance au generateur.
        (p.lines || []).forEach(function(l) {
            if (!l.grossPrice) return;
            const net = Math.round((parseFloat(l.grossPrice) - parseFloat(l.priceDiscount)) * 100) / 100;
            if (net.toFixed(2) !== parseFloat(l.price).toFixed(2)) {
                errors.push('Ligne ' + l.id + ' : BT-148 ' + l.grossPrice + ' - BT-147 '
                    + l.priceDiscount + ' = ' + net.toFixed(2) + ', attendu BT-146 ' + l.price);
            }
            if (xml.indexOf('<ram:GrossPriceProductTradePrice>') === -1) {
                errors.push('Ligne ' + l.id + ' : BT-148 calcule mais prix brut absent du CII');
            }
        });

        // BR-S-08 : pour chaque taux, la base doit egaler la somme des lignes
        // concernees, augmentee des remises et frais de document.
        const sumTax = (p.taxSubtotals || []).reduce(function(t, s) {
            return t + parseFloat(s.taxable);
        }, 0);
        if (Math.abs(sumTax - parseFloat(p.taxExclusiveAmount)) > 0.005) {
            errors.push('BR-S-08 : somme des BT-116 = ' + sumTax.toFixed(2)
                + ' mais BT-109 = ' + p.taxExclusiveAmount);
        }
        return errors;
    }
};
