# workflow

## O que é

Projeto de treino do meu workflow de desenvolvimento assistido por IA.
Serve de campo de prova para o ciclo brainstorm → spec → TDD → PR.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Vitest 5 · npm

## Comandos

```bash
npm run dev         # sobe local
npm test            # vitest run
npm run typecheck   # tsc --noEmit
npm run lint
```

Para rodar um teste isolado: `npx vitest run caminho/do/arquivo.test.ts`

## Estrutura

```
src/
  app/          # rotas (App Router)
  features/     # um domínio por pasta: lógica e testes juntos
  lib/          # utilitários sem domínio
  server/       # acesso a dados, nada de UI aqui
docs/superpowers/
  specs/        # specs das features
  plans/        # planos de implementação
```

Regra de fronteira: `features/` não importa de outra `features/`. Se precisar,
o que é comum sobe para `lib/` ou `server/`.

## Como trabalhamos aqui

- Feature grande (2+ arquivos ou regra de negócio): brainstorm e spec antes
  do código, pelas skills do Superpowers.
- Feature pequena: direto, mas com teste.
- TDD: teste falhando primeiro. Sempre.
- Branch + PR. Nunca commit na main — ela é protegida.

## Preferências e regras

Leia `PREFERENCIAS.md` e `REGRAS.md` na raiz antes de trabalhar. Se algo
específico deste projeto conflitar com eles, o projeto ganha, mas avise que
houve conflito.

## Contexto de domínio

### Contatos (`src/features/contatos/`)

Cadastro com deduplicação por e-mail. `normalizarEmail` é o único lugar que
define o que é "mesmo e-mail" (hoje: trim + minúsculas). O contato guarda o
e-mail digitado e o normalizado — unicidade pelo normalizado, exibição e
envio pelo original. O armazenamento fica atrás de `RepositorioContatos`,
hoje implementado em memória.