/**
 * @file: organizationService.ts
 * @responsibility: Master management of organizations (Super Admin only)
 * @exports: getOrganizations, createOrganization
 * @layer: services
 */

import { supabase } from "@/integrations/supabase/client";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

/**
 * Get all organizations (Super Admin view)
 */
export const getOrganizations = async () => {
  console.log('🔄 [organizationService] Carregando todas as organizações...');
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ [organizationService] Erro ao buscar orgs:', error);
      return { data: null, error };
    }
    
    return { data: data as Organization[], error: null };
  } catch (error) {
    console.error('❌ [organizationService] Erro crítico:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Erro desconhecido') };
  }
};

/**
 * Create a new organization
 */
export const createOrganization = async (name: string) => {
  // Simple slug generation
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  console.log('🔄 [organizationService] Criando organização:', { name, slug });
  
  try {
    const { data, error } = await supabase
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single();
    
    if (error) {
      console.error('❌ [organizationService] Erro ao criar org:', error);
      return { data: null, error };
    }
    
    console.log('✅ [organizationService] Org criada:', data);
    return { data: data as Organization, error: null };
  } catch (error) {
    console.error('❌ [organizationService] Erro crítico:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Erro desconhecido') };
  }
};
