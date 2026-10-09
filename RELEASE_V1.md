# Riot Legacy — encerramento técnico do MVP 1.0

**Revisão:** 09/10/2026  
**Estado:** funcionalidades principais concluídas. **Protótipo técnico publicado**, porém **distribuição pública/marketing/monetização dependem de registro e credenciais aprovadas pela Riot**. O produto não está homologado para uso público com qualquer chave temporária/compartilhada.

## Entregas de produto

- [x] Museu pessoal LoL + TFT por Riot ID e região.
- [x] Dados reais e fallback demonstrativo com estados explícitos.
- [x] Campeão assinatura, maestria, função, ranks oficiais, linha do tempo e snapshots comparativos.
- [x] Resumo TFT por Sets, composições, unidades, traits e colocações.
- [x] Cards PNG compartilháveis, histórico local, favoritos e retrospectivas.
- [x] PT-BR principal e inglês secundário, responsividade desktop/mobile e acessibilidade básica.
- [x] RSO preparado, mas **perfís públicos permanecem desligados** até verificação de propriedade autorizada.
- [x] Espaços de anúncios preparados, com anúncios **desligados** até o registro Riot e aprovação AdSense.

## Auditoria de backend e segurança

- [x] Supabase gamer `bieihhaobdztjyoweewa` verificado como `ACTIVE_HEALTHY`.
- [x] Seis funções `riot-legacy-*` verificadas `ACTIVE`: `snapshots`, `events`, `public-profile`, `lol-profile`, `tft-profile`, `rso-start`.
- [x] As tabelas `riot_legacy_snapshots`, `riot_legacy_public_profiles` e `riot_legacy_rso_states` têm RLS habilitada e não expõem `SELECT` direto a `anon` ou `authenticated`.
- [x] A chave Riot permanece server-side; não inserir credenciais no GitHub Pages.
- [x] Atualizado o service worker para cache restrito ao app shell do Riot Legacy; não armazena URLs pessoais com parâmetros de Riot ID e não elimina caches de outros projetos.
- [x] Atualizador de versões limitado à registration scope e aos caches `riot-legacy-v*`.
- [x] Testes novos para cache privado, atualização de versões, isolamento de caches e app shell offline.
- [x] Verificações estáticas incluem `sw.js`, `live-update.js` e os novos testes PWA.

## CI, publicação e QA

- [x] [QA estático após correções](https://github.com/HelioConde/riot-legacy/actions/runs/37931893048) aprovado.
- [x] [Live Update QA após correções](https://github.com/HelioConde/riot-legacy/actions/runs/37931893144) aprovado.
- [x] [E2E anterior](https://github.com/HelioConde/riot-legacy/actions/runs/37575260287) aprovado antes das correções PWA.
- [x] [Capturas anteriores](https://github.com/HelioConde/riot-legacy/actions/runs/37575305453) aprovadas antes das correções PWA.
- [x] [Browser E2E — **15 de 15 testes aprovados** após correções](https://github.com/HelioConde/riot-legacy/actions/runs/37931893214). Inclui isolamento de cache, atualização do worker e modo offline.
- [x] [GitHub Pages — publicação aprovada](https://github.com/HelioConde/riot-legacy/actions/runs/37932073667) após as mudanças funcionais.
- [x] [Capturas visuais desktop e mobile após o deploy — aprovadas](https://github.com/HelioConde/riot-legacy/actions/runs/37932129087). A automação atualiza os PNGs em `visual-snapshots/`.
- [ ] Verificar a execução do último deploy que inclui somente a documentação e as afirmações de compliance; não há mudança funcional nessa etapa.

## Gates externos para liberar usuários e anúncios

- [ ] Registrar **Riot Legacy** no Riot Developer Portal, incluindo as aplicações/jogos aplicáveis, e obter o status e credenciais permitidos para distribuição pública.
- [ ] Configurar `RIOT_LEGACY_LOL_API_KEY` e `RIOT_LEGACY_TFT_API_KEY` conforme as applications aprovadas. O fallback temporário compartilhado **não** prova conformidade de produção.
- [ ] Verificar o domínio do produto com o arquivo de verificação `riot.txt` fornecido pela Riot, quando solicitado.
- [ ] Solicitar e configurar RSO autorizado antes de liberar publicação indexável de perfis ou comprovação de propriedade.
- [ ] Testar pelo menos 3 Riot IDs adicionais (LoL sem TFT, TFT sem LoL e atividade escassa) sem coletar informações sensíveis.
- [ ] Testar dados indisponíveis/rate limits com fallback de snapshot em produção.
- [ ] Validar cards e navegação em dispositivos reais.
- [ ] Habilitar anúncios somente após gates Riot + aprovação AdSense/consentimento; nunca inventar `ca-pub`/slots.

**Atenção à distribuição:** segundo a Riot, chaves de desenvolvimento e pessoais não autorizam um produto aberto ao público, incluindo beta aberto. O uso comercial depende do registro e aprovação aplicáveis.

Fontes oficiais: [Riot Developer Portal](https://developer.riotgames.com/docs/portal) · [General Policies](https://developer.riotgames.com/policies/general) · [RSO FAQ](https://developer.riotgames.com/docs/faqs).

## Regra de manutenção

O escopo de funcionalidades novas permanece congelado. Trabalhar apenas em defeitos P0/P1, conformidade, acessibilidade, verificação Riot e evidências de validação real.

Pendências humanas/externas: [issue #1](https://github.com/HelioConde/riot-legacy/issues/1).

Site técnico: https://helioconde.github.io/riot-legacy/
