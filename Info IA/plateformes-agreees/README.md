# Référentiel des plateformes agréées — dossier de travail

Point d'entrée pour toute conversation qui contribue au référentiel.

## À lire dans cet ordre

1. `PLAN-DE-TRAVAIL.md` — état d'avancement, les 7 chantiers, les décisions actées
1bis. `cartographie-360-modele.md` — **la finalité du référentiel** : analyse 360 des entreprises, indice de centralité, règles de publication. À lire avant tout chantier.
2. `cartographie-reste-a-faire.md` — ce qui manque, champ par champ et plateforme par plateforme
3. `cartographie-entites-etrangeres.md` — pourquoi les fiches non françaises sont vides, et la stratégie pour les remplir
3bis. `pilote-360-GENERIX.md` — le modèle 360 appliqué à un cas réel, à prendre comme gabarit
4. `FORMAT-PATCH.md` — le format de sortie obligatoire
5. `LOTS-E.md` — le découpage nominatif des 15 lots de qualification
6. `BRIEF-<chantier>.md` — la consigne du chantier à traiter

## Comment lancer un travail en parallèle

Ouvrir une conversation avec @RFE_WebSite et écrire, par exemple :

> Traite le chantier E, lot E4. Le brief est dans `Info IA/plateformes-agreees/BRIEF-E-qualification-marche.md`,
> le périmètre du lot dans `LOTS-E.md`, le format de sortie dans `FORMAT-PATCH.md`.
> Le référentiel de référence est `data/plateformes-agreees.json` sur la branche main.

Ou, pour l'analyse 360 — **une société par conversation, jamais plus** :

> Traite le chantier G pour la société GENERIX Group. Le brief est dans `Info IA/plateformes-agreees/BRIEF-G-analyse-360.md`,
> le modèle dans `cartographie-360-modele.md`, le gabarit dans `pilote-360-GENERIX.md`.

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
- estimer une part de CA attribuable à l'activité de plateforme agréée : elle n'est pas publiée
- confondre CA groupe et CA de l'entité française
- citer un avis client individuel, publier un jugement, un classement ou un comparatif nominatif
- traiter plus d'une société par patch dans le chantier G
