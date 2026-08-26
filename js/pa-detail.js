/* pa-detail.js — fiche d'une plateforme agréée (Re·Form·E)
   Aligné sur le schéma analyse360 v1.0 (voir Info IA/plateformes-agreees/SCHEMA-360.md).
   Principe : aucune donnée présente dans le JSON ne doit rester invisible sur la page.
   Toute clé hors socle est rendue via le bucket `complements`. */
(() => {
  'use strict';

  const DATA = './data/plateformes-agreees.json';
  const TAXO = './data/pa-taxonomie.json';

  const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const TODO = '<span class="pa-todo">Non renseigné — qualification en cours</span>';
  const NON_RELEVE = '<span class="pa-todo">Non relevé à ce jour</span>';

  /* ------------------------------------------------------------------ */
  /* Échappement : toute valeur issue du JSON passe par esc().          */
  /* ------------------------------------------------------------------ */

  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const rempli = (v) => !(v === null || v === undefined || v === ''
    || (typeof v === 'string' && v.trim() === '')
    || (Array.isArray(v) && !v.length)
    || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length));

  const isUrl = (v) => typeof v === 'string' && /^https?:\/\//.test(v.trim());

  const lien = (url, libelle) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(libelle || url)}</a>`;

  const humanize = (cle) => {
    const espace = String(cle).replace(/(?<=[a-z0-9])(?=[A-Z])/g, ' ').replace(/_/g, ' ');
    return espace.charAt(0).toUpperCase() + espace.slice(1);
  };

  /** Aplatit n'importe quelle valeur en HTML sûr, sans jamais rien masquer. */
  const txt = (v) => {
    if (!rempli(v)) return '';
    if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
    if (typeof v === 'number') return esc(String(v).replace('.', ','));
    if (typeof v === 'string') return isUrl(v) ? lien(v) : esc(v);
    if (Array.isArray(v)) {
      const items = v.map((x) => txt(x)).filter(Boolean);
      if (!items.length) return '';
      return items.length === 1 ? items[0] : `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>`;
    }
    const paires = Object.entries(v).map(([k, val]) => {
      const rendu = txt(val);
      return rendu ? `<li><strong>${esc(humanize(k))}</strong> — ${rendu}</li>` : '';
    }).filter(Boolean);
    return paires.length ? `<ul>${paires.join('')}</ul>` : '';
  };

  const val = (v) => (rempli(v) ? txt(v) : TODO);
  const relev = (v) => (rempli(v) ? txt(v) : NON_RELEVE);
  const oui = (v) => (v === null || v === undefined ? TODO : (v ? 'Oui' : 'Non'));
  const listeOf = (v) => (Array.isArray(v) ? v : (rempli(v) ? [v] : []));

  const dl = (rows) => `<dl class="pa-dl">${rows
    .filter(Boolean)
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;

  /** Ligne « Source » harmonisée : source + date de relevé + niveau de confiance. */
  const ligneSource = (o) => {
    if (!o) return null;
    const bouts = [];
    if (rempli(o.source)) bouts.push(txt(o.source));
    if (rempli(o.dateReleve)) bouts.push(`<span class="pa-conf pa-conf--ok">relevé le ${esc(o.dateReleve)}</span>`);
    if (rempli(o.confiance)) bouts.push(`<span class="pa-conf pa-conf--ok">confiance ${esc(o.confiance)}</span>`);
    return bouts.length ? ['Source', bouts.join(' — ')] : null;
  };

  /**
   * Bucket `complements` : toute clé produite par la recherche mais hors socle.
   * Rendue en liste générique — c'est la garantie qu'aucune information relevée
   * ne disparaît de la page faute d'emplacement prévu.
   */
  const ligneComplements = (o) => {
    if (!o || !rempli(o.complements)) return null;
    const rendu = txt(o.complements);
    return rendu ? ['Autres éléments relevés', rendu] : null;
  };

  /** Idem, pour les objets libres (poidsEconomique) : tout ce qui n'a pas de slot dédié. */
  const ligneReste = (o, connues) => {
    if (!o) return null;
    const reste = {};
    Object.entries(o).forEach(([k, v]) => {
      if (!connues.includes(k) && rempli(v)) reste[k] = v;
    });
    if (!Object.keys(reste).length) return null;
    return ['Autres éléments relevés', txt(reste)];
  };

  const label = (taxo, facetteId, v) => {
    const f = taxo.facettes.find((x) => x.id === facetteId);
    if (!f) return esc(v);
    const found = (f.valeurs || []).find((x) => x.v === v);
    return esc(found ? found.label : v);
  };

  const confiance = (c) => {
    if (c === 'haute') return '<span class="pa-conf pa-conf--ok">Donnée appariée automatiquement, concordance nom + localisation</span>';
    if (c === 'moyenne') return '<span class="pa-conf pa-conf--warn">Appariement à vérifier manuellement</span>';
    return '<span class="pa-conf pa-conf--todo">Identité juridique non encore appariée</span>';
  };

  const bloc = (pa, ...cles) => cles.reduce((o, k) => (o && typeof o === 'object' ? o[k] : null), pa.analyse360 || null);

  const montrer = (secId, navId) => {
    const sec = document.getElementById(secId);
    const nav = document.getElementById(navId);
    if (sec) sec.hidden = false;
    if (nav) nav.hidden = false;
  };

  /** Bloc de lecture : toute interprétation Fluxym est signalée comme telle. */
  const lectureBox = (texte, confianceNiveau) => {
    const rendu = txt(texte);
    if (!rendu) return '';
    return `
    <div class="callout callout--info">
      <div class="callout-icon">🧭</div>
      <div class="callout-content">
        <strong>Lecture Fluxym — interprétation, et non donnée relevée.</strong>
        ${rendu}
        ${confianceNiveau ? `<br><em>Niveau de confiance de cette lecture : ${esc(confianceNiveau)}.</em>` : ''}
        <br><a href="./methodologie-plateformes.html">Comment cette lecture est établie</a>
      </div>
    </div>`;
  };

  const euros = (m) => (m === null || m === undefined ? null : `${String(m).replace('.', ',')} M€`);

  /* ------------------------------------------------------------------ */
  /* Identité internationale                                            */
  /* ------------------------------------------------------------------ */

  const renderInternational = (pa) => {
    const i = pa.identiteInternationale;
    if (!rempli(i)) return;
    const pf = i.presenceEnFrance || {};
    const typesFr = {
      filiale: 'Filiale française', succursale: 'Succursale française',
      representant: 'Représentant en France', aucune_connue: 'Aucune entité française connue',
      aucune_identifiee: 'Aucune entité française identifiée'
    };
    document.getElementById('pa-international').innerHTML = dl([
      ['Pays du siège', val(i.paysISO)],
      ['Registre national', val(i.registreNational)],
      ['Identifiant au registre', val(i.identifiantRegistre)],
      ['Numéro de TVA intracommunautaire', i.numeroTVAIntracom
        ? `${esc(i.numeroTVAIntracom)}${i.tvaVerifieeVIES
          ? ` <span class="pa-conf pa-conf--ok">vérifié à VIES${i.dateVerificationVIES ? ` le ${esc(i.dateVerificationVIES)}` : ''}</span>`
          : ' <span class="pa-conf pa-conf--warn">non vérifié à VIES</span>'}`
        : TODO],
      ['Identifiant européen (EUID)', val(i.euid)],
      ['Identifiant d\u2019entité juridique (LEI)', val(i.lei)],
      ['Forme juridique', val(i.formeJuridique)],
      ['Code d\u2019activité (NACE)', val(i.codeNACE)],
      ['Catégorie de taille (UE)', val(i.categorieUE)],
      ['Présence en France', pf.type
        ? `${esc(typesFr[pf.type] || pf.type)}${pf.siren
          ? ` — SIREN ${lien(`https://annuaire-entreprises.data.gouv.fr/entreprise/${pf.siren}`, pf.siren)}` : ''}`
        : TODO],
      ['Identifiant Peppol', val(i.peppolParticipantId)]
    ]) + `<div class="callout callout--info"><div class="callout-icon">ℹ️</div><div class="callout-content">Cette entité n\u2019est pas immatriculée au répertoire SIRENE : son identité est établie à partir du registre national de son pays de siège. L\u2019absence de SIREN n\u2019est ni une anomalie, ni un manque de données.</div></div>`;
    montrer('sec-international', 'nav-international');
  };

  /* ------------------------------------------------------------------ */
  /* Activité et poids économique                                       */
  /* ------------------------------------------------------------------ */

  const naturesCA = {
    comptes_deposes: 'comptes déposés',
    declare_site: 'chiffre déclaré par l\u2019entreprise',
    chiffre_declare_site: 'chiffre déclaré par l\u2019entreprise',
    communique_financier: 'communiqué financier',
    non_publie: 'non publié',
    comptes_confidentiels: 'comptes déposés sous déclaration de confidentialité',
    aucun_compte_depose: 'aucun compte déposé',
    sans_objet: 'sans objet'
  };

  const ligneCA = (ca, intitule) => {
    if (!rempli(ca)) return [intitule, NON_RELEVE];
    const montant = rempli(ca.montantMEUR)
      ? ca.montantMEUR
      : (typeof ca.valeur === 'number' ? Math.round((ca.valeur / 1e6) * 100) / 100 : null);
    const note = rempli(ca.commentaire) ? txt(ca.commentaire) : '';
    // `dateReleveOrigine` signale une date reconstituée : elle n'est pas présentée
    // comme un relevé, mais comme la date de production de la fiche.
    const releve = rempli(ca.dateReleve)
      ? (ca.dateReleveOrigine === 'date_de_production_de_la_fiche'
        ? ` <span class="pa-conf pa-conf--warn">constaté à la production de la fiche, le ${esc(ca.dateReleve)}</span>`
        : ` <span class="pa-conf pa-conf--ok">relevé le ${esc(ca.dateReleve)}</span>`)
      : ' <span class="pa-conf pa-conf--warn">date de relevé non renseignée</span>';
    const src = rempli(ca.source) ? `<br>${txt(ca.source)}` : '';
    if (!rempli(montant)) {
      const absence = naturesCA[ca.nature];
      const base = absence ? `<span class="pa-todo">${esc(absence)}</span>` : NON_RELEVE;
      return [intitule, `${base}${note ? ` — ${note}` : ''}${src}`];
    }
    const det = [ca.exercice ? `exercice ${esc(ca.exercice)}` : null, esc(naturesCA[ca.nature] || ca.nature || '')]
      .filter(Boolean).join(', ');
    return [intitule, `<strong>${esc(euros(montant))}</strong>${det
      ? ` <span class="pa-conf pa-conf--ok">${det}</span>` : ''}${releve}${note ? `<br>${note}` : ''}${src}`];
  };

  const PE_CONNUES = [
    'caGroupe', 'caEntiteFrancaise', 'caEntiteImmatriculee', 'resultatNet',
    'effectifEntite', 'effectifGroupe', 'effectifDetail', 'ventilationParActivite',
    'lecture', 'source', 'dateReleve', 'confiance'
  ];

  const renderActivite = (pa) => {
    const metier = bloc(pa, 'metierPrincipal');
    const activites = listeOf(bloc(pa, 'activites'));
    const pe = bloc(pa, 'poidsEconomique') || {};
    if (!rempli(metier) && !activites.length && !rempli(pe)) return;
    const poids = { majeur: 'Activité majeure', significatif: 'Activité significative', mineur: 'Activité mineure' };
    const vpa = pe.ventilationParActivite || {};
    const ligneActivite = (a) => {
      if (typeof a === 'string') return `<li>${txt(a)}</li>`;
      const libelle = rempli(a.libelle) ? txt(a.libelle) : txt(a);
      const p = rempli(a.poids) ? ` — ${esc(poids[a.poids] || a.poids)}` : '';
      const src = rempli(a.source) ? ` <span class="pa-conf pa-conf--ok">${txt(a.source)}</span>` : '';
      return `<li><strong>${libelle}</strong>${p}${src}</li>`;
    };
    document.getElementById('pa-activite').innerHTML = dl([
      ['Métier principal', val(metier)],
      ['Lignes d\u2019activité identifiées', activites.length
        ? `<ul>${activites.map(ligneActivite).join('')}</ul>` : NON_RELEVE],
      ligneCA(pe.caGroupe, 'Chiffre d\u2019affaires du groupe'),
      ligneCA(pe.caEntiteFrancaise, 'Chiffre d\u2019affaires de l\u2019entité française'),
      ['Résultat net', rempli(pe.resultatNet)
        ? (typeof pe.resultatNet === 'number' ? esc(euros(pe.resultatNet)) : txt(pe.resultatNet))
        : NON_RELEVE],
      ['Effectif du groupe', relev(pe.effectifGroupe)],
      ['Effectif de l\u2019entité', relev(pe.effectifEntite)],
      ['Répartition du chiffre d\u2019affaires par activité', vpa.disponible === false
        ? `<span class="pa-todo">Non publiée</span>${vpa.motif ? ` — ${txt(vpa.motif)}` : ''}`
        : relev(vpa.derniereVentilationConnue)],
      ligneSource(pe),
      ligneReste(pe, PE_CONNUES)
    ]) + lectureBox(pe.lecture, pe.confiance)
      + `<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content"><strong>Deux périmètres, deux chiffres.</strong> Le chiffre d\u2019affaires du groupe et celui de l\u2019entité française ne sont jamais additionnés ni confondus. La part du chiffre d\u2019affaires attribuable à l\u2019activité de plateforme agréée n\u2019est publiée par aucun acteur du marché : elle n\u2019est donc jamais estimée ici.</div></div>`;
    montrer('sec-activite', 'nav-activite');
  };

  /* ------------------------------------------------------------------ */
  /* Centralité et posture commerciale                                  */
  /* ------------------------------------------------------------------ */

  const renderCentralite = (pa, taxo) => {
    const c = bloc(pa, 'centralitePA');
    if (!rempli(c)) return;
    // Schéma v1.0 : la clé canonique est `valeur`. `niveau` reste toléré en lecture.
    const cle = rempli(c.valeur) ? c.valeur : c.niveau;
    const posture = bloc(pa, 'postureCommerciale') || {};
    if (!rempli(cle) && !rempli(posture.valeur) && !rempli(c.lecture)
      && !rempli(c.faisceauIndices) && !rempli(c.complements)) return;

    const f = taxo.facettes.find((x) => x.id === 'centralitePA');
    const v = f && rempli(cle) ? (f.valeurs || []).find((x) => x.v === cle) : null;
    const indices = listeOf(c.faisceauIndices);
    const signe = (x) => (x.sens === '+' ? '↑' : (x.sens === '-' || x.sens === '\u2212' ? '↓' : '•'));
    const indice = rempli(c.indice) ? c.indice : (v ? v.indice : null);

    const fPost = taxo.facettes.find((x) => x.id === 'postureCommerciale');
    const vPost = rempli(posture.valeur) && fPost
      ? (fPost.valeurs || []).find((x) => x.v === posture.valeur) : null;

    document.getElementById('pa-centralite').innerHTML = dl([
      ['Niveau', rempli(cle)
        ? `<strong>${indice !== null && indice !== undefined ? `${esc(indice)} sur 4 — ` : ''}${v ? esc(v.label) : esc(cle)}</strong>${v && v.definition ? `<br><span class="pa-conf pa-conf--ok">${esc(v.definition)}</span>` : ''}`
        : TODO],
      ['Posture commerciale', rempli(posture.valeur)
        ? `<strong>${label(taxo, 'postureCommerciale', posture.valeur)}</strong>${vPost && vPost.definition ? `<br><span class="pa-conf pa-conf--ok">${esc(vPost.definition)}</span>` : ''}${rempli(posture.preuve) ? `<br>${txt(posture.preuve)}` : ''}`
        : TODO],
      ['Modèle tarifaire annoncé', relev(posture.modeleTarifaire)],
      ['Tarif public', rempli(posture.tarifPublie) ? oui(posture.tarifPublie) : TODO],
      ['Offre gratuite', rempli(posture.offreGratuite) ? txt(posture.offreGratuite) : TODO],
      ['Marque produit dédiée', val(c.marqueProduitDediee)],
      ['Entité juridique dédiée', oui(c.entiteJuridiqueDediee)],
      ['Indices relevés', indices.length
        ? `<ul>${indices.map((x) => (typeof x === 'string'
          ? `<li>• ${txt(x)}</li>`
          : `<li>${signe(x)} ${txt(x.signal)}${rempli(x.preuve) ? ` <span class="pa-conf pa-conf--ok">${txt(x.preuve)}</span>` : ''}</li>`)).join('')}</ul>`
        : NON_RELEVE],
      ligneSource(c),
      ligneComplements(c),
      ligneComplements(posture)
    ]) + lectureBox(c.lecture, c.confiance) + lectureBox(posture.lecture, posture.confiance);
    montrer('sec-centralite', 'nav-centralite');
  };

  /* ------------------------------------------------------------------ */
  /* Marché : références clients et réputation                          */
  /* ------------------------------------------------------------------ */

  const ligneAvis = (a) => {
    if (typeof a === 'string') return `<li>${txt(a)}</li>`;
    const note = rempli(a.note) ? `note ${esc(String(a.note).replace('.', ','))}` : (rempli(a.noteBrute) ? esc(a.noteBrute) : 'note non publiée');
    const nb = rempli(a.nombreAvis)
      ? `, ${esc(a.nombreAvis)} avis`
      : (rempli(a.nombreAvisBrut) ? `, ${esc(a.nombreAvisBrut)} avis` : '');
    const date = rempli(a.dateReleve) ? `, relevé le ${esc(a.dateReleve)}` : '';
    const src = rempli(a.source) ? ` — ${txt(a.source)}` : '';
    const com = rempli(a.commentaire) ? `<br>${txt(a.commentaire)}` : '';
    const comp = rempli(a.complements) ? `<br>${txt(a.complements)}` : '';
    const nom = rempli(a.plateforme) ? `<strong>${txt(a.plateforme)}</strong> — ` : '';
    return `<li>${nom}${note}${nb}${date}${src}${com}${comp}</li>`;
  };

  const renderMarche = (pa, taxo) => {
    const rc = bloc(pa, 'referencesClients') || {};
    const rep = bloc(pa, 'reputation') || {};
    const dyn = bloc(pa, 'dynamique') || {};
    if (!rempli(rc) && !rempli(rep) && !rempli(dyn)) return;
    const parSecteur = rc.parSecteur || {};
    const secteurs = Object.entries(parSecteur).filter(([, l]) => Array.isArray(l) && l.length);
    const avis = listeOf(rep.avis).filter((a) => typeof a === 'string'
      || rempli(a.plateforme) || rempli(a.note) || rempli(a.noteBrute)
      || rempli(a.nombreAvis) || rempli(a.commentaire));

    document.getElementById('pa-marche').innerHTML = dl([
      ['Périmètre des références', relev(rc.perimetre)],
      ['Références clients par secteur', secteurs.length
        ? `<ul>${secteurs.map(([sec, l]) => `<li><strong>${label(taxo, 'secteurReferences', sec)}</strong> — ${txt(l)}</li>`).join('')}</ul>`
        : NON_RELEVE],
      ['Secteurs tels que libellés par l\u2019éditeur', relev(rc.libellesSecteursEditeur)],
      ['Références citées sur le site', relev(rc.nbCiteesSurSite)],
      ['Grands comptes cités', relev(rc.grandsComptes)],
      ['Références de l\u2019activité agréée confirmées', relev(rc.referencesPAConfirmees)],
      rempli(rc.attention) ? ['Point de vigilance', txt(rc.attention)] : null,
      rempli(rc.commentaire) ? ['Commentaire', txt(rc.commentaire)] : null,
      ligneSource(rc),
      ligneComplements(rc),
      ['Avis publics', avis.length
        ? `<ul>${avis.map(ligneAvis).join('')}</ul>`
        : (rempli(rep.synthese) ? txt(rep.synthese) : NON_RELEVE)],
      avis.length && rempli(rep.synthese) ? ['Synthèse des avis', txt(rep.synthese)] : null,
      rempli(rep.distribution) ? ['Distribution des notes', txt(rep.distribution)] : null,
      rempli(rep.commentaire) ? ['Réserve de méthode', txt(rep.commentaire)] : null,
      ligneSource(rep),
      ligneComplements(rep),
      ['Offres d\u2019emploi ouvertes', rempli(dyn.offresEmploiOuvertes)
        ? `${esc(dyn.offresEmploiOuvertes)}${rempli(dyn.offresLieesFacturationElectronique) ? `, dont ${esc(dyn.offresLieesFacturationElectronique)} liée(s) à la facturation électronique` : ''}${dyn.dateReleveOffres ? ` <span class="pa-conf pa-conf--ok">relevé le ${esc(dyn.dateReleveOffres)}</span>` : ''}`
        : NON_RELEVE]
    ]) + lectureBox(rc.lecture, rc.confiance) + lectureBox(rep.lecture, rep.confiance)
      + `<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content">Les références clients sont <strong>déclaratives</strong> : elles sont publiées par la plateforme elle-même et portent sur l\u2019ensemble de son catalogue, pas nécessairement sur son activité de plateforme agréée. Les avis ne sont repris qu\u2019en agrégat, jamais individuellement. Un volume d\u2019offres d\u2019emploi n\u2019est pas une mesure de rotation du personnel et n\u2019est pas présenté comme telle.</div></div>`;
    montrer('sec-marche', 'nav-marche');
  };

  /* ------------------------------------------------------------------ */
  /* Capacité de frappe, lecture concurrentielle, droit de réponse       */
  /* ------------------------------------------------------------------ */

  const renderLectureConcurrentielle = (pa, taxo) => {
    const texte = bloc(pa, 'lectureConcurrentielle');
    const cf = bloc(pa, 'capaciteDeFrappe') || {};
    const dr = bloc(pa, 'droitDeReponse') || {};
    if (!rempli(texte) && !rempli(cf) && !rempli(dr)) return;
    const act = cf.actionnariat || {};
    const pts = listeOf(dr.pointsContestables);

    const html = dl([
      ['Canal de distribution', relev(cf.canal)],
      ['Maillage territorial', relev(cf.maillage)],
      ['Effectif commercial', relev(cf.effectifCommercial)],
      ['Investissements annoncés', relev(cf.investissementsAnnonces)],
      ['Actionnaires', relev(act.actionnaires)],
      ['Type d\u2019actionnaire', rempli(act.type) ? label(taxo, 'typeActionnaire', act.type) : TODO],
      rempli(act.detail) ? ['Détail de l\u2019actionnariat', txt(act.detail)] : null,
      rempli(act.source) ? ['Source de l\u2019actionnariat', txt(act.source)] : null,
      ['Financement récent', val(cf.financementRecent)],
      ['Acquisitions', relev(cf.acquisitions)],
      ['Modèle tarifaire', val(cf.modeleTarifaire)],
      ['Tarif public', rempli(cf.tarifPublie) ? oui(cf.tarifPublie) : TODO],
      rempli(cf.offreGratuite) ? ['Offre gratuite', txt(cf.offreGratuite)] : null,
      ligneSource(cf),
      ligneComplements(cf)
    ]) + lectureBox(cf.lecture, cf.confiance) + lectureBox(texte, null)
      + (dr.signale === true
        ? `<div class="callout callout--info"><div class="callout-icon">✉️</div><div class="callout-content"><strong>Droit de réponse exercé${dr.date ? ` le ${esc(dr.date)}` : ''}.</strong> ${txt(dr.objet)}${rempli(dr.canal) ? `<br>Reçu par : ${txt(dr.canal)}` : ''}</div></div>`
        : '')
      + ((pts.length || rempli(dr.lecture) || rempli(dr.objet) || rempli(dr.complements))
        ? `<div class="callout callout--info"><div class="callout-icon">⚖️</div><div class="callout-content"><strong>Ce que la plateforme pourrait légitimement contester.</strong> Cette rubrique est publiée par honnêteté méthodologique : elle liste les points de cette fiche qui reposent sur une lecture Fluxym et non sur une donnée relevée.${pts.length ? txt(pts) : ''}${rempli(dr.objet) && dr.signale !== true ? `<br>${txt(dr.objet)}` : ''}${rempli(dr.lecture) ? `<br>${txt(dr.lecture)}` : ''}${rempli(dr.complements) ? txt(dr.complements) : ''}</div></div>`
        : '')
      + `<div class="callout callout--info"><div class="callout-icon">✉️</div><div class="callout-content">Une information de cette fiche vous paraît inexacte ou périmée ? Toute correction sourcée est appliquée. <a href="./methodologie-plateformes.html#correction">Exercer un droit de réponse</a>.</div></div>`;
    document.getElementById('pa-lecture-concurrentielle').innerHTML = html;
    montrer('sec-lecture', 'nav-lecture');
  };

  /* ------------------------------------------------------------------ */
  /* Rendu principal                                                    */
  /* ------------------------------------------------------------------ */

  let all_meta = null;

  const render = (pa, taxo, all) => {
    document.title = `${pa.nom} — plateforme agréée | Re·Form·E`;
    document.getElementById('pa-nom').textContent = pa.nom;
    document.getElementById('pa-bc').textContent = pa.nom;
    document.getElementById('pa-statut').textContent = pa.statut === 'immatriculee_definitive'
      ? 'Plateforme agréée immatriculée'
      : 'Candidate en attente des tests d\u2019interopérabilité';
    document.getElementById('pa-accroche').innerHTML = pa.dateImmatriculation
      ? `Numéro d\u2019immatriculation délivré le <strong>${esc(pa.dateImmatriculation)}</strong>${pa.vague ? ` — ${esc(pa.vague)}` : ''}.`
      : 'Date de délivrance du numéro d\u2019immatriculation non encore publiée par la DGFiP.';

    document.getElementById('pa-identite').innerHTML = dl([
      ['Nom commercial déclaré à la DGFiP', esc(pa.nom)],
      ['Raison sociale', val(pa.raisonSociale)],
      ['SIREN', pa.siren
        ? lien(`https://annuaire-entreprises.data.gouv.fr/entreprise/${pa.siren}`, pa.siren) : TODO],
      ['Date de création de l\u2019entreprise', val(pa.dateCreation)],
      ['Effectif salarié (INSEE)', val(pa.trancheEffectif)],
      ['Catégorie d\u2019entreprise (INSEE)', val(pa.categorieEntreprise)],
      ['Code activité principale', val(pa.activitePrincipale)],
      ['Établissement déclaré à la DGFiP', val(pa.adresse)],
      ['Pays', val(pa.pays)],
      ['Site web', pa.siteWeb ? lien(pa.siteWeb) : TODO],
      ['Fiabilité de l\u2019identité juridique', confiance(pa.confianceIdentite)]
    ]);

    document.getElementById('pa-positionnement').innerHTML = dl([
      ['Famille d\u2019origine', (pa.familleOrigine || []).length
        ? pa.familleOrigine.map((v) => label(taxo, 'familleOrigine', v)).join(', ') : TODO],
      ['Segments cibles', (pa.segmentCible || []).length
        ? pa.segmentCible.map((v) => label(taxo, 'segmentCible', v)).join(', ') : TODO],
      ['Verticale', pa.verticale ? label(taxo, 'verticale', pa.verticale) : TODO],
      ['Logique du positionnement PA', pa.natureEntite ? label(taxo, 'natureEntite', pa.natureEntite) : TODO],
      ['Périmètre fonctionnel', (pa.perimetreFonctionnel || []).length
        ? pa.perimetreFonctionnel.map((v) => label(taxo, 'perimetreFonctionnel', v)).join(', ') : TODO],
      ['Réseaux', (pa.reseaux || []).length
        ? pa.reseaux.map((v) => label(taxo, 'reseaux', v)).join(', ') : TODO],
      ['Caractérisation', val(pa.descriptionFiche)],
      ['Cohérence avec le métier d\u2019origine', val(pa.logiquePositionnement)]
    ]);

    const s = pa.socleTechnique || {};
    document.getElementById('pa-socle').innerHTML = dl([
      ['Type de socle', s.type ? label(taxo, 'socleTechnique.type', s.type) : TODO],
      ['Opérateur du socle', val(s.operateurSocle)],
      ['Fournit son socle à d\u2019autres plateformes', oui(pa.fournisseurDeSocle)],
      ['Modes de distribution', (pa.modeDistributionSocle || []).length
        ? esc(pa.modeDistributionSocle.join(', ')) : TODO],
      ['Élément de preuve', val(s.preuve)],
      ['Solutions Compatibles partenaires déclarées', (pa.solutionsCompatiblesPartenaires || []).length
        ? `<div class="pa-tags">${pa.solutionsCompatiblesPartenaires.map((x) => `<span class="pa-tag">${esc(x)}</span>`).join('')}</div>
           <p class="pa-partner-count">${pa.solutionsCompatiblesPartenaires.length} éditeurs identifiés à partir des sources publiées par la plateforme.</p>`
        : TODO]
    ]) + `<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content"><strong>Rappel.</strong> « Marque blanche » et « marque grise » sont des notions commerciales, pas réglementaires. ${esc(pa.nom)} est immatriculée en son nom propre, a passé ses propres tests d\u2019interopérabilité et reste seule responsable devant l\u2019administration, quelle que soit l\u2019origine de son socle technique.</div></div>`;

    const liees = pa.immatriculationsLiees;
    const ligneLiees = () => {
      if (!liees || !(liees.entrees || []).length) return TODO;
      // `entrees` accepte les deux formes : chaînes ou objets { nom, siren }.
      const noms = liees.entrees.map((e) => (typeof e === 'string' ? e : (e && e.nom))).filter(Boolean);
      const autres = noms.filter((n) => n !== pa.nom);
      const liens = autres.length
        ? `<div class="pa-segment-list">${autres.map((n) => `<a href="./pa-detail.html?pa=${slugify(n)}">${esc(n)}</a>`).join('')}</div>`
        : '';
      const type = liees.type ? label(taxo, 'liaisonImmatriculations', liees.type) : '';
      return `<strong>${esc(liees.groupe)}</strong>${type ? ` <span class="pa-conf pa-conf--ok">${type}</span>` : ''}
        ${liens}${liees.lecture ? `<p>${txt(liees.lecture)}</p>` : ''}
        ${liees.source ? `<p class="pa-partner-count">${txt(liees.source)}${liees.dateReleve ? ` — relevé du ${esc(liees.dateReleve)}` : ''}</p>` : ''}`;
    };

    document.getElementById('pa-actionnariat').innerHTML = dl([
      ['Groupe d\u2019appartenance', val(pa.groupeCapitalistique)],
      ['Autres immatriculations du m\u00eame groupe', ligneLiees()],
      ['Nature de l\u2019actionnariat', pa.relationCapitalistique
        ? label(taxo, 'relationCapitalistique', pa.relationCapitalistique) : TODO],
      ['Dirigeants (RNE)', (pa.dirigeants || []).length
        ? `<ul>${pa.dirigeants.map((d) => `<li>${esc(d.nom)}${d.qualite ? ` — ${esc(d.qualite)}` : ''}</li>`).join('')}</ul>`
        : TODO],
      ['Levées de fonds', val(pa.leveeDeFonds)],
      ['Partenariats et accords', (pa.partenariats || []).length
        ? `<ul>${pa.partenariats.map((p) => `<li>${txt(p)}</li>`).join('')}</ul>` : TODO]
    ]);

    renderInternational(pa);
    renderActivite(pa);
    renderCentralite(pa, taxo);
    renderMarche(pa, taxo);
    renderLectureConcurrentielle(pa, taxo);

    const meme = all.filter((x) => x.nom !== pa.nom
      && (x.familleOrigine || []).some((f) => (pa.familleOrigine || []).includes(f))
      && (x.segmentCible || []).some((c) => (pa.segmentCible || []).includes(c)));
    document.getElementById('pa-concurrents').innerHTML = meme.length
      ? `<div class="pa-segment-list">${meme.map((x) => `<a href="./pa-detail.html?pa=${slugify(x.nom)}">${esc(x.nom)}</a>`).join('')}</div>`
      : '<div class="callout callout--info"><div class="callout-icon">🚧</div><div class="callout-content">Le rapprochement concurrentiel s\u2019affichera dès que la famille d\u2019origine et le segment cible de cette plateforme auront été qualifiés.</div></div>';

    const m = all_meta;
    document.getElementById('pa-sources').innerHTML = dl([
      ['Liste officielle', `${lien(m.sourceUrl, 'DGFiP — impots.gouv.fr')}, relevé du ${new Date(m.dateReleve).toLocaleDateString('fr-FR')} (fichier mis à jour le ${new Date(m.dateMiseAJourDGFiP).toLocaleDateString('fr-FR')})`],
      ['Identité de l\u2019entreprise', 'API Recherche d\u2019entreprises (INSEE / RNE) — annuaire-entreprises.data.gouv.fr'],
      ['Champs qualifiés', (pa.sourcesEnrichissement || []).length
        ? `<ul>${pa.sourcesEnrichissement.map((x) => {
            // Une source peut être une URL nue ou un objet ; les deux formes sont rendues.
            if (typeof x === 'string') return `<li>${txt(x)}</li>`;
            const champ = rempli(x.champ) && x.champ !== 'non_precise' ? `<strong>${esc(x.champ)}</strong> — ` : '';
            const src = txt(x.source) || txt(x.libelle) || txt(x.url) || NON_RELEVE;
            const meta = [
              rempli(x.dateReleve) ? esc(x.dateReleve) : 'date de relevé non renseignée',
              `confiance : ${esc(rempli(x.confiance) ? x.confiance : 'non qualifiée')}`
            ].join(', ');
            const lib = rempli(x.libelle) && x.libelle !== x.source ? `<br>${txt(x.libelle)}` : '';
            return `<li>${champ}${src} (${meta})${lib}</li>`;
          }).join('')}</ul>`
        : TODO]
    ]);
  };

  const init = async () => {
    const slug = new URLSearchParams(window.location.search).get('pa');
    const [data, taxo] = await Promise.all([
      fetch(DATA).then((r) => r.json()),
      fetch(TAXO).then((r) => r.json())
    ]);
    all_meta = data._meta;
    const pa = data.plateformes.find((x) => slugify(x.nom) === slug);
    if (!pa) {
      document.getElementById('pa-nom').textContent = 'Plateforme introuvable';
      document.getElementById('pa-article').innerHTML = '<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content">Cette fiche n\u2019existe pas. <a href="./plateformes-agreees.html">Revenir à l\u2019annuaire des plateformes agréées</a>.</div></div>';
      return;
    }
    render(pa, taxo, data.plateformes);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
