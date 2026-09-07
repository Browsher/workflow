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
