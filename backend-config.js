(() => {
  const existing = window.RIOT_LEGACY_BACKEND || {};
  const functionsBase = typeof existing.functionsBase === 'string' && existing.functionsBase
    ? existing.functionsBase.replace(/\/$/, '')
    : 'https://bieihhaobdztjyoweewa.supabase.co/functions/v1';

  window.RIOT_LEGACY_BACKEND = Object.freeze({
    functionsBase,
    lolProfile: existing.lolProfile || functionsBase + '/public-lol-profile',
    tftProfile: existing.tftProfile || functionsBase + '/public-tft-profile',
    legacySnapshots: existing.legacySnapshots || functionsBase + '/riot-legacy-snapshots',
    legacyEvents: existing.legacyEvents || functionsBase + '/riot-legacy-events',
    features: {
      publicProfiles: false,
      ads: false,
      retentionTelemetry: true
    },
    source: 'zerotwo-gamer-supabase'
  });
})();
