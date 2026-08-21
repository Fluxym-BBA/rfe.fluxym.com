# Cercle 0, deuxième vague — ITESOFT et MEDIUS

**Date :** 21/08/2026 · **Auteur :** RFE_WebSite
**Patches :** `patches/patch-G-ITESOFT.json`, `patches/patch-G-MEDIUS.json`

---

## 1. Autocorrection : l'anomalie MEDIUS n'existe pas

La note `ANOMALIE-GEP-OPUSCAPITA.md`, rédigée quelques heures plus tôt, désignait MEDIUS comme le candidat prioritaire au contrôle d'adresse, au motif que le champ `pays` valait `France` alors que le groupe est suédois et implanté à Linköping.

**Vérification faite, il n'y a pas d'anomalie.** L'entité immatriculée est **MEDIUS, SAS française, SIREN 810794610**, créée le 10/04/2015, siège au 33 rue du Louvre à Paris 2ᵉ, 50 à 99 salariés. Le champ `pays` est exact.

Le contrôle d'adresse a donc fonctionné exactement comme prévu — en écartant un faux positif. C'est utile de le dire : sur deux cas testés, un a révélé une anomalie réelle (GEP) et l'autre a levé un soupçon infondé (MEDIUS). Une méthode qui ne produirait que des confirmations serait suspecte.

**Écart mineur signalé :** la DGFiP publie `35 rue des Jeûneurs 75002 Paris`, le registre indique `33 rue du Louvre 75002 Paris`. Même arrondissement, probable déménagement non répercuté. Le champ `adresse` n'est pas modifié : la liste DGFiP reste sa source.

### Le vrai enseignement : trois groupes étrangers, trois choix d'entité immatriculée

| Groupe | Entité qui porte l'agrément | Conséquence |
|---|---|---|
| **Basware** (Finlande) | la **maison mère finlandaise**, alors qu'une filiale française existe depuis 2004 | pas de SIREN sur la fiche, présence française à documenter dans `presenceEnFrance` |
| **GEP** (États-Unis) | une **filiale finlandaise acquise** (ex-OpusCapita) | pas de SIREN, aucune entité française identifiée |
| **Medius** (Suède) | la **filiale française** | SIREN présent, `pays` = France, fiche indistinguable d'un acteur national |

**Il n'existe donc aucune règle générale.** Le choix de l'entité immatriculée est une décision propre à chaque groupe, et elle en dit long : Medius a accepté une responsabilité juridique française, Basware a préféré la garder au siège, GEP l'a héritée sans la choisir.

**Conséquence pour le chantier F :** le champ `pays` d'une fiche ne renseigne pas sur la nationalité du groupe, mais sur celle de **l'entité immatriculée**. Ce sont deux informations différentes, et la seconde ne se déduit jamais de la première. Une fiche `pays: France` peut parfaitement masquer un groupe suédois de 500 personnes détenu par des fonds américains — c'est précisément le cas de Medius.

---

## 2. ITESOFT n'est plus cotée depuis juin 2024

Découverte de cette passe : ITESOFT a fait l'objet d'une **offre publique de retrait à 4,00 € par action, suivie d'un retrait obligatoire réalisé le 04/06/2024**. Avant l'opération, le groupe familial Charpentier détenait environ 74 % du capital et 77 % des droits de vote ; l'offre portait sur les 4,38 % restants.

Deux conséquences :

1. Le champ `relationCapitalistique` valait `acquise`, ce qui est faux : la société n'a pas été acquise par un tiers, elle a été **reprise par le concert familial de son fondateur**. Corrigé en `independante`, avec `typeActionnaire: fondateurs`.
2. La société ne publie plus de comptes consolidés. **Les seules données fiables sont désormais les comptes sociaux déposés au greffe** — et un fournisseur de données de marché diffuse encore un chiffre d'affaires 2025 de 20,5 M€ incompatible avec les 22,1 M€ déposés pour 2024. Illustration supplémentaire de la règle 11.d : déposé ou estimé, il faut choisir.

---

## 3. Les deux fiches

| | ITESOFT | MEDIUS |
|---|---|---|
| Entité | SA française, Aimargues (30) | SAS française, Paris 2ᵉ |
| SIREN | 330265323 | 810794610 |
| Création | 1984 · facture depuis **1995** | 2015 · groupe fondé en 2001 |
| Actionnariat | **concert familial Charpentier**, retiré de la cote en 06/2024 | **Marlin Equity** (majoritaire) + **Advent International** |
| CA entité | **22,1 M€** (2024, déposé), contre 20,0 M€ en 2023 | non consulté |
| Résultat net | **+1,7 M€** (2024), contre 739 k€ | non consulté |
| Effectif | 100-199 (~186) | 50-99 · **~500 dans le groupe** |
| Exposition France | **~86 % de l'activité** | un marché parmi plus de 100 |
| Marque dédiée | **Streamline Invoices** | aucune |
| Centralité | **3** (confiance haute) | **3** (confiance moyenne) |

### ITESOFT — l'exposition la plus forte du référentiel

22,1 M€ de chiffre d'affaires en croissance, résultat net multiplié par plus de deux, fonds propres de 11,9 M€, effort de R&D d'environ 17 % du chiffre d'affaires — élevé pour cette taille. Références de l'offre agréée : **Sodexo, CNAM, MACIF**. Positionnement volumétrique haut, dossiers examinés **à partir de 15 000 factures par mois**.

**Le fait marquant est l'exposition : la France représentait environ 86 % de l'activité.** Là où Basware ou Esker répartissent l'enjeu réglementaire sur plusieurs dizaines de pays, ITESOFT joue une part beaucoup plus grande de son avenir sur cette seule réforme. L'engagement commercial sur le sujet en est structurellement supérieur.

Le retrait de la cote a deux effets opposés : il allonge l'horizon de décision et libère de la contrainte de publication, mais il réduit la capacité à lever des fonds face à des concurrents adossés à des fonds disposant de plusieurs centaines de millions.

### MEDIUS — le concurrent le plus facile à sous-estimer

La fiche administrative dit « PME française, 50 à 99 salariés ». La réalité est la filiale française d'un groupe suédois d'environ 500 personnes, plus de 4 000 clients dans plus de 100 pays, environ 300 milliards de dollars de dépenses traitées par an, détenu majoritairement par **Marlin Equity Partners** avec **Advent International** au minoritaire.

Trois points d'attention :

- positionnement **frontal sur le poste fournisseurs pour les ETI et grandes entreprises**, revendiqué comme tel dans le communiqué français du 12/01/2026, sans volet Order-to-Cash ;
- l'acquisition d'**Expensya** donne une carte que peu de concurrents ont sur ce segment : la note de frais traitée dans le même ensemble que la facture fournisseur, ce qui élargit le périmètre de la conversation avec une direction financière ;
- actionnariat de fonds et **rumeur de cession à l'automne 2025** autour de deux milliards de dollars (source secondaire, non confirmée) : dans une phase de valorisation, la croissance du nombre de clients prime généralement sur la marge unitaire — **agressivité tarifaire plausible**.

### Hypothèse à vérifier, non publiable en l'état

L'entité française de Medius **pourrait être l'ancienne société Expensya**, rachetée en 2023 et renommée. Quatre signaux convergent : création en 2015, année de fondation d'Expensya ; siège parisien ; code d'activité programmation informatique ; effectif cohérent ; et la présence de la gestion des notes de frais, métier d'Expensya, dans l'offre française.

**Aucune preuve directe n'a pu être obtenue** : le registre des bénéficiaires effectifs n'est plus accessible depuis juillet 2024, aucune annonce BODACC n'est publiée pour cette société, aucun dirigeant n'est exposé. Vérification à faire sur l'historique des dénominations au greffe ou sur un extrait INPI.

Si elle se confirme, cette hypothèse ajouterait un troisième cas au motif « agrément porté par une entité issue d'une acquisition », après GEP et Generix.

---

## 4. Deux des trois fiches invisibles aux filtres sont réparées

`segmentCible` était vide sur ITESOFT et MEDIUS, ce qui les rendait absentes des filtres de segment du hub alors qu'elles adressent précisément la cible. Corrigé sur les deux, avec source :

- **ITESOFT** → `eti` + `grands_comptes`, sur un entretien de presse du 23/09/2025 : *Streamline Invoices s'adresse à l'ensemble des grands comptes et ETI dans plus de 35 pays* ;
- **MEDIUS** → `eti` + `grands_comptes`, sur le communiqué d'immatriculation du 12/01/2026.

**LUCCA** reste à traiter, mais son `segmentCible` (`tpe_pme` + `eti`) est déjà porté par `patch-CORRECTIONS-20260821.json`.

⚠️ **Redondance sans risque à signaler :** `patch-CORRECTIONS-20260821.json` affecte déjà les mêmes valeurs de `segmentCible` à ITESOFT et MEDIUS, et le même `natureEntite` à GEP que `patch-G-GEP.json`. Les valeurs étant **identiques**, la fusion est idempotente : l'ordre d'application n'a aucune importance et aucune donnée ne peut être perdue.

---

## 5. État du barème après neuf fiches

| Indice | Sociétés |
|---|---|
| 4 — cœur de métier | *aucune* |
| 3 — axe stratégique | ESKER, BASWARE, PARAGON, SERES, **ITESOFT**, **MEDIUS** |
| 2 — extension naturelle | GENERIX, GEP, TESSI |
| 1 / 0 | *aucune* |

Six fiches sur neuf à l'indice 3. La compression signalée dans `NOTE-CERCLE-0-VAGUE-1.md` se confirme et s'accentue. **La passe de révision du barème prévue à dix fiches devient la priorité suivante** : une dixième fiche, puis relecture comparée des neuf faisceaux d'indices avant de poursuivre.

Piste à instruire lors de cette révision : le niveau 3 tel qu'il est appliqué agrège deux situations différentes — celle d'un acteur dont la facture est le métier (Itesoft, Seres) et celle d'un acteur qui a bâti un canal propre autour de l'agrément (Paragon, Esker). Ces deux profils ne se combattent pas de la même manière, et les confondre fait perdre l'essentiel de l'intérêt de l'indice.

---

## 6. Suite

Une dixième fiche, puis révision du barème. Candidat proposé : **TRADESHIFT BABELWAY**, réseau d'échange de dimension internationale, profil différent des neuf premières et donc utile pour éprouver les bornes hautes de l'échelle.
