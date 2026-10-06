# Contrato do perfil — Riot Legacy

Este contrato separa a experiência visual do provedor de dados.

## Request

`POST /riot-legacy-profile`

```json
{
  "gameName": "HelioConde",
  "tagLine": "BR1",
  "routing": "americas"
}
```

Regras:
- `gameName`: 3–16 caracteres e sem `#`;
- `tagLine`: 3–5 letras/números;
- `routing`: `americas`, `europe` ou `asia`.

## Resposta atual: identidade real, estatísticas demo

```json
{
  "source": "riot",
  "verified": true,
  "dataState": "identity-only",
  "account": {
    "gameName": "HelioConde",
    "tagLine": "BR1"
  },
  "routing": "americas",
  "fetchedAt": "2026-10-06T00:00:00.000Z"
}
```

O backend resolve PUUID via ACCOUNT-V1, mas **não devolve PUUID ao navegador** nesta fase. O frontend só precisa da identidade confirmada.

Enquanto `dataState = identity-only`, campeão, maestria, timeline, League e TFT continuam demonstrativos e devem permanecer rotulados como demo.

## Erros

- `400 invalid_riot_id`
- `404 account_not_found`
- `429 rate_limited`
- `502 riot_unavailable`
- `504 riot_timeout`
- `503 backend_not_configured`
- `503 riot_key_unavailable`

## Próxima versão

O mesmo endpoint poderá evoluir para `dataState = profile-summary` e retornar um objeto derivado mínimo:

- campeão assinatura + regra;
- top campeões/maestria;
- resumo de funções/ranked;
- timeline derivada;
- TFT comps/traits/colocações.

Evitar devolver respostas brutas da Riot quando um resumo derivado for suficiente.
