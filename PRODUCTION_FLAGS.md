# Produção — variáveis e flags do Riot Legacy

## Edge Functions

### Chave Riot

As funções dedicadas usam esta ordem:

1. `RIOT_LEGACY_LOL_API_KEY` / `RIOT_LEGACY_TFT_API_KEY`
2. fallback temporário: `RIOT_API_KEY`

Quando a chave de produção própria do Riot Legacy for aprovada, basta cadastrar `RIOT_LEGACY_LOL_API_KEY` / `RIOT_LEGACY_TFT_API_KEY` no projeto Supabase. Nenhuma alteração de frontend é necessária.

## Feature flags do frontend

Em `backend-config.js`:

- `publicProfiles: false`
- `ads: false`
- `retentionTelemetry: true`

Não alterar as duas primeiras para `true` antes dos pré-requisitos abaixo.

## Perfil público

Pré-requisitos para `publicProfiles=true`:

- autenticação Supabase configurada;
- prova de propriedade da conta Riot via fluxo aprovado (RSO);
- `ownership_verified_at` preenchido somente no servidor;
- fluxo de revogação validado;
- revisão de robots/canonical.

O banco já impede `is_public=true` sem `ownership_verified_at`.

## Ads

Pré-requisitos para `ads=true`:

- produto/política Riot validados;
- AdSense aprovado;
- `ads-config.js` com `enabled: true`;
- `clientId` real;
- IDs dos slots;
- teste de CLS após ativação.
