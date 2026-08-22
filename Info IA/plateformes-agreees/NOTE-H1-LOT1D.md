# Chantier H1 — lot 1D : ouverture des holdings

**Relevé du 22/08/2026** · auteur : RFE_WebSite · patch associé : `patches/patch-H1-LOT1D.json`

⚠️ Ordre de fusion : **1A, 1B, 1C, puis 1D**.

Ce lot ne traite aucune plateforme nouvelle. Il ouvre les trois holdings repérées aux lots précédents — et il rapporte plus que les lots de plateformes.

## Résultat principal : la vraie taille du groupe Septeo

Le lot 1C portait « comptes consolidés du groupe Septeo » en **non trouvé**. Ils existent : ils sont déposés par la **société de tête**, SEVEN TOPCO, et non par l'entité immatriculée.

| Groupe Septeo (consolidé) | 2021 | 2022 | 2023 |
|---|---|---|---|
| Chiffre d'affaires | 227 M€ | 288 M€ | **338 M€** |
| Croissance | — | +26,6 % | +17,4 % |
| EBITDA | — | — | **98,1 M€ (29,0 %)** |
| Résultat d'exploitation | — | — | 75,6 M€ (22,4 %) |

**Septeo est donc un acteur de plus de 300 M€, très rentable au niveau opérationnel.** Ni les 48,7 M€ de refacturation de la holding animatrice, ni les pertes de la société de tête ne le laissaient voir. C'est la **règle 40** : quand un chiffre d'affaires de groupe est porté comme non trouvé, il faut le chercher à l'étage TopCo avant de conclure qu'il n'est pas publié.

Les trois étages de Septeo, désormais lisibles :

| Étage | Entité | Ce qu'elle montre |
|---|---|---|
| Exploitation consolidée | — | **338 M€**, 29 % d'EBITDA |
| Société de tête | SEVEN TOPCO (888803988), capital 54,3 M€, 5 salariés, dirigée par **Hugues Galambrun**, fondateur | **307 M€ de dettes**, 460 M€ de fonds propres, pertes de 12,6 à **22,0 M€** sur quatre exercices |
| Holding animatrice *(entité agréée)* | SEPTEO (790675037), code 70.22Z | 48,7 M€ de refacturation, mouvements de restructuration |

Les pertes de la TopCo sont **le coût du levier d'acquisition**, pas une faiblesse opérationnelle. Et le groupe est sous montage à effet de levier tout en étant dirigé par son fondateur.

## Deuxième résultat : la chaîne Cegid a au moins trois étages → règle 39

La règle 35 disait de remonter d'un cran. Un cran ne suffit pas.

1. **CEGID** (410218010) — société d'exploitation : 664 M€, 2 540 salariés.
2. **CEGID GROUP** (327888111) — SASU de Lyon, capital 9,52 M€, code **70.10Z** (sièges sociaux), **zéro salarié**, 57 établissements. Elle ne réalise que **3,71 M€ d'honoraires** mais porte **824 M€ de dettes financières**, en hausse continue depuis 659 M€ en 2021, pour 313 M€ de fonds propres, **8 k€ de trésorerie** et 27,5 % d'autonomie financière.
3. **CLAUDIUS FRANCE** (821096039) — président de Cegid Group depuis le 27/03/2018. **Étage non ouvert.**

Une chaîne interrompue doit être signalée comme telle, en nommant l'étage manquant. C'est fait dans la fiche.

Repère de périmètre : Cegid Group affichait 308 M€ de chiffre d'affaires et 28,6 M€ de résultat en **2016**, avant réorganisation. Les séries anciennes et récentes ne sont pas comparables.

## Avertissement de méthode inscrit dans les fiches → règle 41

**Les dettes financières des étages d'un montage ne se cumulent pas.** Les 748 M€ de l'entité Cegid et les 824 M€ de Cegid Group ne font pas 1,57 Md€ : elles se recoupent. Chaque étage se lit pour ce qu'il est, et l'avertissement figure désormais dans la fiche.

## Troisième résultat : l'opacité de Flowie est systématique

Flowie était l'angle mort du lot 1A. Le premier étage est ouvert, et il confirme le diagnostic.

**UP TO TECH** (912494937), présidente de Flowie depuis le 14/11/2022, est une **EURL au capital de 100 €**, sans salarié, **domiciliée à la même adresse** que Flowie, dont le gérant est **Yann Ravel-Sibillot**, né en septembre 1992. Elle ne dirige aucune autre entreprise, n'a jamais publié d'information financière, et a déposé ses comptes 2022 et 2023 le 08/12/2024 **également sous déclaration de confidentialité**.

L'opacité est donc cohérente et volontaire **aux deux étages** : à chaque niveau, les comptes sont déposés sous confidentialité. Pour un acteur qui adresse l'ETI et le grand compte, et qui a déjà remporté des affaires face à des concurrents établis, c'est une caractéristique à énoncer telle quelle. La seconde mandataire, **LEGORREC CONSULTING** (920781333), reste à ouvrir.

## Ce que trois ouvertures de holding ont rapporté

En trois fiches sans nouvelle plateforme : le chiffre d'affaires consolidé d'un groupe de 338 M€ qu'on croyait non publié, une chaîne de contrôle à trois étages là où la fiche n'en montrait qu'un, un dirigeant nommé derrière l'acteur le plus opaque du référentiel, et trois règles de méthode. La remontée des holdings est le meilleur rendement du chantier H1 à ce stade — après la liaison Itesoft-Yooz, qui venait déjà de là.

## Non trouvé

- **CLAUDIUS FRANCE** (821096039) et **LEGORREC CONSULTING** (920781333) : étages non ouverts.
- Identité des fonds au sommet des montages Cegid et Septeo.
- Effectif consolidé du groupe Septeo ; comptes consolidés du groupe Cegid.
- Comptes consolidés de Septeo postérieurs à 2023.

## État du chantier H1

Dix-sept plateformes traitées, **36 fiches** du référentiel portent un bloc `analyse360`. **49 plateformes à SIREN** restent sans bloc économique, dont **17** sur cible ETI ou grands comptes.

Lot 1E envisagé : achever les deux étages manquants (CLAUDIUS FRANCE, LEGORREC CONSULTING), puis reprendre la cohorte ETI/grands comptes.
