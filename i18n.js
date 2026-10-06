(() => {
  const STORAGE_KEY = 'riot-legacy-language';
  const dictionaries = {
    'pt-BR': {
      skip: 'Pular para o conteúdo principal',
      nav_about: 'O conceito',
      hero_eyebrow: 'LOL + TFT · SEU MUSEU PESSOAL',
      hero_title_a: 'Sua conta tem uma história.',
      hero_title_b: 'Transforme em legado.',
      hero_text: 'Digite seu Riot ID e veja uma experiência visual sobre identidade, trajetória, campeões, TFT e marcos que valem ser lembrados.',
      game_name: 'Game Name',
      tag_line: 'Tag Line',
      region: 'Roteamento',
      server: 'Servidor',
      submit: 'Ver meu legado',
      privacy: 'Nunca pedimos sua senha da Riot.',
      recent_searches: 'Buscas recentes',
      clear_recent: 'Limpar',
      demo_note: 'A busca tenta carregar dados públicos reais da Riot. Quando indisponíveis, o fallback demonstrativo é identificado.',
      visual_since: 'Uma história desde',
      visual_signature: 'Campeão assinatura',
      visual_tft: 'Memória TFT',
      ad_label: 'Publicidade futura · espaço reservado',
      concept_title: 'Não é outro tracker.',
      concept_text: 'O Riot Legacy organiza dados em memória, identidade e narrativa — para você querer rever a página e compartilhar o que conquistou.',
      pillar_identity: 'Identidade',
      pillar_identity_text: 'Campeão assinatura, funções, estilo e escolhas que definem sua conta.',
      pillar_journey: 'Trajetória',
      pillar_journey_text: 'Marcos e fases organizados como uma linha do tempo, não como uma planilha.',
      pillar_share: 'Compartilhável',
      pillar_share_text: 'Cards pensados para mostrar uma história em segundos, sem exigir contexto de tracker.',
      back: 'Novo perfil',
      demo_badge: 'DADOS DEMONSTRATIVOS',
      demo_explain: 'O Riot ID personaliza esta prévia; estatísticas reais entram quando o backend Riot estiver conectado.',
      legacy_since: 'Legado desde 2018',
      share: 'Compartilhar legado',
      copy: 'Copiar link',
      refresh_data: 'Atualizar dados',
      refreshing_data: 'Atualizando…',
      tab_legacy: 'Legado',
      tab_league: 'League',
      tab_tft: 'TFT',
      tab_share: 'Compartilhar',
      signature_kicker: 'SUA ASSINATURA',
      signature_title: 'Ahri define esta conta',
      signature_text: 'Anos de presença, maestria e recorrência transformaram a Raposa de Nove Caudas no rosto desta história.',
      mastery: 'Maestria',
      games: 'Partidas lembradas',
      years: 'Anos de história',
      top_finish: 'Melhor fase TFT',
      timeline_title: 'Uma conta em capítulos',
      timeline_2018: 'O começo',
      timeline_2018_text: 'Primeiras temporadas registradas e descoberta da rota do meio.',
      timeline_2021: 'A identidade aparece',
      timeline_2021_text: 'Ahri se torna presença recorrente e concentra a maior parte da maestria.',
      timeline_2024: 'TFT vira segunda casa',
      timeline_2024_text: 'Comps e augments passam a fazer parte da memória da conta.',
      timeline_2026: 'Agora',
      timeline_2026_text: 'O legado passa a ser visto como história, não só como histórico de partidas.',
      league_title: 'Seu DNA em League',
      role_mid: 'Mid',
      role_support: 'Suporte',
      role_other: 'Outras',
      tft_title: 'Sua memória de TFT',
      board_label: 'Board assinatura',
      traits_label: 'Traits recorrentes',
      placement_label: 'Colocação média',
      share_title: 'Uma história que cabe em um card',
      share_text: 'Transforme o perfil em algo que faça sentido mesmo para quem não abriu um tracker.',
      share_card_label: 'RIOT LEGACY · PERFIL',
      share_card_signature: 'Ahri · campeã assinatura',
      share_card_tft: 'TFT · melhor fase: Top 2',
      share_action: 'Compartilhar este card',
      download_card: 'Baixar card PNG',
      downloaded_card: 'Card PNG baixado.',
      copied: 'Link copiado.',
      share_ready: 'Resumo pronto para compartilhar.',
      invalid_id: 'Use Game Name com 3–16 caracteres e Tag Line com 3–5 letras ou números.',
      legal: 'Riot Legacy é um projeto independente e não é endossado pela Riot Games. Marcas e propriedades relacionadas pertencem à Riot Games, Inc.',
      footer_demo: 'Protótipo de validação · dados demonstrativos'
    },
    en: {
      recent_searches: 'Recent searches',
      clear_recent: 'Clear',
      skip: 'Skip to main content',
      nav_about: 'The concept',
      hero_eyebrow: 'LOL + TFT · YOUR PERSONAL MUSEUM',
      hero_title_a: 'Your account has a story.',
      hero_title_b: 'Turn it into a legacy.',
      hero_text: 'Enter your Riot ID and see a visual experience about identity, journey, champions, TFT and milestones worth remembering.',
      game_name: 'Game Name',
      tag_line: 'Tag Line',
      region: 'Routing',
      server: 'Server',
      submit: 'View my legacy',
      privacy: 'We never ask for your Riot password.',
      demo_note: 'Search tries to load real public Riot data. When unavailable, the demonstrative fallback is clearly identified.',
      visual_since: 'A story since',
      visual_signature: 'Signature champion',
      visual_tft: 'TFT memory',
      ad_label: 'Future advertising · reserved space',
      concept_title: 'Not another tracker.',
      concept_text: 'Riot Legacy turns data into memory, identity and narrative — so you actually want to revisit the page and share what you achieved.',
      pillar_identity: 'Identity',
      pillar_identity_text: 'Signature champion, roles, style and choices that define your account.',
      pillar_journey: 'Journey',
      pillar_journey_text: 'Milestones and phases organized as a timeline, not a spreadsheet.',
      pillar_share: 'Shareable',
      pillar_share_text: 'Cards designed to tell a story in seconds without requiring tracker context.',
      back: 'New profile',
      demo_badge: 'DEMONSTRATIVE DATA',
      demo_explain: 'Your Riot ID personalizes this preview; real stats arrive when the Riot backend is connected.',
      legacy_since: 'Legacy since 2018',
      share: 'Share legacy',
      copy: 'Copy link',
      refresh_data: 'Refresh data',
      refreshing_data: 'Refreshing…',
      tab_legacy: 'Legacy',
      tab_league: 'League',
      tab_tft: 'TFT',
      tab_share: 'Share',
      signature_kicker: 'YOUR SIGNATURE',
      signature_title: 'Ahri defines this account',
      signature_text: 'Years of presence, mastery and recurrence turned the Nine-Tailed Fox into the face of this story.',
      mastery: 'Mastery',
      games: 'Remembered matches',
      years: 'Years of history',
      top_finish: 'Best TFT phase',
      timeline_title: 'An account in chapters',
      timeline_2018: 'The beginning',
      timeline_2018_text: 'First recorded seasons and the discovery of mid lane.',
      timeline_2021: 'Identity emerges',
      timeline_2021_text: 'Ahri becomes a recurring presence and holds the largest share of mastery.',
      timeline_2024: 'TFT becomes a second home',
      timeline_2024_text: 'Comps and augments become part of the account memory.',
      timeline_2026: 'Now',
      timeline_2026_text: 'The legacy starts being seen as a story, not just match history.',
      league_title: 'Your League DNA',
      role_mid: 'Mid',
      role_support: 'Support',
      role_other: 'Other',
      tft_title: 'Your TFT memory',
      board_label: 'Signature board',
      traits_label: 'Recurring traits',
      placement_label: 'Average placement',
      share_title: 'A story that fits in one card',
      share_text: 'Turn the profile into something meaningful even for someone who never opened a tracker.',
      share_card_label: 'RIOT LEGACY · PROFILE',
      share_card_signature: 'Ahri · signature champion',
      share_card_tft: 'TFT · best phase: Top 2',
      share_action: 'Share this card',
      download_card: 'Download PNG card',
      downloaded_card: 'PNG card downloaded.',
      copied: 'Link copied.',
      share_ready: 'Summary ready to share.',
      invalid_id: 'Use a 3–16 character Game Name and a 3–5 letter/number Tag Line.',
      legal: 'Riot Legacy is an independent community project and is not endorsed by Riot Games. Riot Games and related properties are trademarks of Riot Games, Inc.',
      footer_demo: 'Validation prototype · demonstrative data'
    }
  };

  let locale = localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'pt-BR';

  function t(key) {
    return dictionaries[locale][key] || dictionaries['pt-BR'][key] || key;
  }

  function apply() {
    document.documentElement.lang = locale;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      const active = button.dataset.language === locale;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const english = locale === 'en';
    document.title = english
      ? 'Riot Legacy — Your LoL + TFT story'
      : 'Riot Legacy — Sua história de LoL + TFT';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = english
      ? 'Turn your Riot ID into a visual journey through League of Legends and TFT.'
      : 'Transforme seu Riot ID em uma jornada visual por League of Legends e TFT.';
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = document.title;
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = description?.content || '';

    window.dispatchEvent(new CustomEvent('riot-legacy-language', { detail: { locale } }));
  }

  function setLocale(next) {
    locale = next === 'en' ? 'en' : 'pt-BR';
    localStorage.setItem(STORAGE_KEY, locale);
    apply();
  }

  function init() {
    document.querySelectorAll('[data-language]').forEach(button => {
      button.addEventListener('click', () => setLocale(button.dataset.language));
    });
    apply();
  }

  window.RiotLegacyI18n = { t, apply, setLocale, locale: () => locale };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
