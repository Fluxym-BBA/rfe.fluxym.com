# H2 — Recensement des groupes portant plusieurs immatriculations

**Date de relevé : 22/08/2026** — Auteur : RFE_WebSite — Chantier H2, première passe.
Patch : `patches/patch-H2-LIAISONS.json` (13 fiches) · Code : `data/pa-taxonomie.json`, `js/pa-detail.js`, `js/pa-hub.js`.

---

## 1. Le résultat en une phrase

**163 entrées ne font pas 163 acteurs.** Six groupes portent deux immatriculations, établies sur pièces. Le décompte
réel d'acteurs distincts est donc **inférieur d'au moins six** au nombre d'entrées, et le recensement n'est pas
terminé : **75 fiches sur 163 n'ont aucun groupe renseigné**.

C'est la première fois que la règle 21 devient une **donnée publiée** et filtrable, et non une note interne.

---

## 2. Les six groupes établis

| Groupe | Immatriculations | Type de liaison | Ce que ça change |
|---|---|---|---|
| **VISMA** (fonds Hg) | CHAINTRUST by Visma + MySupply Aps | deux offres, deux cibles | Le groupe attaque le bas du marché par les cabinets comptables et le haut par les achats publics nordiques. Il possède en plus Inqom, non immatriculé. |
| **AGENA3000** | AGENA 3000 + DOCPROCESS | deux offres, deux cibles | Le socle d'AGENA 3000 est vendu **en gros** à des éditeurs tiers ; DocProcess porte une offre en propre. Deux agréments obtenus à **quatre jours d'intervalle**, avant le rapprochement du 17/09/2025. |
| **Groupe Crédit Agricole** (marque Kolecto) | KOLECTO PDP (11/12/2025) + KOLECTO PA (15/04/2026) | même marque, deux entités | Deux SIREN distincts, deux adresses, une seule offre commerciale. Configuration à surveiller : elle peut préluder à une **bascule** d'une entité vers l'autre. |
| **EDICOM** | EDICOM France + EDICOM Group | entité locale et entité de groupe | Immatriculées **le même jour**. Selon le contrat signé, l'interlocuteur, la langue de service et le droit applicable ne sont pas les mêmes. |
| **ecosio / Vertex** | ECOSIO (Autriche) + ecosio InterCom (Allemagne) | même marque, deux entités | Une offre, deux pays, deux immatriculations, depuis le rapprochement avec Vertex. |
| **Docoon** | DOCOON (Paris) + DOCOON IMMO / FREEDZ (Marseille) | même marque, deux entités | Une maison, deux immatriculations : une généraliste, une dédiée à la verticale immobilière. |

---

## 3. La correction que ce chantier impose

**Le groupe Tessi ne porte pas deux immatriculations.** Cette affirmation, publiée ce matin dans
`NOTE-CERCLE-0-VAGUE-3.md` puis reprise dans `NOTE-CERCLE-0-VAGUE-5.md`, était fausse.

**LE VILLAGE CONNECTE** est une **alliance industrielle** entre trois sociétés indépendantes du monde de l'expertise
comptable — **RCA, ACD et Coaxis** — dans laquelle **Tessi n'intervient qu'en partenaire technique**. Il n'existe qu'une
immatriculation Tessi, celle de TESSI Technologies.

L'erreur venait exactement de ce que la note de la vague 3 annonçait comme limite : un **sondage par mots-clés** sur le
champ `groupeCapitalistique`, présenté comme « un sondage, pas un recensement ». Le mot « Tessi » figurait dans la fiche
du Village Connecté au titre d'un partenariat technique, et le rapprochement automatique en a fait une filiation.
C'est la démonstration de la **règle 24** appliquée aux groupes : *le rapprochement automatique ne produit pas seulement
des trous, il produit des faux*.

La fiche du Village Connecté est corrigée : `relationCapitalistique` passe à `independante` et la liaison est qualifiée
d'`alliance_industrielle`, avec la composition réelle de l'alliance.

---

## 4. Une piste écartée faute de preuve

**SEQINO et TRESO2.** SEQINO est présentée comme une filiale du **Crédit Mutuel Arkéa**. TRESO2 est « adossée à des
partenaires bancaires », dont Arkéa. Ce n'est pas la même chose : un partenariat commercial ou une participation
minoritaire ne fait pas un groupe. Aucune liaison n'est publiée sur ces deux fiches. À vérifier sur la répartition
réelle du capital de TRESO2.

Même prudence pour **EURO INFORMATION** (Crédit Mutuel Alliance Fédérale) : le groupe bancaire est proche d'Arkéa
historiquement, mais ce sont deux ensembles capitalistiques distincts.

---

## 5. Ce que le nouveau champ apporte au site

Un champ `immatriculationsLiees` est ajouté aux fiches concernées, avec :

- le **groupe** de rattachement ;
- la **liste des entrées liées**, affichées comme des liens cliquables vers les autres fiches ;
- le **type de liaison** (facette filtrable `liaisonImmatriculations`, cinq valeurs) ;
- une **lecture** expliquant ce que la double immatriculation change en pratique ;
- la **source** et la date de relevé.

Côté site : la ligne « Autres immatriculations du même groupe » apparaît dans le bloc actionnariat de la fiche, et le
hub gagne un filtre permettant d'isoler ces cas. Un visiteur peut donc, en un clic, voir les groupes qui comptent
double — ce qui n'était visible nulle part jusqu'ici, sur aucun comparateur.

---

## 6. Ce qui manque pour finir le recensement

| État du champ `groupeCapitalistique` | Nombre |
|---|---|
| Renseigné | 88 |
| **Vide** | **75** |

| `relationCapitalistique` | Nombre |
|---|---|
| Non renseigné | 80 |
| `non_determinable` | 43 |
| `filiale_de_groupe` | 14 |
| `holding_non_transparente` | 12 |
| `fonds_PE` | 5 |
| `cotee` | 4 |
| `acquise` | 4 |
| `independante` | 1 |

Autrement dit : sur 163 entrées, **123 n'ont pas de rattachement capitalistique exploitable** (vide ou non
déterminable). Le recensement des groupes ne pourra donc pas être clos avant que ce champ soit travaillé, et il ne peut
l'être qu'entreprise par entreprise, sur les mentions légales et le registre — même méthode que pour les SIREN
manquants, et même ordre de grandeur d'effort.

**Recommandation de séquence** : traiter le rattachement capitalistique **en même temps** que le poids économique
(chantier H1), société par société. Les deux informations se trouvent au même endroit — la fiche registre et les
mentions légales — et une seule passe suffit pour les deux. Cela évite de payer deux fois le coût d'accès.

---

## 7. Trois observations de bord, à ne pas perdre

1. **Hg est présent deux fois dans l'écosystème** : le fonds détient Visma, et il est par ailleurs cité comme partenaire
   au capital de MY UNISOFT, société détenue par environ 140 cabinets d'expertise comptable actionnaires. Ce n'est pas
   une liaison d'immatriculations, mais c'est un point de concentration à connaître.
2. **PAGERO appartient à Thomson Reuters** depuis 2024, et ARRATECH a été fondée par d'anciens dirigeants de Tickstar,
   société rachetée par Pagero. Filiation humaine, pas capitalistique : aucune liaison publiée.
3. **WISETECH GLOBAL** (coté à Sydney) et **GROUPE SIGMA** (français) partagent un mot dans leurs champs de groupe sans
   partager de capital : deuxième faux positif du sondage, écarté au contrôle.
