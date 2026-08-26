# Modèle d'analyse 360 des entreprises porteuses des plateformes agréées

**Emplacement :** `Info IA/plateformes-agreees/cartographie-360-modele.md`
**Rédigé le :** 21/08/2026 · **Décidé par :** Bruno BARTOLI
**Révisé le :** 26/08/2026 — § 3 et § 4 alignés sur le schéma `analyse360` v1.1. Les § 1, 2, 5, 6, 7, 8 et 9 sont inchangés : la méthode et les règles de publication n'ont pas bougé, seule l'écriture du JSON est corrigée.
**Remplace :** rien. **Réoriente :** la finalité du référentiel.
**Périmètre :** les 163 entrées, françaises comme étrangères.

> ⚠️ **Ce document décide du fond. `SCHEMA-360.md` décide de la forme.**
> L'exemple JSON du § 3 a été recopié tel quel par les fiches produites entre le 21 et le 26/08/2026. Trois de ses écritures ne correspondaient pas au contrat de données réellement lu par `js/pa-detail.js` : `centralitePA.niveau` au lieu de `valeur` (47 fiches, 26 pages amputées de leur section Centralité), l'actionnariat à la racine de `capaciteDeFrappe` (49 regroupements a posteriori), et un `caEntiteFrancaise` sans `dateReleve` (32 blocs financiers non rejouables). L'exemple ci-dessous est corrigé. **En cas de doute, `SCHEMA-360.md` fait foi sur la forme, ce document sur le fond.**

---

## 1. Le changement de finalité

Jusqu'au 19/08/2026, le référentiel décrivait des **personnes morales** : SIREN, code APE, date de création, tranche d'effectif. C'est de l'état civil. Ça ne dit rien de ce qui intéresse un lecteur qui doit choisir une plateforme, ni un acteur du marché qui doit comprendre à qui il a affaire.

**Nouvelle finalité : décrire des entreprises vivantes.** Que font-elles, comment gagnent-elles leur argent, quelle place la plateforme agréée occupe-t-elle dans leur activité, qui sont leurs clients, comment évoluent-elles, et comment sont-elles perçues.

La question centrale, celle qui structure tout le modèle :

> **L'activité de plateforme agréée est-elle le cœur du métier, un axe stratégique, une extension naturelle, une activité annexe, ou une simple mise en conformité défensive ?**

Cas d'école, vérifié le 21/08/2026 : **Generix**. Groupe de 110 M€ de CA, 850 collaborateurs, dont le discours corporate parle d'entrepôts, de transport et de flux de marchandises :cite[g8q]. La plateforme agréée y existe sous une marque produit dédiée, **GIS — Generix Invoice Services** :cite[d3c], avec une page et une fiche produit :cite[bfd]. Elle est donc réelle et visible, mais elle reste **une ligne parmi six ou sept** dans un catalogue WMS / TMS / omnicanal / EDI / portails. Un lecteur qui ne verrait que « GENERIX Group » dans la liste DGFiP passerait complètement à côté de cette réalité.

---

## 2. Ce qu'on peut obtenir, et ce qu'on n'obtiendra pas

Il faut le dire d'entrée, parce que cela détermine la méthode.

| Donnée souhaitée | Disponibilité réelle | Source |
|---|---|---|
| Activités et lignes de métier | ✅ **toujours** | site de l'éditeur, catalogue produit, menu principal |
| CA de l'entité française | ✅ **très souvent** — comptes déposés | annuaire-entreprises.data.gouv.fr, Pappers, BODACC |
| CA groupe | ✅ souvent — communiqué ou page « à propos » | site, presse, rapport annuel |
| Effectif | ✅ souvent (déclaratif site + tranche INSEE) | site, INSEE |
| Résultat net, fonds propres, endettement | ✅ si comptes déposés et non confidentiels | comptes sociaux |
| Actionnariat, fonds, dette privée, acquisitions | ✅ souvent | greffe, presse économique, site |
| **Répartition du CA par activité** | ❌ **quasi jamais** hors sociétés cotées | — |
| Part du CA attribuable à l'activité PA | ❌ **jamais publiée** | — |
| Références clients | ✅ souvent, mais **déclaratives** | pages « clients », « témoignages », logos |
| Références clients **spécifiquement PA** | ⚠️ rare | communiqués, études de cas datées |
| Avis et satisfaction | ⚠️ inégal | G2, Capterra, Gartner Peer Insights, Trustpilot |
| Dynamique de recrutement | ✅ observable | site carrières, job boards |
| Turnover | ❌ non mesurable de l'extérieur de façon fiable | — |
| Tarifs | ⚠️ rarement publiés | grilles publiques, comparateurs |

**Conséquence méthodologique majeure :** puisque la ventilation du CA par activité n'existe pas, on ne l'invente pas. On construit à la place un **indice de centralité** à partir d'indices observables et vérifiables. C'est une lecture assumée, affichée comme telle, et pas un pourcentage inventé.

Sur Generix, la seule ventilation jamais publiée l'a été à l'époque de la cotation (édition / SaaS / services, par nature de revenu et non par activité) :cite[sil,aqj]. Depuis le retrait de la cote et l'arrivée de Montefiore aux côtés de Pléiade, cette information a disparu. Ce sera le cas de la grande majorité des 147.

---

## 3. Le bloc `analyse360`

Additif, porté par chaque plateforme dans `data/plateformes-agreees.json` et alimenté par patch. Ne remplace aucun champ existant. Le vocabulaire contrôlé, lui, vit dans `data/pa-taxonomie.json` : ce fichier ne contient pas de fiches, il contient les facettes et leurs valeurs autorisées.

Exemple normatif, à la forme du schéma v1.1 — données Generix relevées le 21/08/2026 :

```json
"analyse360": {
  "metierPrincipal": "Édition de logiciels supply chain et flux financiers",
  "activites": [
    { "libelle": "Exécution logistique (WMS)", "poids": "majeur", "source": "…" },
    { "libelle": "Transport (TMS)", "poids": "majeur", "source": "…" },
    { "libelle": "EDI / intégration B2B", "poids": "majeur", "source": "…" },
    { "libelle": "Facturation électronique / plateforme agréée", "poids": "significatif", "source": "…" }
  ],
  "poidsEconomique": {
    "caGroupe": { "montantMEUR": 110.00, "exercice": null, "nature": "declare_site", "source": "…", "dateReleve": "2026-08-21" },
    "caEntiteFrancaise": { "montantMEUR": 60.40, "exercice": "2022", "nature": "comptes_deposes", "source": "…", "dateReleve": "2026-08-21" },
    "resultatNet": null,
    "effectifGroupe": "850",
    "effectifEntite": "250-499",
    "ventilationParActivite": {
      "disponible": false,
      "motif": "société non cotée, aucune ventilation publiée depuis le retrait de la cote",
      "derniereVentilationConnue": null
    },
    "lecture": null, "source": "…", "dateReleve": "2026-08-21", "confiance": "haute",
    "complements": {}
  },
  "centralitePA": {
    "valeur": "extension_naturelle",
    "indice": 2,
    "marqueProduitDediee": "GIS — Generix Invoice Services",
    "entiteJuridiqueDediee": false,
    "faisceauIndices": [
      { "signal": "marque produit dédiée", "sens": "+", "preuve": "…" },
      { "signal": "discours corporate centré supply chain", "sens": "−", "preuve": "…" }
    ],
    "lecture": "…", "source": "…", "dateReleve": "2026-08-21", "confiance": "moyenne",
    "complements": {}
  },
  "postureCommerciale": {
    "valeur": "canal_indirect",
    "modeleTarifaire": null, "tarifPublie": null, "offreGratuite": false,
    "preuve": "…", "lecture": "…", "source": "…", "dateReleve": "2026-08-21", "confiance": "moyenne",
    "complements": {}
  },
  "dynamique": {
    "offresEmploiOuvertes": null,
    "offresLieesFacturationElectronique": null,
    "naturesPostes": [],
    "mixOffres": [],
    "signauxCroissance": [],
    "signauxTension": [],
    "dateReleveOffres": "2026-08-21",
    "lecture": "…", "commentaire": "…", "source": "…", "confiance": "non_qualifie",
    "complements": {}
  },
  "reputation": {
    "avis": [
      { "plateforme": "G2", "note": null, "noteBrute": null, "nombreAvis": null, "nombreAvisBrut": null, "dateReleve": null, "source": null }
    ],
    "synthese": null, "distribution": null, "lecture": null,
    "source": null, "dateReleve": null, "confiance": "non_qualifie",
    "complements": {}
  },
  "referencesClients": {
    "nbCiteesSurSite": null,
    "perimetre": "catalogue complet, non spécifique à l'activité PA",
    "parSecteur": { "retail": [], "industrie": [], "sante": [], "transport": [], "public": [], "services": [] },
    "libellesSecteursEditeur": [],
    "grandsComptes": [],
    "referencesPAConfirmees": [],
    "attention": "références déclaratives, portant sur l'ensemble du catalogue et non sur l'activité PA",
    "lecture": null, "commentaire": null, "source": null, "dateReleve": null, "confiance": "non_qualifie",
    "complements": {}
  },
  "capaciteDeFrappe": {
    "canal": null, "maillage": null, "effectifCommercial": null, "investissementsAnnonces": null,
    "acquisitions": [],
    "financementRecent": null,
    "actionnariat": {
      "type": "fonds_PE",
      "actionnaires": [],
      "commentaire": null, "source": null, "dateReleve": null
    },
    "modeleTarifaire": null, "tarifPublie": null, "offreGratuite": false,
    "lecture": null, "source": null, "dateReleve": null, "confiance": "non_qualifie",
    "complements": {}
  },
  "lectureConcurrentielle": "…",
  "droitDeReponse": {
    "signale": false, "date": null, "objet": null,
    "pointsContestables": [], "canal": null,
    "lecture": null, "source": null, "confiance": "non_qualifie"
  }
}
```

### Les six écritures qui coûtent une section de page

| À écrire | Jamais | Ce que coûte l'erreur |
|---|---|---|
| `centralitePA.valeur` | `centralitePA.niveau` | 47 fiches concernées, 26 pages avaient perdu toute la section Centralité |
| `valeur: "axe_strategique"` | `"axe_stratégique"` | jeton ASCII `snake_case` : accentué, il ne se rapproche plus de `pa-taxonomie.json` et la page perd libellé, définition et position sur l'échelle 0-4 |
| `capaciteDeFrappe.actionnariat.{type, actionnaires}` | `actionnaires` et `typeActionnaire` à la racine du bloc | 49 regroupements a posteriori |
| `dateReleve` sur chaque bloc financier, **même quand le montant est `null`** | un `caEntiteFrancaise` sans date | 32 blocs non rejouables : impossible de savoir si l'absence de chiffre datait de la veille ou d'un mois |
| `reputation.avis[]`, tableau d'objets, `nombreAvis` | `note` / `nbAvis` / `volumeAvis` à la racine du bloc | 35 clés différentes pour un même concept, dont 28 uniques |
| `droitDeReponse` objet, avec `pointsContestables` | le bloc livré en chaîne de caractères | 33 fiches, bloc muet à l'affichage |

Un pseudo-énuméré du type `"typeActionnaire": "fonds_PE | industriel | fondateurs | cote | filiale"` est une **liste de choix pour le rédacteur**, jamais une valeur à recopier telle quelle dans une fiche. On en choisit une.

**Et si la recherche ne rentre pas dans ce moule ?** Chaque bloc objet accepte une clé `complements`, objet libre, rendue sur la page sous « Autres éléments relevés ». Rien ne se perd, et le schéma reste typé. On n'invente jamais une clé à la racine d'un bloc.

---

## 4. L'indice de centralité : barème

C'est le cœur du modèle. Cinq niveaux, évalués sur **indices observables uniquement**.

| Indice (`centralitePA.indice`) | Valeur (`centralitePA.valeur`) | Définition | Indices caractéristiques |
|---|---|---|---|
| **4** | `coeur_de_metier` | La plateforme agréée **est** l'activité. Sans elle, l'entreprise n'a pas d'objet. | entité créée pour la réforme, ou éditeur mono-produit facturation ; homepage entièrement consacrée à la PA |
| **3** | `axe_strategique` | Une des 2-3 lignes majeures, avec investissement visible. | marque produit dédiée + recrutements dédiés + communiqués réguliers + entité ou BU identifiée |
| **2** | `extension_naturelle` | Prolongement logique d'un métier démat / EDI / compta existant. | offre parmi 5-10 ; page dédiée mais discours corporate ailleurs ; réutilisation du socle historique |
| **1** | `activite_annexe` | Une ligne dans un catalogue large, peu portée commercialement. | une page produit, aucune communication récente, aucun recrutement dédié |
| **0** | `conformite_defensive` | Immatriculation pour ne pas perdre ses clients ou fournisseurs. | aucune offre commercialisée activement, aucune mention en page d'accueil, aucun tarif |

### Indices retenus, et leur sens

**Poussent vers le haut :** marque produit dédiée · entité juridique dédiée · présence dans le menu principal du site · nombre de communiqués sur 12 mois · offres d'emploi mentionnant la facturation électronique · réseau de partenaires revendeurs · grille tarifaire publique · nombre d'études de cas PA.

**Poussent vers le bas :** absence de la page d'accueil · discours corporate orienté vers un autre métier · aucun contenu daté de moins de 12 mois · aucune référence client PA · catalogue de plus de 10 offres.

**Interdit :** convertir cet indice en pourcentage de CA. L'indice mesure une intensité d'engagement observable, pas un poids économique.

**L'indice n'est pas libre : il découle de la valeur.** Les six correspondances ci-dessus sont celles de `data/pa-taxonomie.json`, et toute incohérence entre les deux est corrigée en faveur de la taxonomie. Une plateforme non qualifiée se code `valeur: "non_qualifie"` et `indice: null` — jamais `indice: 0`, qui signifie « conformité défensive », c'est-à-dire une qualification, pas une absence de qualification.

**Les valeurs s'écrivent en ASCII, sans accent, en `snake_case`** : `coeur_de_metier`, `axe_strategique`, `extension_naturelle`, `activite_annexe`, `conformite_defensive`, `non_qualifie`. Ce ne sont pas des libellés de lecture — le libellé affiché sur la page et sa définition viennent de la taxonomie.

---

## 5. Sources, par bloc

| Bloc | Sources de premier rang | Sources de second rang |
|---|---|---|
| Activités | site de l'éditeur : menu, catalogue, page « à propos » | comparateurs de marché, communiqués |
| Poids économique | comptes déposés (annuaire-entreprises, Pappers, BODACC), communiqués de résultats, page « faits marquants » | presse économique, agrégateurs (à traiter comme indicatifs et à signaler comme tels) |
| Centralité | site de l'éditeur, offres d'emploi, communiqués | interviews dirigeants, webinars |
| Dynamique | site carrières de l'éditeur, job boards | LinkedIn (**agrégats uniquement**) |
| Posture commerciale | site de l'éditeur : page partenaires, programme revendeurs, grille tarifaire | annuaires de partenaires, communiqués conjoints |
| Réputation | G2, Capterra, Gartner Peer Insights, Trustpilot — **note et volume, avec date de relevé** | forums professionnels |
| Références clients | pages « clients » / « témoignages » / logos, études de cas | communiqués conjoints |
| Capacité de frappe | greffe (actionnariat, comptes), site, presse économique | bases d'investisseurs |

**Les agrégateurs de données d'entreprise** (ZoomInfo, PitchBook, Tracxn et similaires) donnent souvent des chiffres divergents de plusieurs ordres de grandeur par rapport aux comptes déposés. Ils ne sont pas retenus comme source de valeur, seulement comme indice à confirmer.

---

## 6. Règles de publication — publication intégrale assumée

Décision de Bruno du 21/08/2026 : **l'analyse est publiée sur rfe.fluxym.com**, y compris réputation, dynamique et lecture concurrentielle. Le référentiel n'est pas un outil interne.

Ce choix engage Fluxym, qui est elle-même un acteur de ce marché. Il n'est tenable qu'avec une discipline stricte, non négociable :

1. **Tout élément publié porte sa source et sa date de relevé.** Une affirmation sans source n'est pas publiée. Jamais.
2. **Séparation typographique et lexicale du fait et de la lecture.** Le fait : « le discours corporate est centré sur la supply chain, source X, relevé le JJ/MM ». La lecture : signalée comme telle, dans un champ `lecture` distinct, au conditionnel.
3. **Aucun jugement de valeur, aucun superlatif, aucun comparatif entre deux plateformes nommées.** On décrit, on ne classe pas. Pas de « meilleur », pas de « faible », pas de « en difficulté ».
4. **Réputation : uniquement des agrégats publics** — note moyenne, nombre d'avis, plateforme, date. **Jamais la citation d'un avis individuel**, jamais de reformulation d'un avis négatif, jamais de note calculée par nous.
5. **Aucune donnée personnelle.** Les dirigeants ne sont mentionnés que dans leur fonction publique. Rien sur des salariés identifiables. Rien issu de profils individuels.
6. **Turnover : on ne le publie pas.** Il n'est pas mesurable de l'extérieur. Un volume d'offres d'emploi n'est pas un turnover, et le présenter comme tel serait faux. Le bloc `dynamique` porte cette réserve par écrit, dans son champ `commentaire`, sur chaque fiche qui pose un compteur d'offres.
7. **Droit de réponse ouvert et visible.** Une mention sur la page et un canal de contact. Toute demande de correction sourcée est appliquée, et tracée dans `analyse360.droitDeReponse`.
8. **Fluxym se déclare.** La page indique explicitement que l'éditeur du site est un acteur du marché décrit. C'est la condition de la crédibilité : un lecteur informé du biais possible fait davantage confiance qu'un lecteur qui le découvre.
9. **Aucune donnée sur Fluxym ou ses partenaires ne bénéficie d'un traitement de faveur.** Même barème, mêmes sources, même exigence.

Ces règles ne sont pas de la prudence excessive : elles sont ce qui distingue un référentiel qui fait autorité d'un document attaquable en dénigrement. Un concurrent peut contester une opinion ; il ne peut pas contester un fait sourcé et daté.

---

## 7. Réorganisation des chantiers

Le chantier G devient le chantier central. Les autres deviennent ses fournisseurs.

| Chantier | Rôle dans la nouvelle cible |
|---|---|
| **A** — sites web | **prérequis absolu de G.** Sans URL, aucune analyse. À lancer en premier, sur les 147. |
| **B** — SIREN | devient la clé d'accès aux **comptes déposés**, donc au poids économique. Change de nature : ce n'est plus de l'état civil, c'est la porte d'entrée financière. |
| **C** — dirigeants | secondaire. Utile pour l'actionnariat, sans plus. |
| **D** — Peppol | conservé. Indice technique, peu discriminant sur le 360. |
| **E** — qualification marché | **fusionne de fait avec G.** Les 12 axes de E sont un sous-ensemble du bloc `activites` + `centralitePA`. À traiter dans la même passe, société par société, plutôt qu'en deux chantiers séparés. |
| **F** — identité internationale | conservé, mais **déclassé** : le 360 s'applique aux étrangères exactement comme aux françaises, et il apporte bien plus qu'un numéro de registre. |
| **G** — analyse 360 | **le chantier principal.** Une société à la fois. |

**Réalisme sur la charge :** une fiche 360 correctement sourcée représente 30 à 45 minutes de travail. Pour 147 sociétés, c'est de l'ordre de 90 heures. Ce n'est pas un chantier qu'on termine, c'est un chantier qu'on entretient. D'où le séquencement proposé.

### Séquencement proposé

1. **Le top 30 par notoriété** — ceux que tout le monde cherche, et ceux qui croisent réellement Fluxym. Valeur immédiate.
2. **Les 20 pure-players et entités créées pour la réforme** — les plus faciles (indice de centralité 4, catalogue mono-produit) et les plus révélateurs du marché.
3. **Les groupes internationaux** — souvent les mieux documentés, comptes consolidés publics.
4. **La longue traîne** — au fil de l'eau, en priorisant ce qui remonte du terrain.

---

## 8. Ce que ça change pour le site

- Une fiche plateforme devient une **fiche entreprise**, dont la plateforme agréée n'est qu'un chapitre.
- Nouveau filtre de premier plan : **la centralité**. « Montre-moi les plateformes dont c'est le cœur de métier » est la requête la plus utile du référentiel, et personne ne la propose aujourd'hui.
- Nouveau filtre : **secteur des références clients**.
- Un bloc « poids économique » avec ses chiffres sourcés et datés, et l'absence de ventilation par activité affichée comme un fait, pas masquée.
- Une page méthodologie publique, reprenant le § 6. Elle n'est pas optionnelle : c'est elle qui rend le reste défendable.

---

## 9. Concurrence sur ce terrain

Constat du 21/08/2026 : plusieurs sites publient déjà des listes et des « fiches » de plateformes agréées — comparateurs, guides, cabinets, éditeurs qui listent leurs concurrents pour capter du trafic :cite[d3c,a37,drl].

Tous s'arrêtent à la même chose : la liste, un logo, deux lignes de description, parfois un tarif. **Aucun ne fait d'analyse d'entreprise.** C'est exactement l'espace que ce modèle occupe, et c'est ce qui rend le référentiel défendable dans le temps : la liste DGFiP est copiable en dix minutes, une analyse 360 de 147 sociétés ne l'est pas.
