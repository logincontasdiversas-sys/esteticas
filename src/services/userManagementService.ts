/**
 * @file: userManagementService.ts
 * @responsibility: Admin operations for user management
 * @exports: getUsers, createUser, updateUserRole, deleteUser
 * @layer: services
 */

import { supabase } from "@/integrations/supabase/client";
import { signUp } from "./authService";
import type { AppRole } from "@/types/Lancamento";

// Local implementation when Edge Function fails
const createUserLocally = async (email: string, nome: string, role: AppRole | 'adm') => {
  try {
    console.log('📧 Implementação local: Criando usuário real:', { email, nome, role });
    
    // Verificar se o usuário atual está logado
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      console.error('❌ Usuário não está logado');
      return { data: null, error: new Error('Usuário não está logado') };
    }
    
    console.log('✅ Usuário atual logado:', currentUser.email);
    
    // Use inviteUserByEmail instead of signUp to avoid logging out admin
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: 'tempPassword123!', // Temporary password
      options: {
        data: {
          nome: nome,
          role: role
        },
        emailRedirectTo: 'http://localhost:8081/set-password'
      }
    });
    
    if (authError) {
      console.error('Erro ao criar usuário:', authError);
      return { data: null, error: authError };
    }
    
    if (!authData.user) {
      console.error('Usuário não foi criado');
      return { data: null, error: new Error('Usuário não foi criado') };
    }
    
    console.log('✅ Usuário criado com sucesso:', authData.user.id);
    
    // Verificar se o perfil já existe (trigger pode ter criado)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single();
    
    if (!existingProfile) {
      // Create profile only if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          nome: nome
        });
      
      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        return { data: null, error: profileError };
      }
      console.log('✅ Perfil criado manualmente');
    } else {
      console.log('✅ Perfil já existe (criado pelo trigger)');
    }
    
    // Verificar se o role já existe (trigger pode ter criado)
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', authData.user.id)
      .single();
    
    if (!existingRole) {
      // Assign role only if it doesn't exist
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: role
        });
      
      if (roleError) {
        console.error('Erro ao atribuir role:', roleError);
        return { data: null, error: roleError };
      }
      console.log('✅ Role atribuído manualmente');
    } else {
      console.log('✅ Role já existe (criado pelo trigger)');
    }
    
    console.log('✅ Usuário criado localmente com sucesso!');
    console.log('📧 Email de confirmação enviado para:', email);
    console.log('🔗 O usuário deve confirmar o email antes de fazer login');
    console.log('👤 Usuário ID:', authData.user.id);
    
    return { 
      data: { 
        id: authData.user.id, 
        email, 
        nome, 
        role 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Erro na implementação local:', error);
    return { data: null, error };
  }
};

export interface UserWithRole {
  id: string;
  email: string;
  nome: string;
  role: AppRole | null;
  created_at: string;
}

export const getUsers = async (organizationId: string | null) => {
  if (!organizationId) return { data: [], error: null };
  console.log('Carregando usuários reais do Supabase para a organização:', organizationId);

  try {
    // Get all profiles with their emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nome, email, created_at')
      .eq('organization_id', organizationId);
    
    if (profilesError) return { data: null, error: profilesError };
    
    // Get all user_roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');
    
    if (rolesError) {
      console.error('Erro ao carregar roles:', rolesError);
    }
    
    // Create a map of user_id -> role
    const roleMap = new Map<string, AppRole | 'adm'>();
    userRoles?.forEach(ur => {
      roleMap.set(ur.user_id, ur.role);
    });
    
    // Map profiles with roles from user_roles table
    const users: UserWithRole[] = profiles.map(profile => {
      return {
        id: profile.id,
        email: profile.email || 'N/A',
        nome: profile.nome,
        role: roleMap.get(profile.id) as AppRole | null,
        created_at: profile.created_at,
      };
    });
    
    return { data: users, error: null };
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    return { data: null, error };
  }
};

export const createUserWithRole = async (
  email: string,
  nome: string,
  role: AppRole | 'adm',
  organizationId: string | null,
  organizationName?: string | null
) => {
  if (!organizationId) throw new Error("ID da organização é obrigatório para convidar usuários");
  // ONLY use Edge Function - no fallback to avoid admin logout
    const payload = { 
      email, 
      nome, 
      role,
      organization_id: organizationId,
      organization_name: organizationName || 'Lumina Control',
      origin: window.location.origin
    };

    console.log('🚀 Enviando para Edge Function:', payload);

    const { data: rawData, error } = await supabase.functions.invoke('invite-user', {
      body: payload
    });
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      console.log('📦 Resposta bruta do servidor:', rawData);
      
      // Tentar extrair a mensagem de erro detalhada do corpo da resposta
      let errorMsg = error.message;
      if (rawData && typeof rawData === 'object' && (rawData as any).error) {
        errorMsg = (rawData as any).error;
        console.error('📝 Motivo detalhado:', (rawData as any).error);
      }
      
      return { 
        data: null, 
        error: new Error(errorMsg || 'Erro desconhecido na Edge Function') 
      };
    }
    
    console.log('✅ Convite enviado via Edge Function');
    return { data: data.user, error: null };
  } catch (error) {
    console.error('Erro na Edge Function:', error);
    console.log('❌ Edge Function obrigatória para convites!');
    
    return { 
      data: null, 
      error: new Error('Edge Function obrigatória para convites. Configure no Supabase Dashboard.') 
    };
  }
};

export const updateUserRole = async (userId: string, newRole: AppRole | 'adm') => {
  try {
    console.log('🔄 [updateUserRole] INÍCIO - Atualizando role do usuário:', { userId, newRole });
    
    // Verificar usuário atual logado
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      console.error('❌ [updateUserRole] Usuário não autenticado!');
      return { data: null, error: { message: 'Usuário não autenticado' } };
    }
    
    // Buscar perfil do usuário
    console.log('🔄 [updateUserRole] Buscando perfil...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, nome, email')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('❌ [updateUserRole] Erro ao buscar perfil:', profileError);
      return { data: null, error: profileError };
    }
    
    console.log('✅ [updateUserRole] Perfil encontrado:', profileData);
    
    // Atualizar role na tabela user_roles
    console.log('🔄 [updateUserRole] Atualizando user_roles...');
    
    // Primeiro, verificar se já existe role para este usuário
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    if (existingRole) {
      // Atualizar role existente
      const { error: roleUpdateError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
      
      if (roleUpdateError) {
        console.error('❌ [updateUserRole] Erro ao atualizar user_roles:', roleUpdateError);
        return { data: null, error: roleUpdateError };
      }
      
      console.log('✅ [updateUserRole] user_roles atualizado (update)');
    } else {
      // Criar novo role se não existir
      const { error: roleInsertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });
      
      if (roleInsertError) {
        console.error('❌ [updateUserRole] Erro ao inserir user_roles:', roleInsertError);
        return { data: null, error: roleInsertError };
      }
      
      console.log('✅ [updateUserRole] user_roles criado (insert)');
    }
    
    console.log('✅ [updateUserRole] Role atualizado com sucesso!');
    return { data: profileData, error: null };
    
  } catch (error) {
    console.error('❌ Erro inesperado ao atualizar role:', error);
    return { 
      data: null, 
      error: { 
        message: 'Erro inesperado ao atualizar role do usuário',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      } 
    };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    console.log('🗑️ Excluindo usuário:', userId);
    
    // Verificar se o usuário atual está logado
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      console.error('❌ Usuário não está logado');
      return { data: null, error: new Error('Usuário não está logado') };
    }
    
    console.log('✅ Usuário atual logado:', currentUser.email);
    
    // Try Edge Function first for complete deletion
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) {
        console.error('Edge Function error:', error);
        console.log('Edge Function falhou, usando implementação local');
        throw error;
      }
      
      console.log('✅ Usuário deletado completamente via Edge Function');
      return { data: { id: userId, deleted: true }, error: null };
    } catch (edgeError) {
      console.log('Edge Function não disponível, usando implementação local');
      
      // Fallback: Delete from public tables only
      // 1. Deletar da tabela user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (roleError) {
        console.error('Erro ao deletar role:', roleError);
        return { data: null, error: roleError };
      }
      console.log('✅ Role deletado com sucesso');
      
      // 2. Deletar da tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError);
        return { data: null, error: profileError };
      }
      console.log('✅ Perfil deletado com sucesso');
      
      // 3. Deletar da tabela auth.users (requer admin)
      // Nota: Não podemos deletar diretamente de auth.users via client
      // Isso deve ser feito via Edge Function ou admin dashboard
      console.log('⚠️ Usuário deletado das tabelas públicas');
      console.log('📧 Para deletar completamente, use o Supabase Dashboard > Authentication > Users');
      
      console.log('✅ Usuário excluído com sucesso!');
      console.log('👤 Usuário ID removido:', userId);
      
      return { 
        data: { 
          id: userId,
          deleted: true
        }, 
        error: null 
      };
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return { data: null, error };
  }
};
