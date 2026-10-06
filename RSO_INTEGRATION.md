# Riot Sign On (RSO) — preparação

## Estado

O Riot Legacy já possui:

- tabela de `state` OAuth server-side com expiração;
- Edge Function `riot-legacy-rso-start`;
- geração de state aleatório e armazenamento somente do SHA-256;
- URL oficial de autorização da Riot;
- escopos `openid offline_access`;
- botão de verificação no painel público;
- perfil público impossível de publicar sem `ownership_verified_at`.

## Secrets futuros

Depois que a Riot aprovar as applications de produção e emitir o RSO client:

- `RIOT_RSO_CLIENT_ID`
- `RIOT_RSO_REDIRECT_URI`

O callback/token exchange **não deve ser inventado antes da aprovação**. A Riot fornece instruções do RSO client após Production approval.

## Próxima etapa após aprovação

1. implementar callback conforme o método de client authentication aprovado pela Riot;
2. validar/consumir o `state` de uso único;
3. trocar o authorization code por token server-side;
4. chamar `/riot/account/v1/accounts/me`;
5. comparar o PUUID retornado com o perfil que está sendo reivindicado;
6. preencher `ownership_verified_at` e `ownership_method='rso'`;
7. nunca expor refresh/access token ao perfil público;
8. habilitar `features.publicProfiles` somente após E2E desse fluxo.
