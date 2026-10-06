# Riot Legacy

**Seu histórico de League of Legends e Teamfight Tactics como uma experiência visual, emocional e compartilhável.**

> Status: protótipo MVP navegável iniciado em 06/10/2026.

O Riot Legacy não quer ser outro tracker cheio de tabelas. A proposta é transformar um **Riot ID** em um "museu pessoal" da conta: campeão assinatura, trajetória, maestria, funções, retrospectiva de TFT, marcos e cards feitos para compartilhar.

## Estado atual

- landing page visual;
- entrada por Riot ID (`GameName#TagLine`);
- PT-BR como idioma principal e English como segundo idioma;
- preferência de idioma persistida;
- perfil híbrido com dados Riot reais de LoL + TFT e fallback demonstrativo quando uma fonte estiver indisponível;
- abas Legado, League, TFT e Compartilhar;
- campeão assinatura;
- timeline de trajetória;
- resumo de funções e maestria;
- TFT real com colocações, traits e unidades das partidas recentes;
- card compartilhável e Web Share/clipboard;
- exportação do card como PNG gerada localmente no navegador;
- URL compartilhável por query string;
- slots de anúncios reservados, sem anúncios reais;
- SEO/Open Graph/manifest/robots/sitemap;
- integração com `public-lol-profile` e `public-tft-profile` do backend gamer;
- atualização manual dos dados sem recarregar a página;
- buscas recentes de Riot ID + servidor salvas somente no navegador;
- faixa compacta com servidor, nível da conta e ranks oficiais LoL/TFT quando disponíveis;
- seletor cobre todos os shards suportados pelo backend gamer;
- mensagens distintas para Riot ID inexistente, rate limit, timeout e indisponibilidade server-side;
- Static QA e Browser E2E verdes, incluindo hidratação LoL + TFT mockada;
- estados explícitos: consultando Riot, dados Riot, parcial e fallback demonstrativo.

## Dados Riot + fallback demonstrativo

A busca já consulta o backend gamer real:

- LoL: `public-lol-profile`;
- TFT: `public-tft-profile`.

As duas funções usam a Riot key somente no servidor. Quando respondem, o perfil troca automaticamente para dados Riot reais da amostra recente.

Quando uma fonte não responde ou o jogador não possui dados naquele jogo, somente aquela parte mantém o fallback demonstrativo e a interface informa o estado claramente.

Com dados Riot ativos, a aba Legado troca a timeline fictícia por capítulos da amostra recente. A trajetória histórica de temporadas/anos continua sendo uma etapa posterior baseada em snapshots reais.

## Backend gamer

O Riot Legacy **reutiliza o Supabase do ZeroTwo.gg** (`bieihhaobdztjyoweewa`), onde a Riot key já está protegida server-side. Não será criado outro banco e o projeto não usa `pizzaria-db`.

As funções `public-lol-profile` e `public-tft-profile` já são consumidas pelo frontend do Riot Legacy.

## Próximo estágio — dados Riot reais

A arquitetura usa:

1. Riot ID (`gameName + tagLine`);
2. ACCOUNT-V1 para obter PUUID;
3. endpoints suportados de League/TFT por PUUID;
4. Edge Functions `public-lol-profile` e `public-tft-profile` do backend gamer;
5. chave Riot **somente no servidor**, nunca no JavaScript público;
6. cache gamer existente para reduzir chamadas e respeitar rate limits.

A Riot recomenda Riot ID como referência player-facing e PUUID quando o endpoint oferece essa opção.

## Monetização

A regra do portfólio continua válida: **monetização principal por anúncios**.

Neste protótipo os espaços são apenas reservados estruturalmente. Anúncios reais só serão ativados depois de:

- produto registrado no Riot Developer Portal;
- status adequado para monetização;
- Publisher ID/slots aprovados;
- revisão de UX para impedir anúncios perto de controles críticos.

Consulte [ADS_SETUP.md](./ADS_SETUP.md).

### Regra antes do lançamento standalone

O Supabase gamer e as funções existentes podem ser reutilizados no desenvolvimento do protótipo. Antes de publicar o Riot Legacy como produto independente, o registro do produto e a credencial Riot aplicável devem ser revisados para que a chave usada em produção corresponda ao produto/status aprovado.

## Idiomas

- **PT-BR**: principal, padrão e fallback.
- **EN**: segundo idioma obrigatório.
- Preferência persistida em `localStorage`.
- Conteúdo de interface é traduzido; Riot ID e dados do jogador nunca são traduzidos.

## Executar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:4173`.

Testes:

```bash
npm run test:e2e
npm run check
```

## Estrutura

- `index.html` — interface principal;
- `style.css` — direção visual cinematográfica;
- `i18n.js` — PT-BR/EN;
- `backend-config.js` — endpoints públicos do Supabase gamer;
- `app.js` — Riot ID, hidratação LoL/TFT real, fallback demo, tabs e compartilhamento;
- `tests/` — Browser E2E;
- `FULLSTACK.md` — arquitetura e plano de backend;
- `MELHORIAS.md` — backlog priorizado;
- `ADS_SETUP.md` — preparação de monetização;
- `RIOT_API.md` — estratégia de integração Riot.

## Conformidade Riot

Antes de disponibilizar dados reais ao público, o produto deve ser registrado/auditado no Riot Developer Portal e acompanhar as políticas atuais.

Aviso resumido visível no produto: Riot Legacy é um projeto independente e não é endossado pela Riot Games. Marcas e propriedades relacionadas pertencem à Riot Games, Inc.

## Destino

Repositório planejado: `HelioConde/riot-legacy`.

Enquanto o conector não permite criar o repositório físico, esta branch standalone pode ser enviada como `main` para o destino sem carregar os arquivos do hub.
