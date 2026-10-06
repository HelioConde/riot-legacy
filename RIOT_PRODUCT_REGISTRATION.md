# Registro e produção Riot — Riot Legacy

## Estado

O produto já funciona tecnicamente com o backend gamer compartilhado, mas **não deve ativar monetização real nem depender de uma chave de produção própria até o registro/aprovação correspondente no Riot Developer Portal**.

## Ações externas pendentes

1. Registrar o produto **Riot Legacy** no Riot Developer Portal.
2. Informar que o produto é um museu visual/histórico de League of Legends + TFT.
3. Informar a URL pública: `https://helioconde.github.io/riot-legacy/`.
4. Descrever as APIs usadas: ACCOUNT-V1, SUMMONER-V4, LEAGUE-V4, CHAMPION-MASTERY-V4, MATCH-V5 e APIs TFT.
5. Explicar que a chave Riot fica somente em Edge Functions server-side.
6. Validar as regras atuais de monetização/ads aplicáveis ao produto.
7. Quando elegível, configurar uma Production API key própria do Riot Legacy.
8. Somente após aprovação/acknowledgement, ativar a rede de anúncios.

## Regras já implementadas no código

- nenhuma Riot API key no frontend;
- fallback explícito quando a API está indisponível;
- slots de anúncios apenas reservados, sem rede ativa;
- aviso de independência da Riot;
- dados públicos usados para memória/retrospectiva, não para vantagem competitiva em tempo real.
