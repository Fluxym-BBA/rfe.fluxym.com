# Cartographie du périmètre de production de factures — générateur UBL

> **Statut** : document de travail interne, v1.0 — 20/08/2026  
> **Sources croisées** (branche `main` @ `be2e7da`) : `data/cas-usage.json` v1.1 · `data/transcodification.json` v1.2 · `js/ubl-generator.js` (`caseConfig`, `PDF_CASES`) · `cas-usage.html`  
> **Arbitrage métier** : @RFE_Expert, sur AFNOR XP Z12-014 V1.4 Annexe A (§3.2.5 à §3.2.43) et BR-FR-31.

---

## 1. Pourquoi cette cartographie

Le générateur sait aujourd'hui produire un XML pour **52 des 56 fiches** du référentiel. Ce périmètre a été construit par accumulation, sans filtre : il inclut des cas qui, dans la réforme, **ne donnent lieu à aucune facture électronique** (ils relèvent de l'e-reporting ou sont hors champ TVA). Produire un XML pour ces cas est au mieux inutile, au pire trompeur pour un développeur qui s'en servirait comme référence.

L'objectif n'est pas l'exhaustivité mais la **justesse** : un jeu de factures restreint, dont chacune correspond à une situation réelle et est utilisable telle quelle sur un environnement de test de plateforme agréée.

## 2. Les trois statuts de périmètre

| Statut | Définition | Conséquence pour le générateur |
|---|---|---|
| **E-INV** | Une facture structurée existe et transite par une PA (Flux 1 + Flux 2). | Productible. |
| **MIXTE** | Selon la variante, facture e-invoicing **ou** simple e-reporting. | Productible, mais **la variante générée doit être explicitement nommée**. |
| **E-REP** | Aucune facture dans le périmètre e-invoicing : e-reporting (Flux 10) ou hors champ TVA. | **À ne pas produire.** Fiche pédagogique uniquement. |

Répartition des 56 fiches : **43 E-INV · 8 MIXTE · 5 E-REP**.

### Cas particulier des opérations internationales (famille L)

Pour une livraison intracommunautaire ou une exportation, la facture existe (obligation légale) mais **n'entre pas dans l'obligation e-invoicing** : pas de Flux 1/2. Le mécanisme normal est la production directe du Flux 10.1. Le dépôt de la facture sur une PA avec une note `BT-21 = BAR` / `BT-22 = B2BINT` (valeurs BR-FR-31 : `B2B`, `B2BINT`, `B2C`, `B2CINT`, `OUTOFSCOPE`, `ARCHIVEONLY`) pour que la PA en extraie le Flux 10.1 est une **option de service**, pas la règle. C'est cette option qui rend un XML intracom/export intéressant à générer — en tant que dépôt e-reporting, pas en tant que facture e-invoicing.

## 3. Tableau de croisement des 56 fiches

Colonnes : **Transco** = présent dans la matrice de transcodification · **Gén.** = branche existante dans `caseConfig`/`getLineData` · **Tript.** = présent dans `PDF_CASES` (triptyque UBL + UBL/PDF + PDF).


### A — Cas standards

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `nominal` | Cas nominal — flux standard B2B | **E-INV** | — | ✅ | 🎯 |  |
| `var. rejet-emission` | Rejet à l’émission (PA-E) | **E-INV** | — | ✅ | — |  |
| `var. non-transmise` | Facture non transmise (PPF) | **E-INV** | — | ✅ | — |  |
| `var. rejet-reception` | Rejet à la réception (PA-R) | **E-INV** | — | ✅ | — |  |
| `var. refus` | Refus métier par l’acheteur | **E-INV** | — | ✅ | — |  |
| `1` | Multi-commande / multi-livraison | **E-INV** | ✅ | ✅ | — |  |
| `31` | Facture mixte biens + services | **E-INV** | ✅ | ✅ | — |  |

### B — Paiements, frais & tiers payeurs

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `2` | Facture déjà payée à l’émission | **E-INV** | ✅ | ✅ | 🎯 |  |
| `3` | Tiers payeur connu (OPCO) | **E-INV** | ✅ | ✅ | — |  |
| `4` | Prise en charge partielle par un tiers | **E-INV** | ✅ | ✅ | — |  |
| `5` | Frais collaborateur avec facture entreprise | **E-INV** | ✅ | ✅ | — |  |
| `6` | Frais collaborateur sans facture entreprise | MIXTE | — | ✅ | — | A uniquement si l’entreprise demande une facture B2B a posteriori (cadre S7/B7) |
| `7` | Carte logée / carte d’achat | **E-INV** | ✅ | ✅ | — |  |

### C — Affacturage & tiers bénéficiaires

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `8` | Affacturage connu à la facturation | **E-INV** | ✅ | ✅ | 🎯 |  |
| `9` | Distributeur / dépositaire | **E-INV** | ✅ | ✅ | — |  |
| `10` | Affacturage inconnu — subrogation | **E-INV** | — | ✅ | — |  |

### D — Intermédiaires & mandataires

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `11` | Réception par un tiers (CSP) | **E-INV** | ✅ | ✅ | — |  |
| `12` | Intermédiaire transparent (entremise achat) | **E-INV** | — | ✅ | — |  |
| `15` | Achat par un tiers pour le compte de l’acheteur | **E-INV** | ✅ | ✅ | — |  |
| `16` | Facture de débours | **E-INV** | — | ✅ | 🎯 |  |
| `17a` | Marketplace — intermédiaire de paiement | **E-INV** | ✅ | ✅ | — |  |
| `17b` | Marketplace + mandat de facturation | **E-INV** | ✅ | ✅ | — |  |

### E — Sous-traitance & co-traitance

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `13` | Sous-traitance avec paiement direct | **E-INV** | ✅ | ✅ | 🎯 |  |
| `14` | Co-traitance B2B | **E-INV** | ✅ | ✅ | — |  |

### F — Auto-facturation & mandat

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `19a` | Tiers facturant sous mandat | **E-INV** | ✅ | ✅ | — |  |
| `19b` | Auto-facturation (self-billing) | **E-INV** | ✅ | ✅ | 🎯 |  |
| `23` | Auto-facturation particulier → professionnel | **E-INV** | ✅ | ✅ | 🎯 |  |

### G — Notes de débit & rectificatives

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `var. litige-avoir` | Litige suivi d’un avoir (381) | **E-INV** | — | ✅ | — |  |
| `var. litige-rectificative` | Litige suivi d’une rectificative (384) | **E-INV** | — | ✅ | — |  |
| `18` | Facture complémentaire (ex-note de débit) | **E-INV** | ✅ | ✅ | 🎯 |  |

### H — Acomptes & factures de solde

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `20` | Facture d’acompte | **E-INV** | ✅ | ✅ | 🎯 |  |
| `21` | Facture définitive après acompte | **E-INV** | ✅ | ✅ | 🎯 |  |

### I — Escompte

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `22a` | Escompte — services (TVA encaissement) | **E-INV** | ✅ | ✅ | 🎯 |  |
| `22b` | Escompte — biens (TVA débits) | **E-INV** | ✅ | ✅ | — |  |

### J — Cas spéciaux

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `24` | Gestion des arrhes | E-REP | — | ✅ | — | Arrhes = indemnité hors champ TVA, aucune facture |
| `25` | Bons & cartes cadeaux (BUU / BUM) | MIXTE | — | ✅ | — | A pour la cession d’un BUU entre assujettis ; BUM hors champ |
| `26` | Clause de réserve / retenue de garantie | **E-INV** | ✅ | ✅ | — |  |
| `27` | Tickets de péage | E-REP | — | ✅ | — | Tolérance doctrinale : traité en B2C (flux 10.3/10.4) |
| `28` | Notes de restaurant | MIXTE | — | ✅ | — | A si > 150 € HT ou facture demandée par un assujetti |
| `30` | TVA déjà collectée (B2C → B2B) | **E-INV** | — | ✅ | — |  |

### K — Cas avancés & régimes spéciaux

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `29` | Assujetti unique (art. 256 C CGI) | MIXTE | ✅ | ✅ | — | A pour les factures B2B externes de l’AU ; internes = hors champ |
| `32` | Paiements mensuels avant facturation | MIXTE | — | ✅ | — | A pour la facture de régularisation B2B ; B2C = e-reporting |
| `33` | TVA sur la marge | **E-INV** | ✅ | ✅ | — |  |
| `34` | Encaissement partiel & annulation | **E-INV** | — | ✅ | — |  |
| `35` | Notes d’auteur | MIXTE | — | ✅ | — | A si l’auteur facture directement ; relevés de droits = e-reporting |
| `36` | Secret professionnel / données sensibles | **E-INV** | ✅ | ✅ | — |  |
| `37` | Sociétés en participation (SEP) | **E-INV** | — | ✅ | — |  |
| `38` | Sous-lignes & regroupements | **E-INV** | ✅ | ✅ | 🎯 |  |
| `39` | Facture multi-vendeurs | **E-INV** | ✅ | ✅ | — |  |
| `40` | Netting / compensation | **E-INV** | ✅ | ✅ | — |  |
| `41` | Sociétés de barter | **E-INV** | ✅ | ✅ | — |  |
| `42` | Détaxe (touristes étrangers) | MIXTE | — | ✅ | — | A pour la facture B7 vers l’opérateur de détaxe |

### L — International & Outre-mer

| Fiche | Intitulé | Périmètre | Transco | Gén. | Tript. | Commentaire |
|---|---|:--:|:--:|:--:|:--:|---|
| `43` | E-reporting B2B international | E-REP | — | — | — | Flux 10.1, aucun flux 1/2 |
| `43a` | Opérations triangulaires | E-REP | — | — | — | Flux 10.1 |
| `43b` | Transferts de stocks intra-UE | E-REP | — | — | — | Flux 10.1 (même SIREN vendeur/acheteur) |
| `44` | DROM / COM / TAAF | MIXTE | — | — | — | A pour Métropole + Guadeloupe + Martinique + Réunion ; Guyane, Mayotte, COM, TAAF = export |

## 4. Régimes de TVA & situations transverses (T1–T8 de la matrice de transcodification)

Ces entrées ne sont pas des cas AFNOR mais des **variantes techniques transverses**. Elles portent 78 champs obligatoires. Le **lot 3a** en a couvert quatre (T1/T5, T2, T7, T8) et le **lot 3b** les deux derniers (T4, T6). Les huit entrées transverses sont désormais traitées.

| Réf | Intitulé | Champs | Périmètre | Générateur |
|---|---|:--:|:--:|---|
| `T1` | Autoliquidation de TVA (reverse charge) | 6 | **E-INV** | **fait (lot 3a)** — cas `T1`, catégorie `AE` / `VATEX-FR-AE` |
| `T2` | Franchise en base de TVA (art. 293 B CGI) | 9 | **E-INV** | **fait (lot 3a)** — cas `T2`, catégorie `E` / `VATEX-FR-FRANCHISE`, BT-31 absent + BT-32 |
| `T3` | Avoirs et factures rectificatives | 7 | **E-INV** | fait (lot périmètre) — `var. litige-avoir` et `var. litige-rectificative` |
| `T4` | Facture en devise étrangère (hors EUR) | 4 | **E-INV** | **fait (lot 3b)** — cas `T4`, BT-5 = USD, BT-6 = EUR, BT-111 |
| `T5` | Sous-traitance BTP avec autoliquidation | 7 | **E-INV** | **fait (lot 3a)** — couvert par le cas `T1`, décliné en sous-traitance BTP (cadre S5) |
| `T6` | Remises, majorations et frais annexes | 28 | **E-INV** | **fait (lot 3b)** — cas `T6`, BG-20/BG-21 et BG-27/BG-28 |
| `T7` | Livraison intracommunautaire de biens | 9 | E-REP | **fait (lot 3a)** — cas `T7`, catégorie `K` / `VATEX-EU-IC`, note `B2BINT` |
| `T8` | Exportation de biens hors UE | 8 | E-REP | **fait (lot 3a)** — cas `T8`, catégorie `G` / `VATEX-EU-G`, note `B2BINT` |

## 5. Écarts constatés

### 5.1 À retirer du générateur (E-REP : aucune facture ne doit être produite)

| Cas | Motif |
|---|---|
| `24` — Arrhes | Les arrhes sont une indemnité de dédit (art. 1590 C. civ.), **hors champ TVA** : aucune facture. La vente qui suit relève des cas généraux (1, 20). |
| `27` — Tickets de péage | Tolérance doctrinale : le client n'est pas connu du vendeur, l'opération est traitée en B2C → e-reporting Flux 10.3/10.4. |

### 5.2 À requalifier (MIXTE : la variante produite doit être nommée)

| Cas | Variante à générer |
|---|---|
| `6` — Frais collaborateur sans facture entreprise | A uniquement si l’entreprise demande une facture B2B a posteriori (cadre S7/B7) |
| `25` — Bons & cartes cadeaux (BUU / BUM) | A pour la cession d’un BUU entre assujettis ; BUM hors champ |
| `28` — Notes de restaurant | A si > 150 € HT ou facture demandée par un assujetti |
| `29` — Assujetti unique (art. 256 C CGI) | A pour les factures B2B externes de l’AU ; internes = hors champ |
| `32` — Paiements mensuels avant facturation | A pour la facture de régularisation B2B ; B2C = e-reporting |
| `35` — Notes d’auteur | A si l’auteur facture directement ; relevés de droits = e-reporting |
| `42` — Détaxe (touristes étrangers) | A pour la facture B7 vers l’opérateur de détaxe |

### 5.3 Incohérences de contenu déjà identifiées

- `42` — Détaxe : le cadre `B7` et la TVA à 20 % sont corrects (la TVA a bien été collectée), mais l'intitulé et le libellé de ligne laissaient croire à une facture au touriste. La facture e-invoicing est celle émise **vers l'opérateur de détaxe** (assujetti FR) ; la vente B2C initiale est un e-reporting corrigé après validation PABLO.
- `29` — Assujetti unique : à requalifier en **facture B2B externe de l'AU** (BT-29 schéma `0231`, n° TVA de l'AU en BT-63). Les flux internes entre membres sont hors champ.
- `33` — TVA sur la marge : cas E-INV confirmé, à enrichir d'une base exonérée **et** d'une base taxée.
- `var. litige-avoir` — pas de branche `getLineData` : le cas journalise « cas non géré ».
- Les 4 variantes `var. rejet-emission`, `var. non-transmise`, `var. rejet-reception`, `var. refus` produisent un XML **structurellement identique** au cas nominal : leur valeur est dans le cycle de vie (Flux 6), pas dans la facture. Aucune raison de les inclure au triptyque.

### 5.4 Familles non couvertes par le triptyque actuel

- **A — standards** : seul le nominal ; `1` (multi-commande) et `31` (mixte M1) manquent.
- **J — cas spéciaux** : aucun cas.
- **Régimes transverses T1–T8** : aucun.

## 6. Panier de référence cible proposé

### Lot 1 — livré (12 cas)

`nominal` · `2` · `8` · `13` · `16` · `18` · `19b` · `20` · `21` · `22a` · `23` · `38`

### Lot 2 — compléter la couverture des typologies (8 cas)

| Cas | Ce qu'il apporte techniquement |
|---|---|
| `1` | Multi-commande / multi-livraison : `OrderReference` au niveau ligne, BT-13 multiples |
| `31` | Cadre de facturation `M1` — facture mixte biens + services |
| `3` | Tiers payeur connu : BG-10 + extension EXT-FR-FE-BG-02 |
| `14` | Co-traitance, cadre `S6` : mandataire, visa |
| `17b` | Mandat de facturation marketplace : BT-10 / rôle agent |
| `26` | Retenue de garantie / clause de réserve : conditions de paiement |
| `30` | Cadre `S7`/`B7` — TVA déjà collectée (archétype du cadre 7) |
| `40` | Netting : deux factures + `BT-81 = 97` (compensation) |
### Lot 3 — régimes transverses (6 nouveaux cas)

`T1` autoliquidation · `T2` franchise en base · `T4` devise étrangère · `T6` remises & frais annexes · `T7` intracom + note `BAR`/`B2BINT` · `T8` export + note `BAR`/`B2BINT`

Ces six-là ont un **fort rendement de test** : ils exercent des mécanismes de TVA et de montants qu'aucun cas AFNOR du panier actuel ne déclenche.

### Cible finale : 26 cas produits en triptyque, sur 56 fiches — et c'est volontaire.


---

## 7. État d'avancement

### Lot « nettoyage » — appliqué le 20/08/2026

| Action | Détail |
|---|---|
| Cas retirés du générateur | `24`, `27`, `29` → `UBLGenerator.NO_INVOICE_CASES`, garde-fou dans `generateFile()`, branches `getLineData` supprimées, entrées `caseConfig` supprimées |
| Nouveau groupe dans le sélecteur | « Hors périmètre e-invoicing — aucune facture » : les fiches restent consultables, le bouton est désactivé et le motif s'affiche |
| Cas MIXTE requalifiés | `6` (frais collaborateur, S7), `25` (cession de BUU), `28` (note > 150 € HT, S7), `32` (mensualité en acompte), `35` (auteur facturant directement), `42` (refacturation à l'opérateur de détaxe) |
| `33` TVA sur la marge | Deux sous-totaux BG-23 : marge 95 000 € en `E`/VATEX-EU-F + préparation 1 200 € en `S` à 20 % |
| `nominal-litige-avoir` | Branche `getLineData` ajoutée (facture contestée 3 680 € HT) + `getCreditNoteData()` pour l'avoir partiel (480 € HT) ; le bloc avoir hardcodé est désormais réservé au pack B |
| Incohérences fiche / XML corrigées | `27` annonçait « téléphonie VoIP », `25` « 4 pneus Michelin », `28` « bijoux fantaisie », `35` « API REST » ; doublon de libellé entre `6` et `30` levé |
| Régression | 54 documents XML produits, tous bien formés · BR-S-08 : 0 écart · 42 cas inchangés au bit près, dont le pack B · 12 triptyques régénérés, PDF valides `qpdf --check` |

### Lot 2 « couverture des typologies » — appliqué le 20/08/2026

Panier de référence porté de **12 à 20 cas** : ajout de `1`, `3`, `14`, `17b`, `26`, `30`, `31`, `40`.

| Action | Détail |
|---|---|
| **Bug de conformité corrigé** | Un tiers *payeur* était déclaré en **BG-10 `cac:PayeeParty`**, qui désigne le *bénéficiaire* du paiement. Il est désormais en **BG-02 `cac:PaymentMeans/cac:PaymentMandate/cac:PayerParty`** (cas 3 et 4) |
| **3 flags morts activés** | `agentVendeur` → BG-03 `cac:Party/cac:AgentParty` (cas 14) · `agentVendeur` → BG-05 `cac:Party/cac:ServiceProviderParty` (cas 17b, 19a) · `multiPO` remplacé par le profil étendu, EXT-FR-FE-135 étant déjà émis via `line.po` |
| **Profil étendu** | `EXTENDED_CASES` = 1, 3, 4, 14, 17b, 19a → `urn:cen.eu:en16931:2017#conformant#urn.cpro.gouv.fr:1p0:extended-ctc-fr`, obligatoire dès qu'une extension EXT-FR-FE-* est présente |
| **Retenue de garantie (26)** | Mention BT-21 = `ABU` seule, **sans** `AllowanceCharge` : le net à payer BT-115 reste le montant total dû |
| **Netting (40)** | BT-81 = `97` (Clearing between partners), BT-113 = montant compensé, BT-115 = `0.00` |
| **Identifiants invalides** | `999999999`, `888888888`, `000000000` étaient tous **Luhn-invalides**. Cinq tiers ajoutés à `companies.json` avec SIREN et SIRET valides ; pour une personne physique (cas 5), plus aucun identifiant n'est émis, seul BT-59 le nom |
| **Incohérences de scénario** | Le facturant du cas 19a (criée) et celui du cas 17b (marketplace) étaient un unique prestataire générique ; la fiche 17b citait BG-11 représentant fiscal au lieu de BG-05 |
| **Positions XML vérifiées** | `cac:AgentParty` et `cac:ServiceProviderParty` sont enfants de `cac:Party` (`PartyType`, positions 16 et 17), **pas** de `cac:AccountingSupplierParty` : `SupplierPartyType` ne les accepte pas. `cac:PayerParty` n'existe que dans `PaymentMandateType` |
| **Régression** | 54 documents XML bien formés · BR-S-08 : 0 écart · ordre des éléments UBL : 0 erreur · tous les SIRET valides Luhn · 20 lisibles `qpdf --check` OK, 1 page |

### Reste à faire

1. **Lot 3** — les 6 régimes transverses : `T1`, `T2`, `T4`, `T6`, `T7`, `T8`.
2. **Blocs dédiés dans le lisible** — le tiers payeur, le facturant et l'agent de vendeur n'apparaissent aujourd'hui que dans les mentions, pas dans un encadré propre.
3. **Cas à créer** — facture B2B *externe* d'un assujetti unique (BT-29 schéma `0231`, n° de TVA de l'AU en BT-63) : c'est la seule variante e-invoicing du cas 29.
4. **Question de design ouverte** — sur les factures courtes, le cadre du tableau du lisible descend jusqu'au bloc de totaux et laisse un vide central. Option : arrêter le cadre après la dernière ligne et remonter les totaux (~3 lignes de code).
5. **Autres `payeeType` non rendus dans le lisible** — distributeur, collaborateur, tiers payeur (cas `3`, `5`, `12`).

## 8. Lot 3a — régimes de TVA transverses (20/08/2026)

Base de départ : `main` @ `82a8045`, relu fichier par fichier (7 blobs vérifiés identiques à la copie de travail avant modification).

### 8.1 Principe retenu

Un régime de TVA ne change **ni la structure de la facture, ni le circuit de dépôt**. Il change quatre choses, et seulement quatre :

1. la catégorie de TVA **BT-118** du sous-total BG-23 ;
2. le taux **BT-119**, ramené à 0 ;
3. le motif d'exonération, en code **BT-121** (liste VATEX publiée par la Commission) et en clair **BT-120** ;
4. les identifiants qui deviennent obligatoires ou impossibles, et la mention légale portée en BT-22.

Conséquence sur les totaux : le total TTC (BT-112) est égal au total HT (BT-109), et le net à payer (BT-115) au total HT. Le vendeur n'encaisse aucune TVA.

### 8.2 Les quatre cas produits

| Cas | Régime | BT-118 | BT-121 | Cadre | Montant HT | Note BR-FR-31 |
|---|---|:--:|---|:--:|--:|:--:|
| `T1` | Autoliquidation, sous-traitance BTP (art. 283-2 nonies CGI) | `AE` | `VATEX-FR-AE` | S5 | 24 800,00 € | `B2B` |
| `T2` | Franchise en base (art. 293 B CGI) | `E` | `VATEX-FR-FRANCHISE` | S1 | 5 400,00 € | `B2B` |
| `T7` | Livraison intracommunautaire (art. 262 ter I CGI) | `K` | `VATEX-EU-IC` | S1 | 9 550,00 € | `B2BINT` |
| `T8` | Exportation hors UE (art. 262-I CGI) | `G` | `VATEX-EU-G` | S1 | 8 570,00 € | `B2BINT` |

`VATEX-FR-AE` et `VATEX-FR-FRANCHISE` ont été vérifiés dans la liste VATEX officielle : ce sont bien des codes français réservés au domestique, et non des inventions. `T1` couvre du même coup l'entrée `T5` de la matrice de transcodification : la sous-traitance BTP avec autoliquidation est l'application de T1 à la situation du cas 13. Tout autre secteur en autoliquidation réutilise la structure à l'identique, en changeant le seul libellé BT-120.

### 8.3 Contraintes d'identification, régime par régime

| Régime | Vendeur | Acheteur |
|---|---|---|
| `T1` | BT-31 obligatoire (BR-AE-02) | BT-48 obligatoire (BR-AE-03) |
| `T2` | BT-31 **absent**, BT-32 obligatoire (BR-E-02) | standard |
| `T7` | BT-31 obligatoire (BR-IC-02) | BT-48 obligatoire (BR-IC-03) + BT-72 et BT-80 (BR-IC-11/12) |
| `T8` | BT-31 obligatoire (BR-G-02) | BT-47 et BT-48 **absents** (client non-UE) |

C'est le point qui aurait fait rejeter les factures : émettre un numéro de TVA français pour un acheteur suisse, ou l'omettre pour une livraison intracommunautaire, est bloquant côté plateforme.

### 8.4 Mécanismes ajoutés au générateur

- **`VAT_PROFILES`** : trois profils (`AUTOLIQ`, `FRANCHISE`, `INTRACOM`) ; `EXPORT` existait déjà et a été réutilisé tel quel.
- **`caseConfig.forceSupplier` / `forceBuyer`** : le régime impose la nature des parties. Laisser le choix de l'interface produirait une facture incohérente (une franchise en base émise par une SA avec numéro de TVA n'existe pas). L'imposition s'applique aussi en mode données personnalisées.
- **`caseConfig.barCode`** : la note BR-FR-31 passe de `B2B` à `B2BINT` dès que l'acheteur est établi hors de France.
- **Identifiants conditionnels** dans `data/ubl-templates.js` : `EndpointID` accepte un autre schéma EAS (`9930` n° de TVA allemand, `9927` n° IDE suisse), et `PartyIdentification`, `PartyTaxScheme`, `CompanyID` ne sont plus émis inconditionnellement. BT-32 est porté par un second `PartyTaxScheme` avec `TaxScheme/ID = FC`.
- **Lisible** : les identifiants deviennent conditionnels. Avant correction, un acheteur étranger affichait « SIRET 00001 » — concaténation d'un SIREN absent avec le NIC par défaut.

### 8.5 Correction de conformité : clés de TVA françaises

La clé d'un numéro de TVA français est déterministe : `clé = (12 + 3 × (SIREN mod 97)) mod 97`. Formule vérifiée sur deux numéros réels (ACME du jeu de données, et un tiers de contrôle externe). Six numéros du référentiel ne la respectaient pas, dont les cinq tiers créés au lot 2 :

| Partie | Avant | Après |
|---|---|---|
| `fluxym_fr` | `FR66442654927` | `FR67442654927` |
| `opco_formation` | `FR26999999006` | `FR42999999006` |
| `marketplace_fr` | `FR35999999014` | `FR66999999014` |
| `criee_atlantique` | `FR62999999030` | `FR17999999030` |
| `seller_agent` | `FR44999999022` | `FR90999999022` |
| `distri_logistique` | `FR89999999048` | `FR71999999048` |

⚠️ **Point à trancher pour `fluxym_fr`** : le couple SIREN `442654927` / TVA `FR66442654927` est mathématiquement impossible. J'ai corrigé la clé pour la rendre cohérente avec le SIREN présent dans le repo. Si le vrai numéro de TVA de Fluxym est bien `FR66…`, alors c'est le SIREN qui est erroné et il faut corriger dans l'autre sens.

### 8.6 Validation

- 55 cas dans `caseConfig`, 58 documents XML produits, **tous bien formés**.
- Ordre des éléments UBL contrôlé contre les séquences `Party`, `TaxCategory`, `PaymentMeans`, `PaymentMandate`, `PostalAddress`, `PartyLegalEntity` : **0 erreur** sur les 58 documents.
- Égalité base de TVA = somme des lignes vérifiée sur les 4 nouveaux cas (transposition de BR-S-08 aux règles BR-AE-08, BR-E-08, BR-IC-08, BR-G-08) : **0 écart**.
- BT-109 = BT-112 = BT-115 = base sur les 4 cas : conforme.
- 13 contrôles structurels ciblés (présence/absence de BT-31, BT-32, BT-47, BT-48, schémas EAS, BT-72, BT-80, notes `B2BINT`) : **13/13**.
- **Non-régression** : sur les 51 cas antérieurs, 46 sont identiques bit à bit ; les 5 modifiés (3, 4, 14, 17b, 19a) ne diffèrent que par la clé de TVA corrigée.
- **Lisibles** : 24 PDF au panier, tous valides `qpdf` et sur une page ; les 20 antérieurs sont identiques bit à bit.

### 8.7 Reste à faire

*(Le lot 3b, décrit en section 9, a traité T4 et T6.)*

**Reste du périmètre**
- Cas à créer : facture B2B **externe** d'un assujetti unique (BT-29 schéma `0231`, numéro de TVA de l'AU en BT-63) — seule variante e-invoicing du cas 29.
- Blocs dédiés dans le lisible pour le tiers payeur, le facturant et l'agent de vendeur : aujourd'hui présents dans les mentions, pas dans un encadré propre.
- `payeeType` non rendus dans le lisible : distributeur, collaborateur (cas 5, 9, 12).
- Question de mise en page jamais tranchée : sur une facture courte, le cadre du tableau descend jusqu'au bloc de totaux et laisse un vide central. Option = arrêter le cadre après la dernière ligne (~3 lignes de code).
- Interface : signaler visuellement que le vendeur ou l'acheteur est imposé par le cas d'usage (`forceSupplier` / `forceBuyer`), aujourd'hui indiqué seulement dans la fiche pédagogique.
- `orderReference` est figé à `PO-1001` dans `buildRenderData` : cohérent avec l'XML, qui émet lui aussi cette référence de commande sur tous les cas. À revoir si l'on veut des factures sans bon de commande.
- Étape 2 du plan initial : Factur-X (CII D22B + PDF/A-3), non entamée.

## 9. Lot 3b — devise étrangère et remises / frais annexes (20/08/2026)

Base de départ : `main` @ `fc6b141`, les 7 blobs du lot 3a vérifiés identiques à la copie de travail.

Contrairement au lot 3a, ces deux régimes ne se règlent pas par un code de catégorie de TVA : ils touchent le **moteur de calcul** et le **rendu du lisible**. C'est la raison du découpage.

### 9.1 T4 — facture en devise étrangère

Un fournisseur français facture en dollars la filiale française d'un groupe américain. La prestation reste soumise à la TVA française à 20 %.

| Élément | Valeur |
|---|---|
| BT-5 `DocumentCurrencyCode` | `USD` — porté par **tous** les montants du document |
| BT-6 `TaxCurrencyCode` | `EUR` — obligatoire dès que BT-5 n'est pas l'euro |
| BT-111 | `1841.62` EUR, dans un **second `cac:TaxTotal` sans sous-total** |
| Totaux | 10 000,00 USD HT, TVA 2 000,00 USD, TTC 12 000,00 USD |

Deux points de conformité tranchés :

1. **BT-111 est le seul montant du document autorisé à porter une autre devise que BT-5.** Le générateur émet donc exactement deux `cac:TaxTotal` au niveau document : le premier avec les sous-totaux en USD, le second réduit à un `cbc:TaxAmount` en EUR.
2. **`cac:TaxExchangeRate` n'est pas émis.** Le taux de change n'est pas un champ de la norme et le mapping UBL du socle ne le retient pas : l'émettre exposerait à un rejet pour élément hors périmètre. Le taux est porté en mention BT-22, où il est à la fois conforme et lisible : *« Facture etablie en USD. Taux de change applique : 1 EUR = 1,0860 USD (taux de reference BCE du 19/08/2026). Montant total de TVA en euros : 1 841,62 EUR. »*

Conséquence sur le lisible : il affichait des euros sur une facture en dollars — un document légalement trompeur. Le formateur monétaire prend désormais la devise du document (`CUR_SYMBOLS`, renseigné au début du rendu).

### 9.2 T6 — remises, majorations et frais annexes

Une commande de mobilier qui exerce les **quatre** emplacements prévus par la norme :

| Emplacement | Contenu | Montant | Code |
|---|---|--:|---|
| BG-27 (ligne 1) | Remise quantitative palier 30 unités | −200,00 € | `95` (UNTDID 5189) |
| BG-28 (ligne 2) | Éco-participation mobilier, filière REP | +45,00 € | *motif en clair* |
| BG-20 (document) | Remise commerciale accord cadre 2026 | −450,00 € | `95` |
| BG-21 (document) | Frais de port et de manutention | +120,00 € | `FC` (UNTDID 7161) |

Arithmétique produite :

```
BT-106 total des lignes HT        8 545,00   (7 000,00 + 1 545,00)
BT-107 remises niveau document      -450,00
BT-108 frais niveau document        +120,00
BT-109 base d'imposition          8 215,00   <- BR-CO-10
BT-117 TVA 20 %                   1 643,00
BT-112 total TTC                  9 858,00
```

Trois choses à retenir :

- **Les remises et frais de niveau ligne sont absorbés dans BT-131**, le montant net de la ligne : 30 × 240,00 − 200,00 = 7 000,00. C'est la règle de cohérence de ligne que vérifient les plateformes.
- **Les remises et frais de niveau document portent chacun leur propre catégorie et taux de TVA** (BR-31 pour BG-20, BR-37 pour BG-21). S'il y a plusieurs taux sur la facture, il faut **un bloc `AllowanceCharge` par couple (catégorie, taux)** — le moteur est écrit pour ça.
- `computeTaxBreakdown` intègre désormais ces blocs dans la base du sous-total BG-23. Sans cela, BT-116 serait resté à 8 545,00 alors que BT-109 vaut 8 215,00 : incohérence bloquante.
- L'**éco-participation n'a pas de code dédié** dans la liste UNTDID 7161. Elle est portée par un motif en clair, ce que BR-38 autorise explicitement (motif **ou** code).

### 9.3 Impact sur le lisible

- Le tableau de lignes rend chaque BG-27 / BG-28 en **sous-ligne** sous la désignation, avec son motif et sa base, pour que le lecteur puisse refaire le calcul.
- Le cartouche des totaux expose BT-106, BT-107 et BT-108 **uniquement** lorsqu'il existe une remise ou un frais de niveau document, afin de ne pas alourdir le cas courant.
- Le signe moins utilisé est le tiret ASCII : `U+2212 MINUS SIGN` n'existe pas dans `WinAnsiEncoding` et le glyphe serait absent des polices base-14 du générateur.

### 9.4 Généralisation du moteur

Toutes les briques XML acceptent maintenant une devise, avec l'euro par défaut — d'où une non-régression parfaite. Les signatures ont été étendues par un paramètre d'options en fin de liste :

| Brique | Extension |
|---|---|
| `getHeader` | `opts.cur` (BT-5), `opts.taxCur` (BT-6) |
| `getTaxTotal` | `opts.cur`, `opts.taxCur` = `{ code, amount }` (BT-111) |
| `getLegalMonetaryTotal` | `opts.cur`, `opts.allowanceTotal` (BT-107), `opts.chargeTotal` (BT-108) |
| `getInvoiceLine` | `opts.cur`, `opts.allowances` (BG-27 / BG-28) |
| `getAllowanceCharge` | nouvelle brique, BG-20 / BG-21 |

### 9.5 Validation

- 57 cas dans `caseConfig`, **60 documents XML tous bien formés**.
- Ordre des éléments UBL contrôlé contre **10 séquences** du schéma (`Invoice`, `CreditNote`, `InvoiceLine`, `CreditNoteLine`, `AllowanceCharge`, `LegalMonetaryTotal`, `TaxTotal`, `TaxSubtotal`, `Party`, `TaxCategory`) : **0 erreur sur 60 documents**. La position de `cac:AllowanceCharge` (après `cac:PaymentTerms`, avant `cac:TaxTotal` au niveau document ; après `cac:PaymentTerms`, avant `cac:Item` au niveau ligne) est donc vérifiée, pas supposée.
- 24 contrôles structurels ciblés sur T4 et T6 : **24/24**, dont BR-CO-10, l'égalité BT-116 = BT-109, la cohérence de ligne BT-131 = quantité × prix unitaire − remises + frais, l'unicité de la devise hors BT-111 et l'absence de `cac:TaxExchangeRate`.
- **Non-régression** : les **55 cas antérieurs sont identiques bit à bit**, et les **24 lisibles antérieurs également**. Aucune valeur n'a bougé.
- Les 2 nouveaux lisibles sont valides `qpdf` et tiennent sur une page.

### 9.6 Reste à faire

Les huit régimes transverses de la matrice de transcodification sont traités. Ce qui reste :

- Cas à créer : facture B2B **externe** d'un assujetti unique (BT-29 schéma `0231`, numéro de TVA de l'AU en BT-63) — seule variante e-invoicing du cas 29.
- Blocs dédiés dans le lisible pour le tiers payeur, le facturant et l'agent de vendeur : aujourd'hui présents dans les mentions seulement.
- `payeeType` non rendus dans le lisible : distributeur, collaborateur (cas 5, 9, 12).
- Variante multi-taux de T6 : le moteur la gère, aucun cas ne l'exerce.
- Question de mise en page jamais tranchée : sur une facture courte, le cadre du tableau descend jusqu'au bloc de totaux et laisse un vide central.
- Interface : signaler visuellement que le vendeur ou l'acheteur est imposé par le cas d'usage (`forceSupplier` / `forceBuyer`).
- `orderReference` figé à `PO-1001` dans `buildRenderData`, cohérent avec l'XML qui émet cette référence sur tous les cas.
- **Étape 2 du plan initial : Factur-X** (CII D22B + PDF/A-3), non entamée. C'est désormais le principal chantier restant.
