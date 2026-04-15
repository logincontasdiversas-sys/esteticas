/**
 * @file: profissionalService.ts
 * @responsibility: CRUD operations for profissionais
 * @exports: getProfissionais, createProfissional, updateProfissional, deleteProfissional
 * @layer: services
 */

import { supabase } from "@/integrations/supabase/client";

export interface Profissional {
  id: string;
  nome: string;
  ativo: boolean;
  repasse_pct: number;
  created_at: string;
  updated_at: string;
}

export const getProfissionais = async () => {
  const { data, error } = await supabase
    .from('profissionais')
    .select('*')
    .eq('ativo', true)
    .order('nome');
  
  return { data, error };
};

export const getAllProfissionais = async () => {
  const { data, error } = await supabase
    .from('profissionais')
    .select('*')
    .order('nome');
  
  return { data, error };
};

export const createProfissional = async (nome: string, repasse_pct: number) => {
  const { data, error } = await supabase
    .from('profissionais')
    .insert([{ nome, repasse_pct }])
    .select()
    .single();
  
  return { data, error };
};

export const updateProfissional = async (id: string, nome: string, repasse_pct: number, ativo: boolean) => {
  const { data, error } = await supabase
    .from('profissionais')
    .update({ nome, repasse_pct, ativo })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

export const softDeleteProfissional = async (id: string) => {
  const { data, error } = await supabase
    .from('profissionais')
    .update({ ativo: false })
    .eq('id', id);
  
  return { data, error };
};

export const hardDeleteProfissional = async (id: string) => {
  const { data, error } = await supabase
    .from('profissionais')
    .delete()
    .eq('id', id);
  
  return { data, error };
};