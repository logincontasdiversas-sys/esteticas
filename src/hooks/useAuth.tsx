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
      
      // Verificar cache atualizado
      const cacheKey = `auth_admin_v13_${userId}`;
      const cachedAuth = localStorage.getItem(cacheKey);
      const metadata = session?.user.user_metadata || {};
      
      if (cachedAuth && !forceRefresh) {
        const parsed = JSON.parse(cachedAuth);
        console.log("[AUTH] Usando dados do cache v11:", parsed);
        setIsAdmin(parsed.isAdmin);
        setIsSuperAdmin(parsed.isSuperAdmin);
        setAdminData(parsed.adminData);
        setOrganizationId(parsed.organizationId);
        setOrganizationName(parsed.organizationName);
        setIsCheckingAdmin(false);
        return;
      }

      console.log("[AUTH] Buscando dados do Supabase...");
      
      // Buscar dados do Supabase - profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, nome, organization_id')
        .eq('id', userId)
        .maybeSingle(); // Usar maybeSingle para não gerar erro 406 se não existir

      if (profileError) {
        console.error("[AUTH] Erro ao buscar perfil:", profileError);
      }

      // Buscar roles do usuário
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error("[AUTH] Erro ao buscar roles:", rolesError);
      }

      // Buscar e-mail e metadados do usuário autenticado para fallback (reutilizando metadata já declarada)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userEmail = authUser?.email;
      const userMetadata = authUser?.user_metadata || metadata;

      // Verificar se é admin (tem role 'adm' ou 'gestora')
      const userRoles = roles?.map(r => r.role) || [];
      const isOwnerOrStaff = userRoles.includes('adm') || userRoles.includes('gestora') || userMetadata.role === 'gestora' || userMetadata.role === 'adm';
      const superAdminStatus = userEmail === 'admin@god.com';
      const adminStatus = isOwnerOrStaff || superAdminStatus;

      setIsAdmin(adminStatus);
      setIsSuperAdmin(superAdminStatus);
      setAdminData(profile || (superAdminStatus ? { nome: 'Super Admin', email: userEmail } : (userMetadata.nome ? { nome: userMetadata.nome, email: userEmail } : null)));
      
      // PRIORIDADE: Perfil do Banco > Metadados do JWT (Fallback imediato)
      const finalOrgId = profile?.organization_id || userMetadata.organization_id || null;
      console.log("[AUTH] Final Org Detection:", {
        fromProfile: profile?.organization_id,
        fromMetadata: userMetadata.organization_id,
        finalResult: finalOrgId
      });
      setOrganizationId(finalOrgId);

      let orgName = null;
      let detectedOrgId = finalOrgId;
      
      // PRIORIDADE 1: Tentar buscar via Join com o Perfil (mais robusto contra RLS)
      if (userId) {
        console.log("[AUTH] Tentando busca via JOIN Profile-Org para User:", userId);
        const { data: profileWithOrg } = await supabase
          .from('profiles')
          .select(`
            organization_id,
            organizations (
              name
            )
          `)
          .eq('id', userId)
          .maybeSingle();

        if (profileWithOrg?.organizations) {
          const joinedName = (profileWithOrg.organizations as any).name;
          if (joinedName) {
            orgName = joinedName;
            detectedOrgId = profileWithOrg.organization_id;
            console.log("[AUTH] ✅ Nome encontrado via JOIN:", orgName);
          }
        }
      }

      // Se o JOIN falhou, tentar a busca direta anterior como plano B
      if (!orgName && detectedOrgId) {
        console.log("[AUTH] JOIN falhou, tentando busca DIRETA por ID:", detectedOrgId);
        const { data: org } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', detectedOrgId)
          .maybeSingle();
        
        if (org) {
          orgName = org.name;
          console.log("[AUTH] Nome encontrado via busca direta:", orgName);
        }
      }

      // PRIORIDADE 2: Fallback Soberano - Buscar vínculo no banco por e-mail se o principal falhou
      if (!orgName && userEmail) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('organization_id')
          .ilike('email', userEmail)
          .maybeSingle();
        
        let retryOrgId = profileByEmail?.organization_id || null;

        if (!retryOrgId) {
          const { data: directOrg } = await supabase
            .from('organizations')
            .select('id, name')
            .ilike('slug', '%lyb%')
            .limit(1)
            .maybeSingle();
          
          if (directOrg) {
            orgName = directOrg.name;
            detectedOrgId = directOrg.id;
            setOrganizationId(detectedOrgId);
          }
        }

        if (retryOrgId && !orgName) {
          detectedOrgId = retryOrgId;
          setOrganizationId(detectedOrgId);
          const { data: org } = await supabase.from('organizations').select('name').eq('id', retryOrgId).maybeSingle();
          if (org) orgName = org.name;
        }
      }

      setOrganizationName(orgName || userMetadata.organization_name || "Lumina Control");

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