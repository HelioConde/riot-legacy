# Retenção — Riot Legacy

## O que já é medido

A telemetria do Riot Legacy é enviada pela Edge Function `riot-legacy-events` para `client_event_logs` com `area = 'riot-legacy'`.

Eventos permitidos:

- `app_open`
- `profile_lookup`
- `profile_loaded`
- `profile_partial`
- `profile_fallback`
- `snapshot_loaded`
- `tab_open`
- `share`
- `download_card`
- `favorite_milestone`
- `install_prompt_available`
- `pwa_installed`

## Privacidade

Não enviar:

- Riot ID;
- PUUID;
- token;
- payload Riot bruto;
- email;
- nome do usuário.

O navegador gera um identificador aleatório local. A Edge Function recebe esse valor e guarda somente **SHA-256** em `context.visitorHash`. O valor original não é persistido no banco.

## Views

### `riot_legacy_retention_daily`

Mede diariamente:

- visitantes únicos anônimos;
- sessões;
- buscas;
- perfis carregados;
- compartilhamentos;
- cards baixados;
- favoritos;
- instalações PWA.

### `riot_legacy_retention_cohorts`

Agrupa visitantes pela primeira data observada e calcula:

- tamanho da coorte;
- retorno D1;
- retorno D7.

## Decisão de anúncios

Não aumentar inventário apenas porque há espaço visual. Antes, observar:

1. volume de visitantes recorrentes;
2. D1/D7;
3. taxa busca → perfil carregado;
4. compartilhamento/download;
5. instalação PWA;
6. impacto de CLS depois que anúncios reais forem ativados.

A rede de anúncios permanece desligada por feature flag até aprovação Riot e configuração explícita.
