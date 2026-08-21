# Pilote 360 — GENERIX Group

**Objet :** éprouver le modèle `analyse360` sur un cas réel avant de l'industrialiser.
**Relevé le :** 21/08/2026 · **Statut :** pilote de méthode, **non fusionné** dans `data/plateformes-agreees.json`
**Pourquoi ce cas :** exemple choisi par Bruno, et cas typique d'une entreprise dont l'activité de plateforme agréée est réelle mais non centrale.

> **Lecture de ce document.** Les sections « Faits » ne contiennent que des éléments sourcés et datés. Les sections « Lecture » sont des interprétations, rédigées au conditionnel, et signalées comme telles. Les mentions `[non relevé]` sont des trous assumés, avec la méthode pour les combler.

---

## Faits — identité

| | |
|---|---|
| Raison sociale | GENERIX GROUP |
| SIREN | 377 619 150 |
| Forme | SASU |
| N° TVA | FR88377619150 |
| LEI | 9695003QNWHLC60H9E89 |
| Création | 29/03/1990 |
| Siège | Arteparc, 2 rue des Peupliers, 59810 Lesquin |
| Code APE | 58.29C — Édition de logiciels applicatifs |
| Convention collective | Syntec (IDCC 1486) |
| Capital social | 12 673 364,50 € |
| Actionnaire de tête | NEW GEN HOLDING |
| Établissements | 26 |
| Immatriculation PA | 11/12/2025 |

Sources : greffe / RNE / INSEE via Pappers, relevé le 21/08/2026 :cite[n1k] ; date d'immatriculation PA :cite[a37].

**Le LEI est présent.** Confirmation pratique que le champ `lei` du bloc international n'est pas réservé aux étrangères : il est exploitable pour les groupes français dès qu'ils ont une activité de marché.

---

## Faits — activités

Métier déclaré : éditeur de logiciels SaaS de supply chain et des flux financiers associés. Le discours corporate met en avant 2 000 entrepôts pilotés, 5 millions de transports par jour, plus de 4 milliards de commandes et factures par an :cite[g8q].

Lignes d'activité identifiées au catalogue et au menu : exécution logistique (WMS), transport (TMS, issu de l'acquisition DDS en 2023), commerce omnicanal (Keyneo, 2024), EDI et intégration B2B, portails clients et fournisseurs, AP Automation, TradeXpress Infinity, et **facturation électronique / plateforme agréée** :cite[g8q,aqe].

Historique de croissance par acquisitions : Ceitel, Influe Illicom, Infolog Solutions, GMI Connectivity, Sologlobe (2005-2017), DDS (2023), Keyneo (2024) :cite[g8q].

Empreinte : présence physique dans 12 pays, clients dans plus de 60, centre de services au Portugal (2018), R&D en Roumanie (2020), bureau en Allemagne (2024) :cite[g8q].

---

## Faits — poids économique

| Indicateur | Valeur | Périmètre | Exercice | Nature |
|---|---|---|---|---|
| CA groupe | **> 110 M€** | groupe | non précisé sur la page | déclaré sur le site :cite[g8q] |
| Collaborateurs | **> 850** | groupe | non précisé | déclaré sur le site :cite[g8q] |
| Clients | **> 3 000** | groupe | non précisé | déclaré sur le site :cite[g8q] |
| CA entité française | **60,4 M€** | GENERIX GROUP SASU | 2022 | comptes déposés :cite[n1k] |
| Résultat net | 4,2 M€ | idem | 2022 | comptes déposés :cite[n1k] |
| Fonds propres | 56,8 M€ | idem | 2022 | comptes déposés :cite[n1k] |
| Effectif INSEE | 250 à 499 | idem | donnée 2023 | INSEE :cite[n1k] |
| Clôture d'exercice | 31/03 | — | — | greffe :cite[n1k] |

**Écart à ne surtout pas gommer : 110 M€ groupe contre 60,4 M€ pour l'entité française.** Les deux chiffres sont justes, sur deux périmètres différents. Les confondre serait une faute, et c'est l'erreur que commettent la plupart des fiches en ligne.

**Ventilation du CA par activité : non disponible.** Generix n'est plus coté ; la ventilation par nature de revenu (édition / SaaS / services) publiée à l'époque de la cotation :cite[sil,aqj] n'a plus d'équivalent aujourd'hui. Aucune ventilation par activité, et donc aucune part attribuable à l'activité PA, n'est publique. **Nous ne l'estimerons pas.**

Financement : refinancement assuré en 2025 par Bain Capital Credit et Eurazeo Private Debt ; Montefiore Investment est entré au capital aux côtés de l'actionnaire historique Pléiade Investissement :cite[g8q].

**Divergence relevée, et écartée :** un agrégateur affiche 243,7 M$ de CA :cite[as8], soit plus du double du chiffre déclaré par l'entreprise. Illustration directe de la règle du § 5 du modèle : les agrégateurs ne font pas foi.

---

## Faits — l'activité plateforme agréée

- Marque produit dédiée : **GIS — Generix Invoice Services** :cite[d3c].
- Page dédiée « Plateforme agréée (PA) pour la facturation électronique en France », avec fiche produit téléchargeable :cite[bfd].
- Immatriculée le 11/12/2025, donc **vague V1** :cite[a37].
- La facturation électronique figure dans l'arborescence du site comme sous-rubrique d'un ensemble « EDI, services et facturation électronique » :cite[bfd,aqe].
- Modèle tarifaire relevé par un comparateur : facturation **à la facture traitée**, sans prix public :cite[drl].
- **Distribution indirecte confirmée** : l'intégrateur Applium commercialise « GenerixByApplium », une offre à destination des clients SAP explicitement adossée à la plateforme agréée de Generix :cite[eju].

Ce dernier point est le plus important du relevé : il documente un cas de **socle revendu à un tiers**. Cela alimente directement `fournisseurDeSocle: true` et `modeDistributionSocle: ["via integrateur"]`, et fait entrer Generix dans la courte liste des fournisseurs de socle du marché.

---

## Faits — références clients et réputation

`[non relevé]` — Références clients par secteur : à extraire des pages « clients » et « études de cas », en séparant les références du catalogue global des références spécifiquement PA.

`[non relevé]` — Avis publics : la recherche sur G2 / Capterra / Gartner Peer Insights n'a pas abouti dans cette passe (échec réseau, non pas absence de source). À reprendre.

`[non relevé]` — Offres d'emploi ouvertes et part liée à la facturation électronique : à relever sur le site carrières, à une date donnée.

Ces trois trous sont ceux qui coûtent le plus de temps par société. Ils confirment l'estimation de 30 à 45 minutes par fiche complète.

---

## Lecture — centralité de l'activité PA

**Indice retenu : 2 sur 4 — `extension_naturelle`. Confiance : moyenne.**

Indices poussant vers le haut :
- marque produit dédiée, GIS :cite[d3c] ;
- page produit structurée avec fiche téléchargeable :cite[bfd] ;
- immatriculation dès la première vague, décembre 2025 :cite[a37] ;
- socle revendu à un intégrateur tiers :cite[eju], ce qui suppose une industrialisation réelle.

Indices poussant vers le bas :
- le discours corporate est centré sur la supply chain, les entrepôts et le transport ; la facturation n'apparaît qu'incidemment, dans « 4 milliards de commandes et de factures » :cite[g8q] ;
- aucune entité juridique dédiée : l'immatriculation est portée par GENERIX GROUP elle-même ;
- l'offre PA est rattachée à la rubrique EDI, elle n'est pas une branche autonome :cite[bfd,aqe] ;
- les deux acquisitions récentes, DDS et Keyneo, portent sur le transport et l'omnicanal, pas sur la facturation :cite[g8q] — les capitaux vont ailleurs ;
- catalogue de plus de sept lignes d'activité.

**Lecture :** l'activité de plateforme agréée serait chez Generix le prolongement naturel de trente ans de flux EDI B2B, et non une nouvelle orientation stratégique. Elle bénéficierait d'un socle et d'une base installée déjà en place, ce qui expliquerait à la fois l'immatriculation précoce et l'absence d'investissement dédié visible. L'intuition initiale — « ce n'est pas vraiment leur métier » — est cohérente avec les indices relevés, à une nuance près : l'offre est structurée, nommée et déjà revendue à des tiers, ce qui la distingue nettement d'une simple mise en conformité défensive.

**Ce qui manquerait pour trancher au-delà de la lecture :** la part de CA de l'activité, qui n'est pas publiée et ne le sera pas.

---

## Lecture — capacité de frappe

Détenue par des fonds (Montefiore, Pléiade), refinancée en 2025 par de la dette privée (Bain Capital Credit, Eurazeo Private Debt) :cite[g8q]. Structure qui donne une capacité d'investissement et de tenue de prix supérieure à celle d'une PME indépendante, mais qui impose aussi une discipline de marge — ce qui, en toute hypothèse, joue plutôt **contre** une politique de prix agressive et durablement déficitaire sur une ligne annexe. Aucun élément public ne permet de documenter une pratique tarifaire, et le tarif n'est pas publié :cite[drl].

---

## Ce que ce pilote démontre

1. **Le modèle tient.** Sur une société, avec quatre sources publiques, on obtient une fiche nettement plus utile que l'intégralité de ce qui est aujourd'hui dans le référentiel.
2. **La donnée la plus demandée n'existe pas** — la part de CA par activité — mais l'indice de centralité y répond de façon défendable.
3. **Le 360 produit des effets de bord précieux** : ici, la découverte d'un cas de socle revendu, qui alimente un axe existant du référentiel.
4. **La charge est réelle** : 30 à 45 minutes par société, dont la moitié sur clients, avis et recrutements.
5. **Le double périmètre CA groupe / CA entité française est un piège systématique.** Il doit être structurel dans le schéma, pas laissé à la vigilance de celui qui remplit.
