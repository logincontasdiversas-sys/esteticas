/**
 * @file: Lancamento.ts
 * @responsibility: Type definitions for lancamento entity
 * @exports: Lancamento, LancamentoInput, AppRole
 * @layer: types
 */

export type AppRole = 'secretaria' | 'gestora' | 'adm';

export interface Lancamento {
  id: string;
  data: string; // ISO date
  descricao?: string;
  valor_atendimento: number;
  valor_pago: number;
  troco: number;
  profissional: string;
  forma_pagamento: string;
  repasse_pct: number;
  repasse_valor: number;
  valor_empresa: number;
  perfil_registrado?: string;
  email_registrado?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface LancamentoInput {
  data: string;
  descricao?: string;
  valor_atendimento: number;
  valor_pago: number;
  troco: number;
  profissional: string;
  forma_pagamento: string;
  repasse_pct: number; // Calculado automaticamente do profissional
}

export interface UserProfile {
  id: string;
  nome: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}