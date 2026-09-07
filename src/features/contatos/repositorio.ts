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
