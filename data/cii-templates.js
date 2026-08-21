/**
 * CII-TEMPLATES.JS - La bibliotheque de briques XML UN/CEFACT CII D22B
 *
 * Message CrossIndustryInvoice, profil EN 16931 / EXTENDED CTC-FR.
 * Pendant strict de data/ubl-templates.js : les deux fichiers portent la MEME
 * semantique EN 16931 dans deux syntaxes differentes. Toute evolution de l'un
 * doit etre repercutee dans l'autre.
 *
 * Trois differences structurelles avec l'UBL, sources classiques de rejet :
 *   1. Facture et avoir partagent la MEME racine rsm:CrossIndustryInvoice.
 *      Seul ram:TypeCode (380 / 381) les distingue. UBL, lui, change d'element
 *      racine (Invoice / CreditNote).
 *   2. @currencyID n'est PAS utilise sur les montants de ligne : la devise est
 *      heritee de ram:InvoiceCurrencyCode. Il ne subsiste que sur
 *      ram:TaxTotalAmount, ou il devient obligatoire.
 *   3. Dans ram:SpecifiedTradeSettlementHeaderMonetarySummation, BT-108
 *      (ChargeTotalAmount) precede BT-107 (AllowanceTotalAmount). C'est
 *      l'inverse de l'ordre UBL et l'inverse de l'ordre numerique.
 *
 * L'ordre des elements suit la sequence XSD, non l'ordre des BT. Dans
 * ram:*TradeParty, ram:DefinedTradeContact se place AVANT
 * ram:PostalTradeAddress.
 *
 * xmlEsc est fourni par data/ubl-templates.js, charge avant ce fichier.
 */

const CIITemplates = {

    // BT-2, BT-26, BT-72 : CII date une facture en AAAAMMJJ (format 102),
    // la ou UBL emploie la date ISO AAAA-MM-JJ.
    d8: (iso) => (iso ? String(iso).replace(/-/g, '') : ''),

    // Les notes internes portent un prefixe technique #XXX# qui code le sujet
    // de la mention. UBL le concatene au texte ; CII le porte dans un element
    // distinct ram:SubjectCode. Le prefixe est donc separe, jamais recopie.
    splitNote: (note) => {
        const m = String(note).match(/^#([A-Z]{3})#([\s\S]*)$/);
        return m ? { code: m[1], text: m[2] } : { code: null, text: String(note) };
    },

    // ========================================================================
    // 1. ENVELOPPE ET CONTEXTE
    // BT-23 accueille le cadre de facturation francais (S1, B1, M1...) sans
    // prefixe ni URN. BT-24 porte la meme chaine qu'en UBL : l'identifiant de
    // specification est une donnee semantique, independante de la syntaxe.
    // ========================================================================
    getEnvelope: (businessProcess, guideline) => `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
\t<rsm:ExchangedDocumentContext>
\t\t<ram:BusinessProcessSpecifiedDocumentContextParameter>
\t\t\t<ram:ID>${xmlEsc(businessProcess)}</ram:ID>
\t\t</ram:BusinessProcessSpecifiedDocumentContextParameter>
\t\t<ram:GuidelineSpecifiedDocumentContextParameter>
\t\t\t<ram:ID>${xmlEsc(guideline)}</ram:ID>
\t\t</ram:GuidelineSpecifiedDocumentContextParameter>
\t</rsm:ExchangedDocumentContext>`,

    // ========================================================================
    // 2. DOCUMENT : BT-1, BT-3, BT-2, puis BT-22 / BT-21
    // ========================================================================
    getDocument: (numeroFacture, typeCode, dateFacture, notes) => `
\t<rsm:ExchangedDocument>
\t\t<ram:ID>${xmlEsc(numeroFacture)}</ram:ID>
\t\t<ram:TypeCode>${typeCode}</ram:TypeCode>
\t\t<ram:IssueDateTime>
\t\t\t<udt:DateTimeString format="102">${CIITemplates.d8(dateFacture)}</udt:DateTimeString>
\t\t</ram:IssueDateTime>${(notes || []).map((n) => {
        const p = CIITemplates.splitNote(n);
        return `
\t\t<ram:IncludedNote>
\t\t\t<ram:Content>${xmlEsc(p.text)}</ram:Content>${p.code ? `
\t\t\t<ram:SubjectCode>${p.code}</ram:SubjectCode>` : ''}
\t\t</ram:IncludedNote>`;
    }).join('')}
\t</rsm:ExchangedDocument>
\t<rsm:SupplyChainTradeTransaction>`,

    // ========================================================================
    // 3. LIGNE DE FACTURE
    // Sequence XSD : AssociatedDocumentLineDocument, SpecifiedTradeProduct,
    // SpecifiedLineTradeAgreement, SpecifiedLineTradeDelivery,
    // SpecifiedLineTradeSettlement.
    // Aucun @currencyID : la devise vient de ram:InvoiceCurrencyCode.
    // ========================================================================
    // BG-25 Ligne de facture, version CII.
    // Sequences imposees :
    //   ram:SpecifiedTradeProduct : GlobalID (BT-157), SellerAssignedID
    //     (BT-155), BuyerAssignedID (BT-156), Name (BT-153), Description
    //     (BT-154), DesignatedProductClassification (BT-158).
    //     Contrairement a UBL, le nom precede ici la description.
    //   ram:SpecifiedLineTradeAgreement : GrossPriceProductTradePrice AVANT
    //     NetPriceProductTradePrice. La remise unitaire (BT-147) est portee par
    //     ram:AppliedTradeAllowanceCharge DANS le prix brut, alors qu'UBL la
    //     place dans cac:Price. C'est le piege classique du mapping.
    //   ram:SpecifiedLineTradeSettlement : ApplicableTradeTax,
    //     BillingSpecifiedPeriod (BG-26), SpecifiedTradeAllowanceCharge,
    //     MonetarySummation, ReceivableSpecifiedTradeAccountingAccount (BT-133).
    // Extensions EXTENDED-CTC-FR du multi-vendeurs (cadre S8) :
    //   ram:ParentLineID          EXT-FR-FE-162, rattache une ligne DETAIL a
    //                             sa ligne GROUP. La hierarchie est PLATE, pas
    //                             imbriquee : surtout ne pas utiliser
    //                             cac:SubInvoiceLine ni son equivalent CII.
    //   ram:LineStatusReasonCode  EXT-FR-FE-163, vaut GROUP, DETAIL ou
    //                             INFORMATION.
    //   ram:ItemSellerTradeParty  vendeur reel de la ligne. Position : DERNIER
    //                             enfant de ram:SpecifiedLineTradeAgreement,
    //                             apres NetPriceProductTradePrice.
    //                             EXT-FR-FE-164 nom, 167 SIRET, 168 TVA
    //                             intracommunautaire, 177 pays.
    //   ram:TaxTotalAmount        EXT-FR-FE-181, TVA de la ligne GROUP.
    //   ram:GrandTotalAmount      EXT-FR-FE-184, total TTC de la ligne GROUP.
    //   ram:AdditionalReferencedDocument avec ReferenceTypeCode AFL et AVV :
    //                             BT-128, numero de facture et cadre propres au
    //                             vendeur de la ligne.
    // Une ligne GROUP n'a ni quantite BT-129, ni prix unitaire BT-146, ni
    // categorie de TVA BT-151 : c'est un agregat, et BR-FREXT-CO-04 ne les
    // exige que sur les lignes DETAIL. Les emettre serait inventer une
    // quantite qui n'existe pas.
    getLineItem: (line, vat, orderRef) => `
\t\t<ram:IncludedSupplyChainTradeLineItem>
\t\t\t<ram:AssociatedDocumentLineDocument>
\t\t\t\t<ram:LineID>${line.id}</ram:LineID>${line.parentId ? `
\t\t\t\t<ram:ParentLineID>${line.parentId}</ram:ParentLineID>` : ''}${line.subtype ? `
\t\t\t\t<ram:LineStatusReasonCode>${line.subtype}</ram:LineStatusReasonCode>` : ''}${line.note ? `
\t\t\t\t<ram:IncludedNote>
\t\t\t\t\t<ram:Content>${xmlEsc(line.note)}</ram:Content>
\t\t\t\t</ram:IncludedNote>` : ''}
\t\t\t</ram:AssociatedDocumentLineDocument>
\t\t\t<ram:SpecifiedTradeProduct>${line.gtin ? `
\t\t\t\t<ram:GlobalID schemeID="0160">${xmlEsc(line.gtin)}</ram:GlobalID>` : ''}${line.ref ? `
\t\t\t\t<ram:SellerAssignedID>${xmlEsc(line.ref)}</ram:SellerAssignedID>` : ''}${line.buyerItemRef ? `
\t\t\t\t<ram:BuyerAssignedID>${xmlEsc(line.buyerItemRef)}</ram:BuyerAssignedID>` : ''}
\t\t\t\t<ram:Name>${xmlEsc(line.desc)}</ram:Name>${line.description ? `
\t\t\t\t<ram:Description>${xmlEsc(line.description)}</ram:Description>` : ''}${line.classification ? `
\t\t\t\t<ram:DesignatedProductClassification>
\t\t\t\t\t<ram:ClassCode listID="${xmlEsc(line.classification.listId)}"${line.classification.version ? ` listVersionID="${xmlEsc(line.classification.version)}"` : ''}>${xmlEsc(line.classification.code)}</ram:ClassCode>
\t\t\t\t</ram:DesignatedProductClassification>` : ''}
\t\t\t</ram:SpecifiedTradeProduct>
\t\t\t<ram:SpecifiedLineTradeAgreement>${orderRef ? `
\t\t\t\t<ram:BuyerOrderReferencedDocument>
\t\t\t\t\t<ram:LineID>${xmlEsc(orderRef.line)}</ram:LineID>
\t\t\t\t</ram:BuyerOrderReferencedDocument>` : ''}${line.grossPrice ? `
\t\t\t\t<ram:GrossPriceProductTradePrice>
\t\t\t\t\t<ram:ChargeAmount>${line.grossPrice}</ram:ChargeAmount>${line.baseQuantity ? `
\t\t\t\t\t<ram:BasisQuantity unitCode="${line.unitCode || 'C62'}">${line.baseQuantity}</ram:BasisQuantity>` : ''}
\t\t\t\t\t<ram:AppliedTradeAllowanceCharge>
\t\t\t\t\t\t<ram:ChargeIndicator>
\t\t\t\t\t\t\t<udt:Indicator>false</udt:Indicator>
\t\t\t\t\t\t</ram:ChargeIndicator>
\t\t\t\t\t\t<ram:ActualAmount>${line.priceDiscount}</ram:ActualAmount>
\t\t\t\t\t</ram:AppliedTradeAllowanceCharge>
\t\t\t\t</ram:GrossPriceProductTradePrice>` : ''}${line.price ? `
\t\t\t\t<ram:NetPriceProductTradePrice>
\t\t\t\t\t<ram:ChargeAmount>${line.price}</ram:ChargeAmount>${line.baseQuantity ? `
\t\t\t\t\t<ram:BasisQuantity unitCode="${line.unitCode || 'C62'}">${line.baseQuantity}</ram:BasisQuantity>` : ''}
\t\t\t\t</ram:NetPriceProductTradePrice>` : ''}${line.itemSeller ? `
\t\t\t\t<ram:ItemSellerTradeParty>${line.itemSeller.name ? `
\t\t\t\t\t<ram:Name>${xmlEsc(line.itemSeller.name)}</ram:Name>` : ''}${line.itemSeller.siret ? `
\t\t\t\t\t<ram:SpecifiedLegalOrganization>
\t\t\t\t\t\t<ram:ID schemeID="0009">${xmlEsc(line.itemSeller.siret)}</ram:ID>
\t\t\t\t\t</ram:SpecifiedLegalOrganization>` : ''}${line.itemSeller.country ? `
\t\t\t\t\t<ram:PostalTradeAddress>
\t\t\t\t\t\t<ram:CountryID>${xmlEsc(line.itemSeller.country)}</ram:CountryID>
\t\t\t\t\t</ram:PostalTradeAddress>` : ''}${line.itemSeller.vat ? `
\t\t\t\t\t<ram:SpecifiedTaxRegistration>
\t\t\t\t\t\t<ram:ID schemeID="VA">${xmlEsc(line.itemSeller.vat)}</ram:ID>
\t\t\t\t\t</ram:SpecifiedTaxRegistration>` : ''}
\t\t\t\t</ram:ItemSellerTradeParty>` : ''}
\t\t\t</ram:SpecifiedLineTradeAgreement>
\t\t\t${line.qty ? `<ram:SpecifiedLineTradeDelivery>
\t\t\t\t<ram:BilledQuantity unitCode="${line.unitCode || 'C62'}">${line.qty}</ram:BilledQuantity>
\t\t\t</ram:SpecifiedLineTradeDelivery>` : '<ram:SpecifiedLineTradeDelivery/>'}
\t\t\t<ram:SpecifiedLineTradeSettlement>${vat ? `
\t\t\t\t<ram:ApplicableTradeTax>
\t\t\t\t\t<ram:TypeCode>VAT</ram:TypeCode>
\t\t\t\t\t<ram:CategoryCode>${vat.category}</ram:CategoryCode>
\t\t\t\t\t<ram:RateApplicablePercent>${vat.percent}</ram:RateApplicablePercent>
\t\t\t\t</ram:ApplicableTradeTax>` : ''}${(line.period && (line.period.start || line.period.end)) ? `
\t\t\t\t<ram:BillingSpecifiedPeriod>${line.period.start ? `
\t\t\t\t\t<ram:StartDateTime>
\t\t\t\t\t\t<udt:DateTimeString format="102">${CIITemplates.d8(line.period.start)}</udt:DateTimeString>
\t\t\t\t\t</ram:StartDateTime>` : ''}${line.period.end ? `
\t\t\t\t\t<ram:EndDateTime>
\t\t\t\t\t\t<udt:DateTimeString format="102">${CIITemplates.d8(line.period.end)}</udt:DateTimeString>
\t\t\t\t\t</ram:EndDateTime>` : ''}
\t\t\t\t</ram:BillingSpecifiedPeriod>` : ''}${(line.allowances || []).map((ac) => `
\t\t\t\t<ram:SpecifiedTradeAllowanceCharge>
\t\t\t\t\t<ram:ChargeIndicator>
\t\t\t\t\t\t<udt:Indicator>${ac.charge ? 'true' : 'false'}</udt:Indicator>
\t\t\t\t\t</ram:ChargeIndicator>${ac.baseAmount ? `
\t\t\t\t\t<ram:BasisAmount>${ac.baseAmount}</ram:BasisAmount>` : ''}
\t\t\t\t\t<ram:ActualAmount>${ac.amount}</ram:ActualAmount>${ac.reasonCode ? `
\t\t\t\t\t<ram:ReasonCode>${xmlEsc(ac.reasonCode)}</ram:ReasonCode>` : ''}${ac.reason ? `
\t\t\t\t\t<ram:Reason>${xmlEsc(ac.reason)}</ram:Reason>` : ''}
\t\t\t\t</ram:SpecifiedTradeAllowanceCharge>`).join('')}
\t\t\t\t<ram:SpecifiedTradeSettlementLineMonetarySummation>
\t\t\t\t\t<ram:LineTotalAmount>${line.amount}</ram:LineTotalAmount>${line.lineVatTotal ? `
\t\t\t\t\t<ram:TaxTotalAmount>${line.lineVatTotal}</ram:TaxTotalAmount>` : ''}${line.grandTotal ? `
\t\t\t\t\t<ram:GrandTotalAmount>${line.grandTotal}</ram:GrandTotalAmount>` : ''}
\t\t\t\t</ram:SpecifiedTradeSettlementLineMonetarySummation>${(line.lineRefs || []).map((r) => `
\t\t\t\t<ram:AdditionalReferencedDocument>
\t\t\t\t\t<ram:IssuerAssignedID>${xmlEsc(r.id)}</ram:IssuerAssignedID>
\t\t\t\t\t<ram:TypeCode>130</ram:TypeCode>
\t\t\t\t\t<ram:ReferenceTypeCode>${xmlEsc(r.type)}</ram:ReferenceTypeCode>
\t\t\t\t</ram:AdditionalReferencedDocument>`).join('')}${line.accountingCost ? `
\t\t\t\t<ram:ReceivableSpecifiedTradeAccountingAccount>
\t\t\t\t\t<ram:ID>${xmlEsc(line.accountingCost)}</ram:ID>
\t\t\t\t</ram:ReceivableSpecifiedTradeAccountingAccount>` : ''}
\t\t\t</ram:SpecifiedLineTradeSettlement>
\t\t</ram:IncludedSupplyChainTradeLineItem>`,

    // ========================================================================
    // 4. FRAGMENT DE TIERS, commun a Seller, Buyer, Payee et ShipTo
    // Sequence XSD : ID, GlobalID, Name, Description, SpecifiedLegalOrganization,
    // DefinedTradeContact, PostalTradeAddress, URIUniversalCommunication,
    // SpecifiedTaxRegistration.
    // Les identifiants sont conditionnels : un tiers etabli hors de France n'a
    // ni SIREN, ni SIRET, ni numero de TVA francais, et une personne physique
    // n'a aucun des trois.
    // BT-31 et BT-32 se distinguent par @schemeID (VA / FC) et non par un
    // conteneur different comme le TaxScheme d'UBL.
    // ========================================================================
    partyFragment: (p, ind, opts) => {
        opts = opts || {};
        const t = ind;
        const siret = p.siren ? p.siren + (p.nic || '00001') : null;
        let x = '';
        // ram:ID precede ram:GlobalID dans la sequence de ram:TradePartyType.
        if (p.shipToId) x += `\n${t}<ram:ID>${xmlEsc(p.shipToId)}</ram:ID>`;
        if (siret) x += `\n${t}<ram:GlobalID schemeID="0009">${xmlEsc(siret)}</ram:GlobalID>`;
        x += `\n${t}<ram:Name>${xmlEsc(p.legalName || p.name)}</ram:Name>`;
        if (p.siren || (p.name && p.legalName && p.name !== p.legalName)) {
            x += `\n${t}<ram:SpecifiedLegalOrganization>`;
            if (p.siren) x += `\n${t}\t<ram:ID schemeID="0002">${xmlEsc(p.siren)}</ram:ID>`;
            if (p.name && p.legalName && p.name !== p.legalName) {
                x += `\n${t}\t<ram:TradingBusinessName>${xmlEsc(p.name)}</ram:TradingBusinessName>`;
            }
            x += `\n${t}</ram:SpecifiedLegalOrganization>`;
        }
        // BG-6 / BG-9 : point de contact. ram:DefinedTradeContact se place
        // AVANT ram:PostalTradeAddress dans la sequence de ram:TradePartyType,
        // a l'inverse d'UBL ou cac:Contact vient apres l'adresse.
        // BT-41 PersonName, BT-42 TelephoneUniversalCommunication,
        // BT-43 EmailURIUniversalCommunication.
        if (p.contact && (p.contact.name || p.contact.phone || p.contact.email)) {
            x += `\n${t}<ram:DefinedTradeContact>`;
            if (p.contact.name) x += `\n${t}\t<ram:PersonName>${xmlEsc(p.contact.name)}</ram:PersonName>`;
            if (p.contact.phone) {
                x += `\n${t}\t<ram:TelephoneUniversalCommunication>`
                   + `\n${t}\t\t<ram:CompleteNumber>${xmlEsc(p.contact.phone)}</ram:CompleteNumber>`
                   + `\n${t}\t</ram:TelephoneUniversalCommunication>`;
            }
            if (p.contact.email) {
                x += `\n${t}\t<ram:EmailURIUniversalCommunication>`
                   + `\n${t}\t\t<ram:URIID schemeID="SMTP">${xmlEsc(p.contact.email)}</ram:URIID>`
                   + `\n${t}\t</ram:EmailURIUniversalCommunication>`;
            }
            x += `\n${t}</ram:DefinedTradeContact>`;
        }
        if (p.address) {
            // Sequence de ram:TradeAddressType : PostcodeCode, LineOne, LineTwo,
            // LineThree, CityName, CountryID, CountrySubDivisionName.
            // BT-36 -> LineTwo, BT-162 -> LineThree.
            x += `\n${t}<ram:PostalTradeAddress>`
               + `\n${t}\t<ram:PostcodeCode>${xmlEsc(p.address.zip)}</ram:PostcodeCode>`
               + `\n${t}\t<ram:LineOne>${xmlEsc(p.address.street)}</ram:LineOne>`;
            if (p.address.street2) x += `\n${t}\t<ram:LineTwo>${xmlEsc(p.address.street2)}</ram:LineTwo>`;
            if (p.address.street3) x += `\n${t}\t<ram:LineThree>${xmlEsc(p.address.street3)}</ram:LineThree>`;
            x += `\n${t}\t<ram:CityName>${xmlEsc(p.address.city)}</ram:CityName>`
               + `\n${t}\t<ram:CountryID>${xmlEsc(p.address.country)}</ram:CountryID>`
               + `\n${t}</ram:PostalTradeAddress>`;
        }
        if (opts.endpoint !== false) {
            x += `\n${t}<ram:URIUniversalCommunication>`
               + `\n${t}\t<ram:URIID schemeID="${xmlEsc(p.endpointScheme || '0225')}">${xmlEsc(p.endpointId || p.siren)}</ram:URIID>`
               + `\n${t}</ram:URIUniversalCommunication>`;
        }
        if (p.vatNumber) {
            x += `\n${t}<ram:SpecifiedTaxRegistration>`
               + `\n${t}\t<ram:ID schemeID="VA">${xmlEsc(p.vatNumber)}</ram:ID>`
               + `\n${t}</ram:SpecifiedTaxRegistration>`;
        }
        if (p.taxRegistrationId) {
            x += `\n${t}<ram:SpecifiedTaxRegistration>`
               + `\n${t}\t<ram:ID schemeID="FC">${xmlEsc(p.taxRegistrationId)}</ram:ID>`
               + `\n${t}</ram:SpecifiedTaxRegistration>`;
        }
        return x;
    },

    // ========================================================================
    // 5. ApplicableHeaderTradeAgreement
    // Sequence XSD : BuyerReference, SellerTradeParty, BuyerTradeParty,
    // SellerTaxRepresentativeTradeParty, BuyerOrderReferencedDocument,
    // AdditionalReferencedDocument.
    // BG-24 : ram:Name porte la valeur BT-123 de la liste fermee francaise
    // (LISIBLE, BON_COMMANDE, BON_LIVRAISON...). ram:TypeCode 916 identifie
    // une piece jointe, la ou 130 est reserve a BT-18.
    // ========================================================================
    getAgreement: (buyerReference, supplier, buyer, poNumber, attachments, contractRef) => `
\t\t<ram:ApplicableHeaderTradeAgreement>
\t\t\t<ram:BuyerReference>${xmlEsc(buyerReference)}</ram:BuyerReference>
\t\t\t<ram:SellerTradeParty>${CIITemplates.partyFragment(supplier, '\t\t\t\t')}
\t\t\t</ram:SellerTradeParty>
\t\t\t<ram:BuyerTradeParty>${CIITemplates.partyFragment(buyer, '\t\t\t\t')}
\t\t\t</ram:BuyerTradeParty>${poNumber ? `
\t\t\t<ram:BuyerOrderReferencedDocument>
\t\t\t\t<ram:IssuerAssignedID>${xmlEsc(poNumber)}</ram:IssuerAssignedID>
\t\t\t</ram:BuyerOrderReferencedDocument>` : ''}${contractRef ? `
\t\t\t<ram:ContractReferencedDocument>
\t\t\t\t<ram:IssuerAssignedID>${xmlEsc(contractRef)}</ram:IssuerAssignedID>
\t\t\t</ram:ContractReferencedDocument>` : ''}${(attachments || []).map((att) => `
\t\t\t<ram:AdditionalReferencedDocument>
\t\t\t\t<ram:IssuerAssignedID>${xmlEsc(att.id)}</ram:IssuerAssignedID>
\t\t\t\t<ram:TypeCode>916</ram:TypeCode>
\t\t\t\t<ram:Name>${xmlEsc(att.description || 'DOCUMENT_ANNEXE')}</ram:Name>
\t\t\t\t<ram:AttachmentBinaryObject mimeCode="${xmlEsc(att.mimeCode || 'application/pdf')}" filename="${xmlEsc(att.filename)}">${att.base64}</ram:AttachmentBinaryObject>
\t\t\t</ram:AdditionalReferencedDocument>`).join('')}
\t\t</ram:ApplicableHeaderTradeAgreement>`,

    // ========================================================================
    // 6. ApplicableHeaderTradeDelivery
    // Sequence XSD : ShipToTradeParty, ActualDeliverySupplyChainEvent,
    // DespatchAdviceReferencedDocument.
    // Le bloc reste obligatoire meme vide : il est emis sans enfant lorsque
    // aucune donnee de livraison n'est disponible.
    // ========================================================================
    getDelivery: (delivery, despatchId) => {
        const parts = [];
        if (delivery && (delivery.name || delivery.address)) {
            const sh = {
                legalName: delivery.name || null,
                name: null,
                siren: null,
                address: delivery.address || null,
                // BT-71 : en CII l'identifiant du lieu de livraison est porte
                // par ram:ID du ShipToTradeParty, la ou UBL utilise un
                // conteneur cac:DeliveryLocation distinct.
                shipToId: delivery.locationId || null
            };
            parts.push(`\n\t\t\t<ram:ShipToTradeParty>${CIITemplates.partyFragment(sh, '\t\t\t\t', { endpoint: false })}\n\t\t\t</ram:ShipToTradeParty>`);
        }
        if (delivery && delivery.date) {
            parts.push(`\n\t\t\t<ram:ActualDeliverySupplyChainEvent>`
                + `\n\t\t\t\t<ram:OccurrenceDateTime>`
                + `\n\t\t\t\t\t<udt:DateTimeString format="102">${CIITemplates.d8(delivery.date)}</udt:DateTimeString>`
                + `\n\t\t\t\t</ram:OccurrenceDateTime>`
                + `\n\t\t\t</ram:ActualDeliverySupplyChainEvent>`);
        }
        if (despatchId) {
            parts.push(`\n\t\t\t<ram:DespatchAdviceReferencedDocument>`
                + `\n\t\t\t\t<ram:IssuerAssignedID>${xmlEsc(despatchId)}</ram:IssuerAssignedID>`
                + `\n\t\t\t</ram:DespatchAdviceReferencedDocument>`);
        }
        return parts.length
            ? `\n\t\t<ram:ApplicableHeaderTradeDelivery>${parts.join('')}\n\t\t</ram:ApplicableHeaderTradeDelivery>`
            : `\n\t\t<ram:ApplicableHeaderTradeDelivery/>`;
    },

    // ========================================================================
    // 7. ApplicableHeaderTradeSettlement
    // Sequence XSD : CreditorReferenceID, PaymentReference, TaxCurrencyCode,
    // InvoiceCurrencyCode, PayeeTradeParty, SpecifiedTradeSettlementPaymentMeans,
    // ApplicableTradeTax, BillingSpecifiedPeriod, SpecifiedTradeAllowanceCharge,
    // SpecifiedTradePaymentTerms, SpecifiedTradeSettlementHeaderMonetarySummation,
    // InvoiceReferencedDocument, ReceivableSpecifiedTradeAccountingAccount.
    //
    // BT-6 TaxCurrencyCode precede BT-5 InvoiceCurrencyCode : ordre XSD, non
    // ordre numerique.
    // ========================================================================
    getSettlement: (o) => {
        const t = o.totals;
        const withIban = (o.meansCode === '30' || o.meansCode === '58');
        let x = `\n\t\t<ram:ApplicableHeaderTradeSettlement>`;

        // BT-83 information de remise. ram:PaymentReference ouvre la sequence
        // de ram:ApplicableHeaderTradeSettlement, avant les codes devise.
        if (o.paymentReference) x += `\n\t\t\t<ram:PaymentReference>${xmlEsc(o.paymentReference)}</ram:PaymentReference>`;
        if (o.taxCurrency) x += `\n\t\t\t<ram:TaxCurrencyCode>${o.taxCurrency}</ram:TaxCurrencyCode>`;
        x += `\n\t\t\t<ram:InvoiceCurrencyCode>${o.currency}</ram:InvoiceCurrencyCode>`;

        // BG-10 : beneficiaire du paiement lorsqu'il n'est pas le vendeur.
        if (o.payee) {
            x += `\n\t\t\t<ram:PayeeTradeParty>${CIITemplates.partyFragment(o.payee, '\t\t\t\t', { endpoint: false })}\n\t\t\t</ram:PayeeTradeParty>`;
        }

        // Tiers PAYEUR, profil EXTENDED-CTC-FR uniquement. Position dans la
        // sequence XSD de ram:ApplicableHeaderTradeSettlement : apres
        // ram:PayeeTradeParty, avant ram:TaxApplicableTradeCurrencyExchange et
        // ram:SpecifiedTradeSettlementPaymentMeans. Un element hors sequence
        // serait rejete par le validateur, meme avec le bon nom.
        if (o.payer) {
            x += `\n\t\t\t<ram:PayerTradeParty>${CIITemplates.partyFragment(o.payer, '\t\t\t\t', { endpoint: false })}\n\t\t\t</ram:PayerTradeParty>`;
        }

        // BG-16 : obligatoire. BT-84 / BT-86 sur les codes 30 et 58.
        // Sequence interne : TypeCode, Information, ApplicableTradeSettlement-
        // FinancialCard, PayerPartyDebtorFinancialAccount,
        // PayeePartyCreditorFinancialAccount, PayeeSpecifiedCreditorFinancial-
        // Institution. BT-82 est donc un ELEMENT en CII, la ou UBL en fait un
        // attribut @name de cbc:PaymentMeansCode.
        x += `\n\t\t\t<ram:SpecifiedTradeSettlementPaymentMeans>`
           + `\n\t\t\t\t<ram:TypeCode>${o.meansCode}</ram:TypeCode>`;
        if (o.meansLabel) x += `\n\t\t\t\t<ram:Information>${xmlEsc(o.meansLabel)}</ram:Information>`;
        if (o.payerIban) {
            x += `\n\t\t\t\t<ram:PayerPartyDebtorFinancialAccount>`
               + `\n\t\t\t\t\t<ram:IBANID>${xmlEsc(o.payerIban)}</ram:IBANID>`
               + `\n\t\t\t\t</ram:PayerPartyDebtorFinancialAccount>`;
        }
        if (withIban && o.iban) {
            x += `\n\t\t\t\t<ram:PayeePartyCreditorFinancialAccount>`
               + `\n\t\t\t\t\t<ram:IBANID>${xmlEsc(o.iban)}</ram:IBANID>`;
            // BT-85 nom du titulaire du compte credite.
            if (o.accountName) x += `\n\t\t\t\t\t<ram:AccountName>${xmlEsc(o.accountName)}</ram:AccountName>`;
            x += `\n\t\t\t\t</ram:PayeePartyCreditorFinancialAccount>`;
            if (o.bic) {
                x += `\n\t\t\t\t<ram:PayeeSpecifiedCreditorFinancialInstitution>`
                   + `\n\t\t\t\t\t<ram:BICID>${xmlEsc(o.bic)}</ram:BICID>`
                   + `\n\t\t\t\t</ram:PayeeSpecifiedCreditorFinancialInstitution>`;
            }
        }
        x += `\n\t\t\t</ram:SpecifiedTradeSettlementPaymentMeans>`;

        // BG-23 : ventilation TVA. Sequence XSD interne : CalculatedAmount,
        // TypeCode, ExemptionReason, BasisAmount, CategoryCode,
        // ExemptionReasonCode, RateApplicablePercent.
        (o.taxSubtotals || []).forEach((s) => {
            x += `\n\t\t\t<ram:ApplicableTradeTax>`
               + `\n\t\t\t\t<ram:CalculatedAmount>${s.amount}</ram:CalculatedAmount>`
               + `\n\t\t\t\t<ram:TypeCode>VAT</ram:TypeCode>`;
            if (s.reason) x += `\n\t\t\t\t<ram:ExemptionReason>${xmlEsc(s.reason)}</ram:ExemptionReason>`;
            x += `\n\t\t\t\t<ram:BasisAmount>${s.taxable}</ram:BasisAmount>`
               + `\n\t\t\t\t<ram:CategoryCode>${s.category}</ram:CategoryCode>`;
            if (s.code) x += `\n\t\t\t\t<ram:ExemptionReasonCode>${xmlEsc(s.code)}</ram:ExemptionReasonCode>`;
            // BT-8 code de date d'exigibilite de la TVA. En CII il se repete
            // dans chaque ram:ApplicableTradeTax, la ou UBL le porte une seule
            // fois dans cac:InvoicePeriod. La liste de codes differe aussi :
            // 5 = date de facture, 29 = date de livraison, 72 = date
            // d'encaissement, contre 3 / 35 / 432 en UBL.
            if (o.vatDueDateTypeCode) x += `\n\t\t\t\t<ram:DueDateTypeCode>${o.vatDueDateTypeCode}</ram:DueDateTypeCode>`;
            x += `\n\t\t\t\t<ram:RateApplicablePercent>${s.percent}</ram:RateApplicablePercent>`
               + `\n\t\t\t</ram:ApplicableTradeTax>`;
        });

        // BG-14 periode de facturation. Position imposee : APRES les blocs
        // ram:ApplicableTradeTax et AVANT ram:SpecifiedTradeAllowanceCharge.
        if (o.period && (o.period.start || o.period.end)) {
            x += `\n\t\t\t<ram:BillingSpecifiedPeriod>`;
            if (o.period.start) {
                x += `\n\t\t\t\t<ram:StartDateTime>`
                   + `\n\t\t\t\t\t<udt:DateTimeString format="102">${CIITemplates.d8(o.period.start)}</udt:DateTimeString>`
                   + `\n\t\t\t\t</ram:StartDateTime>`;
            }
            if (o.period.end) {
                x += `\n\t\t\t\t<ram:EndDateTime>`
                   + `\n\t\t\t\t\t<udt:DateTimeString format="102">${CIITemplates.d8(o.period.end)}</udt:DateTimeString>`
                   + `\n\t\t\t\t</ram:EndDateTime>`;
            }
            x += `\n\t\t\t</ram:BillingSpecifiedPeriod>`;
        }

        // BG-20 / BG-21 : remises et frais de niveau document. La categorie de
        // TVA y est obligatoire (BR-31, BR-37) et un motif ou un code doit etre
        // present (BR-33, BR-38).
        (o.allowanceCharges || []).forEach((ac) => {
            x += `\n\t\t\t<ram:SpecifiedTradeAllowanceCharge>`
               + `\n\t\t\t\t<ram:ChargeIndicator>`
               + `\n\t\t\t\t\t<udt:Indicator>${ac.charge ? 'true' : 'false'}</udt:Indicator>`
               + `\n\t\t\t\t</ram:ChargeIndicator>`;
            if (ac.baseAmount) x += `\n\t\t\t\t<ram:BasisAmount>${ac.baseAmount}</ram:BasisAmount>`;
            x += `\n\t\t\t\t<ram:ActualAmount>${ac.amount}</ram:ActualAmount>`;
            if (ac.reasonCode) x += `\n\t\t\t\t<ram:ReasonCode>${xmlEsc(ac.reasonCode)}</ram:ReasonCode>`;
            if (ac.reason) x += `\n\t\t\t\t<ram:Reason>${xmlEsc(ac.reason)}</ram:Reason>`;
            x += `\n\t\t\t\t<ram:CategoryTradeTax>`
               + `\n\t\t\t\t\t<ram:TypeCode>VAT</ram:TypeCode>`
               + `\n\t\t\t\t\t<ram:CategoryCode>${ac.category || 'S'}</ram:CategoryCode>`
               + `\n\t\t\t\t\t<ram:RateApplicablePercent>${ac.percent || '20.00'}</ram:RateApplicablePercent>`
               + `\n\t\t\t\t</ram:CategoryTradeTax>`
               + `\n\t\t\t</ram:SpecifiedTradeAllowanceCharge>`;
        });

        // BT-20 conditions de paiement, BT-9 date d'echeance.
        x += `\n\t\t\t<ram:SpecifiedTradePaymentTerms>`
           + `\n\t\t\t\t<ram:Description>${xmlEsc(o.paymentTerms)}</ram:Description>`;
        if (o.dueDate) {
            x += `\n\t\t\t\t<ram:DueDateDateTime>`
               + `\n\t\t\t\t\t<udt:DateTimeString format="102">${CIITemplates.d8(o.dueDate)}</udt:DateTimeString>`
               + `\n\t\t\t\t</ram:DueDateDateTime>`;
        }
        x += `\n\t\t\t</ram:SpecifiedTradePaymentTerms>`;

        // BG-22 : totaux. ATTENTION, BT-108 ChargeTotalAmount precede BT-107
        // AllowanceTotalAmount, et BT-114 RoundingAmount s'insere entre BT-110
        // et BT-112. @currencyID n'apparait que sur ram:TaxTotalAmount, ou il
        // est obligatoire ; BT-111 est une seconde occurrence exprimee dans la
        // devise de comptabilisation.
        x += `\n\t\t\t<ram:SpecifiedTradeSettlementHeaderMonetarySummation>`
           + `\n\t\t\t\t<ram:LineTotalAmount>${t.lineExtension}</ram:LineTotalAmount>`;
        if (parseFloat(t.charge) !== 0) x += `\n\t\t\t\t<ram:ChargeTotalAmount>${t.charge}</ram:ChargeTotalAmount>`;
        if (parseFloat(t.allowance) !== 0) x += `\n\t\t\t\t<ram:AllowanceTotalAmount>${t.allowance}</ram:AllowanceTotalAmount>`;
        x += `\n\t\t\t\t<ram:TaxBasisTotalAmount>${t.taxExclusive}</ram:TaxBasisTotalAmount>`
           + `\n\t\t\t\t<ram:TaxTotalAmount currencyID="${o.currency}">${t.taxAmount}</ram:TaxTotalAmount>`;
        if (o.taxCurrency && t.taxCurrencyAmount) {
            x += `\n\t\t\t\t<ram:TaxTotalAmount currencyID="${o.taxCurrency}">${t.taxCurrencyAmount}</ram:TaxTotalAmount>`;
        }
        x += `\n\t\t\t\t<ram:GrandTotalAmount>${t.taxInclusive}</ram:GrandTotalAmount>`;
        if (parseFloat(t.prepaid) !== 0) x += `\n\t\t\t\t<ram:TotalPrepaidAmount>${t.prepaid}</ram:TotalPrepaidAmount>`;
        x += `\n\t\t\t\t<ram:DuePayableAmount>${t.payable}</ram:DuePayableAmount>`
           + `\n\t\t\t</ram:SpecifiedTradeSettlementHeaderMonetarySummation>`;

        // BG-3 : facture anterieure. FormattedIssueDateTime emploie qdt et non
        // udt, particularite du CII.
        if (o.precedingInvoice) {
            x += `\n\t\t\t<ram:InvoiceReferencedDocument>`
               + `\n\t\t\t\t<ram:IssuerAssignedID>${xmlEsc(o.precedingInvoice.id)}</ram:IssuerAssignedID>`;
            if (o.precedingInvoice.date) {
                x += `\n\t\t\t\t<ram:FormattedIssueDateTime>`
                   + `\n\t\t\t\t\t<qdt:DateTimeString format="102">${CIITemplates.d8(o.precedingInvoice.date)}</qdt:DateTimeString>`
                   + `\n\t\t\t\t</ram:FormattedIssueDateTime>`;
            }
            x += `\n\t\t\t</ram:InvoiceReferencedDocument>`;
        }

        // BT-19 reference comptable de l'acheteur. Dernier element de la
        // sequence, apres ram:InvoiceReferencedDocument.
        if (o.accountingCost) {
            x += `\n\t\t\t<ram:ReceivableSpecifiedTradeAccountingAccount>`
               + `\n\t\t\t\t<ram:ID>${xmlEsc(o.accountingCost)}</ram:ID>`
               + `\n\t\t\t</ram:ReceivableSpecifiedTradeAccountingAccount>`;
        }

        x += `\n\t\t</ram:ApplicableHeaderTradeSettlement>`;
        return x;
    },

    getFooter: () => `
\t</rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`
};
