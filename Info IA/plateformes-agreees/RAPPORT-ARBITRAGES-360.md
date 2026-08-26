# Rapport d'arbitrages `analyse360`

- Fichier : `/tmp/arb_in.json`
- Date : 2026-08-26
- Décisions : 54

## Bilan

| n | arbitrage |
|---:|---|
| 2553 | mots réaccentués |
| 44 | source rattachée à identiteJuridique |
| 43 | source rattachée à analyse360.poidsEconomique |
| 32 | dateReleve reconstituée |
| 25 | source laissée à non_precise |
| 12 | effectifEntite dédoublonné |
| 9 | source rattachée à analyse360.capaciteDeFrappe |
| 1 | montantMEUR 0 -> null |
| 1 | source rattachée à analyse360.postureCommerciale |
| 1 | source rattachée à analyse360.referencesClients |

## Réaccentuation

Lexique retenu : **1544 formes**, appliquées sans aucune ambiguïté possible.

Formes volontairement **non corrigées**, faute de pouvoir trancher hors contexte :

- 222 homographes français (« des » / « dès », « cote » / « côté », « marque » / « marqué ») ;
- 39 formes à deux candidats concurrents (« declare » -> « déclare » 65 fois contre « déclaré » 97 fois) ;
- 196 formes où l'accent ne porte que sur la dernière lettre, donc indécidables entre présent et participe (« rencontre » / « rencontré », « place » / « placé »).

Aucune erreur n'est introduite : une forme non tranchée reste telle quelle. Le reliquat demande une relecture humaine, fiche par fiche.

| fiche | mots corrigés | taux avant | taux après |
|---|---:|---:|---:|
| ABBY | 200 | 0% | 19% |
| AVALARA | 326 | 1% | 21% |
| DOCOON | 380 | 1% | 21% |
| DOCOON IMMO / FREEDZ | 313 | 0% | 20% |
| EURO INFORMATION | 400 | 0% | 23% |
| OPEN BEE | 327 | 0% | 19% |
| OPENTEXT | 367 | 0% | 23% |
| SAP | 240 | 0% | 22% |

### Corrections les plus fréquentes

| n | correction |
|---:|---|
| 78 | agreee -> agréée |
| 72 | electronique -> électronique |
| 71 | entite -> entité |
| 57 | activite -> activité |
| 41 | editeur -> éditeur |
| 40 | metier -> métier |
| 38 | francaise -> française |
| 35 | salaries -> salariés |
| 34 | perimetre -> périmètre |
| 33 | conformite -> conformité |
| 33 | meme -> même |
| 32 | reseau -> réseau |
| 32 | references -> références |
| 31 | francais -> français |
| 31 | publiee -> publiée |
| 29 | immatriculee -> immatriculée |
| 29 | reference -> référence |
| 28 | ete -> été |
| 22 | deja -> déjà |
| 21 | dediee -> dédiée |
| 21 | reforme -> réforme |
| 20 | credit -> crédit |
| 18 | integration -> intégration |
| 18 | etre -> être |
| 18 | epithete -> épithète |
| 17 | portee -> portée |
| 16 | plutot -> plutôt |
| 16 | deposes -> déposés |
| 15 | dematerialisation -> dématérialisation |
| 15 | unite -> unité |
| 15 | legale -> légale |
| 14 | dedie -> dédié |
| 14 | conquete -> conquête |
| 14 | donnee -> donnée |
| 13 | donnees -> données |
| 13 | etablissements -> établissements |
| 13 | siege -> siège |
| 13 | ecart -> écart |
| 13 | strategique -> stratégique |
| 13 | installee -> installée |

## Journal des décisions (54)

| plateforme | champ | décision |
|---|---|---|
| ABBY | `prose` | 200 mots réaccentués (taux 0% -> 19%) |
| AVALARA | `prose` | 326 mots réaccentués (taux 1% -> 21%) |
| DOCOON | `prose` | 380 mots réaccentués (taux 1% -> 21%) |
| DOCOON IMMO / FREEDZ | `prose` | 313 mots réaccentués (taux 0% -> 20%) |
| EURO INFORMATION | `prose` | 400 mots réaccentués (taux 0% -> 23%) |
| OPEN BEE | `prose` | 327 mots réaccentués (taux 0% -> 19%) |
| OPENTEXT | `prose` | 367 mots réaccentués (taux 0% -> 23%) |
| SAP | `prose` | 240 mots réaccentués (taux 0% -> 22%) |
| ABBY | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| AGS RECORDS MANAGEMENT | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| AGS RECORDS MANAGEMENT | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| ARTEVA | `effectifEntite` | phrase redondante écartée, reprise par « Tranche INSEE : 10-19 — Millesime : 2023 — Commentaire : Auc… » |
| AXONAUT | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| BLG | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| BLG | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| CEGID | `effectifEntite` | phrase redondante écartée, reprise par « Entité agréée : 2 540 salariés déclarés aux comptes 2023, tr… » |
| CLEARTAX | `effectifEntite` | « Non établi. » écartée : sans information, contredite par la suite du relevé |
| CYCLOPE | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| CYCLOPE | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| DEXT | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| DIGIPHARMACIE | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| DIGIPHARMACIE | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| DOCUWARE | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| DOCUWARE | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| EDICOM Group | `caGroupe` | dateReleve fixée au 2026-08-25 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| EDICOM Group | `caEntiteFrancaise` | dateReleve fixée au 2026-08-25 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| EDICS France | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| EDICS France | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| EDT | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| EDT | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| EEZI powered by VAT IT | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| EEZI powered by VAT IT | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| Effinum by SPEE | `caEntiteFrancaise` | montantMEUR 0 -> null (nature `comptes_confidentiels` : chiffre non exploitable, pas un chiffre d'affaires nul) |
| ENERJ | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| ENERJ | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| ENTROPICS | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| ENTROPICS | `caEntiteFrancaise` | dateReleve fixée au 2026-08-26 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| FLOWIE | `effectifEntite` | phrase redondante écartée, reprise par « (1) Registre : 6 à 9 salariés (INSEE, millésime 2023) ; « au… » |
| FLOWIE | `effectifEntite` | phrase redondante écartée, reprise par « (1) Registre : 6 à 9 salariés (INSEE, millésime 2023) ; « au… » |
| OPENTEXT | `caGroupe` | dateReleve fixée au 2026-08-25 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| OPENTEXT | `caEntiteFrancaise` | dateReleve fixée au 2026-08-25 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| PENNYLANE | `effectifEntite` | millésime 2023 écarté, périmé par 2026 (tranche identique 250-499) |
| PITNEY BOWES | `effectifEntite` | millésime 2022 écarté, périmé par 2023 (tranche identique 250-499) |
| SAGE | `effectifEntite` | phrase redondante écartée, reprise par « Entité française : 1 400 salariés déclarés aux comptes 2023,… » |
| SAP | `caGroupe` | dateReleve fixée au 2026-08-25 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| SAP | `caEntiteFrancaise` | dateReleve fixée au 2026-08-25 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| SEEBURGER | `caGroupe` | dateReleve fixée au 2026-08-25 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| SEEBURGER | `caEntiteFrancaise` | dateReleve fixée au 2026-08-25 (date de production de la fiche, constat d'absence de chiffre) et tracée par `dateReleveOrigine` |
| SEPTEO | `effectifEntite` | millésime 2023 écarté, périmé par 2026 (tranche identique 100-199) |
| SERENSIA by Quadient | `effectifEntite` | phrase redondante écartée, reprise par « 26 salariés déclarés aux comptes 2024 ; tranche INSEE de 20 … » |
| SPENDESK | `effectifEntite` | phrase redondante écartée, reprise par « Tranche INSEE de 250 à 499 salariés, donnée 2023 ; 166 salar… » |
| SWILE | `caGroupe` | dateReleve fixée au 2026-08-26 (date de production de la fiche, chiffre publié) et tracée par `dateReleveOrigine` |
| SYMTRAX | `effectifEntite` | millésime 2022 écarté, périmé par 2023 (tranche identique 20-49) |
| TX2 Concept | `effectifEntite` | millésime 2022 écarté, périmé par 2026 (tranche identique 20-49) |
