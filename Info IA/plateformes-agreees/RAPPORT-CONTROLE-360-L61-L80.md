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

1. **AGENA 3000** porte un `analyse360` vide, hérité d'une passe d'enrichissement antérieure : seul `postureCommerciale.valeur = grossiste` est renseigné. Le compteur `analyse360_entamee = 110` en compte donc **109 réelles + une coquille**. À décider : produire la fiche, ou retirer le bloc.
2. **FIDUCIAL CLOUD** et **MY UNISOFT** ont une `analyse360` sans aucune entrée `sourcesEnrichissement` dédiée.
3. **169 entrées `sourcesEnrichissement` sans `confiance`** et 25 sources restées `champ: non_precise`.
4. **Formulation publique.** Treize fiches du lot écrivent, dans une prose destinée au site, « le montant reste à null », « les compteurs sont laissés à null ». Le raisonnement est juste — un `null` motivé n'est pas un zéro — mais le mot est du jargon sur une page pédagogique. Le prompt demande désormais « non établi », « non publié », « constat d'absence au JJ/MM/AAAA ».

## 6. Contrôles passés

- `normalize-360.py` : **idempotent** (deux passes strictement identiques).
- `arbitrate-360.py` sur le fichier normalisé : **aucun effet** — plus rien à arbitrer automatiquement.
- Harness sur le renderer réel, 163 plateformes : **0 exception**, 0 `undefined`, 0 `[object Object]`, 0 `NaN`. Les 30 occurrences de « null » dans le HTML sont toutes des mots de la prose, contrôlées une par une.
- `node --check js/pa-detail.js` : OK.
- JSON valide, 163 plateformes, 2 932 entrées de sourcing.
