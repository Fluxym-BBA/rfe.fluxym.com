# Prompt réutilisable — production d'une fiche 360

Copie tout ce qui suit la ligne de tirets, remplace **`__LIGNE__`** par le numéro de ligne, et colle dans un onglet neuf. Rien d'autre à changer.

> **Version 2.1 — 26/08/2026.** Cette version impose le schéma `analyse360` v1.1. Les 60 premières fiches ont été produites avec la version 1, qui décrivait les blocs en prose : il en est sorti 5 graphies pour un même concept, 4 blocs typés tantôt objet tantôt chaîne, 13 fiches qui ne s'affichaient plus et 26 qui perdaient une section entière. Le contrat de données est désormais explicite. Référence complète : `Info IA/plateformes-agreees/SCHEMA-360.md`.
>
> **Partage des rôles entre les documents.** `cartographie-360-modele.md` décide du **fond** : la finalité, le barème de centralité, les sources par bloc, les neuf règles de publication. Ce prompt et `SCHEMA-360.md` décident de la **forme**. Son exemple JSON du § 3 a été recopié tel quel par les 60 premières fiches alors qu'il portait trois écritures périmées (`centralitePA.niveau`, actionnariat à la racine, `caEntiteFrancaise` sans `dateReleve`) : il a été corrigé le 26/08/2026. Si tu lis une version antérieure, **la forme décrite ici l'emporte**.

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

## Règle de forme qui prime sur tout le reste

> **Un concept = une clé. Une clé = un type. Toujours.**

Le site ne devine pas. Une information rangée sous une clé inattendue **disparaît de la page**, sans message d'erreur. Une information d'un type inattendu **casse la page entière**. Les noms de clés donnés plus bas ne sont pas des suggestions : ce sont les seuls que le renderer lit.

**Et si ta recherche ne rentre pas dans le socle ?** Chaque bloc objet accepte une clé `complements`, objet libre. Tout ce qui n'a pas de slot prévu y va, avec le nom de ton choix : le site l'affiche sous « Autres éléments relevés ». Tu gardes ta liberté de relevé, rien ne se perd, et le schéma reste typé. **N'invente jamais une clé à la racine d'un bloc** : mets-la dans `complements`.

## Langue

La fiche est **rédigée en français correctement accentué**. Huit des soixante premières fiches sont revenues sans un seul diacritique (« donnee », « salaries », « immatriculee ») : il a fallu 2 553 corrections a posteriori, dont une partie reste indécidable hors contexte. Une prose non accentuée est un défaut de livraison, pas un détail de forme.

**Mais l'inverse est un défaut aussi.** Les valeurs de vocabulaire contrôlé (`centralitePA.valeur`, `postureCommerciale.valeur`, `confiance`, `nature`, `type`) sont des **jetons techniques en ASCII, sans accent, en `snake_case`** : `axe_strategique`, `coeur_de_metier`, `base_installee`, `conquete_directe`. Ce ne sont pas des libellés de lecture — le libellé affiché et sa définition viennent de `data/pa-taxonomie.json`. Écrire `axe_stratégique` casse le rapprochement, et la page perd le libellé, la définition et la position sur l'échelle 0-4. Accentue la prose, jamais les jetons.

**Une réserve écrite est lue par le public.** Ces fiches sont publiées : évite d'écrire « le montant reste à `null` » ou « les compteurs sont laissés à null » dans une prose destinée au site. Le vocabulaire du référentiel s'écrit en français : « non établi », « non publié », « non relevé à cette date », « constat d'absence au 26/08/2026 ». La distinction entre absence de donnée et valeur nulle doit rester explicite, mais dite en français.

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
immatriculationsLiees  { groupe, type, entrees, lecture, source, dateReleve }
                       entrees = TABLEAU D'OBJETS [ { nom, siren } ], jamais de chaînes :
                       un tableau de chaînes fait planter la page de la fiche
```

### Bloc `analyse360` — onze blocs, types imposés

```
metierPrincipal          CHAÎNE. Ce que la société vend, en une phrase, hors
                         facturation électronique.

activites                TABLEAU D'OBJETS [ { libelle, poids, source } ]
                         poids ∈ majeur · significatif · mineur
                         Jamais un tableau de chaînes : le poids serait perdu.

lectureConcurrentielle   CHAÎNE. Comment cet acteur se comporte sur une affaire,
                         et face à quoi. Jamais un objet.

poidsEconomique          OBJET
  caEntiteFrancaise      { montantMEUR, exercice, nature, dateReleve, source, commentaire }
  caGroupe               idem
    montantMEUR          NOMBRE en millions d'euros, 2 décimales maximum.
                         Pas de `montant` en unités, pas de 7 décimales.
                         Chiffre inconnu -> null, jamais 0. Le 0 se lit comme
                         « chiffre d'affaires nul », ce qui est un contresens.
    dateReleve           OBLIGATOIRE, même quand le montant est null : la date
                         atteste alors du constat d'absence.
  resultatNet            nombre en M€, ou chaîne si le relevé est qualitatif
  effectifEntite         CHAÎNE. Effectif de l'entité immatriculée.
  effectifGroupe         CHAÎNE. Effectif du groupe, si le périmètre diffère.
                         PAS de clé `effectif` : elle a produit 51 doublons,
                         dont 4 avec des millésimes contradictoires.
  ventilationParActivite { disponible: bool, motif, derniereVentilationConnue }
  nbEtablissements, categorieINSEE, lecture, source, dateReleve, confiance

centralitePA             OBJET
  indice                 ENTIER 0 à 4, cohérent avec `valeur` (voir plus bas)
  valeur                 ÉNUMÉRATION. La clé est `valeur`. PAS `niveau` :
                         47 fiches ont écrit `niveau` et perdu toute la section.
  marqueProduitDediee    chaîne
  entiteJuridiqueDediee  booléen
  faisceauIndices        TABLEAU D'OBJETS [ { signal, sens: "+"|"-", preuve } ]
  lecture, source, dateReleve, confiance, complements

postureCommerciale       OBJET
  valeur                 énumération (voir plus bas)
  modeleTarifaire        chaîne
  tarifPublie            booléen
  offreGratuite          chaîne ou booléen
  lecture, preuve, source, dateReleve, confiance, complements

referencesClients        OBJET
  nbCiteesSurSite        entier ou chaîne
  perimetre              énumération (voir plus bas)
  parSecteur             OBJET { <secteur du référentiel>: [ noms ] }
  libellesSecteursEditeur  TABLEAU
  grandsComptes          TABLEAU
  referencesPAConfirmees TABLEAU — jamais une chaîne, cela fait planter la page
  lecture, commentaire, attention, source, dateReleve, confiance, complements

reputation               OBJET
  avis                   TABLEAU D'OBJETS, un par plateforme d'avis :
                         [ { plateforme, note, nombreAvis, dateReleve, source,
                             commentaire } ]
                         note = NOMBRE (4.4). Si la source ne publie qu'une
                         forme textuelle, mets-la dans `noteBrute` et laisse
                         `note` à null.
                         nombreAvis = ENTIER (1100). Forme d'origine
                         (« 1 100+ ») dans `nombreAvisBrut`.
                         Ne pose JAMAIS `plateforme` / `note` / `nombreAvis`
                         à la racine de `reputation` : 30 fiches l'ont fait,
                         leurs avis ne s'affichaient pas.
  synthese               chaîne. Ce que disent les avis, en agrégat.
  distribution           chaîne ou objet. Répartition des notes si publiée.
  lecture, commentaire, source, dateReleve, confiance, complements

capaciteDeFrappe         OBJET
  canal                  chaîne — comment l'acteur va au marché
  maillage               chaîne — implantation territoriale
  effectifCommercial     chaîne ou entier
  investissementsAnnonces  chaîne
  acquisitions           TABLEAU
  financementRecent      chaîne
  actionnariat           OBJET { type, actionnaires, detail, source }
                         type ∈ voir énumération `typeActionnaire`
                         L'actionnariat est ICI, plus dans `poidsEconomique`.
  modeleTarifaire, tarifPublie, offreGratuite
  lecture, source, dateReleve, confiance, complements

dynamique                OBJET
  offresEmploiOuvertes     entier — total des postes ouverts
  offresLieesFacturationElectronique  entier — dont ceux qui la mentionnent
  naturesPostes            tableau — R&D, avant-vente, delivery, support…
  dateReleveOffres         AAAA-MM-JJ
  lecture, source, confiance, complements
                         Bloc demandé par BRIEF-G étape 5 et déjà affiché par le
                         site : AUCUNE des 90 premières fiches ne l'a produit,
                         parce que la version 1 de ce prompt ne le listait pas.
                         Un volume d'offres n'est JAMAIS présenté comme un
                         indicateur de rotation du personnel.

droitDeReponse           OBJET
  signale                BOOLÉEN. false par défaut. true seulement si un droit
                         de réponse a effectivement été exercé.
  date                   AAAA-MM-JJ, si signale = true
  objet                  chaîne — ce qui a été contesté
  pointsContestables     TABLEAU — ce que l'acteur pourrait légitimement
                         contester dans cette fiche.
                         UNE SEULE GRAPHIE. Ni pointsLegitimementContestables,
                         ni elementsContestables, ni objetsContestables,
                         ni cequilpourraitcontester. Cinq graphies sont
                         apparues sur 60 fiches : quatre n'affichaient rien.
  canal, lecture, source, confiance, complements
```

### Valeurs contrôlées — n'invente aucune valeur hors de ces listes

```
centralitePA.valeur  ->  centralitePA.indice
  coeur_de_metier      -> 4
  axe_strategique      -> 3
  extension_naturelle  -> 2
  activite_annexe      -> 1
  conformite_defensive -> 0
  non_qualifie         -> null
  L'indice n'est pas libre : il découle de la valeur. Toute incohérence est
  corrigée en faveur de data/pa-taxonomie.json.

postureCommerciale.valeur
  grossiste · canal_indirect · conquete_directe · base_installee · non_qualifie

capaciteDeFrappe.actionnariat.type
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

activites[].poids
  majeur · significatif · mineur

confiance (partout)
  haute · moyenne · faible · non_qualifie
  Jamais null, jamais absent.
```

## Méthode de recherche — l'ordre compte

1. **Registre d'abord.** `annuaire-entreprises.data.gouv.fr` sur le SIREN : dénomination, dirigeants, effectif, catégorie, établissements, puis l'onglet données financières pour les comptes déposés. Si la file ne donne pas de SIREN, trouve-le : c'est ce document qui ancre toute la fiche.
2. **Conditions générales et politique de confidentialité ensuite.** C'est là, et nulle part ailleurs, que l'acteur est contraint de nommer l'entité qui opère la plateforme agréée. C'est la meilleure source pour `socleTechnique`.
3. **Qui déclare s'appuyer sur cet acteur.** Un acteur ne publie pas de qui il dépend ; celui qui dépend de lui le publie, parce que c'est un argument de réassurance.
4. **Page de cas clients**, en cherchant l'URL avant de la charger : elle ne se devine pas. Relève les noms de fichiers des logos autant que le texte, ils portent souvent le nom du client.
5. **Page produit en dernier.** Elle revendique l'immatriculation et ne nomme jamais l'opérateur. Rendement quasi nul, sauf pour les activités et le modèle tarifaire.

## Traçabilité — `sourcesEnrichissement`

Tableau d'objets, **jamais d'URL nue** :

```json
{ "champ": "analyse360.reputation.avis", "source": "Trustpilot",
  "url": "https://...", "dateReleve": "2026-08-26", "confiance": "haute" }
```

`champ` est **préfixé par le chemin du bloc concerné** : `analyse360.poidsEconomique.caGroupe`, `analyse360.capaciteDeFrappe`, `identiteJuridique`, `socleTechnique`… Sur les 60 premières fiches, 76 entrées n'avaient pas de `champ` du tout et 47 étaient des URL nues : la couverture du sourcing devenait incontrôlable, et 8 fiches se sont retrouvées avec un bloc 360 sans aucune source rattachée.

## Interdits de fond

- **Ne jamais estimer une part de chiffre d'affaires attribuable à la facturation électronique.** Jamais, sous aucune formulation, même prudente.
- **Ne jamais confondre un objectif annoncé avec un chiffre réalisé.**
- **Ne jamais reprendre un chiffre d'agrégateur qui modélise.** Le greffe, le registre national et l'INSEE republient un document déposé : ce sont des sources. Les agrégateurs qui estiment n'en sont pas.
- **Ne jamais reprendre la nomenclature sectorielle de l'acteur telle quelle** : elle est souvent redondante. Conserve-la dans `libellesSecteursEditeur` et traduis vers les secteurs du référentiel.
- **Ne jamais présenter une référence de groupe comme une référence de l'activité agréée.** Si l'acteur vend autre chose que de la facturation électronique, `perimetre` doit le dire.
- **Ne jamais confondre le nom du produit et le nom de la plateforme agréée.**
- **Ne jamais pronostiquer** l'avenir d'un acteur, ni commenter sa solidité au-delà des faits publiés.
- **Ne jamais additionner deux périmètres.** Le chiffre d'affaires du groupe et celui de l'entité française ne se cumulent ni ne se confondent.
- **Un bloc vide motivé est un résultat**, un bloc vide silencieux est une faute. Écris pourquoi tu n'as pas trouvé.
- **Tout est daté et sourcé**, champ par champ, dans `sourcesEnrichissement`.

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
    "schemaAnalyse360": "1.0",
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

## Ce qui se passe après ta livraison

Après fusion, deux scripts tournent sur le référentiel, **dans cet ordre** :

```
python3 tools/normalize-360.py  data/plateformes-agreees.json   # ferme le schéma
python3 tools/arbitrate-360.py  data/plateformes-agreees.json   # tranche le reste
```

Ils rattraperont une clé mal nommée ou un type inattendu, mais **en dégradant** : ta clé partira dans `complements` au lieu de son slot, ou une date sera reconstituée au lieu d'être relevée. Un patch conforme au schéma traverse les deux scripts sans qu'ils aient rien à corriger. C'est l'objectif.

## Contrôle de bonne fin

Avant de rendre, vérifie les seize points :

1. le `nom` est identique au caractère près à celui de la file
2. `siren` renseigné, ou son absence motivée
3. `socleTechnique.type` n'est pas `inconnu` sans que tu aies lu les conditions générales
4. `relationFluxym.nature` est renseigné
5. `centralitePA.valeur` est utilisé — **pas `niveau`** — et `indice` en découle
5bis. les jetons de vocabulaire sont en ASCII sans accent : `axe_strategique`, jamais `axe_stratégique`
6. `referencesClients.perimetre` est renseigné dès qu'il y a une référence, et `referencesPAConfirmees` est un tableau
7. `reputation.avis` est un tableau d'objets, rien à la racine
8. `droitDeReponse.pointsContestables` — cette graphie et aucune autre
9. l'actionnariat est dans `capaciteDeFrappe.actionnariat`, pas dans `poidsEconomique`
10. `effectifEntite` / `effectifGroupe`, jamais `effectif`
11. tout `montantMEUR` est en millions, à 2 décimales, et son `dateReleve` est posée même si le montant est null
12. aucune part de chiffre d'affaires attribuable n'a été estimée
13. chaque champ posé a une entrée dans `sourcesEnrichissement`, avec un `champ` préfixé
14. les blocs vides sont motivés par écrit, et toute clé hors socle est dans `complements`
15. la prose est en français accentué, et la fusion est simulée avec ses écrasements documentés
16. le JSON est valide, ne contient qu'une seule plateforme, et aucun bloc objet n'est livré sous forme de chaîne
17. le bloc `dynamique` est présent, avec `dateReleveOffres` posée même quand les compteurs sont à `null`
18. aucune réserve de méthode ne parle de `null` en anglais dans une prose destinée à la page publique
