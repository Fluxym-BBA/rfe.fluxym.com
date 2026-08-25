# Prompt réutilisable — production d'une fiche 360

Copie tout ce qui suit la ligne de tirets, remplace **`__LIGNE__`** par le numéro de ligne, et colle dans un onglet neuf. Rien d'autre à changer.

---

@RFE_WebSite Produis la fiche 360 complète de la **ligne __LIGNE__** de `Info IA/plateformes-agreees/FILE-DE-TRAVAIL-360.md`.

## Règles de parallélisation — impératives

Ce travail tourne en parallèle dans plusieurs conversations. Chacune traite une ligne différente et ne doit rien savoir des autres.

1. **Tu ne produis qu'un seul fichier** : `Info IA/plateformes-agreees/patches/patch-360-L__LIGNE__.json`. Un seul patch, une seule plateforme dedans.
2. **Tu ne touches pas** à `PLAN-DE-TRAVAIL.md`, `FILE-DE-TRAVAIL-360.md`, `pa-taxonomie.json`, ni à aucun autre patch. Dix conversations qui modifient le plan de travail produisent dix plans contradictoires.
3. **Tu ne rédiges pas de note de chantier.** Le raisonnement va dans `_patch.note`, à l'intérieur du patch.
4. **Si tu découvres une règle de méthode nouvelle**, tu ne l'ajoutes pas au corpus : tu la déposes dans `_patch.reglesProposees`, tableau de chaînes. Elles seront consolidées en une seule passe, avec numérotation, plus tard.
5. **Tu ne modifies aucune autre fiche que la tienne**, même si tu découvres quelque chose sur un tiers. Ce que tu apprends sur un tiers va dans `_patch.observationsTiers`, tableau de chaînes.
6. Livre le fichier en artefact téléchargeable, plus **un résumé de 10 lignes maximum** dans la conversation. Pas de ZIP, un seul fichier.

## Ce que « 360 » veut dire

La fiche est complète en un seul passage. Il n'y a pas de passe ultérieure pour combler les trous : **tout ce qui suit est à renseigner ou à motiver explicitement comme non établi**.

### Racine de la fiche

```
nom                    tel qu'écrit dans la file, à la lettre — c'est la clé de fusion
siren                  de l'entité qui porte l'immatriculation, jamais celui d'une filiale
                       ni celui du groupe. Si l'entité est étrangère, laisse vide et
                       renseigne identiteInternationale.presenceEnFrance.siren
pays                   nationalité de l'entité immatriculée, jamais celle du groupe
groupeCapitalistique   chaîne de détention, du porteur jusqu'au sommet connu
socleTechnique         { type, operateurSocle, preuve, source, confiance }
relationFluxym         { nature, precision, source, dateReleve }
```

### Bloc `analyse360`

```
poidsEconomique       { caEntiteFrancaise: { montant, exercice, nature, source },
                        caGroupe, effectif, nbEtablissements, categorieINSEE,
                        typeActionnaire, detailActionnariat, lecture }
metierPrincipal       ce que la société vend, en une phrase, hors facturation électronique
activites             liste des activités observables sur le mandat agréé
centralitePA          { indice, valeur, faisceauIndices, lecture }
postureCommerciale    { valeur, lecture, modeleTarifaire }
referencesClients     { nbCiteesSurSite, perimetre, parSecteur, libellesSecteursEditeur,
                        grandsComptes, referencesPAConfirmees, source }
reputation            avis publics : note, nombre d'avis, plateforme, date du relevé
capaciteDeFrappe      effectif commercial, canal, maillage, investissements annoncés
lectureConcurrentielle comment cet acteur se comporte sur une affaire, et face à quoi
droitDeReponse        ce que l'acteur pourrait légitimement contester dans cette fiche
```

### Valeurs contrôlées — n'invente aucune valeur hors de ces listes

```
centralitePA.indice / .valeur
  4 coeur_de_metier · 3 axe_strategique · 2 extension_naturelle
  1 activite_annexe · conformite_defensive · non_qualifie

postureCommerciale.valeur
  grossiste · canal_indirect · conquete_directe · base_installee · non_qualifie

typeActionnaire
  fondateurs · fonds_pe · industriel · cote · filiale (= d'un groupe ÉTRANGER)
  public · non_qualifie

socleTechnique.type
  propre · marque_blanche · marque_grise · hybride · inconnu

caEntiteFrancaise.nature
  comptes_deposes · chiffre_declare_site · communique_financier
  comptes_confidentiels · aucun_compte_depose · non_publie · sans_objet

referencesClients.perimetre
  references_pa · references_groupe · mixte · aucune_publiee · non_qualifie

relationFluxym.nature
  solution_distribuee · partenaire_technologique · concurrent
  neutre · non_qualifie

confiance (partout)
  haute · moyenne · faible · non_qualifie
```

## Méthode de recherche — l'ordre compte

1. **Registre d'abord.** `annuaire-entreprises.data.gouv.fr` sur le SIREN : dénomination, dirigeants, effectif, catégorie, établissements, puis l'onglet données financières pour les comptes déposés. Si la file ne donne pas de SIREN, trouve-le : c'est ce document qui ancre toute la fiche.
2. **Conditions générales et politique de confidentialité ensuite.** C'est là, et nulle part ailleurs, que l'acteur est contraint de nommer l'entité qui opère la plateforme agréée. C'est la meilleure source pour `socleTechnique`.
3. **Qui déclare s'appuyer sur cet acteur.** Un acteur ne publie pas de qui il dépend ; celui qui dépend de lui le publie, parce que c'est un argument de réassurance.
4. **Page de cas clients**, en cherchant l'URL avant de la charger : elle ne se devine pas. Relève les noms de fichiers des logos autant que le texte, ils portent souvent le nom du client.
5. **Page produit en dernier.** Elle revendique l'immatriculation et ne nomme jamais l'opérateur. Rendement quasi nul, sauf pour les activités et le modèle tarifaire.

## Interdits de fond

- **Ne jamais estimer une part de chiffre d'affaires attribuable à la facturation électronique.** Jamais, sous aucune formulation, même prudente.
- **Ne jamais confondre un objectif annoncé avec un chiffre réalisé.**
- **Ne jamais reprendre un chiffre d'agrégateur qui modélise.** Le greffe, le registre national et l'INSEE republient un document déposé : ce sont des sources. Les agrégateurs qui estiment n'en sont pas.
- **Ne jamais reprendre la nomenclature sectorielle de l'acteur telle quelle** : elle est souvent redondante. Conserve-la dans `libellesSecteursEditeur` et traduis vers les secteurs du référentiel.
- **Ne jamais présenter une référence de groupe comme une référence de l'activité agréée.** Si l'acteur vend autre chose que de la facturation électronique, `perimetre` doit le dire.
- **Ne jamais confondre le nom du produit et le nom de la plateforme agréée.**
- **Ne jamais pronostiquer** l'avenir d'un acteur, ni commenter sa solidité au-delà des faits publiés.
- **Un bloc vide motivé est un résultat**, un bloc vide silencieux est une faute. Écris pourquoi tu n'as pas trouvé.
- **Tout est daté et sourcé**, champ par champ, dans `sourcesEnrichissement` : `{ champ, source, dateReleve, confiance }`.

## Le cas Fluxym

Fluxym est un intégrateur qui **distribue BASWARE, ESKER, GEP et IVALUA**. Ce ne sont pas des adversaires, ce sont les solutions de son catalogue.

Le champ `relationFluxym` est obligatoire sur toute fiche. Dans la très grande majorité des cas il vaudra `neutre` ou `concurrent`, mais il doit être renseigné explicitement, avec sa source. Une fiche qui laisse ce champ vide laisse le lecteur déduire une hostilité qui n'existe peut-être pas.

Et `lectureConcurrentielle` doit être écrite en conséquence : sur une solution distribuée par Fluxym, ce bloc décrit **contre qui Fluxym défend cette solution**, pas comment on l'attaque.

## Structure exacte du fichier à produire

```json
{
  "_patch": {
    "id": "360-L__LIGNE__",
    "chantier": "Fiche 360 complète — file de travail ligne __LIGNE__",
    "societe": "<nom>",
    "auteur": "RFE_WebSite",
    "dateReleve": "<AAAA-MM-JJ du jour>",
    "nbPlateformes": 1,
    "nouveauxChamps": [],
    "reglesProposees": [],
    "observationsTiers": [],
    "note": "<ce que tu as trouvé, ce que tu n'as pas trouvé et pourquoi, les écrasements et leur justification>"
  },
  "plateformes": [
    { "nom": "...", "...": "...", "sourcesEnrichissement": [ ... ] }
  ]
}
```

Avant de livrer : **relis la fiche existante** dans le référentiel et **simule la fusion**. Tout écrasement d'une valeur déjà renseignée doit être intentionnel, justifié dans `_patch.note`, et la valeur d'origine conservée dans `_patch.ecrasementsIntentionnels`.

## Contrôle de bonne fin

Avant de rendre, vérifie les onze points :

1. le `nom` est identique au caractère près à celui de la file
2. `siren` renseigné, ou son absence motivée
3. `socleTechnique.type` n'est pas `inconnu` sans que tu aies lu les conditions générales
4. `relationFluxym.nature` est renseigné
5. `centralitePA.indice` est justifié par un faisceau d'indices, pas asséné
6. `referencesClients.perimetre` est renseigné dès qu'il y a une référence
7. aucune part de chiffre d'affaires attribuable n'a été estimée
8. chaque champ posé a une entrée dans `sourcesEnrichissement`
9. les blocs vides sont motivés par écrit
10. la fusion est simulée, les écrasements documentés
11. le JSON est valide et ne contient qu'une seule plateforme
