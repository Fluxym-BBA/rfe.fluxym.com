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

Ces entrées ne sont pas des cas AFNOR mais des **variantes techniques transverses**. Elles portent 78 champs obligatoires et **aucune n'a de branche dans le générateur aujourd'hui** — c'est le principal angle mort.

| Réf | Intitulé | Champs | Périmètre | Générateur |
|---|---|:--:|:--:|---|
| `T1` | Autoliquidation de TVA (reverse charge) | 6 | **E-INV** | absent — catégorie TVA `AE`, mention obligatoire |
| `T2` | Franchise en base de TVA (art. 293 B CGI) | 9 | **E-INV** | absent — catégorie `E`, VATEX, mention art. 293 B |
| `T3` | Avoirs et factures rectificatives | 7 | **E-INV** | partiel — `var. litige-avoir` sans `getLineData`, `var. litige-rectificative` OK |
| `T4` | Facture en devise étrangère (hors EUR) | 4 | **E-INV** | absent — `DocumentCurrencyCode` figé à EUR, BT-6/BT-111 non gérés |
| `T5` | Sous-traitance BTP avec autoliquidation | 7 | **E-INV** | absent — combinaison cas 13 + T1 |
| `T6` | Remises, majorations et frais annexes | 28 | **E-INV** | absent — BG-20/BG-21 (niveau document et ligne) non générés |
| `T7` | Livraison intracommunautaire de biens | 9 | E-REP | absent — pertinent avec note `BAR`/`B2BINT` |
| `T8` | Exportation de biens hors UE | 8 | E-REP | absent — idem T7 |

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

### Reste à faire

1. **Lot 2** — les 8 cas AFNOR complémentaires : `1`, `31`, `3`, `14`, `17b`, `26`, `30`, `40`.
2. **Lot 3** — les 6 régimes transverses : `T1`, `T2`, `T4`, `T6`, `T7`, `T8`.
3. **Cas à créer** — facture B2B *externe* d'un assujetti unique (BT-29 schéma `0231`, n° de TVA de l'AU en BT-63) : c'est la seule variante e-invoicing du cas 29.
4. **Question de design ouverte** — sur les factures courtes, le cadre du tableau du lisible descend jusqu'au bloc de totaux et laisse un vide central. Option : arrêter le cadre après la dernière ligne et remonter les totaux (~3 lignes de code).
5. **Autres `payeeType` non rendus dans le lisible** — distributeur, collaborateur, tiers payeur (cas `3`, `5`, `12`).
