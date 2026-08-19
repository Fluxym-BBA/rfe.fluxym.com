/**
 * UBL-TEMPLATES.JS - La bibliothèque de briques XML et CSV (Format strict Esker)
 */

const csvQuote = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
};

const UBLTemplates = {

    // 1. En-tête (Invoice ou CreditNote) avec TOUS les espaces de noms
    getHeader: (numeroFacture, dateFacture, dateEcheance, invoiceTypeCode, profileId, notes, isCreditNote = false, buyerReference = "", customizationId = "urn:cen.eu:en16931:2017") => `<?xml version="1.0" encoding="UTF-8"?>
<${isCreditNote ? 'CreditNote' : 'Invoice'} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${isCreditNote ? 'CreditNote' : 'Invoice'}-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2" xmlns:udt="urn:oasis:names:specification:ubl:schema:xsd:UnqualifiedDataTypes-2">
\t<cbc:UBLVersionID>2.1</cbc:UBLVersionID>
\t<cbc:CustomizationID>${customizationId}</cbc:CustomizationID>
\t<cbc:ProfileID>${profileId}</cbc:ProfileID>
\t<cbc:ID>${numeroFacture}</cbc:ID>
\t<cbc:IssueDate>${dateFacture}</cbc:IssueDate>
${!isCreditNote ? `\t<cbc:DueDate>${dateEcheance}</cbc:DueDate>\n` : ''}\t<cbc:${isCreditNote ? 'CreditNoteTypeCode' : 'InvoiceTypeCode'}>${invoiceTypeCode}</cbc:${isCreditNote ? 'CreditNoteTypeCode' : 'InvoiceTypeCode'}>
${notes.map(n => `\t<cbc:Note>${n}</cbc:Note>`).join('\n')}
\t<cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
\t<cbc:BuyerReference>${buyerReference}</cbc:BuyerReference>`,

    // 2. BillingReference AVEC LA DATE (Obligatoire pour les Avoirs)
    getBillingReference: (originalInvoiceNumber, dateFactureXML) => `
\t<cac:BillingReference>
\t\t<cac:InvoiceDocumentReference>
\t\t\t<cbc:ID>${originalInvoiceNumber}</cbc:ID>
\t\t\t<cbc:IssueDate>${dateFactureXML}</cbc:IssueDate>
\t\t</cac:InvoiceDocumentReference>
\t</cac:BillingReference>`,

    // 3. Bloc Fournisseur
    getSupplierParty: (supplier) => `
\t<cac:AccountingSupplierParty>
\t\t<cac:Party>
\t\t\t<cbc:EndpointID schemeID="0225">${supplier.siren}</cbc:EndpointID>
\t\t\t<cac:PartyIdentification><cbc:ID schemeID="0009">${supplier.siren}${supplier.nic || "00001"}</cbc:ID></cac:PartyIdentification>
\t\t\t<cac:PartyName><cbc:Name>${supplier.name}</cbc:Name></cac:PartyName>
\t\t\t<cac:PostalAddress>
\t\t\t\t<cbc:StreetName>${supplier.address.street}</cbc:StreetName>
\t\t\t\t<cbc:CityName>${supplier.address.city}</cbc:CityName>
\t\t\t\t<cbc:PostalZone>${supplier.address.zip}</cbc:PostalZone>
\t\t\t\t<cac:Country><cbc:IdentificationCode>${supplier.address.country}</cbc:IdentificationCode></cac:Country>
\t\t\t</cac:PostalAddress>
\t\t\t<cac:PartyTaxScheme>
\t\t\t\t<cbc:CompanyID>${supplier.vatNumber}</cbc:CompanyID>
\t\t\t\t<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
\t\t\t</cac:PartyTaxScheme>
\t\t\t<cac:PartyLegalEntity>
\t\t\t\t<cbc:RegistrationName>${supplier.legalName}</cbc:RegistrationName>
\t\t\t\t<cbc:CompanyID schemeID="0002">${supplier.siren}</cbc:CompanyID>
\t\t\t</cac:PartyLegalEntity>
\t\t</cac:Party>
\t</cac:AccountingSupplierParty>`,

    // 4. Bloc Acheteur
    getCustomerParty: (buyer) => `
\t<cac:AccountingCustomerParty>
\t\t<cac:Party>
\t\t\t<cbc:EndpointID schemeID="0225">${buyer.siren}</cbc:EndpointID>
\t\t\t<cac:PartyIdentification><cbc:ID schemeID="0009">${buyer.siren}${buyer.nic || "00001"}</cbc:ID></cac:PartyIdentification>
\t\t\t<cac:PartyName><cbc:Name>${buyer.name}</cbc:Name></cac:PartyName>
\t\t\t<cac:PostalAddress>
\t\t\t\t<cbc:StreetName>${buyer.address.street}</cbc:StreetName>
\t\t\t\t<cbc:CityName>${buyer.address.city}</cbc:CityName>
\t\t\t\t<cbc:PostalZone>${buyer.address.zip}</cbc:PostalZone>
\t\t\t\t<cac:Country><cbc:IdentificationCode>${buyer.address.country}</cbc:IdentificationCode></cac:Country>
\t\t\t</cac:PostalAddress>
\t\t\t<cac:PartyTaxScheme>
\t\t\t\t<cbc:CompanyID>${buyer.vatNumber}</cbc:CompanyID>
\t\t\t\t<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
\t\t\t</cac:PartyTaxScheme>
\t\t\t<cac:PartyLegalEntity>
\t\t\t\t<cbc:RegistrationName>${buyer.legalName}</cbc:RegistrationName>
\t\t\t\t<cbc:CompanyID schemeID="0002">${buyer.siren}</cbc:CompanyID>
\t\t\t</cac:PartyLegalEntity>
\t\t</cac:Party>
\t</cac:AccountingCustomerParty>`,

    // 4.5. Payment Terms (Ajouté)
    getPaymentTerms: (note = "Paiement a 30 jours") => `
\t<cac:PaymentTerms>
\t\t<cbc:Note>${note}</cbc:Note>
\t</cac:PaymentTerms>`,

    // 5. Bloc PayeeParty
    getPayeeParty: (id, name, siren) => `
\t<cac:PayeeParty>
\t\t<cac:PartyIdentification><cbc:ID schemeID="0009">${id}</cbc:ID></cac:PartyIdentification>
\t\t<cac:PartyName><cbc:Name>${name}</cbc:Name></cac:PartyName>
\t\t<cac:PartyLegalEntity><cbc:CompanyID schemeID="0002">${siren}</cbc:CompanyID></cac:PartyLegalEntity>
\t</cac:PayeeParty>`,

    // 6. Bloc PaymentMeans
    // BG-16 obligatoire (BR-49). BT-84 IBAN requis si code 30 ou 58 (BR-50).
    getPaymentMeans: (code, iban = null, bic = null) => `
\t<cac:PaymentMeans>
\t\t<cbc:PaymentMeansCode>${code}</cbc:PaymentMeansCode>${(code === "30" || code === "58") && iban ? `
\t\t<cac:PayeeFinancialAccount>
\t\t\t<cbc:ID>${iban}</cbc:ID>${bic ? `
\t\t\t<cac:FinancialInstitutionBranch><cbc:ID>${bic}</cbc:ID></cac:FinancialInstitutionBranch>` : ""}
\t\t</cac:PayeeFinancialAccount>` : ""}
\t</cac:PaymentMeans>`,

    // 7. Blocs Totaux
    // BG-23 : une ventilation par couple categorie / taux.
    // subtotals = [{ taxable, amount, category, percent, code, reason }]
    getTaxTotal: (subtotals) => {
        const list = Array.isArray(subtotals) ? subtotals : [subtotals];
        const total = list.reduce((sum, s) => sum + parseFloat(s.amount), 0).toFixed(2);
        const blocks = list.map((s) => `
\t\t<cac:TaxSubtotal>
\t\t\t<cbc:TaxableAmount currencyID="EUR">${s.taxable}</cbc:TaxableAmount>
\t\t\t<cbc:TaxAmount currencyID="EUR">${s.amount}</cbc:TaxAmount>
\t\t\t<cac:TaxCategory><cbc:ID>${s.category}</cbc:ID><cbc:Percent>${s.percent}</cbc:Percent>${s.code ? `<cbc:TaxExemptionReasonCode>${s.code}</cbc:TaxExemptionReasonCode>` : ""}${s.reason ? `<cbc:TaxExemptionReason>${s.reason}</cbc:TaxExemptionReason>` : ""}<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory>
\t\t</cac:TaxSubtotal>`).join("");
        return `
\t<cac:TaxTotal>
\t\t<cbc:TaxAmount currencyID="EUR">${total}</cbc:TaxAmount>${blocks}
\t</cac:TaxTotal>`;
    },

    getLegalMonetaryTotal: (lineExtAmt, taxExclusiveAmt, taxInclusiveAmt, prepaidAmt, payableAmt) => `
\t<cac:LegalMonetaryTotal>
\t\t<cbc:LineExtensionAmount currencyID="EUR">${lineExtAmt}</cbc:LineExtensionAmount>
\t\t<cbc:TaxExclusiveAmount currencyID="EUR">${taxExclusiveAmt}</cbc:TaxExclusiveAmount>
\t\t<cbc:TaxInclusiveAmount currencyID="EUR">${taxInclusiveAmt}</cbc:TaxInclusiveAmount>
${prepaidAmt !== "0.00" ? `\t\t<cbc:PrepaidAmount currencyID="EUR">${prepaidAmt}</cbc:PrepaidAmount>\n` : ""}\t\t<cbc:PayableAmount currencyID="EUR">${payableAmt}</cbc:PayableAmount>
\t</cac:LegalMonetaryTotal>`,

    // 8. Ligne de Facture / Avoir
    getInvoiceLine: (id, qty, amount, itemName, price, isCreditNote = false, orderRef = null, vat = { category: "S", percent: "20.00" }, unitCode = "C62") => `
\t<cac:${isCreditNote ? 'CreditNoteLine' : 'InvoiceLine'}>
\t\t<cbc:ID>${id}</cbc:ID>
\t\t<cbc:${isCreditNote ? 'CreditedQuantity' : 'InvoicedQuantity'} unitCode="${unitCode}">${qty}</cbc:${isCreditNote ? 'CreditedQuantity' : 'InvoicedQuantity'}>
\t\t<cbc:LineExtensionAmount currencyID="EUR">${amount}</cbc:LineExtensionAmount>
${orderRef ? `\t\t<cac:OrderLineReference><cbc:LineID>${orderRef.line}</cbc:LineID><cac:OrderReference><cbc:ID>${orderRef.id}</cbc:ID></cac:OrderReference></cac:OrderLineReference>\n` : ""}\t\t<cac:Item>
\t\t\t<cbc:Name>${itemName}</cbc:Name>
\t\t\t<cac:ClassifiedTaxCategory><cbc:ID>${vat.category}</cbc:ID><cbc:Percent>${vat.percent}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:ClassifiedTaxCategory>
\t\t</cac:Item>
\t\t<cac:Price><cbc:PriceAmount currencyID="EUR">${price}</cbc:PriceAmount></cac:Price>
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