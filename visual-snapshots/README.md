# Visual snapshots

Esta pasta é atualizada automaticamente pelo workflow **Visual Snapshots** depois de cada deploy bem-sucedido do GitHub Pages.

Arquivos gerados:

- `landing-desktop.png` — landing em desktop;
- `profile-desktop.png` — perfil demonstrativo em desktop;
- `profile-mobile.png` — perfil demonstrativo em mobile;
- `metadata.json` — data, viewport e referência do snapshot.

O perfil visual usa `VisualTest#BR1` apenas para abrir a experiência demonstrativa. Nenhum Riot ID pessoal é persistido nesse workflow.

Para gerar localmente:

```bash
npm install
npx playwright install chromium
npm run screenshot
```
