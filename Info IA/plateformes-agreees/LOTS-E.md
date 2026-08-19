# Découpage des lots de qualification marché (chantier E)

135 plateformes restant à qualifier, réparties en lots disjoints de 10.
Un lot = une conversation parallèle = un fichier de patch.

| Lot | Type | Plateformes |
|---|---|---|
| **E1** | FR | ACCENTURE, AGENA 3000, AGICAP, AGS RECORDS MANAGEMENT, ARTEVA, ATGP, AVALARA, AXELOR, AXONAUT, AXWAY SOFTWARE |
| **E2** | FR | AZOPIO, BC SOLUTIONS, CECURITY, CEGEDIM, CEGI ALFA, CLEARTAX, CYCLOPE, DARVA, DEXT, DIGIPHARMACIE |
| **E3** | FR | DOCUWARE, DOXALLIA, Dougs Facturation gratuite, EDICS France, EDT, ENERJ, ENTROPICS, ESI, EURO INFORMATION, EdiEyes Vision Care |
| **E4** | FR | FIDUCIAL CLOUD, FLOWIE, FULLL, GEP, GESTAV, GROUPE SIGMA, IAF, ICD International, IGA ASSURANCE, INDY |
| **E5** | FR | INFOLOGIC, ITESOFT, KLEKOON, LE VILLAGE CONNECTE, LOGILEC, LUCCA, LUNDI MATIN, MACOMPTA.FR, MEDIUS, MY FITECO |
| **E6** | FR | MY UNISOFT, MyKinexo PDP, N2F PDP, NEOTIMO, ONE UP, OPEN BEE, OfficeIn, PARAGON, PAYFLOWS, PITNEY BOWES |
| **E7** | FR | QONTO, QWEEBY, SCRIBEE, SEPTEO, SEQINO, SERES, SPENDESK, SRCI, SUPER PDP, SYMTRAX |
| **E8** | FR | TAXERA, TESSI Technologies, TIIME PDP, TRESO2, TUNGSTEN AUTOMATION FRANCE, TX2 Concept, TeamSystem Sellsy, VENTYA, VERYSWING, VosFactures |
| **E9** | FR | WEPROC, XELYA, iPaidThat, jefacture.com |
| **E10** | ETRANGER | A-Cube, ADEMICO SOFTWARE, Arratech, Aruba S.p.A., B4VALUE.NET, BASWARE, BILLIT, CBS Corporate Business Solutions, DIGITAL TECHNOLOGIES, DOKAPI |
| **E11** | ETRANGER | Docnova, MELASOFT GmbH, ECOSIO, EDICOM Group, Fonoa Technologies Limited, GURUSOFT, INDICOM, INVOPOP, In.Te.S.A. spa, MAROSA, MySupply Aps |
| **E12** | ETRANGER | NTT DATA Business Solutions, ODOO, SAP, SEEBURGER, SNI, SOLO, SPS COMMERCE, Shine, TESISQUARE SPA, TRADESHIFT BABELWAY |
| **E13** | ETRANGER | Transalis Limited, VOXEL, an Amadeus company, WiseTech GLOBAL, ecosio InterCom, a Vertex Company, iEDI ApS |
| **E14** | CANDIDATE | BE FRESH S.à r.l., BLG, Basikon, CENSE, EAGLESSOFT, EY Expertises & Transactions, FACTUREAPP, FISKALTRUST, Insiders Technologies GmbH, KALANDA |
| **E15** | CANDIDATE | MY-EDDY, NUMERIA, RATIOO, SWILE, Taxilla Europe BV, WAKASTELLAR |

## Règles de parallélisation

- Un lot ne doit être traité que par **une seule** conversation à la fois.
- Le patch produit porte le nom du lot : `patches/patch-E3.json`.
- Les lots FR sont prioritaires (identité juridique automatisable).
- Les lots ETRANGER acceptent un niveau de détail dégradé assumé : pas d'identité juridique française, donc `siren`, `dateCreation`, `trancheEffectif`, `categorieEntreprise`, `activitePrincipale` et `dirigeants` restent à `null`.
- Les lots CANDIDATE ne disposent que du nom : tout le reste est à chercher, et l'absence de résultat est un résultat (`confiance: "non_qualifie"`).
