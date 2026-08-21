# Priorisation concurrentielle du chantier 360

**Emplacement :** `Info IA/plateformes-agreees/PRIORISATION-CONCURRENCE.md`
**Version :** 2 — **remplace intégralement** la version du 21/08/2026 après-midi, établie sur les seuls noms des lots.
**Base :** `data/plateformes-agreees.json` complet (163 entrées, relevé DGFiP du 17/08/2026, référentiel daté du 19/08/2026), analysé le 21/08/2026.
**Annexe :** `cohorte-eti-grands-comptes.csv` — les 53 sociétés du cœur de cible, nominatives.

---

## 1. Le portefeuille Fluxym, et un trou dans la raquette

Fluxym distribue **BASWARE**, **ESKER**, **GEP** et **IVALUA**. Bruno porte l'offre **ESKER**.

Première conclusion, et elle n'est pas anodine :

> **IVALUA n'est pas dans le référentiel des plateformes agréées.** Aucune entrée, ni immatriculée, ni candidate, sur les 163 de la liste DGFiP au 17/08/2026.

Même constat pour **COUPA** et **LIBEO**, deux acteurs qu'on attendrait sur ce marché.

C'est une information de premier ordre pour Fluxym, et elle sort du référentiel sans aucune analyse supplémentaire : un client Ivalua devra passer par **une plateforme agréée tierce** pour ses flux réglementaires. Trois questions en découlent, qui sont commerciales et non documentaires : laquelle, sur quel socle, et qui tient la relation sur ce flux. À confirmer auprès de l'éditeur — l'absence de la liste au 17/08 ne présume pas d'une immatriculation en cours.

Les trois autres solutions du portefeuille sont bien présentes, et toutes les trois positionnées **ETI et grands comptes exclusivement** :

| Solution | Statut | Vague | Pays | Famille | Nature |
|---|---|---|---|---|---|
| **ESKER** | immatriculée | V1 — 11/12/25 | France | O2C + S2P | extension démat |
| **BASWARE** | immatriculée | V1 — 18/12/25 | Finlande | S2P | extension démat |
| **GEP** | immatriculée | V3 — 17/06/26 | *voir anomalie ci-dessous* | S2P | non renseignée |

### Anomalie GEP, à corriger dans les données

L'entrée GEP porte `pays: "France"`, alors que l'adresse publiée par la DGFiP est **« Innopoli 2 Tekniikantie 14 2600 »**, soit Espoo, en Finlande — la même ville que Basware. Le pays a été mal déduit de l'adresse, et `siren`, `anneeCreation` et `natureEntite` sont vides. Trois corrections à porter, et un rappel utile : le champ `pays` est une donnée dérivée, jamais une donnée source.

---

## 2. État réel du référentiel, et corrections de nos propres documents

Le référentiel est **beaucoup plus avancé** que ce que décrivent `cartographie-reste-a-faire.md` (19/08) et mes notes de ce matin. Relevé sur le fichier complet :

| Champ | Rempli | Ce que disaient nos documents |
|---|---|---|
| `siteWeb` | **161 / 163** | « 9 % » — le chantier A est en réalité **quasi terminé** |
| `descriptionFiche` | 161 / 163 | non mesuré |
| `contact` | 147 / 163 | « 0 % » |
| `familleOrigine` | 157 / 163 | — |
| `segmentCible` | **131 / 163** | « 28 qualifiées, 17 % » — en réalité **80 %** |
| `reseaux` (Peppol) | **112 / 163** | « 2 % » — le chantier D est largement fait |
| `siren` | 79 / 163 | cohérent |
| `dirigeants` | 72 / 163 | cohérent |
| `trancheEffectif` | 57 / 163 | cohérent |

Niveaux de confiance : **116 qualifiées, 43 partielles, 4 amorcées**.

**Trois conséquences directes :**

1. **Les chantiers A et D sont à refermer, pas à lancer.** Il reste 2 sites et une cinquantaine de relevés Peppol, pas 147.
2. **Le vrai retard est l'identité juridique et le poids économique** : `siren` à 48 %, `trancheEffectif` à 35 %. C'est exactement ce que le chantier 360 va chercher.
3. **`cartographie-reste-a-faire.md` est périmé** et doit être régénéré depuis le JSON. Tant qu'il ne l'est pas, il conduit à travailler sur des chantiers déjà faits.

### Le vrai trou de qualification, et il est pile sur notre cible

**27 sociétés ont une `familleOrigine` mais pas de `segmentCible`.** Elles sont donc invisibles de tout filtre par segment. Parmi elles, trois acteurs **S2P** qui sont des concurrents frontaux du portefeuille :

- **MEDIUS** — famille S2P, confiance « qualifiée », segment vide
- **ITESOFT** — famille S2P + GED, confiance « qualifiée », segment vide
- **LUCCA** — famille S2P, segment vide

Un filtre « ETI et grands comptes » les fait aujourd'hui disparaître de l'écran. C'est le correctif le plus urgent du référentiel : trois minutes de travail, et un angle mort qui se referme.

Les 24 autres : ADEMICO SOFTWARE, AGENA 3000, AGS RECORDS MANAGEMENT, Arratech, B4VALUE.NET, CEGI ALFA, DOCUWARE, EDICS France, EDT, ENERJ, ENTROPICS, EURO INFORMATION, GROUPE SIGMA, IAF, ICD International, IGA ASSURANCE, INFOLOGIC, INVOPOP, LOGILEC, LUNDI MATIN, QWEEBY, SWILE, VERYSWING, WAKASTELLAR.

---

## 3. La cible réelle : 93 plateformes, dont 53 au cœur

| Périmètre | Nombre | Part |
|---|---|---|
| Adressent l'ETI ou le grand compte | **93** | 57 % des 163 |
| **Exclusivement** ETI / grands comptes (+ public) | **53** | 33 % |
| Dont familles S2P, O2C ou fintech — concurrence frontale | **16** | 10 % |

La liste nominative des 53, avec pays, vague, famille, nature, site et SIREN, est dans `cohorte-eti-grands-comptes.csv`.

Le marché ETI/GE n'est donc **pas** un petit sous-ensemble : plus d'une plateforme agréée sur deux revendique ce segment. Mais la concurrence frontale sur le métier du portefeuille se resserre à **16 acteurs**, et c'est là que se joue l'essentiel.

### Les 16 concurrents frontaux — segment ETI/GE exclusif, famille S2P / O2C / fintech

| Société | Famille | Pays | Vague | Nature | Commentaire |
|---|---|---|---|---|---|
| **BASWARE** | S2P | Finlande | V1 | extension démat | portefeuille Fluxym |
| **ESKER** | O2C + S2P | France | V1 | extension démat | portefeuille Fluxym |
| **GEP** | S2P | *Finlande (à corriger)* | V3 | non renseignée | portefeuille Fluxym |
| **PAYFLOWS** | fintech + S2P | France | V2 | **diversification** | angle mort documenté, créée en 2022 |
| **TESSI Technologies** | GED + S2P + O2C | France | V1 | extension démat | BPO, grands comptes |
| **SERES** | EDI + S2P + O2C | France | V1 | extension démat | groupe Docaposte |
| **PARAGON** | GED + S2P + O2C | France | V1 | extension démat | démat documentaire |
| **TUNGSTEN AUTOMATION FRANCE** | S2P + GED + EDI | France | V1 | extension démat | ex-Kofax |
| **CEGEDIM** | S2P + O2C | France | V1 | extension démat | à ne pas réduire à la santé |
| **GENERIX Group** | EDI + O2C | France | V1 | extension démat | pilote 360 fait, centralité 2/4 |
| **DOCPROCESS** | EDI + O2C | France | V1 | extension démat | créée en 2018, peu identifiée |
| **VENTYA** | EDI + S2P + O2C | France | V3 | extension démat | créée en 2016, V3 |
| **BC SOLUTIONS** | O2C + S2P | France | V1 | extension démat | peu identifiée |
| **TRADESHIFT BABELWAY** | S2P + EDI | Belgique | V1 | extension démat | réseau B2B international |
| **MySupply Aps** | EDI + S2P | Danemark | V2 | extension démat | quasi inconnue en France |
| **DIGITAL TECHNOLOGIES** | S2P | Italie | V1 | extension démat | quasi inconnue en France |

**À rattacher à cette liste après correction du segment : MEDIUS, ITESOFT et LUCCA** — qui en relèvent manifestement, et dont l'absence ici est un artefact de données, pas une réalité de marché.

### Les autres ETI/GE : 37 acteurs sur des métiers adjacents

Ils n'attaquent pas le même besoin, mais ils croisent les mêmes comptes et peuvent être choisis à la place d'une suite S2P :

- **Conformité fiscale internationale** : SOVOS, PAGERO, AVALARA, MAROSA, TAXERA, CLEARTAX, SNI, Fonoa, EEZI powered by VAT IT, Taxilla Europe, INVOPOP.
- **EDI et intégration** : SEEBURGER, AXWAY, ECOSIO, ecosio InterCom (Vertex), TESISQUARE, SPS COMMERCE, EDICOM Group, EDICOM France, In.Te.S.A., iEDI, SRCI, SYMTRAX.
- **ERP et éditeurs globaux** : SAP, COMARCH, WiseTech Global, Basikon.
- **Intégrateurs** : ACCENTURE, NTT DATA Business Solutions, CBS, Docnova/MELASOFT, EY Expertises & Transactions.
- **GED et archivage** : OPENTEXT, CECURITY, DOXALLIA, ESI, Insiders Technologies.
- **Pure player** : DOKAPI.

Point d'attention : **9 de ces acteurs sont étrangers et quasi inconnus sur le marché français** (MySupply, Digital Technologies, SNI, iEDI, TESISQUARE, SPS Commerce, Taxilla, Dokapi, In.Te.S.A.). Tous ont un site renseigné, 38 des 42 étrangères ont déjà un segment. Ce sont des angles morts par défaut de notoriété, pas par défaut de données.

---

## 4. Payflows : ce que la fiche dit déjà, et pourquoi c'est instructif

La fiche existante est de bonne qualité et mérite d'être citée telle quelle : Payflows est immatriculée en **V2, le 15/04/2026**, créée en **2022**, SIREN 912610649, siège 17 rue de la Comète à Paris, positionnée **ETI et grands comptes**, familles **fintech + S2P**, nature **diversification**, confiance « partielle ».

Et surtout, ce constat déjà consigné le 20/08 : *« le site est en anglais et ne comporte aucune page dédiée à la Plateforme Agréée ni à la réforme française : la qualification porte sur le métier, pas sur l'offre agréée »*.

**C'est la signature type de l'angle mort.** Un acteur qui gagne des dossiers sur le segment ETI sans produire une ligne de contenu sur son statut de plateforme agréée est structurellement invisible pour une veille fondée sur le discours public. Il ne sera jamais détecté par un comparateur, ni par une revue de presse.

Ce qui le rend détectable, en revanche : la **nature `diversification`** combinée à un segment ETI/GE et à une création récente. Sur les 16 concurrents frontaux, **Payflows est la seule** dans cette configuration. Les quinze autres sont des extensions de métier démat installées de longue date.

> **Règle de détection à retenir : `nature = diversification` + segment ETI/GE + création après 2018 = angle mort à instruire en priorité.** C'est un filtre que le référentiel peut appliquer automatiquement, dès aujourd'hui, sans une heure de recherche supplémentaire.

---

## 5. Ordre d'exécution révisé

| Rang | Action | Charge |
|---|---|---|
| 1 | **Corriger les données** : segment de MEDIUS, ITESOFT, LUCCA ; pays et identité de GEP | ~30 min |
| 2 | **Fiche 360 PAYFLOWS** — fiche témoin de la détection d'angle mort | ~45 min |
| 3 | **Cercle 0** : ESKER, BASWARE, GEP — calibrage du barème sur ce qu'on connaît | ~2 h |
| 4 | **Vérifier le statut d'IVALUA** auprès de l'éditeur, et documenter le sujet « quelle PA pour un client Ivalua » | à traiter côté Fluxym |
| 5 | **Les 13 concurrents frontaux restants** + MEDIUS, ITESOFT, LUCCA | ~11 h |
| 6 | **Les 9 étrangères inconnues du marché français** — meilleur rapport découverte / effort | ~5 h |
| 7 | **Les 37 ETI/GE adjacents** | ~20 h |
| 8 | **Régénérer `cartographie-reste-a-faire.md`** depuis le JSON, et refermer les chantiers A et D | ~1 h |
| 9 | **Les 70 hors cible** — fiches allégées mais sourcées, au fil de l'eau | ~15 h |

---

## 6. Garde-fous, inchangés

- Les solutions du portefeuille sont traitées **avec le même barème que leurs concurrents**, sans angle promotionnel. Un référentiel où le partenaire est mieux traité se repère en trois fiches et ne vaut plus rien.
- **Aucune information issue d'une mission, d'un dossier d'avant-vente ou d'un échange partenaire** ne remonte dans le référentiel. Sources publiques exclusivement. Qu'un dossier ait été perdu face à un acteur est une information interne, jamais une donnée de fiche.
- La part de CA de l'activité plateforme agréée n'est jamais estimée.
