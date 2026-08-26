# Format de patch — obligatoire pour toute conversation parallèle

Un patch est un **fichier JSON** déposé dans `Info IA/plateformes-agreees/patches/`.

**Révisé le 26/08/2026** : fusion des règles 2 et 8 qui disaient la même chose, interdiction de `_meta`, et ajout d'une section « Cas particulier du chantier G » — ce document ne disait rien du chantier qui produit les fiches 360, alors que c'est celui qui tourne en dix conversations parallèles.

## Structure

```json
{
  "_patch": {
    "id": "E3",
    "chantier": "E — qualification marché",
    "auteur": "RFE_WebSite",
    "dateReleve": "2026-08-20",
    "nbPlateformes": 10,
    "note": "Commentaire libre : difficultés, sites inaccessibles, doutes."
  },
  "plateformes": [
    {
      "nom": "AXONAUT",
      "siteWeb": "https://www.axonaut.com/",
      "familleOrigine": ["facturation_compta"],
      "segmentCible": ["micro", "tpe_pme"],
      "verticale": "generaliste",
      "natureEntite": "extension_demat",
      "socleTechnique": { "type": "propre", "operateurSocle": "Axonaut", "preuve": "…", "source": "…", "confiance": "moyenne" },
      "descriptionFiche": "…",
      "logiquePositionnement": "…",
      "sourcesEnrichissement": [
        { "champ": "positionnement", "source": "https://www.axonaut.com/", "dateReleve": "2026-08-20", "confiance": "haute" }
      ]
    }
  ]
}
```

## Règles impératives

1. **`nom` est la clé de fusion.** Il doit être **strictement identique** à la valeur présente dans `data/plateformes-agreees.json`, caractère pour caractère, accents et casse compris. Un nom qui ne correspond à rien fait échouer la ligne, jamais le fichier entier.
2. **Ne jamais inclure un champ qu'on n'a pas rempli, et ne pas confondre absent et `null`.** Un champ **absent** du patch n'est pas touché lors de la fusion. Un champ à **`null`** dans le patch **écrase** la valeur existante : à n'utiliser que pour corriger une erreur, et à justifier dans `_patch.note`. C'est la distinction la plus lourde de conséquences du format : une fiche déjà enrichie peut être appauvrie par un patch bien intentionné.
3. **`socleTechnique`, `identiteInternationale` et `analyse360` fusionnent clé par clé**, récursivement, pas en bloc. La liste des chemins concernés est dans `data/pa-taxonomie.json` → `blocsStructures.fusionProfonde`.
4. **Les tableaux sont remplacés**, pas concaténés (`familleOrigine`, `segmentCible`, `activites`…).
   **Exception : `sourcesEnrichissement` est cumulatif.** Les entrées du patch sont **ajoutées** à celles déjà présentes, avec dédoublonnage à l'identique. Un patch ne déclare donc que les sources qu'il apporte, jamais l'historique. Corrigé le 21/08/2026 : la règle précédente faisait perdre jusqu'à treize entrées de sourçage sur une fiche déjà enrichie.
5. **Toujours renseigner `sourcesEnrichissement`** avec la source réelle et la date de relevé.
6. **Ne jamais inventer.** Champ non trouvé = champ absent du patch, et mention dans `_patch.note`.
7. Un patch ne traite **que** les plateformes de son lot. Pour le chantier G, **une seule société par patch**.
8. **`_meta` n'appartient à aucun patch.** Un patch ne contient jamais de bloc `_meta` : la couverture, les avertissements et l'historique des fusions sont recalculés par les outils, jamais déclarés par un rédacteur.

## Cas particulier du chantier G — fiches 360

Le chantier G produit un bloc `analyse360` complet pour **une seule** société par patch. Trois choses s'y ajoutent.

**Nommage et en-tête.**

```json
{
  "_patch": {
    "id": "360-L<N>",
    "chantier": "G — analyse 360",
    "auteur": "RFE_WebSite",
    "dateReleve": "2026-08-26",
    "nbPlateformes": 1,
    "note": "Raisonnement, difficultés, contradictions assumées.",
    "reglesProposees": ["…"],
    "observationsTiers": ["…"]
  },
  "plateformes": [ { "nom": "…", "analyse360": { }, "sourcesEnrichissement": [ ] } ]
}
```

Le fichier s'appelle `patches/patch-360-L<N>.json`, où `<N>` est le numéro de ligne de `FILE-DE-TRAVAIL-360.md`. `reglesProposees` et `observationsTiers` sont des tableaux de chaînes, éventuellement vides : une règle de méthode découverte en cours de route ne s'écrit **pas** dans le corpus, et ce qu'on apprend sur un tiers ne se met **pas** dans la fiche du tiers.

**La forme du bloc `analyse360` est contrainte.** Elle est décrite dans `SCHEMA-360.md`, version 1.1, et rappelée dans `PROMPT-FICHE-360.md`. Un bloc livré en chaîne de caractères là où le schéma attend un objet coûte une section entière sur la page publique : c'est arrivé 39 fois sur les 60 premières fiches.

**Les tableaux internes à `analyse360` sont remplacés, comme les autres.** `avis`, `faisceauIndices`, `naturesPostes`, `pointsContestables`, `referencesPAConfirmees`, `acquisitions`, `activites` : un patch correctif qui n'en réécrit qu'une partie **efface le reste**. Un patch qui corrige une note Trustpilot doit donc porter le tableau `avis` complet. Seul `sourcesEnrichissement` est cumulatif (règle 4).

**`complements` fusionne clé par clé**, comme le reste de `analyse360` : c'est un objet libre, prévu pour ce que le schéma n'a pas anticipé. On y met ce qui ne rentre pas, plutôt que d'inventer une clé à la racine d'un bloc.

**Un patch 360 n'est pas la version finale.** Après fusion, il passe par `tools/normalize-360.py` puis `tools/arbitrate-360.py`, **dans cet ordre**. Ces outils ferment le schéma et tranchent les points ouverts, mais ils ne savent le faire qu'**en dégradant** : ils regroupent, ils tronquent, ils choisissent le millésime le plus récent. Tout ce qui est écrit correctement du premier coup n'a pas à être sauvé.

## Vérification avant dépôt

- le fichier est un JSON valide,
- chaque `nom` existe dans le référentiel,
- aucune valeur inventée,
- `_patch.dateReleve` est la date réelle de la recherche,
- aucun bloc `_meta`,
- pour un patch 360 : `nbPlateformes: 1`, aucun bloc objet livré en chaîne, et tout tableau modifié est livré complet.
