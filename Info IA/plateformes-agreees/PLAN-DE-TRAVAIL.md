# Plan de travail — Référentiel des plateformes agréées

**Emplacement dans le dépôt :** `Info IA/plateformes-agreees/`
**Dernière mise à jour :** 21/08/2026
**Fichier cible unique :** `data/plateformes-agreees.json`
**Définition des champs :** `data/pa-taxonomie.json`

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
| **F** | **Identité des entités étrangères** | ~44, en 6 lots | manuel assisté | `BRIEF-F-entites-etrangeres.md` | **à lancer** |

**A, B, C et D sont indépendants entre eux et peuvent tourner simultanément.**
Les lots de E sont indépendants entre eux, mais gagnent à passer **après** A et B.
**F est le pendant international de B.** Il suppose A fait sur les entités concernées (sans URL, pas de mentions légales, donc pas de n° de TVA).

---

## Décisions actées

1. **`contact` est collecté mais jamais affiché.** Les adresses figurent dans le JSON pour usage interne ; ni `pa-detail.js` ni `pa-hub.js` ne les rendent. Motif : ne pas exposer 147 adresses professionnelles à l'aspiration automatisée.
2. **Niveau de détail dégradé assumé** pour les entités étrangères et les candidates : pas d'identité juridique française. La page l'affiche explicitement plutôt que de laisser croire à un oubli.
   → **Précisé le 21/08/2026** : « dégradé » ne veut pas dire « vide ». Le chantier F substitue une ancre internationale (TVA/VIES, EUID, LEI, registre national) au SIREN, et la qualification marché du chantier E s'applique **à l'identique** aux entités étrangères. Voir `cartographie-entites-etrangeres.md`.
3. **Aucun champ n'est jamais rempli au jugé.** Tout champ non sourcé reste à `null` avec `confiance: "non_qualifie"`. Une absence de donnée est une donnée.
4. **Tout chiffre publié porte sa date de relevé.** `_meta.dateReleve` fait foi.
5. **Le matricule de plateforme agréée (ICD 0238, 4 caractères)** est l'identifiant pivot d'une PA dans l'annuaire, mais il **n'est pas public**. Le référentiel ne le portera pas tant que la DGFiP ne le publie pas.
6. **Rien ne sera publié sur les conditions réglementaires applicables aux PA étrangères** (établissement stable, représentant, hébergement) avant lecture des textes primaires : art. 290 B CGI, art. 242 nonies B ann. II, décret n° 2024-266.

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

## Prérequis technique du chantier F

`merge-plateformes.html` doit fusionner le bloc `identiteInternationale` **clé par clé**, comme il le fait déjà pour `socleTechnique`. À faire **avant** le dépôt du premier patch F.
