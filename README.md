<div align="center">
  <h1>🏛️ Riot Legacy — Seu museu de partidas</h1>
  <p><strong>Explore sua trajetória em League of Legends e Teamfight Tactics como uma retrospectiva visual compartilhável.</strong></p>
  <p><img alt="Status" src="https://img.shields.io/badge/status-MVP%20t%C3%A9cnico-64748b"> <img alt="Riot" src="https://img.shields.io/badge/Riot-API%20via%20backend-334155"></p>
  <p><a href="RELEASE_V1.md"><strong>Relatório do MVP</strong></a> · <a href="RIOT_POLICY_COMPLIANCE.md"><strong>Políticas Riot</strong></a> · <a href="FULLSTACK.md"><strong>Arquitetura</strong></a></p>
</div>

## O que é Riot Legacy?

Uma aplicação independente que converte o histórico recente disponível na Riot API em uma experiência pessoal: campeões mais marcantes, marcos, sessões, perfis e retrospectivas de **Teamfight Tactics**.

A ideia é fazer o jogador **reconhecer sua própria trajetória**, sem se limitar a uma planilha de partidas.

## Principais experiências

| Área | Proposta |
| --- | --- |
| **Riot ID** | Identificação por GameName e TagLine |
| **Identidade pessoal** | Campeões, funções e padrões observados |
| **Marcos e retrospectivas** | Destaques em períodos disponíveis |
| **TFT** | Leitura visual de partidas e preferências |
| **Compartilhamento** | Cards e elementos visuais |
| **Idiomas** | Português e inglês |

O sistema distingue dados reais, dados limitados e **modo demonstrativo**, quando usado. Estatísticas derivadas são aproximações da **amostra disponível**, não afirmações sobre todo o histórico do jogador.

## Estado de desenvolvimento

**MVP técnico concluído para validação**, de acordo com o relatório histórico do projeto. A liberação pública, monetização ou uso de chaves Riot para produção dependem de **políticas, aprovação e configuração aplicáveis**. A existência do frontend e dos testes não significa autorização de distribuição comercial.

> Projeto não oficial. Não represente conteúdo como serviço oferecido ou endossado pela Riot Games.

## Como executar localmente

Requer Node.js e npm:

```bash
git clone https://github.com/HelioConde/riot-legacy.git
cd riot-legacy
npm install
npm run dev
```

O script `dev` inicia um servidor estático na porta **4173**. Para verificações:

```bash
npm run check
npm run test:e2e
```

A consulta a dados reais depende de uma integração backend configurada. **A Riot API key deve permanecer no servidor**, nunca no HTML ou JavaScript publicado.

## Arquivos importantes

| Caminho | Uso |
| --- | --- |
| `index.html`, `app.js` | Interface e lógica de apresentação |
| `i18n.js`, `style.css` | Idiomas e estilos |
| `backend-config.js` | Configuração de endpoints |
| `supabase/` | Integração com serviços de backend |
| `RELEASE_V1.md` | Evidências e escopo do MVP |
| `RIOT_API.md`, `RIOT_POLICY_COMPLIANCE.md` | Integração, limitações e conformidade |

## Antes de publicar

- Respeitar o registro do produto e as condições de uso das APIs Riot.
- Revisar políticas de privacidade, retenção, consentimento e dados compartilháveis.
- Testar rate limits, disponibilidade e tratamento de erros `404` / `429`.
- Não apresentar correlação como causalidade nem inventar estatísticas não retornadas pela API.

**Documentação:** [Conformidade](RIOT_POLICY_COMPLIANCE.md) · [Integração Riot](RIOT_API.md) · [Contrato do perfil](PROFILE_CONTRACT.md) · [Histórico anterior do README](docs/README_HISTORY_2026-10-25.md)

Desenvolvido por [Hélio Conde](https://github.com/HelioConde).
