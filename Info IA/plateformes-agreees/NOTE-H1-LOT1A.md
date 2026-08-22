# Chantier H1 — lot 1A : poids économique et rattachement capitalistique

**Relevé du 22/08/2026** · auteur : RFE_WebSite · patch associé : `patches/patch-H1-LOT1A.json`

## Cadre

Le chantier H1 applique les règles 16 et 28 : lire le poids économique **et** le rattachement capitalistique dans la même passe, à partir des comptes déposés, sur les plateformes disposant d'un SIREN exploitable.

Périmètre restant au moment du lot : **65 plateformes** ont un SIREN et pas encore de bloc `analyse360`, dont **30** ciblent l'ETI ou les grands comptes. Le lot 1 a été constitué sur le croisement « menace sur les offres distribuées par Fluxym » × « angle mort ».

Source unique de ce lot : la **fiche registre et les comptes sociaux déposés** (greffes, RNE), republiés par Pappers. Conformément à la règle 11d, il s'agit d'un républicateur de comptes déposés, non d'un agrégateur qui estime.

## Les six sociétés

| Société | SIREN | Dernier CA déposé | Résultat net | Effectif | Rattachement |
|---|---|---|---|---|---|
| CEGID | 410218010 | **664 M€** (2024) | +120 M€ | 2 540 | filiale de CEGID GROUP |
| SAGE | 313966129 | **380 M€** (2025, clôture 30/09) | +73 M€ | 1 400 | filiale du groupe Sage |
| DOXALLIA | 397775305 | **63 M€** (2024) | **−2,17 M€** | 404 | non déterminable |
| SERENSIA by Quadient | 477550370 | **non restitué** | **−1,4 M€** | 26 | filiale du groupe Quadient |
| FLOWIE | 921376265 | **comptes confidentiels** | inaccessible | ≥ 1 | indépendante |
| YOOZ PDP | 949747133 | **aucun compte déposé** | — | ≥ 1 | filiale de YOOZ |

## Trois enseignements structurels

### 1. L'entité agréée peut n'être qu'une coquille juridique → règle 30

**YOOZ PDP** est une SASU au capital de **10 000 €**, créée le 09/03/2023 — quelques semaines avant l'ouverture du dispositif — dont le président est la société YOOZ (SIREN 808386148). Aucun compte annuel n'a jamais été déposé.

Conséquence de méthode : le poids économique se lit sur la société mère, jamais sur l'entité agréée. Conséquence commerciale : **la taille de l'entité immatriculée ne dit rien de la force de frappe de l'acteur**. Un référentiel qui lirait mécaniquement les comptes de l'entité agréée classerait Yooz parmi les acteurs négligeables, ce qui serait faux.

### 2. L'absence de chiffre d'affaires est parfois un fait, pas une lacune → règle 31

**FLOWIE** dépose bien ses comptes — exercice 2024 déposé le 14/08/2026 — mais **accompagnés d'une déclaration de confidentialité** au titre de l'article L. 232-25 du code de commerce. Aucune donnée financière n'est légalement accessible.

Ce n'est pas un trou dans la collecte : c'est une opacité choisie et licite. Elle se publie comme telle, avec la nature `comptes_confidentiels`. À noter, pour un acteur qui adresse l'ETI et le grand compte : les deux mandataires sociaux sont des holdings de fondateurs, le capital a été augmenté trois fois (2023, 2024, 2026) et les bénéficiaires effectifs ne sont pas accessibles. C'est le profil d'angle mort par excellence — celui de Payflows.

### 3. Certains comptes ne restituent que le résultat → règle 32

**SERENSIA by Quadient** dépose des comptes dont le chiffre d'affaires n'apparaît pas. Seuls le résultat net et le bilan sont exploitables : **252 k€, 418 k€, −127 k€, puis −1,4 M€** de 2021 à 2024, avec des fonds propres qui reculent de 3,94 à 2,42 M€ et une trésorerie de 2,93 à 1,68 M€. Publier le résultat seul est licite ; en déduire un chiffre d'affaires est interdit.

Deux éléments objectivent par ailleurs le rattachement à Quadient sans avoir besoin d'une pièce capitalistique : le nom commercial **SERENSIA BY QUADIENT** est enregistré au registre, et la date de clôture a été portée au **31 janvier**, celle du groupe. À signaler aussi : **cinq présidents depuis 2021**, et un directeur général resté six semaines fin 2025.

## Le dossier le plus parlant commercialement : DOXALLIA

Dénomination légale **EDK DOXALLIA**, siège à **Bozouls (Aveyron)**. Le chiffre d'affaires progresse de 37,3 à 63 M€ en trois ans, mais la croissance ne se transforme pas en résultat :

| | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|
| CA | 37,3 M€ | 54,1 M€ | 60,3 M€ | 63,0 M€ |
| EBITDA | +3,08 M€ | −1,51 M€ | −1,55 M€ | −782 k€ |
| Résultat net | +412 k€ | **−4,34 M€** | **−4,2 M€** | **−2,17 M€** |
| Trésorerie | 34,9 M€ | 29,4 M€ | 11,3 M€ | **4,38 M€** |
| Effectif | 139 | — | — | **404** |

Trois pertes consécutives, un EBITDA négatif sur trois exercices, et une trésorerie divisée par huit en trois ans pendant que l'effectif triple. La perte se réduit, ce qui plaide pour une phase d'investissement plutôt qu'un décrochage — mais le coussin de trésorerie est désormais mince.

**Piste ouverte, volontairement non publiée.** Deux indices convergents suggèrent un rattachement au groupe Crédit agricole : la société applique, en plus de Syntec, la **convention collective des caisses régionales du Crédit agricole**, et son conseil d'administration a accueilli le 06/11/2025 **Hervé Varillon** et Olivier Biton. En application de la **règle 29**, aucune liaison n'est publiée sans pièce probante. Si elle était établie, le groupe Crédit agricole porterait **trois immatriculations**, avec les deux entités Kolecto déjà recensées — ce qui en ferait le groupe le plus présent du référentiel.

## Deux corrections de tranche d'effectif

L'appariement d'origine sous-estimait deux sociétés, et pas qu'à la marge :

- **CEGID** : 1 000-1 999 → **2 000-4 999** (2 540 salariés aux comptes 2023)
- **DOXALLIA** : 100-199 → **250-499** (404 salariés aux comptes 2024)

## Lecture d'ensemble

Le lot fait apparaître un écart de masse qu'il faut avoir en tête : **CEGID et SAGE pèsent à elles deux plus d'un milliard d'euros de chiffre d'affaires déposé et 3 900 salariés**, avec 193 M€ de résultat net cumulé sur le dernier exercice. Les quatre autres réunies ne publient aucun chiffre d'affaires exploitable au-delà des 63 M€ de Doxallia.

Un point de structure mérite d'être relevé sur **CEGID** : 748 M€ de dettes financières fin 2024, en hausse continue depuis 581 M€ en 2021, pour 1,26 M€ de trésorerie et un levier de 2,6 fois l'EBITDA. Profil caractéristique d'un montage à effet de levier. À l'inverse, **SAGE** accélère (+11,7 % sur le dernier exercice contre +6,0 % pour Cegid) et dégage 19,2 % de marge nette.

## Non trouvé

- Comptes consolidés des groupes Cegid, Sage et Quadient.
- Exercice 2025 de CEGID (déposé le 28/07/2026) et de DOXALLIA (déposé le 23/07/2026), non encore restitués au relevé.
- Bénéficiaires effectifs de FLOWIE et de SERENSIA (accès réservé).
- Poids économique de **YOOZ** (SIREN 808386148), société mère opérationnelle — à traiter au lot suivant.
- Pièce établissant le rattachement de DOXALLIA.

## Reste à faire sur H1

**59 plateformes à SIREN** sans bloc économique, dont **24** sur cible ETI ou grands comptes. Lot 1B annoncé : AGICAP, SPENDESK, TENOR, SYMTRAX, **YOOZ (808386148)**, et les entités mères des coquilles rencontrées.
