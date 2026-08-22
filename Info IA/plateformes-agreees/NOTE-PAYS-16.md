# Qualification du pays des 16 fiches sans pays — 22/08/2026

Dernier trou d'identité du référentiel. Les 16 entrées sans champ `pays` sont **toutes** des candidates en attente des tests d'interopérabilité : la liste DGFiP ne restitue ni adresse ni pays pour cette vague, et l'enrichissement précédent n'avait donc rien à ancrer.

Tant que ces 16 fiches restaient muettes, le décompte des entités étrangères du référentiel était faux **dans les deux sens** : ni les 44 annoncées par `_meta`, ni les 42 recomptées ne pouvaient être justes.

## Méthode

1. Mention légale de l'éditeur d'abord, jamais le nom (règles 56 et 59).
2. Contrôle au répertoire SIRENE pour toute entité française, sur les cinq attributs disqualifiants (règle 55).
3. Concordance adresse publiée / siège INSEE et ressort du greffe (règles 58 et 61).
4. Aucun pays déduit d'un nom, d'un domaine seul ou d'une forme juridique.

## Résultat : 13 pays établis sur 16

| Fiche | Pays | Entité juridique | SIREN / registre | Confiance |
|---|---|---|---|---|
| FISKALTRUST | **France** | FISKALTRUST FRANCE SAS | 841 590 243 | haute |
| KALANDA | **France** | KALANDA | 951 341 379 | haute |
| NUMERIA | **France** | INFO SERVICE EUROPE | 384 315 552 | haute |
| RATIOO | **France** | DATAE | 834 331 704 | moyenne |
| SWILE | **France** | SWILE | 824 012 173 | haute |
| WAKASTELLAR | **France** | WAKASTELLAR | 107 956 120 | haute |
| BLG | **France** | non établie | — | moyenne |
| CENSE | **France** | non établie (groupe COGEP, 400 833 596) | — | moyenne |
| EY Expertises & Transactions | **France** | non établie | — | moyenne |
| EAGLESSOFT | **Belgique** | Eaglessoft BV | BCE non publié | haute |
| Taxilla Europe BV | **Belgique** | Taxilla Europe BV | BCE non publié | haute |
| Insiders Technologies GmbH | **Allemagne** | Insiders Technologies GmbH | HRB 3831, Amtsgericht Kaiserslautern | haute |
| BE FRESH S.à r.l. | **Luxembourg** | BE FRESH S.à r.l. | RCS Luxembourg B232808 | haute |
| Basikon | *non établi* | — | — | — |
| FACTUREAPP | *non établi* | — | — | — |
| MY-EDDY | *non établi* | — | — | — |

**6 SIREN nouveaux**, dont **4 portés par une dénomination légale différente du nom déclaré à la DGFiP** : NUMERIA est INFO SERVICE EUROPE, RATIOO est DATAE, FISKALTRUST est FISKALTRUST FRANCE SAS, et seules KALANDA, SWILE et WAKASTELLAR portent leur marque. La règle 59 se confirme sur un échantillon indépendant.

## Deux corrections structurantes

**FISKALTRUST n'est pas une entité étrangère.** L'entité qui édite le site français est **FISKALTRUST FRANCE SAS** (SIREN 841 590 243), PME de 1 à 2 salariés créée le 03/08/2018, dont le président inscrit au registre est **FISKALTRUST CONSULTING GMBH**, société de droit autrichien. La fiche basculait donc du décompte des étrangères vers celui des françaises, avec un rattachement capitalistique documenté.

**Taxilla Europe BV est belge, pas néerlandaise.** La page contact du groupe publie « Belgium — Taxilla Europe BV, Rue des Colonies 11, Brussels, 1000, Belgium ». Le suffixe « BV » avait été lu comme une forme néerlandaise ; depuis la réforme du Code des sociétés de 2019, il désigne aussi la société à responsabilité limitée de droit belge. Aucune donnée n'était fausse dans la fiche : c'est une lecture implicite qui l'était.

## Trois écarts relevés et non arbitrés

- **FISKALTRUST** : la mention légale annonce un siège au 102 avenue des Champs-Élysées et un RCS de Paris ; la source INSEE situe le siège au 132 rue Bossuet, Lyon 6e. Ce qui ancre l'identité, c'est le numéro de TVA FR33841590243, qui porte le SIREN. La discordance d'adresse est consignée, pas tranchée.
- **KALANDA** : le site revendique une activité d'hébergement spécialisé depuis 2001, l'entité immatriculée a été créée le 28/03/2023.
- **NUMERIA** : le site revendique une activité depuis 1974, l'entité immatriculée date du 01/01/1992.

## Trois faits notables

- **WAKASTELLAR** porte l'agrément dans une société créée le **22/07/2026**, soit moins d'un mois avant le relevé DGFiP du 17/08/2026, présidée et dirigée par **trois personnes morales** (JDS CONSEIL, LOU CONSEIL, FLO CONSEIL). Le groupe existait, l'entité non.
- **SWILE** est une **ETI** de 250 à 499 salariés : 204,1 M€ de chiffre d'affaires et 2,0 M€ de résultat net sur l'exercice 2024, comptes déposés. Un bloc `analyse360.poidsEconomique` a été ouvert au passage, sans autre volet.
- **CENSE** est adossée à un groupe d'expertise comptable de taille ETI : SA **COGEP**, 126,4 M€ de chiffre d'affaires et 11,2 M€ de résultat net en 2023, 78 établissements, 1 000 à 1 999 salariés. L'entité portant l'immatriculation CENSE elle-même reste inconnue.

## Trois fiches restent sans pays — et c'est un résultat

- **Basikon** : aucune page de mentions légales publiée. Quatre URL testées (`/legal-notice`, `/mentions-legales`, `/contact`, `/about-us`) répondent 404, et aucune page légale n'est indexée sur le domaine. Pour un éditeur qui adresse le marché français, c'est un fait en soi.
- **FACTUREAPP** et **MY-EDDY** : aucun site web publié par la DGFiP, aucune adresse restituée pour la vague en attente de tests. Aucune source primaire ne nomme l'entité.

Ces trois fiches ne sont pas « à finir » : elles sont **documentées comme non établies**, avec la preuve de la recherche dans `sourcesEnrichissement`.

## Effet sur le décompte du référentiel

| | Avant | Après |
|---|---|---|
| Entités françaises | 105 | **114** |
| Entités étrangères | 42 | **46** |
| Pays non établi | 16 | **3** |
| Fiches avec SIREN | 79 | **85** |

`_meta.couverture.note` annonce encore 44 entités étrangères : à corriger hors patch, en même temps que la reprise de `_meta`.

## Ce que cette passe ouvre

- **9 sites résistants** de la passe précédente (AXWAY SOFTWARE, Effinum by SPEE, ICD International, jefacture.com, MY FITECO, MyKinexo PDP, NEOTIMO, SUPER PDP, VosFactures) : la méthode « CGV plutôt que mentions légales » a fonctionné pour SWILE, elle est transposable.
- **Entité portant l'immatriculation à établir** pour BLG, CENSE et EY Expertises & Transactions, désormais qualifiées France.
- **Étages non ouverts** ajoutés à la file : SOFTNEXT (président de NUMERIA), JDS CONSEIL / LOU CONSEIL / FLO CONSEIL (WAKASTELLAR), FISKALTRUST CONSULTING GMBH (Autriche), Taxilla Inc.
- **Numéros BCE** d'EAGLESSOFT et de Taxilla Europe BV, à chercher à la Banque-Carrefour des Entreprises plutôt que sur les sites.
- **`_meta`** à reprendre en entier : le décompte, la date de relevé et la note de couverture.
