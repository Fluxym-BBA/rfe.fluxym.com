# BRIEF G — Analyse 360 d'une entreprise porteuse d'une plateforme agréée

**Chantier :** G · **Périmètre :** les 163 entrées, une société à la fois · **Nature :** manuel assisté
**Patch attendu :** `patches/patch-G-<NOM>.json`, **un fichier par société**
**Modèle et règles :** `cartographie-360-modele.md` — **à lire avant de commencer, sans exception**

## Objectif

Répondre à cinq questions par société, et à rien d'autre :

1. Que fait cette entreprise, et de quoi vit-elle ?
2. Quel est son poids économique, avec quels chiffres sourcés ?
3. **Quelle place l'activité de plateforme agréée occupe-t-elle dans son activité ?**
4. Qui sont ses clients, et dans quels secteurs ?
5. Quelle est sa dynamique, et comment est-elle perçue ?

## Pourquoi une société par patch

Une fiche 360 sourcée demande 30 à 45 minutes. Une conversation qui tente dix sociétés produira dix fiches creuses. **Une société, un patch, une conversation.** C'est la règle la plus importante de ce brief.

## Méthode, dans l'ordre

### Étape 1 — l'entreprise, par son propre discours
Site officiel : page d'accueil, **menu principal**, « à propos », « faits marquants », catalogue produit, page carrières.
Le menu principal est l'indicateur le plus honnête de ce que l'entreprise considère comme son métier. Relever s'il mentionne la facturation électronique, et à quel niveau de profondeur.

### Étape 2 — le poids économique
- Comptes déposés : `annuaire-entreprises.data.gouv.fr`, Pappers, BODACC. Relever CA, résultat net, effectif, exercice, **et le millésime** : des comptes 2022 en 2026 doivent être signalés comme tels.
- CA groupe : communiqué ou page « faits marquants ». Distinguer **CA groupe** et **CA de l'entité française** : les confondre est l'erreur la plus fréquente et la plus grossière.
- Actionnariat : greffe, presse économique, page historique du site. Repérer fonds, dette privée, acquisitions.

### Étape 3 — la centralité
Appliquer le barème du § 4 du modèle. Compter les indices, ne pas les pondérer au jugé. Renseigner `faisceauIndices` avec **une preuve par signal**, et écrire la lecture dans `lecture`, au conditionnel.

Questions à se poser, dans cet ordre : existe-t-il une marque produit dédiée ? une entité juridique dédiée ? la facturation électronique est-elle dans le menu principal ? combien de communiqués sur 12 mois ? combien d'offres d'emploi la mentionnent ? existe-t-il un réseau de revendeurs sur cette offre ?

### Étape 4 — clients et secteurs
Pages « clients », « témoignages », « études de cas », bandeaux de logos. Classer par secteur.
**Distinguer impérativement** les références du catalogue global et les références **de l'activité PA**. Un logo sur une page d'accueil ne prouve pas un contrat de plateforme agréée. Les grands comptes cités par tout le monde sont à relever sans commentaire : leur ubiquité est en soi une information.

### Étape 5 — dynamique
Site carrières et job boards : nombre d'offres ouvertes, part liée à la facturation électronique, natures de postes (R&D, avant-vente, delivery, support). C'est un excellent révélateur d'engagement réel.
**Ne jamais qualifier de turnover** ce qui n'est qu'un volume d'offres.

### Étape 6 — réputation
G2, Capterra, Gartner Peer Insights, Trustpilot. Relever **uniquement** : plateforme, note moyenne, nombre d'avis, date de relevé, URL.
Un volume d'avis faible ou nul est une information à publier telle quelle (« aucun avis public identifié »), pas un vide à combler.

## Interdits, sans exception

- Inventer ou estimer une part de CA attribuable à l'activité PA. Elle n'est pas publiée. `ventilationParActivite.disponible: false` est la bonne réponse.
- Confondre CA groupe et CA de l'entité française.
- Retenir un chiffre d'agrégateur (ZoomInfo, PitchBook, Tracxn…) comme valeur de référence contre des comptes déposés.
- Citer, reformuler ou résumer un avis client individuel.
- Publier un jugement, un superlatif, un classement, ou un comparatif nominatif entre deux plateformes.
- Mentionner une personne autre qu'un dirigeant dans sa fonction publique.
- Présenter un volume d'offres d'emploi comme une mesure de turnover.
- Écrire sur les conditions réglementaires applicables aux plateformes étrangères (question ouverte, cf. `cartographie-entites-etrangeres.md` § 6).

## Format de sortie

Conforme à `FORMAT-PATCH.md`, avec :
- `_patch.chantier` = `"G — analyse 360"`
- `_patch.societe` = le `nom` exact du référentiel
- fusion **clé par clé** du bloc `analyse360`, comme `socleTechnique`
- chaque valeur non nulle accompagnée d'une entrée dans `sourcesEnrichissement` : champ, source, URL, date de relevé, confiance

## Contrôle avant dépôt

- toute valeur chiffrée porte son exercice et sa date de relevé ;
- CA groupe et CA entité française sont dans deux champs distincts ;
- l'indice de centralité est justifié par au moins **trois** indices avec preuve ;
- aucun avis individuel n'est cité ;
- `lectureConcurrentielle` est rédigée au conditionnel et ne contient aucun jugement ;
- ce qui n'a pas été trouvé est à `null` et listé dans `_patch.note`.
