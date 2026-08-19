# BRIEF B — Identités juridiques manquantes et douteuses

**Chantier :** B · **Périmètre :** 29 entités françaises sans SIREN + 22 appariements à vérifier · **Nature :** semi-automatique
**Patch attendu :** `patches/patch-B.json`

## Objectif
Compléter et fiabiliser l'identité juridique des plateformes françaises.

## Source
API Recherche d'entreprises (INSEE / RNE), ouverte et gratuite :
`https://recherche-entreprises.api.gouv.fr/search?q=<nom>&code_postal=<cp>&per_page=5&minimal=true&include=siege`

## Méthode
1. Repérer dans le référentiel les plateformes où `pays = "France"` et `siren = null`, ainsi que celles où `confianceIdentite = "moyenne"`.
2. **Une requête par plateforme, jamais en lot.** Les appels groupés ont déjà produit des réponses collisionnées (une URL renvoyant le contenu d'une autre).
3. Nettoyer le nom avant la requête : retirer les suffixes `PDP`, `PA`, `by <groupe>`, `powered by <groupe>`.
4. Utiliser le code postal de `adresse` comme filtre, puis le département si le code postal ne donne rien.

## Règle de confiance, non négociable
- `haute` : nom exact **et** code postal ou département concordant
- `moyenne` : nom exact seul → à signaler comme à vérifier
- **aucun match** : laisser tous les champs à `null`. Ne jamais retenir un homonyme.

Pièges déjà rencontrés : `DEXT` → « TOARIKI DEXTER », `CECURITY` → « CECURITY OUTSOURCING », `ESKER` → une entité de 1 à 2 salariés au lieu de la SA de 1985.

## Champs à produire
`siren`, `raisonSociale`, `dateCreation`, `anneeCreation`, `trancheEffectif`, `categorieEntreprise`, `activitePrincipale`, `confianceIdentite`

## Attention aux entités dédiées
Le nom déclaré à la DGFiP peut correspondre à une société créée uniquement pour porter l'immatriculation, distincte de la société opérationnelle. Cas confirmés : `YOOZ PDP` (2023, 3-5 salariés) face à `YOOZ` (2014, 250-499), et le groupe Kolecto qui porte **trois** entités.
Dans ce cas : `siren` = l'entité immatriculée, et `groupeCapitalistique` = la société opérationnelle avec son SIREN, sa date de création et sa taille.
