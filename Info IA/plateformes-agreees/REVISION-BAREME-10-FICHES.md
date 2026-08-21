# Révision du barème de centralité — après dix fiches

**Date :** 21/08/2026 · **Auteur :** RFE_WebSite
**Patches :** `patches/patch-REVISION-BAREME.json`, `patches/patch-G-TRADESHIFT.json`, `patches/patch-G-GENERIX.json`

---

## 1. Le problème

Après dix fiches, l'indice de centralité était devenu inutile :

| Indice | Avant révision |
|---|---|
| 4 — cœur de métier | 0 |
| 3 — axe stratégique | **7** |
| 2 — extension naturelle | 3 |
| 1 — activité annexe | 0 |
| 0 — conformité défensive | 0 |

Une échelle à cinq crans qui n'en utilise que deux ne classe rien. Et le premier réflexe — redescendre arbitrairement quelques fiches pour « étaler » la distribution — aurait été malhonnête : chaque indice était justifié par son faisceau.

## 2. La cause : deux questions dans un seul chiffre

La relecture comparée des dix faisceaux a fait apparaître que l'indice mélangeait **deux questions indépendantes** :

1. **Quelle place l'activité agréée occupe-t-elle dans l'entreprise ?** — c'est la centralité.
2. **Comment cette entreprise vend-elle cette activité ?** — c'est autre chose.

Le mélange se voyait à l'œil nu sur trois cas :

- **ITESOFT** et **PARAGON** étaient tous deux à 3, pour des raisons qui n'ont rien en commun : Itesoft parce que la facture est son métier depuis 1995 ; Paragon parce qu'il a construit un site dédié, une marque et un canal de gros auprès des éditeurs.
- **GENERIX** était à 2 alors qu'elle présente une marque dédiée *et* un socle revendu à un tiers — deux critères qui avaient contribué à justifier un 3 chez Esker et Paragon. Tension signalée dès la vague 1, jamais résolue.

**Ces deux profils ne se combattent pas de la même manière.** Contre un acteur dont la facture est le métier, on discute de profondeur fonctionnelle. Contre un grossiste de socle, on découvre en cours de route qu'il est déjà dans l'appel d'offres sous le nom d'un autre. Les confondre dans un même chiffre fait perdre l'essentiel.

## 3. La correction : une seconde facette, orthogonale

**Aucun indice n'est déplacé.** La question de la distribution sort de l'indice et reçoit une facette propre : **`postureCommerciale`**, filtrable dans le hub, avec quatre valeurs plus une valeur d'abstention.

| Valeur | Définition | Enjeu commercial |
|---|---|---|
| **`grossiste`** | Le socle agréé est distribué à des tiers qui le revendent **sous leur propre marque** | On peut l'affronter **sans que son nom apparaisse** dans l'appel d'offres |
| **`canal_indirect`** | Vente via partenaires, intégrateurs ou cabinets, **marque conservée** | Il arrive porté par un cabinet de conseil, pas par un cycle de vente direct |
| **`conquete_directe`** | Vitrine et moyens propres pour gagner **au-delà de la base installée** | Adversaire frontal, rencontré en compétition ouverte |
| **`base_installee`** | Offre proposée d'abord aux clients existants, pas de dispositif de conquête observable | Redoutable en **défense** sur ses comptes, peu menaçant ailleurs |
| **`non_qualifie`** | Preuves insuffisantes | Aucune lecture publiée |

Deux axes indépendants, donc vingt combinaisons possibles au lieu de cinq crans. **Onze fiches en occupent déjà six.**

## 4. Le résultat

| Société | Centralité | Posture commerciale |
|---|---|---|
| ESKER | 3 — axe stratégique | **grossiste** |
| PARAGON | 3 — axe stratégique | **grossiste** |
| GENERIX Group | 2 — extension naturelle | **grossiste** |
| BASWARE | 3 — axe stratégique | **canal indirect** |
| ITESOFT | 3 — axe stratégique | conquête directe |
| SERES | 3 — axe stratégique | conquête directe |
| MEDIUS | 3 — axe stratégique | conquête directe |
| TRADESHIFT BABELWAY | 3 — axe stratégique | conquête directe |
| GEP | 2 — extension naturelle | base installée |
| TESSI Technologies | 2 — extension naturelle | base installée |
| PAYFLOWS | 2 — extension naturelle | *non qualifiée* |

**La tension Generix est résolue sans retouche** : sa marque dédiée et son socle revendu relevaient de la posture, non de la centralité. Elle reste à 2 — l'activité est bien périphérique dans une maison de supply chain — mais elle est désormais signalée comme **grossiste**, ce qui est l'information réellement opérationnelle : on peut affronter le socle Generix sous le nom d'Applium.

**Trois grossistes sur onze fiches.** C'est le chiffre le plus important de cette révision. Un quart des concurrents documentés peuvent se présenter sous un autre nom, et le motif était invisible avant qu'on lui donne un champ.

**Règle appliquée à compter de ce patch :** les signaux de distribution qui figurent dans les faisceaux d'indices existants **restent affichés comme preuves** mais **ne comptent plus comme critères de centralité**. Aucun faisceau n'est réécrit : la preuve garde sa valeur, seul son usage change.

**PAYFLOWS est laissée `non_qualifie`**, délibérément. Aucune vitrine, aucun parcours partenaires, pas même une page sur la réforme française. Mais l'absence de vitrine ne prouve pas une posture de base installée : c'est une société récente qui a déjà gagné des affaires en conquête. Ranger un concurrent par défaut serait exactement le genre de facilité que le modèle doit interdire.

## 5. Anomalie de procédure corrigée : le pilote Generix n'était pas sur le site

En vérifiant la répartition, un fait est apparu : **GENERIX ne portait aucun bloc `analyse360`.** Le pilote de méthode existait — cinq pages documentées le matin même — mais il n'avait jamais été converti en patch. Le travail était fait, la fiche du site était vide.

C'est le symptôme exact de ce que tu signalais : produire de la documentation interne n'est pas publier sur le site. **`patch-G-GENERIX.json` corrige cela sans introduire aucune donnée nouvelle** : il reprend strictement les faits, indices et lectures du pilote.

**Règle à retenir : toute analyse produite se termine par un patch, sinon elle n'existe pas.**

## 6. La dixième fiche : TRADESHIFT BABELWAY

Choisie pour éprouver la borne haute de l'échelle sur un réseau d'échange international. **Indice 3**, posture conquête directe.

**Quatrième cas du motif « agrément porté par une filiale acquise ».** L'adresse DGFiP, code postal 1348, est le Chemin du Cyclotron à Ottignies-Louvain-la-Neuve — siège historique de **Babelway**, société belge rachetée par Tradeshift. Un groupe d'origine danoise, implanté aux États-Unis, a donc fait porter l'agrément par son entité belge acquise, exactement comme GEP par sa filiale finlandaise.

Éléments notables :

- **Air France** est la référence la mieux établie du référentiel à ce jour : nommée par l'éditeur, sur l'offre agréée, présente en production dans l'Annuaire, et co-animatrice d'un webinaire de démonstration le 17/11/2025 ;
- investissement français daté et démontrable : équipes mobilisées plus d'un an avant l'immatriculation, poste de marketing produit affecté à la conformité, page dédiée dès le 12/01/2026 ;
- point d'accès Peppol certifié **depuis 2014** — douze ans d'antériorité sur l'interopérabilité réglementée ;
- la porte d'entrée est **technique** : la valeur mise en avant est l'intégration et la transformation de formats via le middleware Babelway, ce qui déplace la conversation vers la DSI plutôt que vers la direction financière ;
- signal à suivre sans le surinterpréter : **retrait annoncé de la coentreprise SemFi constituée avec HSBC** (revenus déclarés 1,1 M$). Un groupe ayant levé plus d'un milliard de dollars mais qui resserre son périmètre, avec une entité immatriculée estimée entre 50 et 200 personnes. La question à poser en soutenance est celle des moyens durablement affectés au mandat français, et de leur localisation.

## 7. Ce que la nouvelle grille rend possible

Croiser les deux axes produit des lectures que l'indice seul ne donnait pas :

- **centralité forte + grossiste** (Esker, Paragon) → le concurrent le plus difficile à cartographier, car il se démultiplie sous d'autres marques ;
- **centralité forte + conquête directe** (Itesoft, Medius, Seres, Tradeshift) → adversaire frontal, identifiable, affronté à visage découvert ;
- **centralité faible + base installée** (Tessi, GEP) → à ne pas craindre en conquête, à ne pas sous-estimer en défense sur leurs comptes ;
- **centralité faible + grossiste** (Generix) → cas le plus traître : peu investi sur le sujet, mais présent dans les appels d'offres sous un autre nom.

## 8. Suite

Le barème est stabilisé sur deux axes. Reprise du cercle 0 : **BC SOLUTIONS, CEGEDIM, DIGITAL TECHNOLOGIES, DOCPROCESS, MySupply Aps, TUNGSTEN AUTOMATION FRANCE, VENTYA**, plus **LUCCA**.

Priorité proposée : **TUNGSTEN AUTOMATION FRANCE** et **DOCPROCESS**. La première est l'ex-Kofax, donc un probable cinquième cas du motif « filiale acquise » ; la seconde est un acteur roumain implanté en France, utile pour tester une nouvelle fois le rapport entre entité immatriculée et groupe.
