# Référentiel des plateformes agréées — dossier de travail

Point d'entrée pour toute conversation qui contribue au référentiel.

## À lire dans cet ordre

1. `PLAN-DE-TRAVAIL.md` — état d'avancement, les 5 chantiers, les décisions actées
2. `cartographie-reste-a-faire.md` — ce qui manque, champ par champ et plateforme par plateforme
3. `FORMAT-PATCH.md` — le format de sortie obligatoire
4. `LOTS-E.md` — le découpage nominatif des 15 lots de qualification
5. `BRIEF-<chantier>.md` — la consigne du chantier à traiter

## Comment lancer un travail en parallèle

Ouvrir une conversation avec @RFE_WebSite et écrire, par exemple :

> Traite le chantier E, lot E4. Le brief est dans `Info IA/plateformes-agreees/BRIEF-E-qualification-marche.md`,
> le périmètre du lot dans `LOTS-E.md`, le format de sortie dans `FORMAT-PATCH.md`.
> Le référentiel de référence est `data/plateformes-agreees.json` sur la branche main.

La conversation produit un seul fichier : `patches/patch-E4.json`.

## Comment réintégrer

Ouvrir `merge-plateformes.html` sur le site, déposer un ou plusieurs patchs,
vérifier le journal de fusion, télécharger le JSON fusionné, le commiter dans `data/`.

## Ce qui est interdit

- écrire directement dans `data/plateformes-agreees.json` depuis une conversation parallèle
- traiter un lot déjà pris par une autre conversation
- remplir un champ non sourcé
