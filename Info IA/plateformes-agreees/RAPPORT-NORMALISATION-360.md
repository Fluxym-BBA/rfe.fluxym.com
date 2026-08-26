# Rapport de normalisation `analyse360`

- Fichier : `data/plateformes-agreees.json`
- Date : 2026-08-26
- Fiches 360 traitées : 90

## Transformations appliquées

| n | transformation |
|---:|---|

## Points à arbitrer manuellement (10)

| plateforme | bloc | point |
|---|---|---|
| ABBY | centralitePA | valeur hors vocabulaire : 'axe_stratégique' |
| ABBY | postureCommerciale | valeur hors vocabulaire : 'conquête_directe' |
| AVALARA | centralitePA | valeur hors vocabulaire : 'axe_stratégique' |
| AVALARA | postureCommerciale | valeur hors vocabulaire : 'conquête_directe' |
| DOCOON | centralitePA | valeur hors vocabulaire : 'axe_stratégique' |
| DOCOON IMMO / FREEDZ | centralitePA | valeur hors vocabulaire : 'coeur_de_métier' |
| DOCOON IMMO / FREEDZ | postureCommerciale | valeur hors vocabulaire : 'base_installée' |
| EURO INFORMATION | postureCommerciale | valeur hors vocabulaire : 'base_installée' |
| OPENTEXT | postureCommerciale | valeur hors vocabulaire : 'base_installée' |
| SAP | postureCommerciale | valeur hors vocabulaire : 'base_installée' |

## Traçabilité

- Fiches 360 sans aucune `sourcesEnrichissement` dédiée : 2
  - FIDUCIAL CLOUD
  - MY UNISOFT
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
| `analyse360_caEntiteFrancaise` | 44 |
| `analyse360_referencesClients` | 60 |
| `analyse360_reputation` | 77 |
| `identiteInternationale_renseignee` | 16 |
| `entitesEtrangeres` | 49 |
| `droitDeReponse_signale` | 0 |
| `analyse360_posture` | 90 |
| `analyse360_capaciteDeFrappe` | 59 |
| `analyse360_lectureConcurrentielle` | 89 |
