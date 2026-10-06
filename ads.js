(() => {
  const config = window.RIOT_LEGACY_ADS || {};
  const backend = window.RIOT_LEGACY_BACKEND || {};
  if (!config.enabled || !backend?.features?.ads) return;
  if (config.provider !== 'adsense') return;

  const clientId = String(config.clientId || '').trim();
  if (!/^ca-pub-\d+$/.test(clientId)) {
    console.warn('[Riot Legacy] Ads enabled but AdSense client ID is invalid.');
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  script.addEventListener('load', () => {
    document.querySelectorAll('[data-ad-slot]').forEach(shell => {
      const key = shell.dataset.adSlot === 'landing-top' ? 'landing' : 'profile';
      const slot = String(config.slots?.[key] || '').trim();
      if (!/^\d+$/.test(slot)) return;

      shell.dataset.adState = 'active';
      shell.innerHTML = '';
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.dataset.adClient = clientId;
      ins.dataset.adSlot = slot;
      ins.dataset.adFormat = 'auto';
      ins.dataset.fullWidthResponsive = 'true';
      shell.appendChild(ins);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        shell.dataset.adState = 'error';
      }
    });
  });
  document.head.appendChild(script);
})();
