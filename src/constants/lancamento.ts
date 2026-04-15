/**
 * @file: lancamento.ts
 * @responsibility: Constants for lancamento forms and dropdowns
 * @exports: PROFISSIONAIS, FORMAS_PAGAMENTO, DEFAULT_REPASSE_PCT
 * @layer: constants
 */

export const PROFISSIONAIS = [
  'Dra. Ana',
  'Dra. Beatriz',
  'Dr. Carlos',
  'Dra. Diana',
  'Outro'
] as const;

export const FORMAS_PAGAMENTO = [
  'Pix',
  'Cartão Débito',
  'Cartão Crédito',
  'Dinheiro',
  'Outros'
] as const;

export const DEFAULT_REPASSE_PCT = 50.0;