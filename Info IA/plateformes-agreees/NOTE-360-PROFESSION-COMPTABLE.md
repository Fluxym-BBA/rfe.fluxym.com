# Chantier 360 — bloc profession comptable

**Date de relevé : 24/08/2026** · Auteur : RFE_WebSite · Patch : `patches/patch-360-PROFESSION-COMPTABLE.json` (6 fiches)

## Pourquoi ce lot

Les trois passes précédentes (contrôle d'identité, récupération de SIREN, qualification des pays) ont fait remonter, sans que ce soit l'objet de la recherche, une même famille d'acteurs : des plateformes agréées qui ne sont pas des éditeurs de logiciels mais des cabinets ou des réseaux d'expertise comptable. FITECO est apparue en cherchant un SIREN ; COGEP en cherchant un pays ; ECMA en démêlant deux numéros contradictoires dans une mention légale. Trois découvertes fortuites sur trois passes consécutives : ce n'est plus une coïncidence, c'est un canal.

Ce lot est donc le premier du chantier 360 à porter non pas sur des concurrents, mais sur un **mode d'occupation du marché**. Aucune des six sociétés analysées ne croisera l'offre portée par Fluxym sur un appel d'offres. Toutes retirent pourtant du marché adressable, par simple décision interne, les flux de facturation de plusieurs centaines de milliers de TPE et de PME.

## Les six fiches

| Fiche | Entité | SIREN | CA relevé | Indice | Posture |
|---|---|---|---|---|---|
| jefacture.com | EXPERT-COMPTABLE MÉDIA ASSOCIATION (ECMA) | 403 156 540 | aucun compte déposé (association loi 1901) | **3** axe_strategique | canal_indirect |
| MY FITECO | FITECO | 557 150 067 | **282,1 M€** (2025), RN 18,4 M€ | **1** activite_annexe | base_installee |
| CENSE | SA COGEP | 400 833 596 | **126,4 M€** (2023), RN 11,2 M€ | **1** activite_annexe | base_installee |
| Dougs Facturation gratuite | DOUGS | 810 319 517 | **24,7 M€** (2024) | **1** activite_annexe | conquete_directe |
| MY UNISOFT | MY UNISOFT | 840 143 275 | **9,8 M€** (2024), RN −1,8 M€ | **2** extension_naturelle | canal_indirect |
| FIDUCIAL CLOUD | FIDUCIAL CLOUD (NEXTO) | 480 650 712 | non restitué (entité), groupe non consolidé publiquement | **2** extension_naturelle | base_installee |

Barème du lot : 4 → 0 · 3 → 1 · 2 → 2 · 1 → 3 · 0 → 0. C'est le lot le plus bas du chantier depuis le début, et c'est un résultat, pas un déficit de recherche : pour cinq de ces six acteurs, l'agrément ne crée aucune activité, il protège une relation client.

## Ce que le lot établit

**1. Le chiffre d'affaires ne mesure pas la plateforme.** FITECO pèse 282,1 M€ et COGEP 126,4 M€, mais ce sont des honoraires comptables. Pour ces acteurs, la plateforme agréée est une ligne de coût. Publier ces montants est utile — ils disent la force de frappe et le maillage territorial, 178 établissements pour l'un, 78 pour l'autre — à condition de dire aussitôt qu'ils ne mesurent pas l'activité agréée. Aucune part attribuable n'est estimée (règles 25 et 77).

**2. Le poids économique ne se lit pas toujours dans les comptes de l'entité immatriculée.** Deux cas extrêmes dans le même lot. ECMA est une association loi 1901 : ni compte déposé, ni dirigeant au registre, ni actionnaire — et ce n'est pas de l'opacité, c'est le régime de la forme juridique (règle 68). FIDUCIAL CLOUD compte 20 à 49 salariés alors que le périmètre servi dépasse 300 000 clients ; l'INSEE la classe pourtant en « Grande Entreprise », catégorie calculée au niveau du groupe, ce qui confirme l'adossement par une donnée statistique. Lire la puissance de FIDUCIAL dans les comptes de sa filiale technique conduirait à un contresens complet (règle 36).

**3. La gratuité est une stratégie, pas un vide.** Dougs figure au référentiel sous le nom « Dougs Facturation gratuite ». jefacture.com est à 0 € HT pour les factures du cabinet lui-même. Dans les deux cas la plateforme est un produit d'appel qui alimente une mission payante : elle n'a ni prix, ni chiffre d'affaires propre, ni ventilation possible. Ce n'est pas une absence de modèle économique, c'est un modèle où le revenu est ailleurs (règle 78).

**4. Une plateforme agréée peut être détenue par ses clients.** MY UNISOFT a été fondée en 2018 par quatre cabinets — Recci, Eccentive, RSM, Exponens — puis financée par cinq levées successives auprès de cabinets d'expertise comptable, 125 d'entre eux étant actionnaires lorsque HG Capital en a pris la majorité en décembre 2024. Actionnaire et client sont la même personne. Aucune lecture concurrentielle classique ne décrit cette situation : un cabinet actionnaire ne migre pas (règle 79).

**5. Le volume est la seule grandeur comparable, et ses unités ne se convertissent pas.** Environ 4 000 cabinets abonnés (jefacture.com), 70 000 clients de l'espace numérique (My fiteco), plus de 200 000 dossiers comptables gérés (MyUnisoft, mai 2025), environ 334 000 clients de groupe et 860 agences (FIDUCIAL), 49 000 clients revendiqués et un objectif de 100 000 (Dougs). Un cabinet, un client, un dossier et une facture sont quatre choses différentes. Chaque volume est publié avec son unité, sa source et sa date, et aucun n'est converti dans un autre (règle 80).

**6. Aucune référence client nominative, chez aucun des six.** C'est le premier lot du chantier où le bloc `referencesClients` est vide pour l'intégralité des fiches, et ce vide est documenté et motivé : la déontologie et la nature de la clientèle interdisent la communication par logos. Le bloc porte donc l'explication, pas un tableau vide sans commentaire.

## Le cas particulier de COGEP

C'est la seule fiche du lot où un réseau comptable transforme la réforme en ligne de revenu plutôt qu'en ligne de coût. CENSE dispose de sa propre marque, de son propre nom de domaine et d'une grille publiée de 9 à 99 € par mois, et le périmètre annoncé dépasse la conformité : coffre-fort à valeur probante, trésorerie, notes de frais, comptes bancaires et moyens de paiement intégrés, hébergement présenté comme de type SecNumCloud chez un hébergeur français. L'indice reste 1 parce que le plafond demeure la base clients du cabinet — mais si ce modèle réussit, la nature du canal change : le cabinet devient un distributeur de logiciel qui facture, avec 78 implantations locales.

## Lecture concurrentielle d'ensemble

Le risque que ce lot met au jour n'est pas la perte d'un appel d'offres. C'est l'installation d'un réflexe : la plateforme agréée est l'affaire de l'expert-comptable. Quand près de 4 000 cabinets disposent gratuitement d'une plateforme et d'un mandat type pour y raccorder leurs clients, quand un réseau de 178 implantations développe la sienne, quand un groupe de 860 agences héberge la sienne dans ses propres centres de données au motif explicite de ne pas subir les prix d'un tiers informatique, la question du choix n'est pas perdue : elle n'est jamais posée.

Ce mode d'occupation du terrain est le plus difficile à contester parce qu'il ne passe pas par un prix. L'enseignement exploitable est argumentaire : la gratuité affichée par ces acteurs devient la référence mentale des dirigeants, y compris de ceux qui dirigent des entreprises très au-dessus de leur cible.

Fluxym est un acteur du marché. Ce référentiel est publié par un intégrateur qui distribue des solutions concurrentes, et ces lectures sont des lectures de marché, pas des évaluations.

## Découverte adjacente, hors périmètre du lot

En cherchant l'actionnariat de MY UNISOFT, une confusion a été levée puis une information établie : **MY UNISOFT n'appartient pas à ACD Groupe**, contrairement à ce que suggère la proximité des deux acteurs sur le marché du logiciel de cabinet. En revanche, **ACD Groupe a rejoint le groupe italien TeamSystem**, opération annoncée en avril 2026. TeamSystem est déjà présent au référentiel via la fiche « TeamSystem Sellsy » (SIREN 509 961 074), dont le bloc `groupeCapitalistique` mentionne ACD. Ce groupe pèse environ 1 Md€ de chiffre d'affaires et s'est construit sur la réforme italienne de la facturation électronique : c'est un profil de concurrent qui mérite une fiche 360 en propre, et cette piste est ouverte sans être traitée ici.

## Contrôles effectués avant livraison

- **Énumérations vérifiées facette par facette** contre `data/pa-taxonomie.json` (règles 23 et 72) : `centralitePA`, `postureCommerciale`, `typeActionnaire`, clés de `parSecteur`, `nature` des blocs de chiffre d'affaires. Une correction : `typeActionnaire` valait `filiale` pour FIDUCIAL CLOUD, valeur dont le libellé de taxonomie est « Filiale d'un groupe **étranger** » — FIDUCIAL étant un groupe français à capital familial, la valeur retenue est `fondateurs`, avec l'explication dans le bloc `actionnaires`.
- **Structure du bloc `analyse360`** contrôlée clé par clé et dans l'ordre, sur les six fiches.
- **Forme canonique des blocs de chiffre d'affaires** contrôlée : `montantMEUR`, `exercice`, `nature`, `commentaire`, `source`, `dateReleve`, montants en millions.
- **Simulation de fusion** exécutée : **6 fiches reconnues, 0 rejet, 0 écrasement de valeur existante, aucune suppression**. Les six blocs `analyse360` sont créés, les sources d'enrichissement sont ajoutées en cumulatif.
- **Aucun compteur global du référentiel n'est annoncé** (règle 75) : l'instantané de travail disponible est antérieur aux fusions récentes.

## Reste à faire identifié par ce lot

- **Relevé d'avis agrégés sur Dougs**, acteur à clientèle grand public très largement évalué sur les comparateurs de cabinets en ligne : c'est le seul acteur du lot pour lequel un bloc `reputation` sourcé est réellement accessible.
- **Fiche 360 de TeamSystem** (groupe italien, ~1 Md€, ACD Groupe), à traiter comme un concurrent et non comme un canal.
- **Chaîne de détention de FIDUCIAL CLOUD** jusqu'à la tête de groupe, non documentée ici et arrêtée au dernier niveau établi (règle 42).
- **Structure de détention de FITECO et de SA COGEP**, non établies : les deux fiches portent `typeActionnaire` à `non_qualifie`.
- **Répartition du capital de DOUGS** après l'entrée d'Expedition Growth Capital : la présence du fonds est établie, le contrôle ne l'est pas.
- **Vérification sur document primaire** de la création d'ECMA à l'initiative des instances de la profession, aujourd'hui appuyée sur une source tierce.
- **Décompte des entreprises effectivement raccordées** pour les six fiches : aucun des acteurs ne le publie, tous communiquent sur d'autres unités.
- **Autres plateformes du canal comptable** restant à traiter en 360 : la famille `portail_ec` du référentiel n'est pas épuisée par ces six fiches.
