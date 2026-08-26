# Contrôle du lot 360-L61 à 360-L80

- Fichier contrôlé : `data/plateformes-agreees.json` livré le 26/08/2026 (4 234 325 octets)
- Fiches `analyse360` : **110** sur 163 plateformes (90 avant ce lot, aucune disparue)
- Fiches ajoutées (20) : FISKALTRUST, FULLL, GESTAV, GROUPE SIGMA, IAF, ICD International, IGA ASSURANCE, INDY, INFOLOGIC, iPaidThat, KALANDA, KLEKOON, KOLECTO PA, KOLECTO PDP, LOGILEC, LUNDI MATIN, MACOMPTA.FR, N2F PDP, NEOTIMO, NUMERIA
- Fiches retouchées (4) : AVALARA, EDICOM Group, PAGERO, SOVOS (bloc `reputation`, correction mineure)

## 1. Verdict

Le lot est **le meilleur produit à ce jour**. La dérive de schéma qui avait coûté 421 transformations et 13 pages blanches sur les soixante premières fiches a quasiment disparu : **10 transformations** au total sur 110 fiches, dont **aucune** imputable aux vingt nouvelles, hors LOGILEC.

| indicateur | L1-L60 | L61-L80 |
|---|---:|---:|
| taille moyenne d'une fiche | 16 880 car. | **25 498 car.** |
| sources par fiche | ~12 | **37** |
| taux d'accentuation de la prose | 0-1 % sur 8 fiches | 18-24 % (médiane corpus 25 %) |
| blocs `dynamique` produits | 5 | **19 sur 20** |
| blocs financiers sans `dateReleve` | 32 | **0** |
| pages en échec de rendu | 13 | **0** |

Le bloc `dynamique` — le chantier perdu entre `BRIEF-G` et le prompt v1 — est enfin produit : 19 fiches sur 20, avec `naturesPostes` détaillé, `dateReleveOffres` posée même quand les compteurs restent à `null`, et une lecture qui rappelle d'elle-même qu'un volume d'offres n'est pas une mesure de rotation du personnel.

## 2. Un défaut que j'ai introduit moi-même

La passe de réaccentuation du 26/08 au matin a accentué **des jetons de vocabulaire fermé** : `axe_stratégique`, `coeur_de_métier`, `base_installée`, `conquête_directe`. Dix valeurs sur huit fiches (ABBY, AVALARA, DOCOON, DOCOON IMMO / FREEDZ, EURO INFORMATION, OPENTEXT, SAP).

Conséquence mesurée : `pa-taxonomie.json` ne reconnaît plus la valeur, donc la page affiche le jeton brut avec ses tirets bas, **sans libellé, sans définition, et sans la position sur l'échelle 0-4**. La section restait visible, ce qui explique qu'elle soit passée au travers du test visuel.

Corrigé sur trois niveaux :
1. `tools/arbitrate-360.py` exclut désormais de la réaccentuation les clés de vocabulaire (`valeur`, `niveau`, `indice`, `confiance`, `nature`, `type`, identifiants, dates) et tout jeton `snake_case` sans espace.
2. `tools/normalize-360.py` dé-accente et **recale** automatiquement ces valeurs sur le vocabulaire, au lieu de se contenter de les signaler : le défaut est désormais auto-réparable.
3. `SCHEMA-360.md` et `PROMPT-FICHE-360.md` énoncent la règle : la prose est accentuée, les jetons ne le sont jamais.

## 3. Un chantier resté invisible : le bloc `dynamique`

`js/pa-detail.js` n'affichait que trois champs du bloc : `offresEmploiOuvertes`, `offresLieesFacturationElectronique`, `dateReleveOffres`. Tout le reste du travail des vingt nouvelles fiches ne s'affichait pas :

| champ | fiches concernées | statut avant |
|---|---:|---|
| `naturesPostes` | 19 | non affiché |
| `lecture` | 19 | non affiché |
| `complements` | 19 | non affiché |
| `source` | 21 | non affiché |
| `confiance` | 20 | non affiché |
| `mixOffres` / `signauxCroissance` / `signauxTension` | 4 | non affiché |

Le renderer a été complété. Gain mesuré sur le harness : **+50 183 caractères de HTML rendu**, soit l'intégralité des blocs `dynamique`, dont environ 2 200 caractères d'analyse par fiche neuve.

## 4. LOGILEC — la seule fiche faible du lot

- 16 441 caractères contre 25 498 en moyenne sur le lot ;
- seule fiche du lot **sans bloc `dynamique`** ;
- `poidsEconomique.effectif` au lieu de `effectifEntite` (défaut du lot 1, réapparu une fois) ;
- `droitDeReponse` livré en chaîne nue au lieu d'un objet ;
- `montantMEUR: 125.307788` — huit décimales sur un montant en millions.

Les quatre points sont réparés par la normalisation, mais la fiche reste courte. À reprendre si le sujet le mérite.

## 5. Points restant à l'arbitrage humain

1. **AGENA 3000 — je me suis trompé en première lecture, correction.** J'avais qualifié son `analyse360` de coquille. Vérification faite sur ses sources : `postureCommerciale.valeur = grossiste` y est **sourcé** — programme partenaires de l'offre A3 E-INVOICING, relevé le 20/08/2026, confiance renseignée. C'est une qualification légitime du chantier « grossistes », pas un résidu. Rien à retirer.
   En revanche les deux objets ne se comptent pas ensemble : `analyse360_entamee = 110` additionnait 109 fiches complètes et 1 plateforme qualifiée sur une seule facette. Le normaliseur produit désormais **`analyse360_fichesCompletes` = 109**, défini comme « porte un `metierPrincipal` et un `poidsEconomique` ». Les deux compteurs coexistent, chacun mesure ce qu'il dit.
2. **FIDUCIAL CLOUD** et **MY UNISOFT** ont une `analyse360` sans aucune entrée `sourcesEnrichissement` dédiée.
3. **169 entrées `sourcesEnrichissement` sans `confiance`** et 25 sources restées `champ: non_precise`.
4. **Formulation publique.** Treize fiches du lot écrivent, dans une prose destinée au site, « le montant reste à null », « les compteurs sont laissés à null ». Le raisonnement est juste — un `null` motivé n'est pas un zéro — mais le mot est du jargon sur une page pédagogique. Le prompt demande désormais « non établi », « non publié », « constat d'absence au JJ/MM/AAAA ».

## 6. Contrôles passés

- `normalize-360.py` : **idempotent** (deux passes strictement identiques).
- `arbitrate-360.py` sur le fichier normalisé : **aucun effet** — plus rien à arbitrer automatiquement.
- Harness sur le renderer réel, 163 plateformes : **0 exception**, 0 `undefined`, 0 `[object Object]`, 0 `NaN`. Les 30 occurrences de « null » dans le HTML sont toutes des mots de la prose, contrôlées une par une.
- `node --check js/pa-detail.js` : OK.
- JSON valide, 163 plateformes, 2 932 entrées de sourcing.

## 8. `FORMAT-PATCH.md` et `REVISION-BAREME-10-FICHES.md`

Les deux derniers documents du pipeline jamais ouverts, lus depuis `main` @ `767e4b7`.

**`REVISION-BAREME-10-FICHES.md` (9 159 o) : rien à corriger, et je n'y touche pas.** C'est une note de décision datée du 21/08 qui crée la facette `postureCommerciale` pour sortir de l'indice de centralité une question qui ne lui appartenait pas — « comment cette entreprise vend-elle ? » n'est pas « quelle place l'activité agréée occupe-t-elle ? ». Elle ne contient **aucun exemple JSON**, donc aucun risque de contamination de schéma, et ses cinq valeurs (`grossiste`, `canal_indirect`, `conquete_directe`, `base_installee`, `non_qualifie`) sont écrites exactement comme dans `pa-taxonomie.json`, en ASCII. Réécrire une note de décision datée reviendrait à réécrire l'histoire du raisonnement ; sa règle « toute analyse produite se termine par un patch, sinon elle n'existe pas » reste la meilleure phrase du corpus.

**`FORMAT-PATCH.md` (2 932 o) : aucune contamination non plus, mais un silence coûteux.** Son exemple est un patch de chantier E (qualification marché) : il ne montre pas `analyse360`, donc il n'a rien pu induire en erreur sur le schéma des fiches. Le problème est ailleurs — il ne dit rien du chantier G, qui est pourtant celui qui tourne en dix conversations parallèles :

| Point non documenté | Conséquence possible sur L81+ |
|---|---|
| `_patch.reglesProposees` et `_patch.observationsTiers`, exigés par le prompt | une conversation qui suit `FORMAT-PATCH` à la lettre ne les produit pas |
| convention `_patch.id = "360-L<N>"`, chantier G, une société par patch | identifiants hétérogènes dans `_meta.fusions` |
| les tableaux **internes** à `analyse360` (`avis`, `faisceauIndices`, `naturesPostes`, `pointsContestables`, `referencesPAConfirmees`) sont remplacés, pas fusionnés | un patch correctif partiel efface silencieusement des entrées relevées |
| `complements` fusionne clé par clé | risque d'écrasement d'un complément antérieur |
| interdiction de toucher `_meta` | un patch pourrait écraser `couverture` ou `fusions` |
| passage obligatoire par `normalize-360.py` puis `arbitrate-360.py` | le rédacteur croit son patch final |
| règles 2 et 8 disaient deux fois la même chose | bruit dans une liste de huit règles impératives |

Une section « Cas particulier du chantier G » a été ajoutée, les règles 2 et 8 fusionnées, et l'interdiction de `_meta` posée. Le reste du document — clé de fusion `nom` caractère pour caractère, champ absent ≠ champ à `null`, `sourcesEnrichissement` cumulatif avec sa correction du 21/08 — est inchangé et reste juste.

## 7. `cartographie-360-modele.md` — la source de la dérive, corrigée

Document lu pour la première fois le 26/08/2026, depuis `main` @ `767e4b7` (15 666 octets, rédigé le 21/08). `BRIEF-G` impose sa lecture « avant de commencer, sans exception » : les fiches ont donc recopié son exemple JSON du § 3, qui portait trois écritures périmées. C'est **l'explication complète** de trois des cinq familles de défauts arbitrées ce matin :

| Écriture de l'exemple § 3 | Fiches contaminées | Coût constaté |
|---|---:|---|
| `centralitePA.niveau` (avec `indice` avant `valeur`) | 47 | 26 pages amputées de leur section Centralité |
| `capaciteDeFrappe.actionnaires` + `typeActionnaire` à la racine | 49 | regroupement a posteriori sous `actionnariat` |
| `caEntiteFrancaise` sans `dateReleve` (seul `caGroupe` en portait une) | 32 | blocs financiers non rejouables |
| `reputation.avis[].nbAvis` et `volumeAvis` à la racine | 35 clés distinctes | 28 clés à occurrence unique |
| `droitDeReponse: { signale, date, objet }` sans `pointsContestables` ni `lecture` | 33 | bloc muet à l'affichage |
| `dynamique` sans `naturesPostes`, `lecture`, `source`, `confiance` | 5 | bloc réduit à trois compteurs |
| `postureCommerciale` **absent de l'exemple** | — | bloc rattrapé par le prompt seul |

Le § 3 a été réécrit à la forme du schéma v1.1, sur les mêmes données Generix, et complété par un tableau « les six écritures qui coûtent une section de page » qui chiffre chaque erreur. Le § 4 précise que `indice` découle de `valeur`, que `non_qualifie` va avec `indice: null` et non `0`, et que les jetons s'écrivent en ASCII sans accent. Le § 5 gagne une ligne « Posture commerciale ». La règle 6 du § 6 renvoie désormais au champ `dynamique.commentaire` qui porte la réserve sur le turnover.

**Le fond n'a pas été touché** : la finalité (§ 1), le tableau de disponibilité des données (§ 2), le barème de centralité (§ 4), les sources par bloc (§ 5), les neuf règles de publication (§ 6), la réorganisation des chantiers (§ 7), les effets sur le site (§ 8) et l'état de la concurrence (§ 9) sont inchangés — y compris les marqueurs de citation d'origine. Ce document reste la décision de fond ; `SCHEMA-360.md` reste la décision de forme. Le prompt passe en v2.1 et énonce ce partage des rôles.

## 9. Contrôle d'affichage : la page était mal construite

Bruno a lu la fiche ABBY sur le site et a signalé une impression de redondance, « le mot Fluxym à quatre ou cinq endroits ». Le constat était juste et le problème n'était pas dans les données.

**Mesures sur la fiche ABBY, même donnée, renderer commité contre renderer corrigé :**

| | avant | après |
|---|---:|---:|
| lignes visibles à l'ouverture | 400 | **293** |
| champs vides affichés | 33 | **0**, repliés dans 6 blocs |
| mentions « Lecture Fluxym » | 5 | **1** |
| section « registre étranger » | 11 champs vides | **masquée** |
| « Modèle tarifaire » / « Tarif public » | 2 fois | **1 fois** |

**Ce qui n'allait pas, dans l'ordre de gravité.**

1. **La section « 🧭 Lecture Fluxym » ne contenait pas la lecture Fluxym** : elle contenait le canal de distribution, le maillage, l'effectif commercial, les investissements. Le titre mentait sur son contenu, et c'est ce titre qui figurait au sommaire. Renommée **« ⚙️ Capacité de frappe et distribution »**.
2. **Le bloc « Identité (registre étranger) » s'affichait pour une société française**, avec onze champs vides et une note affirmant que l'entité n'est pas au répertoire SIRENE — quatre lignes après l'affichage de son SIREN. La donnée était pourtant impeccable : `applicable: false` avec un motif circonstancié. Le renderer ignorait le drapeau. Deux plateformes concernées, ABBY et ENERJ.
3. **L'avertissement « interprétation, et non donnée relevée » était répété à l'identique cinq fois par page**, une fois par bloc portant une lecture. Il n'est plus écrit qu'une fois, sur la première lecture, avec la mention que les suivantes suivent la même règle.
4. **Les champs vides étaient déroulés en pleine page.** Ils sont repliés par bloc, derrière un « N champs non renseignés sur ce bloc » : l'information reste accessible, elle ne noie plus le relevé. Au passage, l'étiquette « Non renseigné — qualification en cours » devient « Non renseigné » : sur ABBY, « en cours » était faux, le champ était sans objet.
5. **Deux emplacements du schéma pour la même information.** Le triptyque tarifaire vit à la fois dans `postureCommerciale` et dans `capaciteDeFrappe` — 76 champs remplis aux deux endroits sur les 110 fiches. Il ne s'affiche plus qu'avec la posture qu'il documente. Un mécanisme général renvoie « Déjà indiqué plus haut, sous « … » » dès qu'un texte de plus de 60 caractères est réaffiché à l'identique.
6. **`perimetre` affichait son jeton brut**, `références_pa`. La facette **n'existait pas dans `pa-taxonomie.json`** alors que les fiches en produisaient quatre valeurs depuis le début. Elle y est déclarée, avec libellés et définitions ; le normaliseur recale les valeurs et en a réparé six, accentuées par la passe du matin.
7. **Quatorze libellés de la taxonomie s'affichaient sans accents** sur toutes les pages : « Activite annexe », « Base installee », « Immatriculation definitive », « Extension d'un metier demat existant ». **162 accents** ajoutés aux libellés, définitions et notes ; les jetons `v` et les `id` ont été vérifiés identiques au caractère près.

Les trois composants nouveaux (`.pa-vides`, `.pa-doublon`, `.pa-lecture--suite`) sont dans un `<style>` de `pa-detail.html` et non dans `css/pages.css` : le fichier fait 126 Ko et n'a pas pu être récupéré sans troncature. À rebasculer dans la feuille commune quand elle sera lisible en entier.

## 10. Deuxième passe d'accentuation : 563 formes tranchées

La passe lexicale du matin, volontairement prudente, avait laissé **129 occurrences sans accent** sur les huit fiches rédigées sans diacritiques, dont 60 `releve`, 21 `marche` et 18 `declare` — trois homographes qu'elle refusait par construction. Un dictionnaire explicite a été ajouté à `tools/arbitrate-360.py`, avec une règle de contexte pour les mots réellement ambigus : un pronom sujet devant impose la forme conjuguée, sinon c'est le participe ou le nom. Les 129 contextes ont été lus un par un avant d'entrer dans le tableau.

**563 formes corrigées, zéro texte perdu** — vérifié en comparant les 33 948 chaînes du corpus après suppression des accents : aucune différence.

Cinq garde-fous, tous nés d'une erreur constatée pendant la mise au point :

| Garde-fou | Erreur qu'il évite |
|---|---|
| adresses, domaines, chemins et noms de fichiers écartés | `avenir-numerique.fr` devenait `avenir-numérique.fr`, `cartographie-360-modele.md` devenait `…modèle.md` |
| mot capitalisé en milieu de phrase jamais touché | `B2B Integration`, `Omnicom Media Group`, `Chief Customer Experience` étaient francisés |
| énumération de slugs détectée | `conformite-hds`, `developpement` accentués dans un sitemap cité en source |
| `publie`, `verifie`, `declare`, `immatricule`, `releve`, `marche` tranchés par contexte | « le RNE ne publie pas » devenait « ne publié pas » |
| `estime` accentué seulement après `été`, `pas`, `jamais`, `non` | « l'entreprise estime que » devenait « estimé que » |

Au passage, la passe **répare neuf verbes que ma propre passe du matin avait faussement accentués** : « aucun cas client ne documenté la PA », « la réputation se limité à », « le positionnement ne se croisé pas », « la question se posé », « l'entité ne publié aucune ventilation ». Sans auxiliaire entre le pronom et le verbe, c'est du présent.

Le `a` / `à` n'est pas tranché sur le mot seul — « l'entité **a** une filiale » est un auxiliaire, « attribuable **à** la facturation » une préposition. Seules des tournures listées et les fourchettes chiffrées (« de 20 **à** 49 salariés ») sont corrigées.

**Une régression évitée de justesse.** L'arbitrage des effectifs écartait la phrase « le patch H1 avait relevé une tranche antérieure de 10 à 19 salariés (millésime 2022) ; la valeur lue ce jour est 20 à 49 » comme un doublon de millésime. C'est la trace d'une correction, pas un chiffre redondant. Une garde protège désormais toute phrase mentionnant un patch, un chantier, un écart ou une contradiction.
