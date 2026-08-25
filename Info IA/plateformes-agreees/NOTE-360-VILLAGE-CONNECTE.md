# Chantier 360 — LE VILLAGE CONNECTÉ, et ce qu'ACD Groupe a révélé

**Date de relevé : 25/08/2026** · Auteur : RFE_WebSite · Patch : `patches/patch-360-VILLAGE-CONNECTE.json` (1 fiche 360 + 2 liaisons)

## Un échec utile

La commande était de traiter ACD Groupe pour lui-même, dans le prolongement de la fiche TeamSystem. La recherche a produit autre chose, et de plus grande portée : **ACD Groupe ne porte aucune immatriculation de plateforme agréée.** Sa page dédiée à la réforme renvoie à une plateforme portée par une alliance dont il est l'un des trois membres — **LE VILLAGE CONNECTÉ**, avec **RCA** et **COAXIS ASP**.

Cette entrée figurait déjà au référentiel, identifiée comme « alliance » par le recensement du chantier H2, mais sans que la conséquence en soit tirée. La voici : **en prenant le contrôle d'ACD Groupe en avril 2026, le groupe italien TeamSystem est entré dans le tour de table d'une seconde plateforme agréée française**, alors qu'il en détient déjà une par SELLSY.

## Ce que l'entité immatriculée est, et n'est pas

| | |
|---|---|
| Entité | LE VILLAGE CONNECTÉ, SIREN 950 883 231 |
| Création | 23/03/2023, soit après l'annonce de la réforme |
| Effectif | **1 à 2 salariés** |
| Comptes | aucun compte déposé |
| Domiciliation | Fauguerolles (47), **à l'adresse de COAXIS ASP**, l'un de ses trois membres |

C'est un véhicule, pas une entreprise. Le métier, les effectifs, les revenus et les clients sont chez les membres.

## Les trois membres, cités séparément et jamais additionnés

| Membre | SIREN | Siège | Poids | Rôle dans l'alliance |
|---|---|---|---|---|
| **ACD** | 528 553 654 | Tours | ~**37 M€**, >300 collaborateurs, ~3 500 cabinets clients | éditeur de la suite i-Suite Expert (production comptable, fiscale, sociale, juridique) — **sous contrôle de TeamSystem depuis avril 2026** |
| **RCA** | 418 348 231 | Saint-Herblain | ~**42 M€**, ~300 collaborateurs, **>205 000 entreprises déclarées connectées** à MEG, ~3 500 cabinets partenaires | éditeur de la plateforme de gestion MEG destinée aux entreprises clientes des cabinets |
| **COAXIS ASP** | 432 577 898 | Fauguerolles | **12,27 M€** (exercice clos 30/06/2025), 20 à 49 salariés | hébergement et infogérance pour cabinets ; holding COAXIS INVEST (897 589 024) |

**Ces trois chiffres d'affaires ne s'additionnent pas.** Il n'y a pas de groupe, donc pas de consolidation, donc pas de périmètre de responsabilité commun. Ils sont cités un par un parce qu'ils donnent l'ordre de grandeur de la capacité d'investissement mobilisable derrière la plateforme — capacité que les comptes de l'entité immatriculée ne laissent absolument pas voir (règle 86).

**Réserve publiée sur les volumes** : ACD annonce environ 3 500 cabinets, RCA annonce environ 3 500 cabinets. Un cabinet peut être client des deux. Le nombre réel de cabinets couverts par l'alliance n'est pas établi, et la réserve est portée dans le champ lui-même (règle 87).

## Premier indice 4 du référentiel — et pourquoi il faut le lire avec sa contrepartie

`centralitePA` = **4, `coeur_de_metier`**. C'est mécanique : l'entité a été créée après l'annonce de la réforme, n'a aucune autre activité, et son unique raison d'être est de porter l'agrément. `entiteJuridiqueDediee` = vrai.

Mais l'indice qualifie **un véhicule, pas une puissance**. Pour chacun des trois membres pris séparément, l'indice serait bien plus bas : la plateforme n'est qu'une brique de conformité de leur offre. C'est exactement l'inverse du cas FIDUCIAL CLOUD analysé la veille — là, une filiale technique de 20 à 49 salariés sert un groupe de 334 000 clients ; ici, trois entreprises de 37, 42 et 12 M€ servent une coquille de 1 à 2 salariés. Deux configurations opposées, une même leçon : **l'entité immatriculée ne dit presque jamais le poids du dispositif.**

Signal notable du faisceau : trois sociétés concurrentes sur leurs marchés respectifs ont accepté de mutualiser un véhicule commun. Le coût politique d'une telle décision atteste que la conformité était jugée trop structurante pour être traitée séparément. La gouvernance associe les membres — la direction générale est notamment exercée par le fondateur de RCA.

## La conséquence de méthode la plus sérieuse

**Le recensement du contrôle étranger sur les plateformes agréées françaises est faux s'il ne regarde que les entités immatriculées.** Un groupe étranger peut entrer par un membre d'alliance sans jamais figurer au registre de la plateforme. TeamSystem en est la démonstration : présent en direct via SELLSY, présent indirectement via ACD dans LE VILLAGE CONNECTÉ (règle 88).

Le chantier H2 — les 123 entrées sans lien capitalistique exploitable — doit être repris avec ce cas de figure en tête, et la même question posée pour chaque alliance et chaque fournisseur de socle du référentiel.

## Lecture concurrentielle

Pour l'offre portée par Fluxym, l'enseignement reste indirect : la cible de ce dispositif est le cabinet et sa clientèle de TPE et PME, pas l'ETI. Mais l'ordre de grandeur mérite d'être posé. Trois éditeurs et hébergeurs pesant séparément 37, 42 et 12 M€, deux fois environ 3 500 cabinets annoncés, plus de 205 000 entreprises déclarées connectées à l'une de leurs plateformes — et désormais un actionnaire de référence à un milliard d'euros derrière l'un des trois.

Ce n'était, en 2023, qu'une alliance défensive de fournisseurs de cabinets. C'est devenu **un canal doté d'un bilan**.

Fluxym est un acteur du marché. Ce référentiel est publié par un intégrateur qui distribue des solutions concurrentes, et cette lecture est une lecture de marché, pas une évaluation.

## Contrôles effectués avant livraison

- **Énumérations vérifiées facette par facette** (règles 23 et 72) : `centralitePA`, `postureCommerciale`, `typeActionnaire`, `liaisonImmatriculations`, `nature` des blocs de chiffre d'affaires. Aucune erreur détectée.
- **Forme du bloc `immatriculationsLiees`** contrôlée contre le format effectivement lu par `js/pa-detail.js` : `groupe`, `type`, `entrees`, `lecture`, `source`, `dateReleve`. La facette du hub lit `pa.immatriculationsLiees.type`, valeur retenue `alliance_industrielle`.
- **Structure et ordre du bloc `analyse360`** contrôlés clé par clé.
- **Simulation de fusion sur l'instantané de travail** : 2 fiches reconnues, 0 rejet, 0 écrasement, aucune suppression.
- **Écrasement attendu sur le fichier réel, à signaler** : le bloc `immatriculationsLiees` du VILLAGE CONNECTÉ a été posé par le chantier H2 et sera réécrit clé par clé, puisque ce chemin est en fusion profonde. C'est intentionnel. Le nouveau bloc **reprend en tête la composition de l'alliance** déjà établie par H2 et y ajoute le fait TeamSystem, conformément à la convention appliquée aux réécritures de blocs préexistants. Sur l'entrée « TeamSystem Sellsy », le bloc est une création.
- **Aucun compteur global du référentiel n'est annoncé** (règle 75).

## Reste à faire identifié par cette fiche

- **Reprendre le chantier H2 à la lumière de la règle 88** : pour chaque alliance et chaque fournisseur de socle du référentiel, vérifier si un groupe étranger est entré par un membre plutôt que par l'entité immatriculée.
- **Répartition du capital du VILLAGE CONNECTÉ** entre ses trois membres : non publiée, non supposée.
- **Degré d'influence effectif de TeamSystem** sur les décisions de l'alliance : non établi, à chercher dans les statuts ou un pacte s'il est déposé.
- **Fiches 360 des trois membres**, qui sont les acteurs réels : ACD, RCA et COAXIS ASP ont chacun leur propre poids, leurs propres références et leur propre base installée. RCA en particulier — 42 M€, MEG, plus de 205 000 entreprises connectées — n'a jamais été analysé et n'apparaît nulle part au référentiel puisqu'il ne porte pas d'immatriculation.
- **Nombre réel de cabinets couverts** par l'alliance, après dédoublonnage : non établi, probablement non publiable.
- **Avis agrégés sur i-Suite Expert et MEG**, les produits des membres, l'entité immatriculée n'ayant aucun utilisateur direct.
- **Structure d'ACD Groupe** : l'entité 528 553 654 ne compte que 10 à 19 salariés pour 9 établissements, alors que le groupe annonce plus de 300 collaborateurs et environ 37 M€. Les entités opérationnelles restent à identifier — l'acronyme renvoie historiquement à deux sociétés, Azur Conception et Cador-Dorac.
- **Holding COAXIS INVEST** (897 589 024) et son actionnariat, non ouverts dans cette passe.
