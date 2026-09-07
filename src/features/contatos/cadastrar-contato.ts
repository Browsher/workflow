import { normalizarEmail } from './normalizar-email'
import type { Contato, RepositorioContatos } from './repositorio'

export type EntradaCadastro = { nome: string; email: string }

export type MotivoFalha = 'nome_obrigatorio' | 'email_invalido' | 'email_duplicado'

export type ResultadoCadastro =
  | { ok: true; contato: Contato }
  | { ok: false; motivo: MotivoFalha }

function temFormatoDeEmail(email: string): boolean {
  const partes = email.split('@')
  if (partes.length !== 2) return false
  const [local, dominio] = partes
  if (local.length === 0) return false
  const pedacos = dominio.split('.')
  return pedacos.length >= 2 && pedacos.every((p) => p.length > 0)
}

export async function cadastrarContato(
  entrada: EntradaCadastro,
  repositorio: RepositorioContatos,
): Promise<ResultadoCadastro> {
  const nome = entrada.nome.trim()
  if (nome === '') return { ok: false, motivo: 'nome_obrigatorio' }

  const emailNormalizado = normalizarEmail(entrada.email)
  if (!temFormatoDeEmail(emailNormalizado)) return { ok: false, motivo: 'email_invalido' }

  const existente = await repositorio.buscarPorEmailNormalizado(emailNormalizado)
  if (existente) return { ok: false, motivo: 'email_duplicado' }

  const contato: Contato = {
    id: crypto.randomUUID(),
    nome,
    email: entrada.email.trim(),
    emailNormalizado,
  }
  await repositorio.salvar(contato)
  return { ok: true, contato }
}
