# Chantier H2 rejoué — le contrôle étranger par routes indirectes

**Date de relevé : 25/08/2026** · Auteur : RFE_WebSite · Patch : `patches/patch-H2-88-CONTROLE-ETRANGER.json` (4 fiches)

## Le point de départ

La règle 88, actée le matin même, énonce qu'un groupe étranger peut atteindre le marché français des plateformes agréées sans figurer au registre de l'entité immatriculée. Elle a été établie sur un cas : TeamSystem, présent en direct par SELLSY et indirectement par ACD, membre de l'alliance qui porte LE VILLAGE CONNECTÉ.

Cette passe pose la question à l'ensemble du référentiel. Et la première chose qu'elle établit est désagréable : **la réponse était déjà dans les données, et elle avait été ignorée.**

## L'erreur d'abord

La fiche 360 de CENSE, livrée le 24/08/2026, décrit un réseau comptable qui « ne se contente pas de fournir une conformité » et qui aurait investi dans une plateforme dotée d'un hébergement de type SecNumCloud. Or le référentiel portait déjà, sur cette même fiche, un champ `socleTechnique` renseigné avec une **citation littérale de l'éditeur** :

> « Notre plateforme collaborative s'appuie sur la PA CHAINTRUST, plateforme agréée par l'administration fiscale (DGFiP) depuis plusieurs mois — une antériorité qui garantit un traitement de vos factures fiable et pleinement conforme. »

Autrement dit : **COGEP n'opère pas son socle de conformité, il l'achète.** Et l'opérateur du socle, CHAINTRUST, est contrôlé majoritairement depuis janvier 2024 par le groupe norvégien **Visma**.

L'enrichissement web avait été fait, la fiche n'avait pas été lue. D'où la règle 94, applicable rétroactivement à toutes les fiches 360 déjà livrées : **toute analyse commence par l'inventaire des champs existants de la fiche.**

## Ce que la passe établit : Visma est présent par quatre routes

| # | Route | Entrée du référentiel | Visible au niveau de l'entité ? |
|---|---|---|---|
| 1 | Immatriculation directe — participation **majoritaire** annoncée en janvier 2024 | **CHAINTRUST by Visma** (842 804 858, France) | ✅ oui, `groupeCapitalistique` = « Visma » |
| 2 | Immatriculation directe à l'étranger | **MySupply Aps** (Danemark) | ✅ oui |
| 3 | **Socle exploité en marque blanche** par un tiers | **CENSE** (COGEP, 400 833 596) | ❌ **non** — entité française, actionnariat français |
| 4 | **Participation minoritaire** à gouvernance partagée (annoncée le 10/03/2026, finalisée à l'été 2026) | **FULLL** (443 516 877, filiale d'In Extenso) | ❌ non — `groupeCapitalistique` était vide |

Visma détient par ailleurs Inqom en France, non immatriculée, et a annoncé le regroupement de MySupply avec Inexchange, Maventa et efacto sous la marque **Inexchange au 01/10/2026**, présenté par le groupe comme son engagement le plus significatif à ce jour dans la facturation électronique. Conséquence pratique : la dénomination portée au référentiel pour MySupply Aps est susceptible de ne plus correspondre à la marque commerciale après cette date, à vérifier au relevé DGFiP suivant.

**Deux routes sur quatre étaient invisibles.** Et ce n'est pas un groupe marginal : c'est un éditeur scandinave qui a bâti une position en France sur le canal du cabinet d'expertise comptable, exactement le canal identifié la veille comme celui qui tranche la question de la plateforme avant qu'elle ne soit posée.

## Ce que la passe refuse de faire

La quatrième route est publiée comme fait, mais **elle n'entre pas dans la liaison d'immatriculations**. Visma est minoritaire au capital de fulll, la gouvernance est partagée et les deux parties précisent que la société n'est pas cédée. La facette `liaisonImmatriculations` désigne les immatriculations d'un **même groupe** : une participation minoritaire n'y suffit pas. Seuil retenu : contrôle documenté, ou rien (règle 97).

La liaison posée par le patch se limite donc à `CHAINTRUST by Visma` ↔ `MySupply Aps`, type **`deux_offres_deux_cibles`** — deux marchés, deux cibles, deux pays. Les routes 3 et 4 sont décrites dans le champ `lecture` de la liaison et dans les blocs `groupeCapitalistique`, là où elles sont exactes.

## L'asymétrie structurelle, chiffrée

C'est le résultat le plus important de la passe, et il est purement quantitatif.

| Mesure sur les 163 entrées | Nombre |
|---|---|
| Fiches qualifiées **fournisseur de socle** | **38** |
| dont fiches distribuant en **marque blanche ou marque grise** | **18** |
| Fiches déclarant exploiter le socle **d'un tiers** en marque blanche | **1** |
| Fiches déclarant un socle **hybride** | 2 |
| Fiches déclarant un socle **propre** | 113 |
| Fiches avec socle de type **`inconnu`** | **34** |
| Fiches sans aucun champ de socle renseigné | **13** |

Dix-huit acteurs proposent de mettre leur conformité à disposition de tiers. **Un seul déclare en bénéficier.** L'écart n'est pas une erreur de saisie : il n'existe aucune obligation de déclarer qu'on exploite le socle d'un autre, et l'intérêt commercial va plutôt dans le sens du silence.

Conséquence de méthode : **tout décompte de relations de marque blanche publié par ce référentiel est un minorant, et doit l'annoncer** (règle 96). Les 47 fiches en `inconnu` ou vides sont autant de zones aveugles.

Parmi les 18 offreurs de marque blanche ou grise, la répartition par pays de l'entité immatriculée donne la mesure des portes ouvertes : **11 France**, 2 Espagne (B2BRouter, INVOPOP), 1 Allemagne (Docnova/MELASOFT), 1 Belgique (ADEMICO SOFTWARE), 1 Pays-Bas (STORECOVE), 1 Suède (Arratech), 1 dont le pays a été établi depuis (WAKASTELLAR, France). Six offreurs étrangers dont chacun peut, sans que rien n'apparaisse, se retrouver derrière la plateforme d'un acteur français.

À noter également, dans le registre français : **ICD International** propose son immatriculation en marque blanche à d'autres acteurs, posture qualifiée de grossiste lors de la passe du 22/08 et toujours non ouverte.

## Ce qui reste à faire, et c'est considérable

- **Interroger les 34 fiches à socle `inconnu` et les 13 fiches vides** : qui opère réellement le socle ? C'est la suite naturelle et la plus productive de cette passe.
- **Poser la même question aux 18 offreurs de marque blanche, dans l'autre sens** : publient-ils la liste de leurs partenaires ? Chaque liste publiée résout plusieurs zones aveugles d'un coup.
- **Contrôle rétroactif des fiches 360 déjà livrées au titre de la règle 94** : vérifier, fiche par fiche, qu'aucune analyse ne contredit ou n'omet un champ déjà renseigné au référentiel. Deux omissions ont déjà été trouvées et corrigées dans cette passe — le socle de CENSE, et la collaboration technique avec TESSI absente du bloc `activites` du VILLAGE CONNECTÉ.
- **Reprendre le recensement du contrôle étranger** : le champ `pays` et le champ `groupeCapitalistique` ne suffisent pas, il faut y ajouter l'opérateur de socle et les membres d'alliance. Le décompte « 114 françaises / 46 étrangères » évoqué dans les travaux antérieurs mesure la nationalité des entités, pas la présence des groupes.
- **Ouvrir les autres groupes étrangers déjà repérés** avec la même grille : Namirial derrière DIGITAL TECHNOLOGIES, Vertex derrière ecosio, Amadeus derrière VOXEL, Accel-KKR derrière BASWARE, TeamSystem derrière SELLSY et ACD. Combien de routes chacun a-t-il ?
- **Inqom** : vérifier qu'aucune immatriculation n'est portée par cet actif français de Visma sous un autre nom.
- **fulll** : le socle reste de type `inconnu` au référentiel alors qu'un communiqué de 2023 documente un partenariat industriel avec Generix. À trancher, d'autant que Visma est désormais au capital.

## Lecture concurrentielle

Cette passe déplace la question. Jusqu'ici le référentiel comptait des plateformes ; il faut désormais compter des **socles**. Une plateforme agréée, du point de vue du client final, c'est une marque et une facture ; du point de vue du flux, c'est un moteur de conformité, et il y a beaucoup moins de moteurs que de marques.

Pour l'offre portée par Fluxym, l'enseignement est double. D'une part, la concurrence apparente surestime le nombre d'acteurs réellement autonomes : dix-huit acteurs proposant de la marque blanche, cela signifie qu'un nombre indéterminé de plateformes concurrentes rencontrées sur le terrain tournent en réalité sur le socle d'un tiers, avec les conséquences que cela implique en termes de dépendance, de marge et de feuille de route. D'autre part, la nationalité affichée d'une plateforme ne dit rien de la nationalité du socle : l'argument de souveraineté, fréquemment mobilisé sur ce marché, mérite d'être vérifié une fiche à la fois.

Fluxym est un acteur du marché. Ce référentiel est publié par un intégrateur qui distribue des solutions concurrentes, et cette lecture est une lecture de marché, pas une évaluation.

## Contrôles effectués avant livraison

- **Énumérations vérifiées facette par facette** (règles 23 et 72) : `liaisonImmatriculations`, et pour les patchs corrigés `centralitePA`, `postureCommerciale`, `typeActionnaire`.
- **Forme du bloc `immatriculationsLiees`** contrôlée contre le format lu par `js/pa-detail.js`.
- **Simulations de fusion des trois patchs livrés** :
  - `patch-H2-88-CONTROLE-ETRANGER.json` : 4 fiches, 0 rejet, **2 écrasements intentionnels** de `groupeCapitalistique` (CHAINTRUST by Visma et CENSE), chacun intégrant le texte préexistant en tête ; création pour FULLL, dont le champ était vide.
  - `patch-360-PROFESSION-COMPTABLE.json` (version corrigée) : 6 fiches, 0 rejet, 0 écrasement.
  - `patch-360-VILLAGE-CONNECTE.json` (version complétée) : 2 fiches, 0 rejet, 0 écrasement.
- **Aucun compteur global du référentiel n'est annoncé** au sens de la règle 75. Les décomptes de socles publiés ci-dessus portent sur des champs structurels stables de l'instantané de travail et sont donnés comme tels, avec leur date.
