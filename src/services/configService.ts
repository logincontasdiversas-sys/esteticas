/**
 * @file: configService.ts
 * @responsibility: Operations for global configurations
 * @exports: getConfig, updateConfig
 * @layer: services
 */

import { supabase } from "@/integrations/supabase/client";

export interface Config {
  id: string;
  repasse_pct_default: number;
  formas_pagamento: string[];
  tipos_saldo?: string[];
  threshold_alerta_trocos: number;
  updated_at: string;
  updated_by: string | null;
}

export const getConfig = async () => {
  const { data, error } = await supabase
    .from('configs')
    .select('*')
    .limit(1)
    .single();
  
  return { data, error };
};

export const updateConfig = async (
  id: string,
  updates: Partial<Omit<Config, 'id' | 'updated_at' | 'updated_by'>>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('configs')
    .update({
      ...updates,
      updated_by: user?.id,
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};