# Re·Form·E — Document de reprise (handover)

**Dernière mise à jour : 18/08/2026**
**État de référence : branche `main`, commit `c3ec4bf`**

Ce document décrit le projet tel qu'il est réellement, à la date ci-dessus.
Il remplace intégralement la version du 24/03/2026, qui décrivait une
architecture abandonnée (voir § 9) .

---

## 1. Ce qu'est le projet

**Re·Form·E** est un site pédagogique public sur la réforme française de la
facturation électronique (RFE), édité par Fluxym. Il explique la réforme à
plusieurs niveaux de lecture (du grand public au développeur) et embarque un
générateur de factures XML UBL 2.1 conformes EN 16931.

Ancien nom, encore présent dans quelques pages : « E-Invoicing Academy ».
Le rebranding vers **Re·Form·E** est en cours (lot 5 de la feuille de route).

### Nature technique

Site **100 % statique** : HTML, CSS et JavaScript vanilla, servi par GitHub
Pages. Aucun build, aucun bundler, aucun framework, aucune dépendance npm.
Les fichiers du dépôt sont exactement ceux servis au navigateur.

Toute proposition d'introduire React, Vue, Tailwind, SCSS ou un pipeline de
build est hors périmètre et doit être validée explicitement par Bruno BARTOLI.

---

## 2. Dépôt et hébergement

| | |
|---|---|
| Dépôt | `Fluxym-BBA/rfe.fluxym.com` (**public**) |
| Branche de référence | `main` |
| URL publique | `https://fluxym-bba.github.io/rfe.fluxym.com/` |
| Hébergement | GitHub Pages, `Deploy from a branch` → `main` / `(root)` |

### Sur le nom de domaine

Le nom du dépôt (`rfe.fluxym.com`) est un simple nom de dépôt : **ce n'est pas
un domaine actif**. Le sous-domaine `rfe.fluxym.com` n'existe pas dans le DNS
de `fluxym.com`.

Une tentative d'activation le 18/08/2026 (ajout d'un fichier `CNAME` à la
racine) a rendu le site inaccessible : dès qu'un domaine custom est déclaré,
GitHub redirige l'URL `.github.io` vers ce domaine — qui ne résolvait pas. Le
`CNAME` a été retiré et le site est revenu sur son URL `.github.io`.

**Prérequis avant toute nouvelle tentative**, dans cet ordre strict :

1. faire créer chez le gestionnaire DNS de `fluxym.com` un enregistrement
   `CNAME` : nom `rfe`, valeur `fluxym-bba.github.io.` ;
2. attendre que la résolution soit effective ;
3. *ensuite seulement* ajouter le fichier `CNAME` (contenu : `rfe.fluxym.com`)
   et cocher « Enforce HTTPS » dans Settings → Pages.

Jamais l'inverse. Le fichier `CNAME` avant le DNS met le site hors ligne.

⚠️ `reforme.fluxym.com` est une ancienne cible abandonnée. Ne jamais la
réutiliser (titre, footer, lien, `og:url`, documentation).

### Politique d'indexation

Le site ne doit **pas** être référencé par les moteurs de recherche. Il doit
rester accessible à qui connaît l'adresse, sans être découvrable.

- `robots.txt` à la racine interdit l'exploration (état au 18/08/2026).
- Objectif lot 5 : `<meta name="robots" content="noindex, nofollow">` dans le
  `<head>` des 30 pages, **et alors** réouverture de l'exploration dans
  `robots.txt` — un robot tenu à l'écart ne peut pas lire la balise qui lui
  interdit d'indexer. Les deux mécanismes se relaient, ils ne se cumulent pas.
- Vérifié le 18/08/2026 : `site:fluxym-bba.github.io` ne retourne aucun
  résultat. Le site n'a jamais été indexé.
- Le **dépôt**, lui, est public et indexé par GitHub/Google. `robots.txt` n'y
  change rien. Arbitrage non tranché : dépôt privé = plus de GitHub Pages sans
  licence Enterprise.

---

## 3. Arborescence réelle

30 pages HTML, 9 fichiers JS, 13 fichiers de données, 1 feuille de style.

```
rfe.fluxym.com/
├── robots.txt
├── index.html              (accueil / hub)
├── en-bref.html            comprendre.html      calendrier.html
├── acteurs.html            e-invoicing.html     e-reporting.html
├── cycle-de-vie.html       flux.html            schema-en-y.html
├── formats.html            champs.html          regles.html
├── validation.html         cas-usage.html       cas-detail.html
├── generateur.html         glossaire.html       ressources.html
├── faq.html                se-preparer.html     technique.html
├── b2g.html                chorus-pro.html      peppol.html
├── sanctions.html          tva-preremplie.html
├── referentiel.html        (socle normatif, couverture, changelog)
├── merge-corrections.html  merge-ereporting.html   (utilitaires internes)
│
├── css/
│   └── pages.css           ⚠️ CSS UNIQUE — 5757 lignes / 133 Ko, écrit à la main
│
├── js/
│   ├── nav.js              (nav + footer injectés, dropdowns, burger, badge V1.4)
│   ├── animations.js       (reveal-on-scroll, compteurs)
│   ├── champs.js           cas-usage-hub.js     cas-detail.js
│   ├── e-reporting-ui.js   generator-ui.js      referentiel.js
│   └── ubl-generator.js    (moteur XML UBL — 49 Ko, switch/case par cas)
│
├── data/
│   ├── ubl-templates.js    ⚠️ templates XML : dans data/, PAS dans js/
│   ├── referentiel.json    (socle normatif, couverture, changelog)
│   ├── pedagogy.json       (54 fiches du générateur)
│   ├── companies.json      (fournisseurs / acheteurs / factors)
│   ├── cas-usage.json      corrections_BG_BT.json
│   ├── rfe_01_meta.json    rfe_02_regles.json   rfe_03_champs.json
│   ├── rfe_04_ereporting.json
│   └── flux10_part1_enveloppe.json / part2_transactions / part3_paiements
│
├── assets/
│   ├── favicon-Fluxym-V2.png
│   └── fluxym_logo_2018_sansdescriptif_{blanc,noir,cmyk}.png
│
└── Infos IA/
    └── handover.md         (ce fichier)
```

---

## 4. Socle normatif — à citer dans tout contenu technique

| | |
|---|---|
| Norme | **AFNOR PR XP Z12-012 V1.4**, publiée le **30/06/2026** |
| Spécifications | **Externes B2B DGFiP v3.2** |
| Modèle sémantique | EN 16931 |
| Formats | UBL 2.1, UN/CEFACT CII D22B, Factur-X |

La page `referentiel.html` (données dans `data/referentiel.json`) est la
déclaration publique de ce socle : version, couverture, changelog, liens de
téléchargement des documents sources. **Toute mise à jour du socle doit y être
reflétée** — c'est l'engagement de transparence du site.

### Volumétrie du référentiel V1.4 vs couverture du site

| | Référentiel V1.4 | Couvert par le site |
|---|---|---|
| Champs | 477 (215 BT, 32 BG, 230 EXT-FR-FE) | 175 |
| Règles de gestion | 312 | 83 |
| Motifs de statut | 50 | 3 |
| Blocs BG | 32 | 30 |
| Blocs EXT-FR-FE-BG | 15 | 3 |

Le site ne contient **aucun champ ni règle inventé** : l'écart est un déficit
de complétude, pas d'exactitude. Le comblement est l'objet du lot 8.

---

## 5. Design system réel

- **Thème CLAIR** : fond blanc, texte `--gray-900`. Les héros et la nav non
  scrollée sont sur fond navy avec texte blanc. Il n'y a **pas** de thème dark.
- **Police** : Inter (Google Fonts, `<link>` dans chaque `<head>`).
- **Icônes** : emojis natifs + SVG inline. Aucune librairie d'icônes.
- **CSS** : variables CSS natives dans `:root`. **Pas de SCSS, pas de `$var`.**

```
--navy #0B2046   --navy-light #132d5e
--cyan #00A7E1   --cyan-glow rgba(0,167,225,.3)
--purple #6366f1 --purple-glow rgba(99,102,241,.3)
--white #ffffff
--gray-50 #f9fafb  --gray-100 #f3f4f6  --gray-200 #e5e7eb
--gray-400 #9ca3af --gray-500 #6b7280  --gray-600 #4b5563  --gray-900 #111827
--success #10b981  --warning #f59e0b   --danger #ef4444
--radius-sm 8px → --radius-2xl 24px, --radius-full 50px
--shadow-sm/-md/-lg/-xl, --shadow-cyan, --shadow-navy
```

### Squelette de toute nouvelle page

```html
<head>
  <title>… | Re·Form·E</title>
  <link rel="icon" href="./assets/favicon-Fluxym-V2.png" sizes="32x32" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./css/pages.css">
</head>
<body>
  <nav id="main-nav"></nav>        <!-- rempli par nav.js : jamais de menu en dur -->
  <header class="page-hero">       <!-- .breadcrumb / .hero-badge / h1 / p -->
  <main class="page-main">
    <div class="page-container page-layout">
      <aside class="page-sidebar">  <!-- .sidebar-sticky > .sidebar-nav / .sidebar-nav-pages -->
      <article class="page-content"><section id="…" class="content-section">…</section></article>
    </div>
  </main>
  <footer id="main-footer"></footer>   <!-- rempli par nav.js -->
  <script src="./js/nav.js"></script>
  <script src="./js/animations.js"></script>
</body>
```

Classes récurrentes : `.hero`, `.hero-orb`, `.hero-badge`, `.hero-ctas`,
`.btn-hero-primary|secondary|outline`, `.counters-grid`/`.counter-card`,
`.discover-grid`/`.discover-card--{blue,green,amber,purple,teal,orange,rose}`,
`.section-header`, `.section-badge`, `.content-section`, `.resource-grid`,
`.resource-card`, `.faq-item`, `.sidebar-link`, `.reveal-on-scroll`.

### Règles CSS

- Tout style réutilisable va dans `css/pages.css`. Jamais de style inline.
- Un `<style>` en tête de page est toléré uniquement pour du très spécifique
  (pattern déjà présent dans `generateur.html`).
- Toujours les variables CSS, jamais de valeur codée en dur.
- **Toute nouvelle page doit être ajoutée au menu dans `js/nav.js`**, sinon
  elle est orpheline.

---

## 6. Générateur UBL

Fichiers : `generateur.html`, `js/generator-ui.js`, `js/ubl-generator.js`,
`data/ubl-templates.js`, `data/pedagogy.json`, `data/companies.json`.

**54 entrées sélectionnables** = 42 cas d'usage FNFE (45 entrées, avec les
déclinaisons a/b des cas 17, 19 et 22) + 7 scénarios de cycle de vie
(`nominal-*`) + 2 tests de robustesse. Le chiffre public « 42 scénarios »
affiché sur l'accueil est **correct** : il désigne les cas d'usage FNFE.

Architecture : `UBLGenerator.caseConfig` associe à chaque cas son `typeCode`,
son `profile` et ses options (`zip`, `billingRef`, `agentVendeur`,
`selfBilling`…), puis un `switch/case` fournit `getTaxTotal()`,
`getLegalMonetaryTotal()` et `getInvoiceLine()`.

### Règle critique

```
BR-S-08 — pour chaque taux de TVA :
TaxableAmount (BT-116) = Σ LineExtensionAmount (BT-131)
```

À vérifier et à afficher explicitement pour chaque cas créé ou modifié, avec
BR-CO-10, BR-CO-15 et BR-CO-16. Les 52 cas générables passent ces contrôles au
18/08/2026 — **aucune régression admise**.

### Codes

- `InvoiceTypeCode` autorisés (**liste fermée BR-FR-04, 16 valeurs**) : 380,
  389, 393, 501, 386, 500, 384, 471, 472, 473, 261, 262, 381, 396, 502, 503.
  ⚠️ **383 (note de débit) est INTERDIT.**
- `ProfileID` (BT-23) — **20 valeurs, obligatoire en V1.4** : B1, S1, M1, B2,
  S2, M2, S3, B4, S4, M4, S5, S6, B7, S7, B8, S8, M8, et **B9, S9, M9**
  (facturation bidirectionnelle, nouveauté V1.4).
- Enveloppe : `UBLVersionID 2.1`, `CustomizationID urn:cen.eu:en16931:2017`,
  `DocumentCurrencyCode EUR`, `ID = [TRIGRAMME]-[YYMMDDHHMMSS]`.

### Doctrine facture rectificative / complémentaire

La facture d'origine était-elle **erronée** ?
Oui → **384** (rectificative ; BG-3 obligatoire en occurrence unique ; montant
différentiel seul). Non → **380** (complémentaire ; BG-3 informatif ; montant
total). BT-23 reste S1 dans les deux cas.

### Points de vigilance

- TVA nulle (débours, assujetti unique) : `TaxAmount = "0.00"`.
- Lignes négatives (acompte déduit) : contrôler le comportement du validateur.
- TVA sur marge : montants spécifiques.
- `BR-FR-CO-08` interdit les codes d'acompte (386/500/503) avec les cadres
  B4/S4/M4.

---

## 7. Pièges connus — à lire avant de toucher au code

1. **`raw.githubusercontent.com` et l'API `git/trees` servent du cache.** Après
   un push, ils peuvent renvoyer l'état antérieur. Pour vérifier un commit,
   utiliser l'URL immuable `https://github.com/<owner>/<repo>/commit/<sha>.patch`.
2. **Les gros fichiers sont tronqués à la lecture.** `pages.css` (133 Ko),
   `ubl-generator.js` (49 Ko), `rfe_03_champs.json` (102 Ko),
   `cas-usage.json` (95 Ko) dépassent la fenêtre d'un fetch. Récupérer le brut,
   puis l'exploiter localement (offsets, `grep` ciblé). **Ne jamais inventer la
   partie non lue, ni annoncer un décompte issu d'une lecture partielle.**
3. **`rfe_03_champs.json` : ne jamais faire de remplacement global.**
   `"cardinality": "0..1"` apparaît des dizaines de fois. Toujours localiser
   par `"id"` d'abord.
4. **`nav.js` : structure fragile.** C'est un objet littéral `SiteNav`. Insérer
   une méthode *à l'intérieur* d'une autre produit une `SyntaxError` qui laisse
   la nav ET le footer vides sur les 30 pages, sans erreur visible. Toujours
   valider par `node --check` après édition.
5. **`generator-ui.js` est écrit en style ES5** (`var`, `function()`), en
   contradiction avec la règle ES6 du projet. Ne pas s'en inspirer ; à
   refactorer un jour, pas au détour d'une évolution fonctionnelle.
6. **BG-11 = REPRÉSENTANT FISCAL DU VENDEUR**, pas un agent commercial.
   L'agent de vendeur est `EXT-FR-FE-BG-03`. Erreur classique, corrigée dans
   `pedagogy.json` le 18/08/2026.
7. **Chargement de JSZip dans `generateur.html` : non vérifié à ce jour.** Il
   n'existe aucun dossier `lib/` dans le dépôt. Contrôler comment la librairie
   est chargée (CDN ou absence) avant de s'appuyer dessus pour les cas ZIP.

---

## 8. Feuille de route — 9 lots, dans l'ordre d'exécution

| Lot | Objet | État |
|---|---|---|
| 1 | Correctifs V1.4 critiques + page Référentiel | ✅ terminé 18/08/2026 |
| 2 | Liens vers le référentiel (accueil, FAQ, ressources) | ✅ terminé 18/08/2026 |
| 3 | Assainissement : domaine, `robots.txt`, ce handover, utilitaires `merge-*` | 🔄 en cours |
| 4 | Pages à risque juridique : `calendrier.html`, `sanctions.html` | à faire |
| 5 | Branding Re·Form·E + `noindex` + compteurs sur les pages restantes | à faire |
| 6 | Métier vague 1 : `champs`, `regles`, `validation`, `formats` | à faire |
| 7 | Métier vague 2 : `flux`, `schema-en-y`, `cycle-de-vie`, `e-reporting` | à faire |
| 8 | Portage des 302 champs et 232 règles V1.4 manquants | à faire |
| 9 | Nouveautés V1.4 dans le générateur + refactor `pages.css` | à faire |

Principe d'ordonnancement : d'abord ce qui est cassé ou juridiquement risqué,
puis ce qui est faux, puis ce qui est incomplet, le confort en dernier.

### Nouveautés V1.4 non encore intégrées (lot 9)

Facturation bidirectionnelle (B9/S9/M9) · taxes hors TVA et éco-contribution
DEEE (BT-193/193-1, liste 5153) · taux de change (EXT-FR-FE-192) · INCOTERM au
niveau ligne (EXT-FR-FE-BG-15) · motifs de remise · dates de référence
(BT-167/167-1/167-2) · e-reporting **G6.20 remplace G6.25**, **G7.07 remplace
G6.16** · Flux 11 (annuaire) · 5 nouveaux motifs de refus B2G
(RETRAIT_MAN_SERV, ST_CT_NON_DECLAR, SUPPR_COMP_AVOIR, TRANSF_PMNT_REGIE,
CONTACT_ACHTR) · multi-vendeurs · sous-lignes.

---

## 9. Ce sur quoi l'ancien handover était faux

La version du 24/03/2026 décrivait une architecture qui n'a jamais existé ou
qui a été abandonnée. Les 8 affirmations à ne pas croire :

| Affirmation | Réalité |
|---|---|
| `css/academy.css` + fichiers `_*.scss` | n'existent pas ; il n'y a que `css/pages.css` |
| `js/main.js` | n'existe pas ; JS global éclaté en `nav.js` + `animations.js` |
| `js/ubl-templates.js` | le fichier est en `data/ubl-templates.js` |
| `lib/jszip.min.js` | aucun dossier `lib/` dans le dépôt |
| Thème « dark glassmorphism » | le site est en **thème clair** |
| `reforme.fluxym.com` | cible abandonnée ; URL réelle en `.github.io` |
| `ProfileID A1` | absent de la liste BT-23 de la V1.4 |
| « F7 / F8 = annuaire », « 48 cas d'usage » | l'annuaire est le flux 11 ; 42 cas FNFE |

**Leçon de méthode :** ce fichier n'est pas une source de vérité, c'est une
mémoire d'intentions. La seule source de vérité sur le code est le dépôt
GitHub, branche `main`, relu dans la session en cours. La seule source de
vérité sur le métier RFE est l'agent **@RFE_Expert**. En cas de contradiction
entre ce document et le dépôt, **le dépôt gagne** — et ce document doit être
corrigé.

---

## 10. Rôles et méthode de travail

- **Bruno BARTOLI** — décideur, et **seul à commiter**. Les agents n'ont pas
  d'accès en écriture au dépôt.
- **@RFE_WebSite** — code, cohérence technique et visuelle. Lit le dépôt, produit
  le code, ne commite pas.
- **@RFE_Expert** — source de vérité métier RFE : règles, flux, acteurs,
  formats, cas d'usage, spécifications FNFE/DGFiP. À consulter
  systématiquement pour tout contenu métier. Aucun contenu RFE ne doit être
  inventé ; en son absence, livrer la structure et marquer
  `[À VALIDER PAR @RFE_Expert]`.

### Conventions de livraison attendues par Bruno

- Un fichier de **moins de ~300-400 lignes** nécessitant plusieurs
  modifications est livré **réécrit en entier**, pas en fragments à recoller.
- Au-delà, éditions ciblées avec `AVANT` / `APRÈS` et emplacement exact.
- **Le message de commit accompagne chaque fichier modifié**, immédiatement
  sous le bloc concerné — jamais regroupé en fin de réponse.
- Jamais de code tronqué, jamais de `…` dans un livrable.
