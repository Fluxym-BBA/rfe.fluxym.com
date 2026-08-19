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

  const state = { data: null, taxo: null, filters: new Map(), query: '' };

  const getValue = (pa, id) => {
    if (id === 'trancheAnneeCreation') return trancheAnnee(pa.anneeCreation);
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
        <div class="counter-sub">${c.s}</div>
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

  const card = (pa) => {
    const meta = [
      pa.dateImmatriculation ? `Immatriculée le ${pa.dateImmatriculation}` : 'Date d\u2019immatriculation à venir',
      pa.anneeCreation ? `Entreprise créée en ${pa.anneeCreation}` : null,
      pa.trancheEffectif ? `${pa.trancheEffectif} salariés` : null,
      pa.pays && pa.pays !== 'France' ? `Entité ${pa.pays}` : null
    ].filter(Boolean);
    return `<a class="pa-card" href="./pa-detail.html?pa=${slugify(pa.nom)}">
      <div class="pa-card-head"><h3>${pa.nom}</h3>${badge(pa)}</div>
      <ul class="pa-card-meta">${meta.map((x) => `<li>${x}</li>`).join('')}</ul>
      ${pa.familleOrigine && pa.familleOrigine.length
        ? `<div class="pa-tags">${pa.familleOrigine.map((f) => `<span class="pa-tag">${labelOf(state.taxo.facettes.find((x) => x.id === 'familleOrigine'), f)}</span>`).join('')}</div>`
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
      : `<div class="callout callout-info">La qualification par famille d\u2019origine est en cours de construction. Les ${state.data.plateformes.length} plateformes sont déjà listées dans l\u2019annuaire ci-dessus avec leurs données officielles.</div>`;
  };

  const init = async () => {
    const [data, taxo] = await Promise.all([fetch(DATA).then((r) => r.json()), fetch(TAXO).then((r) => r.json())]);
    state.data = data;
    state.taxo = taxo;
    renderCounters();
    renderFacets();
    renderGrid();
    renderSegments();
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
