# Visual snapshots

Esta pasta é atualizada automaticamente pelo workflow **Visual Snapshots** depois de cada deploy bem-sucedido do GitHub Pages.

Arquivos gerados:

- `landing-desktop.png` — landing em desktop;
- `landing-mobile.png` — landing em mobile;
- `profile-desktop.png` — perfil real/cacheado de `AlchemyFlames#BR1` em desktop;
- `profile-mobile.png` — perfil real/cacheado de `AlchemyFlames#BR1` em mobile;
- `review-*.jpg` — previews leves do primeiro viewport para revisão visual automática;
- `metadata.json` — data, viewport e referência do snapshot.

As capturas de perfil usam `AlchemyFlames#BR1` como conta de teste visual conhecida. O workflow grava somente as imagens públicas geradas e metadados de viewport; nenhuma credencial Riot é armazenada.

Para gerar localmente:

```bash
npm install
npx playwright install chromium
npm run screenshot
```
