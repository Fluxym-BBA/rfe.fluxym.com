# Plan de travail — Référentiel des plateformes agréées

**Emplacement dans le dépôt :** `Info IA/plateformes-agreees/`
**Dernière mise à jour :** 21/08/2026 (soir — réorientation 360)
**Fichier cible unique :** `data/plateformes-agreees.json`
**Définition des champs :** `data/pa-taxonomie.json`
**Finalité du référentiel :** analyse 360 des entreprises porteuses des plateformes agréées — voir `cartographie-360-modele.md`

---

## Règle d'or de la parallélisation

Aucune conversation parallèle n'écrit jamais dans `data/plateformes-agreees.json`.
Chaque conversation produit **un fichier de patch** dans `Info IA/plateformes-agreees/patches/`.
La fusion est faite en une seule fois, par `merge-plateformes.html`, dans le navigateur.

Cela garantit qu'aucun travail parallèle n'écrase celui d'un autre.

```
conversation A ──> patches/patch-A.json ──┐
conversation B ──> patches/patch-B.json ──┼──> merge-plateformes.html ──> data/plateformes-agreees.json
conversation E3 ─> patches/patch-E3.json ─┘
```

---

## État au 19/08/2026

| | Valeur |
|---|---|
| Entrées au référentiel | **163** (147 immatriculées + 16 candidates) |
| Plateformes qualifiées marché | **28** (17 %) |
| Fiches complètes à 100 % | **0** |
| Identité juridique fiable | 53 |
| Identité à vérifier | 22 |
| Sans identité | 88 (dont ~44 entités étrangères — chiffre à recompter, cf. chantier F) |

Le code est terminé et en production. **Tout ce qui reste est de la donnée.**

---

## Les 6 chantiers, dans l'ordre de rentabilité

| # | Chantier | Périmètre | Nature | Brief | Statut |
|---|---|---|---|---|---|
| **A** | `siteWeb` + `contact` depuis le XLSX officiel DGFiP | 147 | automatique, 1 passe | `BRIEF-A-sites-et-contacts.md` | à lancer |
| **B** | SIREN manquants et douteux | 51 | semi-automatique | `BRIEF-B-identites-siren.md` | à lancer |
| **C** | `dirigeants` sur les SIREN connus | 75+ | automatique | `BRIEF-C-dirigeants.md` | à lancer |
| **D** | `reseaux` / points d'accès Peppol | 163 | automatique | `BRIEF-D-peppol.md` | à lancer |
| **E** | Qualification marché | 135, en 15 lots | manuel assisté | `BRIEF-E-qualification-marche.md` | à lancer |
| **F** | Identité des entités étrangères | ~44, en 6 lots | manuel assisté | `BRIEF-F-entites-etrangeres.md` | à lancer, **déclassé** |
| **G** | **Analyse 360 des entreprises** | 163, une société par patch | manuel assisté | `BRIEF-G-analyse-360.md` | **chantier principal** |

**A, B, C et D sont indépendants entre eux et peuvent tourner simultanément.**
**A est le prérequis absolu de G** : sans URL, aucune analyse d'entreprise n'est possible.
**B change de nature** : le SIREN n'est plus de l'état civil, c'est la clé d'accès aux comptes déposés, donc au poids économique.
**E fusionne de fait avec G** : les 12 axes de qualification marché sont un sous-ensemble du bloc `activites` + `centralitePA`, et se traitent dans la même passe, société par société.
**F est le pendant international de B**, et devient secondaire : le 360 s'applique aux étrangères comme aux françaises, et apporte bien plus qu'un numéro de registre.

---

## Décisions actées

1. **`contact` est collecté mais jamais affiché.** Les adresses figurent dans le JSON pour usage interne ; ni `pa-detail.js` ni `pa-hub.js` ne les rendent. Motif : ne pas exposer 147 adresses professionnelles à l'aspiration automatisée.
2. **Niveau de détail dégradé assumé** pour les entités étrangères et les candidates : pas d'identité juridique française. La page l'affiche explicitement plutôt que de laisser croire à un oubli.
   → **Précisé le 21/08/2026** : « dégradé » ne veut pas dire « vide ». Le chantier F substitue une ancre internationale (TVA/VIES, EUID, LEI, registre national) au SIREN, et la qualification marché du chantier E s'applique **à l'identique** aux entités étrangères. Voir `cartographie-entites-etrangeres.md`.
3. **Aucun champ n'est jamais rempli au jugé.** Tout champ non sourcé reste à `null` avec `confiance: "non_qualifie"`. Une absence de donnée est une donnée.
4. **Tout chiffre publié porte sa date de relevé.** `_meta.dateReleve` fait foi.
5. **Le matricule de plateforme agréée (ICD 0238, 4 caractères)** est l'identifiant pivot d'une PA dans l'annuaire, mais il **n'est pas public**. Le référentiel ne le portera pas tant que la DGFiP ne le publie pas.
6. **Réorientation du 21/08/2026 (soir), décidée par Bruno : le référentiel devient une analyse 360 d'entreprises**, et non un état civil de personnes morales. Question structurante : l'activité de plateforme agréée est-elle le cœur du métier, un axe stratégique, une extension naturelle, une activité annexe ou une conformité défensive ? Réponse par un **indice de centralité** sourcé, jamais par une part de CA inventée.
7. **Publication intégrale assumée**, décidée par Bruno le 21/08/2026 : l'analyse concurrentielle est publiée sur rfe.fluxym.com, y compris réputation, dynamique et lecture stratégique. Contrepartie non négociable : les 9 règles de publication du § 6 de `cartographie-360-modele.md` (source et date sur tout, séparation fait / lecture, aucun jugement ni classement, agrégats d'avis seulement, aucune donnée personnelle, pas de turnover, droit de réponse ouvert, déclaration du statut d'acteur de marché de Fluxym, même barème pour tous).
8. **La ventilation du CA par activité n'est jamais estimée.** Elle n'est publique que pour les sociétés cotées. `ventilationParActivite.disponible: false` est une réponse valide et attendue.
9. **CA groupe et CA de l'entité française sont deux champs distincts.** Les confondre est la faute la plus fréquente du marché (cas Generix : 110 M€ groupe contre 60,4 M€ pour l'entité).
10. **Rien ne sera publié sur les conditions réglementaires applicables aux PA étrangères** (établissement stable, représentant, hébergement) avant lecture des textes primaires : art. 290 B CGI, art. 242 nonies B ann. II, décret n° 2024-266.

---

## Suivi des lots de qualification marché

Voir `LOTS-E.md` pour le découpage nominatif des 15 lots.

| Lot | Type | Statut | Patch |
|---|---|---|---|
| Lots 1 à 3 (déjà faits, hors E) | — | ✅ terminé | fusionné |
| E1 à E9 | FR | à traiter | — |
| E10 à E13 | étrangères | à traiter | — |
| E14 à E15 | candidates | à traiter | — |

## Suivi des lots d'identité internationale

Découpage nominatif dans `BRIEF-F-entites-etrangeres.md`.

| Lot | Périmètre | Statut | Patch |
|---|---|---|---|
| F1 à F4 | étrangères non cartographiées (miroir de E10-E13) | à traiter | — |
| F5 | étrangères déjà cartographiées mais sans identité | à traiter | — |
| F6 | candidates étrangères (liste à établir sur pièces) | à traiter | — |

## Suivi du chantier 360

Un patch par société : `patches/patch-G-<NOM>.json`.

| Vague | Périmètre | Statut |
|---|---|---|
| Pilote | GENERIX Group — `pilote-360-GENERIX.md` | ✅ méthode éprouvée, non fusionné |
| G1 | top 30 par notoriété et par recouvrement avec Fluxym | à lancer |
| G2 | ~20 pure-players et entités créées pour la réforme | à lancer |
| G3 | groupes internationaux | à lancer |
| G4 | longue traîne, au fil de l'eau | permanent |

**Charge estimée :** 30 à 45 min par société correctement sourcée, soit ~90 h pour 147. Ce chantier ne se termine pas, il s'entretient.

## Prérequis technique du chantier F

`merge-plateformes.html` doit fusionner les blocs `identiteInternationale` **et** `analyse360` **clé par clé**, comme il le fait déjà pour `socleTechnique`. À faire **avant** le dépôt du premier patch F ou G.

## Prérequis d'affichage du chantier G

- fiche plateforme = fiche entreprise, dont la plateforme agréée est un chapitre ;
- nouveau filtre de premier plan : **centralité** (« cœur de métier » → « conformité défensive ») ;
- nouveau filtre : secteur des références clients ;
- **page méthodologie publique obligatoire** reprenant les 9 règles de publication : c'est elle qui rend le reste défendable.
