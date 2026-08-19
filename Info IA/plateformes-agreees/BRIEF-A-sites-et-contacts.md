# BRIEF A — Sites web et contacts depuis le fichier officiel DGFiP

**Chantier :** A · **Périmètre :** les 147 plateformes immatriculées · **Nature :** automatique, une passe
**Patch attendu :** `patches/patch-A.json`

## Objectif
Remplir `siteWeb` et `contact` pour les 147 plateformes immatriculées, à partir des colonnes qui existent déjà dans le fichier officiel de la DGFiP.

## Source unique
`https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees`
Utiliser le fichier **XLSX** (`liste_pa_attente_rapport_audit.xlsx`), **pas le PDF** : dans le PDF, les colonnes sont dissociées du nom lors de l'extraction, ce qui a déjà provoqué des appariements décalés.

## Méthode
1. Télécharger le XLSX et le lire ligne par ligne (une ligne = une plateforme).
2. Pour chaque ligne : rapprocher la colonne « Nom commercial » du champ `nom` du référentiel.
3. Extraire l'URL du site et l'adresse de contact **de la même ligne**. Ne jamais reconstituer un couple à partir de deux listes ordonnées séparément.
4. Si le nom du XLSX ne correspond pas exactement à un `nom` du référentiel, **ne pas forcer** : signaler l'écart dans `_patch.note`.

## Champs à produire
- `siteWeb` : URL complète, avec le schéma `https://`
- `contact` : adresse de contact telle que publiée

## Contrôles
- 147 lignes traitées, ou l'écart est expliqué
- aucune URL rattachée à une plateforme dont le nom ne correspond pas
- ne pas inventer une URL à partir du nom de l'entreprise

## Rappel
`contact` est collecté mais **ne sera jamais affiché** sur le site. Ne pas modifier `pa-detail.js` pour le rendre visible.
