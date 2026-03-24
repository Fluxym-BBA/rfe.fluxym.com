# 📋 HANDOVER — Projet Re·Form·E (reforme.fluxym.com)

> Document de contexte pour continuité de développement.
> Dernière mise à jour : 24 mars 2026

---

## 1. IDENTITÉ DU PROJET

| Élément | Valeur |
|---------|--------|
| **Nom** | Re·Form·E |
| **URL cible** | `reforme.fluxym.com` |
| **Objet** | Plateforme pédagogique et d'outillage sur la Réforme de la Facturation Électronique (RFE) française |
| **Audience** | Équipes internes Fluxym + clients |
| **Auteur** | Bruno BARTOLI (bbartoli@fluxym.com) — Fluxym |
| **Hébergement** | GitHub Pages (prévu sous-domaine Fluxym via CNAME) |

---

## 2. ARCHITECTURE FICHIERS

```
reforme.fluxym.com/
│
├── index.html                    ← Page d'accueil (hub central)
├── flux.html                     ← Diagramme interactif des 14 flux (F1-F14)
├── schema-en-y.html              ← Diagramme interactif du Schéma en Y
├── generateur.html               ← Générateur UBL (48 cas d'usage)
├── glossaire.html                ← Glossaire RFE (si créé)
├── changelog.html                ← Journal des modifications RFE (si créé)
│
├── css/
│   ├── academy.css               ← Styles globaux (compilé depuis SCSS)
│   ├── _variables.scss           ← Variables SCSS (couleurs, fonts, spacing)
│   ├── _base.scss                ← Reset + typographie
│   ├── _layout.scss              ← Header, footer, grid, nav
│   ├── _components.scss          ← Cards, boutons, callouts, badges
│   ├── _pages.scss               ← Styles spécifiques par page
│   └── academy.scss              ← Point d'entrée SCSS (@import all)
│
├── js/
│   ├── ubl-generator.js          ← Moteur de génération XML UBL (48 cas)
│   ├── ubl-templates.js          ← Templates XML (header, supplier, lines, CSV...)
│   ├── generator-ui.js           ← UI du générateur (select, fiches pédago, events)
│   └── main.js                   ← JS global (nav, dark mode, smooth scroll...)
│
├── data/
│   ├── pedagogy.json             ← 48 fiches pédagogiques (badge, title, desc, info)
│   └── companies.json            ← Données entreprises test (suppliers, buyers, factors)
│
├── assets/
│   ├── favicon.svg               ← Favicon
│   └── ...                       ← Images, logos éventuels
│
└── lib/
    └── jszip.min.js              ← Librairie ZIP (pour cas A et B)
```

---

## 3. PAGES ET ÉTAT D'AVANCEMENT

### 3.1 — Page d'accueil (`index.html`)
- **État** : ✅ Fonctionnelle
- **Contenu** : Hub central avec cards vers les différentes sections
- **Design** : Dark theme, cards glassmorphism, responsive

### 3.2 — Diagramme des 14 flux (`flux.html`)
- **État** : ✅ Complet
- **Fonctionnalités** :
  - SVG interactif avec les 14 flux (F1-F14, note : pas de F4/F5)
  - Hover sur chaque flux → tooltip avec nom, direction, description
  - Hover sur chaque acteur → tooltip avec rôle et description
  - Légende interactive (hover légende ↔ highlight SVG)
  - Mode plein écran (double-clic ou bouton expand)
  - Animations CSS (glow, pulse, transitions)
- **Acteurs affichés** : Fournisseur, PA-E, PPF, PA-R, Acheteur, DGFiP

### 3.3 — Schéma en Y (`schema-en-y.html`)
- **État** : ✅ Complet
- **Fonctionnalités** :
  - SVG du schéma en Y (branche commerciale + branche fiscale)
  - Même système de hover/tooltip que flux.html
  - Hover sur acteurs ET flux
  - Mode plein écran
  - Légende interactive
- **Flux affichés** : Entrée, F1, F2, F3, F6, F10, F12, Sortie

### 3.4 — Générateur UBL (`generateur.html`)
- **État** : ⚠️ 48 cas dans pedagogy.json, code à stabiliser
- **Fonctionnalités** :
  - Sélection du cas d'usage (select avec optgroups par catégorie)
  - Fiche pédagogique dynamique (badge, titre, scénario, particularités, info technique)
  - Saisie trigramme utilisateur
  - Sélection fournisseur / acheteur / factor (paramètres avancés)
  - Cible plateforme : Esker / Basware
  - Génération fichier XML UBL 2.1 conforme EN16931
  - Cas A et B : génération ZIP (Master Data CSV + Facture + Avoir)
- **Librairie externe** : JSZip (lib/jszip.min.js)

### 3.5 — Pages non encore créées
- Glossaire RFE
- Changelog / Journal des évolutions de la réforme
- Pages par section thématique (acteurs, formats, cycle de vie, etc.)

---

## 4. DESIGN SYSTEM

### 4.1 — Thème visuel
- **Mode** : Dark theme principal (fond sombre, texte clair)
- **Style** : Glassmorphism (backdrop-filter, bordures semi-transparentes)
- **Police** : Inter (Google Fonts)
- **Icônes** : Emojis + SVG inline

### 4.2 — Palette de couleurs (variables SCSS)
```scss
// Couleurs primaires
$color-primary:     #00d4ff;   // Cyan — accent principal
$color-secondary:   #7c5cff;   // Violet — accent secondaire
$color-accent:      #00e676;   // Vert — succès, validations

// Fonds
$bg-dark:           #0a0e1a;   // Fond principal
$bg-card:           rgba(255, 255, 255, 0.03); // Cards glassmorphism
$bg-card-hover:     rgba(255, 255, 255, 0.06);

// Texte
$text-primary:      #e0e0e0;
$text-secondary:    #a0a0a0;
$text-muted:        #666;

// Flux (couleurs par type)
$color-flux-commercial: #00d4ff;  // Branche commerciale (F2)
$color-flux-fiscal:     #ff6b35;  // Branche fiscale (F1, F12)
$color-flux-statuts:    #ffd700;  // Statuts (F6)
$color-flux-annuaire:   #00e676;  // Annuaire (F7, F8)
$color-flux-ereporting: #e040fb;  // E-reporting (F9-F14)
```

### 4.3 — Composants récurrents
- **Cards** : `border-radius: 16px`, border 1px rgba(255,255,255,0.08), backdrop-filter blur
- **Callouts** : Encadrés colorés (info bleu, warning orange, danger rouge, success vert)
- **Badges** : Petits labels colorés pour catégoriser (emoji + texte)
- **Boutons** : Gradient primary → secondary, hover glow
- **Tooltips SVG** : Fond semi-transparent, texte structuré (num, name, dir, desc)

---

## 5. GÉNÉRATEUR UBL — DÉTAILS TECHNIQUES

### 5.1 — Les 48 cas d'usage

**11 catégories (optgroups dans le select) :**

| # | Catégorie | Cas | Nb |
|---|-----------|-----|----|
| 1 | ⚙️ Cas Nominal | nominal, rejet-emission, non-transmise, rejet-reception, refus, litige-avoir, litige-rectificative | 7 |
| 2 | 📦 Standard | 1, 31 | 2 |
| 3 | 💳 Paiement & Tiers | 2, 3, 4, 5, 6, 7 | 6 |
| 4 | 🏦 Affacturage | 8, 9, 10 | 3 |
| 5 | 🔀 Intermédiaires | 11, 12, 15, 16 | 4 |
| 6 | 🏗️ Sous/Co-traitance | 13, 14 | 2 |
| 7 | 🛒 Marketplace | 17a, 17b | 2 |
| 8 | 📝 Mandat & Auto-fact. | 19a, 19b, 23 | 3 |
| 9 | 💰 Acompte & Escompte | 20, 21, 22a, 22b | 4 |
| 10 | ⭐ Cas spécifiques | 18, 24-30, 32-42 | 19 |
| 11 | 📦 Packs ZIP | A, B | 2 |

### 5.2 — Métadonnées par cas

| Cas | TypeCode | ProfileID | Parties spéciales |
|-----|----------|-----------|-------------------|
| 0, nominal, la plupart | 380 | S1 | — |
| 1, 4, 7, 22b, A, B | 380 | B1 | — |
| 2 | 380 | B1 | PayeeParty (Stark Industries) |
| 3 | 386 | A1 | PayeeParty (Tiers payeur) |
| 5 | 380 | S2 | PayeeParty (Employé) |
| 6, 28, 30 | 380 | S7 | — |
| 7 | 380 | B1 | PaymentMeans code 48 |
| 8 | 393 | S1 | PayeeParty (Factor) |
| 9 | 380 | S1 | PayeeParty (Distributeur) |
| 14 | 380 | S6 | — |
| 18 | 383 | S1 | BillingReference |
| 19b | 389 | S1 | — |
| 20, 32 | 386 | S1 | — |
| 21 | 380 | S4 | BillingReference + lignes négatives |
| 31 | 380 | M1 | — |
| 39 | 380 | S8 | — |

### 5.3 — Structure XML générée
```
Invoice (ou CreditNote)
├── UBLVersionID: 2.1
├── CustomizationID: urn:cen.eu:en16931:2017
├── ProfileID: [S1|B1|S2|A1|S4|S6|S7|S8|M1]
├── ID: [TRIGRAMME]-[YYMMDDHHMMSS]
├── IssueDate
├── DueDate
├── InvoiceTypeCode: [380|381|383|384|386|389|393]
├── Note[] (4 notes : BAR, PMT, PMD, AAB)
├── DocumentCurrencyCode: EUR
├── TaxCurrencyCode: EUR
├── BillingReference (si avoir ou rectificative)
├── AccountingSupplierParty (SIREN, TVA, adresse, contact)
├── AccountingCustomerParty (SIREN, TVA, adresse, contact)
├── PayeeParty (si tiers payeur / factor / employé)
├── PaymentMeans (si carte logée code 48)
├── TaxTotal > TaxSubtotal (TaxableAmount, TaxAmount, Category S, 20%)
├── LegalMonetaryTotal (LineExt, TaxExcl, TaxIncl, Prepaid, Payable)
└── InvoiceLine[] (ID, Qty, LineExtAmount, Item+ClassifiedTaxCategory, Price)
```

### 5.4 — Règle critique BR-S-08
```
Pour chaque taux TVA :
TaxableAmount (BT-116) = Σ LineExtensionAmount (BT-131)
```
**Toujours vérifier cette égalité à chaque nouveau cas.**

### 5.5 — Validation
- Validateur utilisé : validateur FNFE / PPF (Phase pilote + Déploiement généralisé)
- Les cas originaux (0, 1, 2, 3, 4, 5, 7, 8, A, B) ont été validés conformes
- Les nouveaux cas (6, 9-42, variantes nominales) doivent être validés un par un

---

## 6. DONNÉES TEST (companies.json)

### Fournisseurs (suppliers)
| ID | Nom | SIREN |
|----|-----|-------|
| kreamob | KREAMOB SA | (dans le JSON) |
| ... | ... | ... |

### Acheteurs (buyers)
| ID | Nom | SIREN |
|----|-----|-------|
| ... | ... | ... |

### Factors
| ID | Nom | SIREN |
|----|-----|-------|
| ... | ... | ... |

> ⚠️ Voir le fichier `data/companies.json` pour les données complètes (SIREN, TVA, adresses, contacts, IBAN).

---

## 7. ÉCOSYSTÈME DUST (AGENTS IA)

Le projet est supporté par 5 agents IA Dust :

| Agent | Rôle | Outils |
|-------|------|--------|
| **Orchestrateur RFE** | Coordinateur central | Mémoire, routage |
| **Veilleur RFE** | Veille hebdomadaire sources officielles | Web Search, Browse |
| **Analyseur RFE** | Analyse + écriture Changelog Notion | Notion, Knowledge |
| **Newsletter RFE** | Rédaction + envoi newsletter | Notion, Gmail |
| **Expert RFE** | Réponses aux questions RFE | Knowledge SharePoint + Notion |
| **Notion RFE** | Création documentation pédagogique | Notion, Files |

### Flux principal
```
Veilleur → Analyseur → Newsletter (hebdomadaire)
```

### Flux secondaires
```
Question utilisateur → Expert RFE
Création doc → Notion RFE
```

---

## 8. POINTS D'ATTENTION / BUGS CONNUS

### 🔴 Critiques
- **ubl-generator.js** : ne PAS réécrire entièrement. Toujours ÉTENDRE le code existant (ajouter des `case` au switch). Le code original (cas 0-8, A, B) est validé conforme.
- **BR-S-08** : toujours vérifier `TaxableAmount = Σ LineExtensionAmount` pour chaque nouveau cas
- **Style du code** : ES6 strict (arrow functions, const/let, template literals). Ne pas mixer avec var/function.

### 🟠 À surveiller
- Cas 16 (débours) et 29 (assujetti unique) : TVA = 0, vérifier que le template gère correctement `TaxAmount = "0.00"`
- Cas 21 : lignes négatives (acompte déduit), vérifier le comportement du validateur
- Cas 33 (TVA marge) : montants spécifiques, vérifier la conformité

### 🟢 Améliorations futures
- Ajouter la génération CII (Cross Industry Invoice) en plus d'UBL
- Ajouter la génération Factur-X (PDF + XML embarqué)
- Ajouter un mode "prévisualisation HTML" du XML avant téléchargement
- Ajouter des tests automatisés (comparer XML généré vs attendu)
- Créer les pages manquantes (glossaire, changelog, sections thématiques)

---

## 9. BRANDING Re·Form·E

### Décisions prises
- **Nom** : Re·Form·E (jeu typographique sur Réforme Facture Électronique)
- **URL** : `reforme.fluxym.com`
- **Typographie du logo** : **Re**·**Form**·**E** (majuscules R, F, E)
- **Header/footer** : à adapter avec le nouveau branding

### À faire
- [ ] Mettre à jour le `<title>` de toutes les pages
- [ ] Mettre à jour le header avec le logo/nom Re·Form·E
- [ ] Mettre à jour le footer avec l'URL
- [ ] Créer un favicon dédié
- [ ] Configurer le CNAME DNS chez Fluxym

---

## 10. INSTRUCTIONS POUR LA PROCHAINE CONVERSATION

### Fichiers à fournir
Joindre à la conversation :
1. `generateur.html`
2. `js/ubl-generator.js`
3. `js/ubl-templates.js`
4. `js/generator-ui.js`
5. `data/pedagogy.json`
6. `data/companies.json`
7. `css/academy.scss` (ou le CSS compilé)
8. `index.html`
9. `flux.html`
10. `schema-en-y.html`
11. Ce fichier markdown (HANDOVER.md)

### Contexte à donner
```
Voici le projet Re·Form·E (reforme.fluxym.com).
C'est une plateforme pédagogique sur la Réforme de la Facturation Électronique française.
Le fichier HANDOVER.md contient tout le contexte du projet.
Les fichiers joints sont l'état actuel du code.
Je souhaite continuer le développement à partir de cet état.
```

### Priorités de développement
1. Valider la conformité des 48 cas du générateur UBL
2. Appliquer le branding Re·Form·E (header, footer, titre, favicon)
3. Créer les pages manquantes (glossaire, changelog)
4. Enrichir les diagrammes si nécessaire
5. Tester sur mobile / responsive

---

*Fin du handover — Projet Re·Form·E — 24 mars 2026*