# Modèle d'analyse 360 des entreprises porteuses des plateformes agréées

**Emplacement :** `Info IA/plateformes-agreees/cartographie-360-modele.md`
**Rédigé le :** 21/08/2026 · **Décidé par :** Bruno BARTOLI
**Remplace :** rien. **Réoriente :** la finalité du référentiel.
**Périmètre :** les 163 entrées, françaises comme étrangères.

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

Additif, à ajouter dans `data/pa-taxonomie.json` et alimenté par patch. Ne remplace aucun champ existant.

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
    "caGroupe": { "montantMEUR": 110, "exercice": null, "nature": "declare_site", "source": "…", "dateReleve": "…" },
    "caEntiteFrancaise": { "montantMEUR": 60.4, "exercice": "2022", "nature": "comptes_deposes", "source": "…" },
    "resultatNet": null,
    "effectifGroupe": 850,
    "effectifEntite": "250-499",
    "ventilationParActivite": {
      "disponible": false,
      "motif": "société non cotée, aucune ventilation publiée depuis le retrait de la cote",
      "derniereVentilationConnue": null
    }
  },
  "centralitePA": {
    "indice": 2,
    "niveau": "extension_naturelle",
    "marqueProduitDediee": "GIS — Generix Invoice Services",
    "entiteJuridiqueDediee": false,
    "faisceauIndices": [
      { "signal": "marque produit dédiée", "sens": "+", "preuve": "…" },
      { "signal": "discours corporate centré supply chain", "sens": "−", "preuve": "…" }
    ],
    "lecture": "…",
    "confiance": "moyenne"
  },
  "dynamique": {
    "offresEmploiOuvertes": null,
    "offresLieesFacturationElectronique": null,
    "dateReleveOffres": null,
    "mixOffres": [],
    "signauxCroissance": [],
    "signauxTension": []
  },
  "reputation": {
    "avis": [ { "plateforme": "G2", "note": null, "nbAvis": null, "dateReleve": null, "url": null } ],
    "volumeAvis": "faible | moyen | eleve | inexistant",
    "synthese": null,
    "confiance": "non_qualifie"
  },
  "referencesClients": {
    "nbCiteesSurSite": null,
    "parSecteur": { "retail": [], "industrie": [], "sante": [], "transport": [], "public": [], "services": [] },
    "grandsComptes": [],
    "referencesPAConfirmees": [],
    "attention": "références déclaratives, portant sur l'ensemble du catalogue et non sur l'activité PA",
    "source": null
  },
  "capaciteDeFrappe": {
    "actionnaires": [],
    "typeActionnaire": "fonds_PE | industriel | fondateurs | cote | filiale",
    "financementRecent": null,
    "acquisitions": [],
    "modeleTarifaire": null,
    "tarifPublie": null,
    "offreGratuite": false
  },
  "lectureConcurrentielle": "…",
  "droitDeReponse": { "signale": false, "date": null, "objet": null }
}
```

---

## 4. L'indice de centralité : barème

C'est le cœur du modèle. Cinq niveaux, évalués sur **indices observables uniquement**.

| Indice | Niveau | Définition | Indices caractéristiques |
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

---

## 5. Sources, par bloc

| Bloc | Sources de premier rang | Sources de second rang |
|---|---|---|
| Activités | site de l'éditeur : menu, catalogue, page « à propos » | comparateurs de marché, communiqués |
| Poids économique | comptes déposés (annuaire-entreprises, Pappers, BODACC), communiqués de résultats, page « faits marquants » | presse économique, agrégateurs (à traiter comme indicatifs et à signaler comme tels) |
| Centralité | site de l'éditeur, offres d'emploi, communiqués | interviews dirigeants, webinars |
| Dynamique | site carrières de l'éditeur, job boards | LinkedIn (**agrégats uniquement**) |
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
6. **Turnover : on ne le publie pas.** Il n'est pas mesurable de l'extérieur. Un volume d'offres d'emploi n'est pas un turnover, et le présenter comme tel serait faux.
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
