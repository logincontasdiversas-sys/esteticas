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
      return;
    }

    try {
      setIsCheckingAdmin(true);
      const cacheKey = `auth_admin_v15_${userId}`;
      const cachedAuth = localStorage.getItem(cacheKey);
      
      if (cachedAuth && !forceRefresh) {
        const parsed = JSON.parse(cachedAuth);
        setIsAdmin(parsed.isAdmin);
        setIsSuperAdmin(parsed.isSuperAdmin);
        setAdminData(parsed.adminData);
        setOrganizationId(parsed.organizationId);
        setOrganizationName(parsed.organizationName);
        setIsCheckingAdmin(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("[AUTH] Erro ao buscar perfil atômico:", profileError);
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userEmail = authUser?.email;

      const superAdminStatus = userEmail === 'admin@god.com';
      const roleFromProfile = profile?.role;
      const isAdminStatus = superAdminStatus || roleFromProfile === 'adm' || roleFromProfile === 'gestora';
      
      const orgId = profile?.organization_id || null;
      const orgName = profile?.organization_name || (superAdminStatus ? "God Mode" : "Lumina Control");

      setIsAdmin(isAdminStatus);
      setIsSuperAdmin(superAdminStatus);
      setAdminData(profile || { nome: profile?.nome || 'Usuário', email: userEmail });
      setOrganizationId(orgId);
      setOrganizationName(orgName);

      const cacheData = {
        isAdmin: isAdminStatus,
        isSuperAdmin: superAdminStatus,
        adminData: profile,
        organizationId: orgId,
        organizationName: orgName,
        timestamp: Date.now()
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));

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
    // Verificar sessão inicial e processar links de convite/recuperação
    const getInitialSession = async () => {
      console.log('[AUTH] 🚀 Iniciando verificação de sessão. URL Atual:', window.location.href);
      
      try {
        const hash = window.location.hash;
        const search = window.location.search;
        
        // Processamento de Link de Convite/Recuperação SOBERANO
        const hasTokens = hash.includes('access_token=') || search.includes('access_token=') || search.includes('token=');
        
        if (hasTokens) {
          console.log('[AUTH] 🎫 Link de autenticação detectado. Iniciando extração...');
          
          const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
          const searchParams = new URLSearchParams(search.replace(/^\?/, ''));
          
          let accessToken = hashParams.get('access_token') || searchParams.get('access_token');
          let refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
          let type = hashParams.get('type') || searchParams.get('type');
          let token = hashParams.get('token') || searchParams.get('token');

          // Fallback Regex
          if (!accessToken || !refreshToken) {
            const url = window.location.href;
            accessToken = accessToken || url.match(/[#?&]access_token=([^&#]+)/)?.[1] || null;
            refreshToken = refreshToken || url.match(/[#?&]refresh_token=([^&#]+)/)?.[1] || null;
            type = type || url.match(/[#?&]type=([^&#]+)/)?.[1] || null;
            token = token || url.match(/[#?&]token=([^&#]+)/)?.[1] || null;
          }

          console.log('[AUTH] 🔍 Resultado da extração:', { type, hasAccess: !!accessToken, hasRefresh: !!refreshToken, hasOTP: !!token });

          if ((accessToken && refreshToken) || (token && type === 'invite')) {
            try {
              if (accessToken && refreshToken) {
                console.log('[AUTH] ⏳ Sincronizando sessão com tolerância a clock skew...');
                const { error: syncError } = await supabase.auth.setSession({ 
                  access_token: accessToken, 
                  refresh_token: refreshToken 
                });
                
                if (syncError) {
                  console.error('[AUTH] ❌ Erro ao sincronizar sessão:', syncError.message);
                  // Se falhar por tempo/skew, tentamos recuperar a sessão de qualquer forma
                }
              } else if (token && type === 'invite') {
                console.log('[AUTH] ⏳ Verificando OTP...');
                await supabase.auth.verifyOtp({ token_hash: token, type: 'invite' });
              }
              
              console.log('[AUTH] ✅ Processamento de link concluído.');
              // Limpar URL
              window.history.replaceState(null, '', window.location.pathname);
            } catch (err) {
              console.error('[AUTH] ❌ Falha crítica ao processar link:', err);
            }
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AUTH] Erro ao buscar sessão inicial:", error);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkAdminStatus(session.user.id);
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
          checkAdminStatus(session.user.id);
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