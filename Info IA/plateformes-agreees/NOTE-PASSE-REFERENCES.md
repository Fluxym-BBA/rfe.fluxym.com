# Note de chantier — Passe transversale « références clients par secteur », vague 1

**Décision d'arbitrage :** passes transversales sur les 163 entrées, plutôt que fiches acteur par acteur (§5 de `CARTOGRAPHIE.md`).
**Objet de cette vague :** établir une méthode reproductible avant de l'appliquer à l'ensemble. Une seule fiche est livrée, c'est volontaire.
**Date de relevé :** 25 août 2026 — **Patch :** `patch-REFERENCES-V1.json`

---

## 1. Pourquoi cette passe passe avant les autres

C'est le besoin initial du référentiel — savoir qui sont les clients des concurrents, par secteur — et c'est celui sur lequel il est le moins avancé : **10 fiches sur 163** ont une répartition sectorielle, **4** ont des références confirmées sur l'activité agréée.

C'est aussi le bloc le plus dangereux du référentiel en l'état, pour une raison précise développée au §3.

---

## 2. Ce que la méthode devait résoudre

Trois obstacles étaient identifiés, deux sont levés, un reste.

**Obstacle 1 — les logos sont des images.** Levé. Le navigateur restitue les URL des images, et les noms de fichiers portent le nom du client : `Logo_SAINTGOBAIN_RVB`, `882px-Logo_Auchan_1983-2015.svg`, `Logo-Petit-Forestier`. Là où le texte ne nomme pas le client, le nom de fichier le fait. La capture d'écran avec lecture visuelle, envisagée d'abord, est inutile : elle coûtait une lecture d'image par acteur, le relevé textuel coûte une requête.

**Obstacle 2 — distinguer référence de groupe et référence agréée.** Levé, et mieux qu'espéré, voir §3.

**Obstacle 3 — trouver l'URL de la page.** Non levé, et c'est le vrai coût. Sur quatre URL construites par déduction, **trois ont répondu 404**. L'URL d'une page de références ne se devine pas : `/temoignages-clients/`, `/clients/`, `/references/` échouent aussi souvent qu'ils réussissent. Il faut une recherche avant chaque chargement, ce qui double le coût par acteur.

---

## 3. La trouvaille de méthode : faire établir le périmètre par l'acteur lui-même

Le problème central du bloc `referencesClients` n'était pas de trouver des noms, c'était de savoir **sur quoi porte la référence**. Un acteur comme Generix vend du WMS, du TMS, de l'EDI et une plateforme agréée. Ses clients nommés sont-ils clients de l'offre agréée ? Jusqu'ici la réponse était « on ne sait pas », et le bloc était donc inexploitable : présenter Carrefour comme client de l'offre agréée de Generix serait faux, et le référentiel n'avait aucun moyen de l'interdire.

La page clients de Generix apporte la réponse par sa propre structure. Elle offre un **filtre par produit**, et la liste de ce filtre comprend explicitement **« e-Invoicing »**. Or aucun cas client ne remonte sous ce filtre : les 24 cas nommés portent tous sur Generix WMS, TMS, EDI Services, TradeXpress ou Vendor Managed Inventory.

**L'absence de référence publiée sur l'activité de plateforme agréée est donc établie par la nomenclature de Generix lui-même, et non déduite d'un silence.** C'est une preuve, pas une supposition — et c'est exactement le niveau d'exigence que le référentiel s'impose ailleurs.

D'où le champ nouveau **`perimetre`**, valeur `references_groupe` ici, qui doit désormais être renseigné sur tout bloc `referencesClients`. Sans lui, le bloc ne doit pas être publié.

---

## 4. Deuxième champ nouveau : la nomenclature sectorielle de l'acteur

Generix publie treize libellés sectoriels. Trois d'entre eux désignent le même secteur : **« Retail »**, **« Grande distribution »** et **« Commerce de détail et biens de consommation »**. Deux autres se recouvrent : « Logistique et chaîne d'approvisionnement » et « Transport et logistique ».

Reprendre ces libellés tels quels rendrait tout comptage sectoriel faux, et toute comparaison entre deux acteurs impossible — puisque chacun publie sa propre nomenclature. Mais les écraser silencieusement dans la facette du référentiel ferait perdre l'information d'origine.

D'où le second champ nouveau, **`libellesSecteursEditeur`**, qui conserve la nomenclature publiée, à côté de la traduction vers la facette contrôlée `secteurReferences`. Les deux coexistent, la traduction est vérifiable.

---

## 5. Résultat de la vague

**GENERIX Group** : 24 sociétés nommées, 7 secteurs du référentiel, **0 référence agréée confirmée**.

| Secteur | Sociétés nommées |
|---|---|
| Transport et logistique | Petit Forestier, Kuehne+Nagel, ID Logistics, FM Logistic, FM Logistic Brazil, Imprex Europe |
| Grande distribution | Carrefour, Auchan, Intermarché, Conforama, Maisons du Monde |
| Agroalimentaire | Danone, Andros, AB InBev, Coroos, Brivio & Vigano |
| Distribution professionnelle | Sonepar, Rexel, JJA |
| Industrie | Saint-Gobain, Safran |
| Énergie | EDF, Soven (Engie Solutions) |
| Services | Elior |

Douze de ces vingt-quatre sont des grands comptes. Le groupe revendique par ailleurs « plus de 3 000 clients » : les 24 nommés sont donc une vitrine choisie, pas un échantillon.

L'écrasement produit par ce patch mérite d'être signalé : le champ `source` contenait le reste-à-faire posé le 21/08, *« à extraire des pages clients, en séparant les références du catalogue global des références spécifiquement liées à l'offre agréée »*. C'est mot pour mot ce que la vague vient de faire.

---

## 6. Coût réel et conséquence sur le dimensionnement

Quatre URL chargées, **une seule page exploitable**. Le coût par acteur est de l'ordre de deux requêtes — une recherche pour trouver l'URL, un chargement pour la relever — auxquelles s'ajoutent les acteurs qui ne publient aucune page de références.

À ce coût, **les 163 entrées ne sont pas traitables en une passe**. Il faut ordonner, et l'ordre doit venir de l'usage : les acteurs dont les références intéressent Fluxym sont ceux qu'elle croise sur ses affaires.

Ordre proposé pour les vagues suivantes :

1. **Concurrents directs sur les affaires Fluxym** — ceux qui se présentent face à BASWARE, ESKER, GEP et IVALUA. C'est là que la donnée sert immédiatement.
2. **Les 5 grossistes** déjà qualifiés en posture : leurs références sont des plateformes, pas des entreprises, et cela documente les routes indirectes.
3. **Les grands éditeurs internationaux** du chantier G2 : Pagero, Sovos, Comarch, Opentext, Cegid, Sage.
4. **Balayage du reste**, en acceptant les blocs vides motivés.

Une réserve à porter dès maintenant : une part importante des acteurs n'aura **aucune** référence agréée à publier, et ce ne sera pas un défaut de relevé. La réforme n'entre en vigueur que le 1er septembre 2026 pour la réception. Un bloc vide motivé est un résultat, et il devra être lisible comme tel sur le site.

---

## 7. Règles ajoutées

**Règle 102 — Relever les noms de fichiers d'images autant que le texte.** Les bandeaux de logos ne contiennent pas de texte, mais les URL des images portent le nom du client (`Logo_SAINTGOBAIN_RVB`, `882px-Logo_Auchan_1983-2015.svg`). La capture d'écran avec lecture visuelle est inutile et coûteuse : le relevé textuel des URL d'images suffit.

**Règle 103 — Ne jamais reprendre la nomenclature sectorielle de l'acteur telle quelle.** Chaque éditeur publie la sienne, et elle est souvent redondante : Generix affiche « Retail », « Grande distribution » et « Commerce de détail et biens de consommation » pour un même secteur. Le relevé conserve le libellé d'origine dans `libellesSecteursEditeur` et publie la traduction vers la facette contrôlée `secteurReferences`. Les deux coexistent, la traduction reste vérifiable.

**Règle 104 — Faire établir le périmètre par l'acteur lui-même.** Un filtre par produit sur une page de cas clients est la meilleure preuve de périmètre disponible : si l'acteur permet de filtrer sur son offre agréée et qu'aucun cas ne remonte, l'absence de référence est établie par sa propre nomenclature et non déduite d'un silence. Le champ `perimetre` est obligatoire sur tout bloc `referencesClients` ; sans lui, le bloc n'est pas publiable, car il autoriserait à présenter une référence de groupe comme une référence de l'activité agréée.

**Règle 105 — L'URL d'une page de références ne se devine pas.** Sur quatre URL construites par déduction, trois ont répondu 404. Chercher l'URL avant de la charger. Le coût par acteur est de deux requêtes, ce qui interdit de traiter les 163 entrées en une passe et impose de les ordonner par l'usage.
