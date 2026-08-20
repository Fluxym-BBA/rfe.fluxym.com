# Référentiel des plateformes agréées — dossier de travail

Point d'entrée pour toute conversation qui contribue au référentiel.

## À lire dans cet ordre

1. `PLAN-DE-TRAVAIL.md` — état d'avancement, les 6 chantiers, les décisions actées
2. `cartographie-reste-a-faire.md` — ce qui manque, champ par champ et plateforme par plateforme
3. `cartographie-entites-etrangeres.md` — pourquoi les fiches non françaises sont vides, et la stratégie pour les remplir
4. `FORMAT-PATCH.md` — le format de sortie obligatoire
5. `LOTS-E.md` — le découpage nominatif des 15 lots de qualification
6. `BRIEF-<chantier>.md` — la consigne du chantier à traiter

## Comment lancer un travail en parallèle

Ouvrir une conversation avec @RFE_WebSite et écrire, par exemple :

> Traite le chantier E, lot E4. Le brief est dans `Info IA/plateformes-agreees/BRIEF-E-qualification-marche.md`,
> le périmètre du lot dans `LOTS-E.md`, le format de sortie dans `FORMAT-PATCH.md`.
> Le référentiel de référence est `data/plateformes-agreees.json` sur la branche main.

Ou, pour l'international :

> Traite le chantier F, lot F2. Le brief est dans `Info IA/plateformes-agreees/BRIEF-F-entites-etrangeres.md`,
> la note de cadrage dans `cartographie-entites-etrangeres.md`, le format de sortie dans `FORMAT-PATCH.md`.

La conversation produit un seul fichier : `patches/patch-E4.json` ou `patches/patch-F2.json`.

## Comment réintégrer

Ouvrir `merge-plateformes.html` sur le site, déposer un ou plusieurs patchs,
vérifier le journal de fusion, télécharger le JSON fusionné, le commiter dans `data/`.

⚠️ Avant le premier patch F : `merge-plateformes.html` doit savoir fusionner le bloc `identiteInternationale` clé par clé.

## Ce qui est interdit

- écrire directement dans `data/plateformes-agreees.json` depuis une conversation parallèle
- traiter un lot déjà pris par une autre conversation
- remplir un champ non sourcé
- attribuer un `siren` à une entité étrangère
