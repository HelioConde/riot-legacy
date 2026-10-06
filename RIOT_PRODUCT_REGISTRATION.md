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


## Texto pronto para submissão

### Product name

Riot Legacy

### Public website

https://helioconde.github.io/riot-legacy/

### Privacy Policy

https://helioconde.github.io/riot-legacy/privacy.html

### Terms of Service

https://helioconde.github.io/riot-legacy/terms.html

### Short description

Riot Legacy is a visual personal museum for League of Legends and Teamfight Tactics. It turns a player's Riot data into an explainable retrospective focused on identity, progression, mastery, ranked milestones, TFT sets, recurring patterns and shareable historical cards.

### Detailed description

Riot Legacy is not a competitive tracker or alternative ranking system. The product uses official Riot data to help players remember, understand and share their own trajectory across League of Legends and Teamfight Tactics.

Core flows include:
- Riot ID lookup;
- recent League/TFT profile summary;
- explainable signature champion;
- role identity;
- mastery snapshots and progression;
- official ranked milestones without custom MMR/ELO;
- TFT placement distribution, recurring traits/comps and set retrospectives;
- monthly snapshots and Wrapped summaries;
- local share-card collection and favorite milestones;
- optional public profile infrastructure that remains disabled until Riot Sign On ownership verification is available.

The product does not provide real-time game-session advice, scouting, betting, gambling, or an alternative skill rating.

### APIs / data

League of Legends:
- ACCOUNT-V1
- SUMMONER-V4
- LEAGUE-V4
- CHAMPION-MASTERY-V4
- MATCH-V5

Teamfight Tactics:
- ACCOUNT-V1
- TFT-SUMMONER-V1 where applicable
- TFT-LEAGUE-V1
- TFT-MATCH-V1

Static assets:
- Data Dragon / official Riot static assets

### Security

- Riot API key is server-side only in Supabase Edge Functions.
- The production product is prepared to use a dedicated `RIOT_LEGACY_API_KEY`.
- A shared key is not enabled by default.
- No Riot credentials are committed to GitHub or sent to the browser.

### Monetization

Planned model: free access supported by website advertising.

Advertising is currently disabled by feature flags. It will only be enabled after the Riot product is registered and the applicable product status is Approved or Acknowledged, and after ad-network approval.

No advertisements will be placed inside Riot games, loading screens or Riot Client surfaces.

### RSO / opt-in

Public/indexable profiles are not currently enabled.

Infrastructure already requires verified account ownership before a profile can become public. After Production approval and RSO access, Riot Sign On will be used to link the authenticated player to the Riot account before enabling public profile opt-in.

### Working prototype flows for review

1. Open the website.
2. Enter a Riot ID.
3. Review League/TFT retrospective.
4. Open League and TFT tabs.
5. Open Share and export a PNG card.
6. Review privacy and terms links in the footer.

Automated desktop/mobile screenshots are also versioned in `visual-snapshots/`.
