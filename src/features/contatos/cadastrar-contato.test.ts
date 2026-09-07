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
