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
            xml += CIITemplates.getLineItem(
                line,
                { category: line.vatCategory || 'S', percent: line.vatPercent },
                line.orderRef || null
            );
        });

        xml += CIITemplates.getAgreement(
            p.buyerReference,
            p.supplier,
            p.buyer,
            p.orderReference,
            p.attachments
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
            iban: p.iban,
            bic: p.bic,
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
