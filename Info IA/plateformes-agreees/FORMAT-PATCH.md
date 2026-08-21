# Format de patch — obligatoire pour toute conversation parallèle

Un patch est un **fichier JSON** déposé dans `Info IA/plateformes-agreees/patches/`.

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
2. **Ne jamais inclure un champ qu'on n'a pas rempli.** Un champ absent du patch n'est pas touché lors de la fusion. Un champ à `null` dans le patch **écrase** la valeur existante : à n'utiliser que pour corriger une erreur.
3. **`socleTechnique`, `identiteInternationale` et `analyse360` fusionnent clé par clé**, récursivement, pas en bloc. La liste des chemins concernés est dans `data/pa-taxonomie.json` → `blocsStructures.fusionProfonde`.
4. **Les tableaux sont remplacés**, pas concaténés (`familleOrigine`, `segmentCible`, `activites`…).
   **Exception : `sourcesEnrichissement` est cumulatif.** Les entrées du patch sont **ajoutées** à celles déjà présentes, avec dédoublonnage à l'identique. Un patch ne déclare donc que les sources qu'il apporte, jamais l'historique. Corrigé le 21/08/2026 : la règle précédente faisait perdre jusqu'à treize entrées de sourçage sur une fiche déjà enrichie.
5. **Toujours renseigner `sourcesEnrichissement`** avec la source réelle et la date de relevé.
6. **Ne jamais inventer.** Champ non trouvé = champ absent du patch, et mention dans `_patch.note`.
7. Un patch ne traite **que** les plateformes de son lot. Pour le chantier G, **une seule société par patch**.
8. **Un champ à `null` écrase.** Ne l'utiliser que pour corriger une erreur, et le justifier dans `_patch.note`.

## Vérification avant dépôt

- le fichier est un JSON valide,
- chaque `nom` existe dans le référentiel,
- aucune valeur inventée,
- `_patch.dateReleve` est la date réelle de la recherche.
