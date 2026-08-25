# Cartographie — où en est le référentiel des plateformes agréées

**État mesuré le 25 août 2026**, après fusion des 7 patchs en attente.
Chiffres établis par mesure du fichier, pas de mémoire. Reconstitution post-fusion vérifiée entrée par entrée.

---

## 1. Correction préalable : deux choses ont été confondues

Dans `ORDRE-DE-FUSION.md` je t'ai annoncé « 60 fiches `analyse360` » comme contrôle de bonne fin. Le compte réel est **63**, et surtout ce nombre ne veut pas dire ce qu'il a l'air de dire.

Le champ `analyse360` sert à deux chantiers différents qui ont été empilés dedans :

| | Fiches | Contenu |
|---|---|---|
| **Chantier H1** — poids économique seul | **34** | uniquement `poidsEconomique` : chiffre d'affaires, effectif, rattachement capitalistique |
| **Chantier G** — analyse 360 complète | **29** | les 10 blocs : métier, activités, centralité, posture, références, réputation, capacité de frappe, lecture concurrentielle, droit de réponse |
| **Aucune analyse** | **100** | rien |
| **Total** | **163** | |

**Il y a donc 29 fiches réellement analysées, pas 63.** C'est une différence de nature, pas de degré : une fiche H1 dit ce que pèse une société, une fiche G dit ce qu'elle fait sur ce marché et comment on l'affronte. Toute communication interne qui annoncerait « 63 fiches analysées » serait fausse.

À porter au plan de travail comme règle : le champ `analyse360` doit distinguer explicitement le niveau d'achèvement, sinon le référentiel se surestime lui-même.

---

## 2. Où on en est, en cinq nombres

| Indicateur | Fait | Reste | Couverture |
|---|---|---|---|
| Fiches 360 complètes | 29 | 134 | **18 %** |
| Fiches avec poids économique | 63 | 100 | 39 % |
| SIREN renseignés | 105 | **58** | 64 % |
| Socle technique établi | 122 | **41** | 75 % |
| Rattachement capitalistique | 118 | 45 | 72 % |
| Liaisons entre immatriculations | 16 | — | — |
| Fournisseurs de socle identifiés | 38 | — | — |

Répartition des 163 entrées : 113 France, 8 Allemagne, 7 Italie, 7 Belgique, 6 Espagne, 3 Suède, 3 Danemark, 3 pays non établi, le reste dispersé.

Sur les 29 fiches qualifiées en centralité : **1 seule à l'indice 4** (LE VILLAGE CONNECTÉ), 11 à l'indice 3, 13 à l'indice 2, 4 à l'indice 1.
Postures : 10 base installée, 9 conquête directe, 5 grossiste, 5 canal indirect, 1 non qualifiée.

---

## 3. Le point noir : ta question de départ est celle où on a le moins avancé

Le besoin initial était **« qui sont les clients des concurrents, par secteur »**. Mesure du remplissage réel :

| | Fiches |
|---|---|
| Bloc `referencesClients` présent | 28 |
| dont **`parSecteur` réellement renseigné** | **10** |
| dont `grandsComptes` renseigné | 9 |
| dont **`referencesPAConfirmees` renseigné** | **4** |

Autrement dit : sur 163 plateformes, **10 ont une répartition sectorielle de clients**, et **4 seulement ont des références confirmées comme portant sur l'activité de plateforme agréée**.

Et le peu qui existe est fragile. Les blocs Axway ou Basware citent Bosch, TotalEnergies, DHL, Heineken, Sony — mais leur propre champ `source` précise que ce sont des **références de groupe, sur l'ensemble du catalogue, pas sur l'activité agréée française**. Un seul acteur publie de vraies références sur son offre agréée : **Paragon, 22 sociétés nommées**, et c'est exceptionnel dans le référentiel.

Secteurs cumulés sur ces 10 fiches : industrie 23, transport 9, services 8, finance 7, agroalimentaire 5, distribution 5, énergie 4, santé 4, retail 4, BTP 3.

**Ce n'est pas exploitable commercialement en l'état.** Dix fiches ne font pas une cartographie sectorielle, et mélanger références de groupe et références agréées produirait un argumentaire faux — ce qui est précisément le risque à éviter.

Deux causes, dont une seule est corrigible :
- **Cause corrigible** : les logos clients sont presque toujours affichés en images dans des bandeaux rendus par JavaScript. Aucune des passes menées ne les a relevés, faute d'avoir fait des captures de page rendue. C'est un reste à faire connu depuis le début et jamais traité.
- **Cause non corrigible** : le marché est trop jeune. La réforme n'entre en vigueur que le 1er septembre 2026 pour la réception. La plupart des acteurs n'ont pas encore de client agréé à montrer.

---

## 4. Les chantiers, dimensionnés

### Ouverts et chiffrables

| Chantier | Objet | Reste | Effort |
|---|---|---|---|
| **G** | fiches 360 complètes | 134 fiches | très lourd — arbitrage nécessaire, voir §5 |
| **G2** | grands éditeurs internationaux : Pagero, Sovos, Comarch, Opentext, Generix, Cegid, Sage | 7 fiches | 2 lots |
| **G3** | pure-players de la facturation électronique | à cadrer | 2-3 lots |
| **G4** | cercle 3, environ 90 sociétés | 90 fiches | non traitable en 360, voir §5 |
| **H2** | zones aveugles de socle technique | 41 fiches | 2-3 lots, rendement décroissant |
| **H2 clôture** | entrées sans liaison exploitable | 123 entrées | 1 lot de balayage |
| **H3** | plateformes adjacentes ETI et grands comptes | 37 fiches | 3-4 lots |
| **SIREN** | ancrage au registre | 58 fiches | 1-2 lots, mécanique |

### Transversaux, jamais traités

- **Références clients par capture de page rendue** — le vrai sujet, voir §3. À traiter en passe dédiée, pas au fil des fiches.
- **Passe « avis et offres d'emploi »** (règle 19) — c'est le seul bloc du modèle 360 systématiquement absent. Une passe unique datée sur tout le référentiel, pas fiche par fiche.
- **Routes de contrôle étranger, grille des 4 routes** — Namirial, Vertex/ecosio, Amadeus/VOXEL, Accel-KKR/BASWARE, TeamSystem. Et vérifier si Inqom porte une immatriculation.
- **Contrôle rétroactif règle 94** sur les 29 fiches 360 — deux omissions trouvées en une seule passe le 25/08, il y en a probablement d'autres.
- **Bloc profession comptable à rouvrir** — Effinum/SPEE et MyKinexo sont deux réseaux comptables découverts après la clôture du bloc.

### Fils à finir, hérités des derniers lots

- **VosFactures** : corroborer Factuali SAS / Fakturownia au registre. Le SIREN est désormais posé, c'est immédiat.
- **Shine** : chaîne de détention de Shine Denmark ApS.
- **ICD International** : posture grossiste qualifiée le 22/08, fiche jamais ouverte.
- **RCA, ACD, COAXIS ASP** : fiches 360 en propre ; identifier l'entité EDITH ; actionnariat de COAXIS INVEST.
- **SELLSY** : documenter l'opération de périmètre 2024, +98,5 % de chiffre d'affaires.
- **FIDUCIAL CLOUD** : bloc « Partenaires » à relever par capture rendue.
- **18 offreurs de marque blanche** : leur demander s'ils publient la liste de leurs partenaires. Après la passe du 25/08, c'est redevenu la voie la plus rentable pour réduire l'asymétrie de la règle 96.

### Différé, par ta décision

- **Publication et affichage** : les 29 fiches 360, le document des acteurs hors référentiel et les 101 règles n'ont pas de CSS dédié ; le hub n'expose pas toutes les facettes de la taxonomie ; une page méthodologie publique est obligatoire dès lors qu'on publie des jugements sur des sociétés nommées.
- **Fusionneur** : 3 correctifs identifiés dans `merge-plateformes.html` — dédoublonnage de `_meta.fusions`, écriture de `dateDerniereConsolidation`, alerte sur redépôt d'un `_patch.id` déjà journalisé.

---

## 5. L'arbitrage qu'il faut trancher

**134 fiches 360 restantes, au rythme observé de 6 à 11 fiches par lot, cela représente entre 15 et 22 lots.** Ce n'est pas raisonnable, et surtout ce n'est pas utile : le cercle 3 compte environ 90 sociétés qui ne croiseront jamais Fluxym.

Trois façons de sortir de là :

**A — Traitement par cercles, avec deux profondeurs.** Fiche 360 complète réservée aux acteurs qui croisent réellement Fluxym, soit les cercles 1 et 2, environ 40 fiches. Les 90 autres reçoivent une **fiche courte** : poids économique, centralité, posture, socle, rattachement. C'est déjà quatre facettes de plus que l'état actuel, pour un cinquième de l'effort.

**B — Traitement par question, et non par acteur.** On arrête les fiches et on mène des passes transversales sur les 163 entrées : une passe références clients, une passe avis et recrutements, une passe socle, une passe actionnariat. Chaque passe est homogène, mécanisable et datée d'un seul relevé. Avantage : le référentiel devient comparable, ce qu'il n'est pas aujourd'hui puisque 29 fiches sont riches et 134 pauvres.

**C — Priorité au besoin commercial.** On traite d'abord les concurrents directs sur les affaires Fluxym — BASWARE, ESKER, GEP, IVALUA sont distribués par Fluxym, donc leurs concurrents sur les mêmes appels d'offres — et la cartographie sectorielle des clients. Le reste attend.

**Ma recommandation : B puis A.** La comparabilité est le premier défaut du référentiel aujourd'hui. Une facette renseignée sur 29 fiches sur 163 ne permet aucun tri, aucun filtre, aucun graphique honnête — donc le hub ne peut rien exposer d'utile, ce qui est aussi la vraie raison pour laquelle le volet publication reste bloqué. Deux passes transversales bien menées rendraient le référentiel exploitable plus vite que dix lots de fiches.

---

## 6. Ce qui est solide, et qu'il faut protéger

- **101 règles de méthode** documentées et datées. C'est l'actif principal : il rend le référentiel défendable si un acteur cité conteste.
- **Un journal de fusion** dans `_meta.fusions`, qui permet de reconstituer l'état à toute date.
- **Une taxonomie contrôlée** dans `pa-taxonomie.json`, avec des facettes définies plutôt que du texte libre.
- **Le principe de non-estimation** : aucune part de chiffre d'affaires attribuable à la facturation électronique n'a jamais été inventée. Tenu sur 63 fiches, sans exception.
- **La traçabilité par `sourcesEnrichissement`**, qui permet de savoir quel lot a posé quel champ, avec sa date et son niveau de confiance.
