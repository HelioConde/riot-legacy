const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.route('**/public-lol-profile', route => route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'player', message: 'demo fallback' })
  }));
  await page.route('**/public-tft-profile', route => route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'player_not_found', message: 'demo fallback' })
  }));
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('abre em PT-BR e cria uma experiência demonstrativa por Riot ID', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { name: /Sua conta tem uma história/i })).toBeVisible();

  await page.locator('#game-name').fill('HelioConde');
  await page.locator('#tag-line').fill('BR1');
  await page.getByRole('button', { name: /Ver meu legado/i }).click();

  await expect(page.locator('#profile-view')).toBeVisible();
  await expect(page.locator('#profile-riot-id')).toContainText('HelioConde#BR1');
  await expect(page.locator('#demo-badge')).toBeVisible();
  await expect(page).toHaveURL(/riotId=HelioConde%23BR1/);
});

test('troca para inglês, persiste e mantém o perfil navegável', async ({ page }) => {
  await page.locator('#landing-view [data-language="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: /Your account has a story/i })).toBeVisible();

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.locator('#game-name').fill('LegacyPlayer');
  await page.locator('#tag-line').fill('NA1');
  await page.getByRole('button', { name: /View my legacy/i }).click();
  await page.getByRole('button', { name: 'TFT' }).click();
  await expect(page.locator('#panel-tft')).toBeVisible();
});

test('deep link restaura o perfil demonstrativo', async ({ page }) => {
  await page.goto('/?riotId=DeepLink%23BR1&region=americas');
  await expect(page.locator('#profile-view')).toBeVisible();
  await expect(page.locator('#profile-riot-id')).toContainText('DeepLink#BR1');
});

test('mobile não cria overflow horizontal crítico', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(361);
});


test('carrega LoL e TFT reais pelo backend gamer e substitui o fallback', async ({ page }) => {
  await page.unroute('**/public-lol-profile');
  await page.unroute('**/public-tft-profile');

  await page.route('**/public-lol-profile', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      player: { gameName: 'RealPlayer', tagLine: 'BR1', level: 321, platform: 'BR1' },
      ranked: [{ queue: 'SOLO/DUO', tier: 'GOLD', rank: 'II', lp: 42, wins: 20, losses: 15, winRate: 57 }],
      mastery: [{ championId: 99, level: 7, points: 999999 }],
      championSummaries: [
        { name: 'Ahri', games: 4, avgKda: 3.3 },
        { name: 'Syndra', games: 2, avgKda: 2.7 },
        { name: 'Lux', games: 6, avgKda: 4.1 }
      ],
      summary: {
        matches: 12,
        wins: 7,
        losses: 5,
        winRate: 58,
        primaryPosition: 'MID',
        mainContext: 'RANKED'
      },
      matches: [
        { position: 'MID', playedAt: Date.UTC(2026, 8, 1) },
        { position: 'MID', playedAt: Date.UTC(2026, 8, 7) },
        { position: 'MID', playedAt: Date.UTC(2026, 8, 12) },
        { position: 'SUPPORT', playedAt: Date.UTC(2026, 8, 18) },
        { position: 'MID', playedAt: Date.UTC(2026, 8, 24) },
        { position: 'SUPPORT', playedAt: Date.UTC(2026, 9, 2) }
      ]
    })
  }));

  await page.route('**/public-tft-profile', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      player: { gameName: 'RealPlayer', tagLine: 'BR1', platform: 'BR1' },
      ranked: [{ queueType: 'RANKED_TFT', tier: 'PLATINUM', rank: 'IV', leaguePoints: 33, wins: 8, losses: 6 }],
      summary: { matches: 4, averagePlacement: 2.5, top4Rate: 75, winRate: 25, firsts: 1, eighths: 0 },
      matches: [
        {
          placement: 1,
          units: [
            { characterId: 'TFT14_Ahri', tier: 2 },
            { characterId: 'TFT14_Lux', tier: 1 }
          ],
          traits: [
            { name: 'TFT14_Arcana', numUnits: 4, style: 2 },
            { name: 'TFT14_Scholar', numUnits: 2, style: 1 }
          ]
        },
        { placement: 2, units: [], traits: [] },
        { placement: 3, units: [], traits: [] },
        { placement: 4, units: [], traits: [] }
      ]
    })
  }));

  await page.locator('#game-name').fill('RealPlayer');
  await page.locator('#tag-line').fill('BR1');
  await page.locator('#region').selectOption('br1');
  await page.getByRole('button', { name: /Ver meu legado/i }).click();

  await expect(page.locator('#demo-badge')).toHaveText('DADOS RIOT · LOL + TFT');
  await expect(page.locator('#profile-riot-id')).toHaveText('RealPlayer#BR1');
  await expect(page.locator('#signature-title')).toContainText('Lux');
  await expect(page.locator('#signature-text')).toContainText('maior frequência de partidas');
  await expect(page.locator('#signature-chip')).toContainText('6 JOGOS');
  await expect(page.locator('#metric-mastery')).toContainText('999.999');
  await expect(page.locator('#metric-games')).toHaveText('12');
  await expect(page.locator('#metric-years')).toHaveText('58%');
  await expect(page.locator('#metric-tft')).toHaveText('75%');
  await expect(page.locator('#tft-average')).toContainText('2,5');
  await expect(page.locator('#champion-list')).toContainText('Lux');
  await expect(page.locator('#trait-list')).toContainText('Arcana');
  await expect(page.locator('#live-profile-facts')).toContainText('BR1');
  await expect(page.locator('#live-profile-facts')).toContainText('GOLD II · 42 LP');
  await expect(page.locator('#live-profile-facts')).toContainText('PLATINUM IV · 33 LP');
  await expect(page.locator('#data-source-note')).toContainText('12 partidas recentes de LoL');
  await expect(page.locator('#timeline-title')).toContainText('amostra Riot recente');
  await expect(page.locator('#legacy-timeline')).toContainText('Seu momento recente');
  await expect(page.locator('#legacy-timeline')).toContainText('Janela histórica disponível');
  await expect(page.locator('#legacy-timeline')).toContainText('Partida mais antiga disponível');
  await expect(page.locator('#share-period')).toHaveText('Amostra Riot recente · LoL + TFT');
  await expect(page.locator('#share-period')).not.toContainText('2018');
  await page.getByRole('button', { name: 'Atualizar dados' }).click();
  await expect(page.locator('#demo-badge')).toHaveText('DADOS RIOT · LOL + TFT');
  await expect(page).toHaveURL(/server=br1/);
});


test('baixa o card compartilhável como PNG', async ({ page }) => {
  await page.locator('#game-name').fill('CardPlayer');
  await page.locator('#tag-line').fill('BR1');
  await page.getByRole('button', { name: /Ver meu legado/i }).click();
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar card PNG' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^riot-legacy-cardplayer-br1\.png$/);
});


test('explica rate limit e mantém fallback demonstrativo', async ({ page }) => {
  await page.unroute('**/public-lol-profile');
  await page.unroute('**/public-tft-profile');

  for (const endpoint of ['public-lol-profile', 'public-tft-profile']) {
    await page.route('**/' + endpoint, route => route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'rate_limited',
        message: 'Limite da Riot atingido.'
      })
    }));
  }

  await page.locator('#game-name').fill('RateLimit');
  await page.locator('#tag-line').fill('BR1');
  await page.getByRole('button', { name: /Ver meu legado/i }).click();

  await expect(page.locator('#demo-badge')).toHaveText('FALLBACK DEMONSTRATIVO');
  await expect(page.locator('#data-source-note')).toContainText('limite temporário da Riot');
  await expect(page.getByRole('button', { name: 'Atualizar dados' })).toBeEnabled();
});


test('buscas recentes persistem servidor e reabrem o perfil', async ({ page }) => {
  await page.locator('#game-name').fill('RecentPlayer');
  await page.locator('#tag-line').fill('EUW');
  await page.locator('#region').selectOption('euw1');
  await page.getByRole('button', { name: /Ver meu legado/i }).click();

  await page.getByRole('button', { name: /Novo perfil/i }).click();
  await expect(page.locator('#recent-searches')).toBeVisible();
  await expect(page.locator('#recent-searches-list .recent-search')).toHaveCount(1);
  await expect(page.locator('#recent-searches-list')).toContainText('RecentPlayer#EUW');
  await expect(page.locator('#recent-searches-list')).toContainText('EUW1');

  await page.reload();
  await expect(page.locator('#recent-searches-list .recent-search')).toHaveCount(1);
  await page.locator('#recent-searches-list .recent-search').click();

  await expect(page.locator('#profile-riot-id')).toHaveText('RecentPlayer#EUW');
  await expect(page).toHaveURL(/server=euw1/);

  await page.getByRole('button', { name: /Novo perfil/i }).click();
  await expect(page.locator('#recent-searches-list .recent-search')).toHaveCount(1);
  await page.getByRole('button', { name: 'Limpar', exact: true }).click();
  await expect(page.locator('#recent-searches')).toBeHidden();
});


test('servidores SEA suportados mantêm o routing correto no deep link', async ({ page }) => {
  await page.locator('#game-name').fill('SeaPlayer');
  await page.locator('#tag-line').fill('SG2');
  await page.locator('#region').selectOption('sg2');
  await page.getByRole('button', { name: /Ver meu legado/i }).click();

  await expect(page).toHaveURL(/server=sg2/);
  await page.getByRole('button', { name: /Novo perfil/i }).click();
  await page.locator('#recent-searches-list .recent-search').click();
  await expect(page).toHaveURL(/server=sg2/);
});
