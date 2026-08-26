# Rapport de normalisation `analyse360`

- Fichier : `/tmp/in.json`
- Date : 2026-08-26
- Fiches 360 traitées : 90

## Transformations appliquées

| n | transformation |
|---:|---|
| 76 | sourcesEnrichissement: champ absent -> non_precise |
| 76 | sourcesEnrichissement: source déduite de libelle/url |
| 76 | sourcesEnrichissement: confiance absente -> non_qualifie |
| 49 | capaciteDeFrappe: actionnariat regroupé |
| 47 | centralitePA: niveau -> valeur |
| 47 | sourcesEnrichissement: url nue -> objet |
| 33 | droitDeReponse: str -> {lecture} |
| 32 | poidsEconomique: CA sans dateReleve |
| 30 | reputation: avis à plat -> avis[] |
| 26 | immatriculationsLiees: entree str -> {nom, siren} |
| 26 | poidsEconomique: effectif fusionné dans effectifEntite |
| 25 | poidsEconomique: effectif -> effectifEntite |
| 17 | reputation: volumeAvis -> avis[].nombreAvis |
| 10 | referencesClients: referencesPAConfirmees -> list |
| 9 | referencesClients: grandsComptes -> list |
| 7 | poidsEconomique: effectif dict -> texte |
| 7 | poidsEconomique: montantMEUR arrondi à 2 décimales |
| 7 | capaciteDeFrappe: str -> {lecture} |
| 6 | reputation: avisPublics -> avis |
| 3 | referencesClients: commentairePerimetre -> commentaire |
| 3 | reputation: str -> {synthese} |
| 2 | reputation: motif -> commentaire |
| 2 | reputation: constat -> synthese |
| 2 | referencesClients: volumetrieRevendiquee -> complements |
| 2 | capaciteDeFrappe: investissements -> investissementsAnnonces |
| 2 | reputation: avisEmployeur -> complements |
| 2 | reputation: avisClients -> avis |
| 2 | droitDeReponse: pointsLegitimementContestables -> pointsContestables |
| 2 | capaciteDeFrappe: effectifCommercialFrance -> effectifCommercial |
| 1 | reputation: ecartReleve -> commentaire |
| 1 | droitDeReponse: cequilpourraitcontester -> pointsContestables |
| 1 | referencesClients: commentaireSecteursEditeur -> complements |
| 1 | referencesClients: commentaireReferencesPA -> complements |
| 1 | reputation: motifAbsence -> commentaire |
| 1 | reputation: scoresEditoriaux -> complements |
| 1 | capaciteDeFrappe: volumesAnnonces -> complements |
| 1 | droitDeReponse: elementsContestablesLegitimement -> pointsContestables |
| 1 | reputation: limites -> commentaire |
| 1 | capaciteDeFrappe: volumetrieRevendiquee -> complements |
| 1 | capaciteDeFrappe: basedeclaree -> lecture |
| 1 | capaciteDeFrappe: essaiGratuit -> offreGratuite |
| 1 | referencesClients: temoignagesNommes -> complements |
| 1 | referencesClients: precision -> commentaire |
| 1 | capaciteDeFrappe: signauxObservables -> complements |
| 1 | capaciteDeFrappe: motifsNonEtabli -> complements |
| 1 | reputation: date -> dateReleve |
| 1 | droitDeReponse: elementsContestables -> pointsContestables |
| 1 | reputation: noteEditoriale -> complements |
| 1 | referencesClients: motifReferencesPA -> complements |
| 1 | capaciteDeFrappe: maillageFrance -> maillage |
| 1 | reputation: list -> {avis} |
| 1 | reputation: notesPubliques -> avis |
| 1 | referencesClients: nbPartenairesCitesSurSite -> complements |
| 1 | referencesClients: motifBlocPartiel -> complements |
| 1 | reputation: notePublique -> complements |
| 1 | reputation: plateformes -> complements |
| 1 | reputation: distinctionsAnalystes -> complements |
| 1 | reputation: certifications -> complements |
| 1 | capaciteDeFrappe: implantationFrance -> maillage |
| 1 | capaciteDeFrappe: indicateursAffichesParLeGroupe -> complements |
| 1 | capaciteDeFrappe: effectifGroupe -> complements |
| 1 | capaciteDeFrappe: effectifCommercialDedie -> effectifCommercial |
| 1 | capaciteDeFrappe: commentaire -> lecture |
| 1 | capaciteDeFrappe: revendicationsParc -> complements |
| 1 | capaciteDeFrappe: signauxDeMoyens -> complements |
| 1 | capaciteDeFrappe: effectifCommercialPA -> effectifCommercial |
| 1 | capaciteDeFrappe: motifEffectifCommercialPA -> effectifCommercial |
| 1 | droitDeReponse: elementsPotentiellementContestes -> pointsContestables |
| 1 | capaciteDeFrappe: volumesRevendiques -> complements |
| 1 | referencesClients: motifReferencesPAVides -> complements |
| 1 | capaciteDeFrappe: actifsDeConfiance -> complements |
| 1 | lectureConcurrentielle: objet -> texte |
| 1 | reputation: avisUtilisateurs -> avis |
| 1 | reputation: notationsEditoriales -> complements |
| 1 | capaciteDeFrappe: signauxRFE -> complements |
| 1 | droitDeReponse: list -> {pointsContestables} |
| 1 | reputation: noteMoyenne -> complements |
| 1 | capaciteDeFrappe: assistance -> complements |
| 1 | referencesClients: detailPerimetre -> commentaire |
| 1 | referencesClients: traductionSecteursReferentiel -> complements |
| 1 | reputation: noteMotif -> commentaire |
| 1 | reputation: verbatimsStructurants -> complements |
| 1 | reputation: presencesMarche -> complements |
| 1 | reputation: avisFrancais -> avis |
| 1 | capaciteDeFrappe: effectifMondial -> complements |
| 1 | reputation: syntheseAvisPublics -> synthese |
| 1 | referencesClients: note -> commentaire |
| 1 | referencesClients: detail -> commentaire |
| 1 | reputation: agregats -> complements |
| 1 | capaciteDeFrappe: dispositifEditorial -> complements |
| 1 | centralitePA: indice déduit de valeur (pa-taxonomie.json) |
| 1 | droitDeReponse: objetsContestables -> pointsContestables |
| 1 | referencesClients: libellesSecteursEditeur -> list |
| 1 | capaciteDeFrappe: certifications -> complements |
| 1 | reputation: mentionsTierces -> complements |

## Points à arbitrer manuellement (118)

| plateforme | bloc | point |
|---|---|---|
| ABBY | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| ABBY | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| AGICAP | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| AGICAP | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| AGS RECORDS MANAGEMENT | poidsEconomique | `effectif` était un objet, aplati dans `effectifEntite` |
| AGS RECORDS MANAGEMENT | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| AGS RECORDS MANAGEMENT | caGroupe | dateReleve absente : donnée financière non rejouable |
| AGS RECORDS MANAGEMENT | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| ARTEVA | poidsEconomique | `effectif` était un objet, aplati dans `effectifEntite` |
| ARTEVA | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| AVALARA | caEntiteFrancaise | montantMEUR 0.241 arrondi à 0.24 |
| AVALARA | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| AXELOR | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| AXONAUT | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| AXONAUT | reputation | bloc fourni en texte nu, replié sur `synthese` |
| AXONAUT | capaciteDeFrappe | bloc fourni en texte nu, replié sur `lecture` |
| AXONAUT | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| AXWAY SOFTWARE | caEntiteFrancaise | montantMEUR 461.878 arrondi à 461.88 |
| AZOPIO | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| BLG | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| BLG | caGroupe | dateReleve absente : donnée financière non rejouable |
| CEGI ALFA | caEntiteFrancaise | montantMEUR 28.260798 arrondi à 28.26 |
| CEGID | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| CEGID | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| CLEARTAX | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| CLEARTAX | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| CYCLOPE | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| CYCLOPE | caGroupe | dateReleve absente : donnée financière non rejouable |
| CYCLOPE | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| DEXT | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| DEXT | reputation | bloc fourni en tableau nu, replié sur le socle |
| DEXT | capaciteDeFrappe | bloc fourni en texte nu, replié sur `lecture` |
| DEXT | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| DIGIPHARMACIE | poidsEconomique | `effectif` était un objet, aplati dans `effectifEntite` |
| DIGIPHARMACIE | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| DIGIPHARMACIE | caGroupe | dateReleve absente : donnée financière non rejouable |
| DIGIPHARMACIE | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| DOCOON | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| DOCOON | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| DOCUWARE | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| DOCUWARE | caGroupe | dateReleve absente : donnée financière non rejouable |
| DOCUWARE | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| DOXALLIA | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| DOXALLIA | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| EDICOM France | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| EDICOM France | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| EDICOM Group | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| EDICOM Group | caGroupe | dateReleve absente : donnée financière non rejouable |
| EDICOM Group | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| EDICS France | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| EDICS France | caGroupe | dateReleve absente : donnée financière non rejouable |
| EDICS France | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| EdiEyes Vision Care | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| EdiEyes Vision Care | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| EDT | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| EDT | caGroupe | dateReleve absente : donnée financière non rejouable |
| EDT | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| EEZI powered by VAT IT | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| EEZI powered by VAT IT | caGroupe | dateReleve absente : donnée financière non rejouable |
| EEZI powered by VAT IT | capaciteDeFrappe | bloc fourni en texte nu, replié sur `lecture` |
| EEZI powered by VAT IT | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| ENERJ | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| ENERJ | caGroupe | dateReleve absente : donnée financière non rejouable |
| ENERJ | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| ENTROPICS | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| ENTROPICS | caGroupe | dateReleve absente : donnée financière non rejouable |
| ENTROPICS | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| ESALINK | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| ESALINK | reputation | bloc fourni en texte nu, replié sur `synthese` |
| ESALINK | capaciteDeFrappe | bloc fourni en texte nu, replié sur `lecture` |
| ESALINK | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| ESI | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| ESI | caEntiteFrancaise | montantMEUR 6.098947 arrondi à 6.1 |
| EURO INFORMATION | poidsEconomique | `effectif` était un objet, aplati dans `effectifEntite` |
| FLOWIE | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| IOPOLE | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| IOPOLE | caEntiteFrancaise | montantMEUR 0.119 arrondi à 0.12 |
| MY FITECO | caEntiteFrancaise | montantMEUR 282.119 arrondi à 282.12 |
| MyKinexo PDP | caEntiteFrancaise | montantMEUR 0.522 arrondi à 0.52 |
| OPEN BEE | poidsEconomique | `effectif` était un objet, aplati dans `effectifEntite` |
| OPEN BEE | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| OPENTEXT | lectureConcurrentielle | bloc fourni en objet, aplati en texte structuré |
| OPENTEXT | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| OPENTEXT | caGroupe | dateReleve absente : donnée financière non rejouable |
| OPENTEXT | droitDeReponse | bloc fourni en tableau nu, replié sur le socle |
| PENNYLANE | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| PENNYLANE | capaciteDeFrappe | bloc fourni en texte nu, replié sur `lecture` |
| PENNYLANE | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| PITNEY BOWES | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| PITNEY BOWES | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| SAGE | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| SAGE | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| SAP | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| SAP | caGroupe | dateReleve absente : donnée financière non rejouable |
| SAP | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| SEEBURGER | poidsEconomique | `effectif` était un objet, aplati dans `effectifEntite` |
| SEEBURGER | caEntiteFrancaise | dateReleve absente : donnée financière non rejouable |
| SEEBURGER | caGroupe | dateReleve absente : donnée financière non rejouable |
| SEEBURGER | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| SEPTEO | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| SEPTEO | capaciteDeFrappe | bloc fourni en texte nu, replié sur `lecture` |
| SEPTEO | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| SERENSIA by Quadient | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| SOVOS | poidsEconomique | `effectif` était un objet, aplati dans `effectifEntite` |
| SPENDESK | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| SPENDESK | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| SWILE | caGroupe | dateReleve absente : donnée financière non rejouable |
| SYMTRAX | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| SYMTRAX | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| TAXERA | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| TENOR | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| TENOR | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| TX2 Concept | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |
| TX2 Concept | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| WEPROC | reputation | bloc fourni en texte nu, replié sur `synthese` |
| WEPROC | capaciteDeFrappe | bloc fourni en texte nu, replié sur `lecture` |
| WEPROC | droitDeReponse | bloc fourni en texte nu, replié sur `lecture` |
| YOOZ PDP | poidsEconomique | `effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer |

## Traçabilité

- Fiches 360 sans aucune `sourcesEnrichissement` dédiée : 8
  - CENSE
  - Dougs Facturation gratuite
  - EDICOM France
  - FIDUCIAL CLOUD
  - jefacture.com
  - LE VILLAGE CONNECTE
  - MY UNISOFT
  - TeamSystem Sellsy
- Entrées `sourcesEnrichissement` sans `confiance` : 144

## Couverture recalculée

| compteur | valeur |
|---|---:|
| `identiteEntreprise_haute` | 90 |
| `identiteEntreprise_a_verifier` | 20 |
| `identiteEntreprise_absente` | 54 |
| `qualificationMarche_faite` | 157 |
| `fournisseursDeSocle_identifies` | 38 |
| `entitesCreeesPourLaReforme` | 9 |
| `note` | Appariement automatique nom commercial DGFiP -> SIREN via l'API Recherche d'entreprises. 'haute' = nom exact + code postal ou departement concordant. 'moyenne' = nom exact seul, a verifier. Les entites etrangeres (44) ne sont pas dans le repertoire SIRENE. |
| `siteWeb_rempli` | 161 |
| `contact_rempli` | 147 |
| `reseaux_renseignes` | 112 |
| `dirigeants_renseignes` | 95 |
| `fichesSansAucunEnrichissement` | 0 |
| `dateDerniereFusion` | 2026-08-26 |
| `verticale_sectorielle` | 22 |
| `socleTechnique_identifie` | 163 |
| `consommateursDeSocleTiers_identifies` | 3 |
| `confiance_qualifiee` | 116 |
| `confiance_partielle` | 43 |
| `confiance_amorcee` | 4 |
| `analyse360_entamee` | 90 |
| `analyse360_activites` | 89 |
| `analyse360_centralite` | 89 |
| `analyse360_caGroupe` | 23 |
| `analyse360_caEntiteFrancaise` | 45 |
| `analyse360_referencesClients` | 60 |
| `analyse360_reputation` | 77 |
| `identiteInternationale_renseignee` | 16 |
| `entitesEtrangeres` | 49 |
| `droitDeReponse_signale` | 0 |
| `analyse360_posture` | 90 |
| `analyse360_capaciteDeFrappe` | 59 |
| `analyse360_lectureConcurrentielle` | 89 |
