# BRIEF F — Identité des entités étrangères

**Chantier :** F · **Périmètre :** les entités dont `pays ≠ "France"` · **Nature :** manuel assisté
**Patch attendu :** `patches/patch-F<n>.json`, un fichier par lot
**Note de cadrage :** `cartographie-entites-etrangeres.md` — **à lire avant de commencer**

## Objectif

Donner une identité juridique vérifiable aux plateformes que le répertoire SIRENE ne connaît pas, en remplaçant l'ancre `siren` par une ancre internationale.

Ce chantier **ne traite pas** la qualification marché : elle relève du chantier E, lots E10 à E13, et se mène indépendamment.

## Périmètre et lots

Les lots F reprennent **exactement** le découpage des lots E, pour que les deux chantiers puissent avancer sur les mêmes entités sans se croiser.

| Lot F | Entités | Correspond à |
|---|---|---|
| **F1** | A-Cube, ADEMICO SOFTWARE, Arratech, Aruba S.p.A., B4VALUE.NET, BASWARE, BILLIT, CBS Corporate Business Solutions, DIGITAL TECHNOLOGIES, DOKAPI | E10 |
| **F2** | Docnova, MELASOFT GmbH, ECOSIO, EDICOM Group, Fonoa Technologies Limited, GURUSOFT, INDICOM, INVOPOP, In.Te.S.A. spa, MAROSA, MySupply Aps | E11 |
| **F3** | NTT DATA Business Solutions, ODOO, SAP, SEEBURGER, SNI, SOLO, SPS COMMERCE, Shine, TESISQUARE SPA, TRADESHIFT BABELWAY | E12 |
| **F4** | Transalis Limited, VOXEL, an Amadeus company, WiseTech GLOBAL, ecosio InterCom, a Vertex Company, iEDI ApS | E13 |
| **F5** | Les entités déjà cartographiées mais sans identité : B2BRouter, COMARCH SA, OPENTEXT, PAGERO, SOVOS, STORECOVE, Legalinvoice by Tinexta Infocert | issues des lots 1 à 3 |
| **F6** | Les **candidates étrangères** des lots E14/E15. **Première tâche du lot : établir la liste sur pièces**, à partir du champ `pays` du JSON, sans présumer du pays d'après le nom. | E14/E15 |

Un lot par conversation. Jamais deux conversations sur le même lot.

## Méthode, dans cet ordre, et on s'arrête dès que l'identité est ancrée

1. **VIES** (Commission européenne) — valider le n° de TVA intracommunautaire, récupérer raison sociale et adresse officielles.
   Si le n° n'est pas connu au départ : le chercher dans les mentions légales / *Impressum* / *legal notice* / conditions générales du site de la plateforme. C'est presque toujours là, et c'est une source de premier rang.
2. **BRIS / e-Justice** — récupérer l'EUID et la forme juridique.
3. **GLEIF** — récupérer le LEI, et surtout **l'entité mère directe et l'entité mère ultime** : c'est la meilleure source disponible pour `groupeCapitalistique`, bien meilleure que la presse.
4. **Registre national du pays** — voir le tableau des sources par pays dans la note de cadrage. Ne pas payer un extrait : si le registre est payant, on s'arrête et on laisse `null`.
5. **Présence en France** — chercher une filiale ou succursale française via l'API Recherche d'entreprises (nom du groupe, pas nom commercial). Renseigner `presenceEnFrance`, y compris à `aucune_connue` quand la recherche est infructueuse : c'est un résultat, pas une absence de résultat.

## Champs à produire

Bloc `identiteInternationale`, tel que spécifié au § 4 de la note de cadrage :
`paysISO`, `registreNational`, `identifiantRegistre`, `numeroTVAIntracom`, `tvaVerifieeVIES`, `dateVerificationVIES`, `euid`, `lei`, `formeJuridique`, `codeNACE`, `categorieUE`, `presenceEnFrance`, `peppolParticipantId`, `sourceIdentite`, `confianceIdentite`.

Plus, quand ils sont établis : `raisonSociale`, `dateCreation`, `groupeCapitalistique`, `relationCapitalistique`.

**Ne jamais renseigner `siren` pour une entité étrangère.** Si une filiale française existe, son SIREN va dans `presenceEnFrance.siren`, jamais dans le champ `siren` de la fiche, qui reste réservé à l'entité immatriculée par la DGFiP.

## Règle de confiance

- `haute` : identifiant confirmé par une source officielle (VIES, BRIS, GLEIF, registre national) **et** raison sociale concordante avec le nom de la liste DGFiP.
- `moyenne` : concordance sur le nom seul, ou source secondaire (site de la société uniquement).
- `non_qualifie` : rien de probant. Tous les champs restent à `null`, et le motif est écrit dans `_patch.note`.

Homonymie : les groupes internationaux ont souvent une dizaine d'entités au même nom dans plusieurs pays. **Retenir uniquement l'entité dont l'adresse concorde avec celle publiée par la DGFiP.** À défaut de concordance d'adresse, ne rien retenir.

## Interdits

- Déduire un pays du nom de la société ou d'un suffixe (`GmbH`, `S.p.A.`, `ApS`…). Le pays vient de `adresse`, et il est lui-même à fiabiliser.
- Recopier un dirigeant depuis LinkedIn, Crunchbase, Societe.com ou tout agrégateur : seuls les registres officiels font foi.
- Inscrire un n° de TVA non vérifié à VIES. `tvaVerifieeVIES: false` est une réponse acceptable ; un n° inventé ne l'est pas.
- Écrire quoi que ce soit sur les **conditions réglementaires** applicables aux PA étrangères (établissement stable, représentant, hébergement des données). Cette question est **ouverte** : voir § 6 de la note de cadrage. Aucun texte sur ce sujet ne sera publié sans validation @RFE_Expert sur textes primaires.
- Présenter le n° de TVA (ICD 0223) comme l'identifiant d'une plateforme dans l'annuaire : l'identifiant pivot d'une PA est le matricule 4 caractères (ICD 0238), non public.

## Format de sortie

Conforme à `FORMAT-PATCH.md`, avec deux précisions propres au chantier F :

- `identiteInternationale` **fusionne clé par clé**, comme `socleTechnique`. La fusion dans `merge-plateformes.html` doit être adaptée en conséquence avant l'intégration du premier patch F.
- `_patch.chantier` vaut `"F — identité entités étrangères"`.

## Contrôle avant dépôt

- chaque `nom` existe à l'identique dans `data/plateformes-agreees.json` ;
- chaque valeur porte sa source et sa date dans `sourcesEnrichissement` ;
- aucune entité étrangère ne s'est vu attribuer un `siren` ;
- les entités non trouvées sont listées nommément dans `_patch.note`.
