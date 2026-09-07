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
