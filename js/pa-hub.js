/* pa-hub.js — annuaire et cartographie des plateformes agréées (Re·Form·E) */
(() => {
  'use strict';

  const DATA = './data/plateformes-agreees.json';
  const TAXO = './data/pa-taxonomie.json';

  const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const trancheAnnee = (a) => {
    if (!a) return null;
    const y = parseInt(a, 10);
    if (y < 2000) return 'avant 2000';
    if (y < 2011) return '2000-2010';
    if (y < 2021) return '2011-2020';
    return 'depuis 2021';
  };

  /* --- Données dérivées du bloc analyse360 --- */

  const bloc = (pa, ...cles) => cles.reduce((o, k) => (o ? o[k] : null), pa.analyse360 || null);

  const secteursDe = (pa) => {
    const parSecteur = bloc(pa, 'referencesClients', 'parSecteur');
    if (!parSecteur) return [];
    return Object.entries(parSecteur).filter(([, v]) => Array.isArray(v) && v.length).map(([k]) => k);
  };

  /**
   * Radar « angle mort » — trois niveaux, et non un booléen.
   *
   * Motif recherché : un acteur qui adresse l'ETI ou le grand compte sans être
   * un acteur installé de la dématérialisation, donc susceptible de remporter des
   * dossiers sur ce segment sans être identifié par une veille fondée sur le
   * discours public. Règle documentée dans
   * Info IA/plateformes-agreees/PRIORISATION-CONCURRENCE.md.
   *
   *   confirme      : diversification + ETI/GC + création postérieure à 2018
   *   a_surveiller  : deux des trois critères réunis
   *   non_evaluable : ETI/GC dont l'année de création est inconnue — le radar est
   *                   aveugle tant que l'identité juridique n'est pas renseignée
   */
  const RECENT = 2018;

  const signalAngleMort = (pa) => {
    const seg = pa.segmentCible || [];
    if (!seg.includes('eti') && !seg.includes('grands_comptes')) return null;
    const an = parseInt(pa.anneeCreation, 10);
    const anneeConnue = Number.isFinite(an);
    const diversification = pa.natureEntite === 'diversification';
    const recent = anneeConnue && an > RECENT;
    const installe = pa.natureEntite === 'extension_demat' && anneeConnue && an <= RECENT;
    const etranger = Boolean(pa.pays) && pa.pays !== 'France';
    if (diversification && recent) return 'confirme';
    if (etranger) return 'notoriete';
    if (diversification || (recent && !installe)) return 'a_surveiller';
    if (!anneeConnue) return 'non_evaluable';
    return null;
  };

  const FACETTE_ANGLE_MORT = {
    id: 'angleMort',
    label: 'Radar angle mort',
    filtrable: true,
    calculee: true,
    valeurs: [
      { v: 'confirme', label: 'Motif de récence — diversification récente sur ETI / grands comptes' },
      { v: 'notoriete', label: 'Motif de notoriété — entité étrangère sur ETI / grands comptes' },
      { v: 'a_surveiller', label: 'À surveiller — deux critères sur trois' },
      { v: 'non_evaluable', label: 'Non évaluable — année de création manquante' }
    ]
  };

  const state = { data: null, taxo: null, filters: new Map(), query: '' };

  const getValue = (pa, id) => {
    if (id === 'trancheAnneeCreation') return trancheAnnee(pa.anneeCreation);
    if (id === 'centralitePA') return bloc(pa, 'centralitePA', 'niveau');
    if (id === 'typeActionnaire') return bloc(pa, 'capaciteDeFrappe', 'typeActionnaire');
    if (id === 'postureCommerciale') return bloc(pa, 'postureCommerciale', 'valeur');
    if (id === 'secteurReferences') return secteursDe(pa);
    if (id === 'angleMort') return signalAngleMort(pa);
    if (id.includes('.')) return id.split('.').reduce((o, k) => (o ? o[k] : null), pa);
    return pa[id];
  };

  const labelOf = (facette, v) => {
    const found = (facette.valeurs || []).find((x) => x.v === v);
    return found ? found.label : String(v);
  };

  const renderCounters = () => {
    const m = state.data._meta;
    const pa = state.data.plateformes;
    const cells = [
      { n: m.nbImmatriculeesDefinitives, l: 'plateformes immatriculées', s: 'liste officielle DGFiP, tests d\u2019interopérabilité inclus' },
      { n: m.nbEnAttenteInterop, l: 'candidates en attente', s: 'dossier conforme, immatriculation définitive à venir' },
      { n: new Set(pa.map((p) => p.pays).filter(Boolean)).size, l: 'pays représentés', s: `dont ${pa.filter((p) => p.pays && p.pays !== 'France').length} entités non françaises` },
      { n: pa.filter((p) => p.vague && p.vague.startsWith('V1')).length, l: 'immatriculées dès la vague 1', s: 'décembre 2025 – janvier 2026' }
    ];
    document.getElementById('pa-counters').innerHTML = cells.map((c) => `
      <div class="counter-card">
        <div class="counter-value">${c.n}</div>
        <div class="counter-label">${c.l}</div>
        <div class="counter-detail">${c.s}</div>
      </div>`).join('');

    const d = new Date(m.dateReleve).toLocaleDateString('fr-FR');
    const dgfip = new Date(m.dateMiseAJourDGFiP).toLocaleDateString('fr-FR');
    const src = `Source : <a href="${m.sourceUrl}" target="_blank" rel="noopener">DGFiP — impots.gouv.fr</a>. Liste relevée le <strong>${d}</strong> (fichier DGFiP mis à jour le ${dgfip}). Ce nombre évolue chaque mois.`;
    document.getElementById('pa-source').innerHTML = src;
    document.getElementById('pa-meta').innerHTML = `<strong>${m.nbImmatriculeesDefinitives}</strong> plateformes immatriculées et <strong>${m.nbEnAttenteInterop}</strong> candidates — relevé du ${d}`;
  };

  const renderFacets = () => {
    const host = document.getElementById('pa-facets');
    const html = state.taxo.facettes.filter((f) => f.filtrable).map((f) => {
      const vals = new Map();
      state.data.plateformes.forEach((pa) => {
        const v = getValue(pa, f.id);
        (Array.isArray(v) ? v : [v]).filter((x) => x !== null && x !== undefined && x !== '')
          .forEach((x) => vals.set(x, (vals.get(x) || 0) + 1));
      });
      if (!vals.size) return '';
      const opts = [...vals.entries()].sort((a, b) => b[1] - a[1])
        .map(([v, n]) => `<option value="${String(v)}">${labelOf(f, v)} (${n})</option>`).join('');
      return `<label class="pa-facet"><span>${f.label}</span>
        <select data-facet="${f.id}"><option value="">Toutes</option>${opts}</select></label>`;
    }).join('');
    host.innerHTML = html;
    host.querySelectorAll('select').forEach((sel) => sel.addEventListener('change', (e) => {
      const { facet } = e.target.dataset;
      if (e.target.value) state.filters.set(facet, e.target.value);
      else state.filters.delete(facet);
      renderGrid();
    }));
  };

  const match = (pa) => {
    if (state.query) {
      const hay = [pa.nom, pa.raisonSociale, pa.pays, pa.adresse].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(state.query)) return false;
    }
    for (const [id, val] of state.filters) {
      const v = getValue(pa, id);
      const list = Array.isArray(v) ? v.map(String) : [String(v)];
      if (!list.includes(val)) return false;
    }
    return true;
  };

  const badge = (pa) => pa.statut === 'immatriculee_definitive'
    ? '<span class="pa-badge pa-badge--ok">Immatriculée</span>'
    : '<span class="pa-badge pa-badge--wait">En attente interop.</span>';

  const centraliteTag = (pa) => {
    const niveau = bloc(pa, 'centralitePA', 'niveau');
    if (!niveau || niveau === 'non_qualifie') return '';
    const f = state.taxo.facettes.find((x) => x.id === 'centralitePA');
    const val = f ? (f.valeurs || []).find((x) => x.v === niveau) : null;
    const indice = val && val.indice !== null && val.indice !== undefined ? `${val.indice}/4 — ` : '';
    return `<span class="pa-tag">Activité PA : ${indice}${val ? val.label : niveau}</span>`;
  };

  const card = (pa) => {
    const meta = [
      pa.dateImmatriculation ? `Immatriculée le ${pa.dateImmatriculation}` : 'Date d\u2019immatriculation à venir',
      pa.anneeCreation ? `Entreprise créée en ${pa.anneeCreation}` : null,
      pa.trancheEffectif ? `${pa.trancheEffectif} salariés` : null,
      pa.pays && pa.pays !== 'France' ? `Entité ${pa.pays}` : null
    ].filter(Boolean);
    return `<a class="pa-card" href="./pa-detail.html?pa=${slugify(pa.nom)}">
      <div class="pa-card-head"><h3>${pa.nom}</h3>${badge(pa)}${['confirme', 'notoriete'].includes(signalAngleMort(pa)) ? '<span class="pa-badge pa-badge--wait" title="Diversification récente positionnée sur l\u2019ETI ou le grand compte : profil susceptible de remporter des dossiers sans etre identifie">Radar : motif de récence</span>' : ''}</div>
      <ul class="pa-card-meta">${meta.map((x) => `<li>${x}</li>`).join('')}</ul>
      ${pa.familleOrigine && pa.familleOrigine.length
        ? `<div class="pa-tags">${pa.familleOrigine.map((f) => `<span class="pa-tag">${labelOf(state.taxo.facettes.find((x) => x.id === 'familleOrigine'), f)}</span>`).join('')}${centraliteTag(pa)}</div>`
        : '<div class="pa-tags"><span class="pa-tag pa-tag--todo">Qualification en cours</span></div>'}
    </a>`;
  };

  const renderGrid = () => {
    const list = state.data.plateformes.filter(match)
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    document.getElementById('pa-count').textContent = `${list.length} plateforme${list.length > 1 ? 's' : ''} affichée${list.length > 1 ? 's' : ''} sur ${state.data.plateformes.length}`;
    document.getElementById('pa-grid').innerHTML = list.length
      ? list.map(card).join('')
      : '<p class="pa-empty">Aucune plateforme ne correspond à ces critères.</p>';
  };

  const renderSegments = () => {
    const f = state.taxo.facettes.find((x) => x.id === 'familleOrigine');
    const groups = f.valeurs.map((v) => ({
      label: v.label,
      items: state.data.plateformes.filter((pa) => (pa.familleOrigine || []).includes(v.v))
    })).filter((g) => g.items.length);
    const host = document.getElementById('pa-segments');
    host.innerHTML = groups.length
      ? groups.map((g) => `<div class="pa-segment">
          <h3>${g.label} <span class="pa-segment-count">${g.items.length}</span></h3>
          <div class="pa-segment-list">${g.items.map((pa) => `<a href="./pa-detail.html?pa=${slugify(pa.nom)}">${pa.nom}</a>`).join('')}</div>
        </div>`).join('')
      : `<div class="callout callout--info"><div class="callout-icon">🚧</div><div class="callout-content">La qualification par famille d\u2019origine est en cours de construction. Les ${state.data.plateformes.length} plateformes sont déjà listées dans l\u2019annuaire ci-dessus avec leurs données officielles.</div></div>`;
  };


  const renderLecture = () => {
    const pa = state.data.plateformes;
    const cov = state.data._meta.couverture || {};
    const tranches = ['avant 2000', '2000-2010', '2011-2020', 'depuis 2021'];
    const parAnciennete = tranches.map((t) => [t, pa.filter((p) => trancheAnnee(p.anneeCreation) === t).length]);
    const parCategorie = ['PME', 'ETI', 'GE'].map((c) => [c, pa.filter((p) => p.categorieEntreprise === c).length]);
    const rows = (arr) => arr.filter(([, n]) => n).map(([k, n]) => `<tr><td>${k}</td><td>${n}</td></tr>`).join('');
    const fCent = state.taxo.facettes.find((x) => x.id === 'centralitePA');
    const parCentralite = ((fCent && fCent.valeurs) || [])
      .filter((v) => v.v !== 'non_qualifie')
      .map((v) => [`${v.indice}/4 — ${v.label}`, pa.filter((p) => getValue(p, 'centralitePA') === v.v).length]);
    const nbCentralite = pa.filter((p) => {
      const n = getValue(p, 'centralitePA');
      return n && n !== 'non_qualifie';
    }).length;
    const nbConfirme = pa.filter((p) => signalAngleMort(p) === 'confirme').length;
    const nbNotoriete = pa.filter((p) => signalAngleMort(p) === 'notoriete').length;
    const nbSurveiller = pa.filter((p) => signalAngleMort(p) === 'a_surveiller').length;
    const nbAveugle = pa.filter((p) => signalAngleMort(p) === 'non_evaluable').length;
    const nbEtiGc = pa.filter((p) => (p.segmentCible || []).some((x) => x === 'eti' || x === 'grands_comptes')).length;
    document.getElementById('pa-lecture').innerHTML = `
      <div class="pa-datablocks">
        <div class="pa-datablock">
          <h3>Ancienneté de l\u2019entreprise</h3>
          <table class="pa-table"><tbody>${rows(parAnciennete)}</tbody></table>
        </div>
        <div class="pa-datablock">
          <h3>Catégorie INSEE</h3>
          <table class="pa-table"><tbody>${rows(parCategorie)}</tbody></table>
        </div>
        <div class="pa-datablock">
          <h3>Origine géographique</h3>
          <table class="pa-table"><tbody>
            <tr><td>Entités françaises</td><td>${pa.filter((p) => p.pays === 'France').length}</td></tr>
            <tr><td>Entités étrangères</td><td>${pa.filter((p) => p.pays && p.pays !== 'France').length}</td></tr>
          </tbody></table>
        </div>
      </div>
      <div class="pa-datablocks">
        <div class="pa-datablock">
          <h3>Place de l\u2019activité plateforme agréée</h3>
          <table class="pa-table"><tbody>${rows(parCentralite)}</tbody></table>
        </div>
        <div class="pa-datablock">
          <h3>Signaux à instruire</h3>
          <table class="pa-table"><tbody>
            <tr><td>Plateformes adressant l\u2019ETI ou le grand compte</td><td>${nbEtiGc}</td></tr>
            <tr><td>Radar : motif de récence</td><td>${nbConfirme}</td></tr>
            <tr><td>Radar : motif de notoriété (entités étrangères)</td><td>${nbNotoriete}</td></tr>
            <tr><td>Radar : à surveiller</td><td>${nbSurveiller}</td></tr>
            <tr><td>Radar : non évaluable, année de création manquante</td><td>${nbAveugle}</td></tr>
          </tbody></table>
        </div>
      </div>
      <p class="pa-source-note">Le radar signale les acteurs susceptibles d\u2019être actifs sur l\u2019ETI et le grand compte sans être identifiés comme tels, selon deux motifs : la <strong>récence</strong> (une diversification récente) et la <strong>notoriété</strong> (une entité étrangère, invisible par construction d\u2019une veille menée sur le marché français). Il reste <strong>aveugle sur ${nbAveugle} plateforme(s)</strong> française(s) dont l\u2019année de création n\u2019est pas renseignée.</p>
      <p class="pa-source-note">La place de l\u2019activité de plateforme agréée est une lecture Fluxym établie sur un faisceau d\u2019indices publics, jamais sur une part de chiffre d\u2019affaires, qui n\u2019est pas publiée. Méthode détaillée sur la <a href="./methodologie-plateformes.html">page méthodologie</a>. ${nbCentralite ? `Évaluée à ce jour pour <strong>${nbCentralite}</strong> plateforme(s).` : 'Aucune plateforme n\u2019est encore évaluée.'}</p>
      <p class="pa-source-note">Identité juridique appariée avec haute confiance pour <strong>${cov.identiteEntreprise_haute || 0}</strong> plateformes, à vérifier pour <strong>${cov.identiteEntreprise_a_verifier || 0}</strong>, non encore appariée pour <strong>${cov.identiteEntreprise_absente || 0}</strong>. Les répartitions ci-dessus ne portent donc que sur les plateformes identifiées.</p>`;
  };

  const init = async () => {
    const [data, taxo] = await Promise.all([fetch(DATA).then((r) => r.json()), fetch(TAXO).then((r) => r.json())]);
    state.data = data;
    state.taxo = taxo;
    if (!state.taxo.facettes.some((f) => f.id === FACETTE_ANGLE_MORT.id)) state.taxo.facettes.push(FACETTE_ANGLE_MORT);
    renderCounters();
    renderFacets();
    renderGrid();
    renderSegments();
    renderLecture();
    document.getElementById('pa-search').addEventListener('input', (e) => {
      state.query = e.target.value.trim().toLowerCase();
      renderGrid();
    });
    document.getElementById('pa-reset').addEventListener('click', () => {
      state.filters.clear();
      state.query = '';
      document.getElementById('pa-search').value = '';
      document.querySelectorAll('#pa-facets select').forEach((s) => { s.value = ''; });
      renderGrid();
    });
  };

  document.addEventListener('DOMContentLoaded', init);
})();
