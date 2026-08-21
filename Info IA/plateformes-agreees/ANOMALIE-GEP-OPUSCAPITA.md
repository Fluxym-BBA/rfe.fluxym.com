# Résolution de l'anomalie GEP — l'entité immatriculée n'est pas celle qu'on croit

**Date :** 21/08/2026 · **Auteur :** RFE_WebSite · **Patch associé :** `patches/patch-G-GEP.json`

---

## 1. L'anomalie de départ

La fiche GEP du référentiel présentait quatre incohérences simultanées :

- `pays` valait `France` ;
- l'adresse publiée par la DGFiP était `Innopoli 2 Tekniikantie 14 2600`, qui n'est pas une adresse française ;
- `siren`, `anneeCreation` et `natureEntite` étaient vides ;
- le radar de détection des angles morts classait la société en `non_evaluable`, faute de `natureEntite`.

Une fiche qui ne dit ni où est l'entreprise, ni quand elle a été créée, ni ce qu'elle est.

---

## 2. Ce que l'adresse révèle

`Innopoli 2, Tekniikantie 14` est le **siège d'Espoo d'OpusCapita**, tel que l'entité le publie elle-même sur sa page d'adresses. Même bâtiment, même rue, même ville — Espoo, en Finlande, la ville où siège aussi Basware.

Or OpusCapita a été **rachetée par GEP le 01/07/2024**, et ses pages institutionnelles sont désormais publiées sous la raison sociale **GEP Finland Oy**.

**Conclusion : l'entité immatriculée comme plateforme agréée n'est pas GEP Worldwide, société américaine de Clark dans le New Jersey. C'est sa filiale finlandaise, ex-OpusCapita.**

Ce qui explique mécaniquement l'absence de SIREN : il n'y a rien à chercher, l'entité est finlandaise. Et cela explique le `pays` erroné : le nom commercial « GEP » a été rattaché au groupe américain par défaut, sans que l'adresse soit lue.

**Écart de source à signaler :** la DGFiP publie le code postal `2600`, l'entité publie `02150 Espoo`. Le champ `adresse` de la fiche n'est pas modifié — la liste DGFiP reste la source de ce champ — mais l'écart est consigné.

---

## 3. Qui est vraiment l'entité immatriculée

| | Entité immatriculée | Groupe |
|---|---|---|
| Nom | GEP Finland Oy (ex-OpusCapita) | GEP (GEP Worldwide) |
| Siège | Espoo, Finlande | Clark, New Jersey, États-Unis |
| Création | **1985** | 1999 |
| Métier | facturation électronique, comptabilité fournisseurs, documents de chaîne d'approvisionnement | logiciel, conseil et externalisation achats et supply chain |
| Effectif | 220 au moment du rachat (juillet 2024) | ~6 000 (source tierce) |
| Clients | 600 | > 1 000, dont > 550 du Fortune 500 et du Global 2000 |
| Actionnaire précédent | PSG Equity, majoritaire depuis 2019 | non coté, dirigé par son cofondateur |

L'entité immatriculée est donc un **éditeur de facturation électronique de quarante ans d'âge**, opérateur de l'un des réseaux d'échange les plus établis d'Europe du Nord. Ce n'est pas un généraliste des achats qui aurait ajouté une brique de conformité.

---

## 4. La règle de barème que ce cas impose

Les deux lectures de la centralité s'opposent frontalement :

| Périmètre de lecture | Indice qui en découlerait |
|---|---|
| Entité immatriculée : la facturation électronique **est** son métier depuis 1985 | **4** — cœur de métier |
| Groupe : un module d'une des trois lignes de métier, dans une maison qui parle achats | **1** — activité annexe |

Écart de 3 points sur une échelle de 4. Le modèle ne pouvait pas rester muet là-dessus.

**Règle actée :** l'indice se lit sur l'**investissement observable sur le mandat français**, et non sur le périmètre juridique retenu. Les deux lectures sont exposées dans le champ `lecture` de la fiche, pour que le lecteur voie le raisonnement au lieu de subir un chiffre.

**Indice retenu : 2 — extension naturelle.** Ce qui a tranché, ce sont quatre signaux négatifs concordants :

1. aucune page du site ne traite du dispositif français — ni immatriculation, ni raccordement au PPF, ni calendrier ; la page `opuscapita.com/e-invoicing-france` renvoie une erreur 404 ;
2. aucune entité française identifiée, donc aucune équipe locale documentée ;
3. immatriculation tardive, le 17/06/2026, six mois après la première vague ;
4. l'agrément n'a pas été construit, il a été **hérité** d'une acquisition.

Face à cela, trois signaux positifs : le métier historique de l'entité, une antériorité de plus de 25 ans sur la facturation électronique avec une couverture de plus de 80 pays et 70 opérateurs réseau, et une offre vendable seule, indépendamment de la suite achats.

**Situation explicitement instable.** La capacité technique est déjà là ; seul l'investissement commercial français manque. Un changement de priorité du groupe ferait bouger cet indice vite. À revoir à chaque mise à jour du référentiel.

---

## 5. Ce que ce cas change pour la lecture concurrentielle

**Ne pas sous-estimer la capacité technique sous prétexte que le groupe parle d'abord d'achats.** Le socle est ancien, éprouvé, multi-pays. Le raccourci « éditeur de S2P qui a coché la case conformité » serait faux ici.

**Un client GEP dispose désormais d'une plateforme agréée à l'intérieur de sa suite achats.** C'est exactement la situation inverse de celle d'un éditeur de S2P dépourvu d'agrément, dont les clients doivent aller contracter ailleurs — question ouverte par ailleurs sur Ivalua, absente du référentiel.

**Sur un appel d'offres franco-français, GEP arriverait sans matériel local.** Faiblesse réelle, mais purement conjoncturelle : elle tient à une absence de communication, pas à une absence de produit.

---

## 6. Le motif « agrément hérité par acquisition » est à chercher ailleurs

GEP n'est probablement pas un cas isolé. Le motif à détecter : **une plateforme dont le nom commercial est celui d'un groupe généraliste, mais dont l'adresse publiée par la DGFiP est celle d'une filiale spécialisée acquise.**

Méthode, en trois minutes par société : lire l'adresse publiée par la DGFiP, la géolocaliser, et vérifier si elle correspond au siège annoncé par le nom commercial. Quand les deux divergent, l'adresse a raison.

Candidats à vérifier en priorité — plateformes dont le `pays` déclaré pourrait ne pas correspondre à l'adresse DGFiP :

- **MEDIUS** — `pays` vaut `France` alors que le groupe est suédois, à Linköping. Anomalie signalée le 21/08 et toujours non vérifiée.
- Les **16 entités sans pays renseigné**, dont l'adresse n'a jamais été confrontée à une source.
- Toute plateforme portant un nom de groupe international sans `siren`.

Ce contrôle est à intégrer au chantier F comme **première étape**, avant toute recherche d'identité : il évite de chercher pendant vingt minutes le SIREN d'une société qui n'en a pas.

---

## 7. Champs complétés par le patch

| Champ | Valeur | Source |
|---|---|---|
| `anneeCreation` | 1985 | communiqué GEP du 01/07/2024 |
| `raisonSociale` | GEP Finland Oy (anciennement OpusCapita) | pages institutionnelles opuscapita.com |
| `natureEntite` | `extension_demat` | métier historique de dématérialisation |
| `groupeCapitalistique` | GEP (GEP Worldwide), Clark, New Jersey | communiqué du 01/07/2024 |
| `relationCapitalistique` | `acquise` *(était `non_determinable`)* | rachat effectif le 01/07/2024 |
| `identiteInternationale` | FI, registre PRH, Oy, aucune entité française identifiée | opuscapita.com + annuaire des entreprises |

Le renseignement de `natureEntite` fait par ailleurs **sortir GEP des 10 plateformes `non_evaluable` du radar** : il en reste 8, toutes françaises, après le retrait mécanique de GEP et de Taxilla Europe BV.
