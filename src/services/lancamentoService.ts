/**
 * @file: lancamentoService.ts
 * @responsibility: CRUD operations for lancamentos via Supabase
 * @exports: createLancamento, getLancamentos, updateLancamento, deleteLancamento
 * @imports: supabase, Lancamento types
 * @layer: services
 */

import { supabase } from "@/integrations/supabase/client";
import type { Lancamento, LancamentoInput } from "@/types/Lancamento";

export const createLancamento = async (input: LancamentoInput, userId: string, organizationId: string | null) => {
  if (!organizationId) throw new Error("ID da organização é obrigatório para criar lançamentos");
  // CORREÇÃO: repasse_valor = valor que fica com a ESTÉTICA (percentual configurado)
  // valor_empresa = valor que fica com o PROFISSIONAL (100% - percentual)
  const repasse_valor = (input.valor_atendimento * input.repasse_pct) / 100;
  const valor_empresa = input.valor_atendimento - repasse_valor;
  
  // Buscar dados do usuário atual
  const { data: userData } = await supabase.auth.getUser();
  const { data: profileData } = await supabase
    .from('profiles')
    .select('nome')
    .eq('id', userId)
    .single();
  
  const { data, error } = await supabase
    .from('lancamentos')
    .insert({
      ...input,
      repasse_valor,
      valor_empresa,
      perfil_registrado: profileData?.nome || 'Usuário',
      email_registrado: userData?.user?.email || '',
      user_id: userId,
      organization_id: organizationId
    })
    .select()
    .single();
  
  return { data, error };
};

export const getLancamentos = async (organizationId: string | null, filters?: {
  profissional?: string;
  forma_pagamento?: string;
  data_inicio?: string;
  data_fim?: string;
}) => {
  if (!organizationId) return { data: [], error: null };
  
  let query = supabase
    .from('lancamentos')
    .select('*')
    .eq('organization_id', organizationId)
    .order('data', { ascending: false });
  
  if (filters?.profissional) {
    query = query.eq('profissional', filters.profissional);
  }
  if (filters?.forma_pagamento) {
    query = query.eq('forma_pagamento', filters.forma_pagamento);
  }
  if (filters?.data_inicio) {
    query = query.gte('data', filters.data_inicio);
  }
  if (filters?.data_fim) {
    query = query.lte('data', filters.data_fim);
  }
  
  const { data, error } = await query;
  
  return { data, error };
};

export const updateLancamento = async (id: string, input: Partial<LancamentoInput>) => {
  console.log('🔄 [LANCAMENTO SERVICE] Atualizando lançamento:', { id, input });
  
  const updateData: any = { ...input };
  
  // Se está atualizando o profissional, precisamos buscar o repasse_pct do novo profissional
  if (input.profissional) {
    console.log('🔄 [LANCAMENTO SERVICE] Atualizando profissional, buscando repasse_pct...');
    
    // Buscar o repasse_pct do novo profissional
    const { data: profData, error: profError } = await supabase
      .from('profissionais')
      .select('repasse_pct')
      .eq('nome', input.profissional)
      .single();
    
    console.log('🔍 [LANCAMENTO SERVICE] Busca do profissional:', { 
      nome: input.profissional, 
      profData, 
      profError 
    });
    
    if (profData && !profError) {
      updateData.repasse_pct = profData.repasse_pct;
      console.log('✅ [LANCAMENTO SERVICE] Repasse_pct encontrado:', profData.repasse_pct);
    } else {
      console.warn('⚠️ [LANCAMENTO SERVICE] Profissional não encontrado, mantendo repasse_pct atual');
      
      // Listar profissionais disponíveis para debug
      const { data: allProfs } = await supabase
        .from('profissionais')
        .select('nome, repasse_pct')
        .eq('ativo', true);
      
      console.log('📋 [LANCAMENTO SERVICE] Profissionais disponíveis:', allProfs);
      console.log('🔍 [LANCAMENTO SERVICE] Profissional buscado:', input.profissional);
      
      // Se o profissional não existe, não atualizar o campo profissional
      // mas manter os outros campos
      delete updateData.profissional;
      console.log('⚠️ [LANCAMENTO SERVICE] Removendo campo profissional da atualização - profissional não existe');
    }
  }
  
  // Recalcular repasse_valor se necessário
  if (input.valor_atendimento !== undefined && input.repasse_pct !== undefined) {
    // CORREÇÃO: repasse_valor = valor que fica com a ESTÉTICA (percentual configurado)
    // valor_empresa = valor que fica com o PROFISSIONAL (100% - percentual)
    updateData.repasse_valor = (input.valor_atendimento * input.repasse_pct) / 100;
    updateData.valor_empresa = input.valor_atendimento - updateData.repasse_valor;
  } else if (input.profissional && updateData.repasse_pct) {
    // Se mudou o profissional, recalcular com o valor_atendimento atual
    const { data: lancamentoAtual } = await supabase
      .from('lancamentos')
      .select('valor_atendimento')
      .eq('id', id)
      .single();
    
    if (lancamentoAtual) {
      // CORREÇÃO: repasse_valor = valor que fica com a ESTÉTICA (percentual configurado)
      // valor_empresa = valor que fica com o PROFISSIONAL (100% - percentual)
      updateData.repasse_valor = (lancamentoAtual.valor_atendimento * updateData.repasse_pct) / 100;
      updateData.valor_empresa = lancamentoAtual.valor_atendimento - updateData.repasse_valor;
      console.log('✅ [LANCAMENTO SERVICE] Repasse recalculado:', { 
        valor_atendimento: lancamentoAtual.valor_atendimento,
        repasse_pct: updateData.repasse_pct,
        repasse_valor: updateData.repasse_valor,
        valor_empresa: updateData.valor_empresa
      });
    }
  }
  
  console.log('🔄 [LANCAMENTO SERVICE] Dados finais para atualização:', updateData);
  
  const { data, error } = await supabase
    .from('lancamentos')
    .update(updateData)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('❌ [LANCAMENTO SERVICE] Erro ao atualizar:', error);
  } else {
    console.log('✅ [LANCAMENTO SERVICE] Lançamento atualizado com sucesso:', data);
  }
  
  return { data: data?.[0] || null, error };
};

export const deleteLancamento = async (id: string) => {
  const { error } = await supabase
    .from('lancamentos')
    .delete()
    .eq('id', id);
  
  return { error };
};

// Atualizar perfil_registrado em todos os lançamentos de um usuário
export const updateUserProfileInLancamentos = async (userId: string, newName: string) => {
  console.log('🔄 Atualizando perfil_registrado nos lançamentos:', { userId, newName });
  
  const { data, error } = await supabase
    .from('lancamentos')
    .update({ perfil_registrado: newName })
    .eq('user_id', userId)
    .select('id, perfil_registrado');
  
  if (error) {
    console.error('❌ Erro ao atualizar perfil nos lançamentos:', error);
    return { data: null, error };
  }
  
  console.log('✅ Perfil atualizado em', data?.length || 0, 'lançamentos');
  return { data, error: null };
};