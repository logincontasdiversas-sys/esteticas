import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  adminData: any;
  organizationId: string | null;
  organizationName: string | null;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  forceRefreshAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  isAdmin: false,
  adminData: null,
  organizationId: null,
  organizationName: null,
  isSuperAdmin: false,
  signOut: async () => {},
  refreshAuth: async () => {},
  forceRefreshAdmin: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const checkAdminStatus = async (userId: string, forceRefresh = false) => {
    // Prevenir múltiplas execuções simultâneas
    if (isCheckingAdmin) {
      console.log("[AUTH] Verificação de admin já em andamento, pulando...");
      return;
    }

    try {
      setIsCheckingAdmin(true);
      console.log("[AUTH] Verificando status de admin para usuário:", userId);
      
      // Verificar cache primeiro
      const cacheKey = `admin_${userId}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData && !forceRefresh) {
        const parsed = JSON.parse(cachedData);
        console.log("[AUTH] Usando dados do cache:", parsed);
        setIsAdmin(parsed.isAdmin);
        setAdminData(parsed.adminData);
        setOrganizationId(parsed.organizationId || null);
        setOrganizationName(parsed.organizationName || null);
        setIsSuperAdmin(parsed.isSuperAdmin || false);
        return;
      }

      console.log("[AUTH] Buscando dados do Supabase...");
      
      // Buscar dados do Supabase - profiles e roles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, nome, email, organization_id')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("[AUTH] Erro ao buscar perfil:", profileError);
        setIsAdmin(false);
        setAdminData(null);
        return;
      }

      // Buscar roles do usuário
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error("[AUTH] Erro ao buscar roles:", rolesError);
      }

      // Verificar se é admin (tem role 'adm' ou 'gestora')
      const userRoles = roles?.map(r => r.role) || [];
      const adminStatus = userRoles.includes('adm') || userRoles.includes('gestora') || profile?.email === 'admin@god.com';
      const superAdminStatus = profile?.email === 'admin@god.com';

      setIsAdmin(adminStatus);
      setIsSuperAdmin(superAdminStatus);
      setAdminData(adminStatus ? profile : null);
      setOrganizationId(profile?.organization_id || null);

      let orgName = null;
      // Buscar nome da organização se houver ID
      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', profile.organization_id)
          .single();
        
        if (org) {
          orgName = org.name;
          setOrganizationName(orgName);
        }
      }

      // Salvar no cache
      const cacheData = {
        isAdmin: adminStatus,
        isSuperAdmin: superAdminStatus,
        adminData: adminStatus ? profile : null,
        organizationId: profile?.organization_id || null,
        organizationName: orgName,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log("[AUTH] Dados salvos no cache");

    } catch (error) {
      console.error("[AUTH] Erro ao verificar status de admin:", error);
      setIsAdmin(false);
      setAdminData(null);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("[AUTH] Fazendo logout...");
      
      // Fazer logout no Supabase primeiro
      await supabase.auth.signOut({ scope: 'local' });
      
      // Limpar estado local
      const currentUserId = user?.id;
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminData(null);
      setOrganizationId(null);
      setOrganizationName(null);
      
      // Limpar cache
      if (currentUserId) {
        localStorage.removeItem(`admin_${currentUserId}`);
      }
      localStorage.clear();
      sessionStorage.clear();
      
      console.log("[AUTH] Logout realizado com sucesso");
    } catch (error) {
      console.error("[AUTH] Erro no logout:", error);
      // Limpar estado mesmo com erro
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminData(null);
      setOrganizationId(null);
      setOrganizationName(null);
    }
  };

  const refreshAuth = async () => {
    try {
      console.log("[AUTH] Atualizando autenticação...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[AUTH] Erro ao buscar sessão:", error);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminStatus(session.user.id, true);
      }
      
      console.log("[AUTH] Autenticação atualizada");
    } catch (error) {
      console.error("[AUTH] Erro ao atualizar autenticação:", error);
    }
  };

  const forceRefreshAdmin = () => {
    console.log("[AUTH] Forçando atualização do status de admin...");
    if (user && !isCheckingAdmin) {
      checkAdminStatus(user.id, true);
    }
  };

  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AUTH] Erro ao buscar sessão inicial:", error);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        }
      } catch (error) {
        console.error("[AUTH] Erro ao verificar sessão inicial:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AUTH] Mudança de estado:", event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setAdminData(null);
          setOrganizationId(null);
          setOrganizationName(null);
          localStorage.clear();
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setAdminData(null);
          setOrganizationName(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    isAdmin,
    isSuperAdmin,
    adminData,
    organizationId,
    organizationName,
    signOut,
    refreshAuth,
    forceRefreshAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};