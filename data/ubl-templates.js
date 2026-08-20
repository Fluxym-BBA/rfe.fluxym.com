/**
 * UBL-TEMPLATES.JS - La bibliothèque de briques XML et CSV (Format strict Esker)
 */

const csvQuote = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
};

// Echappement XML des donnees libres et des identifiants issus des jeux de donnees.
// Indispensable : l'utilisateur peut importer ses propres tiers (un nom comme
// "Durand & Fils" produirait sinon un XML rejete par tout parseur).
// Les montants, dates et codes generes en interne ne passent pas par ici.
// L'apostrophe n'est pas echappee : inutile en contenu d'element comme en
// valeur d'attribut delimitee par des guillemets doubles.
const xmlEsc = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

const UBLTemplates = {

    // Expose l'echappeur pour les appelants qui construisent du XML hors templates.
    esc: xmlEsc,

    // 1. En-tête (Invoice ou CreditNote) avec TOUS les espaces de noms
    // opts.cur   : BT-5 devise du document (EUR par defaut)
    // opts.taxCur: BT-6 devise de comptabilisation de la TVA, obligatoire des que
    //              BT-5 n'est pas l'euro (la TVA doit etre exprimee en euros).
    getHeader: (numeroFacture, dateFacture, dateEcheance, invoiceTypeCode, profileId, notes, isCreditNote = false, buyerReference = "", customizationId = "urn:cen.eu:en16931:2017", opts = {}) => `<?xml version="1.0" encoding="UTF-8"?>
<${isCreditNote ? 'CreditNote' : 'Invoice'} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${isCreditNote ? 'CreditNote' : 'Invoice'}-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2" xmlns:udt="urn:oasis:names:specification:ubl:schema:xsd:UnqualifiedDataTypes-2">
\t<cbc:UBLVersionID>2.1</cbc:UBLVersionID>
\t<cbc:CustomizationID>${customizationId}</cbc:CustomizationID>
\t<cbc:ProfileID>${profileId}</cbc:ProfileID>
\t<cbc:ID>${xmlEsc(numeroFacture)}</cbc:ID>
\t<cbc:IssueDate>${dateFacture}</cbc:IssueDate>
${!isCreditNote ? `\t<cbc:DueDate>${dateEcheance}</cbc:DueDate>\n` : ''}\t<cbc:${isCreditNote ? 'CreditNoteTypeCode' : 'InvoiceTypeCode'}>${invoiceTypeCode}</cbc:${isCreditNote ? 'CreditNoteTypeCode' : 'InvoiceTypeCode'}>
${notes.map(n => `\t<cbc:Note>${n}</cbc:Note>`).join('\n')}
\t<cbc:DocumentCurrencyCode>${opts.cur || "EUR"}</cbc:DocumentCurrencyCode>${opts.taxCur ? `
\t<cbc:TaxCurrencyCode>${opts.taxCur}</cbc:TaxCurrencyCode>` : ""}
\t<cbc:BuyerReference>${xmlEsc(buyerReference)}</cbc:BuyerReference>`,

    // 2. BillingReference AVEC LA DATE (Obligatoire pour les Avoirs)
    getBillingReference: (originalInvoiceNumber, dateFactureXML) => `
\t<cac:BillingReference>
\t\t<cac:InvoiceDocumentReference>
\t\t\t<cbc:ID>${xmlEsc(originalInvoiceNumber)}</cbc:ID>
\t\t\t<cbc:IssueDate>${dateFactureXML}</cbc:IssueDate>
\t\t</cac:InvoiceDocumentReference>
\t</cac:BillingReference>`,

    // 2ter. BT-13 Reference de la commande de l'acheteur.
    // Position imposee : apres cbc:BuyerReference, avant cac:BillingReference.
    getOrderReference: (poNumber) => `
\t<cac:OrderReference>
\t\t<cbc:ID>${xmlEsc(poNumber)}</cbc:ID>
\t</cac:OrderReference>`,

    // 2quater. BG-13 Informations de livraison : BT-72 date effective,
    // BT-70 destinataire, BG-15 adresse de livraison.
    // Position imposee : apres cac:PayeeParty / cac:TaxRepresentativeParty,
    // avant cac:PaymentMeans.
    // BR-FR-14 rend BG-15 obligatoire au 01/09/2027 lorsque l'adresse de
    // livraison differe de l'adresse de l'acheteur, pour les biens uniquement.
    getDelivery: (deliveryDate, deliveryName, address) => `
\t<cac:Delivery>${deliveryDate ? `
\t\t<cbc:ActualDeliveryDate>${deliveryDate}</cbc:ActualDeliveryDate>` : ""}${deliveryName ? `
\t\t<cac:DeliveryParty>
\t\t\t<cac:PartyName><cbc:Name>${xmlEsc(deliveryName)}</cbc:Name></cac:PartyName>
\t\t</cac:DeliveryParty>` : ""}${address ? `
\t\t<cac:DeliveryLocation>
\t\t\t<cac:Address>
\t\t\t\t<cbc:StreetName>${xmlEsc(address.street)}</cbc:StreetName>
\t\t\t\t<cbc:CityName>${xmlEsc(address.city)}</cbc:CityName>
\t\t\t\t<cbc:PostalZone>${xmlEsc(address.zip)}</cbc:PostalZone>
\t\t\t\t<cac:Country><cbc:IdentificationCode>${xmlEsc(address.country)}</cbc:IdentificationCode></cac:Country>
\t\t\t</cac:Address>
\t\t</cac:DeliveryLocation>` : ""}
\t</cac:Delivery>`,

    // 2bis. BG-24 Document justificatif : representation lisible de la facture
    // BT-122 identifiant, BT-123 = LISIBLE (BR-FR-17), BT-125 objet binaire base64
    // avec mimeCode et filename obligatoires. Une seule PJ LISIBLE par facture (BR-FR-18).
    // Position imposee : apres cac:BillingReference, avant cac:AccountingSupplierParty.
    getAdditionalDocumentReference: (id, description, mimeCode, filename, base64) => `
\t<cac:AdditionalDocumentReference>
\t\t<cbc:ID>${xmlEsc(id)}</cbc:ID>
\t\t<cbc:DocumentDescription>${xmlEsc(description)}</cbc:DocumentDescription>
\t\t<cac:Attachment>
\t\t\t<cbc:EmbeddedDocumentBinaryObject mimeCode="${mimeCode}" filename="${xmlEsc(filename)}">${base64}</cbc:EmbeddedDocumentBinaryObject>
\t\t</cac:Attachment>
\t</cac:AdditionalDocumentReference>`,

    // Fragment de partie reutilisable, conforme a la sequence de cac:PartyType :
    // PartyIdentification, PartyName, PostalAddress, PartyTaxScheme, PartyLegalEntity.
    // t = prefixe de tabulations pour l'indentation.
    partyFragment: (p, t) => `
${t}<cac:PartyIdentification><cbc:ID schemeID="0009">${xmlEsc(p.siren)}${xmlEsc(p.nic || "00001")}</cbc:ID></cac:PartyIdentification>
${t}<cac:PartyName><cbc:Name>${xmlEsc(p.name)}</cbc:Name></cac:PartyName>
${t}<cac:PostalAddress>
${t}	<cbc:StreetName>${xmlEsc(p.address.street)}</cbc:StreetName>
${t}	<cbc:CityName>${xmlEsc(p.address.city)}</cbc:CityName>
${t}	<cbc:PostalZone>${xmlEsc(p.address.zip)}</cbc:PostalZone>
${t}	<cac:Country><cbc:IdentificationCode>${xmlEsc(p.address.country)}</cbc:IdentificationCode></cac:Country>
${t}</cac:PostalAddress>${p.vatNumber ? `
${t}<cac:PartyTaxScheme>
${t}	<cbc:CompanyID>${xmlEsc(p.vatNumber)}</cbc:CompanyID>
${t}	<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
${t}</cac:PartyTaxScheme>` : ""}
${t}<cac:PartyLegalEntity>
${t}	<cbc:RegistrationName>${xmlEsc(p.legalName || p.name)}</cbc:RegistrationName>
${t}	<cbc:CompanyID schemeID="0002">${xmlEsc(p.siren)}</cbc:CompanyID>
${t}</cac:PartyLegalEntity>`,

    // 3. Bloc Fournisseur
    // agent     : EXT-FR-FE-BG-03 AGENT DE VENDEUR -> cac:Party/cac:AgentParty
    // facturant : EXT-FR-FE-BG-05 FACTURANT       -> cac:Party/cac:ServiceProviderParty
    // Les deux se placent APRES cac:PartyLegalEntity : cac:PartyType impose
    // l'ordre ... Contact, Person, AgentParty, ServiceProviderParty ...
    // Ces deux elements ne font pas partie du socle EN16931 : ils exigent le
    // profil etendu (customization extended-ctc-fr).
    getSupplierParty: (supplier, agent = null, facturant = null) => `
\t<cac:AccountingSupplierParty>
\t\t<cac:Party>
\t\t\t<cbc:EndpointID schemeID="${xmlEsc(supplier.endpointScheme || "0225")}">${xmlEsc(supplier.endpointId || supplier.siren)}</cbc:EndpointID>${supplier.siren ? `
\t\t\t<cac:PartyIdentification><cbc:ID schemeID="0009">${xmlEsc(supplier.siren)}${xmlEsc(supplier.nic || "00001")}</cbc:ID></cac:PartyIdentification>` : ""}
\t\t\t<cac:PartyName><cbc:Name>${xmlEsc(supplier.name)}</cbc:Name></cac:PartyName>
\t\t\t<cac:PostalAddress>
\t\t\t\t<cbc:StreetName>${xmlEsc(supplier.address.street)}</cbc:StreetName>
\t\t\t\t<cbc:CityName>${xmlEsc(supplier.address.city)}</cbc:CityName>
\t\t\t\t<cbc:PostalZone>${xmlEsc(supplier.address.zip)}</cbc:PostalZone>
\t\t\t\t<cac:Country><cbc:IdentificationCode>${xmlEsc(supplier.address.country)}</cbc:IdentificationCode></cac:Country>
\t\t\t</cac:PostalAddress>${supplier.vatNumber ? `
\t\t\t<cac:PartyTaxScheme>
\t\t\t\t<cbc:CompanyID>${xmlEsc(supplier.vatNumber)}</cbc:CompanyID>
\t\t\t\t<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
\t\t\t</cac:PartyTaxScheme>` : ""}${supplier.taxRegistrationId ? `
\t\t\t<cac:PartyTaxScheme>
\t\t\t\t<cbc:CompanyID>${xmlEsc(supplier.taxRegistrationId)}</cbc:CompanyID>
\t\t\t\t<cac:TaxScheme><cbc:ID>FC</cbc:ID></cac:TaxScheme>
\t\t\t</cac:PartyTaxScheme>` : ""}
\t\t\t<cac:PartyLegalEntity>
\t\t\t\t<cbc:RegistrationName>${xmlEsc(supplier.legalName)}</cbc:RegistrationName>${supplier.siren ? `
\t\t\t\t<cbc:CompanyID schemeID="0002">${xmlEsc(supplier.siren)}</cbc:CompanyID>` : ""}${supplier.legalForm ? `
\t\t\t\t<cbc:CompanyLegalForm>${xmlEsc(supplier.legalForm)}</cbc:CompanyLegalForm>` : ""}
\t\t\t</cac:PartyLegalEntity>${agent ? `
\t\t\t<cac:AgentParty>${UBLTemplates.partyFragment(agent, "\t\t\t\t")}
\t\t\t</cac:AgentParty>` : ""}${facturant ? `
\t\t\t<cac:ServiceProviderParty>
\t\t\t\t<cac:Party>${UBLTemplates.partyFragment(facturant, "\t\t\t\t\t")}
\t\t\t\t</cac:Party>
\t\t\t</cac:ServiceProviderParty>` : ""}
\t\t</cac:Party>
\t</cac:AccountingSupplierParty>`,

    // 4. Bloc Acheteur
    // BT-48 (n° de TVA) et BT-47 (identifiant legal) sont conditionnels :
    // un acheteur etabli hors de France n'a ni SIREN ni numero de TVA francais.
    // BT-49 EndpointID accepte un autre schema EAS (9930 Allemagne, 9927 Suisse).
    getCustomerParty: (buyer) => `
\t<cac:AccountingCustomerParty>
\t\t<cac:Party>
\t\t\t<cbc:EndpointID schemeID="${xmlEsc(buyer.endpointScheme || "0225")}">${xmlEsc(buyer.endpointId || buyer.siren)}</cbc:EndpointID>${buyer.siren ? `
\t\t\t<cac:PartyIdentification><cbc:ID schemeID="0009">${xmlEsc(buyer.siren)}${xmlEsc(buyer.nic || "00001")}</cbc:ID></cac:PartyIdentification>` : ""}
\t\t\t<cac:PartyName><cbc:Name>${xmlEsc(buyer.name)}</cbc:Name></cac:PartyName>
\t\t\t<cac:PostalAddress>
\t\t\t\t<cbc:StreetName>${xmlEsc(buyer.address.street)}</cbc:StreetName>
\t\t\t\t<cbc:CityName>${xmlEsc(buyer.address.city)}</cbc:CityName>
\t\t\t\t<cbc:PostalZone>${xmlEsc(buyer.address.zip)}</cbc:PostalZone>
\t\t\t\t<cac:Country><cbc:IdentificationCode>${xmlEsc(buyer.address.country)}</cbc:IdentificationCode></cac:Country>
\t\t\t</cac:PostalAddress>${buyer.vatNumber ? `
\t\t\t<cac:PartyTaxScheme>
\t\t\t\t<cbc:CompanyID>${xmlEsc(buyer.vatNumber)}</cbc:CompanyID>
\t\t\t\t<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
\t\t\t</cac:PartyTaxScheme>` : ""}
\t\t\t<cac:PartyLegalEntity>
\t\t\t\t<cbc:RegistrationName>${xmlEsc(buyer.legalName)}</cbc:RegistrationName>${buyer.siren ? `
\t\t\t\t<cbc:CompanyID schemeID="0002">${xmlEsc(buyer.siren)}</cbc:CompanyID>` : ""}
\t\t\t</cac:PartyLegalEntity>
\t\t</cac:Party>
\t</cac:AccountingCustomerParty>`,

    // 4.5. Payment Terms (Ajouté)
    getPaymentTerms: (note = "Paiement a 30 jours") => `
\t<cac:PaymentTerms>
\t\t<cbc:Note>${xmlEsc(note)}</cbc:Note>
\t</cac:PaymentTerms>`,

    // 5. Bloc PayeeParty (BG-10)
    // Seul BT-59 (nom) est obligatoire. Pour une personne physique, aucun
    // SIRET ni SIREN n'est attribue : on n'emet alors ni PartyIdentification
    // ni PartyLegalEntity plutot qu'un identifiant invalide.
    getPayeeParty: (id, name, siren) => `
\t<cac:PayeeParty>${id ? `
\t\t<cac:PartyIdentification><cbc:ID schemeID="0009">${xmlEsc(id)}</cbc:ID></cac:PartyIdentification>` : ""}
\t\t<cac:PartyName><cbc:Name>${xmlEsc(name)}</cbc:Name></cac:PartyName>${siren ? `
\t\t<cac:PartyLegalEntity><cbc:CompanyID schemeID="0002">${xmlEsc(siren)}</cbc:CompanyID></cac:PartyLegalEntity>` : ""}
\t</cac:PayeeParty>`,

    // 6. Bloc PaymentMeans
    // BG-16 obligatoire (BR-49). BT-84 IBAN requis si code 30 ou 58 (BR-50).
    // payer : EXT-FR-FE-BG-02 PAYEUR DE LA FACTURE (tiers payeur).
    //   cac:PayerParty n'existe que dans cac:PaymentMandateType, qui se place
    //   APRES cac:PayeeFinancialAccount dans cac:PaymentMeansType.
    //   Hors socle EN16931 : exige le profil etendu.
    // Attention : un tiers PAYEUR n'est pas un BENEFICIAIRE. BG-10 PayeeParty
    // designe celui qui RECOIT le paiement (factor, distributeur), jamais
    // celui qui le verse a la place de l'Acheteur.
    getPaymentMeans: (code, iban = null, bic = null, payer = null) => `
\t<cac:PaymentMeans>
\t\t<cbc:PaymentMeansCode>${code}</cbc:PaymentMeansCode>${(code === "30" || code === "58") && iban ? `
\t\t<cac:PayeeFinancialAccount>
\t\t\t<cbc:ID>${xmlEsc(iban)}</cbc:ID>${bic ? `
\t\t\t<cac:FinancialInstitutionBranch><cbc:ID>${xmlEsc(bic)}</cbc:ID></cac:FinancialInstitutionBranch>` : ""}
\t\t</cac:PayeeFinancialAccount>` : ""}${payer ? `
\t\t<cac:PaymentMandate>
\t\t\t<cac:PayerParty>${UBLTemplates.partyFragment(payer, "\t\t\t\t")}
\t\t\t</cac:PayerParty>
\t\t</cac:PaymentMandate>` : ""}
\t</cac:PaymentMeans>`,

    // 7. Blocs Totaux
    // BG-23 : une ventilation par couple categorie / taux.
    // subtotals = [{ taxable, amount, category, percent, code, reason }]
    // opts.cur    : devise des montants (BT-5)
    // opts.taxCur : { code, amount } -> BT-111, montant total de TVA dans la devise
    //               de comptabilisation, emis dans un SECOND cac:TaxTotal sans
    //               sous-total. Seul montant du document autorise a porter une
    //               autre devise que BT-5.
    getTaxTotal: (subtotals, opts = {}) => {
        const cur = opts.cur || "EUR";
        const list = Array.isArray(subtotals) ? subtotals : [subtotals];
        const total = list.reduce((sum, s) => sum + parseFloat(s.amount), 0).toFixed(2);
        const blocks = list.map((s) => `
\t\t<cac:TaxSubtotal>
\t\t\t<cbc:TaxableAmount currencyID="${cur}">${s.taxable}</cbc:TaxableAmount>
\t\t\t<cbc:TaxAmount currencyID="${cur}">${s.amount}</cbc:TaxAmount>
\t\t\t<cac:TaxCategory><cbc:ID>${xmlEsc(s.category)}</cbc:ID><cbc:Percent>${s.percent}</cbc:Percent>${s.code ? `<cbc:TaxExemptionReasonCode>${xmlEsc(s.code)}</cbc:TaxExemptionReasonCode>` : ""}${s.reason ? `<cbc:TaxExemptionReason>${xmlEsc(s.reason)}</cbc:TaxExemptionReason>` : ""}<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory>
\t\t</cac:TaxSubtotal>`).join("");
        return `
\t<cac:TaxTotal>
\t\t<cbc:TaxAmount currencyID="${cur}">${total}</cbc:TaxAmount>${blocks}
\t</cac:TaxTotal>` + (opts.taxCur ? `
\t<cac:TaxTotal>
\t\t<cbc:TaxAmount currencyID="${opts.taxCur.code}">${opts.taxCur.amount}</cbc:TaxAmount>
\t</cac:TaxTotal>` : "");
    },

    // opts.cur            : devise des montants (BT-5)
    // opts.allowanceTotal : BT-107 somme des remises de niveau document (BG-20)
    // opts.chargeTotal    : BT-108 somme des frais de niveau document (BG-21)
    // BR-CO-10 : BT-109 = BT-106 - BT-107 + BT-108
    getLegalMonetaryTotal: (lineExtAmt, taxExclusiveAmt, taxInclusiveAmt, prepaidAmt, payableAmt, opts = {}) => `
\t<cac:LegalMonetaryTotal>
\t\t<cbc:LineExtensionAmount currencyID="${opts.cur || "EUR"}">${lineExtAmt}</cbc:LineExtensionAmount>
\t\t<cbc:TaxExclusiveAmount currencyID="${opts.cur || "EUR"}">${taxExclusiveAmt}</cbc:TaxExclusiveAmount>
\t\t<cbc:TaxInclusiveAmount currencyID="${opts.cur || "EUR"}">${taxInclusiveAmt}</cbc:TaxInclusiveAmount>${opts.allowanceTotal ? `
\t\t<cbc:AllowanceTotalAmount currencyID="${opts.cur || "EUR"}">${opts.allowanceTotal}</cbc:AllowanceTotalAmount>` : ""}${opts.chargeTotal ? `
\t\t<cbc:ChargeTotalAmount currencyID="${opts.cur || "EUR"}">${opts.chargeTotal}</cbc:ChargeTotalAmount>` : ""}
${prepaidAmt !== "0.00" ? `\t\t<cbc:PrepaidAmount currencyID="${opts.cur || "EUR"}">${prepaidAmt}</cbc:PrepaidAmount>\n` : ""}\t\t<cbc:PayableAmount currencyID="${opts.cur || "EUR"}">${payableAmt}</cbc:PayableAmount>
\t</cac:LegalMonetaryTotal>`,

    // 7ter. BG-20 remise / BG-21 frais de niveau document.
    // Position imposee dans la sequence Invoice : apres cac:PaymentTerms,
    // avant cac:TaxTotal. Un bloc par couple (categorie de TVA, taux) :
    // BR-31 impose BT-95 pour une remise, BR-37 impose BT-102 pour un frais,
    // BR-33 / BR-38 imposent un motif en clair (BT-97 / BT-104) ou un code
    // (BT-98 liste UNTDID 5189 / BT-105 liste UNTDID 7161).
    getAllowanceCharge: (ac, cur = "EUR") => `
\t<cac:AllowanceCharge>
\t\t<cbc:ChargeIndicator>${ac.charge ? "true" : "false"}</cbc:ChargeIndicator>${ac.reasonCode ? `
\t\t<cbc:AllowanceChargeReasonCode>${xmlEsc(ac.reasonCode)}</cbc:AllowanceChargeReasonCode>` : ""}${ac.reason ? `
\t\t<cbc:AllowanceChargeReason>${xmlEsc(ac.reason)}</cbc:AllowanceChargeReason>` : ""}
\t\t<cbc:Amount currencyID="${cur}">${ac.amount}</cbc:Amount>${ac.baseAmount ? `
\t\t<cbc:BaseAmount currencyID="${cur}">${ac.baseAmount}</cbc:BaseAmount>` : ""}
\t\t<cac:TaxCategory><cbc:ID>${xmlEsc(ac.category || "S")}</cbc:ID><cbc:Percent>${ac.percent || "20.00"}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory>
\t</cac:AllowanceCharge>`,

    // 8. Ligne de Facture / Avoir
    getInvoiceLine: (id, qty, amount, itemName, price, isCreditNote = false, orderRef = null, vat = { category: "S", percent: "20.00" }, unitCode = "C62", sellerItemRef = null, opts = {}) => `
\t<cac:${isCreditNote ? 'CreditNoteLine' : 'InvoiceLine'}>
\t\t<cbc:ID>${id}</cbc:ID>
\t\t<cbc:${isCreditNote ? 'CreditedQuantity' : 'InvoicedQuantity'} unitCode="${unitCode}">${qty}</cbc:${isCreditNote ? 'CreditedQuantity' : 'InvoicedQuantity'}>
\t\t<cbc:LineExtensionAmount currencyID="${opts.cur || "EUR"}">${amount}</cbc:LineExtensionAmount>
${orderRef ? `\t\t<cac:OrderLineReference><cbc:LineID>${orderRef.line}</cbc:LineID><cac:OrderReference><cbc:ID>${xmlEsc(orderRef.id)}</cbc:ID></cac:OrderReference></cac:OrderLineReference>\n` : ""}${(opts.allowances || []).map((ac) => `\t\t<cac:AllowanceCharge>
\t\t\t<cbc:ChargeIndicator>${ac.charge ? "true" : "false"}</cbc:ChargeIndicator>${ac.reasonCode ? `
\t\t\t<cbc:AllowanceChargeReasonCode>${xmlEsc(ac.reasonCode)}</cbc:AllowanceChargeReasonCode>` : ""}${ac.reason ? `
\t\t\t<cbc:AllowanceChargeReason>${xmlEsc(ac.reason)}</cbc:AllowanceChargeReason>` : ""}
\t\t\t<cbc:Amount currencyID="${opts.cur || "EUR"}">${ac.amount}</cbc:Amount>${ac.baseAmount ? `
\t\t\t<cbc:BaseAmount currencyID="${opts.cur || "EUR"}">${ac.baseAmount}</cbc:BaseAmount>` : ""}
\t\t</cac:AllowanceCharge>\n`).join("")}\t\t<cac:Item>
\t\t\t<cbc:Name>${xmlEsc(itemName)}</cbc:Name>${sellerItemRef ? `
\t\t\t<cac:SellersItemIdentification><cbc:ID>${xmlEsc(sellerItemRef)}</cbc:ID></cac:SellersItemIdentification>` : ""}
\t\t\t<cac:ClassifiedTaxCategory><cbc:ID>${vat.category}</cbc:ID><cbc:Percent>${vat.percent}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:ClassifiedTaxCategory>
\t\t</cac:Item>
\t\t<cac:Price><cbc:PriceAmount currencyID="${opts.cur || "EUR"}">${price}</cbc:PriceAmount></cac:Price>
\t</cac:${isCreditNote ? 'CreditNoteLine' : 'InvoiceLine'}>`,

    getFooter: (isCreditNote = false) => `\n</${isCreditNote ? 'CreditNote' : 'Invoice'}>`,

    // ========================================================================
    // FORMATS CSV ESKER
    // ========================================================================
    
    getPOHeadersCSV: () => `CompanyCode__,VendorNumber__,DifferentInvoicingParty__,OrderNumber__,OrderDate__,OrderedAmount__,DeliveredAmount__,InvoicedAmount__,Currency__,Buyer__,Receiver__,IsLocalPO__,IsCreatedInERP__,NoMoreInvoiceExpected__\n`,
    
    getPOHeadersRow: (poNumber, orderDateStr) => 
        `"FR01","ESK0054",,"${poNumber}","${orderDateStr}",4934.70,4928.38,0,"EUR","buyerprocess","requesterprocess",,,\n`,

    getPOItemsCSV: () => `CompanyCode__,VendorNumber__,OrderNumber__,ItemNumber__,PartNumber__,ItemType__,Description__,GLAccount__,Group__,CostCenter__,ProjectCode__,InternalOrder__,WBSElement__,WBSElementID__,FreeDimension1__,FreeDimension1ID__,BudgetID__,UnitPrice__,OrderedAmount__,UnitOfMeasureCode__,OrderedQuantity__,InvoicedAmount__,InvoicedQuantity__,DeliveredAmount__,DeliveredQuantity__,Currency__,TaxCode__,TaxRate__,NonDeductibleTaxRate__,Receiver__,CostType__,IsLocalPO__,IsCreatedInERP__,GRIV__,NoMoreInvoiceExpected__,NoGoodsReceipt__\n`,
    
    getPOItemsRow: (poNumber) => 
        `"FR01","ESK0054","${poNumber}",1,"CNT01160",,"Hardware/Software - Imprimante Laser",607,,"3150",,,,,,,"<BudgetID>",0.38,0.38,,1,0,0,0.38,1,,"V4",,,,,,,,,\n` +
        `"FR01","ESK0054","${poNumber}",2,"CNT31421",,"Fournitures de bureau - Papier A4",607,,"3150",,,,,,,"<BudgetID>",1.36,136,,100,0,0,136,100,,"V4",,,,,,,,,\n` +
        `"FR01","ESK0054","${poNumber}",3,"CNT50922",,"Mobilier - Fauteuil ergonomique",607,,"3150",,,,,,,"<BudgetID>",6.32,1175.52,,186,0,0,1169.2,185,,"V4",,,,,,,,,\n` +
        `"FR01","ESK0054","${poNumber}",10,"CNTUSB20",,"Clé USB 32Go Kingston",607,,"1450",,,,,,,"<BudgetID>",70.44,2113.2,,30,0,0,2113.2,30,,"V4",,,,,,,,,\n` +
        `"FR01","ESK0054","${poNumber}",20,"CNT00443",,"Licence Office 365 Annuelle",6091,,"3400",,,,,,,"<BudgetID>",1.36,1509.6,,1110,0,0,1509.6,1110,,"V4",,,,,,,,,\n`
};