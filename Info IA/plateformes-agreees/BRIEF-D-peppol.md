# BRIEF D — Points d'accès Peppol

**Chantier :** D · **Périmètre :** les 163 entrées · **Nature :** automatique
**Patch attendu :** `patches/patch-D.json`

## Objectif
Renseigner le champ `reseaux` (valeurs : `peppol_ap`, `autre`), aujourd'hui rempli à 2 %.

## Sources
- l'annuaire public des Access Points Peppol publié par OpenPeppol
- à défaut, la page « Peppol » du site de chaque plateforme

## Méthode
1. Récupérer la liste des Access Points certifiés couvrant la France.
2. Rapprocher par nom d'entreprise et par nom de groupe, pas seulement par nom commercial : une plateforme peut accéder à Peppol via sa maison mère.
3. Ne cocher `peppol_ap` que si la plateforme est **elle-même** Access Point. Être simplement joignable via Peppol n'en fait pas un point d'accès : c'est une confusion fréquente.

## Champ à produire
`reseaux` : tableau, `["peppol_ap"]` ou `["autre"]` ou absent si non déterminé

## Contexte réglementaire
Peppol est l'un des moyens d'assurer l'interopérabilité obligatoire entre plateformes, mais il n'est pas imposé : l'interopérabilité peut aussi passer par convention bilatérale. Ne pas présenter le statut Peppol comme une obligation ni comme un gage de conformité.
