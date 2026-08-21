# Étalonnage du barème 360 — ESKER et BASWARE

**Date du relevé :** 21/08/2026
**Auteur :** RFE_WebSite
**Patches produits :** `patches/patch-G-ESKER.json`, `patches/patch-G-BASWARE.json`
**Modèle de référence :** `cartographie-360-modele.md`
**Pilote précédent :** `pilote-360-GENERIX.md` (Generix, indice 2)

---

## 1. Pourquoi ces deux sociétés en second

Le pilote Generix a validé la **méthode**. Il ne validait pas le **barème** : un seul point de mesure ne fait pas une échelle.

Esker et Basware ont été choisies pour trois raisons.

1. Ce sont deux des quatre solutions distribuées par Fluxym. Une erreur de lecture y serait immédiatement détectable par un lecteur interne, ce qui n'est pas le cas sur une société inconnue. **Le contrôle qualité est gratuit.**
2. Elles sont abondamment documentées. Si le modèle laisse des trous ici, il en laissera partout.
3. Elles sont de natures opposées : éditeur français couvrant deux cycles avec une société mère de private equity d'un côté ; éditeur finlandais mono-cycle, non coté, adossé à un consortium de fonds américains de l'autre. Le modèle devait tenir sur les deux.

**Règle rappelée et appliquée :** même barème que pour tout le monde, aucun angle promotionnel, aucune information issue d'une mission ou d'un dossier d'avant-vente. Sources publiques exclusivement.

---

## 2. Ce que l'étalonnage a produit comme règle nouvelle

### Règle de barème n° 1 — l'indice mesure la place de l'activité **agréée française**, pas la proximité du métier avec la facturation électronique

C'est le cas Basware qui l'impose. L'échange de factures **est** le métier de Basware : deux milliards de factures traitées depuis 1985, environ 230 millions sur la seule année 2024. Lecture naïve : indice 4, cœur de métier.

Lecture retenue : **indice 3**. L'agrément français n'est pas l'activité, il en est la déclinaison réglementaire dans une juridiction parmi plus de cinquante. Basware le dit elle-même : la France est une pièce supplémentaire d'une couverture mondiale.

Conséquence, à appliquer sur tout le référentiel : **deux entreprises au métier identique peuvent recevoir des indices différents**, selon l'investissement observable sur la France. L'indice 4 est réservé aux sociétés qui n'auraient plus d'objet sans l'activité agréée — typiquement les pure players et les entités créées pour la réforme.

### Règle de barème n° 2 — la distribution du socle à des tiers est un indice fort de centralité

Esker distribue son socle agréé à des éditeurs et intégrateurs tiers : Flowwa avec la plateforme TEDD et plus de 150 PME et ETI raccordées (18/03/2026), Sinari (25/09/2025), Amiltone (17/11/2025). Le troisième cas documenté en moins d'un an.

Un socle revendu n'est plus une brique de conformité pour la base installée : c'est un **produit avec son propre canal de vente**. Ce signal pèse dans le sens « + » et il est vérifiable sur pièces. Il fait passer Esker de 2 à 3.

Le même motif avait déjà été observé chez Generix (revente par Applium sous la marque « GenerixByApplium ») **sans faire basculer l'indice**, parce qu'il y était isolé et que le reste du faisceau tirait vers le bas. La règle est donc : la distribution à des tiers est un indice, jamais un critère suffisant à elle seule.

### Règle de barème n° 3 — trois niveaux d'ancrage à distinguer pour le poids économique

| Ancrage | Esker | Basware |
|---|---|---|
| Chiffre déclaré par l'entreprise sur son site | ~250 M€ (2025) | non publié |
| Chiffre issu d'un communiqué financier daté | 205,3 M€ (2024), dont 167,9 M€ de SaaS | non publié depuis le retrait de cote (2022) |
| Comptes déposés isolant l'entité française | non isolable | non consulté |

Les trois ne sont pas interchangeables. Le champ `caGroupe.nature` doit dire lequel des trois est retenu. Sur Esker, la valeur publiée est le chiffre déclaré 2025, et le communiqué 2024 est conservé dans les sources : ainsi le lecteur voit à la fois la donnée fraîche et la donnée auditée.

### Règle de barème n° 4 — les agrégateurs de données d'entreprises ne sont pas une source

Sur Basware, les valeurs de chiffre d'affaires proposées par les agrégateurs consultés vont de 185 à 365 millions de dollars. Écart de 1 à 2. **Aucune n'est retenue.** Le champ reste absent, et le motif est publié dans `ventilationParActivite.motif`.

Même conclusion que sur Generix, où un agrégateur affichait 243,7 M$ pour une société dont l'entité française déclarait 60,4 M€. Le constat est désormais établi sur deux cas : la règle devient définitive.

### Règle de barème n° 5 — une ventilation par modèle de revenus n'est pas une ventilation par activité

Esker publie la part du SaaS dans son chiffre d'affaires (82 % en 2024). C'est une ventilation **par modèle de facturation**, non par ligne de métier. Elle ne dit rien de la répartition entre Source-to-Pay, Order-to-Cash et facturation électronique.

Elle est donc consignée dans le `motif` de non-disponibilité, et non présentée comme une réponse à la question posée. Le tenter serait exactement l'erreur que le modèle est censé interdire.

---

## 3. Résultat des deux fiches

| | ESKER | BASWARE |
|---|---|---|
| Indice de centralité | **3 / 4 — axe stratégique** (confiance haute) | **3 / 4 — axe stratégique** (confiance moyenne) |
| Métier | suite S2P + O2C pour la direction financière | cycle de vie de la facture fournisseur + réseau d'échange |
| Lignes d'activité identifiées | 5 | 6 |
| CA publié | ~250 M€ (2025, déclaré) | non publié |
| Effectif groupe | > 1 200 | > 1 350 (16 pays) |
| Effectif de l'entité | 500 à 999 (INSEE 2023) | 20 à 49 pour BASWARE SAS (INSEE 2023) |
| Actionnariat | Bridgepoint + General Atlantic (fonds) | Accel-KKR + Long Path + Briarwood (fonds) |
| Acquisitions récentes | — | Glantus (2023), AP Matching (2024) |
| Marque produit dédiée | aucune | aucune |
| Entité juridique dédiée | non | non |
| Secteurs de références | industrie, agroalimentaire, retail, transport | transport, agroalimentaire, industrie |
| Avis publics agrégés | Gartner Peer Insights S2P : 4,5/5, 123 avis | non relevé |

Aucun classement, aucune comparaison nominative n'est publiée entre les deux fiches : chacune est lue pour elle-même, conformément à la règle 3 des 9 règles de publication.

---

## 4. Corrections apportées au référentiel

| Société | Champ | Avant | Après | Source |
|---|---|---|---|---|
| ESKER | `trancheEffectif` | `250-499` | **`500-999`** | INSEE via annuaire-entreprises, donnée 2023 |
| ESKER | `descriptionFiche` | reprenait « ETI de 250 à 499 salariés », sans accents, sans le numéro d'immatriculation | réécrite : effectif corrigé, n° 0005, immatriculation définitive du 05/01/2026, hébergement France, ISO 27001 | communiqué Esker du 05/01/2026 |

**Écarts de source signalés et non tranchés (Esker) :** capital social de 12 144 846 € au RNE contre 12 049 040 € dans les mentions légales du site ; forme juridique SAS au répertoire SIRENE et au RNE alors que la dénomination reste « SA ESKER » et que les mentions légales indiquent encore « société anonyme ». Ces écarts sont documentés dans les sources de la fiche, pas arbitrés.

---

## 5. Apport majeur du cas Basware : la présence en France d'une entité étrangère

L'entité immatriculée par la DGFiP est finlandaise (Linnoitustie 2, Espoo). Elle n'a pas de SIREN, et **c'est normal**.

Mais il existe **BASWARE SAS**, SIREN **452052780**, 20 rue de Caumartin 75009 Paris, créée le 01/01/2004, capital 74 000 €, 20 à 49 salariés en 2023, dirigeants Jason Kurtz et Martti Nurminen.

Ce SIREN est renseigné dans `identiteInternationale.presenceEnFrance.siren`, **et surtout pas** dans le champ `siren` de la fiche, qui doit rester celui de l'entité effectivement immatriculée. Confondre les deux produirait une fiche fausse : elle attribuerait à une société de 20 à 49 salariés un agrément détenu par un groupe de plus de 1 350 personnes.

**Conséquence pour le chantier F, à appliquer sur les 42 entités étrangères :** la question n'est pas « cette société a-t-elle un SIREN ? », mais « existe-t-il une entité française rattachée, et laquelle ? ». C'est une information commercialement utile — elle dit s'il y a des équipes en France — et elle est accessible en une recherche sur l'annuaire des entreprises à partir du nom du groupe. Le champ `presenceEnFrance` cesse d'être un champ secondaire : il devient l'un des premiers à remplir.

---

## 6. Correctif d'affichage livré avec ces deux fiches

`js/pa-detail.js` affichait en clair les identifiants de facettes au lieu de leurs libellés :

- références clients par secteur : `industrie`, `agroalimentaire`, `retail` au lieu de « Industrie et manufacturing », « Agroalimentaire », « Retail et distribution » ;
- type d'actionnaire : `fonds_pe` au lieu de « Fonds d'investissement ».

Les clés **doivent** rester les identifiants de facettes, sans quoi les filtres du hub (`js/pa-hub.js`, filtre `secteurReferences`) ne fonctionnent plus. C'est donc l'affichage qui est corrigé, pas la donnée : `renderMarche` et `renderLectureConcurrentielle` reçoivent désormais la taxonomie et passent par `label()`.

Ce défaut n'était pas visible avant : aucune fiche ne portait encore de `referencesClients.parSecteur` ni de `capaciteDeFrappe.typeActionnaire`.

---

## 7. Ce qu'il reste à trouver sur ces deux fiches

| Manque | Société | Piste |
|---|---|---|
| CA de l'entité française | ESKER | comptes déposés au greffe, exercices 2024 et 2025 |
| CA groupe | BASWARE | comptes annuels finlandais (PRH), à commander |
| Y-tunnus, TVA finlandaise, LEI, EUID | BASWARE | registre PRH, VIES, GLEIF |
| CA de la filiale française | BASWARE | comptes déposés BASWARE SAS, SIREN 452052780 |
| Avis publics agrégés | BASWARE | Gartner Peer Insights marché AP Invoice Automation |
| Offres d'emploi ouvertes et part liée à la facturation électronique | les deux | pages carrières, relevé à faire en une passe unique sur toute la cohorte, à date fixe |

Le relevé des offres d'emploi ne doit **pas** se faire société par société au fil de l'eau : un volume d'offres n'a de sens que comparé à une même date. Il fera l'objet d'une passe dédiée sur les 53 sociétés de la cohorte ETI et grands comptes.

---

## 8. Suite immédiate

1. **GEP** — troisième société du portefeuille Fluxym, et anomalie ouverte : pays corrigé en Finlande par le patch de corrections du 21/08, socle hérité de l'acquisition d'OpusCapita, aucun SIREN, aucune année de création.
2. **Les 13 autres concurrents frontaux** du cercle 0 de `PRIORISATION-CONCURRENCE.md`.
3. **MEDIUS, ITESOFT, LUCCA** — invisibles aux filtres de segment faute de `segmentCible`, alors qu'elles adressent la cible.
4. **Les 8 plateformes françaises restées aveugles au radar**, par les mentions légales de leur propre site (méthode et coût réels dans `NOTE-RADAR-ET-SIREN.md`).
