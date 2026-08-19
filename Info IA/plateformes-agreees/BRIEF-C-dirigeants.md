# BRIEF C — Dirigeants et lisibilité de l'actionnariat

**Chantier :** C · **Périmètre :** toutes les plateformes ayant un `siren` · **Nature :** automatique
**Patch attendu :** `patches/patch-C.json`

## Objectif
Renseigner `dirigeants` et qualifier `relationCapitalistique`.

## Source
API Recherche d'entreprises, avec les dirigeants :
`https://recherche-entreprises.api.gouv.fr/search?q=<siren>&per_page=1&minimal=true&include=dirigeants,siege`

Une requête par SIREN. Attention : ajouter `include=dirigeants` alourdit fortement la réponse, ce qui peut la tronquer en lot — d'où l'appel unitaire.

## Champs à produire
- `dirigeants` : liste de `{ nom, qualite, type }`, personnes physiques et morales
- `relationCapitalistique`, parmi : `independante`, `filiale_de_groupe`, `acquise`, `joint_venture`, `cotee`, `fonds_PE`, `holding_non_transparente`, `non_determinable`

## Indices exploitables et sourçables
- un dirigeant **personne morale** au code NAF **66.30Z** (gestion de fonds) est un indice de structure de holding ou d'opération de capital → `fonds_PE` ou `holding_non_transparente` selon la lisibilité
- plusieurs sociétés du même nom à la même adresse avec des dates de création échelonnées = chaîne de détention
- une société mère cotée → `cotee`

## Limite à respecter
Un indice n'est pas une conclusion. Si la nature de l'opération n'est pas publiquement établie, `relationCapitalistique = "non_determinable"` et l'indice est décrit dans `descriptionFiche`. Ne jamais écrire qu'une société a été rachetée par un fonds sans source nommée.
