# Cercle 0 — vague 4 : VENTYA, BCSolutions et CEGEDIM

**Date de relevé : 22/08/2026** — Auteur : RFE_WebSite — Chantier G (analyse 360), lot G1e, fiches 13 à 15.
Patches produits : `patches/patch-G-VENTYA.json`, `patches/patch-G-BCSOLUTIONS.json`, `patches/patch-G-CEGEDIM.json`.
Patches **corrigés** et à refusionner : `patches/patch-G-TUNGSTEN.json`, `patches/patch-G-DOCPROCESS.json`.

---

## 1. Tableau de la vague

| | VENTYA | BCSolutions | CEGEDIM |
|---|---|---|---|
| Centralité | **3 — axe stratégique** (moyenne) | **3 — axe stratégique** (moyenne) | **2 — extension naturelle** (haute) |
| Posture | conquête directe | **grossiste** | base installée |
| CA de l'entité | **7,18 M€** (2025), −5,4 % | **3,67 M€** (2024), +18,2 % | non publié pour l'entité opératrice |
| CA du groupe | 37,5 M€ déclarés (Everwin) | sans objet | **649,2 M€** (2025) |
| Résultat net | +619 k€, en hausse depuis 4 exercices | +246 k€ après 1,1 k€ en 2023 | non repris dans cette passe |
| Actionnaire | **Constellation Software** (TSX : CSU) via Harris et Everwin | trois gérants, indépendante | Euronext Growth (ALCGM) |
| Marque de l'offre | Clear'Invoice | eas'Invoice | SY business |

---

## 2. VENTYA — la plateforme « 100 % française » d'un groupe coté canadien

La société se présente comme une plateforme « pensée, développée et opérée en France », et c'est vérifiable dans ses
comptes : **16,4 k€ d'export sur 7,18 M€**, tout est produit et exploité en France. L'argument de souveraineté est donc
solide sur le fond.

La chaîne de détention l'est moins souvent citée. VENTYA SAS est présidée depuis le **13/04/2022** par **EVERWIN**
(SIREN 400208435, Étampes, 20,7 M€ de CA et 143 salariés en 2025), elle-même présidée par **HARRIS FRANCE**
(SIREN 887500536), et le groupe Everwin déclare sur son propre site être détenu à 100 % par **le groupe Harris,
filiale de CONSTELLATION SOFTWARE INC. (Toronto, TSX : CSU), 45 000 collaborateurs et plus de 8,5 Md$ de chiffre
d'affaires**. Ventya était la **troisième acquisition française** de Harris.

Ce n'est pas un reproche, c'est un fait daté, et il vaut d'être connu pour deux raisons. D'abord parce qu'il ruine toute
opposition simpliste entre acteurs français et acteurs étrangers dans une soutenance. Ensuite parce que le modèle de cet
acquéreur est documenté et cohérent : acheter des éditeurs de niche, ne jamais les revendre, tenir la marge. La
trésorerie de Ventya passée de 1,97 M€ à 891 k€ sur le dernier exercice **sans dégradation du résultat** est compatible
avec une remontée de trésorerie vers la mère — mouvement usuel dans ce type de groupe, non confirmé par une pièce, donc
présenté comme tel.

Reste un signal à interroger : dans un marché tiré par l'échéance réglementaire, le chiffre d'affaires **recule de
5,4 %** en 2025 (7,59 → 7,18 M€), même si le résultat progresse pour la quatrième année. Et la page de références du
site renvoie une **erreur 404** : aucun client nommé n'est publiable. Son terrain de chasse est en revanche très lisible :
assurance, assistance, dépannage, location de véhicules, voyage d'affaires — des filières où la facture arrive par la
chaîne métier et non par la direction financière.

---

## 3. BCSolutions — un SIREN de plus, un dirigeant erroné en moins, et un grossiste de plus

**Le SIREN manquant est trouvé** : la dénomination légale est **BUSINESS COMMUNICATION SOLUTIONS** (SIREN 445023427,
SARL, Aix-en-Provence, créée le 01/02/2003), invisible sous le nom commercial « BCSolutions » publié par la DGFiP.
Nouvelle confirmation de la cause racine du chantier SIREN.

**Correction plus gênante** : la fiche portait un dirigeant erroné, « CARREIRA DE MATOS BRUNO », vestige d'un
rapprochement automatique sur une homonymie du nom commercial. Les trois gérants réels, en fonction depuis le
01/10/2012, le remplacent. À retenir comme avertissement méthodologique : **un rapprochement automatique sur un nom
commercial ne produit pas seulement des trous, il produit aussi des faux**, et les faux sont plus dangereux que les
trous. Cela justifie de repasser derrière les fiches enrichies par API dont le SIREN est resté vide mais dont d'autres
champs d'identité sont pourtant renseignés.

**Économie** : 3,45 M€ (2022) → 3,10 M€ (2023, −10,1 %) → **3,67 M€ (2024, +18,2 %)**, résultat net 137 k€ → 1,1 k€ →
246 k€. Rentable mais étroit, et surtout **396 k€ de fonds propres** : c'est peu pour porter dix ans d'obligations
réglementaires évolutives. Charges de personnel à 42,1 % du chiffre d'affaires et marge brute supérieure au chiffre
d'affaires : structure d'intégrateur, où une part du chiffre est de la revente.

**Posture grossiste**, quatrième du référentiel après Esker, Paragon et Generix : la société adresse explicitement les
éditeurs d'ERP et de solutions métiers — « intégrez simplement la facturation électronique dans votre solution » — par
interfaces de programmation. Réserve honnête : les termes de marque blanche ou grise ne sont pas employés, d'où une
confiance moyenne.

À signaler aussi : partenaire **OpenText** (dont le module Vendor Invoice Management pour SAP) et **Sovos**. Une même
consultation peut donc faire apparaître plusieurs noms sans que le client perçoive qui porte réellement l'obligation.
Et la société annonce deux sites, **Aix-en-Provence et Casablanca** : une partie de la production est délocalisée, ce
qui éclaire à la fois sa maîtrise des coûts et ses 338 k€ d'export.

---

## 4. CEGEDIM — premier cas du référentiel où la ventilation par activité est réellement publiée

C'est l'apport méthodologique de la vague. Cegedim SA est cotée sur Euronext Growth et publie son chiffre d'affaires
par division **et par segment** :

| Exercice 2025 | M€ |
|---|---|
| Logiciels et services | 292,7 |
| **Flux** (division) | **106,4** (+6,1 %) |
| — dont **e-business** | **62,9** (+7,6 %) |
| — dont tiers payant | 43,5 |
| Données et marketing | 127,8 |
| Externalisation de processus | 83,6 |
| Infogérance et support | 38,7 |
| **Total** | **649,2** (−0,8 % publié, +1,1 % organique) |

Le champ `ventilationParActivite.disponible` passe donc à **vrai pour la première fois** en quinze fiches. Mieux : la
communication financière du groupe attribue elle-même la croissance de l'e-business au « **segment Facture & Achat en
France à l'approche de la première phase de la réforme** ». C'est la première fois qu'un acteur du référentiel écrit
noir sur blanc, dans un document financier, que la réforme fait croître son activité.

**Ce que la règle interdit toujours** : le segment e-business (62,9 M€, soit 9,7 % du groupe — rapport de deux chiffres
publiés, pas une estimation) contient d'autres activités que la facturation électronique française. La part de
l'activité agréée elle-même n'est pas publiée et **n'est pas estimée**.

**Indice 2, arbitré par l'étalon unique.** Les signaux d'investissement sont sérieux : marque dédiée SY business, entité
opératrice de plus de 2 000 collaborateurs, immatriculation définitive le **11/12/2025**, participation au **pilote de
l'AIFE avec plus d'une vingtaine de clients**, hébergement en France sur infrastructures propres, statut revendiqué de
**premier remettant de factures sur Chorus Pro**. Le dossier est à la frontière du 3. Il est tranché par la comparaison
avec Tessi — entité de 38,7 M€ dans un groupe de 545,7 M€, marque dédiée, classée 2 — dont le rapport est du même
ordre. Même étalon, même indice.

**Précision d'entité** : l'immatriculation est publiée au nom de **CEGEDIM** (SIREN 350422622, la société cotée), alors
que l'offre est portée par **Cegedim Business Services** sous la marque SY business. Le mandat est logé au sommet du
groupe, non isolé dans une entité dédiée.

---

## 5. Défaut d'affichage corrigé — et pourquoi il faut refusionner deux patches

En préparant cette vague, un écart de format a été détecté sur les patches de la vague 3 : les blocs `caGroupe` et
`caEntiteFrancaise` y étaient exprimés **en euros sous la clé `valeur`**, alors que l'affichage attend un **montant en
millions sous la clé `montantMEUR`**. Conséquence : sur les fiches TUNGSTEN et DOCPROCESS, le chiffre d'affaires ne se
serait pas affiché du tout.

Trois actions :

1. `patch-G-TUNGSTEN.json` et `patch-G-DOCPROCESS.json` sont **relivrés au format canonique** et doivent être
   refusionnés (l'opération est idempotente ; si l'ancienne version a déjà été fusionnée, la nouvelle neutralise
   l'ancienne clé).
2. `js/pa-detail.js` est rendu **tolérant** : il accepte désormais un montant en millions ou en euros, et n'affichera
   plus jamais une case vide à cause d'un écart d'unité.
3. Le même fichier gagne deux améliorations utiles : les **libellés des natures de chiffre** (comptes déposés, chiffre
   déclaré par l'entreprise, communiqué financier, non publié, sans objet) au lieu d'identifiants bruts, et l'affichage
   du **commentaire de trajectoire** sous le montant — c'est là que vivent les quatre exercices consécutifs, qui sont le
   vrai apport du travail sur les comptes déposés et qui n'étaient tout simplement pas rendus.

**Règle 23** : tout nouveau bloc de données doit être vérifié contre le format lu par le moteur d'affichage, pas
seulement contre le modèle documentaire. Une donnée exacte au mauvais format est une donnée absente.

---

## 6. Points laissés ouverts

- **Ventya** : aucune référence client nommée (page 404), aucun avis agrégé, pas de comptes consolidés du groupe
  Everwin (seuls des chiffres déclarés sur son site). Le recul de 5,4 % du chiffre d'affaires 2025 mériterait une
  explication.
- **BCSolutions** : nature exacte du partenariat Sovos sur le périmètre agréé, et marque réellement exposée au client
  final dans le canal éditeurs (grossiste au sens strict, ou intégration sous marque visible ?).
- **Cegedim** : chiffre d'affaires propre de Cegedim Business Services, résultat net du groupe, existence d'un canal
  partenaires sur SY business (la vitrine n'a pas été explorée page par page), acquisitions récentes.
- **Contrôle à programmer** : repasser sur les fiches dont l'identité a été enrichie par API sans SIREN confirmé, pour
  détecter d'autres faux dirigeants du même type que celui de BCSolutions.

---

## 7. Reste du lot G1e

Traités : VENTYA, BCSolutions, CEGEDIM.
Avec les quatorze fiches déjà produites (Esker, Basware, Generix, GEP, Paragon, Seres, Tessi, Itesoft, Medius,
Tradeshift, Payflows, Tungsten, DocProcess, BCSolutions, Cegedim, Ventya — dont Itesoft et Medius hors cercle 0 strict),
il ne reste **deux concurrents frontaux** à traiter : **DIGITAL TECHNOLOGIES** (entité italienne, sans SIREN) et
**MySupply Aps** — cette dernière à traiter dans la même passe que **CHAINTRUST by Visma**, même groupe, au titre de la
règle 21. **LUCCA** suivra, hors cercle 0 depuis la correction de son segment cible.
