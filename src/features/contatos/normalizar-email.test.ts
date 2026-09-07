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
