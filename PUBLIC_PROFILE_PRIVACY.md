# Perfil público e consentimento

## Decisão de segurança

O Riot Legacy **não publica nem indexa automaticamente perfis pesquisados**.

Hoje, ao abrir um Riot ID, o frontend altera a política para:

`noindex,nofollow`

A landing continua indexável.

## Por que o perfil público ainda não foi ativado

Um Riot ID é público e pode ser digitado por qualquer pessoa. Portanto, um simples botão no navegador não prova que quem está publicando é o dono da conta.

Para liberar um perfil público indexável com consentimento real, implementar antes:

1. autenticação do usuário;
2. vínculo/verificação de propriedade do Riot ID;
3. registro server-side do consentimento;
4. opção de revogar publicação;
5. slug público independente do Riot ID bruto;
6. auditoria de robots/canonical;
7. exclusão do índice quando o consentimento for revogado.

## Estado atual

- URL compartilhável por query string: disponível;
- perfil pesquisado: não indexável;
- card PNG/Web Share: disponível;
- perfil indexável: bloqueado até autenticação + prova de propriedade.
