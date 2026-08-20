# Cartographie des trous — entités étrangères et identifiants non français

**Emplacement :** `Info IA/plateformes-agreees/cartographie-entites-etrangeres.md`
**Rédigé le :** 21/08/2026 · **Lu depuis :** `main` @ `b419029`
**Complète :** `cartographie-reste-a-faire.md` (19/08/2026), qui traite le reste à faire toutes plateformes confondues.
**Objet :** expliquer pourquoi les fiches des plateformes non françaises sont structurellement vides, lister ce qui manque, et fixer la stratégie pour le combler.

---

## 1. Le constat

Le référentiel `data/plateformes-agreees.json` compte **163 entrées** (147 immatriculées + 16 candidates).
Toute la chaîne d'enrichissement construite jusqu'ici repose sur **une seule source d'identité : l'API Recherche d'entreprises (INSEE / RNE)**.

Conséquence mécanique : une entité qui n'est pas au répertoire SIRENE ne peut recevoir **aucun** des champs d'identité. Ce n'est pas un oubli de collecte, c'est un défaut de modèle.

### 1.1 Combien d'entités sont concernées ?

| Source interne | Chiffre annoncé |
|---|---|
| `data/plateformes-agreees.json` → `_meta.couverture.note` | « Les entités étrangères (**44**) ne sont pas dans le répertoire SIRENE » |
| `cartographie-reste-a-faire.md` § 2b | **35** entités étrangères non cartographiées |
| `LOTS-E.md`, lots E10 à E13 | **35** entités étrangères |
| `cartographie-reste-a-faire.md` § 1 (déjà cartographiées, de fait non françaises) | B2BRouter, COMARCH SA, OPENTEXT, PAGERO, SOVOS, STORECOVE, Legalinvoice by Tinexta Infocert, EDICOM France (entité FR d'un groupe ES) |

**Écart à trancher : 35 + 8 = 43, contre 44 annoncés.** L'écart tient probablement au traitement de `EDICOM France` (entité française d'un groupe espagnol) et à la détection de pays par analyse d'adresse — corrigée le 19/08 après le cas SAGE (« Place de Belgique » classée Belgique). **Le champ `pays` est donc une valeur déduite, pas une valeur source.** Aucun chiffre ne doit être publié sur le site avant recomptage à partir du JSON.

À ces entités s'ajoutent les **candidates étrangères** noyées dans les lots E14/E15 (au minimum `BE FRESH S.à r.l.`, `FISKALTRUST`, `Insiders Technologies GmbH`, `Taxilla Europe BV` — liste à confirmer sur pièces), pour lesquelles la source DGFiP ne donne que le nom.

### 1.2 Ce que publie réellement la DGFiP

Confirmé par @RFE_Expert (21/08/2026), la liste publique impots.gouv.fr ne contient que : **nom commercial, adresse, site internet, e-mail, date d'immatriculation**.
Elle ne publie **ni SIREN, ni n° de TVA, ni matricule d'immatriculation, ni pays en colonne dédiée**. Pour une entité étrangère, la source officielle plafonne donc à quatre informations exploitables. Tout le reste relève d'un enrichissement externe.

---

## 2. Pourquoi les fiches étrangères sont vides : la taxonomie est franco-centrée

Analyse champ par champ de `data/pa-taxonomie.json`.

| Champ actuel | Source | Applicable à une entité étrangère ? | Équivalent international à introduire |
|---|---|---|---|
| `siren` | INSEE | ❌ jamais | `identifiantRegistre` + `registreNational` (n° du registre du pays) |
| `raisonSociale` | RNE | ⚠️ oui, mais autre source | registre national du pays / EUID |
| `dateCreation`, `trancheAnneeCreation` | INSEE | ⚠️ oui, autre source | date d'immatriculation au registre national |
| `activitePrincipale` (code APE) | INSEE | ❌ nomenclature FR | code **NACE** rév. 2 (socle commun UE, dont l'APE est la déclinaison) |
| `categorieEntreprise` (PME/ETI/GE) | INSEE | ❌ catégorie statistique FR | catégorie **recommandation UE 2003/361** (micro / petite / moyenne / grande) |
| `trancheEffectif` | INSEE | ⚠️ rarement publié hors FR | effectif déclaré (site, rapport annuel, registre) + année de référence |
| `dirigeants` | RNE | ⚠️ variable selon pays | registre national quand il est ouvert (BE, DK, NL, UK) ; payant ou fermé ailleurs (DE, IT) |
| `adresse` | DGFiP | ✅ | — |
| `pays` | **déduit de l'adresse** | ⚠️ fiabilité à contrôler | à fiabiliser, avec code **ISO 3166-1 alpha-2** |
| `vague`, `statut`, `dateImmatriculation` | DGFiP | ✅ | — |
| `familleOrigine`, `segmentCible`, `verticale`, `natureEntite`, `socleTechnique`, `perimetreFonctionnel` | qualification marché | ✅ **totalement applicable** | aucun — c'est ici que se trouve la valeur récupérable immédiatement |

**Enseignement principal : sur les 12 axes de qualification marché, aucun ne dépend de SIRENE.** Les fiches étrangères sont vides non pas parce que l'information est introuvable, mais parce que le chantier d'identité a tourné en premier et que le chantier de qualification (E) n'a pas encore été lancé sur les lots E10 à E13.

---

## 3. Les trous transverses, français comme étrangers

Trois manques ne concernent pas que l'international, mais frappent l'international deux fois plus fort, faute de source de repli.

| Manque | Taux de remplissage | Commentaire |
|---|---|---|
| **Matricule de plateforme agréée** | **0 %** — le champ n'existe même pas | Confirmé par @RFE_Expert : l'identifiant pivot d'une PA dans l'annuaire est le **matricule 4 caractères, schéma ICD 0238** (DT-6-4, cardinalité 1..1), attribué par la DGFiP. Le SIREN (ICD 0002, DT-6-5) y est **optionnel (0..1)** — la preuve formelle qu'une PA peut exister sans SIREN. Ce matricule **n'est pas publié** : accessible via l'API Directory Service, réservée aux PA raccordées. |
| `siteWeb` | 9 % | Chantier A le règle pour les 147, y compris étrangères : la colonne existe dans la source DGFiP. **C'est la première chose à faire pour les étrangères** : sans URL, aucune qualification marché n'est possible. |
| `reseaux` (Peppol AP) | 2 % | Axe **plus discriminant pour les étrangères que pour les françaises** : la majorité des acteurs nordiques, néerlandais, belges et italiens sont Access Point Peppol de longue date, souvent avant d'être PA. C'est leur trait d'identité le plus vérifiable, et il est public via le Peppol Directory. |

---

## 4. Le bloc d'identité internationale à introduire

Spécification proposée, à ajouter dans `data/pa-taxonomie.json` et à alimenter par patch. Aucun champ existant n'est supprimé : le bloc est **additif** et ne s'applique qu'aux entités dont `pays ≠ France`.

```json
"identiteInternationale": {
  "paysISO": "IT",
  "registreNational": "Registro Imprese (Camere di Commercio)",
  "identifiantRegistre": "…",
  "numeroTVAIntracom": "IT…",
  "tvaVerifieeVIES": true,
  "dateVerificationVIES": "2026-08-21",
  "euid": "ITRI.MI-…",
  "lei": "…",
  "formeJuridique": "S.p.A.",
  "codeNACE": "62.01",
  "categorieUE": "moyenne",
  "presenceEnFrance": {
    "type": "filiale | succursale | representant | aucune_connue",
    "siren": null,
    "preuve": null
  },
  "peppolParticipantId": "0088:…",
  "sourceIdentite": "…",
  "confianceIdentite": "haute | moyenne | non_qualifie"
}
```

Justification de chaque champ retenu :

- **`numeroTVAIntracom`** : c'est le seul identifiant à la fois vérifiable gratuitement (VIES), universel dans l'UE, et **cohérent avec le cadre RFE lui-même** — le schéma ICD **0223 « UE_HORS_FRANCE »** désigne précisément le n° de TVA intracommunautaire. C'est l'ancre naturelle du référentiel pour une entité européenne. Réserve à porter dans la fiche : le code 0223 sert à identifier les *entreprises* dans les flux, pas les *plateformes* dans l'annuaire — ne pas laisser croire l'inverse.
- **`euid`** : identifiant unique européen issu de l'interconnexion des registres (BRIS / e-Justice). Peu connu, mais c'est l'équivalent structurel du SIREN à l'échelle UE.
- **`lei`** : gratuit, vérifiable chez GLEIF, présent pour les groupes cotés et les filiales de grands groupes (SAP, Basware, Amadeus…). Absent pour les PME : son absence n'est pas une anomalie.
- **`presenceEnFrance`** : **le champ le plus utile commercialement**. Savoir qu'un acteur italien opère en France via une filiale immatriculée change tout pour un lecteur qui doit choisir une PA. C'est aussi la question réglementaire ouverte (cf. § 6).
- **`peppolParticipantId`** : identifie l'acteur dans le seul annuaire ouvert et mondial du domaine.

---

## 5. Sources exploitables, par pays

Toutes gratuites sauf mention contraire. À citer systématiquement dans `sourcesEnrichissement`.

| Périmètre | Source | Ce qu'on obtient | Coût |
|---|---|---|---|
| **UE entière** | VIES (Commission européenne) | validité du n° de TVA + raison sociale + adresse | gratuit |
| **UE entière** | BRIS / e-Justice « Recherche d'entreprises » | EUID, forme juridique, registre de rattachement | gratuit |
| **Mondial** | GLEIF | LEI, entité mère directe et ultime — **la meilleure source pour `groupeCapitalistique`** | gratuit |
| **Mondial** | Peppol Directory + liste OpenPeppol des Access Points | participant ID, statut AP | gratuit |
| Allemagne | Unternehmensregister / Handelsregister | HRB, forme, siège ; comptes annuels | partiellement payant |
| Italie | Registro Imprese | codice fiscale / P.IVA, REA | partiellement payant |
| Pays-Bas | KvK Handelsregister | KvK-nummer, activité | consultation gratuite |
| Belgique | BCE / KBO | n° d'entreprise, NACEBEL, dirigeants | gratuit |
| Espagne | Registro Mercantil / Informa | CIF, forme | partiellement payant |
| Suède | Bolagsverket | organisationsnummer | gratuit |
| Finlande | PRH / YTJ | Y-tunnus | gratuit |
| Danemark | CVR | CVR-nummer, dirigeants, effectif — **registre le plus ouvert d'Europe** | gratuit |
| Pologne | KRS | n° KRS, NIP, REGON | gratuit |
| Autriche | Firmenbuch | FN | payant |
| Irlande | CRO | company number | gratuit |
| Luxembourg | RCS / LBR | n° B | gratuit |
| Royaume-Uni | Companies House (API ouverte) | company number, dirigeants, comptes | gratuit |
| Hors UE | registre national du pays + site de la société | variable | variable |

---

## 6. La question réglementaire restée ouverte

Question posée à @RFE_Expert le 21/08/2026 : **à quelles conditions une entité dont le siège est hors de France peut-elle être immatriculée plateforme agréée ?** (établissement stable requis ? représentant en France ? localisation des données ?)

Réponse : **non déterminable en l'état.** Le cadre légal est l'**article 290 B du CGI** et l'**article 242 nonies B de l'annexe II au CGI**, mais ni le texte intégral de ces articles, ni le cahier des charges d'immatriculation DGFiP ne figurent dans la base de connaissance de l'expert. Ce qui est **factuellement certain** : la DGFiP immatricule bel et bien des entités à adresse étrangère — elles sont dans la liste officielle. Cela n'établit pas l'absence de conditions, seulement qu'elles ne sont pas bloquantes.

**Action** : consulter les textes primaires sur Légifrance (art. 290 B CGI, art. 242 nonies B ann. II, décret n° 2024-266 du 25 mars 2024) avant toute publication d'un paragraphe explicatif sur le site. **Tant que ce n'est pas fait, la page ne doit rien affirmer sur ce point.**

---

## 7. Stratégie de comblement

Ordre choisi par rapport qualité d'information obtenue / effort, et non par ordre alphabétique.

### Vague 1 — débloquer (prérequis absolu)
**Chantier A restreint aux entités étrangères** : récupérer `siteWeb` depuis le XLSX DGFiP. Sans URL, rien d'autre n'est faisable. ~1 heure, déjà couvert par `BRIEF-A`.

### Vague 2 — la valeur immédiate, sans identité juridique
**Chantier E, lots E10 à E13** (35 entités). La qualification marché ne dépend pas de SIRENE : elle se fait sur le site de l'éditeur, en anglais. C'est **le meilleur rendement du chantier**, et cela remplit à lui seul 12 champs par fiche.
Point d'attention propre à l'international : chercher la page « France » ou « French e-invoicing mandate » du site, qui dit souvent explicitement s'il existe une entité française et quel socle est utilisé.

### Vague 3 — l'identité internationale
**Chantier F, nouveau** (`BRIEF-F-entites-etrangeres.md`) : VIES → BRIS → GLEIF → registre national, dans cet ordre, en s'arrêtant dès que l'identité est ancrée. Vise `identiteInternationale`, `groupeCapitalistique` et `presenceEnFrance`.

### Vague 4 — les réseaux
**Chantier D** sur les étrangères d'abord : le Peppol Directory est mieux rempli pour elles que pour les acteurs français. Rendement supérieur au même chantier côté FR.

### Ce qu'on renonce à obtenir, et qu'on assume
- Le **matricule PA (ICD 0238)** : non public, non récupérable. Le référentiel ne le portera pas tant que la DGFiP ne le publie pas. À réévaluer si une API publique ouvre.
- Les **dirigeants** en Allemagne, Italie et Autriche : registres payants. Rester à `null` plutôt que de recopier LinkedIn.
- L'**effectif** hors registres nordiques : rarement publié de manière fiable.

---

## 8. Redéfinition de la complétude

Le taux « fiche complète » actuel est trompeur : il mesure une fiche française. **Une entité étrangère ne pourra jamais atteindre 100 % au barème actuel**, ce qui la fait apparaître à tort comme mal renseignée.

Proposition : deux barèmes distincts.

| | Fiche FR complète | Fiche étrangère complète |
|---|---|---|
| Identité | SIREN + raison sociale + date + APE + effectif + catégorie | n° TVA vérifié VIES + registre national + forme juridique + pays ISO |
| Groupe | `groupeCapitalistique` + `relationCapitalistique` | idem, LEI/GLEIF comme source privilégiée |
| Présence FR | implicite | `presenceEnFrance` renseigné, y compris à `aucune_connue` |
| Marché | les 12 axes de qualification | les 12 axes de qualification, à l'identique |
| Réseaux | `reseaux` | `reseaux` |
| Non exigé | — | APE, catégorie INSEE, tranche d'effectif INSEE, dirigeants RNE |

Et côté affichage : sur une fiche étrangère, `pa-detail.js` ne doit pas afficher une colonne « SIREN » vide, mais un bloc « Identité (registre étranger) » assorti d'une mention explicite du type *« Entité non immatriculée au répertoire SIRENE : l'identité est établie à partir du registre national du pays du siège. »* Une absence expliquée vaut mieux qu'une case vide.

---

## 9. Décisions à prendre par Bruno

1. **Valider le bloc `identiteInternationale`** tel que spécifié au § 4, ou l'amender, avant que les lots F ne produisent des patchs — un changement de schéma après coup coûterait une repasse complète.
2. **Trancher l'écart 35 / 43 / 44** par recomptage du JSON, et corriger `_meta.couverture.note` en conséquence.
3. **Ordre de lancement** : E10-E13 (valeur marché) avant F (identité), ou l'inverse.
4. **Afficher ou non `presenceEnFrance`** sur le site public : c'est l'information la plus utile au lecteur, mais aussi la plus sensible commercialement pour les acteurs concernés.
5. **Étendre `merge-plateformes.html`** pour fusionner le bloc `identiteInternationale` clé par clé, comme `socleTechnique` — sinon les patchs F ne seront pas intégrables.

---

## 10. Écarts relevés dans le dépôt (hors sujet principal, à corriger)

- Le dossier réel est **`Info IA/`** (singulier), alors que la documentation interne et le prompt de l'agent parlent de `Infos IA/`. Uniformiser.
- `_meta.couverture.note` de `data/plateformes-agreees.json` annonce **44** entités étrangères, contre **35** dans `cartographie-reste-a-faire.md` (cf. § 1.1).
- Le champ `pays` est **déduit d'une analyse de l'adresse**, avec un bug déjà corrigé une fois (cas SAGE). Il doit être considéré comme une donnée dérivée, à revérifier avant toute publication chiffrée.
