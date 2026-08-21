/* pa-detail.js — fiche d'une plateforme agréée (Re·Form·E) */
(() => {
  'use strict';

  const DATA = './data/plateformes-agreees.json';
  const TAXO = './data/pa-taxonomie.json';

  const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const TODO = '<span class="pa-todo">Non renseigné — qualification en cours</span>';
  const val = (v) => (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) ? TODO : v;

  const label = (taxo, facetteId, v) => {
    const f = taxo.facettes.find((x) => x.id === facetteId);
    if (!f) return v;
    const found = (f.valeurs || []).find((x) => x.v === v);
    return found ? found.label : v;
  };

  const dl = (rows) => `<dl class="pa-dl">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;

  const confiance = (c) => {
    if (c === 'haute') return '<span class="pa-conf pa-conf--ok">Donnée appariée automatiquement, concordance nom + localisation</span>';
    if (c === 'moyenne') return '<span class="pa-conf pa-conf--warn">Appariement à vérifier manuellement</span>';
    return '<span class="pa-conf pa-conf--todo">Identité juridique non encore appariée</span>';
  };

  const NON_RELEVE = '<span class="pa-todo">Non relevé à ce jour</span>';

  const bloc = (pa, ...cles) => cles.reduce((o, k) => (o ? o[k] : null), pa.analyse360 || null);

  const rempli = (v) => !(v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)
    || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length));

  const montrer = (secId, navId) => {
    const sec = document.getElementById(secId);
    const nav = document.getElementById(navId);
    if (sec) sec.hidden = false;
    if (nav) nav.hidden = false;
  };

  /** Bloc de lecture : toute interprétation Fluxym est signalée comme telle. */
  const lectureBox = (texte, confianceNiveau) => `
    <div class="callout callout--info">
      <div class="callout-icon">🧭</div>
      <div class="callout-content">
        <strong>Lecture Fluxym — interprétation, et non donnée relevée.</strong>
        ${texte}
        ${confianceNiveau ? `<br><em>Niveau de confiance de cette lecture : ${confianceNiveau}.</em>` : ''}
        <br><a href="./methodologie-plateformes.html">Comment cette lecture est établie</a>
      </div>
    </div>`;

  const euros = (m) => (m === null || m === undefined ? null : `${String(m).replace('.', ',')} M€`);

  const ligneCA = (ca, intitule) => {
    if (!ca || !rempli(ca.montantMEUR)) return [intitule, NON_RELEVE];
    const det = [ca.exercice ? `exercice ${ca.exercice}` : null, ca.nature === 'comptes_deposes' ? 'comptes déposés'
      : (ca.nature === 'declare_site' ? 'chiffre déclaré par l\u2019entreprise' : ca.nature)].filter(Boolean).join(', ');
    return [intitule, `<strong>${euros(ca.montantMEUR)}</strong>${det ? ` <span class="pa-conf pa-conf--ok">${det}</span>` : ''}`];
  };

  const renderInternational = (pa) => {
    const i = pa.identiteInternationale;
    if (!rempli(i)) return;
    const pf = i.presenceEnFrance || {};
    const typesFr = { filiale: 'Filiale française', succursale: 'Succursale française', representant: 'Représentant en France', aucune_connue: 'Aucune entité française connue', aucune_identifiee: 'Aucune entité française identifiée' };
    document.getElementById('pa-international').innerHTML = dl([
      ['Pays du siège', val(i.paysISO)],
      ['Registre national', val(i.registreNational)],
      ['Identifiant au registre', val(i.identifiantRegistre)],
      ['Numéro de TVA intracommunautaire', i.numeroTVAIntracom
        ? `${i.numeroTVAIntracom}${i.tvaVerifieeVIES ? ` <span class="pa-conf pa-conf--ok">vérifié à VIES${i.dateVerificationVIES ? ` le ${i.dateVerificationVIES}` : ''}</span>` : ' <span class="pa-conf pa-conf--warn">non vérifié à VIES</span>'}`
        : TODO],
      ['Identifiant européen (EUID)', val(i.euid)],
      ['Identifiant d\u2019entité juridique (LEI)', val(i.lei)],
      ['Forme juridique', val(i.formeJuridique)],
      ['Code d\u2019activité (NACE)', val(i.codeNACE)],
      ['Catégorie de taille (UE)', val(i.categorieUE)],
      ['Présence en France', pf.type ? `${typesFr[pf.type] || pf.type}${pf.siren ? ` — SIREN <a href="https://annuaire-entreprises.data.gouv.fr/entreprise/${pf.siren}" target="_blank" rel="noopener">${pf.siren}</a>` : ''}` : TODO],
      ['Identifiant Peppol', val(i.peppolParticipantId)]
    ]) + `<div class="callout callout--info"><div class="callout-icon">ℹ️</div><div class="callout-content">Cette entité n\u2019est pas immatriculée au répertoire SIRENE : son identité est établie à partir du registre national de son pays de siège. L\u2019absence de SIREN n\u2019est ni une anomalie, ni un manque de données.</div></div>`;
    montrer('sec-international', 'nav-international');
  };

  const renderActivite = (pa) => {
    const metier = bloc(pa, 'metierPrincipal');
    const activites = bloc(pa, 'activites') || [];
    const pe = bloc(pa, 'poidsEconomique') || {};
    if (!rempli(metier) && !activites.length && !rempli(pe)) return;
    const poids = { majeur: 'Activité majeure', significatif: 'Activité significative', mineur: 'Activité mineure' };
    const vpa = pe.ventilationParActivite || {};
    document.getElementById('pa-activite').innerHTML = dl([
      ['Métier principal', val(metier)],
      ['Lignes d\u2019activité identifiées', activites.length
        ? `<ul>${activites.map((a) => `<li><strong>${a.libelle}</strong>${a.poids ? ` — ${poids[a.poids] || a.poids}` : ''}</li>`).join('')}</ul>`
        : NON_RELEVE],
      ligneCA(pe.caGroupe, 'Chiffre d\u2019affaires du groupe'),
      ligneCA(pe.caEntiteFrancaise, 'Chiffre d\u2019affaires de l\u2019entité française'),
      ['Résultat net', rempli(pe.resultatNet)
        ? (typeof pe.resultatNet === 'number' ? euros(pe.resultatNet) : pe.resultatNet)
        : NON_RELEVE],
      ['Effectif du groupe', rempli(pe.effectifGroupe) ? String(pe.effectifGroupe) : NON_RELEVE],
      ['Effectif de l\u2019entité', val(pe.effectifEntite)],
      ['Répartition du chiffre d\u2019affaires par activité', vpa.disponible === false
        ? `<span class="pa-todo">Non publiée</span>${vpa.motif ? ` — ${vpa.motif}` : ''}`
        : (rempli(vpa.derniereVentilationConnue) ? vpa.derniereVentilationConnue : NON_RELEVE)]
    ]) + `<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content"><strong>Deux périmètres, deux chiffres.</strong> Le chiffre d\u2019affaires du groupe et celui de l\u2019entité française ne sont jamais additionnés ni confondus. La part du chiffre d\u2019affaires attribuable à l\u2019activité de plateforme agréée n\u2019est publiée par aucun acteur du marché : elle n\u2019est donc jamais estimée ici.</div></div>`;
    montrer('sec-activite', 'nav-activite');
  };

  const renderCentralite = (pa, taxo) => {
    const c = bloc(pa, 'centralitePA');
    if (!rempli(c) || !rempli(c.niveau)) return;
    const f = taxo.facettes.find((x) => x.id === 'centralitePA');
    const v = f ? (f.valeurs || []).find((x) => x.v === c.niveau) : null;
    const indices = c.faisceauIndices || [];
    const signe = (x) => (x.sens === '+' ? '↑' : (x.sens === '-' || x.sens === '\u2212' ? '↓' : '•'));
    document.getElementById('pa-centralite').innerHTML = dl([
      ['Niveau', `<strong>${v && v.indice !== null && v.indice !== undefined ? `${v.indice} sur 4 — ` : ''}${v ? v.label : c.niveau}</strong>${v && v.definition ? `<br><span class="pa-conf pa-conf--ok">${v.definition}</span>` : ''}`],
      ['Marque produit dédiée', val(c.marqueProduitDediee)],
      ['Entité juridique dédiée', c.entiteJuridiqueDediee === null || c.entiteJuridiqueDediee === undefined ? TODO : (c.entiteJuridiqueDediee ? 'Oui' : 'Non')],
      ['Indices relevés', indices.length
        ? `<ul>${indices.map((x) => `<li>${signe(x)} ${x.signal}${x.preuve ? ` <span class="pa-conf pa-conf--ok">${x.preuve}</span>` : ''}</li>`).join('')}</ul>`
        : NON_RELEVE]
    ]) + (rempli(c.lecture) ? lectureBox(c.lecture, c.confiance) : '');
    montrer('sec-centralite', 'nav-centralite');
  };

  const renderMarche = (pa, taxo) => {
    const rc = bloc(pa, 'referencesClients') || {};
    const rep = bloc(pa, 'reputation') || {};
    const dyn = bloc(pa, 'dynamique') || {};
    if (!rempli(rc) && !rempli(rep) && !rempli(dyn)) return;
    const parSecteur = rc.parSecteur || {};
    const secteurs = Object.entries(parSecteur).filter(([, l]) => Array.isArray(l) && l.length);
    const avis = (rep.avis || []).filter((a) => rempli(a.note) || rempli(a.nbAvis));
    document.getElementById('pa-marche').innerHTML = dl([
      ['Références clients par secteur', secteurs.length
        ? `<ul>${secteurs.map(([sec, l]) => `<li><strong>${label(taxo, 'secteurReferences', sec)}</strong> — ${l.join(', ')}</li>`).join('')}</ul>`
        : NON_RELEVE],
      ['Références citées sur le site', rempli(rc.nbCiteesSurSite) ? String(rc.nbCiteesSurSite) : NON_RELEVE],
      ['Références de l\u2019activité agréée confirmées', (rc.referencesPAConfirmees || []).length ? rc.referencesPAConfirmees.join(', ') : NON_RELEVE],
      ['Avis publics', avis.length
        ? `<ul>${avis.map((a) => `<li><strong>${a.plateforme}</strong> — ${rempli(a.note) ? `note ${a.note}` : 'note non publiée'}${rempli(a.nbAvis) ? `, ${a.nbAvis} avis` : ''}${a.dateReleve ? `, relevé le ${a.dateReleve}` : ''}${a.url ? ` — <a href="${a.url}" target="_blank" rel="noopener">source</a>` : ''}</li>`).join('')}</ul>`
        : (rep.volumeAvis === 'inexistant' ? '<span class="pa-todo">Aucun avis public identifié</span>' : NON_RELEVE)],
      ['Offres d\u2019emploi ouvertes', rempli(dyn.offresEmploiOuvertes)
        ? `${dyn.offresEmploiOuvertes}${rempli(dyn.offresLieesFacturationElectronique) ? `, dont ${dyn.offresLieesFacturationElectronique} liée(s) à la facturation électronique` : ''}${dyn.dateReleveOffres ? ` <span class="pa-conf pa-conf--ok">relevé le ${dyn.dateReleveOffres}</span>` : ''}`
        : NON_RELEVE]
    ]) + `<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content">Les références clients sont <strong>déclaratives</strong> : elles sont publiées par la plateforme elle-même et portent sur l\u2019ensemble de son catalogue, pas nécessairement sur son activité de plateforme agréée. Les avis ne sont repris qu\u2019en agrégat, jamais individuellement. Un volume d\u2019offres d\u2019emploi n\u2019est pas une mesure de rotation du personnel et n\u2019est pas présenté comme telle.</div></div>`;
    montrer('sec-marche', 'nav-marche');
  };

  const renderLectureConcurrentielle = (pa, taxo) => {
    const texte = bloc(pa, 'lectureConcurrentielle');
    const cf = bloc(pa, 'capaciteDeFrappe') || {};
    const dr = bloc(pa, 'droitDeReponse') || {};
    if (!rempli(texte) && !rempli(cf)) return;
    const html = dl([
      ['Actionnaires', (cf.actionnaires || []).length ? cf.actionnaires.join(', ') : NON_RELEVE],
      ['Type d\u2019actionnaire', cf.typeActionnaire ? label(taxo, 'typeActionnaire', cf.typeActionnaire) : TODO],
      ['Financement récent', val(cf.financementRecent)],
      ['Acquisitions', (cf.acquisitions || []).length ? `<ul>${cf.acquisitions.map((x) => `<li>${x}</li>`).join('')}</ul>` : NON_RELEVE],
      ['Modèle tarifaire', val(cf.modeleTarifaire)],
      ['Tarif public', cf.tarifPublie === null || cf.tarifPublie === undefined ? TODO : (cf.tarifPublie ? 'Oui' : 'Non publié')]
    ]) + (rempli(texte) ? lectureBox(texte, null) : '')
      + (dr.signale ? `<div class="callout callout--info"><div class="callout-icon">✉️</div><div class="callout-content"><strong>Droit de réponse exercé${dr.date ? ` le ${dr.date}` : ''}.</strong> ${dr.objet || ''}</div></div>` : '')
      + `<div class="callout callout--info"><div class="callout-icon">✉️</div><div class="callout-content">Une information de cette fiche vous paraît inexacte ou périmée ? Toute correction sourcée est appliquée. <a href="./methodologie-plateformes.html#correction">Exercer un droit de réponse</a>.</div></div>`;
    document.getElementById('pa-lecture-concurrentielle').innerHTML = html;
    montrer('sec-lecture', 'nav-lecture');
  };

  const render = (pa, taxo, all) => {
    document.title = `${pa.nom} — plateforme agréée | Re·Form·E`;
    document.getElementById('pa-nom').textContent = pa.nom;
    document.getElementById('pa-bc').textContent = pa.nom;
    document.getElementById('pa-statut').textContent = pa.statut === 'immatriculee_definitive'
      ? 'Plateforme agréée immatriculée'
      : 'Candidate en attente des tests d\u2019interopérabilité';
    document.getElementById('pa-accroche').innerHTML = pa.dateImmatriculation
      ? `Numéro d\u2019immatriculation délivré le <strong>${pa.dateImmatriculation}</strong>${pa.vague ? ` — ${pa.vague}` : ''}.`
      : 'Date de délivrance du numéro d\u2019immatriculation non encore publiée par la DGFiP.';

    document.getElementById('pa-identite').innerHTML = dl([
      ['Nom commercial déclaré à la DGFiP', pa.nom],
      ['Raison sociale', val(pa.raisonSociale)],
      ['SIREN', pa.siren ? `<a href="https://annuaire-entreprises.data.gouv.fr/entreprise/${pa.siren}" target="_blank" rel="noopener">${pa.siren}</a>` : TODO],
      ['Date de création de l\u2019entreprise', val(pa.dateCreation)],
      ['Effectif salarié (INSEE)', val(pa.trancheEffectif)],
      ['Catégorie d\u2019entreprise (INSEE)', val(pa.categorieEntreprise)],
      ['Code activité principale', val(pa.activitePrincipale)],
      ['Établissement déclaré à la DGFiP', val(pa.adresse)],
      ['Pays', val(pa.pays)],
      ['Site web', pa.siteWeb ? `<a href="${pa.siteWeb}" target="_blank" rel="noopener">${pa.siteWeb}</a>` : TODO],
      ['Fiabilité de l\u2019identité juridique', confiance(pa.confianceIdentite)]
    ]);

    document.getElementById('pa-positionnement').innerHTML = dl([
      ['Famille d\u2019origine', (pa.familleOrigine || []).length ? pa.familleOrigine.map((v) => label(taxo, 'familleOrigine', v)).join(', ') : TODO],
      ['Segments cibles', (pa.segmentCible || []).length ? pa.segmentCible.map((v) => label(taxo, 'segmentCible', v)).join(', ') : TODO],
      ['Verticale', pa.verticale ? label(taxo, 'verticale', pa.verticale) : TODO],
      ['Logique du positionnement PA', pa.natureEntite ? label(taxo, 'natureEntite', pa.natureEntite) : TODO],
      ['Périmètre fonctionnel', (pa.perimetreFonctionnel || []).length ? pa.perimetreFonctionnel.map((v) => label(taxo, 'perimetreFonctionnel', v)).join(', ') : TODO],
      ['Réseaux', (pa.reseaux || []).length ? pa.reseaux.map((v) => label(taxo, 'reseaux', v)).join(', ') : TODO],
      ['Caractérisation', val(pa.descriptionFiche)],
      ['Cohérence avec le métier d\u2019origine', val(pa.logiquePositionnement)]
    ]);

    const s = pa.socleTechnique || {};
    document.getElementById('pa-socle').innerHTML = dl([
      ['Type de socle', s.type ? label(taxo, 'socleTechnique.type', s.type) : TODO],
      ['Opérateur du socle', val(s.operateurSocle)],
      ['Fournit son socle à d\u2019autres plateformes', pa.fournisseurDeSocle === null || pa.fournisseurDeSocle === undefined ? TODO : (pa.fournisseurDeSocle ? 'Oui' : 'Non')],
      ['Modes de distribution', (pa.modeDistributionSocle || []).length ? pa.modeDistributionSocle.join(', ') : TODO],
      ['Élément de preuve', val(s.preuve)],
      ['Solutions Compatibles partenaires déclarées', (pa.solutionsCompatiblesPartenaires || []).length
        ? `<div class="pa-tags">${pa.solutionsCompatiblesPartenaires.map((x) => `<span class="pa-tag">${x}</span>`).join('')}</div>
           <p class="pa-partner-count">${pa.solutionsCompatiblesPartenaires.length} éditeurs identifiés à partir des sources publiées par la plateforme.</p>`
        : TODO]
    ]) + `<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content"><strong>Rappel.</strong> « Marque blanche » et « marque grise » sont des notions commerciales, pas réglementaires. ${pa.nom} est immatriculée en son nom propre, a passé ses propres tests d\u2019interopérabilité et reste seule responsable devant l\u2019administration, quelle que soit l\u2019origine de son socle technique.</div></div>`;

    document.getElementById('pa-actionnariat').innerHTML = dl([
      ['Groupe d\u2019appartenance', val(pa.groupeCapitalistique)],
      ['Nature de l\u2019actionnariat', pa.relationCapitalistique ? label(taxo, 'relationCapitalistique', pa.relationCapitalistique) : TODO],
      ['Dirigeants (RNE)', (pa.dirigeants || []).length ? `<ul>${pa.dirigeants.map((d) => `<li>${d.nom}${d.qualite ? ` — ${d.qualite}` : ''}</li>`).join('')}</ul>` : TODO],
      ['Levées de fonds', val(pa.leveeDeFonds)],
      ['Partenariats et accords', (pa.partenariats || []).length ? `<ul>${pa.partenariats.map((p) => `<li>${p}</li>`).join('')}</ul>` : TODO]
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
      ? `<div class="pa-segment-list">${meme.map((x) => `<a href="./pa-detail.html?pa=${slugify(x.nom)}">${x.nom}</a>`).join('')}</div>`
      : '<div class="callout callout--info"><div class="callout-icon">🚧</div><div class="callout-content">Le rapprochement concurrentiel s\u2019affichera dès que la famille d\u2019origine et le segment cible de cette plateforme auront été qualifiés.</div></div>';

    const m = all_meta;
    document.getElementById('pa-sources').innerHTML = dl([
      ['Liste officielle', `<a href="${m.sourceUrl}" target="_blank" rel="noopener">DGFiP — impots.gouv.fr</a>, relevé du ${new Date(m.dateReleve).toLocaleDateString('fr-FR')} (fichier mis à jour le ${new Date(m.dateMiseAJourDGFiP).toLocaleDateString('fr-FR')})`],
      ['Identité de l\u2019entreprise', 'API Recherche d\u2019entreprises (INSEE / RNE) — annuaire-entreprises.data.gouv.fr'],
      ['Champs qualifiés', (pa.sourcesEnrichissement || []).length ? `<ul>${pa.sourcesEnrichissement.map((x) => `<li><strong>${x.champ}</strong> — ${x.source} (${x.dateReleve}, confiance : ${x.confiance})</li>`).join('')}</ul>` : TODO]
    ]);
  };

  let all_meta = null;

  const init = async () => {
    const slug = new URLSearchParams(window.location.search).get('pa');
    const [data, taxo] = await Promise.all([fetch(DATA).then((r) => r.json()), fetch(TAXO).then((r) => r.json())]);
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