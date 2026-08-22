# Fiche 360 — 74SOFTWARE (entrée « AXWAY SOFTWARE ») — 22/08/2026

Première fiche 360 issue de la passe d'ancrage du soir. C'est **la plus grosse entrée du référentiel qui n'avait jamais été analysée** : elle était restée invisible parce qu'elle est immatriculée sous un nom, `AXWAY SOFTWARE`, qui ne correspond plus à la dénomination de l'entité, `74SOFTWARE`.

## Poids économique

| Ancrage | Montant | Exercice | Nature |
|---|---|---|---|
| Chiffre d'affaires consolidé du groupe coté | **707,2 M€** | 2025 | communiqué financier |
| Comptes déposés par l'entité immatriculée (SIREN 433 977 980) | **461,9 M€** | 2024 | comptes déposés |
| Chiffre d'affaires réalisé en France | **213,8 M€** (30,2 %) | 2025 | communiqué financier |

**Trois ancrages, jamais mélangés.** Ils ne s'additionnent pas et ne se comparent pas : le consolidé couvre le groupe, les comptes sociaux couvrent la société mère cotée avec ses flux intra-groupe, le chiffre France est une ventilation géographique du consolidé.

Rentabilité 2025 : marge brute 476,1 M€ (67,3 %), résultat opérationnel d'activité 107,3 M€ (15,2 %), résultat opérationnel 73,3 M€ (10,4 %), résultat net 40,8 M€ (5,8 %), bénéfice par action 1,39 €. Guidance relevée : 3 à 5 % de croissance organique par an sur trois ans, marge opérationnelle de 20 % à fin 2028.

Effectif : **4 571 personnes** au 31/12/2025 — Europe 2 965, Amériques 360, Asie-Pacifique 824, Moyen-Orient et Afrique 422. Contre 4 787 un an plus tôt : **−216 personnes en un an**, alors que le chiffre d'affaires progresse.

## Ventilation par activité — publiée par l'acteur, donc retenue

| Marque | CA 2025 | Croissance organique | Part du groupe |
|---|---|---|---|
| **Axway** — intégration de flux, MFT, API, EDI/B2B | 337,9 M€ | +4,6 % | 47,8 % |
| **SBS** — logiciels bancaires | 371,2 M€ | +3,0 % | 52,2 % |

Au sein de l'ARR de la marque Axway (273,0 M€ fin 2025, +11,8 % en organique), la répartition publiée par ligne de produit est stable sur deux exercices : **MFT 42-43 %, intégration B2B 23 %, API management 18 %, autres 16-17 %**.

L'activité agréée est un cas d'usage de la ligne B2B, soit **un sous-ensemble non isolé d'un sous-ensemble**. Sa part n'est pas estimée : l'acteur ne la publie pas (règle 25). Retenir une ventilation publiée n'exonère pas de dire ce qu'elle ne dit pas.

## Centralité : indice 2 — extension naturelle

Quatre signaux, dont deux négatifs :

| Signal | Sens |
|---|---|
| L'agrément prolonge un métier d'échange de flux exercé depuis des décennies (MFT, EDI, B2B) ; l'e-invoicing est présenté comme une capacité de conformité de la ligne B2B Integration | + |
| Offre réellement nommée, outillée et documentée : page produit dédiée, couverture multi-pays (CTC, Peppol, DCTCE), adhésion au FNFE-MPE | + |
| La ligne B2B pèse 23 % de l'ARR d'une marque qui pèse 47,8 % du groupe | − |
| Le communiqué de résultats annuels 2025 **ne mentionne pas** la facturation électronique parmi les moteurs de croissance commentés : les relais cités sont le MFT, l'API management et les composants bancaires | − |

Lecture : l'agrément ne crée pas une activité, il ajoute une obligation réglementaire à un tuyau qui transportait déjà des factures en EDI. Ce n'est pas pour autant un indice 0 : l'offre est nommée, outillée et portée dans les instances de la réforme.

## Posture : base installée

L'argumentaire est adressé à des clients qui font **déjà** passer leurs flux par la plateforme : Axway eInvoicing est vendu comme une capacité supplémentaire de B2B Integration, avec l'argument d'éviter « la multiplication des PDP/PA locales » et de centraliser la conformité multi-pays depuis un environnement en place. Aucune offre en marque blanche ni programme de revente relevés. Réserve : le canal partenaires et intégrateurs n'a pas été exploré page par page.

## Lecture concurrentielle

Concurrent d'une nature particulière : ce n'est pas un éditeur de facturation qui se met en conformité, c'est **un éditeur d'infrastructure d'échange qui absorbe la facturation dans son tuyau**. Le point d'entrée n'est donc pas la direction financière mais la direction des systèmes d'information, chez un client déjà équipé en MFT et EDI. L'argument opposé au marché est la centralisation multi-pays.

Deux éléments de contexte à garder en tête : le groupe pèse 707,2 M€ et 4 571 personnes, mais son effectif recule de 216 personnes en un an, et la facturation électronique n'apparaît nulle part dans les moteurs de croissance commentés de son communiqué annuel.

Fluxym est un acteur du marché : ce référentiel est publié par un intégrateur qui distribue des solutions concurrentes, et cette lecture est une lecture de marché, pas une évaluation.

## Références clients

Cinq logos grands comptes sur la page produit e-invoicing : **DB Schenker** (transport et logistique), **Bosch** (industrie), **Equinor** et **TotalEnergies** (énergie), **Cencora** (santé et pharmacie). Réserve explicite portée dans la fiche : ces logos illustrent la page de la solution, **aucune de ces références n'est présentée comme cliente de l'activité de plateforme agréée française**. Aucune référence PA confirmée.

## Deux valeurs d'énumération corrigées avant livraison

1. `typeActionnaire` : j'avais écrit `cotee`. La bonne valeur de la facette est **`cote`**. La chaîne `cotee` existe bien dans le fichier de taxonomie, mais dans une **autre** facette (`relationCapitalistique`) — un contrôle par simple recherche de chaîne valide donc une valeur fausse.
2. `parSecteur` : j'avais écrit `transport_logistique` et `sante_pharmacie`. Les clés de la facette sont **`transport`** et **`sante`**.

Le bloc `dynamique` reste vide : la page carrières du groupe renvoie une erreur 404 sur les deux domaines, aucun volume d'offres n'a pu être relevé à une date. Rien n'est inventé pour remplir la case.

## ⚠️ Compteurs de contrôle : je ne peux pas les certifier

Les chiffres de contrôle que j'ai annoncés dans `ORDRE-DE-FUSION.md` puis corrigés dans `NOTE-RECUP-SIREN-2.md` sont calculés sur l'instantané du référentiel que j'ai en main, daté du 21/08/2026 — **et cet instantané est antérieur à la fusion des patches du chantier G**. Les patches G ne sont donc pas comptés dans mes totaux, qui sous-estiment le nombre réel de fiches analysées.

Concrètement : ma simulation cumulative donne 47 fiches avec un bloc `analyse360` et une seule avec un bloc `centralitePA`, ce qui est manifestement faux puisque les 20 fiches du chantier G en portent un.

**Ce que je peux affirmer** : les patches livrés ne sont ni rejetés ni destructeurs, et les écrasements sont ceux annoncés. **Ce que je ne peux pas affirmer** : les totaux du référentiel après fusion.

Pour rétablir des compteurs justes, il me faut le `data/plateformes-agreees.json` courant de la branche `main` — le fichier dépasse la taille lisible par récupération directe et doit être joint à la conversation. Tant qu'il ne l'est pas, aucun compteur global ne sera annoncé.

## Ce que cette fiche ouvre

- **Actionnariat de 74Software** : structure détaillée non relevée. Pierre Pasquier, fondateur de Sopra Steria, siège au conseil de l'entité immatriculée — le lien Sopra Steria mérite d'être documenté au registre.
- **SBS** (371,2 M€, logiciels bancaires) : hors périmètre de la réforme, mais c'est la moitié du groupe. À citer pour ne pas laisser croire que 707 M€ pèsent sur le marché de la facture.
- **Volume d'offres d'emploi** : à relever en une passe datée pour toutes les fiches, y compris celle-ci (règle 19).
- **Bloc « profession comptable »** : FITECO, ECMA, CENSE, MY FITECO, Dougs, COGEP — réseaux de centaines d'établissements et dizaines de milliers de TPE-PME captives. C'est un canal de conquête massif, et c'est le prochain lot 360 que je recommande.
