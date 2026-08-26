#!/usr/bin/env python3
"""
normalize-360.py — Normalisation du bloc `analyse360` de data/plateformes-agreees.json

Objectif : garantir qu'aucune information ne disparaisse à l'affichage sur rfe.fluxym.com.
Le script ferme le schéma des 10 blocs 360 :
  1. il force le TYPE de chaque bloc (toujours le même, jamais str|dict|list selon la fiche) ;
  2. il fusionne les CLÉS SYNONYMES sous un nom canonique unique ;
  3. il déplace toute clé hors vocabulaire dans un bucket `complements` — rien n'est perdu,
     le renderer affiche `complements` en liste générique ;
  4. il normalise les valeurs scalaires ambiguës (notes « 4,4 / 5 » -> 4.4, en gardant le brut) ;
  5. il recalcule `_meta.couverture` et aligne les dates de consolidation.

Idempotent : rejouable sans effet de bord. Non destructif : aucune valeur n'est supprimée.

Usage :
  python3 tools/normalize-360.py data/plateformes-agreees.json
  python3 tools/normalize-360.py data/plateformes-agreees.json -o out.json --report rapport.md
"""

from __future__ import annotations

import argparse
import collections
import json
import re
import unicodedata
import sys
from datetime import date

# --------------------------------------------------------------------------- #
# Schéma cible                                                                #
# --------------------------------------------------------------------------- #

BLOCS = [
    "metierPrincipal",
    "activites",
    "poidsEconomique",
    "centralitePA",
    "postureCommerciale",
    "referencesClients",
    "reputation",
    "capaciteDeFrappe",
    "dynamique",
    "lectureConcurrentielle",
    "droitDeReponse",
]

# Clés autorisées par bloc, dans l'ordre d'affichage souhaité.
SOCLE = {
    "centralitePA": [
        "indice", "valeur", "marqueProduitDediee", "entiteJuridiqueDediee",
        "faisceauIndices", "lecture", "source", "dateReleve", "confiance",
    ],
    "postureCommerciale": [
        "valeur", "modeleTarifaire", "tarifPublie", "offreGratuite",
        "lecture", "preuve", "source", "dateReleve", "confiance",
    ],
    "referencesClients": [
        "nbCiteesSurSite", "perimetre", "parSecteur", "libellesSecteursEditeur",
        "grandsComptes", "referencesPAConfirmees", "lecture", "commentaire",
        "attention", "source", "dateReleve", "confiance",
    ],
    "reputation": [
        "avis", "synthese", "distribution", "lecture", "commentaire",
        "source", "dateReleve", "confiance",
    ],
    "capaciteDeFrappe": [
        "canal", "maillage", "effectifCommercial", "investissementsAnnonces",
        "acquisitions", "financementRecent", "actionnariat", "modeleTarifaire",
        "tarifPublie", "offreGratuite", "lecture", "source", "dateReleve", "confiance",
    ],
    "droitDeReponse": [
        "signale", "date", "objet", "pointsContestables", "canal",
        "lecture", "source", "confiance",
    ],
    "dynamique": [
        "offresEmploiOuvertes", "offresLieesFacturationElectronique", "naturesPostes",
        "mixOffres", "signauxCroissance", "signauxTension", "dateReleveOffres",
        "lecture", "commentaire", "motifBlocPartiel", "source", "dateReleve", "confiance",
    ],
}

# Synonymes -> clé canonique. Appliqué uniquement si la cible est vide.
ALIAS = {
    "centralitePA": {
        "niveau": "valeur",
    },
    "postureCommerciale": {},
    "referencesClients": {
        "note": "commentaire",
        "detail": "commentaire",
        "precision": "commentaire",
        "commentairePerimetre": "commentaire",
        "detailPerimetre": "commentaire",
    },
    "reputation": {
        "avisPublics": "avis",
        "avisClients": "avis",
        "avisUtilisateurs": "avis",
        "avisFrancais": "avis",
        "notesPubliques": "avis",
        "syntheseAvisPublics": "synthese",
        "constat": "synthese",
        "motif": "commentaire",
        "motifAbsence": "commentaire",
        "noteMotif": "commentaire",
        "limites": "commentaire",
        "ecartReleve": "commentaire",
        "date": "dateReleve",
    },
    "capaciteDeFrappe": {
        "investissements": "investissementsAnnonces",
        "maillageFrance": "maillage",
        "implantationFrance": "maillage",
        "effectifCommercialFrance": "effectifCommercial",
        "effectifCommercialDedie": "effectifCommercial",
        "effectifCommercialPA": "effectifCommercial",
        "motifEffectifCommercialPA": "effectifCommercial",
        "basedeclaree": "lecture",
        "commentaire": "lecture",
        "essaiGratuit": "offreGratuite",
    },
    "dynamique": {
        "offres": "offresEmploiOuvertes",
        "nbOffres": "offresEmploiOuvertes",
        "offresOuvertes": "offresEmploiOuvertes",
        "offresFacturationElectronique": "offresLieesFacturationElectronique",
        "offresLieesFE": "offresLieesFacturationElectronique",
        "typesPostes": "naturesPostes",
        "naturePostes": "naturesPostes",
        "postes": "naturesPostes",
        "dateReleveOffresEmploi": "dateReleveOffres",
    },
    "droitDeReponse": {
        "pointsLegitimementContestables": "pointsContestables",
        "elementsContestablesLegitimement": "pointsContestables",
        "elementsContestables": "pointsContestables",
        "elementsPotentiellementContestes": "pointsContestables",
        "objetsContestables": "pointsContestables",
        "cequilpourraitcontester": "pointsContestables",
    },
}

# Clés d'actionnariat regroupées sous capaciteDeFrappe.actionnariat
ACTIONNARIAT = {
    "typeActionnaire": "type",
    "actionnaires": "actionnaires",
    "detailActionnariat": "detail",
    "sourceActionnariat": "source",
}

# Bloc où un `str` nu doit atterrir quand la fiche n'a pas produit d'objet.
STR_FALLBACK = {
    "centralitePA": "lecture",
    "postureCommerciale": "lecture",
    "referencesClients": "lecture",
    "reputation": "synthese",
    "capaciteDeFrappe": "lecture",
    "droitDeReponse": "lecture",
    "dynamique": "lecture",
}

# Indices repris de data/pa-taxonomie.json, facette `centralitePA`.
VOCAB_CENTRALITE = {
    "coeur_de_metier": 4,
    "axe_strategique": 3,
    "extension_naturelle": 2,
    "activite_annexe": 1,
    "conformite_defensive": 0,
    "non_qualifie": None,
}
VOCAB_POSTURE = {
    "base_installee", "conquete_directe", "canal_indirect", "grossiste", "non_qualifie",
}
VOCAB_CONFIANCE = {"haute", "moyenne", "faible", "non_qualifie"}


def recaler_vocab(valeur: str, vocabulaire):
    """Ramène une valeur de vocabulaire fermé sur son jeton canonique.

    Le vocabulaire de `data/pa-taxonomie.json` est en ASCII sans accent et en
    `snake_case`. Une fiche peut livrer « axe_stratégique », « Axe strategique »
    ou « axe-strategique » : ce sont trois écritures du même jeton, et une
    passe de réaccentuation de la prose peut aussi accentuer le jeton par
    ricochet. On dé-accentue, on repasse en minuscules et on unifie les
    séparateurs avant de confronter le résultat au vocabulaire.

    Renvoie (jeton_canonique, a_ete_recale) ou (valeur, False) si aucun
    rapprochement n'est possible — dans ce cas la valeur est laissée telle
    quelle et signalée pour arbitrage humain.
    """
    if not isinstance(valeur, str):
        return valeur, False
    if valeur in vocabulaire:
        return valeur, False
    plat = unicodedata.normalize("NFD", valeur)
    plat = "".join(c for c in plat if unicodedata.category(c) != "Mn")
    plat = re.sub(r"[\s\-]+", "_", plat.strip().lower())
    plat = re.sub(r"_+", "_", plat)
    if plat in vocabulaire:
        return plat, True
    return valeur, False

LOT_RE = re.compile(r"^360-L(\d+)$")


# --------------------------------------------------------------------------- #
# Utilitaires                                                                 #
# --------------------------------------------------------------------------- #

def is_empty(value) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return value.strip() == ""
    if isinstance(value, (list, dict)):
        return len(value) == 0
    return False


def as_text(value, sep=" — ") -> str:
    """Aplatit n'importe quelle valeur en texte lisible, sans rien perdre."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, bool):
        return "oui" if value else "non"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        return sep.join(as_text(v, sep) for v in value if not is_empty(v))
    if isinstance(value, dict):
        parts = []
        for key, val in value.items():
            txt = as_text(val, sep)
            if txt:
                parts.append(f"{humanize(key)} : {txt}")
        return sep.join(parts)
    return str(value)


def humanize(key: str) -> str:
    spaced = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", key)
    return spaced[:1].upper() + spaced[1:]


def merge_text(existing, incoming) -> str:
    """Concatène deux textes en évitant les doublons stricts."""
    left, right = as_text(existing), as_text(incoming)
    if not left:
        return right
    if not right:
        return left
    if right in left:
        return left
    if left in right:
        return right
    return f"{left} {right}"


def parse_note(value):
    """« 4,4 / 5 » -> 4.4 ; 4.8 -> 4.8 ; « 4 étoiles » -> 4.0 ; sinon None."""
    if value is None:
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return round(float(value), 2)
    match = re.search(r"(\d+)[.,](\d+)", str(value))
    if match:
        return round(float(f"{match.group(1)}.{match.group(2)}"), 2)
    match = re.search(r"\b(\d+)\b", str(value))
    if match:
        note = float(match.group(1))
        return note if note <= 5 else None
    return None


def parse_nb_avis(value):
    """1 100+ -> 1100 ; 371 -> 371 ; « inexistant » -> None."""
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    digits = re.sub(r"[^\d]", "", str(value).replace("\u202f", ""))
    return int(digits) if digits else None


def to_bool(value):
    if isinstance(value, bool):
        return value
    if value is None:
        return None
    txt = as_text(value).lower()
    if txt in {"oui", "true", "vrai", "1"}:
        return True
    if txt in {"non", "false", "faux", "0"}:
        return False
    return None


# --------------------------------------------------------------------------- #
# Normalisation d'un bloc objet                                               #
# --------------------------------------------------------------------------- #

def normalize_block(bloc: str, raw, log: collections.Counter, nom: str, notes: list) -> dict:
    """Retourne un dict conforme au socle, avec bucket `complements`."""
    socle = SOCLE[bloc]
    alias = ALIAS.get(bloc, {})
    out = {key: None for key in socle}
    complements: dict = {}

    if is_empty(raw):
        raw = {}

    # 1. Ramener toute forme non-objet vers un objet.
    if isinstance(raw, str):
        target = STR_FALLBACK[bloc]
        out[target] = raw.strip()
        log[f"{bloc}: str -> {{{target}}}"] += 1
        notes.append((nom, bloc, f"bloc fourni en texte nu, replié sur `{target}`"))
        raw = {}
    elif isinstance(raw, list):
        if bloc == "reputation":
            out["avis"] = raw
            log["reputation: list -> {avis}"] += 1
        elif bloc == "droitDeReponse":
            out["pointsContestables"] = raw
            log["droitDeReponse: list -> {pointsContestables}"] += 1
        else:
            complements["valeursListees"] = raw
            log[f"{bloc}: list -> complements"] += 1
        notes.append((nom, bloc, "bloc fourni en tableau nu, replié sur le socle"))
        raw = {}
    elif not isinstance(raw, dict):
        complements["valeurBrute"] = raw
        raw = {}

    # 2. Regrouper l'actionnariat de capaciteDeFrappe.
    if bloc == "capaciteDeFrappe":
        actionnariat = {}
        for source_key, target_key in ACTIONNARIAT.items():
            if source_key in raw and not is_empty(raw[source_key]):
                actionnariat[target_key] = raw.pop(source_key)
            else:
                raw.pop(source_key, None)
        if actionnariat:
            out["actionnariat"] = actionnariat
            log["capaciteDeFrappe: actionnariat regroupé"] += 1

    # 3. Répartir les clés : socle / alias / complements.
    for key, value in raw.items():
        if key == "complements" and isinstance(value, dict):
            complements.update(value)
            continue
        if key in socle:
            if is_empty(out[key]):
                out[key] = value
            else:
                out[key] = merge_text(out[key], value)
            continue
        target = alias.get(key)
        if target and target in socle:
            if is_empty(out[target]):
                out[target] = value
            elif isinstance(out[target], list) and isinstance(value, list):
                out[target] = out[target] + value
            elif isinstance(out[target], list):
                out[target] = out[target] + [value]
            else:
                out[target] = merge_text(out[target], value)
            log[f"{bloc}: {key} -> {target}"] += 1
            continue
        if bloc == "reputation" and key in {"plateforme", "note", "nombreAvis", "volumeAvis"}:
            continue  # traité plus bas (avis à plat)
        complements[key] = value
        log[f"{bloc}: {key} -> complements"] += 1

    # 4. Réputation : unifier la liste d'avis.
    if bloc == "reputation":
        if not is_empty(raw.get("volumeAvis")) and is_empty(raw.get("nombreAvis")):
            raw["nombreAvis"] = raw["volumeAvis"]
            log["reputation: volumeAvis -> avis[].nombreAvis"] += 1
        avis = out.get("avis")
        if is_empty(avis):
            avis = []
        elif isinstance(avis, dict):
            avis = [avis]
        elif isinstance(avis, str):
            out["synthese"] = merge_text(out.get("synthese"), avis)
            avis = []
        flat = {
            "plateforme": raw.get("plateforme"),
            "note": raw.get("note"),
            "nombreAvis": raw.get("nombreAvis"),
        }
        if any(not is_empty(v) for v in flat.values()):
            flat["dateReleve"] = out.get("dateReleve")
            flat["source"] = out.get("source")
            avis.append(flat)
            log["reputation: avis à plat -> avis[]"] += 1
        normalized = []
        for entry in avis:
            if isinstance(entry, str):
                normalized.append({
                    "plateforme": None, "note": None, "noteBrute": None,
                    "nombreAvis": None, "nombreAvisBrut": None,
                    "dateReleve": None, "source": None, "commentaire": entry,
                })
                continue
            if not isinstance(entry, dict):
                continue
            AVIS_SOCLE = {
                "plateforme", "note", "noteBrute", "nombreAvis", "nombreAvisBrut",
                "dateReleve", "source", "commentaire", "motif", "complements",
            }
            extra = {}
            for k, v in entry.items():
                if k not in AVIS_SOCLE and not is_empty(v):
                    extra[k] = v
            if isinstance(entry.get("complements"), dict):
                extra.update(entry["complements"])
            note_raw = entry.get("noteBrute") if isinstance(entry.get("noteBrute"), str) else (
                entry.get("note") if isinstance(entry.get("note"), str) else None
            )
            nb_raw = entry.get("nombreAvisBrut") if isinstance(entry.get("nombreAvisBrut"), str) else (
                entry.get("nombreAvis") if isinstance(entry.get("nombreAvis"), str) else None
            )
            normalized.append({
                "plateforme": as_text(entry.get("plateforme")) or None,
                "note": parse_note(entry.get("note") if entry.get("note") is not None else note_raw),
                "noteBrute": note_raw,
                "nombreAvis": parse_nb_avis(entry.get("nombreAvis") if entry.get("nombreAvis") is not None else nb_raw),
                "nombreAvisBrut": nb_raw,
                "dateReleve": entry.get("dateReleve"),
                "source": as_text(entry.get("source")) or None,
                "commentaire": as_text(entry.get("commentaire") or entry.get("motif")) or None,
                "complements": extra,
            })
        out["avis"] = normalized

    # 5. Champs à type contraint.
    if bloc == "centralitePA":
        if not is_empty(out["valeur"]):
            out["valeur"] = as_text(out["valeur"])
            recale, modifie = recaler_vocab(out["valeur"], VOCAB_CENTRALITE)
            if modifie:
                log["centralitePA: valeur recalée sur le vocabulaire de pa-taxonomie.json"] += 1
                notes.append((nom, bloc, f"valeur {out['valeur']!r} recalée sur {recale!r} (vocabulaire fermé, ASCII sans accent)"))
                out["valeur"] = recale
            if out["valeur"] not in VOCAB_CENTRALITE:
                notes.append((nom, bloc, f"valeur hors vocabulaire : {out['valeur']!r}"))
        attendu = VOCAB_CENTRALITE.get(out["valeur"]) if out["valeur"] in VOCAB_CENTRALITE else None
        if is_empty(out["indice"]) and attendu is not None:
            out["indice"] = attendu
            log["centralitePA: indice déduit de valeur (pa-taxonomie.json)"] += 1
        if not is_empty(out["indice"]):
            out["indice"] = int(out["indice"])
            if attendu is not None and out["indice"] != attendu:
                notes.append((nom, bloc, f"indice {out['indice']} incohérent avec `{out['valeur']}` (pa-taxonomie.json attend {attendu}) — indice corrigé"))
                log["centralitePA: indice corrigé d'après pa-taxonomie.json"] += 1
                out["indice"] = attendu
        out["entiteJuridiqueDediee"] = to_bool(out["entiteJuridiqueDediee"])
        if not isinstance(out["faisceauIndices"], list):
            out["faisceauIndices"] = [] if is_empty(out["faisceauIndices"]) else [out["faisceauIndices"]]

    if bloc == "postureCommerciale" and not is_empty(out["valeur"]):
        out["valeur"] = as_text(out["valeur"])
        recale, modifie = recaler_vocab(out["valeur"], VOCAB_POSTURE)
        if modifie:
            log["postureCommerciale: valeur recalée sur le vocabulaire de pa-taxonomie.json"] += 1
            notes.append((nom, bloc, f"valeur {out['valeur']!r} recalée sur {recale!r} (vocabulaire fermé, ASCII sans accent)"))
            out["valeur"] = recale
        if out["valeur"] not in VOCAB_POSTURE:
            notes.append((nom, bloc, f"valeur hors vocabulaire : {out['valeur']!r}"))

    if bloc == "droitDeReponse":
        out["signale"] = to_bool(out["signale"]) if not is_empty(out["signale"]) else False
        pts = out["pointsContestables"]
        if is_empty(pts):
            out["pointsContestables"] = []
        elif not isinstance(pts, list):
            out["pointsContestables"] = [pts]

    if bloc == "referencesClients":
        for key in ("parSecteur", "libellesSecteursEditeur", "grandsComptes", "referencesPAConfirmees"):
            if not is_empty(out[key]) and not isinstance(out[key], (list, dict)):
                out[key] = [out[key]]
                log[f"referencesClients: {key} -> list"] += 1
            elif is_empty(out[key]):
                out[key] = [] if key != "parSecteur" else {}

    # 6. Confiance normalisée.
    if not is_empty(out.get("confiance")):
        conf = as_text(out["confiance"]).lower().replace(" ", "_")
        out["confiance"] = conf if conf in VOCAB_CONFIANCE else "non_qualifie"

    out["complements"] = complements
    return out


# --------------------------------------------------------------------------- #
# poidsEconomique                                                             #
# --------------------------------------------------------------------------- #

def normalize_poids(pe: dict, log: collections.Counter, nom: str, notes: list) -> dict:
    if not isinstance(pe, dict):
        return {"complements": {"valeurBrute": pe}}

    pe = dict(pe)

    # effectif / effectifEntite : une seule clé, toujours du texte.
    effectif = pe.pop("effectif", None)
    entite = pe.get("effectifEntite")
    if not is_empty(effectif):
        if isinstance(effectif, dict):
            log["poidsEconomique: effectif dict -> texte"] += 1
            notes.append((nom, "poidsEconomique", "`effectif` était un objet, aplati dans `effectifEntite`"))
            pe.setdefault("effectifDetail", effectif)
            effectif = as_text(effectif)
        if is_empty(entite):
            pe["effectifEntite"] = as_text(effectif)
            log["poidsEconomique: effectif -> effectifEntite"] += 1
        else:
            fused = merge_text(entite, effectif)
            if as_text(entite) != fused:
                log["poidsEconomique: effectif fusionné dans effectifEntite"] += 1
                notes.append((nom, "poidsEconomique", "`effectif` et `effectifEntite` divergeaient, textes fusionnés — à arbitrer"))
            pe["effectifEntite"] = fused
    if "effectifEntite" in pe:
        pe["effectifEntite"] = as_text(pe["effectifEntite"]) or None
    if "effectifGroupe" in pe:
        pe["effectifGroupe"] = as_text(pe["effectifGroupe"]) or None

    # CA : arrondi des montants et dateReleve obligatoire.
    for key in ("caEntiteFrancaise", "caGroupe", "caEntiteImmatriculee"):
        bloc = pe.get(key)
        if not isinstance(bloc, dict):
            continue
        montant = bloc.get("montantMEUR")
        if isinstance(montant, float):
            rounded = round(montant, 2)
            if rounded != montant:
                log["poidsEconomique: montantMEUR arrondi à 2 décimales"] += 1
                notes.append((nom, key, f"montantMEUR {montant} arrondi à {rounded}"))
            bloc["montantMEUR"] = rounded
        if montant == 0 and bloc.get("nature") in (None, "", "comptes_deposes"):
            notes.append((nom, key, "montantMEUR = 0 : préciser `nature` (CA réellement nul vs non renseigné)"))
        if is_empty(bloc.get("dateReleve")):
            bloc["dateReleve"] = None
            notes.append((nom, key, "dateReleve absente : donnée financière non rejouable"))
            log["poidsEconomique: CA sans dateReleve"] += 1
        pe[key] = bloc

    if "resultatNetExercice" in pe and is_empty(pe.get("resultatNet")):
        pe["resultatNet"] = pe.pop("resultatNetExercice")
        log["poidsEconomique: resultatNetExercice -> resultatNet"] += 1
    if "nbEtablissementsActifs" in pe and is_empty(pe.get("nbEtablissements")):
        pe["nbEtablissements"] = pe.pop("nbEtablissementsActifs")
        log["poidsEconomique: nbEtablissementsActifs -> nbEtablissements"] += 1

    return pe


# --------------------------------------------------------------------------- #
# Pipeline                                                                    #
# --------------------------------------------------------------------------- #

def normalize_liens(plateforme: dict, log: collections.Counter) -> None:
    """`immatriculationsLiees.entrees` : toujours une liste d'objets {nom, siren}."""
    liees = plateforme.get("immatriculationsLiees")
    if not isinstance(liees, dict):
        return
    entrees = liees.get("entrees")
    if not isinstance(entrees, list):
        return
    out = []
    for e in entrees:
        if isinstance(e, dict):
            out.append({"nom": e.get("nom"), "siren": e.get("siren")})
        elif isinstance(e, str):
            out.append({"nom": e, "siren": None})
            log["immatriculationsLiees: entree str -> {nom, siren}"] += 1
    liees["entrees"] = out


def normalize_sources(plateforme: dict, log: collections.Counter) -> None:
    """`sourcesEnrichissement` : toujours une liste d'objets au même gabarit."""
    sources = plateforme.get("sourcesEnrichissement")
    if not isinstance(sources, list):
        return
    out = []
    for s in sources:
        if isinstance(s, str):
            out.append({
                "champ": "non_precise", "source": s, "url": s if s.startswith("http") else None,
                "libelle": None, "dateReleve": None, "confiance": "non_qualifie",
            })
            log["sourcesEnrichissement: url nue -> objet"] += 1
            continue
        if not isinstance(s, dict):
            continue
        e = dict(s)
        if is_empty(e.get("champ")):
            e["champ"] = "non_precise"
            log["sourcesEnrichissement: champ absent -> non_precise"] += 1
        if is_empty(e.get("source")):
            e["source"] = e.get("libelle") or e.get("url")
            log["sourcesEnrichissement: source déduite de libelle/url"] += 1
        if is_empty(e.get("confiance")):
            e["confiance"] = "non_qualifie"
            log["sourcesEnrichissement: confiance absente -> non_qualifie"] += 1
        e.setdefault("url", None)
        e.setdefault("libelle", None)
        e.setdefault("dateReleve", None)
        out.append(e)
    plateforme["sourcesEnrichissement"] = out


def normalize_fiche(plateforme: dict, log: collections.Counter, notes: list) -> None:
    normalize_liens(plateforme, log)
    normalize_sources(plateforme, log)
    a = plateforme.get("analyse360")
    if not isinstance(a, dict):
        return
    nom = plateforme.get("nom", "?")

    a["metierPrincipal"] = as_text(a.get("metierPrincipal")) or None

    activites = a.get("activites")
    if is_empty(activites):
        a["activites"] = []
    elif not isinstance(activites, list):
        a["activites"] = [activites]
        log["activites: -> list"] += 1

    lecture = a.get("lectureConcurrentielle")
    if isinstance(lecture, (dict, list)):
        a["lectureConcurrentielle"] = as_text(lecture, sep="\n\n")
        log["lectureConcurrentielle: objet -> texte"] += 1
        notes.append((nom, "lectureConcurrentielle", "bloc fourni en objet, aplati en texte structuré"))
    else:
        a["lectureConcurrentielle"] = as_text(lecture) or None

    a["poidsEconomique"] = normalize_poids(a.get("poidsEconomique"), log, nom, notes)

    for bloc in SOCLE:
        a[bloc] = normalize_block(bloc, a.get(bloc), log, nom, notes)

    # Réordonner les blocs.
    ordered = {k: a[k] for k in BLOCS if k in a}
    for k, v in a.items():
        if k not in ordered:
            ordered[k] = v
    a.clear()
    a.update(ordered)


def recompute_couverture(data: dict) -> dict:
    plateformes = data["plateformes"]
    cov = data["_meta"].setdefault("couverture", {})

    def has(p, *path):
        cur = p
        for key in path:
            if not isinstance(cur, dict):
                return False
            cur = cur.get(key)
        return not is_empty(cur)

    a360 = [p for p in plateformes if isinstance(p.get("analyse360"), dict)]
    cov.update({
        "analyse360_entamee": len(a360),
        "analyse360_activites": sum(1 for p in a360 if has(p, "analyse360", "activites")),
        "analyse360_centralite": sum(1 for p in a360 if has(p, "analyse360", "centralitePA", "valeur")),
        "analyse360_posture": sum(1 for p in a360 if has(p, "analyse360", "postureCommerciale", "valeur")),
        "analyse360_referencesClients": sum(1 for p in a360 if has(p, "analyse360", "referencesClients", "perimetre")),
        "analyse360_reputation": sum(1 for p in a360 if has(p, "analyse360", "reputation", "avis") or has(p, "analyse360", "reputation", "synthese")),
        "analyse360_capaciteDeFrappe": sum(1 for p in a360 if has(p, "analyse360", "capaciteDeFrappe", "canal") or has(p, "analyse360", "capaciteDeFrappe", "lecture")),
        "analyse360_lectureConcurrentielle": sum(1 for p in a360 if has(p, "analyse360", "lectureConcurrentielle")),
        # Une fiche 360 complète porte au minimum un métier principal et un
        # poids économique. Une plateforme qualifiée sur une seule facette
        # (par exemple `postureCommerciale: grossiste` relevée par le chantier
        # « grossistes ») porte un bloc `analyse360` légitime mais n'est pas
        # une fiche : les deux ne se comptent pas ensemble.
        "analyse360_fichesCompletes": sum(1 for p in a360 if has(p, "analyse360", "metierPrincipal")
                                          and has(p, "analyse360", "poidsEconomique")),
        # Compteurs de fond : un bloc existe sur toutes les fiches après
        # normalisation, on compte donc le renseignement effectif, pas la présence.
        "analyse360_dynamique": sum(1 for p in a360 if has(p, "analyse360", "dynamique", "offresEmploiOuvertes")
                                    or has(p, "analyse360", "dynamique", "naturesPostes")
                                    or has(p, "analyse360", "dynamique", "lecture")),
        "analyse360_droitDeReponse": sum(1 for p in a360 if has(p, "analyse360", "droitDeReponse", "lecture")
                                         or has(p, "analyse360", "droitDeReponse", "pointsContestables")),
        "analyse360_caEntiteFrancaise": sum(1 for p in a360 if has(p, "analyse360", "poidsEconomique", "caEntiteFrancaise", "montantMEUR")),
        "analyse360_caGroupe": sum(1 for p in a360 if has(p, "analyse360", "poidsEconomique", "caGroupe", "montantMEUR")),
        "siteWeb_rempli": sum(1 for p in plateformes if not is_empty(p.get("siteWeb"))),
        "contact_rempli": sum(1 for p in plateformes if not is_empty(p.get("contact"))),
        "reseaux_renseignes": sum(1 for p in plateformes if not is_empty(p.get("reseaux"))),
        "dirigeants_renseignes": sum(1 for p in plateformes if not is_empty(p.get("dirigeants"))),
        "identiteInternationale_renseignee": sum(1 for p in plateformes if not is_empty(p.get("identiteInternationale"))),
        "socleTechnique_identifie": sum(1 for p in plateformes if not is_empty(p.get("socleTechnique"))),
        "droitDeReponse_signale": sum(
            1 for p in a360
            if p["analyse360"].get("droitDeReponse", {}).get("signale") is True
        ),
        "fichesSansAucunEnrichissement": sum(1 for p in plateformes if is_empty(p.get("sourcesEnrichissement"))),
        "dateDerniereFusion": max(
            (f.get("dateFusion") for f in data["_meta"].get("fusions", []) if f.get("dateFusion")),
            default=None,
        ),
    })
    return cov


def audit_sources(data: dict) -> dict:
    """Contrôle de traçabilité : combien de fiches 360 sans source préfixée `analyse360`."""
    manquantes, sans_confiance = [], 0
    for p in data["plateformes"]:
        if not isinstance(p.get("analyse360"), dict):
            continue
        sources = p.get("sourcesEnrichissement") or []
        n = 0
        for s in sources:
            if not isinstance(s, dict):
                continue
            if is_empty(s.get("confiance")) or s.get("confiance") == "non_qualifie":
                sans_confiance += 1
            champ = str(s.get("champ") or "")
            if champ.startswith("analyse360") or champ.split(".")[0] in {
                "poidsEconomique", "centralitePA", "postureCommerciale",
                "referencesClients", "reputation", "capaciteDeFrappe",
                "lectureConcurrentielle", "droitDeReponse", "metierPrincipal", "activites",
            }:
                n += 1
        if n == 0:
            manquantes.append(p.get("nom"))
    return {"fichesSansSource360": manquantes, "sourcesSansConfiance": sans_confiance}


def main() -> int:
    ap = argparse.ArgumentParser(description="Normalise le bloc analyse360 de plateformes-agreees.json")
    ap.add_argument("input")
    ap.add_argument("-o", "--output", default=None, help="défaut : écrase le fichier d'entrée")
    ap.add_argument("--report", default=None, help="chemin d'un rapport markdown")
    ap.add_argument("--dry-run", action="store_true", help="n'écrit rien, affiche le bilan")
    args = ap.parse_args()

    with open(args.input, encoding="utf-8") as fh:
        data = json.load(fh)

    log: collections.Counter = collections.Counter()
    notes: list = []

    for plateforme in data["plateformes"]:
        normalize_fiche(plateforme, log, notes)

    cov = recompute_couverture(data)
    trace = audit_sources(data)
    data["_meta"]["dateDerniereConsolidation"] = cov.get("dateDerniereFusion") or str(date.today())
    data["_meta"]["schemaAnalyse360"] = {
        "version": "1.0",
        "normalisePar": "tools/normalize-360.py",
        "dateNormalisation": str(date.today()),
        "blocs": BLOCS,
        "socle": SOCLE,
        "regle": (
            "Chaque bloc objet porte exactement les clés du socle plus un bucket `complements`. "
            "Toute clé hors socle est conservée dans `complements` : le renderer doit l'afficher "
            "en liste générique afin qu'aucune information ne soit perdue à l'affichage."
        ),
    }

    print("=== Transformations appliquées")
    for key, count in sorted(log.items(), key=lambda kv: -kv[1]):
        print(f"  {count:>4}  {key}")
    print(f"\n=== Points à arbitrer manuellement : {len(notes)}")
    for nom, bloc, msg in notes:
        print(f"  - {nom} / {bloc} : {msg}")
    print(f"\n=== Traçabilité : {len(trace['fichesSansSource360'])} fiche(s) 360 sans source dédiée")
    for nom in trace["fichesSansSource360"]:
        print(f"  - {nom}")
    print(f"=== sourcesEnrichissement sans `confiance` : {trace['sourcesSansConfiance']}")

    if args.report:
        with open(args.report, "w", encoding="utf-8") as fh:
            fh.write("# Rapport de normalisation `analyse360`\n\n")
            fh.write(f"- Fichier : `{args.input}`\n- Date : {date.today()}\n")
            fh.write(f"- Fiches 360 traitées : {cov['analyse360_entamee']}\n\n")
            fh.write("## Transformations appliquées\n\n| n | transformation |\n|---:|---|\n")
            for key, count in sorted(log.items(), key=lambda kv: -kv[1]):
                fh.write(f"| {count} | {key} |\n")
            fh.write(f"\n## Points à arbitrer manuellement ({len(notes)})\n\n| plateforme | bloc | point |\n|---|---|---|\n")
            for nom, bloc, msg in notes:
                fh.write(f"| {nom} | {bloc} | {msg} |\n")
            fh.write("\n## Traçabilité\n\n")
            fh.write(f"- Fiches 360 sans aucune `sourcesEnrichissement` dédiée : {len(trace['fichesSansSource360'])}\n")
            for nom in trace["fichesSansSource360"]:
                fh.write(f"  - {nom}\n")
            fh.write(f"- Entrées `sourcesEnrichissement` sans `confiance` : {trace['sourcesSansConfiance']}\n")
            fh.write("\n## Couverture recalculée\n\n| compteur | valeur |\n|---|---:|\n")
            for key, val in cov.items():
                fh.write(f"| `{key}` | {val} |\n")
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
