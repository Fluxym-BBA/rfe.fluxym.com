# Plan de travail — Référentiel des plateformes agréées

**Emplacement dans le dépôt :** `Info IA/plateformes-agreees/`
**Dernière mise à jour :** 19/08/2026
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
| Sans identité | 88 (dont 44 entités étrangères) |

Le code est terminé et en production. **Tout ce qui reste est de la donnée.**

---

## Les 5 chantiers, dans l'ordre de rentabilité

| # | Chantier | Périmètre | Nature | Brief | Statut |
|---|---|---|---|---|---|
| **A** | `siteWeb` + `contact` depuis le XLSX officiel DGFiP | 147 | automatique, 1 passe | `BRIEF-A-sites-et-contacts.md` | à lancer |
| **B** | SIREN manquants et douteux | 51 | semi-automatique | `BRIEF-B-identites-siren.md` | à lancer |
| **C** | `dirigeants` sur les SIREN connus | 75+ | automatique | `BRIEF-C-dirigeants.md` | à lancer |
| **D** | `reseaux` / points d'accès Peppol | 163 | automatique | `BRIEF-D-peppol.md` | à lancer |
| **E** | Qualification marché | 135, en 15 lots | manuel assisté | `BRIEF-E-qualification-marche.md` | à lancer |

**A, B, C et D sont indépendants entre eux et peuvent tourner simultanément.**
Les lots de E sont indépendants entre eux, mais gagnent à passer **après** A et B.

---

## Décisions actées

1. **`contact` est collecté mais jamais affiché.** Les adresses figurent dans le JSON pour usage interne ; ni `pa-detail.js` ni `pa-hub.js` ne les rendent. Motif : ne pas exposer 147 adresses professionnelles à l'aspiration automatisée.
2. **Niveau de détail dégradé assumé** pour les 35 entités étrangères et les 16 candidates : pas d'identité juridique française. La page l'affiche explicitement plutôt que de laisser croire à un oubli.
3. **Aucun champ n'est jamais rempli au jugé.** Tout champ non sourcé reste à `null` avec `confiance: "non_qualifie"`. Une absence de donnée est une donnée.
4. **Tout chiffre publié porte sa date de relevé.** `_meta.dateReleve` fait foi.

---

## Suivi des lots de qualification marché

Voir `LOTS-E.md` pour le découpage nominatif des 15 lots.

| Lot | Type | Statut | Patch |
|---|---|---|---|
| Lots 1 à 3 (déjà faits, hors E) | — | ✅ terminé | fusionné |
| E1 à E9 | FR | à traiter | — |
| E10 à E13 | étrangères | à traiter | — |
| E14 à E15 | candidates | à traiter | — |
