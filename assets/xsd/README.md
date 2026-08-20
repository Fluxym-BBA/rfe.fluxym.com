# assets/xsd — copies miroir des schémas UBL 2.1

Ce dossier héberge une copie **inchangée** des schémas XSD officiels OASIS, afin que
les boutons « ⬇️ Télécharger le .xsd » de `tutoriels.html` déclenchent un vrai
téléchargement (même origine, nom de fichier correct) au lieu d'ouvrir le XML dans
le navigateur.

## Fichiers attendus

| Fichier | Source officielle | Taille |
|---|---|---|
| `UBL-Invoice-2.1.xsd` | https://docs.oasis-open.org/ubl/os-UBL-2.1/xsd/maindoc/UBL-Invoice-2.1.xsd | 58 Ko |
| `UBL-CreditNote-2.1.xsd` | https://docs.oasis-open.org/ubl/os-UBL-2.1/xsd/maindoc/UBL-CreditNote-2.1.xsd | 56 Ko |

Release OASIS Standard UBL 2.1, publiée le 04/11/2013 — URL et contenu figés.
Aucune modification ne doit être apportée à ces fichiers : ce sont des copies à
l'octet près, la source officielle reste OASIS.

## Comportement si un fichier est absent

`js/tuto-download.js` applique une chaîne de repli :

1. copie locale `./assets/xsd/<fichier>` (même origine, toujours autorisée) ;
2. à défaut, `fetch` de l'URL OASIS (dépend des en-têtes CORS du serveur) ;
3. à défaut, ouverture de l'URL officielle dans un nouvel onglet avec un message
   invitant à enregistrer via Ctrl+S / Cmd+S.

Le site reste donc fonctionnel sans ces copies, simplement moins confortable.

## Mise à jour

Ces schémas correspondent à UBL 2.1, version normative utilisée par la réforme
française (EN 16931 / profil étendu CTC FR). Ils ne changent pas : ne les
remplacer qu'en cas de passage documenté à une autre version d'UBL.

Le dossier `common/` d'OASIS (schémas inclus par les `maindoc`) n'est
volontairement pas miroité ici : pour une validation XSD complète dans VS Code,
récupérer le package `UBL-2.1.zip` (55 Mo) et conserver son arborescence.
