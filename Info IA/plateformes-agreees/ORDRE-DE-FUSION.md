# Ordre de fusion — reprise après le chantier G

Point de départ déclaré : `data/plateformes-agreees.json` de la branche `main` **fusionné jusqu'à la dernière partie du chantier G**.

Tous les patches de ce ZIP sont **idempotents** : les redéposer une seconde fois ne dégrade rien, ils réécrivent les mêmes valeurs. En cas de doute sur un patch déjà appliqué, le redéposer est plus sûr que le sauter.

## Étape 0 — prérequis à committer AVANT d'ouvrir le fusionneur

| Fichier | Pourquoi c'est un prérequis |
|---|---|
| `data/pa-taxonomie.json` | le fusionneur y lit les 16 chemins de `blocsStructures.fusionProfonde` ; sans cette version, les blocs `analyse360` et `immatriculationsLiees` sont écrasés au lieu d'être fusionnés en profondeur |
| `merge-plateformes.html` | version portant le mécanisme `_supprimerChamps`, **indispensable au lot 1G** et à `patch-CONTROLE-SIREN.json` qui suppriment des valeurs fausses |
| `js/pa-detail.js` | moteur d'affichage des blocs 360, identité internationale et liaisons |
| `js/pa-hub.js` | facettes du hub, dont `liaisonImmatriculations` et `postureCommerciale` |

Le fusionneur doit être ouvert **depuis l'URL servie du site**, pas en `file://` : il va chercher `./data/plateformes-agreees.json` et `./data/pa-taxonomie.json` en relatif.

## Étape 1 — dépôt des patches, dans cet ordre

| # | Patch | Fiches | Chantier |
|---|---|---|---|
| 1 | `patch-CORRECTIONS-20260822.json` | 1 | correction de format du bloc chiffre d'affaires (rappel du chantier G, idempotent) |
| 2 | `patch-REVISION-BAREME.json` | 11 | révision du barème de centralité à dix fiches (rappel du chantier G, idempotent) |
| 3 | `patch-H2-LIAISONS.json` | 13 | liaisons d'immatriculations — 7 groupes, 15 fiches liées |
| 4 | `patch-H1-LOT1A.json` | 6 | poids économique — CEGID, SAGE, DOXALLIA, SERENSIA, FLOWIE, YOOZ PDP |
| 5 | `patch-H1-LOT1B.json` | 6 | YOOZ, AGICAP, SPENDESK, TENOR, SYMTRAX + liaison ITESOFT/YOOZ PDP |
| 6 | `patch-H1-LOT1C.json` | 6 | TX2, DARVA, ARTEVA, SEPTEO, PENNYLANE, GSPI |
| 7 | `patch-H1-LOT1D.json` | 3 | SEVEN TOPCO, CEGID GROUP, CLAUDIUS FRANCE, UP TO TECH |
| 8 | `patch-H1-LOT1E.json` | 3 | CLAUDIUS FRANCE, LEGORREC CONSULTING, EDICOM France |
| 9 | `patch-H1-LOT1F.json` | 3 | ACCENTURE, PITNEY BOWES, IOPOLE |
| 10 | `patch-H1-LOT1G.json` | 11 | OPEN BEE, DOCOON, FREEDZ, AVALARA, AXELOR, TAXERA, WEPROC, EdiEyes, ESALINK + **2 faux positifs supprimés** (CLEARTAX, ESI) |
| 11 | `patch-CONTROLE-SIREN.json` | 6 | contrôle d'identité de masse — 6 dirigeants faux supprimés, identités rétablies (ESI, INFOLOGIC, INDY, N2F PDP, CECURITY) |
| 12 | `patch-RECUP-SIREN.json` | 10 | récupération de SIREN par mentions légales — ATGP, AXONAUT, TRESO2, SEQINO, OfficeIn, GROUPE SIGMA, AGENA 3000, iPaidThat, LUNDI MATIN, Dougs |
| 13 | `patch-PAYS-16.json` | 16 | qualification du pays des 16 fiches sans pays — 13 pays établis, 6 SIREN nouveaux |

**95 lignes de fiches au total**, sur environ 70 fiches distinctes (plusieurs patches enrichissent la même fiche à des étages successifs : c'est voulu, et c'est pour cela que l'ordre compte).

Les étapes 10 et 11 **suppriment** des valeurs : le compteur « suppressions » du récapitulatif de fusion doit afficher 2 pour le lot 1G et 1 pour le contrôle SIREN. S'il affiche 0, c'est que `merge-plateformes.html` n'a pas été mis à jour à l'étape 0.

## Étape 2 — après la fusion

1. Télécharger le `data/plateformes-agreees.json` produit par le fusionneur et le committer.
2. Committer les fichiers Markdown du dossier `Info IA/plateformes-agreees/`.
3. Reste à faire hors patch : corriger `_meta.couverture.note`, qui annonce encore 44 entités étrangères. Décompte réel après cette série : **114 françaises, 46 étrangères, 3 non établies**.

## Contrôle rapide après fusion

| Indicateur | Valeur attendue |
|---|---|
| Entrées au total | 163 |
| Fiches avec un bloc `analyse360` | 51 |
| Fiches avec un SIREN | 85 |
| Fiches sans `pays` | 3 (Basikon, FACTUREAPP, MY-EDDY) |
| Liaisons d'immatriculations | 15 fiches, 7 groupes |
| Dirigeants nommés sans SIREN d'ancrage | 0 |
