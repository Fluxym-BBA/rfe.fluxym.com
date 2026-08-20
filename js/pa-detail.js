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

  const liste = (v) => (Array.isArray(v) ? v : (v === null || v === undefined || v === '' ? [] : [v]));

  const dl = (rows) => `<dl class="pa-dl">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;

  const confiance = (c) => {
    if (c === 'haute') return '<span class="pa-conf pa-conf--ok">Donnée appariée automatiquement, concordance nom + localisation</span>';
    if (c === 'moyenne') return '<span class="pa-conf pa-conf--warn">Appariement à vérifier manuellement</span>';
    return '<span class="pa-conf pa-conf--todo">Identité juridique non encore appariée</span>';
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
      ['Famille d\u2019origine', liste(pa.familleOrigine).length ? liste(pa.familleOrigine).map((v) => label(taxo, 'familleOrigine', v)).join(', ') : TODO],
      ['Segments cibles', liste(pa.segmentCible).length ? liste(pa.segmentCible).map((v) => label(taxo, 'segmentCible', v)).join(', ') : TODO],
      ['Verticale', pa.verticale
        ? `${label(taxo, 'verticale', pa.verticale)}${pa.verticalePrecision ? ` <em>— ${pa.verticalePrecision}</em>` : ''}`
        : TODO],
      ['Logique du positionnement PA', pa.natureEntite ? label(taxo, 'natureEntite', pa.natureEntite) : TODO],
      ['Périmètre fonctionnel', liste(pa.perimetreFonctionnel).length ? liste(pa.perimetreFonctionnel).map((v) => label(taxo, 'perimetreFonctionnel', v)).join(', ') : TODO],
      ['Réseaux', liste(pa.reseaux).length ? liste(pa.reseaux).map((v) => label(taxo, 'reseaux', v)).join(', ') : TODO],
      ['Caractérisation', val(pa.descriptionFiche)],
      ['Cohérence avec le métier d\u2019origine', val(pa.logiquePositionnement)]
    ]);

    const s = pa.socleTechnique || {};
    document.getElementById('pa-socle').innerHTML = dl([
      ['Type de socle', s.type ? label(taxo, 'socleTechnique.type', s.type) : TODO],
      ['Opérateur du socle', val(s.operateurSocle)],
      ['Fournit son socle à d\u2019autres plateformes', pa.fournisseurDeSocle === null || pa.fournisseurDeSocle === undefined ? TODO : (pa.fournisseurDeSocle ? 'Oui' : 'Non')],
      ['Modes de distribution', liste(pa.modeDistributionSocle).length ? liste(pa.modeDistributionSocle).join(', ') : TODO],
      ['Élément de preuve', val(s.preuve)],
      ['Solutions Compatibles partenaires déclarées', liste(pa.solutionsCompatiblesPartenaires).length
        ? `<div class="pa-tags">${liste(pa.solutionsCompatiblesPartenaires).map((x) => `<span class="pa-tag">${x}</span>`).join('')}</div>
           <p class="pa-partner-count">${liste(pa.solutionsCompatiblesPartenaires).length} éditeurs identifiés à partir des sources publiées par la plateforme.</p>`
        : TODO]
    ]) + `<div class="callout callout--warning"><div class="callout-icon">⚠️</div><div class="callout-content"><strong>Rappel.</strong> « Marque blanche » et « marque grise » sont des notions commerciales, pas réglementaires. ${pa.nom} est immatriculée en son nom propre, a passé ses propres tests d\u2019interopérabilité et reste seule responsable devant l\u2019administration, quelle que soit l\u2019origine de son socle technique.</div></div>`;

    document.getElementById('pa-actionnariat').innerHTML = dl([
      ['Groupe d\u2019appartenance', val(pa.groupeCapitalistique)],
      ['Nature de l\u2019actionnariat', pa.relationCapitalistique ? label(taxo, 'relationCapitalistique', pa.relationCapitalistique) : TODO],
      ['Dirigeants (RNE)', liste(pa.dirigeants).length ? `<ul>${liste(pa.dirigeants).map((d) => `<li>${d.nom}${d.qualite ? ` — ${d.qualite}` : ''}</li>`).join('')}</ul>` : TODO],
      ['Partenariats et accords', liste(pa.partenariats).length ? `<ul>${liste(pa.partenariats).map((p) => `<li>${p}</li>`).join('')}</ul>` : TODO]
    ]);

    const meme = all.filter((x) => x.nom !== pa.nom
      && liste(x.familleOrigine).some((f) => liste(pa.familleOrigine).includes(f))
      && liste(x.segmentCible).some((c) => liste(pa.segmentCible).includes(c)));
    document.getElementById('pa-concurrents').innerHTML = meme.length
      ? `<div class="pa-segment-list">${meme.map((x) => `<a href="./pa-detail.html?pa=${slugify(x.nom)}">${x.nom}</a>`).join('')}</div>`
      : '<div class="callout callout--info"><div class="callout-icon">🚧</div><div class="callout-content">Le rapprochement concurrentiel s\u2019affichera dès que la famille d\u2019origine et le segment cible de cette plateforme auront été qualifiés.</div></div>';

    const m = all_meta;
    document.getElementById('pa-sources').innerHTML = dl([
      ['Liste officielle', `<a href="${m.sourceUrl}" target="_blank" rel="noopener">DGFiP — impots.gouv.fr</a>, relevé du ${new Date(m.dateReleve).toLocaleDateString('fr-FR')} (fichier mis à jour le ${new Date(m.dateMiseAJourDGFiP).toLocaleDateString('fr-FR')})`],
      ['Identité de l\u2019entreprise', 'API Recherche d\u2019entreprises (INSEE / RNE) — annuaire-entreprises.data.gouv.fr'],
      ['Champs qualifiés', liste(pa.sourcesEnrichissement).length ? `<ul>${liste(pa.sourcesEnrichissement).map((x) => `<li><strong>${x.champ}</strong> — ${x.source} (${x.dateReleve}, confiance : ${x.confiance})</li>`).join('')}</ul>` : TODO]
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
