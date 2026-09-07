# Cadastro de Contatos com Dedup por E-mail — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Função `cadastrarContato` que valida nome/e-mail, normaliza o e-mail e rejeita duplicados via um repositório trocável, com implementação em memória.

**Architecture:** Três unidades em `src/features/contatos/`: `normalizarEmail` (função pura, único lugar que define "mesmo e-mail"), `RepositorioContatos` (interface) com `RepositorioContatosEmMemoria` (Map chaveado por e-mail normalizado), e `cadastrarContato` (caso de uso que recebe o repositório por parâmetro e devolve resultado explícito `{ ok, ... }`, nunca lança). Sem UI, rota ou banco nesta rodada.

**Tech Stack:** Next.js 16 (App Router) · TypeScript · Vitest 5 (jsdom, `globals: true`) · npm (o lockfile é `package-lock.json`; use `npx vitest run <arquivo>` para rodar um teste isolado).

**Spec:** `docs/superpowers/specs/2026-09-06-cadastro-contatos-design.md`

## Global Constraints

- Tudo vive em `src/features/contatos/`. Não importar de outra `features/`. Nada em `src/lib/` (é para código sem domínio).
- TDD: teste falhando primeiro, sempre. Rodar e ver falhar antes de implementar.
- Sem dependências novas. Sem Zod, sem lib de e-mail.
- Regra de negócio nunca usa `throw`; sempre devolve `{ ok: false, motivo }`.
- Normalização é só `trim()` + `toLowerCase()`, e só dentro de `normalizarEmail`.
- Validação de formato deliberadamente frouxa: um `@`, algo antes, domínio com `.` e algo de cada lado. Sem regex elaborado.
- Contato guarda `email` (digitado, com trim) e `emailNormalizado` (chave de unicidade).
- Métodos do repositório são `async`.
- Commits pequenos, em português, prefixo `feat:`/`test:`, na branch `feature/contatos`. Nunca na `main`.
- Arquivos TypeScript sem ponto e vírgula, aspas simples, seguindo `src/lib/soma.ts`.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/features/contatos/normalizar-email.ts` | `normalizarEmail(email): string` |
| `src/features/contatos/normalizar-email.test.ts` | testes da normalização |
| `src/features/contatos/repositorio.ts` | tipo `Contato`, interface `RepositorioContatos`, classe `RepositorioContatosEmMemoria` |
| `src/features/contatos/repositorio-em-memoria.test.ts` | testes da implementação em memória |
| `src/features/contatos/cadastrar-contato.ts` | tipos `EntradaCadastro`, `MotivoFalha`, `ResultadoCadastro`; função `cadastrarContato` |
| `src/features/contatos/cadastrar-contato.test.ts` | testes do caso de uso, incluindo o cenário motivador |

---

### Task 1: `normalizarEmail`

**Files:**
- Create: `src/features/contatos/normalizar-email.ts`
- Test: `src/features/contatos/normalizar-email.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `export function normalizarEmail(email: string): string` — usada pela Task 3.

- [ ] **Step 1: Escrever os testes falhando**

```ts
// src/features/contatos/normalizar-email.test.ts
import { describe, it, expect } from 'vitest'
import { normalizarEmail } from './normalizar-email'

describe('normalizarEmail', () => {
  it('remove espaços nas pontas', () => {
    expect(normalizarEmail('  ana@exemplo.com  ')).toBe('ana@exemplo.com')
  })

  it('converte para minúsculas', () => {
    expect(normalizarEmail('Ana@Exemplo.COM')).toBe('ana@exemplo.com')
  })

  it('mantém intacto um e-mail já normalizado', () => {
    expect(normalizarEmail('ana@exemplo.com')).toBe('ana@exemplo.com')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/contatos/normalizar-email.test.ts`
Expected: FAIL — `Failed to resolve import "./normalizar-email"` (arquivo não existe).

- [ ] **Step 3: Implementação mínima**

```ts
// src/features/contatos/normalizar-email.ts
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/features/contatos/normalizar-email.test.ts`
Expected: PASS, 3 testes.

- [ ] **Step 5: Commit**

```bash
git add src/features/contatos/normalizar-email.ts src/features/contatos/normalizar-email.test.ts
git commit -m "feat(contatos): normalizarEmail com trim e minúsculas"
```

---

### Task 2: Tipo `Contato`, interface e repositório em memória

**Files:**
- Create: `src/features/contatos/repositorio.ts`
- Test: `src/features/contatos/repositorio-em-memoria.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces (usados pela Task 3):

```ts
export type Contato = { id: string; nome: string; email: string; emailNormalizado: string }
export interface RepositorioContatos {
  buscarPorEmailNormalizado(emailNormalizado: string): Promise<Contato | null>
  salvar(contato: Contato): Promise<void>
}
export class RepositorioContatosEmMemoria implements RepositorioContatos
```

- [ ] **Step 1: Escrever os testes falhando**

```ts
// src/features/contatos/repositorio-em-memoria.test.ts
import { describe, it, expect } from 'vitest'
import { RepositorioContatosEmMemoria, type Contato } from './repositorio'

const ana: Contato = {
  id: '1',
  nome: 'Ana',
  email: 'Ana@Exemplo.com',
  emailNormalizado: 'ana@exemplo.com',
}

describe('RepositorioContatosEmMemoria', () => {
  it('devolve o contato salvo ao buscar pelo e-mail normalizado', async () => {
    const repo = new RepositorioContatosEmMemoria()
    await repo.salvar(ana)
    expect(await repo.buscarPorEmailNormalizado('ana@exemplo.com')).toEqual(ana)
  })

  it('devolve null quando o e-mail não existe', async () => {
    const repo = new RepositorioContatosEmMemoria()
    expect(await repo.buscarPorEmailNormalizado('ninguem@exemplo.com')).toBeNull()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/contatos/repositorio-em-memoria.test.ts`
Expected: FAIL — `Failed to resolve import "./repositorio"`.

- [ ] **Step 3: Implementação mínima**

```ts
// src/features/contatos/repositorio.ts
export type Contato = {
  id: string
  nome: string
  email: string
  emailNormalizado: string
}

export interface RepositorioContatos {
  buscarPorEmailNormalizado(emailNormalizado: string): Promise<Contato | null>
  salvar(contato: Contato): Promise<void>
}

export class RepositorioContatosEmMemoria implements RepositorioContatos {
  private readonly contatos = new Map<string, Contato>()

  async buscarPorEmailNormalizado(emailNormalizado: string): Promise<Contato | null> {
    return this.contatos.get(emailNormalizado) ?? null
  }

  async salvar(contato: Contato): Promise<void> {
    this.contatos.set(contato.emailNormalizado, contato)
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/features/contatos/repositorio-em-memoria.test.ts`
Expected: PASS, 2 testes.

- [ ] **Step 5: Commit**

```bash
git add src/features/contatos/repositorio.ts src/features/contatos/repositorio-em-memoria.test.ts
git commit -m "feat(contatos): interface RepositorioContatos e implementação em memória"
```

---

### Task 3: `cadastrarContato`

**Files:**
- Create: `src/features/contatos/cadastrar-contato.ts`
- Test: `src/features/contatos/cadastrar-contato.test.ts`

**Interfaces:**
- Consumes: `normalizarEmail` (Task 1); `Contato`, `RepositorioContatos`, `RepositorioContatosEmMemoria` (Task 2).
- Produces:

```ts
export type EntradaCadastro = { nome: string; email: string }
export type MotivoFalha = 'nome_obrigatorio' | 'email_invalido' | 'email_duplicado'
export type ResultadoCadastro =
  | { ok: true; contato: Contato }
  | { ok: false; motivo: MotivoFalha }
export function cadastrarContato(
  entrada: EntradaCadastro,
  repositorio: RepositorioContatos,
): Promise<ResultadoCadastro>
```

Os testes entram um de cada vez. Cada par "teste → implementação" abaixo é um ciclo vermelho/verde.

- [ ] **Step 1: Cenário motivador — teste falhando**

Este teste fica sozinho, no topo do arquivo, porque é o motivo da feature existir.

```ts
// src/features/contatos/cadastrar-contato.test.ts
import { describe, it, expect, vi } from 'vitest'
import { cadastrarContato } from './cadastrar-contato'
import { RepositorioContatosEmMemoria, type RepositorioContatos } from './repositorio'

describe('cadastrarContato — cenário motivador', () => {
  it('rejeita ana@x.com como duplicado depois de cadastrar Ana@X.com', async () => {
    const repo = new RepositorioContatosEmMemoria()

    const primeiro = await cadastrarContato({ nome: 'Ana', email: 'Ana@X.com' }, repo)
    const segundo = await cadastrarContato({ nome: 'Ana', email: 'ana@x.com' }, repo)

    expect(primeiro.ok).toBe(true)
    expect(segundo).toEqual({ ok: false, motivo: 'email_duplicado' })
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/contatos/cadastrar-contato.test.ts`
Expected: FAIL — `Failed to resolve import "./cadastrar-contato"`.

- [ ] **Step 3: Implementação mínima para o cenário motivador**

Só normalização + consulta + salvar. Validação entra nos passos seguintes.

```ts
// src/features/contatos/cadastrar-contato.ts
import { normalizarEmail } from './normalizar-email'
import type { Contato, RepositorioContatos } from './repositorio'

export type EntradaCadastro = { nome: string; email: string }

export type MotivoFalha = 'nome_obrigatorio' | 'email_invalido' | 'email_duplicado'

export type ResultadoCadastro =
  | { ok: true; contato: Contato }
  | { ok: false; motivo: MotivoFalha }

export async function cadastrarContato(
  entrada: EntradaCadastro,
  repositorio: RepositorioContatos,
): Promise<ResultadoCadastro> {
  const emailNormalizado = normalizarEmail(entrada.email)

  const existente = await repositorio.buscarPorEmailNormalizado(emailNormalizado)
  if (existente) return { ok: false, motivo: 'email_duplicado' }

  const contato: Contato = {
    id: crypto.randomUUID(),
    nome: entrada.nome.trim(),
    email: entrada.email.trim(),
    emailNormalizado,
  }
  await repositorio.salvar(contato)
  return { ok: true, contato }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/features/contatos/cadastrar-contato.test.ts`
Expected: PASS, 1 teste.

- [ ] **Step 5: Commit**

```bash
git add src/features/contatos/cadastrar-contato.ts src/features/contatos/cadastrar-contato.test.ts
git commit -m "feat(contatos): cadastrarContato rejeita e-mail duplicado por forma normalizada"
```

- [ ] **Step 6: Caminho feliz — teste**

Acrescentar ao final do arquivo de teste um segundo `describe`:

```ts
describe('cadastrarContato', () => {
  it('cadastra guardando o e-mail digitado e o normalizado', async () => {
    const repo = new RepositorioContatosEmMemoria()

    const resultado = await cadastrarContato({ nome: ' Ana ', email: ' Ana@Exemplo.com ' }, repo)

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.contato.nome).toBe('Ana')
    expect(resultado.contato.email).toBe('Ana@Exemplo.com')
    expect(resultado.contato.emailNormalizado).toBe('ana@exemplo.com')
    expect(resultado.contato.id).toEqual(expect.any(String))
    expect(await repo.buscarPorEmailNormalizado('ana@exemplo.com')).toEqual(resultado.contato)
  })
})
```

- [ ] **Step 7: Rodar**

Run: `npx vitest run src/features/contatos/cadastrar-contato.test.ts`
Expected: PASS, 2 testes. Este passa já com a implementação do Step 3 (o `trim` já está lá). Se falhar, a implementação do Step 3 está divergente da spec; corrigir antes de seguir.

- [ ] **Step 8: Nome obrigatório — teste falhando**

Dentro do segundo `describe`:

```ts
  it('rejeita nome vazio ou só espaços', async () => {
    const repo = new RepositorioContatosEmMemoria()

    expect(await cadastrarContato({ nome: '', email: 'ana@exemplo.com' }, repo))
      .toEqual({ ok: false, motivo: 'nome_obrigatorio' })
    expect(await cadastrarContato({ nome: '   ', email: 'ana@exemplo.com' }, repo))
      .toEqual({ ok: false, motivo: 'nome_obrigatorio' })
  })
```

- [ ] **Step 9: Rodar e ver falhar**

Run: `npx vitest run src/features/contatos/cadastrar-contato.test.ts`
Expected: FAIL — recebeu `{ ok: true, ... }` no primeiro `expect`.

- [ ] **Step 10: Implementar validação de nome**

No início de `cadastrarContato`, antes de `normalizarEmail`:

```ts
  const nome = entrada.nome.trim()
  if (nome === '') return { ok: false, motivo: 'nome_obrigatorio' }
```

E usar `nome` (já com trim) na montagem do `Contato` no lugar de `entrada.nome.trim()`.

- [ ] **Step 11: Rodar e ver passar**

Run: `npx vitest run src/features/contatos/cadastrar-contato.test.ts`
Expected: PASS, 3 testes.

- [ ] **Step 12: Commit**

```bash
git add src/features/contatos/cadastrar-contato.ts src/features/contatos/cadastrar-contato.test.ts
git commit -m "feat(contatos): cadastrarContato exige nome"
```

- [ ] **Step 13: E-mail inválido — testes falhando**

Dentro do segundo `describe`:

```ts
  it('rejeita e-mail sem @', async () => {
    const repo = new RepositorioContatosEmMemoria()
    expect(await cadastrarContato({ nome: 'Ana', email: 'ana.exemplo.com' }, repo))
      .toEqual({ ok: false, motivo: 'email_invalido' })
  })

  it('rejeita e-mail sem ponto no domínio', async () => {
    const repo = new RepositorioContatosEmMemoria()
    expect(await cadastrarContato({ nome: 'Ana', email: 'ana@exemplo' }, repo))
      .toEqual({ ok: false, motivo: 'email_invalido' })
  })

  it('rejeita e-mail sem nada antes do @', async () => {
    const repo = new RepositorioContatosEmMemoria()
    expect(await cadastrarContato({ nome: 'Ana', email: '@exemplo.com' }, repo))
      .toEqual({ ok: false, motivo: 'email_invalido' })
  })
```

- [ ] **Step 14: Rodar e ver falhar**

Run: `npx vitest run src/features/contatos/cadastrar-contato.test.ts`
Expected: FAIL nos 3 novos testes — recebeu `{ ok: true, ... }`.

- [ ] **Step 15: Implementar validação frouxa de formato**

Adicionar em `cadastrar-contato.ts` uma função interna (não exportada), abaixo dos tipos:

```ts
function temFormatoDeEmail(email: string): boolean {
  const partes = email.split('@')
  if (partes.length !== 2) return false
  const [local, dominio] = partes
  if (local.length === 0) return false
  const pedacos = dominio.split('.')
  return pedacos.length >= 2 && pedacos.every((p) => p.length > 0)
}
```

E em `cadastrarContato`, logo após calcular `emailNormalizado` e antes de consultar o repositório:

```ts
  if (!temFormatoDeEmail(emailNormalizado)) return { ok: false, motivo: 'email_invalido' }
```

- [ ] **Step 16: Rodar e ver passar**

Run: `npx vitest run src/features/contatos/cadastrar-contato.test.ts`
Expected: PASS, 6 testes.

- [ ] **Step 17: Commit**

```bash
git add src/features/contatos/cadastrar-contato.ts src/features/contatos/cadastrar-contato.test.ts
git commit -m "feat(contatos): cadastrarContato valida formato frouxo de e-mail"
```

- [ ] **Step 18: Entrada inválida não toca o repositório — teste**

Dentro do segundo `describe`. Usa um repositório falso com `vi.fn()` para observar chamadas:

```ts
  it('não consulta nem salva no repositório quando a entrada é inválida', async () => {
    const repo: RepositorioContatos = {
      buscarPorEmailNormalizado: vi.fn(async () => null),
      salvar: vi.fn(async () => {}),
    }

    await cadastrarContato({ nome: '', email: 'ana@exemplo.com' }, repo)
    await cadastrarContato({ nome: 'Ana', email: 'sem-arroba' }, repo)

    expect(repo.buscarPorEmailNormalizado).not.toHaveBeenCalled()
    expect(repo.salvar).not.toHaveBeenCalled()
  })
```

- [ ] **Step 19: Rodar**

Run: `npx vitest run src/features/contatos/cadastrar-contato.test.ts`
Expected: PASS, 7 testes. A ordem validação → consulta já está garantida pelos passos anteriores; este teste fixa isso como contrato. Se falhar, a validação está depois da consulta; mover para antes.

- [ ] **Step 20: Suíte completa, typecheck e lint**

```bash
npx vitest run
npm run typecheck
npm run lint
```

Expected: todos os testes passam (3 + 2 + 7 novos mais o `soma.test.ts` existente), `tsc` sem erros, `eslint` sem erros.

- [ ] **Step 21: Commit final**

```bash
git add src/features/contatos/cadastrar-contato.test.ts
git commit -m "test(contatos): entrada inválida não toca o repositório"
```

---

### Task 4: Abrir o PR

**Files:** nenhum arquivo novo.

- [ ] **Step 1: Push da branch**

```bash
git push -u origin feature/contatos
```

- [ ] **Step 2: Criar o PR para `main`**

Título: `feat: cadastro de contato com dedup por e-mail`

Corpo:

```markdown
## O que faz

Adiciona `cadastrarContato` em `src/features/contatos/`: valida nome e e-mail (formato frouxo), normaliza o e-mail (trim + minúsculas) e rejeita duplicados via `RepositorioContatos`, com implementação em memória.

Sem UI, rota ou banco nesta rodada. Spec em `docs/superpowers/specs/2026-09-06-cadastro-contatos-design.md`.

## Como testar

    npx vitest run

O teste `rejeita ana@x.com como duplicado depois de cadastrar Ana@X.com` é o cenário que motivou a feature.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01EdE8Hs8yqD63XzX9dmgpEf
```

Comando: `gh pr create --base main --title "<título acima>" --body-file <arquivo com o corpo acima>`

Expected: URL do PR impressa. CI (`.github/workflows/ci.yml`) roda os testes.
