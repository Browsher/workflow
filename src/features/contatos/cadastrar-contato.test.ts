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

  it('rejeita nome vazio ou só espaços', async () => {
    const repo = new RepositorioContatosEmMemoria()

    expect(await cadastrarContato({ nome: '', email: 'ana@exemplo.com' }, repo))
      .toEqual({ ok: false, motivo: 'nome_obrigatorio' })
    expect(await cadastrarContato({ nome: '   ', email: 'ana@exemplo.com' }, repo))
      .toEqual({ ok: false, motivo: 'nome_obrigatorio' })
  })

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
})
