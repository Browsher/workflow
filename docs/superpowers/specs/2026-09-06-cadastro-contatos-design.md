# Cadastro de contato com deduplicação por e-mail

Data: 2026-09-06 · Branch: `feature/contatos`

## Objetivo

Cadastrar contatos (nome + e-mail) impedindo que o mesmo e-mail entre duas
vezes, tratando variações de caixa e espaços como o mesmo endereço.

Este é um treino do ciclo spec → plano → TDD. Não é produção: os dados
ficam em memória. A regra de negócio, porém, é escrita de forma que trocar
por banco depois altere apenas a camada de armazenamento.

## Fora de escopo

- UI, rota, server action ou qualquer ponto de entrada HTTP.
- Persistência real (banco, arquivo).
- Regras de normalização além de `trim` + minúsculas (aliases com `+`,
  pontos do Gmail). Elas ficam concentradas em `normalizarEmail` para
  serem adicionadas depois sem tocar no resto.
- Validação "de verdade" de e-mail. A checagem de formato é
  deliberadamente frouxa.

## Decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| Armazenamento | Em memória, atrás de interface | Treino do ciclo; trocar por banco muda só a implementação da interface |
| O que é "mesmo e-mail" | `trim` + `toLowerCase` | Caso real mais comum; regras mais agressivas entram só em `normalizarEmail` |
| Normalização | Uma função exportada, teste próprio | É o único ponto que muda se a regra evoluir |
| E-mail duplicado | Rejeita | Comportamento esperado de um formulário de cadastro |
| Forma do retorno | Resultado explícito `{ ok, ... }`, sem `throw` | Testar o caso ruim sem `try/catch`; chamador trata sem exceção |
| Campos | `nome` e `email` | Mínimo que exercita a regra |
| Entrada inválida | Valida e devolve motivo próprio no mesmo formato | Regra fica num lugar só quando entrar UI |
| E-mail guardado | Original (`email`) e normalizado (`emailNormalizado`) | Unicidade pelo normalizado; envio e exibição pelo original |

## Estrutura

```
src/features/contatos/
  normalizar-email.ts
  normalizar-email.test.ts
  cadastrar-contato.ts
  cadastrar-contato.test.ts
  repositorio.ts                  # interface + implementação em memória
  repositorio-em-memoria.test.ts
```

Segue a regra de fronteira do projeto: `features/contatos` não importa de
outra feature. Quando existir implementação com banco, ela vai para
`src/server/` e implementa a mesma interface.

## Contratos

```ts
type Contato = {
  id: string
  nome: string
  email: string            // como o usuário digitou, só com trim
  emailNormalizado: string // chave de unicidade
}

type EntradaCadastro = { nome: string; email: string }

type MotivoFalha = 'nome_obrigatorio' | 'email_invalido' | 'email_duplicado'

type ResultadoCadastro =
  | { ok: true; contato: Contato }
  | { ok: false; motivo: MotivoFalha }

interface RepositorioContatos {
  buscarPorEmailNormalizado(emailNormalizado: string): Promise<Contato | null>
  salvar(contato: Contato): Promise<void>
}

function normalizarEmail(email: string): string
function cadastrarContato(
  entrada: EntradaCadastro,
  repositorio: RepositorioContatos,
): Promise<ResultadoCadastro>
class RepositorioContatosEmMemoria implements RepositorioContatos
```

Os métodos do repositório são `async` desde já para que a implementação
com banco encaixe sem mudar assinatura.

## Unidades

### `normalizarEmail(email)`

Função pura. `trim()` seguido de `toLowerCase()`. Nada mais. É o único
lugar onde a definição de "mesmo e-mail" vive.

### `cadastrarContato(entrada, repositorio)`

Caso de uso. Não sabe onde os dados estão; depende só da interface.

1. `nome.trim()` vazio → `{ ok: false, motivo: 'nome_obrigatorio' }`.
2. `emailNormalizado = normalizarEmail(entrada.email)`.
3. Formato frouxo sobre o normalizado: exatamente um `@`, pelo menos um
   caractere antes dele, e o domínio contém um `.` com pelo menos um
   caractere de cada lado. Falhou → `{ ok: false, motivo: 'email_invalido' }`.
4. `repositorio.buscarPorEmailNormalizado(emailNormalizado)`. Achou →
   `{ ok: false, motivo: 'email_duplicado' }`.
5. Monta `Contato` com `id = crypto.randomUUID()`, `nome` com trim,
   `email` original com trim e `emailNormalizado`. Chama `salvar`.
   Devolve `{ ok: true, contato }`.

Validação vem antes de tocar o repositório: entrada inválida nunca gera
consulta.

### `RepositorioContatosEmMemoria`

`Map<string, Contato>` chaveado por `emailNormalizado`. Sem lógica além
de guardar e buscar. Serve como implementação do treino e como dublê de
teste permanente do caso de uso.

## Erros

Regra de negócio nunca lança: vira `{ ok: false, motivo }`. Falha de
infraestrutura (quando o repositório for banco e cair) sobe como exceção,
porque não é regra. Não há tratamento disso nesta rodada.

## Testes

TDD com Vitest: teste falhando primeiro, sempre.

### `normalizar-email.test.ts`
- Remove espaços nas pontas.
- Converte para minúsculas.
- E-mail já normalizado sai intacto.

### `cadastrar-contato.test.ts`
- **Cenário motivador, isolado em seu próprio teste:** cadastrar
  `Ana@X.com` e depois `ana@x.com` no mesmo repositório; o segundo devolve
  `{ ok: false, motivo: 'email_duplicado' }`.
- Caminho feliz: devolve `ok: true`, `contato.email` preserva a forma
  digitada (com trim) e `contato.emailNormalizado` está normalizado.
- Nome vazio ou só espaços → `nome_obrigatorio`.
- E-mail sem `@` → `email_invalido`.
- E-mail sem ponto no domínio → `email_invalido`.
- Entrada inválida não chama `buscarPorEmailNormalizado` nem `salvar`.
- E-mail digitado com espaços nas pontas é aceito e normalizado.

### `repositorio-em-memoria.test.ts`
- Salvar e depois buscar pelo normalizado devolve o contato.
- Buscar inexistente devolve `null`.

## Migração futura (não faz parte desta rodada)

Criar `src/server/repositorio-contatos-db.ts` implementando
`RepositorioContatos`, com `UNIQUE` em `email_normalizado`. O caso de uso
e seus testes não mudam.
