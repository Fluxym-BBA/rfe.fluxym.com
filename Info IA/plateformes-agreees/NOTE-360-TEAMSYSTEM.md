# Chantier 360 — TeamSystem (fiche « TeamSystem Sellsy »)

**Date de relevé : 25/08/2026** · Auteur : RFE_WebSite · Patch : `patches/patch-360-TEAMSYSTEM.json` (1 fiche)

## Pourquoi cette fiche, et pourquoi maintenant

Elle est née d'une erreur. En cherchant l'actionnariat de MY UNISOFT pour le lot « profession comptable », l'hypothèse d'un lien avec ACD Groupe a été testée puis écartée. Le test a en revanche fait apparaître autre chose : **ACD Groupe a rejoint le groupe italien TeamSystem en avril 2026**. Or TeamSystem figure au référentiel depuis le début, sous le nom d'une entrée que rien ne signalait — « TeamSystem Sellsy », adossée à SELLSY, PME de La Rochelle.

C'est le second cas, après 74SOFTWARE, d'un poids lourd resté invisible parce que le référentiel ne le connaissait que par une entité mal dimensionnée. Mais la nature du risque est ici tout autre : **TeamSystem est le seul acteur du référentiel qui a déjà fait, dans son pays, exactement ce que la réforme française rend possible.**

## Les trois ancrages de poids économique

Ils sont tenus séparés et ne s'additionnent pas (règles 11c et 73).

| Niveau | Montant | Exercice | Nature |
|---|---|---|---|
| Groupe TeamSystem | **1,15 Md€** de chiffre d'affaires, EBITDA normalisé **579 M€** (marge 50,2 %) | 2025 | communiqué relayé par la presse professionnelle |
| Entité française immatriculée (SELLSY) | **16,72 M€** de chiffre d'affaires, résultat net **−826,3 k€** | clos le 30/12/2024 | comptes déposés, via republieurs |
| Ventilation par division | Micro **302 M€** (+67 %, dont +24,5 % en organique, marge brute ~85 %), Enterprise **191 M€** (+5,3 % organique) | 2024 | rapports aux porteurs obligataires, relayés |

Rappel de trajectoire : le groupe a franchi le milliard en 2024 (+19 %), après avoir été une société de logiciels de 356 M€ en 2018. Revenu récurrent annuel supérieur à 1 Md€, part récurrente d'environ 88 %.

**Réserve explicite sur l'entité française** : le chiffre d'affaires de SELLSY passe de 8,42 M€ à 16,72 M€ en un exercice, soit +98,5 %. Une telle progression ne s'explique pas par la seule croissance commerciale et suggère une opération de périmètre, que cette passe n'a pas documentée. Le fait que l'établissement siège ait été recréé le 05/12/2025, pour 9 établissements dont 2 seulement en activité, renforce l'hypothèse sans l'établir. Le chiffre est publié tel quel, avec sa réserve.

## Ce qui fait la centralité : indice 3, avec double lecture

L'indice retenu est **3 — axe stratégique**, et la double lecture est assumée (règle 11f) :

- **Lue seule, l'entité justifierait un indice 2.** Sellsy est une suite française de gestion commerciale ; la plateforme agréée n'a pas de marque propre, elle est une fonction du produit.
- **Lu au niveau du groupe, l'indice est 3.** La facturation électronique n'est pas une fonction périphérique, c'est la matière première : **plus de 500 millions de factures électroniques par an, pour plus de 1 100 milliards d'euros de transactions**. Les services fintech du groupe — notation des PME, financement, paiement — sont adossés à ce flux : la plateforme est le capteur, pas la finalité.

C'est la seconde lecture qui détermine l'indice, parce que c'est elle qui détermine les moyens engagés.

**La preuve la plus forte du faisceau n'est pas produite par l'acteur** : Confindustria, la principale organisation patronale italienne, construit un indicateur d'activité économique en temps réel à partir des données de facturation de TeamSystem. Une organisation qui n'a aucun intérêt à valoriser un éditeur adosse un indicateur macroéconomique à ses flux : c'est une mesure externe de la densité de sa position (règle 83).

L'indice ne monte pas à 4 : le groupe reste un éditeur de gestion généraliste, dont la majorité du chiffre d'affaires provient de logiciels métier et non de la facturation.

## Le build-up français, et pourquoi il change la lecture du lot précédent

Le groupe recompose en France, par acquisitions, l'assemblage qui lui a réussi en Italie :

- **Sellsy** — gestion commerciale et facturation, entité porteuse de l'immatriculation
- **Clémentine** — expertise comptable en ligne
- **ClicData** — restitution de données
- **ACD Groupe** — prise de contrôle annoncée en **avril 2026** : **3 500 cabinets d'expertise comptable, environ 30 000 utilisateurs, 37 M€ de chiffre d'affaires**

Rapproché du lot « profession comptable » livré la veille, cela signifie qu'**un acteur d'un milliard d'euros vient de s'acheter l'accès au canal comptable français** — celui-là même dont il a été établi qu'il tranche la question de la plateforme avant qu'elle ne soit posée. C'est aussi ce qui fait basculer la posture : elle est qualifiée `conquete_directe` pour l'état présent de l'entité (acquisition en ligne, libre-service, tarifs publiés à partir d'environ 29 € HT par utilisateur et par mois), mais le champ `preuve` porte le basculement annoncé vers le canal indirect (règle 84).

## L'actionnariat et le levier

`typeActionnaire` = **`fonds_pe`**. Hellman & Friedman contrôle le groupe depuis 2016, avec un réinvestissement entre ses propres fonds en 2021 sur une valorisation d'environ 2,9 Md€ ; Silver Lake est entré en 2023 comme minoritaire pour environ 600 M€ sur une valorisation supérieure à 6 Md€ ; ADIA et CapitalG sont cités comme minoritaires additionnels. Historique : Bain Capital, puis HgCapital. Plus de soixante-dix acquisitions depuis 2000.

La double lecture est notée dans le bloc `actionnaires` : l'entité française est **aussi** la filiale d'un groupe étranger. Les deux qualifications sont exactes ; la valeur retenue qualifie la nature du contrôle ultime.

**Point de vigilance publié sans pronostic (règle 85)** : endettement de l'ordre de **3,4 Md€** relevé en juillet 2025, soit près de trois fois le chiffre d'affaires et environ six fois l'EBITDA, dont une part a financé une distribution aux actionnaires plafonnée à environ 700 M€. Notation B- perspective stable. Un tel levier peut aussi bien imposer une agressivité tarifaire pour gagner du volume qu'une hausse des prix sur base installée pour servir la dette. Les deux lectures sont exposées, aucune n'est choisie.

## Ce que le lot apprend sur la méthode

**Le classement INSEE ne mesure rien.** SELLSY est classée « Petite ou Moyenne Entreprise » alors qu'elle appartient à un groupe de 1,15 Md€, parce que ce groupe est italien. FIDUCIAL CLOUD, analysée la veille, est classée « Grande Entreprise » avec 20 à 49 salariés, parce que son groupe est français. La catégorie d'entreprise ne consolide que les périmètres français : elle est un signal d'appartenance à un groupe **français**, jamais une mesure de poids (règle 81). Sur ces deux fiches, prises à un jour d'intervalle, l'indicateur se trompe dans les deux sens opposés.

**Un groupe non coté sous contrôle de fonds ne se lit que par ses créanciers.** Ventilation par division, endettement, EBITDA : tout vient des rapports adressés aux porteurs obligataires, relayés par des tiers. Ces éléments sont publiés, datés, en confiance moyenne, et jamais présentés comme une communication du groupe (règle 82).

## Lecture concurrentielle

Deux enseignements pour l'offre portée par Fluxym.

**La menace immédiate est par le bas, pas de front.** La division Enterprise ne pèse que 191 M€ sur 1 Md€ et croît lentement — 5,3 % en organique — alors que la division micro croît de 24,5 % avec environ 85 % de marge brute. Le segment ETI et grands comptes n'est pas la priorité de cet acteur aujourd'hui ; la PME l'est, avec une capacité de compression tarifaire réelle.

**La menace structurante est le canal.** ACD Groupe branche ce groupe sur 3 500 cabinets français. C'est le même mécanisme que celui décrit dans le lot « profession comptable », mais actionné par un acteur qui a un milliard d'euros de chiffre d'affaires, dix-huit mois d'avance d'expérience sur la réforme, et une seconde ligne de revenu fintech qui rend la plateforme elle-même presque indifférente au prix.

Fluxym est un acteur du marché. Ce référentiel est publié par un intégrateur qui distribue des solutions concurrentes, et cette lecture est une lecture de marché, pas une évaluation.

## Contrôles effectués avant livraison

- **Énumérations vérifiées facette par facette** contre `data/pa-taxonomie.json` (règles 23 et 72) : `centralitePA`, `postureCommerciale`, `typeActionnaire`, `nature` des blocs de chiffre d'affaires. Aucune erreur détectée cette fois.
- **Structure et ordre du bloc `analyse360`** contrôlés clé par clé. Le bloc optionnel `dynamique`, initialement présent mais intégralement vide, a été retiré plutôt que livré nul : le comptage des offres d'emploi relève de la passe unique datée prévue par la règle 19.
- **Forme canonique des blocs de chiffre d'affaires** contrôlée, montants en millions sous `montantMEUR`.
- **Simulation de fusion** : **1 fiche reconnue, 0 rejet, 0 écrasement de valeur existante, aucune suppression**. Le bloc `analyse360` est créé, les sept sources sont ajoutées en cumulatif.
- **Aucun compteur global du référentiel n'est annoncé** (règle 75).

## Reste à faire identifié par cette fiche

- **Relevé des logos clients de Sellsy** : les pages de références et la page produit dédiée à la réforme sont rendues côté client et n'ont restitué aucun contenu par récupération directe. Un relevé par capture de la page rendue est nécessaire — c'est le seul moyen de renseigner `parSecteur` sur des références que l'acteur assume lui-même.
- **Documenter l'opération de périmètre de SELLSY** qui explique le +98,5 % de l'exercice 2024, par les annonces BODACC et les observations au registre.
- **Fiche 360 d'ACD Groupe** en propre, ou rattachement documenté à la présente fiche : 3 500 cabinets et 37 M€ de chiffre d'affaires justifient un traitement autonome, et il faut vérifier si ACD ou l'une de ses entités figure au référentiel sous un autre nom.
- **Créer la liaison capitalistique** entre l'entrée « TeamSystem Sellsy » et toute autre entrée du référentiel appartenant au même groupe, via le champ `immatriculationsLiees` et la facette `liaisonImmatriculations` du chantier H2 — sous réserve que le lien soit établi sur preuve (règle 29).
- **Comptes consolidés de TeamSystem** : rechercher un dépôt au registre italien permettant de sortir des seules données relayées par les créanciers.
- **Clémentine et ClicData** : établir les entités françaises et vérifier si elles portent des immatriculations distinctes.
- **Poids de la France dans le groupe** : non publié, non estimé, à chercher dans une éventuelle communication de la filiale française.
