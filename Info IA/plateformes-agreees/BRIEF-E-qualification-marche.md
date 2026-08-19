# BRIEF E — Qualification marché (lots E1 à E15)

**Chantier :** E · **Périmètre :** 135 plateformes, 15 lots disjoints de 10 · **Nature :** manuel assisté
**Patch attendu :** `patches/patch-E<n>.json`, un fichier par lot

## Objectif
Qualifier le positionnement de marché de chaque plateforme. C'est le cœur de la valeur du référentiel : ce que personne d'autre ne publie.

## Périmètre du lot
Voir `LOTS-E.md`. **Ne traiter que les plateformes du lot demandé.** Un lot par conversation, jamais deux conversations sur le même lot.

## Méthode, par plateforme
1. Ouvrir le site officiel : page d'accueil, page « plateforme agréée / PDP / facturation électronique », page tarifs, page partenaires, mentions légales.
2. En déduire le positionnement à partir de **ce que la plateforme dit d'elle-même**, en citant l'URL.
3. Si le site est inaccessible ou muet : laisser à `null`, `confiance: "non_qualifie"`, et le signaler dans `_patch.note`.

## Champs à produire
| Champ | Valeurs autorisées |
|---|---|
| `familleOrigine` | `s2p`, `o2c`, `edi`, `tax`, `facturation_compta`, `portail_ec`, `ged`, `fintech`, `erp`, `integrateur`, `pure_player` |
| `segmentCible` | `micro`, `tpe_pme`, `eti`, `grands_comptes`, `public` |
| `verticale` | `generaliste` ou une verticale sectorielle |
| `natureEntite` | `creee_pour_rfe`, `extension_demat`, `diversification` |
| `perimetreFonctionnel` | `emission`, `reception`, `ereporting`, `routage_pur`, `suite_gestion` |
| `socleTechnique` | `type` : `propre`, `marque_blanche`, `marque_grise`, `hybride`, `inconnu` + `operateurSocle`, `preuve`, `source`, `confiance` |
| `fournisseurDeSocle` | `true` si la plateforme revend son socle à des tiers |
| `modeDistributionSocle` | `direct`, `marque_blanche`, `marque_grise`, `API/embedded`, `via cabinet EC`, `via integrateur` |
| `solutionsCompatiblesPartenaires` | liste des éditeurs partenaires publiés |
| `groupeCapitalistique` | groupe d'appartenance, avec taille si connue |
| `descriptionFiche` | 3 à 6 lignes factuelles |
| `logiquePositionnement` | le positionnement PA est-il cohérent avec le métier d'origine ? |

## Signaux à chercher en priorité
- **Le rôle de grossiste** : une page « devenez partenaire », « marque blanche », « API pour éditeurs », ou une liste de Solutions Compatibles. C'est la donnée la plus rare et la plus utile. Déjà identifiés : EsaLink (36 partenaires publiés), B2BRouter, Serensia, Pagero, Storecove, Iopole, Docoon.
- **Le nom commercial du service**, souvent différent du nom d'inscription. Exemple confirmé : l'inscription `ESALINK` correspond au produit « Hubtimize e-Invoicing ».
- **L'entité dédiée** : suffixe `PDP` ou `PA` dans la raison sociale, ou création postérieure à 2021.
- **La verticale sectorielle** : pharmacie, assurance, optique, immobilier, juridique, transport, agroalimentaire, BTP, ESN.

## Interdits
- inventer un positionnement à partir du seul nom de l'entreprise
- déduire un socle en marque blanche d'une simple ressemblance d'interface
- écrire « marque blanche » comme s'il s'agissait d'une catégorie réglementaire : ce n'est pas le cas, l'administration ne distingue que la plateforme agréée immatriculée et la Solution Compatible non immatriculée. Chaque plateforme de la liste officielle est immatriculée en son nom propre et reste seule responsable devant l'administration.
