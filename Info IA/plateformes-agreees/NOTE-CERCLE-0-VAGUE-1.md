# Cercle 0, première vague — PARAGON, SERES, TESSI

**Date :** 21/08/2026 · **Auteur :** RFE_WebSite
**Patches :** `patches/patch-G-PARAGON.json`, `patches/patch-G-SERES.json`, `patches/patch-G-TESSI.json`

---

## 1. Le tableau que ces trois fiches produisent

| | PARAGON | SERES | TESSI Technologies |
|---|---|---|---|
| Entité immatriculée | PARAGON BUSINESS PROCESS SERVICES | SERES | TESSI TECHNOLOGIES |
| SIREN | 320496789 | 343778163 | 382105823 |
| Groupe | Paragon (Royaume-Uni, non coté) | Docaposte, groupe La Poste | Tessi, détenu par HLD |
| CA de l'entité (comptes déposés) | **18,9 M€** (clos 30/06/2025) | **23,7 M€** (2024) | **38,7 M€** (2024) |
| Tendance sur 3 ans | 21,9 → 18,9 · **−13,7 %** | 27,6 → 23,7 · **−14 %** | 30,2 → 38,7 · **+28 %** |
| Résultat net | **−1,12 M€**, 3e perte de suite | **−2,23 M€** | **+2,4 M€** |
| Effectif | 250-499 (INSEE) | 98, en recul depuis 118 | 159, en hausse depuis 149 |
| CA du groupe | non publié (non coté) | Docaposte : 879 M€ (2024) | 545,7 M€ (déclaré) |
| Marque produit dédiée | **IPP — Invoice Paragon Platform** | e-Facture PA | DIGITAL INVOICE by Tessi |
| Site dédié | **oui**, domaine propre | non | non |
| Canal de gros éditeurs | **oui, documenté** | non | non |
| Références nommées sur l'offre agréée | **22** | 0 | 0 |
| Indice de centralité | **3** (confiance haute) | **3** (confiance moyenne) | **2** (confiance moyenne) |

**Le contraste le plus utile commercialement :** les deux entités qui ont le plus communiqué sur la réforme sont celles qui reculent économiquement ; celle dont l'entité progresse et gagne de l'argent est aussi celle qui investit le moins visiblement sur le sujet.

---

## 2. Deux découvertes méthodologiques

### 2.1. Les comptes déposés au greffe sont accessibles — et ils changent tout

Jusqu'ici, le chiffre d'affaires des entités françaises était traité comme une donnée difficile. Elle ne l'est pas : les comptes annuels déposés au greffe sont republiés et couvrent trois à quatre exercices, avec le résultat net, les fonds propres, l'effectif et parfois la trésorerie.

**Ce que cela apporte, et que rien d'autre ne donne :** une **trajectoire**. Un chiffre d'affaires isolé ne dit rien. « 23,7 M€ après 26,2 puis 27,6 » dit qu'une entreprise se contracte pendant que son marché est en pleine réforme. C'est la donnée la plus discriminante produite depuis le début du chantier.

**Nuance importante à apporter à la règle 11.d du plan de travail.** La règle disait : « les agrégateurs de données d'entreprises ne sont pas une source ». Elle doit être scindée en deux :

- **les republicateurs de comptes déposés** (données du greffe, du registre national des entreprises, de l'INSEE) **sont une source primaire** : ils ne calculent rien, ils republient un document légalement déposé ;
- **les agrégateurs qui estiment** un chiffre d'affaires par modélisation **ne sont pas une source** : c'est ce qui a produit 243,7 M$ pour Generix et un écart de 1 à 2 sur Basware.

Le critère de distinction est simple : le chiffre est-il **déposé** ou **estimé** ? Le champ `caEntiteFrancaise.nature` doit valoir `comptes_deposes` dans le premier cas.

**Conséquence sur le plan de charge :** les 79 plateformes disposant d'un SIREN peuvent voir leur poids économique renseigné de façon fiable, à raison de quelques minutes chacune. C'est le meilleur rapport valeur/effort identifié à ce jour sur le référentiel.

### 2.2. Le barème se comprime autour de 2 et 3 — à surveiller

État après sept fiches :

| Indice | Sociétés |
|---|---|
| 4 — cœur de métier | *aucune* |
| 3 — axe stratégique | ESKER, BASWARE, PARAGON, SERES |
| 2 — extension naturelle | GENERIX, GEP, TESSI |
| 1 — activité annexe | *aucune* |
| 0 — conformité défensive | *aucune* |

Sept fiches sur deux valeurs. Ce n'est pas encore un défaut : la première vague a délibérément visé les concurrents frontaux, c'est-à-dire des sociétés dont on attend justement un engagement fort. Les indices 0 et 1 devraient apparaître avec les 70 plateformes hors cible, et 4 avec les pure players.

**Mais une tension interne est à signaler honnêtement.** Generix a été classée 2 alors qu'elle présente une marque produit dédiée (GIS) *et* un socle revendu à un tiers (Applium) — deux critères qui, chez Esker et Paragon, ont contribué à justifier un 3. La lecture Generix mérite d'être reprise à froid.

**Décision :** ne pas retoucher Generix maintenant, à chaud et au coup par coup. Une **passe de révision du barème sur l'ensemble des fiches** sera faite une fois dix fiches produites, avec relecture comparée des faisceaux d'indices. Rétablir la cohérence sur sept fiches coûte une heure ; sur quarante, c'est un autre chantier.

---

## 3. Ce que chaque fiche apprend

### PARAGON — le meilleur niveau de preuve, la plus grande fragilité

Un site dédié sur domaine propre, une marque produit, 44 cas d'usage, un parcours pour reprendre les clients d'une autre plateforme, un canal de gros assumé auprès des éditeurs, et **22 références nommées sur l'offre agréée elle-même** — un niveau de preuve unique dans le référentiel, où les logos sont partout ceux du catalogue global.

Concentration sectorielle nette : assurance et protection sociale (AG2R La Mondiale, Malakoff Humanis, Agrica), immobilier et construction (Nexity, Les Nouveaux Constructeurs, Vinci, Domitys), services aux entreprises (Gi Group, Intelcia, SGS, Spirit).

En face : 18,9 M€ de chiffre d'affaires en recul de 13,7 %, trois exercices de perte, des fonds propres de 2,28 M€ tombés sous le capital social de 3 M€. **Deux lectures à tenir ensemble** — une agressivité tarifaire est plausible car l'entité a besoin de ces contrats, et la question de la pérennité de l'exploitant sera légitimement posée par un directeur financier prudent.

⚠️ **Piège d'identification à retenir :** PARAGON BUSINESS PROCESS SERVICES (320496789) n'est pas PARAGON TRANSACTION (775722218), autre société française du même groupe dont le chiffre d'affaires est d'un ordre différent. Et le groupe britannique Paragon n'a **aucun lien** avec Paragon ID, société cotée distincte. Trois entités, trois périmètres, un seul nom.

### SERES — la légitimité la moins discutable, la trajectoire la plus préoccupante

Créée en 1988, EDI depuis l'origine, environ 25 ans de facturation électronique, immatriculée en première vague. La plateforme agréée n'est pas une diversification : c'est la forme réglementaire d'un métier exercé depuis trente-huit ans.

L'adossement à **Docaposte** (879 M€, ~6 500 collaborateurs, groupe La Poste) est l'atout décisif : sur un dossier grands comptes ou parapublic, l'argument souveraineté et confiance numérique porte, et aucun indépendant de taille comparable ne peut l'opposer.

Trajectoire inverse : 23,7 M€ en 2024 contre 27,6 M€ en 2022, perte de 2,23 M€, effectif de 118 à 98 salariés. **La puissance à opposer n'est pas celle de Seres mais celle de Docaposte** : c'est le nom du groupe qui sera mis en avant, pas les comptes de la filiale.

Le contrôle d'adresse recommandé par `ANOMALIE-GEP-OPUSCAPITA.md` a été appliqué : l'adresse DGFiP correspond bien au siège au registre. **Aucune anomalie.** Le contrôle fonctionne aussi en négatif.

### TESSI — la plus solide, l'engagement le plus difficile à jauger

Seule des trois dont l'entité progresse (30,2 → 38,7 M€) et gagne de l'argent (+2,4 M€), avec un effectif en hausse, dans un groupe de 545,7 M€ et 14 246 collaborateurs adossé à HLD.

Immatriculation **provisoire dès août 2024** — parmi les tout premiers acteurs positionnés. Mais l'entité pèse ~7 % du groupe, la facturation n'est qu'une de ses lignes, et il n'existe ni site dédié ni canal indirect. D'où l'indice 2 : le seuil non franchi est celui du **canal propre**.

Lecture commerciale : sur la base installée — banque, assurance, santé, où Tessi est historiquement implantée — la position de sortant est forte, la facture arrivant dans le prolongement de flux documentaires déjà externalisés. En dehors, la conquête paraît moins outillée.

---

## 4. Correctifs techniques livrés

`js/pa-detail.js`, deux corrections rendues nécessaires par ces fiches :

1. **`resultatNet` accepte désormais une phrase autant qu'un nombre.** Le rendu appelait systématiquement le formateur d'euros, ce qui aurait affiché « Perte de 1,12 M€… M€ » sur une valeur textuelle. Or la valeur utile ici est une trajectoire sur plusieurs exercices, pas un nombre isolé.
2. **`presenceEnFrance.type` accepte `aucune_identifiee`** en plus de `aucune_connue`. La valeur employée dans le patch GEP n'était pas dans la table de libellés et s'affichait brute. La nuance est réelle et vaut d'être conservée : « aucune entité identifiée » dit qu'une recherche a été menée sans résultat, « aucune entité connue » n'affirme rien.

Rappel : le nom exact du champ de chiffre d'affaires de l'entité est **`caEntiteFrancaise`**, non `caEntite`. Les trois patches ont été corrigés avant livraison.

---

## 5. Suite

10 concurrents frontaux restants au cercle 0 : BC SOLUTIONS, CEGEDIM, DIGITAL TECHNOLOGIES, DOCPROCESS, MySupply Aps, PAYFLOWS *(déjà fait)*, TRADESHIFT BABELWAY, TUNGSTEN AUTOMATION FRANCE, VENTYA, plus MEDIUS, ITESOFT et LUCCA à rattacher.

**Priorité immédiate proposée :** ITESOFT et MEDIUS. Deux concurrents directs sur le poste fournisseurs, invisibles aux filtres de segment faute de `segmentCible`, et MEDIUS porte en outre une anomalie de pays non vérifiée (`France` pour un groupe suédois de Linköping) — c'est le premier test du contrôle d'adresse sur un cas où l'on soupçonne l'anomalie.
