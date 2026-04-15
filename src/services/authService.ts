/**
 * @file: authService.ts
 * @responsibility: Authentication operations via Supabase
 * @exports: signUp, signIn, signOut, getCurrentUser
 * @imports: supabase from client
 * @layer: services
 */

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/types/Lancamento";

export const signUp = async (email: string, password: string, nome: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { nome }
    }
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};

export const signOut = async () => {
  console.log("[AUTH_SERVICE] Iniciando logout...");
  
  // Limpar dados locais primeiro
  localStorage.clear();
  sessionStorage.clear();
  
  // Chamar logout do Supabase
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  
  if (error) {
    console.error("[AUTH_SERVICE] Erro no logout:", error);
    return { error };
  }
  
  console.log("[AUTH_SERVICE] Logout bem-sucedido!");
  return { error: null };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getUserRole = async (userId: string): Promise<AppRole | null> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  return data.role as AppRole;
};