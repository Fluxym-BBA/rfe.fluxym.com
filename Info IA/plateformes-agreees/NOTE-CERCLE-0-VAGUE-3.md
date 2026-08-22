# Cercle 0 — vague 3 : TUNGSTEN AUTOMATION FRANCE et DOCPROCESS

**Date de relevé : 22/08/2026** — Auteur : RFE_WebSite — Chantier G (analyse 360), lot G1d, fiches 11 et 12.
Patches produits : `patches/patch-G-TUNGSTEN.json`, `patches/patch-G-DOCPROCESS.json`, `patches/patch-CORRECTIONS-20260822.json`.

---

## 1. Ce que cette vague apporte

Deux fiches, et une découverte structurelle qui dépasse les deux sociétés.

| | TUNGSTEN AUTOMATION FRANCE | DOCPROCESS |
|---|---|---|
| Indice de centralité | **2 — extension naturelle** (confiance moyenne) | **2 — extension naturelle** (confiance moyenne) |
| Posture commerciale | **base installée** (confiance faible) | **conquête directe** (confiance moyenne) |
| CA de l'entité française | **27,2 M€** (2024, comptes déposés), −6,2 % | **1,26 M€** (2025, comptes déposés), −5,2 % |
| Résultat net | **−43,5 k€** en 2024, après 3 exercices bénéficiaires | **−40,9 k€** en 2025 |
| Effectif entité | 20 à 49 (INSEE 2023) | 10 à 19 (INSEE 2023) |
| Actionnaire | Clearlake Capital + TA Associates (fonds), depuis 07/2022 | Groupe **AGENA3000** (industriel français), depuis le **17/09/2025** |
| Origine de l'activité agréée | **achetée** : réseau ex-OB10 racheté à Tungsten Corporation (06/2022, 53,7 M£) | **native** : échange de documents B2B depuis 2005 |

Les deux fiches cassent enfin la compression du barème sur les valeurs 2 et 3 par le bas : ce sont les deux premières
sociétés du cercle 0 dont l'entité française est **en perte sur son dernier exercice connu**.

---

## 2. TUNGSTEN AUTOMATION FRANCE — l'activité a été achetée, pas construite

**Une variante du motif d'acquisition.** Jusqu'ici le référentiel avait relevé quatre cas d'« agrément porté par une
filiale acquise » (GEP/OpusCapita, Tradeshift/Babelway, Generix partiellement, hypothèse Medius). Tungsten est un
cinquième cas, mais **différent** : ce n'est pas l'agrément qui a été hérité, c'est le **métier**. Le réseau de
facturation électronique vient du rachat de Tungsten Corporation — société cotée à Londres, ex-OB10, dont c'était
l'objet unique — par Kofax en juin 2022 pour 53,7 M£. L'agrément, lui, est porté par la filiale commerciale française
historique, créée le 03/02/1997 sous le nom Kofax France, renommée en janvier 2024 après le changement de dénomination
du groupe.

**Conséquence de méthode.** La question utile n'est plus « qui porte l'agrément ? » mais **« les équipes qui faisaient
tourner le réseau sont-elles encore là ? »**. C'est une question de soutenance, pas un jugement, et elle est légitime
sur un actif racheté puis intégré à un catalogue de dix-huit acquisitions.

**Conséquence sur le chantier SIREN.** Deux changements de dénomination expliquent l'échec des recherches par nom
commercial : le nom déposé était Kofax France. Cela confirme la cause racine identifiée dans `NOTE-RADAR-ET-SIREN.md`
(la DGFiP publie des noms commerciaux, SIRENE indexe des dénominations légales) et ajoute un cas : **les sociétés
renommées à la suite d'un changement de marque de groupe**.

**Le décalage entre le discours mondial et le mandat français.** Veille de conformité annoncée sur plus de 140 pays,
mais côté France : aucune vitrine consacrée au dispositif, aucune marque dédiée, aucune référence nommée sur l'offre
agréée, et une page produit qui parlait encore de **« Plateforme de Dématérialisation Partenaire (PDP) immatriculée »**
au 22/08/2026, huit mois après le changement d'appellation officielle. L'entité immatriculée est par ailleurs
enregistrée sous un **code de commerce de gros (46.51Z)** : c'est une filiale de vente, qui revend en France un
catalogue conçu ailleurs. D'où l'indice 2, malgré un métier parfaitement légitime.

**Trajectoire financière.** 24,2 M€ (2021) → 24,2 M€ (2022) → 29,0 M€ (2023) → **27,2 M€ (2024)**, et un résultat qui
passe de +823 k€ à **−43,5 k€**. Fonds propres 6,98 M€. C'est le premier retournement documenté sur un concurrent
frontal du cercle 0.

**Horizon actionnarial.** Détenu par Clearlake Capital et TA Associates depuis juillet 2022 (rachat auprès de Thoma
Bravo), avec une sortie évoquée publiquement par la direction du groupe à l'horizon 2027. À mentionner comme fait daté,
jamais comme pronostic.

---

## 3. DOCPROCESS — la holding « non transparente » livre son nom, et il change la lecture du marché

La fiche portait `relationCapitalistique: holding_non_transparente` et un `groupeCapitalistique: DocProcess` : deux
personnes morales, CENTAURUS GROUP et STI, étaient inscrites comme dirigeantes sans que leurs bénéficiaires soient
établis. **C'est résolu.**

Le **17 septembre 2025**, DocProcess a été rachetée par le groupe français **AGENA3000** (Cholet), éditeur EDI, PIM et
TPM de plus de 250 salariés présent dans cinq pays, dont une usine logicielle en Tunisie. L'opération marque la sortie
**complète** du fonds roumain Morphosis Capital et des fondateurs Daniela et Liviu Apolozan. Les holdings
CENTAURUS DEVELOPPEMENT (SIREN 801439985) et STI (SIREN 490523891) sont celles du groupe, et Sébastien Trichet, son
président, apparaît bien dans les dirigeants de l'entité française.

**Le fait qui compte : le groupe porte deux plateformes agréées.**

| Immatriculation | Entrée du référentiel | Posture |
|---|---|---|
| **11/12/2025** | AGENA 3000 (marque A3 E-INVOICING) | **grossiste de socle** — marque blanche et marque grise, programme éditeurs |
| **15/12/2025** | DOCPROCESS | conquête directe |

Quatre jours d'écart, deux immatriculations, un seul groupe — dont l'une revendue sous la marque de tiers. En
consultation, cela signifie qu'un même groupe peut se présenter sous **au moins trois noms** : DocProcess,
A3 E-INVOICING, ou la marque de l'éditeur qui revend le socle.

**Poids économique.** Entité française : 1,33 M€ (2024) → **1,26 M€ (2025)**, −5,2 %, perte de 40,9 k€, fonds propres
enfin repassés en positif à 233 k€ après trois exercices négatifs, **87,5 % du chiffre d'affaires absorbé par les
charges de personnel**, aucun chiffre d'affaires à l'export. C'est une structure de R&D et de vente adossée au groupe,
pas un centre de profit autonome. Périmètre DocProcess avant rachat : plus de 4,2 M€ de CA et 1,1 M€ d'EBITDA en 2024
pour 43 salariés (communiqué du fonds sortant). Repère sur l'acquéreur, qui ne publie pas de comptes consolidés :
AGENA 3000 DATA MANAGEMENT a déposé 13,6 M€ de CA et 1,95 M€ de résultat net en 2024.

**Ce qui en fait un angle mort au sens de Bruno.** Le terrain de DocProcess n'est pas la facture, c'est la chaîne
distribution et biens de consommation : commandes, avis d'expédition, catalogues produits, rapprochement à trois ou
quatre voies, avec Carrefour, Unilever, Mondelez, Lactalis, Coca-Cola, Intersport France, Altex, Flanco, eMag au
tableau de références — pour l'essentiel roumaines. L'argument n'est pas « nous sommes agréés » mais « nous automatisons
déjà tout ce qui entoure la facture ». C'est précisément l'angle par lequel on perd un dossier sans jamais avoir parlé
de conformité. Ajouter à cela une base de coûts roumaine et tunisienne : la **capacité à casser un prix est
structurelle**, pas conjoncturelle.

**Deux faiblesses opposables**, sourcées : l'entité française est en recul et en perte sur 2025 ; et le site français
présentait encore le 22/08/2026 la société comme **« candidate pour devenir PDP »**, huit mois après une immatriculation
définitive obtenue le 15/12/2025.

---

## 4. Règle 21 — un groupe peut porter plusieurs immatriculations

La découverte AGENA3000 / DOCPROCESS a fait chercher les autres cas. Le référentiel en contient **au moins quatre**,
sans qu'aucun ne soit signalé comme tel :

| Groupe | Immatriculations portées |
|---|---|
| **AGENA3000** | AGENA 3000 (11/12/2025) + DOCPROCESS (15/12/2025) |
| ~~Tessi (HLD)~~ | ~~TESSI Technologies + LE VILLAGE CONNECTE~~ — **FAUX, corrigé le 22/08/2026 après-midi** : Le Village Connecté est une alliance RCA + ACD + Coaxis, Tessi n'y est que partenaire technique (voir `RECENSEMENT-GROUPES.md`) |
| **EDICOM** | EDICOM France + EDICOM Group |
| **Visma** | CHAINTRUST by Visma + MySupply Aps |

Ce n'est ni une anomalie ni un doublon : ce sont des immatriculations distinctes, sur des entités distinctes, souvent
avec des cibles différentes (une offre grands comptes et une offre volume, ou une offre en propre et un socle de gros).
Mais cela a trois conséquences directes :

1. **Le nombre d'entrées du référentiel n'est pas le nombre d'acteurs.** 163 entrées, moins de 163 groupes.
2. **Le risque de rationalisation est réel** et doit être exposé comme risque, pas comme prédiction : quand un groupe
   détient deux agréments, l'un des deux peut être fermé, migré ou fondu dans l'autre. C'est un sujet de soutenance
   pour un client qui choisit sa plateforme pour dix ans.
3. **Un même socle peut se présenter sous plusieurs noms dans une même consultation**, ce qui est la version aggravée
   du constat des trois grossistes (Esker, Paragon, Generix) fait à la révision du barème.

**Correction du 22/08/2026 (après-midi)** : le recensement a été fait (voir `RECENSEMENT-GROUPES.md`). Il a confirmé quatre groupes et **infirmé le cas Tessi**, exactement pour la raison annoncée ci-dessous. Deux groupes supplémentaires ont été trouvés : le groupe Crédit Agricole (marque Kolecto) et Docoon.

**Action programmée puis exécutée** (chantier transversal, une passe) : parcourir les 163 entrées, regrouper par
`groupeCapitalistique` normalisé, et publier le compte réel de groupes distincts. Le comptage automatique fait ce jour
sur une liste de mots-clés est un sondage, pas un recensement.

---

## 5. Points laissés ouverts

- **SIREN d'AGENA 3000 : volontairement non renseigné.** Deux entités du groupe sont domiciliées à l'adresse publiée
  par la DGFiP (88 rue du Paradis, Cholet) : AGENA 3000 DATA MANAGEMENT (824561450, traitement de données et
  hébergement) et AGENA 3000 ERP (880231014, édition de logiciels). La première est la plus plausible pour porter une
  plateforme d'échange, **aucune pièce ne le prouve**. À trancher sur les mentions légales de la vitrine A3 E-INVOICING.
  Décision 3 : un SIREN faux est pire qu'un SIREN absent.
- **Tungsten : programme partenaires sur l'offre agréée.** Non trouvé. Le modèle historique de Kofax reposait
  largement sur un réseau de revendeurs et l'entité française est immatriculée en commerce de gros : si un programme
  partenaires portant sur l'offre agréée est documenté, la posture passe de « base installée » à « canal indirect ».
  C'est la posture la moins bien étayée des douze fiches.
- **Chiffre d'affaires du groupe Tungsten Automation** : non publié, estimations d'agrégateurs écartées (règle 11d).
- **Comptes de l'entité roumaine DocProcess** et **comptes consolidés du groupe AGENA3000** : non consultés.
- **Articulation annoncée entre les deux plateformes agréées du groupe AGENA3000** : aucune communication trouvée.
- **Avis publics agrégés** et **volume d'offres d'emploi** : rien pour les deux sociétés, conformément à la règle 19
  (passe unique à date fixe sur toute la cohorte, non encore réalisée).

---

## 6. Reste du lot G1d

Traités : TUNGSTEN AUTOMATION FRANCE, DOCPROCESS.
Restent, par ordre de priorité proposé : **VENTYA**, **BC SOLUTIONS**, **DIGITAL TECHNOLOGIES**, **CEGEDIM**,
**MySupply Aps** (à croiser avec CHAINTRUST by Visma, même groupe — traiter les deux dans la même passe au titre de la
règle 21), puis **LUCCA**.
