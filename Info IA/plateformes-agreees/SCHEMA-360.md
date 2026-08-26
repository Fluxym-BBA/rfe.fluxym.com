# SCHÉMA `analyse360` — version 1.0

**Contrat de données entre `data/plateformes-agreees.json` et `js/pa-detail.js`.**
Toute nouvelle fiche 360 doit respecter ce schéma. Ce document complète `PROMPT-FICHE-360.md` : il ne dit pas *quoi* chercher, il dit *où le ranger*.

---

## 1. Règle d'or

> **Un concept = une clé. Une clé = un type. Toujours.**

Le renderer ne devine pas. Si une information est rangée sous une clé qu'il ne connaît pas, ou sous un type qu'il n'attend pas, elle **disparaît de la page** — ou casse la page entière. C'est déjà arrivé sur 13 fiches.

**Corollaire — le bucket `complements`.** Aucune recherche ne rentre parfaitement dans un socle figé. Chaque bloc objet accepte donc une clé `complements` (objet libre) où atterrit tout ce qui n'a pas de slot dédié. `pa-detail.js` l'affiche systématiquement sous l'intitulé « Autres éléments relevés », clé humanisée. **Rien ne se perd, rien ne casse.** Si une clé de `complements` revient sur plus de 10 fiches, elle est promue au socle et ce document est mis à jour.

---

## 2. Les 10 blocs et leur type

| Bloc | Type imposé | Si vide |
|---|---|---|
| `metierPrincipal` | `string` | `null` |
| `activites` | `array` d'objets `{libelle, poids, source}` | `[]` |
| `poidsEconomique` | `object` (clés libres, socle ci-dessous) | `{}` |
| `centralitePA` | `object` | socle à `null` |
| `postureCommerciale` | `object` | socle à `null` |
| `referencesClients` | `object` | socle à `null` |
| `reputation` | `object` | socle à `null` |
| `capaciteDeFrappe` | `object` | socle à `null` |
| `lectureConcurrentielle` | `string` | `null` |
| `droitDeReponse` | `object` | socle à `null` |

**Jamais** un `string` nu là où un `object` est attendu. **Jamais** un `object` là où un `string` est attendu.
`activites` accepte des chaînes en lecture, mais la forme cible est l'objet `{libelle, poids, source}` : une chaîne nue perd le poids de l'activité.

---

## 3. Socle par bloc

### `centralitePA`
```
indice                 int  — 0 à 4, repris de data/pa-taxonomie.json
valeur                 enum — coeur_de_metier(4) | axe_strategique(3) | extension_naturelle(2)
                              | activite_annexe(1) | conformite_defensive(0)
marqueProduitDediee    string
entiteJuridiqueDediee  bool
faisceauIndices        array d'objets {signal, sens: "+"|"-", preuve}
lecture, source, dateReleve, confiance
complements            object
```
⚠️ La clé est **`valeur`**, pas `niveau`. `indice` doit être cohérent avec `valeur` selon `pa-taxonomie.json` : le script de normalisation corrige l'incohérence en faveur de la taxonomie.

### `postureCommerciale`
```
valeur                 enum — base_installee | conquete_directe | canal_indirect
                              | grossiste | non_qualifie
modeleTarifaire        string
tarifPublie            bool
offreGratuite          string | bool
lecture, preuve, source, dateReleve, confiance
complements            object
```

### `referencesClients`
```
nbCiteesSurSite        int | string
perimetre              string  — ce que couvrent réellement les références citées
parSecteur             object  — { <clé de la facette secteurReferences>: [noms] }
libellesSecteursEditeur array
grandsComptes          array
referencesPAConfirmees array   ⚠️ toujours un tableau, jamais une chaîne
lecture, commentaire, attention, source, dateReleve, confiance
complements            object
```

### `reputation`
```
avis        array d'objets :
              plateforme      string   — Trustpilot, G2, Capterra, Glassdoor…
              note            number   — valeur numérique normalisée (4.4)
              noteBrute       string   — forme d'origine si non numérique (« 4,4 / 5 »)
              nombreAvis      int      — valeur numérique normalisée (1100)
              nombreAvisBrut  string   — forme d'origine (« 1 100+ »)
              dateReleve, source, commentaire
              complements     object
synthese, distribution, lecture, commentaire, source, dateReleve, confiance
complements            object
```
⚠️ Ne **jamais** poser `plateforme` / `note` / `nombreAvis` à la racine de `reputation` : toujours dans `avis[]`, même pour une seule plateforme d'avis.

### `capaciteDeFrappe`
```
canal                    string
maillage                 string
effectifCommercial       string | int
investissementsAnnonces  string
acquisitions             array | string
financementRecent        string
actionnariat             object { type, actionnaires, detail, source }
modeleTarifaire, tarifPublie, offreGratuite
lecture, source, dateReleve, confiance
complements              object
```
⚠️ L'actionnariat est **regroupé** : plus de `typeActionnaire` / `actionnaires` / `detailActionnariat` à plat.

### `droitDeReponse`
```
signale             bool    — false par défaut, true seulement si un droit de réponse a été exercé
date                string  — AAAA-MM-JJ
objet               string  — ce qui a été contesté
pointsContestables  array   — ce que la plateforme pourrait légitimement contester
canal               string
lecture, source, confiance
complements         object
```
⚠️ Une seule graphie : **`pointsContestables`**. Ni `pointsLegitimementContestables`, ni `elementsContestables`, ni `objetsContestables`, ni `cequilpourraitcontester`.

### `poidsEconomique`
```
caGroupe / caEntiteFrancaise / caEntiteImmatriculee : object
    montantMEUR   number  — 2 décimales maximum
    exercice      string
    nature        enum — comptes_deposes | comptes_confidentiels | aucun_compte_depose
                         | declare_site | chiffre_declare_site | communique_financier
                         | non_publie | sans_objet
    dateReleve    string  — OBLIGATOIRE : une donnée financière sans date n'est pas rejouable
    source, commentaire
resultatNet             number | string
effectifEntite          string   ⚠️ clé unique, la clé `effectif` est supprimée
effectifGroupe          string
ventilationParActivite  object { disponible: bool, motif, derniereVentilationConnue }
lecture, source, dateReleve, confiance
```
⚠️ `montantMEUR: 0` est ambigu. Un CA non renseigné se code `null` + `nature`, jamais `0`.

---

## 4. Champs hors `analyse360` également contraints

### `sourcesEnrichissement` — toujours un tableau d'objets
```
champ       string  — chemin du champ sourcé, ex. "analyse360.reputation.avis"
                      Utiliser "non_precise" si le champ n'est pas identifiable.
source      string  — libellé ou URL
url         string
libelle     string
dateReleve  string
confiance   enum — haute | moyenne | faible | non_qualifie
```
⚠️ Ni URL nue, ni entrée sans `champ`. Pour qu'un contrôle de couverture soit possible, `champ` doit être préfixé par le nom du bloc concerné.

### `immatriculationsLiees.entrees` — toujours un tableau d'objets `{nom, siren}`
Jamais un tableau de chaînes : `slugify()` plante et la page entière ne s'affiche plus.

---

## 5. Vocabulaires fermés

Toute valeur d'énumération doit exister dans `data/pa-taxonomie.json`, facette correspondante. Une valeur hors vocabulaire est signalée par le script de normalisation et s'affiche brute sur la page (dégradation contrôlée, pas de perte).

`confiance` : `haute` | `moyenne` | `faible` | `non_qualifie`. Jamais `null`.

---

## 6. Chaîne de production d'un lot

1. Rédaction du lot selon `PROMPT-FICHE-360.md` **et le présent schéma**.
2. Fusion dans `data/plateformes-agreees.json`.
3. `python3 tools/normalize-360.py data/plateformes-agreees.json --report Info\ IA/plateformes-agreees/RAPPORT-NORMALISATION-360.md`
   Le script est **idempotent** et **non destructif** : rejouable autant de fois que nécessaire, il ne supprime aucune valeur.
4. Lire la section « Points à arbitrer manuellement » du rapport : millésimes contradictoires, `dateReleve` absente, valeurs hors vocabulaire.
5. Commit.

Le script recalcule `_meta.couverture` et aligne `_meta.dateDerniereConsolidation` sur la dernière fusion. Ces compteurs ne doivent plus jamais être saisis à la main.

---

## 7. Ce qui reste à arbitrer par un humain

Le script ne tranche pas ce qui relève du jugement :

- **Millésimes contradictoires** entre `effectif` et `effectifEntite` (SYMTRAX, TX2 Concept…) : les deux textes sont fusionnés, l'arbitrage reste à faire.
- **`dateReleve` absente** sur 32 blocs de chiffre d'affaires.
- **`montantMEUR: 0`** à requalifier en `null` + `nature` quand le CA n'est pas connu.
- **Accents manquants** sur 6 fiches rédigées sans diacritiques (AVALARA, DOCOON, DOCOON IMMO / FREEDZ, OPEN BEE, OPENTEXT, SAP). Le fichier est en UTF-8 NFC valide, sans mojibake : c'est un défaut de rédaction, pas d'encodage.
- **`sourcesEnrichissement`** dont le `champ` ne référence aucun bloc 360 : la traçabilité par bloc reste à reconstituer.
