# Récupération de SIREN — deuxième passe, les 9 sites résistants — 22/08/2026

La passe du matin avait laissé 9 fiches françaises sans SIREN, parce que l'URL `/mentions-legales` ne donnait rien. La route testée ici est différente : **CGV, informations légales enfouies dans un chemin numéroté, politique de traitement des données, site frère du groupe**.

**7 fiches ancrées sur 9.**

## Résultat

| Fiche | Dénomination légale | SIREN | Route qui a fonctionné |
|---|---|---|---|
| AXWAY SOFTWARE | **74SOFTWARE** | 433 977 980 | mentions légales `/fr/mentions-legales` |
| MY FITECO | **FITECO** | 557 150 067 | mentions légales du site du groupe, `fiteco.com` |
| MyKinexo PDP | **NEXCER** | 834 979 387 | mentions légales de `kinexo.fr`, pas du sous-domaine produit |
| SUPER PDP | **SUPER G** | 853 322 915 | informations légales sur un chemin numéroté `/legal/16` |
| Effinum by SPEE | **SOLUTIONS PROFESSIONNELLES D'ÉCHANGES ÉLECTRONIQUES (SPEE)** | 904 987 815 | mentions légales sans SIREN + adresse et président recoupés au répertoire |
| jefacture.com | **EXPERT-COMPTABLE MÉDIA ASSOCIATION (ECMA)** | 403 156 540 | mentions légales du site frère `jedeclare.com` |
| VosFactures | **FACTUALI** | 880 286 232 | page de traitement des données, seule page accessible du domaine |
| ICD International | — | *non établi* | aucune page légale sur le domaine |
| NEOTIMO | — | *non établi* | site en erreur 500 à chaque requête |

**6 dénominations légales sur 7 diffèrent du nom déclaré à la DGFiP.** La règle 59 se vérifie une troisième fois sur un échantillon indépendant : chercher l'entité, jamais le nom.

Toutes les concordances d'adresse sont **caractère pour caractère** avec le siège INSEE, et les ressorts de greffe sont cohérents (Annecy, Laval, Rennes, Paris).

## Deux poids économiques majeurs entrent au référentiel

- **74SOFTWARE** (ex-Axway Software) : **461,9 M€** de chiffre d'affaires et **39,3 M€** de résultat net sur l'exercice 2024, ETI de 250 à 499 salariés, 5 établissements, code APE 58.29A. C'est le troisième chiffre d'affaires du référentiel après Cegedim et Cegid. Société cotée : le consolidé du groupe est à lire dans le rapport annuel, il n'est pas repris ici.
- **FITECO** : **282,1 M€** et **18,4 M€** sur l'exercice 2025, ETI de 2 000 à 4 999 salariés, **178 établissements**, code APE 69.20Z. Le chiffre mesure l'activité d'expertise comptable du réseau, pas la plateforme MY FITECO : la part n'est ni isolée ni estimée.

Deux entités déposent un **chiffre d'affaires nul** : NEXCER (résultat net −662,7 k€ en 2023) et SPEE (−138,9 k€ en 2022).

## Trois particularités structurantes

**Le porteur de jefacture.com est une association loi 1901.** EXPERT-COMPTABLE MÉDIA ASSOCIATION (ECMA), nature juridique 9220 au répertoire, créée en 1995, 20 à 49 salariés, code APE 63.12Z. Aucun capital social, aucun dirigeant inscrit au répertoire des entreprises, aucun compte déposé au greffe : les états financiers d'une association ne suivent pas le régime de dépôt des sociétés commerciales. Le modèle de données du référentiel présupposait implicitement une société commerciale.

**La mention légale d'Axway affiche une dénomination périmée.** Elle nomme « Axway Software » avec un capital « arrêté au 31 décembre 2019 », alors que le SIREN 433 977 980 porte aujourd'hui la dénomination **74SOFTWARE**. Le SIREN reste exact : c'est lui qui ancre, pas le nom qu'il affichait.

**SPEE est une société anonyme à conseil d'administration de huit membres**, présidé par Philippe Marteau, pour une entité d'un seul établissement, sans effectif renseigné et sans chiffre d'affaires. Structure de gouvernance de type collectif dont l'actionnariat n'est pas publié. Fait relevé, non interprété.

## Une coquille dans une mention légale

La page de `jedeclare.com` cite **deux numéros différents** : « SIREN 403 156 540 » au paragraphe 1 et « SIREN 403 154 540 » au paragraphe 2.1. Un seul existe au répertoire, et c'est celui dont l'adresse concorde avec l'adresse publiée. L'autre est consigné comme coquille, pas comme une seconde entité.

## Deux fiches restent sans SIREN — et c'est un résultat

- **ICD International** : aucune page légale sur le domaine. Cinq chemins testés (`/mentions-legales`, `/legal`, `/politique-de-confidentialite`, `/contact`, `/nous-connaitre`), aucune adresse postale publiée. À noter au passage, sur le fond commercial : le site propose explicitement une immatriculation de plateforme agréée en marque blanche à d'autres acteurs — posture de grossiste à qualifier dans un lot 360.
- **NEOTIMO** : le domaine renvoie une **erreur 500** à chaque requête, sur la racine comme sur les chemins légaux, et l'archive publique disponible ne contient pas de page légale.

Aucun rapprochement sur le nom n'a été tenté sur ces deux cas.

## Deux erreurs évitées pendant la rédaction du patch

1. **`natureEntite` n'est pas la forme juridique.** J'ai d'abord voulu y écrire « Association loi 1901 » pour jefacture.com. C'est une **facette à valeurs contraintes** (`creee_pour_rfe`, `extension_demat`, `diversification`) qui qualifie la logique de positionnement sur la réforme. Le patch aurait cassé le filtre du hub. Application directe de la règle 23 : tout nouveau bloc se vérifie contre le format lu par le moteur d'affichage.
2. **L'adresse DGFiP prime.** Les 7 fiches portaient déjà une adresse issue du relevé DGFiP — pour AXWAY, « 1 bis place de la Défense, 92035 Paris La Défense », très différente du siège INSEE d'Annecy. Le patch n'écrit aucune adresse : les sièges relevés sont consignés dans les preuves de sources (règle 18).

## Correction d'un chiffre de contrôle annoncé plus tôt

Le fichier `ORDRE-DE-FUSION.md` livré à 18h52 annonçait, après la série complète de patches, « 51 fiches avec `analyse360` » et « 85 fiches avec SIREN ». Ces deux valeurs étaient fausses : la simulation cumulative complète, patch par patch, donne **43 fiches avec `analyse360`** et **98 fiches avec SIREN** au terme de `patch-PAYS-16.json`. Le 85 avait été calculé sur un instantané partiel du référentiel, le 51 était une valeur héritée d'un décompte antérieur jamais revérifié.

Après le présent patch : **105 fiches avec SIREN**, **47 fiches avec `analyse360`**, dont **35 avec un bloc `poidsEconomique`**.

## Ce que cette passe ouvre

- **ICD International** et **NEOTIMO** : à reprendre par une route non web — publication au BODACC, dépôt Peppol, ou le nom d'entité tel qu'il figure sur un document contractuel public.
- **Étages non ouverts** ajoutés à la file : JFD CONSEIL (président de NEXCER), l'actionnariat de SPEE, le lien éventuel entre FACTUALI et l'éditeur polonais du même logiciel — indice technique relevé (hébergeur d'actifs commun), lien capitalistique **non** établi, donc non publié (règle 29).
- **74SOFTWARE** mérite une fiche 360 complète : ETI cotée, 461,9 M€, cible grands comptes, en concurrence frontale sur l'intégration de flux.
- **FITECO** et **ECMA** confirment un motif déjà vu avec CENSE, MY FITECO et Dougs : **la profession comptable est un bloc de concurrents à part entière**, avec des réseaux de plusieurs centaines d'établissements et des dizaines de milliers de TPE-PME captives.
