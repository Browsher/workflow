# {NOME DO PROJETO}

## O que é

{Uma frase. O que o produto faz e para quem.}

## Stack

Next.js (App Router) · TypeScript · Vitest · Playwright · pnpm

## Comandos

```bash
pnpm dev            # sobe local
pnpm test           # unidade + integração
pnpm test:watch     # durante o TDD
pnpm test:e2e       # Playwright
pnpm typecheck      # tsc --noEmit
pnpm lint
```

## Estrutura

```
src/
  app/          # rotas (App Router)
  features/     # um domínio por pasta: componentes, lógica e testes juntos
  lib/          # utilitários sem domínio
  server/       # acesso a dados, nada de UI aqui
```

Regra de fronteira: `features/` não importa de outra `features/`. Se precisar,
o que é comum sobe para `lib/` ou `server/`.

## Como trabalhamos aqui

- Feature grande (2+ arquivos ou regra de negócio) → `/spec` antes de codar.
- Feature pequena → direto, mas com teste.
- TDD: teste falhando primeiro. Sempre.
- Branch + PR. Nunca commit na main.

## Preferências e regras

Meus gostos e regras estão no workflow central. Se algo aqui conflitar com
elas, o projeto ganha — mas me avise que houve conflito.

## Contexto de domínio

{Regras de negócio que não dá para adivinhar lendo o código. Vá preenchendo.}