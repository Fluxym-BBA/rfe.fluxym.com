# Chantier H1 — lot 1G : les onze dernières plateformes à SIREN de la cible prioritaire

**Relevé du 22/08/2026.** Septième et dernier lot du chantier H1. Il solde la cible prioritaire définie par
la règle 16 : les plateformes agréées qui adressent les ETI ou les grands comptes **et** disposent d'un SIREN.
Onze fiches traitées : AVALARA, AXELOR, CLEARTAX, DOCOON, DOCOON IMMO / FREEDZ, EdiEyes Vision Care, ESALINK,
ESI, OPEN BEE, TAXERA, WEPROC.

Deux résultats sortent du cadre habituel d'un lot de collecte financière et justifient à eux seuls le lot.

---

## 1. Deux SIREN du référentiel sont de purs faux positifs

C'est le résultat le plus important, et le plus désagréable.

| Fiche | SIREN porté au référentiel | Ce que ce SIREN désigne réellement |
| --- | --- | --- |
| **CLEARTAX** | 491 096 350 | Une société **CLEARTAX** de conseil en gestion (APE 70.22Z), 43-47 avenue de la Grande Armée à Paris, dirigeant Xavier Bontoux, capital 15 000 €, **radiée depuis le 19/06/2019**. Aucun lien avec le groupe ClearTax / Clear. |
| **ESI** | 102 061 702 | **STUDIO 7 ESI**, un salon de coiffure lyonnais immatriculé le **23/01/2026**. Le rapprochement a manifestement été fait sur le sigle. |

Ce n'est pas une donnée manquante, c'est une donnée fausse, et c'est pire : un SIREN erroné ne laisse pas un
champ vide, il fait afficher sur la fiche d'une plateforme agréée l'adresse, l'activité, les dirigeants et les
comptes d'un tiers. Les deux SIREN sont retirés.

**Conséquence outillage.** Le fusionneur rejetait par construction toute valeur vide : une donnée fausse était
donc indéracinable par patch, alors que la règle 14 impose que toute correction passe par un patch. Le
mécanisme **`_supprimerChamps`** est ajouté à `merge-plateformes.html` : un tableau de chemins supprimés
explicitement, journalisés ligne à ligne et comptés dans la synthèse de fusion. `merge-plateformes.html`
livré dans ce lot **doit être commité avant** le patch, sinon les deux suppressions sont silencieusement
ignorées. → règles 48 et 49.

---

## 2. OPEN BEE est en procédure collective, ainsi que sa société de tête

Fait public, sourcé, daté, publié sans pronostic :

- **redressement judiciaire ouvert le 15/09/2025 et clôturé le 05/08/2026** ;
- **jugement du 3 août 2026** prononçant l'ouverture d'une procédure de redressement judiciaire ;
- **DOXSA**, société de tête et présidente d'OPEN BEE FRANCE depuis le 14/12/2023, est elle aussi en
  procédure collective.

Le lien exact entre les deux mentions n'est pas établi : il n'est donc pas interprété. La presse
professionnelle rapporte une crise de trésorerie consécutive au retrait d'un investisseur fin février, et une
société qui mise sur l'IA et la facture électronique pour rebondir en 2026.

Les comptes préparaient le terrain, et c'est là que la lecture financière prend tout son sens : l'exercice
2024 affiche **+40,8 % de chiffre d'affaires** (8,76 M€ après 6,22 M€) **et** le basculement du résultat de
+308 k€ à **−1,05 M€**, avec 4,35 M€ de dettes financières pour 299 k€ d'EBITDA (13 fois), une autonomie
financière ramenée à 20,6 %, 468 k€ de trésorerie et un délai de paiement clients passé de 115 à **178
jours**. C'est le seul dossier du chantier où forte croissance et procédure collective se succèdent
immédiatement. → règle 50.

À noter sur DOXSA : chiffre d'affaires qui s'effondre de 1,03 M€ à 374 k€ entre 2021 et 2023, EBITDA
−1,73 M€, mais **résultat net 2023 de +32,5 M€** et 19,7 M€ de trésorerie — un profit exceptionnel de
cession, cohérent avec la cession de sa participation à Sages Informatique le 30/11/2023, et non un résultat
d'exploitation. Exactement le piège de la règle 36.

---

## 3. Le groupe Docoon : la démonstration de la lecture par groupe

Le référentiel compte deux immatriculations Docoon, déjà reliées au chantier H2. Le lot 1G ouvre les comptes
des trois niveaux et le résultat est spectaculaire.

| Niveau | Entité | CA 2025 | Résultat net | Dettes financières |
| --- | --- | --- | --- | --- |
| Opérationnel | **DPII DOCOON** (338 698 384), *D.P.I.I. - DPII TELECOM ET SERVICES* | **10,6 M€** (−1,2 %) | +420 k€ (4,0 %) | 34,5 k€ |
| Opérationnel | **DOCOON IMMO** (523 445 211), marque *Freedz* | **4,64 M€** (+6,4 %) | +1,09 M€ (**23,5 %**) | 881 k€ |
| Holding | **DOCOON INVEST** (917 412 587) | 900 k€ de produits | +1,23 M€ après −1,32 et −1,23 M€ | **17,6 M€** |

Les deux plateformes sont saines ; **la dette est intégralement portée par la holding**, à 125 fois son
EBITDA. Une lecture du risque limitée aux fiches des plateformes le manquerait entièrement. → règle 51.

La chaîne est ouverte jusqu'à **LBM PARTNER** (793 822 222), président de DOCOON INVEST, niveau au-delà
duquel aucun actionnaire n'est établi (règle 42). DOCOON INVEST dirige aussi **ODYSSEY MESSAGING** : le
périmètre compte au moins trois sociétés opérationnelles, et le total des deux entités immatriculées atteint
**15,2 M€** en 2025 — une somme d'entités, pas un consolidé.

Deux détails qui comptent : DPII DOCOON est une société d'échanges de données créée le **01/08/1986**, pas
une pousse de la réforme ; et son chiffre d'affaires a bondi de **+194 % en 2023** (3,53 M€ → 10,4 M€), une
variation qui ne s'explique pas par une conquête commerciale et signale une opération de périmètre non
documentée à ce stade.

---

## 4. AVALARA : une entité de refacturation, et une filiation Inposia établie au RCS

AVALARA FRANCE réalise **241 k€** de chiffre d'affaires en 2024, dont **229 k€ à l'export (95 %)**, avec des
salaires à 83,5 % du chiffre d'affaires, quatre exercices de pertes et des **fonds propres négatifs
(−79,9 k€)** pour un capital de 315 000 €. Ce n'est pas une société qui vend une plateforme en France, c'est
une entité qui refacture des prestations à son groupe. Aucun dirigeant résident en France depuis le
01/01/2026 ; quatre présidents en deux ans, tous non résidents, le dernier nommé le 06/06/2026 étant
Alexander Baulf.

Surtout, **le premier président inscrit au RCS est INPOSIA SOLUTIONS GMBH**. L'entité française n'a donc pas
été créée pour la réforme : c'est l'ancienne antenne française d'un éditeur allemand de conformité fiscale,
passée sous l'enseigne du repreneur. Le motif « agrément hérité par acquisition d'une filiale spécialisée »
se vérifie dans la chronologie des mandats, pas seulement dans la presse. → règle 52.

---

## 5. Les cinq dossiers opaques : la moitié de la cible prioritaire ne publie rien d'exploitable

| Plateforme | Situation | Nature retenue |
| --- | --- | --- |
| **AXELOR** | 50 à 99 salariés, dépose ses comptes mais **ne restitue pas son chiffre d'affaires** (seule indication : « < 12 M€ » en 2022). Fonds propres passés de 366 k€ à 6,79 M€ en quatre exercices, trésorerie retombée de 5,67 à 2,21 M€ en 2023. | `non_publie` |
| **TAXERA** | **Aucun compte déposé** depuis la création en 2022. Mais une **alerte RNE « capitaux propres inférieurs à la moitié du capital social »** — sur un capital de 3 000 €. → règle 53 | `aucun_compte_depose` |
| **WEPROC** | **Aucun compte déposé** en sept exercices, une alerte, une date de clôture déplacée en octobre 2024 après une ordonnance prorogeant l'AG en avril 2024. Trois mandataires fondateurs nés en 1993, 1 à 2 salariés. | `aucun_compte_depose` |
| **EdiEyes Vision Care** | Dépôt sous **confidentialité partielle** : pas de chiffre d'affaires. Dernier exercice clos le **31/10/2022**, trois exercices manquants. Fonds propres tombés de 706 à 181 k€ après deux exercices à −258 et −256 k€. | `comptes_confidentiels` |
| **ESALINK** | Chiffre d'affaires ×6,6 en trois ans (334 k€ → 2,21 M€) mais **dernier dépôt 2023** : les deux exercices qui précèdent l'échéance manquent. Marge nette érodée de 29,4 % à 6,5 %, trésorerie de 547 à 174 k€, délai clients de 51 à 96 jours. | `comptes_deposes` (2023) |

**Sur onze plateformes de la cible prioritaire, quatre seulement livrent un chiffre d'affaires récent et
fiable** : DPII DOCOON, DOCOON IMMO, OPEN BEE et AVALARA FRANCE. C'est un enseignement sur le référentiel
autant que sur ces sociétés.

---

## Rattachement capitalistique — sept requalifications

| Plateforme | Avant | Après | Motif |
| --- | --- | --- | --- |
| AVALARA | *(vide)* | `filiale_de_groupe` | chaîne des mandats jusqu'à Inposia / Avalara |
| AXELOR | *(vide)* | `non_determinable` | aucun actionnaire établi ; hausse des fonds propres non expliquée |
| DOCOON | `holding_non_transparente` | `filiale_de_groupe` | holding identifiée : DOCOON INVEST, puis LBM PARTNER |
| EdiEyes Vision Care | `non_determinable` | `independante` | gérant personne physique unique depuis 2015 |
| ESALINK | `non_determinable` | `filiale_de_groupe` | holding EsaLink Group (953 718 855) |
| OPEN BEE | `non_determinable` | `filiale_de_groupe` | DOXSA, puis DOXENSE EUROPE |
| TAXERA | `non_determinable` | `filiale_de_groupe` | entité suisse du groupe déjà rattachée à la fiche |
| WEPROC | `non_determinable` | `independante` | trois fondateurs personnes physiques |

Aucune requalification ne dégrade une qualification plus fine préexistante. Les tranches d'effectif du
référentiel sont **conservées** pour DOCOON et DOCOON IMMO, où l'INSEE donne 10 à 19 salariés contre 20 à 49
dans la fiche : l'écart est de millésime, pas de fond, et n'est pas tranché ici.

---

## Simulation de fusion

11 fiches touchées, **7 écrasements** tous intentionnels et documentés ci-dessus, **2 suppressions de champ**
(les deux SIREN faux), **0 rejet** de nom. Toutes les valeurs de facettes ont été vérifiées contre
`data/pa-taxonomie.json` : `relationCapitalistique` et les sept natures de chiffre d'affaires sont valides.

## État du chantier H1

**Cible prioritaire close.** Sept lots, 1A à 1G, **32 plateformes traitées**, **51 fiches** portant un bloc
`analyse360`, règles 30 à 53 issues du chantier. Toutes les plateformes à SIREN ciblant l'ETI ou les grands
comptes sont désormais traitées.

## Reste à faire, dans l'ordre

1. **Retrouver les deux SIREN réels** de CLEARTAX et d'ESI par la mention légale de l'éditeur (méthode de la
   `NOTE-RADAR-ET-SIREN.md`, ~5 min par société), et vérifier au passage qu'aucun autre SIREN du référentiel
   n'est un faux positif du même type : **la passe de contrôle sur les fiches enrichies par API sans SIREN
   confirmé devient prioritaire**, ce lot en a produit deux cas sur onze.
2. Ouvrir **LBM PARTNER** (793 822 222) et **DOXENSE EUROPE** (797 659 562), les deux sommets non ouverts de
   ce lot.
3. Documenter l'**opération de périmètre 2023 de DPII DOCOON** (+194 %).
4. **34 plateformes à SIREN** restent sans bloc économique, hors cible prioritaire : à reprendre en fiches
   allégées avec le chantier H3.
5. Suivre l'issue de la procédure OPEN BEE, sans pronostic, en datant chaque relevé.
