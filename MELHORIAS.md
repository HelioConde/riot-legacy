# Melhorias — Riot Legacy

Atualizado em 06/10/2026.

## P0 — protótipo visual

- [x] Definir proposta de valor: museu pessoal da conta, não tracker genérico.
- [x] Landing com entrada por Riot ID.
- [x] PT-BR principal + English.
- [x] Persistência de idioma.
- [x] Perfil demonstrativo LoL + TFT.
- [x] Campeão assinatura.
- [x] Timeline de trajetória.
- [x] Bloco de identidade LoL.
- [x] Retrospectiva visual TFT.
- [x] Card compartilhável.
- [x] URL compartilhável por query string.
- [x] Slots de anúncios reservados.
- [x] Aviso de dados demonstrativos.
- [x] Aviso de independência em relação à Riot.
- [x] Static QA e Browser E2E preparados.

## P0 — próximo

- [x] Criar repositório físico `HelioConde/riot-legacy`.
- [x] Publicar GitHub Pages — deploy oficial ativo em `https://helioconde.github.io/riot-legacy/`.
- [ ] Registrar proposta no Riot Developer Portal.
- [ ] Definir Production API key própria do produto quando elegível.
- [x] Reutilizar backend gamer ZeroTwo.gg com Riot key server-side.
- [x] Identificar `public-lol-profile` como backend inicial Riot ID → PUUID → League.
- [x] Conectar o frontend do Riot Legacy à `public-lol-profile`.
- [x] Conectar também `public-tft-profile` e substituir os blocos recentes de LoL/TFT por payload real, mantendo fallback explícito.
- [x] Garantir que a timeline ao vivo usa capítulos da amostra recente, sem misturar datas demonstrativas com o selo de dados Riot.
- [x] Tratar conta inexistente, API indisponível, timeout e dados parciais com fallback identificado.
- [x] Mensagens distintas para Riot ID inexistente, rate limit, credencial server-side indisponível e timeout.
- [x] Validar um Riot ID real de LoL — conta BR1 validada em produção, com perfil e histórico reais.
- [x] Validar um Riot ID real de TFT — conta BR1 validada em produção, com histórico real disponível.
- [x] Criar snapshot/cache — snapshot diário server-side por PUUID/servidor, RLS fechado para browser e histórico de até 36 snapshots.

## P1 — experiência

- [x] Faixa compacta de identidade real com servidor, nível e ranks LoL/TFT oficiais.
- [x] Expor no seletor todos os shards já suportados pelo backend gamer.


- [x] Determinar campeão assinatura com regra explicável — maior frequência na amostra recente; KDA médio como desempate.
- [x] Mostrar primeira/mais antiga partida disponível quando os dados permitirem — a timeline exibe a janela da amostra Riot e deixa claro que ela pode não ser a primeira partida da conta.
- [x] Linha do tempo por temporadas/anos — anos derivados de partidas reais e snapshots acumulados.
- [x] Top campeões com evolução de maestria — snapshots enriquecidos com nomes via Data Dragon e comparação por championId.
- [x] Identidade por função — função dominante e percentual derivados das partidas recentes com posição conhecida.
- [x] Marcos de ranked sem criar ranking alternativo — rank oficial atual e comparação com snapshot anterior/mês anterior.
- [x] TFT: comps mais recorrentes — arquétipos derivados dos dois traits ativos mais fortes, com fallback para núcleo de unidades.
- [x] TFT: unidades/traits assinatura — recorrência derivada de toda a amostra recente, com desempate por força/estrelas.
- [x] TFT: distribuição de colocações — barras 1º–8º e resumo Top 4/1º/8º derivados da amostra recente.
- [x] TFT: retrospectiva por set — partidas agrupadas por set com média de colocação, Top 4 e vitórias na amostra disponível.
- [x] Cards exportáveis como imagem PNG gerada localmente no navegador.
- [ ] Perfil público opcional — bloqueado até existir autenticação/prova de propriedade da conta; não publicar perfil de terceiros por simples Riot ID.
- [x] Tema visual baseado no campeão assinatura — acento visual determinístico e splash do campeão sem alterar a landing.

## P2 — retenção

- [x] Buscas recentes locais com Riot ID + servidor, deduplicação e reabertura rápida.


- [x] Comparar snapshots mensais — deltas de maestria, win rate LoL, Top 4 TFT e colocação média.
- [x] “Este mês vs mês passado” — comparação automática quando existir snapshot de mês anterior.
- [x] Wrapped mensal/anual — resumo de snapshots do mês/ano, assinaturas e melhor Top 4 registrado.
- [x] Coleção de cards compartilhados — coleção local adicionada ao baixar PNG, limitada a 12 itens.
- [x] Favoritar marcos — persistência local no navegador para momentos escolhidos pelo usuário.
- [ ] Página pública indexável somente com consentimento — perfis pesquisados agora recebem `noindex,nofollow`; opt-in indexável depende de autenticação/prova de propriedade.
- [x] Web Share + download de imagem — Web Share com fallback para clipboard e PNG local.
- [x] PWA básico — manifest completo, Service Worker e app shell offline; revisar ícones/instalação após validação de retenção.

## Monetização

- [x] Layout preparado para anúncios.
- [ ] Registrar produto e validar política de monetização Riot.
- [ ] Ativar rede apenas após aprovação/acknowledgement e IDs reais.
- [x] Validar CLS e distância dos controles — slots reservados com altura fixa/contain e E2E garantindo ausência de controles dentro do anúncio.
- [ ] Medir retenção antes de aumentar inventário.

## Regra

Não expandir para dezenas de estatísticas porque estão disponíveis na API. Cada dado precisa responder:

**“Isso ajuda o jogador a lembrar, entender ou compartilhar a própria trajetória?”**
