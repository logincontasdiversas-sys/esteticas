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
  owner_name?: string;
  owner_email?: string;
}

/**
 * Get all organizations (Super Admin view)
 */
export const getOrganizations = async () => {
  console.log('🔄 [organizationService] Carregando todas as organizações com detalhes de donos...');
  try {
    // Buscamos as organizações e tentamos trazer os perfis vinculados
    // Filtragem de 'gestora' será feita via código para garantir que todas as orgs apareçam
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        profiles (
          nome,
          email,
          role
        )
      `)
      .order('name');
    
    if (error) {
      console.error('❌ [organizationService] Erro ao buscar orgs:', error);
      return { data: null, error };
    }
    
    // Processar dados para extrair o dono (primeira gestora encontrada)
    const processedData: Organization[] = (data || []).map((org: any) => {
      const owner = org.profiles?.find((p: any) => p.role === 'gestora');
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        created_at: org.created_at,
        owner_name: owner?.nome,
        owner_email: owner?.email
      };
    });
    
    return { data: processedData, error: null };
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

/**
 * Delete an organization
 */
export const deleteOrganization = async (id: string) => {
  console.log('🔄 [organizationService] Deletando organização:', id);
  
  try {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ [organizationService] Erro ao deletar org:', error);
      return { error };
    }
    
    console.log('✅ [organizationService] Org deletada com sucesso');
    return { error: null };
  } catch (error) {
    console.error('❌ [organizationService] Erro crítico ao deletar:', error);
    return { error: error instanceof Error ? error : new Error('Erro desconhecido') };
  }
};
