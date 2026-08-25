# Note de chantier — Interrogation des 47 zones aveugles de socle technique

**Chantier :** H2, passe 2 (règles 95 et 96)
**Auteur :** RFE_WebSite
**Date de relevé :** 25 août 2026
**Patch associé :** `patch-SOCLE-47.json` — 11 fiches, 17 écrasements tous intentionnels et documentés

---

## 1. Pourquoi cette passe

La passe précédente avait établi une asymétrie que le référentiel ne pouvait pas laisser en l'état : **18 fiches déclarent offrir un socle en marque blanche ou grise à des tiers, une seule déclare en être cliente**. Arithmétiquement, c'est impossible. Les clients existent, ils ne se déclarent pas.

Le gisement où ils se cachent est identifié : les **47 fiches dont le socle n'est pas établi**, soit 34 en `type: inconnu` et 13 sans `type` du tout. Cette passe les interroge.

Décompte de départ, recontrôlé sur l'instantané de travail :

| État du champ `socleTechnique.type` | Nombre |
|---|---|
| `propre` | 113 |
| `inconnu` | 34 |
| vide | 13 |
| `hybride` | 2 |
| `marque_blanche` | 1 |
| **Total** | **163** |

---

## 2. Résultat chiffré

**6 socles levés, 5 fiches enrichies sans levée. Le référentiel passe de 47 à 41 zones aveugles.**

| Fiche | Avant | Après | Opérateur établi | Confiance |
|---|---|---|---|---|
| Shine | `inconnu` | **`propre`** | Shine Denmark ApS | moyenne |
| Legalinvoice by Tinexta Infocert | vide | **`propre`** | InfoCert S.p.A. (groupe Tinexta) | **haute** |
| EEZI powered by VAT IT | vide | **`propre`** | VAT IT Group | moyenne |
| XELYA | `inconnu` | **`propre`** | Xelya | moyenne |
| SEPTEO | `inconnu` | **`propre`** | Groupe Septeo | moyenne |
| KLEKOON | vide | **`propre`** | Klekoon | moyenne |
| MyKinexo PDP | vide | `inconnu` | — | non qualifié |
| Effinum by SPEE | vide | `inconnu` | — | non qualifié |
| FIDUCIAL CLOUD | `inconnu` | `inconnu` | — | non qualifié |
| FULLL | `inconnu` | `inconnu` | — | faible |
| VosFactures | `inconnu` | `inconnu` | — | faible |

**Aucune nouvelle route de contrôle étranger par marque blanche n'a été trouvée dans cette passe.** Les six levées sont toutes des socles propres. L'asymétrie de la règle 96 n'est donc pas réduite : elle est confirmée comme difficile à réduire, ce qui est en soi un résultat.

---

## 3. Ce qui a marché, et ce qui n'a pas marché

### N'a pas marché : interroger la page produit

Les pages « notre plateforme agréée » sont un genre littéraire homogène et stérile. Elles revendiquent l'immatriculation, listent Factur-X, UBL, CII, l'archivage dix ans et l'e-reporting, et ne nomment jamais l'opérateur. Sur les huit premières fiches interrogées de cette façon, le rendement a été **nul**.

C'est logique : nommer son fournisseur de socle est une contre-communication. L'acteur vend sa conformité, pas celle d'un tiers.

### A marché : les documents contractuels

Les **conditions générales** et les **politiques de confidentialité** sont les seuls documents où l'acteur est juridiquement contraint de nommer l'entité responsable du traitement. Deux levées sur six en viennent directement.

Le cas Shine est exemplaire. La page produit dit « Shine est une Plateforme Agréée de facturation électronique », point. Les conditions d'utilisation disent :

> « des fonctionnalités de facturation électronique fournies par **Shine Denmark ApS** en qualité de Plateforme Agréée (PA) immatriculée auprès de l'administration fiscale française sous le numéro **0147** »

On y gagne l'entité porteuse, sa nationalité et le numéro d'immatriculation, que la page commerciale ne donnait pas. Le service est vendu sous une marque française, l'immatriculation est portée par une société danoise.

Même mécanique chez Klekoon, dont la politique de confidentialité décrit le traitement opéré en propre et ne mentionne aucun sous-traitant de socle.

### A marché : chercher le consommateur, pas le fournisseur

La deuxième source utile est le **tiers qui déclare s'appuyer sur la plateforme**. Un acteur ne dit pas de qui il dépend, mais celui qui dépend de lui le dit volontiers, parce que c'est un argument de réassurance.

- **Teogest**, solution du groupe Septeo pour les experts-comptables, écrit : « En tant que solution du groupe Septeo, Teogest s'appuie sur la Plateforme Agréée de facturation électronique du groupe ». Cette phrase lève le socle de Septeo, que la page Septeo elle-même ne levait pas.
- **Themisia**, logiciel de cabinet d'avocats, écrit que Xelya est agréée et que ses utilisateurs en bénéficient. Avec Ximi, cela fait deux logiciels tiers adossés à la PA Xelya.

L'inversion de la requête — « qui déclare s'appuyer sur X », et non « sur quoi s'appuie X » — est le principal apport méthodologique de cette passe.

---

## 4. Trois découvertes hors socle

### 4.1 Effinum est la plateforme du réseau Cerfrance

L'entrée `Effinum by SPEE` était jusqu'ici lue comme une plateforme d'éditeur. Elle ne l'est pas. Les cabinets Cerfrance la présentent comme la leur :

> « Pour vous accompagner, le **Réseau Cerfrance** a conçu et mis en place la plateforme Effinum »
> « La Plateforme Agréée (PA) du **réseau CERFRANCE** EFFINUM »

C'est le **troisième réseau d'expertise comptable** identifié comme porteur d'une immatriculation, après jefacture.com pour l'ECMA et, plus discrètement, MyKinexo dont les cabinets Cerfrance relaient également l'agrément à leurs clients.

Le bloc profession comptable, ouvert le 24 août avec six fiches, n'était donc pas clos. Il faudra y revenir : un réseau qui équipe ses adhérents soustrait ses flux au marché adressable sans qu'aucune décision d'achat de logiciel n'ait lieu, et c'est exactement le mécanisme que la règle 76 décrit.

### 4.2 VosFactures pourrait être polonaise

Un annuaire tiers présente VosFactures comme éditée par **Factuali SAS**, à Nice, filiale de l'éditeur polonais **Fakturownia**. Si la chaîne se vérifie au registre, elle fait entrer un **dixième pays** au référentiel, par la voie la plus discrète qui soit : une société française, une marque française, un site en français.

La piste est publiée en `confiance: faible` et explicitement marquée à corroborer. Elle n'est pas tenue pour acquise.

### 4.3 Le produit n'est pas la plateforme

Chez Fiducial, **Facilia** est le nom commercial des deux modules, **FIDUCIAL CLOUD** est le nom de la plateforme agréée qui les porte. Les annuaires tiers confondent les deux et attribuent à « Facilia » une immatriculation, une date de fondation (1983, qui est celle du groupe) et un chiffre d'affaires (1,8 Md€, contre 1,310 Md€ publié par le groupe).

C'est le même piège que MEG pour LE VILLAGE CONNECTÉ : le produit visible et la plateforme immatriculée portent des noms différents, et le nom du produit ne dit rien du socle.

---

## 5. Sur les annuaires tiers

Cette passe a fait apparaître deux annuaires qui documentent, plateforme par plateforme, l'éditeur, le siège, les tarifs et les capacités techniques. Ils sont tentants : ils répondent précisément à la question posée, pour les 163 entrées, sans effort.

Ils ne sont pas fiables. Sur la seule fiche Facilia, trois erreurs vérifiables : une date de fondation qui est celle du groupe, un chiffre d'affaires supérieur de 37 % au montant publié, et une confusion produit/plateforme. Sur la fiche VosFactures, une affirmation — l'immatriculation ne serait pas définitive — qui contredit le référentiel sans apporter de source.

Ils restent utiles comme **générateurs de pistes**. C'est ainsi que la piste Fakturownia a été trouvée. Mais une piste n'est pas un fait, et la distinction doit rester visible dans la donnée publiée : d'où le `confiance: faible` et la mention « annuaire tiers, à corroborer » portée dans le champ `source` lui-même, et non seulement dans un commentaire.

---

## 6. Acteurs révélés, sans immatriculation

Trois noms sont apparus comme consommateurs d'un socle tiers. Ils ne portent pas d'immatriculation et n'entrent donc pas au référentiel, mais ils sont les porteurs de la preuve :

| Acteur | S'appuie sur | Nature |
|---|---|---|
| Teogest | PA du groupe Septeo | marque interne du groupe |
| Themisia | PA Xelya | logiciel tiers, cabinets d'avocats |
| Ximi | PA Xelya | logiciel tiers |

Ils illustrent le mécanisme que la règle 96 décrit : pour chaque plateforme agréée visible, il existe un nombre inconnu de logiciels qui s'y adossent et que le référentiel ne voit pas.

---

## 7. Règles ajoutées

**Règle 98 — Un annuaire agrégateur est un générateur de pistes, jamais une preuve.** Ses fiches sont produites en série et comportent des erreurs vérifiables. Toute donnée qui en provient est publiée en `confiance: faible`, et la mention « annuaire tiers, à corroborer » figure dans le champ `source` lui-même, pas seulement dans un commentaire de travail.

**Règle 99 — Interroger les documents contractuels avant les pages produit.** Conditions générales, conditions d'utilisation et politique de confidentialité sont les seuls documents où l'acteur doit nommer l'entité juridique qui opère la plateforme. C'est là, et non sur la page commerciale, que se trouve la réponse à « qui opère ». La page produit est à consulter en dernier.

**Règle 100 — Chercher le consommateur, pas le fournisseur.** Un acteur ne publie pas de qui il dépend ; celui qui dépend de lui le publie, parce que c'est un argument de réassurance. Sur une plateforme dont le socle résiste, la requête à poser est « qui déclare s'appuyer sur elle », pas « sur quoi s'appuie-t-elle ».

**Règle 101 — Le nom du produit n'est pas le nom de la plateforme agréée.** Facilia est un produit, FIDUCIAL CLOUD est la plateforme ; MEG est un produit, LE VILLAGE CONNECTÉ est la plateforme. Aucun socle, aucun chiffre et aucune date ne doivent être renseignés sur la foi du nom commercial : il faut d'abord établir quelle entité porte l'immatriculation.

---

## 8. Reste à faire

- **41 zones aveugles** subsistent. Les rejouer avec les règles 99 et 100, qui n'existaient pas au début de cette passe : les fiches interrogées avant leur formulation méritent une seconde lecture par les conditions générales.
- **FIDUCIAL CLOUD** : le bloc « Partenaires » de `fiducial.fr/facilia` n'est constitué que d'images sans texte alternatif. À relever par capture de page rendue.
- **VosFactures** : corroborer Factuali SAS et Fakturownia au registre du commerce, et trancher la contradiction sur le caractère définitif de l'immatriculation.
- **Effinum / SPEE** : identifier la structure juridique SPEE et son rattachement au réseau Cerfrance, puis traiter le bloc en fiche 360 avec jefacture.com et MyKinexo.
- **Shine** : établir la chaîne de détention de Shine Denmark ApS, non vérifiée à ce jour.
- Demander aux **18 offreurs de marque blanche** s'ils publient la liste de leurs partenaires : après cette passe, c'est redevenu la voie la plus rentable pour réduire l'asymétrie.
