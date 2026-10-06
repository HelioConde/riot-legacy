(() => {
  const existing = window.RIOT_LEGACY_BACKEND || {};
  const functionsBase = typeof existing.functionsBase === 'string' && existing.functionsBase
    ? existing.functionsBase.replace(/\/$/, '')
    : 'https://bieihhaobdztjyoweewa.supabase.co/functions/v1';

  window.RIOT_LEGACY_BACKEND = Object.freeze({
    functionsBase,
    lolProfile: existing.lolProfile || functionsBase + '/riot-legacy-lol-profile',
    tftProfile: existing.tftProfile || functionsBase + '/riot-legacy-tft-profile',
    legacySnapshots: existing.legacySnapshots || functionsBase + '/riot-legacy-snapshots',
    legacyEvents: existing.legacyEvents || functionsBase + '/riot-legacy-events',
    publicProfile: existing.publicProfile || functionsBase + '/riot-legacy-public-profile',
    rsoStart: existing.rsoStart || functionsBase + '/riot-legacy-rso-start',
    features: {
      publicProfiles: false,
      ads: false,
      retentionTelemetry: true
    },
    source: 'zerotwo-gamer-supabase'
  });
})();
