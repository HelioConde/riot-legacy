# Arquitetura fullstack — Riot Legacy

## Objetivo do MVP

Validar se jogadores querem **rever e compartilhar a própria história** de LoL + TFT em uma experiência visual, em vez de usar somente um tracker analítico.

## Fase atual — experiência primeiro

O frontend usa um perfil demonstrativo após a entrada de Riot ID. O modo demo é sempre identificado na interface.

Nenhuma API key está no frontend e nenhum dado demonstrativo é apresentado como real.

## Fluxo futuro com dados reais

```text
Riot ID
  ↓
Edge Function / API própria
  ↓
ACCOUNT-V1: Riot ID → PUUID
  ↓
League / TFT APIs suportadas
  ↓
normalização + cache
  ↓
payload Riot Legacy
  ↓
experiência visual no navegador
```

### Identificação

Entrada:
- `gameName`
- `tagLine`
- cluster de roteamento quando necessário.

Primeira resolução:
- ACCOUNT-V1 `/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}`;
- armazenar/usar PUUID como identificador técnico.

### League of Legends

Fontes candidatas:
- `summoner-v4` por PUUID;
- `champion-mastery-v4`;
- `league-v4`;
- `match-v5`;
- `lol-challenges-v1`.

O produto não criará MMR/ELO alternativo.

### Teamfight Tactics

Fontes candidatas:
- `tft-match-v1`;
- `tft-league-v1`;
- endpoints suportados no Developer Portal no momento da implementação.

## Backend gamer existente

**Banco oficial para Riot Legacy: Supabase ZeroTwo.gg**

- project ref: `bieihhaobdztjyoweewa`;
- URL pública: `https://bieihhaobdztjyoweewa.supabase.co`;
- infraestrutura compartilhada pelos produtos gamer;
- `RIOT_API_KEY` já existe como secret server-side;
- cache Riot já existe em `riot_player_cache` e `lol_match_cache`;
- Edge Function existente `public-lol-profile` já resolve Riot ID → PUUID e consulta League;
- Edge Function existente `riot-lol-player` atende o fluxo autenticado do ZeroTwo.

**Não usar `pizzaria-db` e não criar outro Supabase para o Riot Legacy.**

A reutilização é da infraestrutura gamer, não da chave no navegador. O frontend do Riot Legacy pode conhecer somente a URL e a publishable key pública do Supabase. A `RIOT_API_KEY`, service role e demais secrets permanecem nas Edge Functions.

Regras:
- nunca copiar `RIOT_API_KEY` para `app.js`, HTML, GitHub Pages, localStorage ou Git;
- reutilizar `public-lol-profile` antes de criar nova função;
- criar uma Edge Function nova apenas quando a narrativa do Riot Legacy exigir payload que a função existente não possa fornecer de forma limpa;
- reutilizar cache por Riot ID/PUUID e partidas;
- rate limiting e chamadas Riot continuam server-side;
- logs sem API key, tokens ou PUUID desnecessário no browser.

## Modelo de dados sugerido

Para o primeiro backend persistente:

- `riot_legacy_profiles`
  - `puuid_hash`
  - Riot ID normalizado
  - região/cluster
  - timestamps de cache

- `riot_legacy_snapshots`
  - resumo LoL
  - resumo TFT
  - versão do schema
  - timestamp de coleta

Evitar armazenar histórico bruto quando um resumo derivado atender o produto.

## Frontend

Stack inicial deliberadamente simples:
- HTML;
- CSS;
- JavaScript;
- GitHub Pages.

Razão: validar conceito, narrativa e retenção antes de introduzir framework.

Migrar para framework apenas se rotas, geração de cards ou componentes passarem a justificar.

## i18n

- PT-BR padrão/fallback;
- EN obrigatório;
- preferência persistida;
- metadados localizados;
- textos dinâmicos localizados;
- conteúdo do jogador não é traduzido.

## Anúncios

Slots são reservados fora das ações principais.

Não ativar rede real até:
- produto Riot registrado;
- monetização permitida pelo status do produto;
- Publisher/slots aprovados;
- consentimento/privacidade implementados quando necessário.

## QA

Gate mínimo:
- Riot ID válido/inválido;
- PT → EN → reload → EN;
- deep link por query string;
- tabs;
- compartilhamento/cópia;
- mobile sem overflow;
- modo demo claramente visível;
- nenhum secret no bundle;
- aviso independente/Riot visível.

## Deploy

Destino planejado:
`https://helioconde.github.io/riot-legacy/`

A branch atual é standalone e será promovida para a `main` do repositório físico.


## Integração real já ativa no frontend

O frontend usa chamadas públicas HTTPS para:

- `public-lol-profile` — Riot ID → PUUID → Summoner/Ranked/Mastery/Match-V5;
- `public-tft-profile` — Riot ID → PUUID → TFT Summoner/League/Match.

Ambas estão ativas no Supabase gamer com `verify_jwt=false` e mantêm a `RIOT_API_KEY` exclusivamente no servidor.

O carregamento é paralelo e resiliente:

- LoL + TFT disponíveis → perfil marca **Dados Riot · LoL + TFT**;
- apenas uma fonte disponível → estado **Dados Riot parciais**;
- nenhuma fonte disponível → fallback demonstrativo claramente identificado;
- timeout por consulta → 14 segundos;
- respostas atrasadas de uma busca anterior são descartadas;
- deep links antigos por `region` continuam compatíveis;
- novos links usam `server` para preservar a plataforma Riot escolhida.

O Browser E2E mocka as duas Edge Functions e valida a hidratação do perfil, sem depender da disponibilidade externa da Riot no CI.


## Regra de credencial para publicação standalone

O projeto compartilha a infraestrutura gamer do ZeroTwo, mas **compartilhar banco não significa assumir que uma Production API key registrada para outro produto pode ser reutilizada indefinidamente**.

Durante desenvolvimento, as funções gamer existentes servem como backend de protótipo. Antes do deploy público standalone do Riot Legacy:

1. revisar o status do produto no Riot Developer Portal;
2. registrar o Riot Legacy quando necessário;
3. usar a credencial aprovada para o produto/funções correspondentes;
4. manter os secrets no mesmo Supabase gamer, mas com nomes separados se houver mais de uma credencial ativa;
5. nunca mover essas credenciais para o frontend.


## Estados de consulta

A experiência pública não bloqueia o perfil enquanto a Riot responde.

Estados visuais:

- `loading` — consulta LoL/TFT em andamento;
- `live` — LoL + TFT carregados;
- `partial` — somente uma das fontes carregou;
- `demo` — fallback demonstrativo.

Erros tratados separadamente:

- Riot ID não encontrado;
- rate limit (429);
- credencial Riot server-side rejeitada/indisponível;
- timeout;
- erro genérico de upstream.

O botão **Atualizar dados** reaproveita o mesmo Riot ID/servidor atual e executa nova hidratação sem reload.


## Estado local de retenção

O Riot Legacy mantém no máximo 5 buscas recentes em `localStorage`, contendo apenas:

- Game Name;
- Tag Line;
- servidor/plataforma.

A lista é deduplicada por Riot ID + servidor, pode ser limpa pelo usuário e não é enviada para tabela própria no backend.

## Servidores

O seletor expõe os shards já aceitos pelo backend gamer: BR, NA, LAN, LAS, EUW, EUNE, KR, JP, OCE, TR, RU, PH, SG, TH, TW e VN. O frontend deriva o routing regional necessário para ACCOUNT/MATCH APIs.
