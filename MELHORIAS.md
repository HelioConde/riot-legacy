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

- [ ] Criar repositório físico `HelioConde/riot-legacy`.
- [ ] Publicar GitHub Pages.
- [ ] Registrar proposta no Riot Developer Portal.
- [ ] Definir Production API key própria do produto quando elegível.
- [x] Reutilizar backend gamer ZeroTwo.gg com Riot key server-side.
- [x] Identificar `public-lol-profile` como backend inicial Riot ID → PUUID → League.
- [x] Conectar o frontend do Riot Legacy à `public-lol-profile`.
- [x] Conectar também `public-tft-profile` e substituir os blocos recentes de LoL/TFT por payload real, mantendo fallback explícito.
- [x] Garantir que a timeline ao vivo usa capítulos da amostra recente, sem misturar datas demonstrativas com o selo de dados Riot.
- [x] Tratar conta inexistente, API indisponível, timeout e dados parciais com fallback identificado.
- [x] Mensagens distintas para Riot ID inexistente, rate limit, credencial server-side indisponível e timeout.
- [ ] Validar um Riot ID real de LoL.
- [ ] Validar um Riot ID real de TFT.
- [ ] Criar snapshot/cache para não consultar toda a história a cada visita.

## P1 — experiência

- [x] Faixa compacta de identidade real com servidor, nível e ranks LoL/TFT oficiais.
- [x] Expor no seletor todos os shards já suportados pelo backend gamer.


- [x] Determinar campeão assinatura com regra explicável — maior frequência na amostra recente; KDA médio como desempate.
- [x] Mostrar primeira/mais antiga partida disponível quando os dados permitirem — a timeline exibe a janela da amostra Riot e deixa claro que ela pode não ser a primeira partida da conta.
- [ ] Linha do tempo por temporadas/anos.
- [ ] Top campeões com evolução de maestria.
- [ ] Identidade por função.
- [ ] Marcos de ranked sem criar ranking alternativo.
- [ ] TFT: comps mais recorrentes.
- [ ] TFT: unidades/traits assinatura.
- [ ] TFT: distribuição de colocações.
- [ ] TFT: retrospectiva por set.
- [x] Cards exportáveis como imagem PNG gerada localmente no navegador.
- [ ] Perfil público opcional.
- [ ] Tema visual baseado no campeão assinatura.

## P2 — retenção

- [x] Buscas recentes locais com Riot ID + servidor, deduplicação e reabertura rápida.


- [ ] Comparar snapshots mensais.
- [ ] “Este mês vs mês passado”.
- [ ] Wrapped mensal/anual.
- [ ] Coleção de cards compartilhados.
- [ ] Favoritar marcos.
- [ ] Página pública indexável somente com consentimento.
- [ ] Web Share + download de imagem.
- [ ] PWA se houver retorno recorrente suficiente.

## Monetização

- [x] Layout preparado para anúncios.
- [ ] Registrar produto e validar política de monetização Riot.
- [ ] Ativar rede apenas após aprovação/acknowledgement e IDs reais.
- [ ] Validar CLS e distância dos controles.
- [ ] Medir retenção antes de aumentar inventário.

## Regra

Não expandir para dezenas de estatísticas porque estão disponíveis na API. Cada dado precisa responder:

**“Isso ajuda o jogador a lembrar, entender ou compartilhar a própria trajetória?”**
