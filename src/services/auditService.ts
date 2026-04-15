/**
 * @file: auditService.ts
 * @responsibility: Query operations for audit logs
 * @exports: getAuditLogs
 * @layer: services
 */

import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  acao: string;
  usuario_id: string;
  usuario_nome: string | null;
  tabela: string | null;
  registro_id: string | null;
  detalhes: any;
  created_at: string;
}

export const getAuditLogs = async (filters?: {
  data_inicio?: string;
  data_fim?: string;
  tabela?: string;
}) => {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (filters?.data_inicio) {
    query = query.gte('created_at', filters.data_inicio);
  }
  
  if (filters?.data_fim) {
    // Add 1 day to include the entire end date
    const endDate = new Date(filters.data_fim);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('created_at', endDate.toISOString());
  }
  
  if (filters?.tabela) {
    query = query.eq('tabela', filters.tabela);
  }
  
  const { data, error } = await query;
  
  return { data, error };
};