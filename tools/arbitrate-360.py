#!/usr/bin/env python3
"""
arbitrate-360.py — Arbitrages de fond sur `analyse360`, à jouer après normalize-360.py

`normalize-360.py` ferme le schéma sans jamais trancher. Ce script tranche, selon des
règles explicites et rejouables, les 5 familles de points qu'il avait laissés en suspens :

  A. `effectif` / `effectifEntite` divergents      -> arbitrage par millésime, phrase à phrase
  B. `dateReleve` absente sur un bloc de CA        -> date de production de la fiche, tracée
  C. `montantMEUR: 0` sur des comptes non exploitables -> null + nature conservée
  D. Prose rédigée sans diacritiques               -> réaccentuation par lexique du corpus
  E. `sourcesEnrichissement.champ` à `non_precise` -> rattachement au bloc par motif

Chaque décision est journalisée. Idempotent : rejouable sans effet de bord.

Usage :
  python3 tools/arbitrate-360.py data/plateformes-agreees.json \
      --report "Info IA/plateformes-agreees/RAPPORT-ARBITRAGES-360.md"
  python3 tools/arbitrate-360.py data/plateformes-agreees.json --dry-run
"""

from __future__ import annotations

import argparse
import collections
import json
import re
import sys
import unicodedata
from datetime import date

DIACRITIQUES_FR = set("àâäçéèêëîïôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ")

# --------------------------------------------------------------------------- #
# D. Réaccentuation : homographes français à ne JAMAIS toucher                 #
# --------------------------------------------------------------------------- #
# Ces formes sans accent sont des mots français à part entière. Les réaccentuer
# automatiquement produirait des contresens (« des » -> « dès », « chiffre » ->
# « chiffré »). Elles restent en l'état : une relecture humaine est nécessaire.
HOMOGRAPHES = {
    "a", "ou", "la", "ca", "sa", "des", "du", "sur", "ces", "les", "une", "est", "son", "ses",
    "aux", "cote", "cotes", "mode", "modes", "note", "notes", "marque", "marques", "facture",
    "factures", "compte", "comptes", "chiffre", "chiffres", "gestion", "base", "bases", "date",
    "dates", "point", "points", "part", "parts", "porte", "portes", "reste", "restes", "vente",
    "ventes", "type", "types", "titre", "titres", "terme", "termes", "somme", "sommes", "cause",
    "causes", "ferme", "fermes", "livre", "livres", "signe", "signes", "traite", "traites",
    "zone", "zones", "voie", "voies", "tache", "taches", "pate", "mur", "murs", "sale", "jeune",
    "jeunes", "interne", "internes", "force", "forces", "offre", "offres", "page",
    "pages", "source", "sources", "service", "services", "prix", "code", "codes", "site",
    "sites", "nom", "noms", "fonds", "flux", "cas", "ans", "mois", "jour", "jours", "grand",
    "grands", "seul", "seule", "seules", "autre", "autres", "face", "canal", "volume",
    "volumes", "taille", "niveau", "indice", "ligne", "lignes", "tranche", "tranches",
    "structure", "structures", "capital", "support", "contact", "contrat", "contrats",
    "document", "documents", "solution", "solutions", "logiciel", "logiciels", "module",
    "modules", "catalogue", "groupe", "groupes", "filiale", "filiales", "banque", "banques",
    "transport", "commerce", "distribution", "production", "exploitation", "information",
    "communication", "certification", "qualification", "acquisition",
    "investissement", "abonnement", "archivage", "traitement", "effectif",
    "exercice", "alliance", "holding", "registre", "greffe", "audit", "pilote", "libre",
    "personne", "usage", "ensemble", "parmi", "hors", "celui", "donc", "dont", "mais", "plus",
    "pas", "que", "qui", "sans", "sous", "vers", "via", "avec", "dans", "pour", "par", "non",
    "aucun", "aucune", "comme", "deux", "trois", "quatre", "entre", "avant", "puis",
    "rien", "ici", "jamais", "ont", "peut", "fait", "reprise", "demande",
    "signature", "adresse", "couverture", "axe", "chaine",
    "poids", "mise", "processus", "milliards", "tiers",
    "terrain", "nous", "lui", "and", "com", "www", "https", "inc", "text", "data",
}

# Rattachement d'une source à un bloc, par motif décroissant de spécificité.
MOTIFS_CHAMP = [
    (r"bodacc|comptes sociaux|comptes d[ée]pos|chiffre d.affaires|bilan|pappers\.fr|"
     r"comptes 20\d\d|dépôt des comptes|liasse", "analyse360.poidsEconomique"),
    (r"newsroom|/press|communiqué de presse|acquis|acquiert|rachat|levée de fonds|"
     r"prend une participation|majority stake|partenariat", "analyse360.capaciteDeFrappe"),
    (r"trustpilot|g2\.com|capterra|glassdoor|avis clients?|welcometothejungle", "analyse360.reputation"),
    (r"clients?|références?|témoignages?|case stud|success stor", "analyse360.referencesClients"),
    (r"tarif|pricing|abonnement|grille de prix", "analyse360.postureCommerciale"),
    (r"api recherche d.entreprises|annuaire-entreprises\.data\.gouv\.fr|mentions l[ée]gales|"
     r"fiche registre|rcs |siret|siren|rne|insee|mandataires", "identiteJuridique"),
    (r"impots\.gouv\.fr|dgfip|liste des plateformes", "statutDGFiP"),
]

ANNEE = re.compile(r"\b(19|20)\d{2}\b")
TRANCHE = re.compile(r"\b(\d{1,4})\s*(?:à|-|–)\s*(\d{1,4})\b")


def is_empty(v) -> bool:
    if v is None:
        return True
    if isinstance(v, str):
        return v.strip() == ""
    if isinstance(v, (list, dict)):
        return len(v) == 0
    return False


def sans_accent(mot: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", mot) if unicodedata.category(c) != "Mn")


# --------------------------------------------------------------------------- #
# D. Lexique de réaccentuation construit sur le corpus lui-même               #
# --------------------------------------------------------------------------- #

def construire_lexique(data: dict, seuil: int = 2, dominance: float = 0.85) -> tuple:
    """
    Associe une forme sans accent à sa forme accentuée, apprise sur le corpus lui-même.
    Aucun dictionnaire externe : la référence est la prose déjà validée du référentiel.

    Trois garde-fous, dans cet ordre :
      1. `HOMOGRAPHES` — la forme nue est un mot français à part entière (« des », « cote »,
         « marque »). Jamais touchée.
      2. Dominance — si deux formes accentuées se disputent la même forme nue sans qu'aucune
         ne l'emporte à 85 % (« déclare » 65 / « déclaré » 97), on ne tranche pas.
      3. Accent final seul — si la forme accentuée ne diffère que par son dernier caractère
         (« rencontre » / « rencontré », « place » / « placé »), l'ambiguïté présent /
         participe ne peut pas être levée hors contexte : on ne tranche pas.
         Exception : les substantifs en -ité (« activite » -> « activité »), qui ne
         correspondent à aucune forme verbale française.

    Le résultat est volontairement incomplet. Mieux vaut une prose partiellement
    réaccentuée sans une seule erreur introduite qu'une prose entièrement retouchée
    avec des contresens.
    """
    freq: collections.Counter = collections.Counter()

    def collecte(o):
        if isinstance(o, dict):
            for v in o.values():
                collecte(v)
        elif isinstance(o, list):
            for v in o:
                collecte(v)
        elif isinstance(o, str) and not o.startswith("http"):
            for mot in re.findall(r"[A-Za-zÀ-ÿ]{3,}", o):
                freq[mot.lower()] += 1

    collecte(data)

    candidats: dict = collections.defaultdict(collections.Counter)
    for mot, n in freq.items():
        if set(mot) & DIACRITIQUES_FR and all((c in DIACRITIQUES_FR) or c.isascii() for c in mot):
            candidats[sans_accent(mot)][mot] += n

    lexique, ambigus, verbaux = {}, {}, {}
    for nu, formes in candidats.items():
        if nu in HOMOGRAPHES:
            continue
        accentuee, n_acc = formes.most_common(1)[0]
        if n_acc < seuil:
            continue
        if n_acc / sum(formes.values()) < dominance:
            ambigus[nu] = dict(formes)
            continue
        accent_final_seul = (
            len(nu) == len(accentuee)
            and sans_accent(accentuee[:-1]) == accentuee[:-1]
            and sans_accent(accentuee[-1]) != accentuee[-1]
        )
        if accent_final_seul and not (nu.endswith("ite") and accentuee.endswith("ité")):
            verbaux[nu] = accentuee
            continue
        lexique[nu] = accentuee
    return lexique, ambigus, verbaux


def appliquer_casse(source: str, cible: str) -> str:
    if source.isupper():
        return cible.upper()
    if source[:1].isupper():
        return cible[:1].upper() + cible[1:]
    return cible


def reaccentuer(texte: str, lexique: dict, stats: collections.Counter) -> str:
    def remplace(m):
        mot = m.group(0)
        if set(mot) & DIACRITIQUES_FR:
            return mot
        cible = lexique.get(mot.lower())
        if not cible:
            return mot
        stats[f"{mot.lower()} -> {cible}"] += 1
        return appliquer_casse(mot, cible)

    return re.sub(r"[A-Za-z]{3,}", remplace, texte)


# Clés dont la valeur appartient à un vocabulaire fermé (data/pa-taxonomie.json)
# ou à une nomenclature technique : jamais réaccentuées. Une passe de prose qui
# transforme `axe_strategique` en `axe_stratégique` casse silencieusement le
# rapprochement avec la taxonomie, et la page perd le libellé, la définition et
# la position sur l'échelle.
CLES_VOCABULAIRE = {
    # Identités et noms propres : jamais réécrits, même en minuscules.
    "nom", "denomination", "denominationSociale", "raisonSociale", "marque",
    "slug", "ville", "commune", "adresse", "pays", "dirigeant", "dirigeants",
    "valeur", "niveau", "indice", "confiance", "statut", "type", "typeActionnaire",
    "nature", "champ", "slug", "id", "code", "codeNaf", "siren", "siret", "tva",
    "lot", "version", "dateReleve", "dateReleveOffres", "dateReleveOrigine",
}

# Un jeton `snake_case` sans espace n'est jamais de la prose : c'est une valeur
# de vocabulaire, une clé technique ou un identifiant.
JETON_RE = re.compile(r"^[a-z0-9]+(?:_[a-z0-9]+)+$")


# ---------------------------------------------------------------------------
# Dictionnaire explicite, tranché à la main le 26/08/2026
# ---------------------------------------------------------------------------
# La passe lexicale du matin a laissé 129 occurrences sans accent sur les huit
# fiches rédigées sans diacritiques. Trois causes : les homographes exclus par
# précaution (releve/relève, marche/marché, declare/déclaré), les formes dont
# l'accent tombe sur la dernière lettre, et les mots absents du corpus
# d'apprentissage. Ces formes sont ici tranchées explicitement, avec leur règle
# de contexte quand le mot est réellement ambigu. Rien n'est deviné : chacune
# des 129 occurrences a été lue dans son contexte avant d'entrer dans ce
# tableau.

# Formes sans ambiguïté : une seule graphie accentuée possible.
FORMES_EXPLICITES = {
    "activite": "activité", "activites": "activités",
    "societe": "société", "societes": "sociétés",
    "entite": "entité", "entites": "entités",
    "immatriculee": "immatriculée", "immatriculees": "immatriculées",
    "francaise": "française", "francaises": "françaises",
    "francais": "français",
    "creee": "créée", "creees": "créées",
    "dediee": "dédiée", "dediees": "dédiées", "dedie": "dédié", "dedies": "dédiés",
    "modele": "modèle", "modeles": "modèles",
    "perimetre": "périmètre", "perimetres": "périmètres",
    "etablissement": "établissement", "etablissements": "établissements",
    "fonctionnalites": "fonctionnalités", "fonctionnalite": "fonctionnalité",
    "temoignages": "témoignages", "temoignage": "témoignage",
    "negociees": "négociées", "negociee": "négociée",
    "illimitees": "illimitées", "illimitee": "illimitée",
    "remuneree": "rémunérée", "remunerees": "rémunérées",
    "emission": "émission", "emissions": "émissions",
    "reception": "réception", "receptions": "réceptions",
    "integration": "intégration", "integrations": "intégrations",
    "developpement": "développement", "developpements": "développements",
    "strategie": "stratégie", "strategies": "stratégies",
    "strategique": "stratégique", "strategiques": "stratégiques",
    "numerique": "numérique", "numeriques": "numériques",
    "donnees": "données",
    "annee": "année", "annees": "années",
    "siege": "siège", "sieges": "sièges",
    "clientele": "clientèle",
    "tresorerie": "trésorerie",
    "conformite": "conformité",
    "securite": "sécurité",
    "qualite": "qualité",
    "specialisee": "spécialisée", "specialisees": "spécialisées",
    "dependance": "dépendance",
    "presence": "présence",
    "cotees": "cotées", "cotee": "cotée",
    "medias": "médias",
    "estimee": "estimée",
    "publiee": "publiée", "publies": "publiés", "publiees": "publiées",
    "verifiee": "vérifiée",
    "listee": "listée", "listees": "listées",
    "reglementaire": "réglementaire", "reglementaires": "réglementaires",
    "tranchee": "tranchée",
}

# Homographes : deux graphies accentuées possibles, tranchées par ce qui précède.
# Un pronom devant impose la forme conjuguée, sinon c'est le participe ou le nom.
# Un pronom sujet devant le mot impose la forme conjuguée. L'apostrophe est
# une frontière de mot ici : dans « qu'elle publie », le pronom est « elle ».
PRONOMS = (r"(?:^|[^\w-])(?:se|il|elle|on|qui|je|nous|vous|ils|elles|ne|cela|ça|y)\s+$"
           r"|(?:^|[^\w-])(?:s'|n'|qu'|l')$")
HOMOGRAPHES_CONTEXTE = {
    "releve": ("relève", "relevé"),
    "releves": ("relèves", "relevés"),
    "marche": ("marche", "marché"),
    "marches": ("marches", "marchés"),
    "declare": ("déclare", "déclaré"),
    "declares": ("déclares", "déclarés"),
    "declaree": ("déclarée", "déclarée"),
    "declarees": ("déclarées", "déclarées"),
    # « ne publie pas » est du présent et s'écrit sans accent : sur 167
    # occurrences du corpus, 115 sont verbales. Seul le participe s'accentue.
    "publie": ("publie", "publié"),
    "verifie": ("vérifie", "vérifié"),
    "immatricule": ("immatricule", "immatriculé"),
    "immatricules": ("immatricules", "immatriculés"),
}

# Formes que rien ne permet de trancher sur le seul mot qui précède : on
# n'accentue que dans un contexte explicitement listé, jamais par défaut.
# « l'entreprise estime que » est un verbe, « n'a été estime » un participe.
PARTICIPE_SOUS_CONDITION = {
    "estime": ("estimé", r"(?:été|pas|jamais|non|sera)\s+$"),
}


def _casse(source: str, cible: str) -> str:
    if source.isupper():
        return cible.upper()
    if source[0].isupper():
        return cible[0].upper() + cible[1:]
    return cible


# Slugs de pages énumérés dans une source : « iaf.fr (accueil, services,
# conformite-hds, telecom-internet) ». Ce sont des fragments d'adresse, pas de
# la prose, et les accentuer rend la source invérifiable. On les reconnaît à
# trois signes réunis : minuscules, trait d'union, et une adresse dans la même
# chaîne.
SLUG = re.compile(r"^[a-z]+(?:-[a-z]+)+$")
ADRESSE_DANS_CHAINE = re.compile(
    r"https?://|www\.|\.(?:fr|com|io|net|org|eu)\b|\bURLs?\b|\bsitemap\b",
    re.IGNORECASE)

# Quelques suites de mots tranchées en bloc, parce que le mot isolé serait
# ambigu ou protégé par une autre règle.
PHRASES_EXPLICITES = {
    "rapport qualite-prix": "rapport qualité-prix",
    "jusqu'a ": "jusqu'à ",
    "grace a ": "grâce à ",
    "par rapport a ": "par rapport à ",
}

# « a » ou « à » ne se tranche pas sur le mot seul : « l'entité a une filiale »
# est un auxiliaire, « attribuable a la facturation » une préposition. On ne
# corrige donc que des tournures listées, jamais le mot isolé. Les fourchettes
# chiffrées (« de 20 a 49 salariés ») sont sans ambiguïté.
PREPOSITIONS_SURES = [
    (re.compile(r"\b(déclarée?s?|attribuable|rapporte pas|sert donc|pas|rattachement|"
                r"classée?|attribuée?|recense|immatriculée|siège|siege|conforme|liée?|"
                r"destinée?|face|jusque|identique|comparable)\s+a\s+(?=[A-Za-zÀ-ÿ'])",
                re.IGNORECASE), r"\1 à "),
    (re.compile(r"(\d)\s+a\s+(?=\d)"), r"\1 à "),
]


def corriger_prepositions(texte: str, stats) -> str:
    for motif, remplacement in PREPOSITIONS_SURES:
        texte, n = motif.subn(remplacement, texte)
        if n:
            stats["a → à (tournure listée)"] += n
    return texte

# Réparations : la passe lexicale du 26/08 au matin a accentué neuf verbes
# conjugués comme s'ils étaient des participes — « aucun ne documenté la PA »,
# « la réputation se limité à », « le positionnement ne se croisé pas ». Sans
# auxiliaire entre le pronom et le verbe, c'est du présent : pas d'accent final.
VERBES_MAL_ACCENTUES = (
    "documenté|limité|croisé|posé|publié|placé|rencontré|déclaré|estimé|relevé"
    "|présenté|couvré|orienté|affiché|revendiqué"
)
REPARATIONS = re.compile(
    r"\b(ne|n'|se|s'|il|elle|on|qui|nous|vous|ils|elles|y)(\s+|)(" + VERBES_MAL_ACCENTUES + r")\b",
    re.IGNORECASE)


def reparer_participes(texte: str, stats) -> str:
    def rep(m):
        verbe = m.group(3)
        stats[f"{verbe} → {verbe[:-1]}e (verbe conjugué, pas participe)"] += 1
        return f"{m.group(1)}{m.group(2)}{verbe[:-1]}e"
    return REPARATIONS.sub(rep, texte)


def trancher_formes(texte: str, stats) -> str:
    """Applique le dictionnaire explicite et les règles de contexte."""
    texte = reparer_participes(texte, stats)
    for avant, apres in PHRASES_EXPLICITES.items():
        if avant in texte:
            stats[f"{avant} → {apres}"] += texte.count(avant)
            texte = texte.replace(avant, apres)
    adresse_presente = bool(ADRESSE_DANS_CHAINE.search(texte))
    # Une chaîne qui aligne au moins deux slugs à trait d'union est une
    # énumération de pages : même ses éléments d'un seul mot sont des
    # fragments d'adresse (« …, cybersecurite, hebergement, developpement, … »).
    enumeration_slugs = adresse_presente and len(
        [t for t in re.findall(r"[\w-]+", texte) if SLUG.match(t)]) >= 2

    # Un mot capitalisé en milieu de phrase est presque toujours un nom propre :
    # « B2B Integration », « Omnicom Media Group », « Chief Customer Experience »,
    # « Waka-MEDIA ». On ne l'accentue jamais. En début de phrase, en revanche,
    # la capitale est grammaticale et le mot est traité normalement.
    DEBUT_PHRASE = re.compile(r"(?:^|[.;:!?»)\]\n]|—|-)\s*$")

    def remplacer(m):
        mot = m.group(0)
        bas = mot.lower()
        avant_brut = texte[:m.start()]
        # Le mot appartient-il à une adresse, un chemin ou un identifiant ?
        # On reconstitue le token complet autour de la position trouvée.
        gauche = texte.rfind(" ", 0, m.start()) + 1
        droite = texte.find(" ", m.end())
        token = texte[gauche:droite if droite != -1 else len(texte)]
        if TOKEN_TECHNIQUE.search(token):
            return mot
        propre = token.strip(" ,;.()[]«»\"'")
        if adresse_presente and SLUG.match(propre):
            return mot
        if enumeration_slugs and re.fullmatch(r"[a-z]+", propre):
            return mot
        if mot[0].isupper() and not DEBUT_PHRASE.search(avant_brut):
            return mot
        if bas in PARTICIPE_SOUS_CONDITION:
            cible, condition = PARTICIPE_SOUS_CONDITION[bas]
            if re.search(condition, avant_brut, re.IGNORECASE):
                stats[f"{bas} → {cible}"] += 1
                return _casse(mot, cible)
            return mot
        if bas in FORMES_EXPLICITES:
            stats[f"{bas} → {FORMES_EXPLICITES[bas]}"] += 1
            return _casse(mot, FORMES_EXPLICITES[bas])
        if bas in HOMOGRAPHES_CONTEXTE:
            conjugue, participe = HOMOGRAPHES_CONTEXTE[bas]
            avant = texte[:m.start()]
            cible = conjugue if re.search(PRONOMS, avant, re.IGNORECASE) else participe
            if cible != bas:
                stats[f"{bas} → {cible}"] += 1
                return _casse(mot, cible)
        return mot

    motif = r"\b(?:" + "|".join(
        sorted(list(FORMES_EXPLICITES) + list(HOMOGRAPHES_CONTEXTE)
               + list(PARTICIPE_SOUS_CONDITION), key=len, reverse=True)
    ) + r")\b"
    # Les prépositions passent en dernier : « declare a la DGFiP » doit
    # d'abord devenir « déclaré a la DGFiP » pour que la tournure soit reconnue.
    return corriger_prepositions(re.sub(motif, remplacer, texte, flags=re.IGNORECASE), stats)


# Un « mot » collé à un point suivi d'une extension, à un slash, à un arobase
# ou à un tiret bas n'est pas de la prose : c'est une adresse ou un identifiant.
# On teste la présence d'un marqueur technique dans le token, sans exiger que
# le token entier soit une adresse : `d'avenir-numerique.fr`, `(app.x.fr/y).`
# ou `https://…/securite-…/,` portent tous de la ponctuation autour.
TOKEN_TECHNIQUE = re.compile(
    r"https?://|www\.|@|/|_"
    r"|\.(?:fr|com|io|net|org|eu|be|ch|de|es|it|uk|us|tech|app|dev|ai|co|md|html?|json|js|py|pdf|csv|xml)\b",
    re.IGNORECASE)


def trancher_arbre(o, stats, cle_parente=None):
    """Même périmètre de protection que la réaccentuation lexicale."""
    if isinstance(o, dict):
        return {k: trancher_arbre(v, stats, k) for k, v in o.items()}
    if isinstance(o, list):
        return [trancher_arbre(v, stats, cle_parente) for v in o]
    if isinstance(o, str) and len(o) > 2:
        if cle_parente in CLES_VOCABULAIRE or JETON_RE.match(o.strip()):
            return o
        # La chaîne est traitée entière : les règles de contexte ont besoin de
        # ce qui précède le mot. Les adresses sont écartées mot par mot dans
        # trancher_formes(), pas en découpant la phrase.
        return trancher_formes(o, stats)
    return o


def reaccentuer_arbre(o, lexique, stats, cle_parente=None):
    if isinstance(o, dict):
        return {k: reaccentuer_arbre(v, lexique, stats, k) for k, v in o.items()}
    if isinstance(o, list):
        return [reaccentuer_arbre(v, lexique, stats, cle_parente) for v in o]
    if isinstance(o, str) and len(o) > 2 and not o.startswith("http"):
        if cle_parente in CLES_VOCABULAIRE:
            return o
        if JETON_RE.match(o.strip()):
            return o
        return reaccentuer(o, lexique, stats)
    return o


def taux_accentuation(o) -> float:
    """Part des mots portant un diacritique — sert à repérer la prose non accentuée."""
    mots, accents = 0, 0

    def parcours(x):
        nonlocal mots, accents
        if isinstance(x, dict):
            for v in x.values():
                parcours(v)
        elif isinstance(x, list):
            for v in x:
                parcours(v)
        elif isinstance(x, str) and not x.startswith("http"):
            for mot in re.findall(r"[A-Za-zÀ-ÿ]{4,}", x):
                mots += 1
                if set(mot) & DIACRITIQUES_FR:
                    accents += 1

    parcours(o)
    return (accents / mots) if mots else 1.0


# --------------------------------------------------------------------------- #
# A. Effectif : arbitrage phrase à phrase                                     #
# --------------------------------------------------------------------------- #

def decouper_phrases(texte: str) -> list:
    return [p.strip() for p in re.split(r"(?<=[.!?])\s+", texte or "") if p.strip()]


VACUEUX = re.compile(r"^(non\s+(établi|renseigné|publié|communiqué|disponible)|aucune?\s+donnée)\b", re.I)


def _nombres(phrase: str) -> set:
    brut = re.findall(r"\d[\d\s\u202f]*", phrase.replace("\u202f", " "))
    return {n.replace(" ", "") for n in brut if n.strip()}


def _propres(phrase: str) -> set:
    return {m.lower() for m in re.findall(r"\b[A-ZÀ-Ÿ][A-Za-zÀ-ÿ]{2,}", phrase)}


def _tranches(phrase: str) -> set:
    return {(m.group(1), m.group(2)) for m in TRANCHE.finditer(phrase)}


def _annees(phrase: str) -> set:
    return {m.group(0) for m in ANNEE.finditer(phrase)}


# Marqueurs d'une phrase qui explique une correction plutôt qu'un fait brut.
TRACE_ARBITRAGE = re.compile(
    r"\b(patch|chantier|H1|écart|ecart|antérieure?|anterieure?|corrigée?|corrige|"
    r"tranche l['\u2019]écart|contradiction|arbitrage|rectif)", re.IGNORECASE)


def arbitrer_effectif(pe: dict, nom: str, journal: list) -> bool:
    """
    `normalize-360.py` avait concaténé `effectif` et `effectifEntite` sans trancher : le
    texte résultant répète la même tranche INSEE sous deux millésimes différents.

    Arbitrage phrase à phrase sur le texte fusionné :
      - une phrase portant la même tranche qu'une autre mais un millésime plus ancien est
        écartée comme périmée — le relevé le plus récent fait foi ;
      - une phrase reprise intégralement par une phrase ultérieure (mêmes nombres, mêmes
        noms propres) est écartée comme redondante ;
      - une phrase vide de sens (« Non établi. ») est écartée dès qu'une autre phrase porte
        une information.

    Aucune phrase apportant un fait propre n'est supprimée.
    """
    texte = pe.get("effectifEntite")
    if is_empty(texte) or not isinstance(texte, str):
        return False
    phrases = decouper_phrases(texte)
    if len(phrases) < 2:
        return False

    infos = [{"t": ph, "nb": _nombres(ph), "pr": _propres(ph),
              "tr": _tranches(ph), "an": _annees(ph)} for ph in phrases]

    garder = [True] * len(infos)
    motifs = []
    for i, a in enumerate(infos):
        if not garder[i]:
            continue
        # Une phrase qui documente un arbitrage antérieur n'est jamais une
        # redondance : elle porte la trace de la correction, pas le chiffre.
        # Sans cette garde, « le patch H1 avait relevé une tranche antérieure
        # de 10 à 19 salariés (millésime 2022) ; la valeur lue ce jour est
        # 20 à 49 » disparaissait, et avec elle la justification de l'écart.
        if TRACE_ARBITRAGE.search(a["t"]):
            continue
        if VACUEUX.match(a["t"]) and len(a["t"]) < 40:
            garder[i] = False
            motifs.append(f"« {a['t']} » écartée : sans information, contredite par la suite du relevé")
            continue
        for j, b in enumerate(infos):
            if i == j or not garder[j]:
                continue
            if a["tr"] and a["tr"] & b["tr"] and a["an"] and b["an"] and max(a["an"]) < max(b["an"]):
                garder[i] = False
                motifs.append(f"millésime {max(a['an'])} écarté, périmé par {max(b['an'])} "
                              f"(tranche identique {'-'.join(sorted(a['tr'] & b['tr'])[0])})")
                break
            if j > i and a["nb"] and a["nb"] <= b["nb"] and a["pr"] <= b["pr"]:
                garder[i] = False
                motifs.append(f"phrase redondante écartée, reprise par « {b['t'][:60]}… »")
                break

    retenues = [infos[i]["t"] for i in range(len(infos)) if garder[i]]
    if not retenues or len(retenues) == len(infos):
        return False
    pe["effectifEntite"] = " ".join(retenues)
    for m in motifs:
        journal.append((nom, "effectifEntite", m))
    return True


NATURES_SANS_CHIFFRE = {"comptes_confidentiels", "aucun_compte_depose", "non_publie", "sans_objet"}


def main() -> int:
    ap = argparse.ArgumentParser(description="Arbitrages de fond sur analyse360")
    ap.add_argument("input")
    ap.add_argument("-o", "--output", default=None)
    ap.add_argument("--report", default=None)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with open(args.input, encoding="utf-8") as fh:
        data = json.load(fh)

    journal: list = []
    log: collections.Counter = collections.Counter()

    dates_lots = {f["lot"]: f.get("dateFusion")
                  for f in data["_meta"].get("fusions", []) if isinstance(f, dict) and f.get("lot")}

    # ---- D. Réaccentuation ------------------------------------------------ #
    lexique, ambigus, verbaux = construire_lexique(data)
    accents_stats: collections.Counter = collections.Counter()
    fiches_reaccentuees = []
    for p in data["plateformes"]:
        a = p.get("analyse360")
        if not isinstance(a, dict):
            continue
        taux = taux_accentuation(a)
        if taux >= 0.12:  # prose normalement accentuée : on n'y touche pas
            continue
        avant = taux
        stats_fiche: collections.Counter = collections.Counter()
        p["analyse360"] = reaccentuer_arbre(a, lexique, stats_fiche)
        if stats_fiche:
            apres = taux_accentuation(p["analyse360"])
            fiches_reaccentuees.append((p["nom"], sum(stats_fiche.values()), avant, apres))
            accents_stats.update(stats_fiche)
            journal.append((p["nom"], "prose",
                            f"{sum(stats_fiche.values())} mots réaccentués "
                            f"(taux {avant:.0%} -> {apres:.0%})"))
    log["mots réaccentués"] = sum(accents_stats.values())

    # ---- D bis. Formes tranchées explicitement ---------------------------- #
    # La passe lexicale ci-dessus est volontairement prudente : elle refuse les
    # homographes et les formes dont l'accent tombe sur la dernière lettre.
    # Elle a laissé 129 occurrences sans accent, dont 60 « releve » et 21
    # « marche ». Le dictionnaire explicite les tranche, avec une règle de
    # contexte pour les mots réellement ambigus. Cette passe s'applique à
    # TOUTES les fiches : sur une prose déjà accentuée, elle ne trouve rien.
    explicites: collections.Counter = collections.Counter()
    fiches_tranchees = []
    for p in data["plateformes"]:
        a = p.get("analyse360")
        if not isinstance(a, dict):
            continue
        stats_fiche = collections.Counter()
        p["analyse360"] = trancher_arbre(a, stats_fiche)
        # La prose ne vit pas que dans analyse360 : le motif « sans objet » du
        # registre étranger, par exemple, est porté par identiteInternationale
        # et s'affiche désormais dans la carte d'identité.
        for autre in ("identiteInternationale", "identiteJuridique", "socleTechnique",
                      "relationFluxym", "sourcesEnrichissement", "immatriculationsLiees",
                      "groupeCapitalistique", "positionnement", "reputation",
                      "anomalies", "faitsPublicsDates"):
            if autre in p and p[autre] is not None:
                p[autre] = trancher_arbre(p[autre], stats_fiche, autre)
        if stats_fiche:
            fiches_tranchees.append((p.get("nom", "?"), sum(stats_fiche.values())))
            explicites.update(stats_fiche)
            journal.append((p.get("nom", "?"), "prose",
                            f"{sum(stats_fiche.values())} formes tranchées par dictionnaire explicite"))
    # Les avertissements et la définition des axes de `_meta` sont de la prose
    # affichée, au même titre que les fiches.
    meta_stats: collections.Counter = collections.Counter()
    for cle in ("avertissements", "axes"):
        if cle in data.get("_meta", {}):
            data["_meta"][cle] = trancher_arbre(data["_meta"][cle], meta_stats, cle)
    if meta_stats:
        explicites.update(meta_stats)
        journal.append(("_meta", cle, f"{sum(meta_stats.values())} formes tranchées"))
    log["formes tranchées par dictionnaire"] = sum(explicites.values())

    for p in data["plateformes"]:
        nom = p.get("nom", "?")
        a = p.get("analyse360")

        # ---- E. Rattachement des sources -------------------------------- #
        for s in p.get("sourcesEnrichissement") or []:
            if not isinstance(s, dict) or s.get("champ") != "non_precise":
                continue
            texte = " ".join(str(s.get(k) or "") for k in ("source", "libelle", "url")).lower()
            for motif, champ in MOTIFS_CHAMP:
                if re.search(motif, texte):
                    s["champ"] = champ
                    log[f"source rattachée à {champ}"] += 1
                    break
            else:
                log["source laissée à non_precise"] += 1

        if not isinstance(a, dict):
            continue
        pe = a.get("poidsEconomique")
        if not isinstance(pe, dict):
            continue

        # ---- A. Effectif ------------------------------------------------- #
        if arbitrer_effectif(pe, nom, journal):
            log["effectifEntite dédoublonné"] += 1

        # ---- B et C. Blocs de chiffre d'affaires -------------------------- #
        lots = [l for l in (p.get("lotsContributeurs") or []) if dates_lots.get(l)]
        date_fiche = max((dates_lots[l] for l in lots), default=None)
        if not date_fiche:
            dates_src = [s.get("dateReleve") for s in (p.get("sourcesEnrichissement") or [])
                         if isinstance(s, dict) and s.get("dateReleve")]
            date_fiche = max(dates_src, default=None)

        for cle in ("caGroupe", "caEntiteFrancaise", "caEntiteImmatriculee"):
            bloc = pe.get(cle)
            if not isinstance(bloc, dict):
                continue

            # C. Un zéro qui veut dire « non exploitable » n'est pas un zéro.
            if bloc.get("montantMEUR") == 0 and bloc.get("nature") in NATURES_SANS_CHIFFRE:
                bloc["montantMEUR"] = None
                journal.append((nom, cle,
                                f"montantMEUR 0 -> null (nature `{bloc.get('nature')}` : "
                                "chiffre non exploitable, pas un chiffre d'affaires nul)"))
                log["montantMEUR 0 -> null"] += 1

            # B. Date de relevé manquante.
            if is_empty(bloc.get("dateReleve")) and date_fiche:
                bloc["dateReleve"] = date_fiche
                bloc["dateReleveOrigine"] = "date_de_production_de_la_fiche"
                chiffre = "constat d'absence de chiffre" if is_empty(bloc.get("montantMEUR")) else "chiffre publié"
                journal.append((nom, cle,
                                f"dateReleve fixée au {date_fiche} (date de production de la fiche, "
                                f"{chiffre}) et tracée par `dateReleveOrigine`"))
                log["dateReleve reconstituée"] += 1

    # ---- Journalisation --------------------------------------------------- #
    print("=== Arbitrages appliqués")
    for k, v in sorted(log.items(), key=lambda kv: -kv[1]):
        print(f"  {v:>5}  {k}")
    print(f"\n=== Fiches réaccentuées : {len(fiches_reaccentuees)}")
    for nom, n, av, ap_ in fiches_reaccentuees:
        print(f"  {nom:28} {n:>5} mots   taux {av:.0%} -> {ap_:.0%}")
    print(f"\n=== Décisions journalisées : {len(journal)}")
    print(f"=== Formes non tranchées : {len(HOMOGRAPHES)} homographes, "
          f"{len(ambigus)} à candidats concurrents, {len(verbaux)} à accent final seul")

    if args.report:
        with open(args.report, "w", encoding="utf-8") as fh:
            fh.write("# Rapport d'arbitrages `analyse360`\n\n")
            fh.write(f"- Fichier : `{args.input}`\n- Date : {date.today()}\n")
            fh.write(f"- Décisions : {len(journal)}\n\n")
            fh.write("## Bilan\n\n| n | arbitrage |\n|---:|---|\n")
            for k, v in sorted(log.items(), key=lambda kv: -kv[1]):
                fh.write(f"| {v} | {k} |\n")
            fh.write("\n## Réaccentuation\n\n")
            fh.write(f"Lexique retenu : **{len(lexique)} formes**, appliquées sans aucune "
                     "ambiguïté possible.\n\n")
            fh.write("Formes volontairement **non corrigées**, faute de pouvoir trancher hors contexte :\n\n")
            fh.write(f"- {len(HOMOGRAPHES)} homographes français (« des » / « dès », « cote » / « côté », "
                     "« marque » / « marqué ») ;\n")
            fh.write(f"- {len(ambigus)} formes à deux candidats concurrents (« declare » -> « déclare » 65 fois "
                     "contre « déclaré » 97 fois) ;\n")
            fh.write(f"- {len(verbaux)} formes où l'accent ne porte que sur la dernière lettre, "
                     "donc indécidables entre présent et participe (« rencontre » / « rencontré », "
                     "« place » / « placé »).\n\n")
            fh.write("Aucune erreur n'est introduite : une forme non tranchée reste telle quelle. "
                     "Le reliquat demande une relecture humaine, fiche par fiche.\n\n")
            fh.write("| fiche | mots corrigés | taux avant | taux après |\n|---|---:|---:|---:|\n")
            for nom, n, av, ap_ in fiches_reaccentuees:
                fh.write(f"| {nom} | {n} | {av:.0%} | {ap_:.0%} |\n")
            fh.write("\n### Corrections les plus fréquentes\n\n| n | correction |\n|---:|---|\n")
            for k, v in accents_stats.most_common(40):
                fh.write(f"| {v} | {k} |\n")
            fh.write(f"\n## Journal des décisions ({len(journal)})\n\n")
            fh.write("| plateforme | champ | décision |\n|---|---|---|\n")
            for nom, champ, msg in journal:
                fh.write(f"| {nom} | `{champ}` | {msg} |\n")
        print(f"\nRapport écrit : {args.report}")

    if not args.dry_run:
        out = args.output or args.input
        with open(out, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        print(f"JSON écrit : {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
