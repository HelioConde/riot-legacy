(() => {
  const form = document.querySelector('#riot-form');
  const landing = document.querySelector('#landing-view');
  const profile = document.querySelector('#profile-view');
  const gameNameInput = document.querySelector('#game-name');
  const tagLineInput = document.querySelector('#tag-line');
  const platformInput = document.querySelector('#region');
  const feedback = document.querySelector('#form-feedback');
  const toast = document.querySelector('#toast');
  const profileRiotId = document.querySelector('#profile-riot-id');
  const shareRiotId = document.querySelector('#share-riot-id');
  const backButton = document.querySelector('#back-to-search');
  const sourceBadge = document.querySelector('#demo-badge');
  const sourceNote = document.querySelector('#data-source-note');
  const refreshButton = document.querySelector('#refresh-data');
  const backend = window.RIOT_LEGACY_BACKEND || {};
  const recentSearches = document.querySelector('#recent-searches');
  const recentSearchesList = document.querySelector('#recent-searches-list');
  const clearRecentSearches = document.querySelector('#clear-recent-searches');
  const RECENT_SEARCHES_KEY = 'riot-legacy-recent-searches';
  const RECENT_SEARCHES_LIMIT = 5;
  const CARD_COLLECTION_KEY = 'riot-legacy-card-collection';
  const FAVORITE_MILESTONES_KEY = 'riot-legacy-favorite-milestones';
  const LOCAL_MEMORY_LIMIT = 12;

  const demo = {
    mastery: 684210,
    games: 1284,
    years: 8,
    tftBest: 'Top 2',
    placements: [1, 2, 2, 3, 4, 2, 1, 5],
    board: [
      ['A', 'L', '', '', 'S', '', ''],
      ['', '', 'M', '', '', 'N', ''],
      ['', 'K', '', 'A', '', '', ''],
      ['', '', '', '', '', '', '']
    ],
    traits: ['Arcana', 'Scholar', 'Bastion'],
    champions: [
      { name: 'Ahri', games: 42, avgKda: 3.8 },
      { name: 'Lux', games: 18, avgKda: 3.2 },
      { name: 'Syndra', games: 11, avgKda: 2.9 }
    ]
  };

  let live = { lol: null, tft: null };
  let legacyHistory = { history: [], comparison: null };
  let currentLookup = null;
  let lookupSequence = 0;

  function locale() {
    return window.RiotLegacyI18n?.locale?.() || 'pt-BR';
  }

  function t(key) {
    return window.RiotLegacyI18n?.t?.(key) || key;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function syncRobotsPolicy(profileOpen) {
    const meta = document.querySelector('#robots-meta');
    if (!meta) return;
    meta.setAttribute('content', profileOpen ? 'noindex,nofollow' : 'index,follow');
  }

  function showToast(messageKey) {
    toast.textContent = t(messageKey);
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function readRecentSearches() {
    try {
      const value = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
      return Array.isArray(value)
        ? value
          .filter(item => item && typeof item.gameName === 'string' && typeof item.tagLine === 'string')
          .map(item => ({
            gameName: item.gameName.slice(0, 16),
            tagLine: item.tagLine.replace(/^#/, '').slice(0, 5),
            platform: String(item.platform || 'br1').toLowerCase()
          }))
          .slice(0, RECENT_SEARCHES_LIMIT)
        : [];
    } catch {
      return [];
    }
  }

  function writeRecentSearches(items) {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, RECENT_SEARCHES_LIMIT)));
  }

  function addRecentSearch(gameName, tagLine, platform) {
    const entry = {
      gameName: String(gameName || '').trim().slice(0, 16),
      tagLine: String(tagLine || '').trim().replace(/^#/, '').slice(0, 5),
      platform: String(platform || 'br1').toLowerCase()
    };
    const key = `${entry.gameName.toLowerCase()}#${entry.tagLine.toLowerCase()}@${entry.platform}`;
    const next = [
      entry,
      ...readRecentSearches().filter(item =>
        `${item.gameName.toLowerCase()}#${item.tagLine.toLowerCase()}@${item.platform}` !== key
      )
    ].slice(0, RECENT_SEARCHES_LIMIT);
    writeRecentSearches(next);
    renderRecentSearches();
  }

  function renderRecentSearches() {
    if (!recentSearches || !recentSearchesList) return;
    const items = readRecentSearches();
    recentSearches.hidden = items.length === 0;
    recentSearchesList.innerHTML = items.map((item, index) =>
      `<button class="recent-search" type="button" data-recent-index="${index}"><strong>${escapeHtml(normalizedId(item.gameName, item.tagLine))}</strong><span>${escapeHtml(item.platform.toUpperCase())}</span></button>`
    ).join('');
  }

  function openRecentSearch(index) {
    const item = readRecentSearches()[Number(index)];
    if (!item) return;
    gameNameInput.value = item.gameName;
    tagLineInput.value = item.tagLine;
    if ([...platformInput.options].some(option => option.value === item.platform)) {
      platformInput.value = item.platform;
    }
    feedback.hidden = true;
    addRecentSearch(item.gameName, item.tagLine, item.platform);
    showProfile(item.gameName, item.tagLine, item.platform);
  }

  function normalizedId(gameName, tagLine) {
    return `${String(gameName || '').trim()}#${String(tagLine || '').trim().replace(/^#/, '')}`;
  }

  function validInput(gameName, tagLine) {
    const gn = String(gameName || '').trim();
    const tl = String(tagLine || '').trim().replace(/^#/, '');
    return gn.length >= 3 && gn.length <= 16 && /^[A-Za-z0-9\p{L} ._-]+$/u.test(gn) &&
      tl.length >= 3 && tl.length <= 5 && /^[A-Za-z0-9]+$/.test(tl);
  }

  function formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString(locale()) : '—';
  }

  function platformRegion(platform) {
    if (['br1', 'na1', 'la1', 'la2'].includes(platform)) return 'americas';
    if (['kr', 'jp1'].includes(platform)) return 'asia';
    if (['ph2', 'sg2', 'th2', 'tw2', 'vn2', 'oc1'].includes(platform)) return 'sea';
    return 'europe';
  }

  function platformFromLegacyRegion(region) {
    return ({ americas: 'br1', europe: 'euw1', asia: 'kr', sea: 'oc1' })[region] || 'br1';
  }

  function cleanTftName(value) {
    let name = String(value || '').trim();
    name = name
      .replace(/^TFT_Item_/i, '')
      .replace(/^TFT\d+_/i, '')
      .replace(/^Set\d+_/i, '')
      .replace(/^DA_(?:\d+_)?/i, '');

    if (/^Riftbeast\d*$/i.test(name)) name = 'Riftbeast';

    name = name
      .replace(/UniqueTrait$/i, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (/^[A-Z]{2,}Trait$/i.test(name)) {
      name = name.replace(/Trait$/i, ' Trait');
    }

    return name || 'TFT';
  }

  function cleanTftSetName(value, setNumber = 0) {
    const raw = String(value || '').trim();
    const numeric = Number(setNumber || 0);
    const technical = raw.match(/^TFTSet(\d+)$/i);
    if (technical) return `Set ${technical[1]}`;
    const compact = raw
      .replace(/^TFTSet\d+[_ -]*/i, '')
      .replace(/^TFT[_ -]*/i, '')
      .replace(/_/g, ' ')
      .trim();
    if (compact && !/^Set\s*\d+$/i.test(compact)) return compact;
    if (numeric > 0) return `Set ${numeric}`;
    return raw || 'TFT';
  }

  function currentSignatureEvidence() {
    const summaries = Array.isArray(live.lol?.championSummaries)
      ? live.lol.championSummaries.filter(item => item?.name)
      : [];

    if (!summaries.length) {
      return {
        name: demo.champions[0].name,
        games: Number(demo.champions[0].games || 0),
        avgKda: null,
        sampleMatches: 0,
        source: 'demo'
      };
    }

    const ranked = [...summaries].sort((a, b) => {
      const gamesDiff = Number(b.games || 0) - Number(a.games || 0);
      if (gamesDiff !== 0) return gamesDiff;
      const kdaDiff = Number(b.avgKda || 0) - Number(a.avgKda || 0);
      if (kdaDiff !== 0) return kdaDiff;
      return String(a.name).localeCompare(String(b.name));
    });

    const champion = ranked[0];
    return {
      name: String(champion.name),
      games: Number(champion.games || 0),
      avgKda: champion.avgKda == null ? null : Number(champion.avgKda),
      sampleMatches: Number(live.lol?.summary?.matches || currentLolMatches().length || 0),
      source: 'recent-sample'
    };
  }

  function currentSignatureChampion() {
    return currentSignatureEvidence().name;
  }

  function currentMasteryPoints() {
    return live.lol?.mastery?.[0]?.points || demo.mastery;
  }

  function currentLolMatches() {
    return Array.isArray(live.lol?.matches) ? live.lol.matches : [];
  }

  function currentTftMatches() {
    return Array.isArray(live.tft?.matches) ? live.tft.matches : [];
  }

  function setSourceState(state, detail = '') {
    sourceBadge.dataset.sourceState = state;
    if (refreshButton) {
      refreshButton.disabled = state === 'loading';
      refreshButton.textContent = state === 'loading' ? t('refreshing_data') : t('refresh_data');
    }
    sourceBadge.classList.toggle('live', state === 'live');
    sourceBadge.classList.toggle('partial', state === 'partial');
    sourceBadge.classList.toggle('loading', state === 'loading');

    const english = locale() === 'en';
    if (state === 'loading') {
      sourceBadge.textContent = english ? 'CHECKING RIOT…' : 'CONSULTANDO RIOT…';
      sourceNote.textContent = english
        ? 'Loading public League and TFT data from the shared gamer backend.'
        : 'Carregando dados públicos de League e TFT pelo backend gamer compartilhado.';
      return;
    }

    if (state === 'live') {
      sourceBadge.textContent = english ? 'RIOT DATA · LOL + TFT' : 'DADOS RIOT · LOL + TFT';
      sourceNote.textContent = english
        ? detail || 'League and TFT use recent Riot-backed data. Historical snapshots will expand the legacy over time.'
        : detail || 'League e TFT usam dados recentes vindos da Riot. Snapshots históricos ampliarão o legado ao longo do tempo.';
      return;
    }

    if (state === 'partial') {
      sourceBadge.textContent = english ? 'PARTIAL RIOT DATA' : 'DADOS RIOT PARCIAIS';
      sourceNote.textContent = detail || (english
        ? 'One game has live Riot data; the unavailable section keeps the clearly identified demo fallback.'
        : 'Um dos jogos tem dados Riot reais; a seção indisponível mantém o fallback demo claramente identificado.');
      return;
    }

    sourceBadge.textContent = english ? 'DEMONSTRATIVE FALLBACK' : 'FALLBACK DEMONSTRATIVO';
    sourceNote.textContent = detail || (english
      ? 'The Riot backend did not return usable data for this lookup. The visual prototype remains available with demonstrative data.'
      : 'O backend Riot não retornou dados utilizáveis para esta busca. O protótipo visual continua disponível com dados demonstrativos.');
  }

  function liveFailureMessage(results) {
    const failures = results
      .filter(result => result?.status === 'rejected')
      .map(result => ({
        code: String(result.reason?.code || ''),
        status: Number(result.reason?.status || 0),
        name: String(result.reason?.name || '')
      }));

    const english = locale() === 'en';
    if (failures.some(item => item.code === 'player' || item.code === 'player_not_found' || item.status === 404)) {
      return english
        ? 'Riot ID was not found by the live backend. Check Game Name, Tag Line and server, then refresh.'
        : 'O Riot ID não foi encontrado pelo backend ao vivo. Confira Game Name, Tag Line e servidor e tente atualizar.';
    }
    if (failures.some(item => item.code === 'rate_limited' || item.status === 429)) {
      return english
        ? 'Riot rate limit is temporarily active. The demo fallback remains available; try Refresh data again in a moment.'
        : 'O limite temporário da Riot foi atingido. O fallback demo continua disponível; tente Atualizar dados novamente em instantes.';
    }
    if (failures.some(item => item.code === 'riot_api_key_rejected' || item.status === 401 || item.status === 403)) {
      return english
        ? 'The server-side Riot integration is temporarily unavailable. No key is exposed in this browser; try again later.'
        : 'A integração server-side com a Riot está temporariamente indisponível. Nenhuma chave fica exposta neste navegador; tente novamente mais tarde.';
    }
    if (failures.some(item => item.name === 'AbortError')) {
      return english
        ? 'The Riot lookup took too long. The demo fallback was kept; use Refresh data to try again.'
        : 'A consulta à Riot demorou demais. O fallback demo foi mantido; use Atualizar dados para tentar novamente.';
    }
    return english
      ? 'Live Riot data is unavailable right now. The demonstrative fallback remains active and can be refreshed later.'
      : 'Os dados Riot ao vivo estão indisponíveis agora. O fallback demonstrativo permanece ativo e pode ser atualizado depois.';
  }

  async function postPublicFunction(url, body) {
    if (!url) throw new Error('backend_not_configured');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 14000);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      let data = null;
      try { data = await response.json(); } catch {}
      if (!response.ok || data?.error) {
        const error = new Error(data?.message || 'riot_lookup_failed');
        error.code = data?.error || String(response.status);
        error.status = response.status;
        throw error;
      }
      return data;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function renderBoard() {
    const board = document.querySelector('#tft-board');
    const label = document.querySelector('#board-label');
    const latest = currentTftMatches()[0];
    const liveUnits = Array.isArray(latest?.units) ? latest.units.slice(0, 12) : [];

    if (live.tft && liveUnits.length) {
      label.textContent = locale() === 'en' ? 'Units from latest match' : 'Unidades da partida mais recente';
      const cells = Array.from({ length: 28 }, (_, index) => {
        const unit = liveUnits[index];
        if (!unit) return '';
        const name = cleanTftName(unit.characterId);
        return { short: name.slice(0, 1).toUpperCase(), name, tier: Number(unit.tier || 0) };
      });
      board.innerHTML = cells.map((unit, index) => {
        if (!unit) return `<span class="hex-cell" aria-label="Empty" data-cell="${index}"></span>`;
        return `<span class="hex-cell filled" title="${escapeHtml(unit.name)}" aria-label="${escapeHtml(unit.name)}" data-cell="${index}">${escapeHtml(unit.short)}<small>${unit.tier ? '★'.repeat(Math.min(3, unit.tier)) : ''}</small></span>`;
      }).join('');
      return;
    }

    label.textContent = t('board_label');
    board.innerHTML = demo.board.flatMap((row, rowIndex) =>
      row.map((value, colIndex) => {
        const filled = Boolean(value);
        return `<span class="hex-cell${filled ? ' filled' : ''}" aria-label="${filled ? 'Unit ' + value : 'Empty'}" data-row="${rowIndex}" data-col="${colIndex}">${value}</span>`;
      })
    ).join('');
  }

  function renderTraits() {
    const el = document.querySelector('#trait-list');
    const signature = document.querySelector('#tft-signature');

    if (!live.tft) {
      if (signature) signature.textContent = locale() === 'en'
        ? 'Sample signatures: Arcana · Ahri'
        : 'Assinaturas da amostra: Arcana · Ahri';
      el.innerHTML = demo.traits.map(name => `<span class="trait">${escapeHtml(name)}</span>`).join('');
      return;
    }

    const traitStats = new Map();
    const unitStats = new Map();

    currentTftMatches().forEach(match => {
      const seenTraits = new Set();
      (Array.isArray(match?.traits) ? match.traits : []).forEach(item => {
        const numUnits = Number(item?.numUnits || 0);
        const style = Number(item?.style || 0);
        if (numUnits <= 0 || (style <= 0 && numUnits < 2)) return;
        const name = cleanTftName(item.name);
        if (!seenTraits.has(name)) {
          const current = traitStats.get(name) || { appearances: 0, style: 0, units: 0 };
          current.appearances += 1;
          current.style += style;
          current.units += numUnits;
          traitStats.set(name, current);
          seenTraits.add(name);
        }
      });

      const seenUnits = new Set();
      (Array.isArray(match?.units) ? match.units : []).forEach(unit => {
        const name = cleanTftName(unit?.characterId);
        if (!name || name === 'TFT' || seenUnits.has(name)) return;
        const current = unitStats.get(name) || { appearances: 0, stars: 0 };
        current.appearances += 1;
        current.stars += Number(unit?.tier || 0);
        unitStats.set(name, current);
        seenUnits.add(name);
      });
    });

    const traits = [...traitStats.entries()]
      .sort((a, b) =>
        b[1].appearances - a[1].appearances ||
        b[1].style - a[1].style ||
        b[1].units - a[1].units ||
        a[0].localeCompare(b[0])
      )
      .slice(0, 6);

    const units = [...unitStats.entries()]
      .sort((a, b) =>
        b[1].appearances - a[1].appearances ||
        b[1].stars - a[1].stars ||
        a[0].localeCompare(b[0])
      )
      .slice(0, 3);

    el.innerHTML = traits.length
      ? traits.map(([name, stat]) =>
          `<span class="trait" title="${stat.appearances}x">${escapeHtml(name)} · ${stat.appearances}x</span>`
        ).join('')
      : `<span class="empty-inline">${locale() === 'en' ? 'No recurring traits in this sample.' : 'Sem traits recorrentes nesta amostra.'}</span>`;

    if (signature) {
      const traitName = traits[0]?.[0];
      const unitName = units[0]?.[0];
      const parts = [traitName, unitName].filter(Boolean);
      signature.textContent = parts.length
        ? (locale() === 'en' ? 'Recent signatures: ' : 'Assinaturas recentes: ') + parts.join(' · ')
        : (locale() === 'en' ? 'Recent signatures: insufficient TFT data' : 'Assinaturas recentes: dados de TFT insuficientes');
    }
  }

  function renderCompPatterns() {
    const el = document.querySelector('#comp-patterns');
    if (!el) return;

    if (!live.tft) {
      el.innerHTML = `
        <div class="comp-pattern"><strong>Arcana + Scholar</strong><span>${locale() === 'en' ? 'Demo archetype' : 'Arquétipo demo'}</span></div>
      `;
      return;
    }

    const patterns = new Map();

    currentTftMatches().forEach(match => {
      const activeTraits = (Array.isArray(match?.traits) ? match.traits : [])
        .filter(item => Number(item?.numUnits || 0) > 0 && (Number(item?.style || 0) > 0 || Number(item?.numUnits || 0) >= 2))
        .sort((a, b) =>
          Number(b?.style || 0) - Number(a?.style || 0) ||
          Number(b?.numUnits || 0) - Number(a?.numUnits || 0)
        )
        .slice(0, 2)
        .map(item => cleanTftName(item?.name));

      const coreUnits = (Array.isArray(match?.units) ? match.units : [])
        .slice()
        .sort((a, b) => Number(b?.tier || 0) - Number(a?.tier || 0))
        .slice(0, 3)
        .map(unit => cleanTftName(unit?.characterId))
        .filter(name => name && name !== 'TFT');

      const parts = activeTraits.length ? activeTraits : coreUnits;
      if (!parts.length) return;

      const label = parts.join(' + ');
      const placement = Number(match?.placement || 0);
      const current = patterns.get(label) || { count: 0, placements: [], top4: 0 };
      current.count += 1;
      if (placement >= 1 && placement <= 8) {
        current.placements.push(placement);
        if (placement <= 4) current.top4 += 1;
      }
      patterns.set(label, current);
    });

    const ranked = [...patterns.entries()]
      .map(([label, stat]) => ({
        label,
        ...stat,
        average: stat.placements.length
          ? stat.placements.reduce((sum, value) => sum + value, 0) / stat.placements.length
          : null,
        top4Rate: stat.placements.length
          ? Math.round(stat.top4 / stat.placements.length * 100)
          : null
      }))
      .sort((a, b) =>
        b.count - a.count ||
        (a.average ?? 99) - (b.average ?? 99) ||
        a.label.localeCompare(b.label)
      )
      .slice(0, 4);

    el.innerHTML = ranked.length
      ? ranked.map(pattern => {
          const average = pattern.average == null ? '—' : pattern.average.toLocaleString(locale(), { maximumFractionDigits: 2 });
          const detail = locale() === 'en'
            ? `${pattern.count}x · avg ${average} · Top 4 ${pattern.top4Rate ?? '—'}%`
            : `${pattern.count}x · média ${average} · Top 4 ${pattern.top4Rate ?? '—'}%`;
          return `<div class="comp-pattern"><strong>${escapeHtml(pattern.label)}</strong><span>${escapeHtml(detail)}</span></div>`;
        }).join('')
      : `<p class="empty-inline">${locale() === 'en' ? 'No recurring comp archetypes in this sample.' : 'Sem arquétipos de comp recorrentes nesta amostra.'}</p>`;
  }

  function renderPlacementBars() {
    const el = document.querySelector('#placement-bars');
    const summary = document.querySelector('#placement-summary');
    const placements = live.tft
      ? currentTftMatches().map(match => Number(match.placement)).filter(value => value >= 1 && value <= 8)
      : demo.placements;
    const counts = Array.from({ length: 8 }, (_, index) =>
      placements.filter(value => value === index + 1).length
    );
    const max = Math.max(...counts, 1);
    const top4 = placements.filter(value => value <= 4).length;
    const firsts = counts[0] || 0;
    const eighths = counts[7] || 0;

    if (summary) {
      summary.textContent = locale() === 'en'
        ? `Top 4: ${top4}/${placements.length} · 1st: ${firsts} · 8th: ${eighths}`
        : `Top 4: ${top4}/${placements.length} · 1º lugar: ${firsts} · 8º lugar: ${eighths}`;
    }

    el.innerHTML = counts.map((count, index) =>
      `<div class="placement-bar" title="${count} ${locale() === 'en' ? 'matches' : 'partidas'}"><span style="height:${Math.max(8, Math.round((count / max) * 100))}%"></span><small>${index + 1}</small></div>`
    ).join('');
  }

  function renderSetRetrospective() {
    const el = document.querySelector('#set-retrospective');
    if (!el) return;

    if (!live.tft) {
      el.innerHTML = `
        <div class="set-chip"><strong>Set 14</strong><span>${locale() === 'en' ? 'Demo sample' : 'Amostra demo'}</span></div>
      `;
      return;
    }

    const groups = new Map();
    currentTftMatches().forEach(match => {
      const rawName = String(match?.setName || '').trim();
      const setNumber = Number(match?.setNumber || 0);
      const key = cleanTftSetName(rawName, setNumber);
      const placement = Number(match?.placement || 0);
      const current = groups.get(key) || { matches: 0, placements: [], top4: 0, firsts: 0 };
      current.matches += 1;
      if (placement >= 1 && placement <= 8) {
        current.placements.push(placement);
        if (placement <= 4) current.top4 += 1;
        if (placement === 1) current.firsts += 1;
      }
      groups.set(key, current);
    });

    const rows = [...groups.entries()]
      .map(([name, stat]) => ({
        name,
        ...stat,
        average: stat.placements.length
          ? stat.placements.reduce((sum, value) => sum + value, 0) / stat.placements.length
          : null,
        top4Rate: stat.placements.length
          ? Math.round(stat.top4 / stat.placements.length * 100)
          : null
      }))
      .sort((a, b) => b.matches - a.matches || (a.average ?? 99) - (b.average ?? 99) || a.name.localeCompare(b.name));

    el.innerHTML = rows.length
      ? rows.slice(0, 4).map(row => {
          const average = row.average == null ? '—' : row.average.toLocaleString(locale(), { maximumFractionDigits: 2 });
          const label = locale() === 'en'
            ? `${row.matches} matches · avg ${average} · Top 4 ${row.top4Rate ?? '—'}% · ${row.firsts} wins`
            : `${row.matches} partidas · média ${average} · Top 4 ${row.top4Rate ?? '—'}% · ${row.firsts} vitórias`;
          return `<div class="set-chip"><strong>${escapeHtml(row.name)}</strong><span>${escapeHtml(label)}</span></div>`;
        }).join('')
      : `<p class="empty-inline">${locale() === 'en' ? 'No set information in this TFT sample.' : 'Sem informação de set nesta amostra de TFT.'}</p>`;
  }

  function renderChampions() {
    const el = document.querySelector('#champion-list');
    const champions = live.lol && Array.isArray(live.lol.championSummaries) && live.lol.championSummaries.length
      ? live.lol.championSummaries.slice(0, 3)
      : demo.champions;

    el.innerHTML = champions.map(champion => {
      const name = String(champion.name || 'Champion');
      const games = Number(champion.games || 0);
      const detail = live.lol
        ? `${games} ${locale() === 'en' ? (games === 1 ? 'match' : 'matches') : (games === 1 ? 'partida' : 'partidas')}${champion.avgKda != null ? ' · KDA ' + Number(champion.avgKda).toLocaleString(locale(), { maximumFractionDigits: 2 }) : ''}`
        : `${formatNumber(champion.games === 42 ? demo.mastery : champion.games * 18000)} mastery`;
      return `<div class="champion"><div class="portrait">${escapeHtml(name.slice(0, 1).toUpperCase())}</div><h3>${escapeHtml(name)}</h3><span>${escapeHtml(detail)}</span></div>`;
    }).join('');
  }

  function renderRoles() {
    const stack = document.querySelector('#role-stack');
    const identity = document.querySelector('#role-identity');
    const english = locale() === 'en';
    if (!live.lol) {
      if (identity) identity.textContent = english ? 'Primary identity: Mid · 68%' : 'Identidade principal: Mid · 68%';
      stack.innerHTML = `
        <div class="role-row"><span>${t('role_mid')}</span><div class="role-track"><div class="role-fill" style="width:68%"></div></div><b>68%</b></div>
        <div class="role-row"><span>${t('role_support')}</span><div class="role-track"><div class="role-fill" style="width:22%"></div></div><b>22%</b></div>
        <div class="role-row"><span>${t('role_other')}</span><div class="role-track"><div class="role-fill" style="width:10%"></div></div><b>10%</b></div>`;
      return;
    }

    const labels = { TOP: 'Top', JUNGLE: 'Jungle', MID: 'Mid', ADC: 'ADC', SUPPORT: english ? 'Support' : 'Suporte' };
    const counts = {};
    currentLolMatches().forEach(match => {
      const position = String(match.position || '').toUpperCase();
      if (position) counts[position] = (counts[position] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);

    if (identity) {
      if (entries.length && total > 0) {
        const [primaryPosition, primaryCount] = entries[0];
        const primaryPercent = Math.round(primaryCount / total * 100);
        identity.textContent = english
          ? `Recent identity: ${labels[primaryPosition] || primaryPosition} · ${primaryPercent}% of ${total} positioned matches`
          : `Identidade recente: ${labels[primaryPosition] || primaryPosition} · ${primaryPercent}% de ${total} partidas com posição`;
      } else {
        identity.textContent = english
          ? 'Recent identity: insufficient role data'
          : 'Identidade recente: dados de função insuficientes';
      }
    }

    stack.innerHTML = entries.length && total > 0
      ? entries.map(([position, count]) => {
          const percent = Math.round(count / total * 100);
          return `<div class="role-row"><span>${escapeHtml(labels[position] || position)}</span><div class="role-track"><div class="role-fill" style="width:${percent}%"></div></div><b>${percent}%</b></div>`;
        }).join('')
      : `<p class="empty-inline">${english ? 'No Summoner’s Rift role sample available.' : 'Sem amostra de função em Summoner’s Rift.'}</p>`;
  }

  function renderLiveProfileFacts() {
    const el = document.querySelector('#live-profile-facts');
    if (!el) return;
    if (!live.lol && !live.tft) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }

    const english = locale() === 'en';
    const platform = String(currentLookup?.platform || live.lol?.player?.platform || live.tft?.player?.platform || '').toUpperCase();
    const level = Number(live.lol?.player?.level || live.tft?.player?.level || 0);
    const lolRank = Array.isArray(live.lol?.ranked)
      ? (live.lol.ranked.find(item => item?.queue === 'SOLO/DUO') || live.lol.ranked[0])
      : null;
    const tftRank = Array.isArray(live.tft?.ranked)
      ? (live.tft.ranked.find(item => String(item?.queueType || '').toUpperCase().includes('RANKED')) || live.tft.ranked[0])
      : null;

    const facts = [];
    if (platform) facts.push({ label: english ? 'Server' : 'Servidor', value: platform });
    if (level > 0) facts.push({ label: english ? 'Account level' : 'Nível da conta', value: formatNumber(level) });
    if (lolRank?.tier) {
      facts.push({
        label: 'LoL',
        value: `${lolRank.tier} ${lolRank.rank || ''}${Number.isFinite(Number(lolRank.lp)) ? ' · ' + Number(lolRank.lp) + ' LP' : ''}`.trim()
      });
    }
    if (tftRank?.tier) {
      facts.push({
        label: 'TFT',
        value: `${tftRank.tier} ${tftRank.rank || ''}${Number.isFinite(Number(tftRank.leaguePoints)) ? ' · ' + Number(tftRank.leaguePoints) + ' LP' : ''}`.trim()
      });
    }

    el.hidden = facts.length === 0;
    el.innerHTML = facts.map(fact =>
      `<span class="live-fact"><small>${escapeHtml(fact.label)}</small><strong>${escapeHtml(fact.value)}</strong></span>`
    ).join('');
  }


  function applySignatureTheme(champion) {
    const value = String(champion || 'Riot Legacy');
    let hash = 0;
    for (let index = 0; index < value.length; index++) {
      hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
    }
    const hue = Math.abs(hash) % 360;
    document.documentElement.style.setProperty('--signature-accent', `hsl(${hue} 62% 58%)`);
    document.documentElement.style.setProperty('--signature-soft', `hsl(${hue} 72% 78%)`);
  }

  function readLocalMemory(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value.slice(0, LOCAL_MEMORY_LIMIT) : [];
    } catch {
      return [];
    }
  }

  function writeLocalMemory(key, items) {
    localStorage.setItem(key, JSON.stringify(items.slice(0, LOCAL_MEMORY_LIMIT)));
  }

  function currentMemoryEntry() {
    return {
      riotId: profileRiotId.textContent || '',
      champion: currentSignatureChampion(),
      mastery: Number(currentMasteryPoints() || 0),
      lolRank: live.lol?.ranked?.[0]?.tier
        ? `${live.lol.ranked[0].tier} ${live.lol.ranked[0].rank || ''}`.trim()
        : null,
      tftRank: live.tft?.ranked?.[0]?.tier
        ? `${live.tft.ranked[0].tier} ${live.tft.ranked[0].rank || ''}`.trim()
        : null,
      savedAt: new Date().toISOString()
    };
  }

  function saveCardCollection() {
    const entry = currentMemoryEntry();
    const key = `${entry.riotId}|${entry.champion}|${entry.savedAt.slice(0, 10)}`;
    const next = [
      entry,
      ...readLocalMemory(CARD_COLLECTION_KEY).filter(item =>
        `${item.riotId}|${item.champion}|${String(item.savedAt || '').slice(0, 10)}` !== key
      )
    ];
    writeLocalMemory(CARD_COLLECTION_KEY, next);
    renderLocalMemories();
  }

  function favoriteCurrentMilestone() {
    const entry = currentMemoryEntry();
    const next = [entry, ...readLocalMemory(FAVORITE_MILESTONES_KEY)];
    writeLocalMemory(FAVORITE_MILESTONES_KEY, next);
    renderLocalMemories();
  }

  function renderMemoryList(element, items, emptyText) {
    if (!element) return;
    element.innerHTML = items.length
      ? items.map(item => {
          const rank = [item.lolRank, item.tftRank].filter(Boolean).join(' · ');
          const detail = [item.champion, rank].filter(Boolean).join(' · ');
          const date = item.savedAt ? new Date(item.savedAt).toLocaleDateString(locale()) : '';
          return `<div class="memory-item"><div><strong>${escapeHtml(item.riotId || 'Riot Legacy')}</strong><span>${escapeHtml(detail || 'Momento salvo')}</span></div><time>${escapeHtml(date)}</time></div>`;
        }).join('')
      : `<p class="empty-inline">${escapeHtml(emptyText)}</p>`;
  }

  function renderLocalMemories() {
    renderMemoryList(
      document.querySelector('#card-collection'),
      readLocalMemory(CARD_COLLECTION_KEY),
      'Baixe um card para adicioná-lo à coleção local.'
    );
    renderMemoryList(
      document.querySelector('#favorite-list'),
      readLocalMemory(FAVORITE_MILESTONES_KEY),
      'Nenhum marco favorito salvo neste navegador.'
    );
  }

  function renderSignature() {
    const signature = currentSignatureEvidence();
    const champion = signature.name;
    const games = signature.games;
    const position = live.lol?.summary?.primaryPosition || live.lol?.summary?.mainContext || 'MID';
    const rank = live.lol?.ranked?.[0];
    const rankLabel = rank?.tier ? `${rank.tier} ${rank.rank || ''}`.trim() : position;
    const title = document.querySelector('#signature-title');
    const text = document.querySelector('#signature-text');
    const chip = document.querySelector('#signature-chip');
    applySignatureTheme(champion);

    if (live.lol) {
      title.textContent = locale() === 'en'
        ? `${champion} is your recent signature`
        : `${champion} é sua assinatura recente`;
      text.textContent = locale() === 'en'
        ? `Across the ${signature.sampleMatches} recent matches analyzed by Riot Legacy, ${champion} is your signature because it has the highest match frequency in the sample; average KDA breaks ties. This is a recent-data signal, not a claim about your entire account history.`
        : `Nas ${signature.sampleMatches} partidas recentes analisadas pelo Riot Legacy, ${champion} é sua assinatura porque tem a maior frequência de partidas na amostra; o KDA médio desempata. Este é um sinal da amostra recente, não uma afirmação sobre todo o histórico da conta.`;
      chip.textContent = `${rankLabel.toUpperCase()} · ${games} ${locale() === 'en' ? 'GAMES' : 'JOGOS'} · ${champion.toUpperCase()}`;
    } else {
      title.textContent = t('signature_title');
      text.textContent = t('signature_text');
      chip.textContent = 'MID · 684K · AHRI';
    }

    const bg = document.querySelector('.profile-hero-bg');
    const safeChampion = /^[A-Za-z0-9]+$/.test(champion) ? champion : 'Ahri';
    bg.style.backgroundImage = `linear-gradient(90deg,rgba(5,10,16,.98) 5%,rgba(5,10,16,.78) 45%,rgba(5,10,16,.22)),linear-gradient(0deg,#050a10 0%,transparent 45%),url("https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${safeChampion}_0.jpg")`;
  }

  function renderTimeline() {
    const title = document.querySelector('#timeline-title');
    const timeline = document.querySelector('#legacy-timeline');
    const subtitle = document.querySelector('#profile-subtitle');
    const sharePeriod = document.querySelector('#share-period');
    const hasLive = Boolean(live.lol || live.tft);

    if (!hasLive) {
      title.textContent = t('timeline_title');
      subtitle.textContent = t('legacy_since');
      sharePeriod.textContent = '2018 → 2026 · LoL + TFT';
      timeline.innerHTML = `
        <div class="timeline-item"><b>2018</b><h3>${t('timeline_2018')}</h3><p>${t('timeline_2018_text')}</p></div>
        <div class="timeline-item"><b>2021</b><h3>${t('timeline_2021')}</h3><p>${t('timeline_2021_text')}</p></div>
        <div class="timeline-item"><b>2024</b><h3>${t('timeline_2024')}</h3><p>${t('timeline_2024_text')}</p></div>
        <div class="timeline-item"><b>2026</b><h3>${t('timeline_2026')}</h3><p>${t('timeline_2026_text')}</p></div>`;
      return;
    }

    const english = locale() === 'en';
    const platform = String(currentLookup?.platform || live.lol?.player?.platform || live.tft?.player?.platform || '').toUpperCase();
    title.textContent = english ? 'Your recent Riot sample in chapters' : 'Sua amostra Riot recente em capítulos';
    subtitle.textContent = english
      ? `Recent Riot snapshot${platform ? ' · ' + platform : ''}`
      : `Retrato Riot recente${platform ? ' · ' + platform : ''}`;
    sharePeriod.textContent = english ? 'Recent Riot sample · LoL + TFT' : 'Amostra Riot recente · LoL + TFT';

    const chapters = [];
    if (live.lol) {
      const matches = Number(live.lol.summary?.matches || currentLolMatches().length);
      const context = live.lol.summary?.mainContext || 'LoL';
      const winRate = live.lol.summary?.winRate;
      chapters.push({
        label: 'LOL',
        title: english ? 'Your recent moment' : 'Seu momento recente',
        text: english
          ? `${matches} analyzed matches · ${context}${winRate != null ? ' · ' + winRate + '% win rate' : ''}.`
          : `${matches} partidas analisadas · ${context}${winRate != null ? ' · ' + winRate + '% de win rate' : ''}.`
      });

      const top = live.lol.championSummaries?.[0];
      if (top?.name) {
        chapters.push({
          label: String(top.name).toUpperCase(),
          title: english ? 'Recent signature' : 'Assinatura recente',
          text: english
            ? `${top.name} appears in ${top.games || 0} matches from the analyzed sample.`
            : `${top.name} aparece em ${top.games || 0} partidas da amostra analisada.`
        });
      }
    }

    if (live.tft) {
      const summary = live.tft.summary || {};
      const latest = currentTftMatches()[0] || {};
      const setLabel = latest.setName || (latest.setNumber ? 'Set ' + latest.setNumber : 'TFT');
      chapters.push({
        label: 'TFT',
        title: english ? 'Your recent set' : 'Seu set recente',
        text: english
          ? `${setLabel} · average placement ${summary.averagePlacement ?? '—'} · Top 4 ${summary.top4Rate ?? '—'}%.`
          : `${setLabel} · colocação média ${summary.averagePlacement ?? '—'} · Top 4 ${summary.top4Rate ?? '—'}%.`
      });
    }

    const timestamps = [
      ...currentLolMatches().map(match => Number(match.playedAt || 0)),
      ...currentTftMatches().map(match => Number(match.playedAt || 0))
    ].filter(value => Number.isFinite(value) && value > 0);
    if (timestamps.length) {
      const oldestAt = new Date(Math.min(...timestamps));
      const latestAt = new Date(Math.max(...timestamps));
      const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      const oldestLabel = oldestAt.toLocaleDateString(locale(), dateOptions).replace('.', '');
      const latestLabel = latestAt.toLocaleDateString(locale(), dateOptions).replace('.', '');
      chapters.push({
        label: english ? 'SAMPLE' : 'AMOSTRA',
        title: english ? 'Available history window' : 'Janela histórica disponível',
        text: english
          ? `Oldest match available in this Riot sample: ${oldestLabel}. Latest activity: ${latestLabel}. This is the available API sample, not necessarily the account's first-ever match.`
          : `Partida mais antiga disponível nesta amostra Riot: ${oldestLabel}. Atividade mais recente: ${latestLabel}. Esta é a janela disponível pela API, não necessariamente a primeira partida da conta.`
      });
    }

    timeline.innerHTML = chapters.slice(0, 4).map(chapter =>
      `<div class="timeline-item"><b>${escapeHtml(chapter.label)}</b><h3>${escapeHtml(chapter.title)}</h3><p>${escapeHtml(chapter.text)}</p></div>`
    ).join('');
  }


  function deltaLabel(value, suffix = '') {
    const number = Number(value);
    if (!Number.isFinite(number)) return '—';
    const sign = number > 0 ? '+' : '';
    return `${sign}${number.toLocaleString(locale(), { maximumFractionDigits: 2 })}${suffix}`;
  }

  function renderYearTimeline() {
    const el = document.querySelector('#year-timeline');
    if (!el) return;

    const years = new Map();
    const bump = (year, key) => {
      if (!year || year < 2010 || year > 2100) return;
      const current = years.get(year) || { lol: 0, tft: 0, snapshots: 0 };
      current[key] += 1;
      years.set(year, current);
    };

    currentLolMatches().forEach(match => {
      const date = new Date(Number(match?.playedAt || 0));
      if (!Number.isNaN(date.getTime())) bump(date.getFullYear(), 'lol');
    });
    currentTftMatches().forEach(match => {
      const date = new Date(Number(match?.playedAt || 0));
      if (!Number.isNaN(date.getTime())) bump(date.getFullYear(), 'tft');
    });
    (Array.isArray(legacyHistory?.history) ? legacyHistory.history : []).forEach(item => {
      const year = Number(String(item?.snapshot_date || '').slice(0, 4));
      bump(year, 'snapshots');
    });

    const rows = [...years.entries()].sort((a, b) => a[0] - b[0]);
    el.innerHTML = rows.length
      ? rows.map(([year, stat]) => {
          const parts = [];
          if (stat.lol) parts.push(`LoL: ${stat.lol}`);
          if (stat.tft) parts.push(`TFT: ${stat.tft}`);
          if (stat.snapshots) parts.push(`snapshots: ${stat.snapshots}`);
          return `<div class="year-pill"><strong>${year}</strong><span>${escapeHtml(parts.join(' · '))}</span></div>`;
        }).join('')
      : '<p class="empty-inline">Os anos aparecem conforme partidas e snapshots reais ficam disponíveis.</p>';
  }

  function renderHistoryInsights() {
    const countEl = document.querySelector('#snapshot-count');
    const monthEl = document.querySelector('#month-comparison');
    const rankEl = document.querySelector('#rank-milestones');
    const masteryEl = document.querySelector('#mastery-evolution');
    const wrappedEl = document.querySelector('#wrapped-summary');
    if (!countEl || !monthEl || !rankEl || !masteryEl || !wrappedEl) return;

    const history = Array.isArray(legacyHistory?.history) ? legacyHistory.history : [];
    const comparison = legacyHistory?.comparison || {};
    const current = history[0]?.summary || null;
    const previousMonth = comparison?.previousMonth || null;

    countEl.textContent = `${history.length} ${history.length === 1 ? 'snapshot' : 'snapshots'}`;

    if (!current) {
      monthEl.innerHTML = '<p class="empty-inline">O primeiro snapshot será criado ao carregar dados Riot.</p>';
      rankEl.innerHTML = '<p class="empty-inline">Os próximos snapshots vão registrar mudanças de elo.</p>';
      masteryEl.innerHTML = '<p class="empty-inline">A evolução aparecerá quando houver mais de um snapshot.</p>';
      wrappedEl.innerHTML = '<p class="empty-inline">Resumo mensal e anual baseado nos snapshots acumulados.</p>';
      return;
    }

    monthEl.innerHTML = previousMonth
      ? [
          ['Maestria', deltaLabel(previousMonth.masteryPoints)],
          ['Win rate LoL', deltaLabel(previousMonth.lolWinRate, ' pp')],
          ['Top 4 TFT', deltaLabel(previousMonth.tftTop4Rate, ' pp')],
          ['Média TFT', deltaLabel(previousMonth.tftAveragePlacement)]
        ].map(([label, value]) =>
          `<div class="history-fact"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`
        ).join('')
      : '<p class="empty-inline">Ainda não existe snapshot de um mês anterior para comparar.</p>';

    rankEl.innerHTML = `
      <div class="history-fact"><span>LoL atual</span><b>${escapeHtml(current.lolRank || '—')}</b></div>
      <div class="history-fact"><span>TFT atual</span><b>${escapeHtml(current.tftRank || '—')}</b></div>
      ${previousMonth ? `
        <div class="history-fact"><span>LoL mês anterior</span><b>${escapeHtml(previousMonth.lolRankBefore || '—')}</b></div>
        <div class="history-fact"><span>TFT mês anterior</span><b>${escapeHtml(previousMonth.tftRankBefore || '—')}</b></div>
      ` : ''}
    `;

    const first = history[history.length - 1]?.summary || current;
    const masteryDelta = Number(current.masteryPoints || 0) - Number(first.masteryPoints || 0);
    const currentMasteries = Array.isArray(history[0]?.lol?.mastery) ? history[0].lol.mastery.slice(0, 3) : [];
    const oldestMasteries = Array.isArray(history[history.length - 1]?.lol?.mastery)
      ? history[history.length - 1].lol.mastery
      : [];
    const masteryRows = currentMasteries.map(item => {
      const old = oldestMasteries.find(candidate => Number(candidate?.championId) === Number(item?.championId));
      const change = old ? Number(item?.points || 0) - Number(old?.points || 0) : null;
      return `<div class="history-fact"><span>${escapeHtml(item?.name || 'Campeão')}</span><b>${escapeHtml(formatNumber(item?.points || 0))}${change == null ? '' : ' · ' + deltaLabel(change)}</b></div>`;
    }).join('');
    masteryEl.innerHTML = masteryRows || `
      <div class="history-fact"><span>Maestria atual</span><b>${escapeHtml(formatNumber(current.masteryPoints || 0))}</b></div>
      <div class="history-fact"><span>Desde o primeiro snapshot</span><b>${escapeHtml(deltaLabel(masteryDelta))}</b></div>
      <div class="history-fact"><span>Assinatura atual</span><b>${escapeHtml(current.signatureChampion || '—')}</b></div>
    `;

    const signatures = [...new Set(history.map(item => item?.summary?.signatureChampion).filter(Boolean))];
    const bestTop4 = history
      .map(item => Number(item?.summary?.tftTop4Rate))
      .filter(Number.isFinite)
      .sort((a, b) => b - a)[0];
    const oldestDate = history[history.length - 1]?.snapshot_date;
    const now = new Date();
    const yearKey = String(now.getFullYear());
    const monthKey = `${yearKey}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const yearSnapshots = history.filter(item => String(item?.snapshot_date || '').startsWith(yearKey)).length;
    const monthSnapshots = history.filter(item => String(item?.snapshot_date || '').startsWith(monthKey)).length;
    wrappedEl.innerHTML = `
      <div class="history-fact"><span>Wrapped do mês</span><b>${monthSnapshots} snapshots</b></div>
      <div class="history-fact"><span>Wrapped do ano</span><b>${yearSnapshots} snapshots</b></div>
      <div class="history-fact"><span>Campeões assinatura</span><b>${signatures.length}</b></div>
      <div class="history-fact"><span>Melhor Top 4 TFT registrado</span><b>${Number.isFinite(bestTop4) ? bestTop4 + '%' : '—'}</b></div>
      <div class="history-fact"><span>Histórico desde</span><b>${oldestDate ? new Date(oldestDate + 'T00:00:00').toLocaleDateString(locale()) : '—'}</b></div>
    `;
    renderYearTimeline();
  }

  async function captureLegacySnapshot(lookup, lol, tft) {
    if (!backend.legacySnapshots || (!lol && !tft)) {
      legacyHistory = { history: [], comparison: null };
      renderHistoryInsights();
      return;
    }
    try {
      const result = await postPublicFunction(backend.legacySnapshots, {
        gameName: lookup.gameName,
        tagLine: lookup.tagLine,
        platform: lookup.platform
      });
      legacyHistory = {
        history: Array.isArray(result?.history) ? result.history : [],
        comparison: result?.comparison || null
      };
    } catch {
      legacyHistory = { history: [], comparison: null };
    }
    renderHistoryInsights();
  }

  function renderDynamicCopy() {
    const mastery = currentMasteryPoints();
    const lolMatches = live.lol?.summary?.matches;
    const winRate = live.lol?.summary?.winRate;
    const tftTop4 = live.tft?.summary?.top4Rate;
    const averagePlacement = live.tft?.summary?.averagePlacement;

    document.querySelector('#metric-mastery').textContent = formatNumber(mastery);
    document.querySelector('#metric-games').textContent = formatNumber(lolMatches ?? demo.games);

    const gamesLabel = document.querySelector('[data-i18n="games"]');
    if (gamesLabel) gamesLabel.textContent = live.lol
      ? (locale() === 'en' ? 'LoL matches analyzed' : 'Partidas LoL analisadas')
      : t('games');

    const thirdLabel = document.querySelector('#metric-third-label');
    thirdLabel.textContent = live.lol ? (locale() === 'en' ? 'Recent win rate' : 'Win rate recente') : t('years');
    document.querySelector('#metric-years').textContent = live.lol && winRate != null ? `${winRate}%` : String(demo.years);

    const tftLabel = document.querySelector('#metric-tft-label');
    tftLabel.textContent = live.tft ? (locale() === 'en' ? 'TFT Top 4 rate' : 'Top 4 no TFT') : t('top_finish');
    document.querySelector('#metric-tft').textContent = live.tft && tftTop4 != null ? `${tftTop4}%` : demo.tftBest;
    document.querySelector('#tft-average').textContent = live.tft && averagePlacement != null
      ? Number(averagePlacement).toLocaleString(locale(), { maximumFractionDigits: 2 })
      : (demo.placements.reduce((a, b) => a + b, 0) / demo.placements.length).toLocaleString(locale(), { maximumFractionDigits: 1 });

    const champion = currentSignatureChampion();
    document.querySelector('#share-signature').textContent = live.lol
      ? (locale() === 'en' ? `${champion} · recent signature` : `${champion} · assinatura recente`)
      : t('share_card_signature');
    document.querySelector('#share-mastery').textContent = `${formatNumber(mastery)} mastery`;
    document.querySelector('#share-tft').textContent = live.tft
      ? `TFT · Top 4 ${tftTop4 ?? '—'}%`
      : t('share_card_tft');

    renderSignature();
    renderChampions();
    renderRoles();
    renderBoard();
    renderTraits();
    renderCompPatterns();
    renderPlacementBars();
    renderSetRetrospective();
    renderTimeline();
    renderLiveProfileFacts();
    renderHistoryInsights();
    renderLocalMemories();
  }

  function setProfileIdentity(riotId) {
    profileRiotId.textContent = riotId;
    shareRiotId.textContent = riotId;
    document.querySelector('#avatar-letter').textContent = riotId.charAt(0).toUpperCase();
  }

  function showProfile(gameName, tagLine, platform = 'br1', updateUrl = true) {
    const riotId = normalizedId(gameName, tagLine);
    currentLookup = { gameName: String(gameName).trim(), tagLine: String(tagLine).replace(/^#/, '').trim(), platform };
    live = { lol: null, tft: null };
    legacyHistory = { history: [], comparison: null };
    setProfileIdentity(riotId);
    landing.hidden = true;
    profile.hidden = false;
    document.body.classList.add('profile-mode');
    syncRobotsPolicy(true);
    setSourceState('loading');
    renderDynamicCopy();
    activateTab('legacy');

    if (updateUrl) {
      const params = new URLSearchParams();
      params.set('riotId', riotId);
      params.set('server', platform);
      history.replaceState({}, '', `?${params.toString()}`);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    loadLiveProfile(currentLookup);
  }

  async function loadLiveProfile(lookup) {
    const sequence = ++lookupSequence;
    const region = platformRegion(lookup.platform);
    const common = {
      gameName: lookup.gameName,
      tagLine: lookup.tagLine,
      platform: lookup.platform
    };

    const [lolResult, tftResult] = await Promise.allSettled([
      postPublicFunction(backend.lolProfile, { ...common, region, limit: 20, matchLimit: 20 }),
      postPublicFunction(backend.tftProfile, common)
    ]);

    if (sequence !== lookupSequence || !currentLookup ||
        currentLookup.gameName !== lookup.gameName ||
        currentLookup.tagLine !== lookup.tagLine ||
        currentLookup.platform !== lookup.platform) return;

    const lol = lolResult.status === 'fulfilled' ? lolResult.value : null;
    const tft = tftResult.status === 'fulfilled' ? tftResult.value : null;
    live = { lol, tft };

    const canonical = lol?.player || tft?.player;
    if (canonical?.gameName && canonical?.tagLine) {
      setProfileIdentity(normalizedId(canonical.gameName, canonical.tagLine));
    }

    renderDynamicCopy();
    await captureLegacySnapshot(lookup, lol, tft);

    const lolCount = Number(lol?.summary?.matches || 0);
    const tftCount = Number(tft?.summary?.matches || 0);
    if (lol && tft) {
      const detail = locale() === 'en'
        ? `Riot data loaded: ${lolCount} recent LoL matches and ${tftCount} TFT matches. The legacy chapters below use this recent sample.`
        : `Dados Riot carregados: ${lolCount} partidas recentes de LoL e ${tftCount} partidas de TFT. Os capítulos abaixo usam esta amostra recente.`;
      setSourceState('live', detail);
      return;
    }

    if (lol || tft) {
      const available = lol ? 'LoL' : 'TFT';
      const missing = lol ? 'TFT' : 'LoL';
      const missingResult = lol ? tftResult : lolResult;
      const reason = missingResult.status === 'rejected'
        ? liveFailureMessage([missingResult])
        : '';
      const detail = locale() === 'en'
        ? `Live ${available} data loaded. ${missing} is using the demonstrative fallback.${reason ? ' ' + reason : ''}`
        : `Dados reais de ${available} carregados. ${missing} usa o fallback demonstrativo.${reason ? ' ' + reason : ''}`;
      setSourceState('partial', detail);
      return;
    }

    setSourceState('demo', liveFailureMessage([lolResult, tftResult]));
  }

  function showLanding() {
    lookupSequence++;
    currentLookup = null;
    live = { lol: null, tft: null };
    legacyHistory = { history: [], comparison: null };
    profile.hidden = true;
    landing.hidden = false;
    document.body.classList.remove('profile-mode');
    syncRobotsPolicy(false);
    history.replaceState({}, '', location.pathname);
    window.scrollTo({ top: 0, behavior: 'instant' });
    gameNameInput.focus();
  }

  function activateTab(tab) {
    document.querySelectorAll('[data-tab]').forEach(button => {
      const active = button.dataset.tab === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-panel]').forEach(panel => {
      panel.hidden = panel.dataset.panel !== tab;
    });
  }

  function currentShareUrl() {
    return location.href;
  }

  function shareText() {
    const riotId = profileRiotId.textContent;
    const champion = currentSignatureChampion();
    const mastery = currentMasteryPoints();
    if (live.lol || live.tft) {
      return locale() === 'en'
        ? `${riotId} · Riot Legacy — ${champion} as recent LoL signature, ${formatNumber(mastery)} mastery and a Riot-backed LoL + TFT snapshot.`
        : `${riotId} · Riot Legacy — ${champion} como assinatura recente no LoL, ${formatNumber(mastery)} de maestria e um retrato LoL + TFT com dados Riot.`;
    }
    return locale() === 'en'
      ? `${riotId} · Riot Legacy — Ahri signature champion, ${formatNumber(demo.mastery)} mastery and a demonstrative League + TFT story.`
      : `${riotId} · Riot Legacy — Ahri como campeã assinatura, ${formatNumber(demo.mastery)} de maestria e uma história demonstrativa entre League + TFT.`;
  }

  function drawShareCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas_unavailable');

    const riotId = profileRiotId.textContent || 'Riot ID';
    const champion = currentSignatureChampion();
    const mastery = currentMasteryPoints();
    const lolMatches = Number(live.lol?.summary?.matches || 0);
    const winRate = live.lol?.summary?.winRate;
    const tftTop4 = live.tft?.summary?.top4Rate;
    const tftAverage = live.tft?.summary?.averagePlacement;
    const sourceState = sourceBadge.dataset.sourceState || 'demo';
    const english = locale() === 'en';

    const bg = ctx.createLinearGradient(0, 0, 1200, 630);
    bg.addColorStop(0, '#08111b');
    bg.addColorStop(.55, '#101b2a');
    bg.addColorStop(1, '#241f45');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 630);

    const glow = ctx.createRadialGradient(1000, 80, 20, 1000, 80, 360);
    glow.addColorStop(0, 'rgba(216,179,95,.28)');
    glow.addColorStop(1, 'rgba(216,179,95,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(640, 0, 560, 450);

    ctx.fillStyle = 'rgba(255,255,255,.055)';
    ctx.beginPath();
    ctx.arc(1030, 500, 210, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d8b35f';
    ctx.font = '800 24px system-ui, sans-serif';
    ctx.fillText('RIOT LEGACY', 72, 74);

    const badge = sourceState === 'live'
      ? (english ? 'RIOT DATA · LOL + TFT' : 'DADOS RIOT · LOL + TFT')
      : sourceState === 'partial'
        ? (english ? 'PARTIAL RIOT DATA' : 'DADOS RIOT PARCIAIS')
        : (english ? 'DEMONSTRATIVE FALLBACK' : 'FALLBACK DEMONSTRATIVO');
    ctx.font = '700 17px system-ui, sans-serif';
    ctx.fillStyle = sourceState === 'live' ? '#9ce9df' : '#f2d996';
    ctx.fillText(badge, 72, 112);

    ctx.fillStyle = '#f6f8fa';
    ctx.font = '800 58px system-ui, sans-serif';
    ctx.fillText(riotId.slice(0, 28), 72, 205);

    ctx.fillStyle = '#91a0b2';
    ctx.font = '500 23px system-ui, sans-serif';
    ctx.fillText(
      live.lol
        ? (english ? champion + ' · recent LoL signature' : champion + ' · assinatura recente no LoL')
        : (english ? 'Visual legacy preview' : 'Prévia visual do legado'),
      72,
      247
    );

    const cards = [
      {
        label: english ? 'MASTERY' : 'MAESTRIA',
        value: formatNumber(mastery)
      },
      {
        label: english ? 'LOL SAMPLE' : 'AMOSTRA LOL',
        value: live.lol ? String(lolMatches) : '—'
      },
      {
        label: english ? 'WIN RATE' : 'WIN RATE',
        value: live.lol && winRate != null ? winRate + '%' : '—'
      },
      {
        label: english ? 'TFT TOP 4' : 'TOP 4 TFT',
        value: live.tft && tftTop4 != null ? tftTop4 + '%' : '—'
      }
    ];

    cards.forEach((card, index) => {
      const x = 72 + index * 258;
      const y = 324;
      ctx.fillStyle = 'rgba(255,255,255,.055)';
      ctx.fillRect(x, y, 232, 126);
      ctx.fillStyle = '#91a0b2';
      ctx.font = '700 15px system-ui, sans-serif';
      ctx.fillText(card.label, x + 18, y + 31);
      ctx.fillStyle = '#f5efe1';
      ctx.font = '800 31px system-ui, sans-serif';
      ctx.fillText(card.value, x + 18, y + 79);
    });

    ctx.fillStyle = '#c9d2dc';
    ctx.font = '600 20px system-ui, sans-serif';
    const tftLine = live.tft && tftAverage != null
      ? (english
          ? 'TFT average placement: ' + Number(tftAverage).toLocaleString(locale(), { maximumFractionDigits: 2 })
          : 'Colocação média TFT: ' + Number(tftAverage).toLocaleString(locale(), { maximumFractionDigits: 2 }))
      : (english ? 'League + TFT visual legacy' : 'Legado visual de League + TFT');
    ctx.fillText(tftLine, 72, 502);

    ctx.fillStyle = '#718095';
    ctx.font = '500 16px system-ui, sans-serif';
    ctx.fillText(
      english
        ? 'Independent project · Riot Games and related properties belong to Riot Games, Inc.'
        : 'Projeto independente · Riot Games e propriedades relacionadas pertencem à Riot Games, Inc.',
      72,
      570
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(242,217,150,.22)';
    ctx.font = '900 118px system-ui, sans-serif';
    ctx.fillText('RL', 1120, 585);
    ctx.textAlign = 'left';

    return canvas;
  }

  function downloadShareCard() {
    let canvas;
    try {
      canvas = drawShareCard();
    } catch {
      showToast('share_ready');
      return;
    }

    canvas.toBlob(blob => {
      if (!blob) {
        showToast('share_ready');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const slug = String(profileRiotId.textContent || 'riot-legacy')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48) || 'riot-legacy';
      link.href = url;
      link.download = `riot-legacy-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      saveCardCollection();
      showToast('downloaded_card');
    }, 'image/png');
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentShareUrl());
      showToast('copied');
    } catch {
      showToast('share_ready');
    }
  }

  async function shareLegacy() {
    const payload = {
      title: 'Riot Legacy · ' + profileRiotId.textContent,
      text: shareText(),
      url: currentShareUrl()
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
      showToast('share_ready');
    } catch {
      showToast('share_ready');
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const gameName = gameNameInput.value;
    const tagLine = tagLineInput.value;
    if (!validInput(gameName, tagLine)) {
      feedback.textContent = t('invalid_id');
      feedback.hidden = false;
      return;
    }
    feedback.hidden = true;
    addRecentSearch(gameName, tagLine, platformInput.value);
    showProfile(gameName, tagLine, platformInput.value);
  });

  recentSearchesList?.addEventListener('click', event => {
    const button = event.target.closest('[data-recent-index]');
    if (!button) return;
    openRecentSearch(button.dataset.recentIndex);
  });

  clearRecentSearches?.addEventListener('click', () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    renderRecentSearches();
  });

  backButton.addEventListener('click', showLanding);

  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => activateTab(button.dataset.tab));
  });

  document.querySelector('#copy-link').addEventListener('click', copyLink);
  document.querySelector('#share-legacy').addEventListener('click', shareLegacy);
  document.querySelector('#share-card-action').addEventListener('click', shareLegacy);
  document.querySelector('#download-card').addEventListener('click', downloadShareCard);
  document.querySelector('#favorite-milestone')?.addEventListener('click', favoriteCurrentMilestone);
  refreshButton?.addEventListener('click', () => {
    if (!currentLookup) return;
    setSourceState('loading');
    loadLiveProfile({ ...currentLookup });
  });

  window.addEventListener('riot-legacy-language', () => {
    renderDynamicCopy();
    if (currentLookup) {
      const state = sourceBadge.dataset.sourceState || 'demo';
      if (state === 'loading') setSourceState('loading');
      else if (state === 'live') {
        const lolCount = Number(live.lol?.summary?.matches || 0);
        const tftCount = Number(live.tft?.summary?.matches || 0);
        setSourceState('live', locale() === 'en'
          ? `Riot data loaded: ${lolCount} recent LoL matches and ${tftCount} TFT matches. The legacy chapters below use this recent sample.`
          : `Dados Riot carregados: ${lolCount} partidas recentes de LoL e ${tftCount} partidas de TFT. Os capítulos abaixo usam esta amostra recente.`);
      } else if (state === 'partial') {
        const available = live.lol ? 'LoL' : 'TFT';
        const missing = live.lol ? 'TFT' : 'LoL';
        setSourceState('partial', locale() === 'en'
          ? `Live ${available} data loaded. ${missing} is using the demonstrative fallback for this lookup.`
          : `Dados reais de ${available} carregados. ${missing} usa o fallback demonstrativo nesta busca.`);
      } else setSourceState('demo');
    }
    if (!feedback.hidden) feedback.textContent = t('invalid_id');
  });

  renderRecentSearches();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }, { once: true });
  }

  const params = new URLSearchParams(location.search);
  const deepId = params.get('riotId');
  if (deepId && deepId.includes('#')) {
    const index = deepId.lastIndexOf('#');
    const gameName = deepId.slice(0, index);
    const tagLine = deepId.slice(index + 1);
    const platform = params.get('server') || platformFromLegacyRegion(params.get('region'));
    gameNameInput.value = gameName;
    tagLineInput.value = tagLine;
    platformInput.value = [...platformInput.options].some(option => option.value === platform) ? platform : 'br1';
    showProfile(gameName, tagLine, platformInput.value, false);
  }
})();
