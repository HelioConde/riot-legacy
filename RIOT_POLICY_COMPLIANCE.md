# Riot Policy Compliance — Riot Legacy

Revisado em 06/10/2026 contra as políticas públicas atuais da Riot Developer Platform.

Referências oficiais:

- https://developer.riotgames.com/policies/general
- https://developer.riotgames.com/docs/lol
- https://developer.riotgames.com/docs/portal

## Registro

- Todo produto que serve jogadores deve ser registrado no Developer Portal.
- Novos recursos e mudanças relevantes devem permanecer alinhados ao produto registrado.
- O Riot Legacy possui protótipo público funcional e documentação pronta para submissão.
- **Pendente externo:** enviar/atualizar a proposta no Developer Portal.

## Monetização

A Riot permite monetização quando:

- o produto está registrado;
- o status é **Approved** ou **Acknowledged**;
- existe uma camada gratuita, que pode incluir publicidade;
- não há apostas/gambling;
- conteúdo pago, se existir, é transformativo;
- monetização não compromete integridade competitiva.

### Estado do Riot Legacy

- gratuito: sim;
- gambling: não;
- ranking alternativo/MMR próprio: não;
- anúncios dentro de propriedades Riot/in-game/client: não;
- anúncios no site: preparados, porém desligados;
- conteúdo: retrospectiva/visualização transformativa da trajetória do jogador;
- ativação de ads: bloqueada por feature flag até aprovação.

## Chave de produção

A política oficial determina **um produto por Production API key**.

Por isso:

- `riot-legacy-lol-profile` e `riot-legacy-tft-profile` usam `RIOT_LEGACY_LOL_API_KEY` / `RIOT_LEGACY_TFT_API_KEY`;
- enquanto as chaves próprias ainda não existem, os backends usam `RIOT_API_KEY` como fallback temporário;
- assim que `RIOT_LEGACY_LOL_API_KEY` e `RIOT_LEGACY_TFT_API_KEY` forem configuradas, elas têm prioridade automática;
- o fallback compartilhado deve ser removido quando as applications próprias forem aprovadas.

## Segurança

- chave Riot somente server-side;
- HTTPS via Supabase Edge Functions;
- nenhuma chave Riot no GitHub Pages;
- snapshots server-side;
- histórico público exige prova de propriedade;
- telemetria não guarda Riot ID ou PUUID.

## Gate para ativação de anúncios

Antes de mudar `features.ads` ou `RIOT_LEGACY_ADS.enabled` para `true`:

1. produto registrado;
2. status Approved ou Acknowledged;
3. chave própria configurada;
4. AdSense aprovado;
5. IDs reais de slots configurados;
6. validar CLS em produção;
7. manter camada gratuita;
8. medir D1/D7 antes de aumentar inventário.
