import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  adminData: any;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  forceRefreshAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  adminData: null,
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

  // Função para verificar admin status (SIMPLIFICADA)
  const checkAdminStatus = async (userId: string) => {
    try {
      console.log("[AUTH] Verificando admin para:", userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, nome, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("[AUTH] Erro ao verificar admin:", error);
        setIsAdmin(false);
        setAdminData(null);
        return;
      }

      if (profile) {
        const isAdminUser = profile.role === 'adm';
        console.log("[AUTH] É admin:", isAdminUser);
        setIsAdmin(isAdminUser);
        setAdminData(isAdminUser ? profile : null);
      }
    } catch (error) {
      console.error("[AUTH] Erro ao verificar admin:", error);
      setIsAdmin(false);
      setAdminData(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AUTH] Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await checkAdminStatus(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setAdminData(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("[AUTH] Initial session:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('[AUTH] Iniciando logout...');
      
      // Limpar dados locais
      setIsAdmin(false);
      setAdminData(null);
      localStorage.clear();
      
      // Fazer logout
      await supabase.auth.signOut();
      
      // Redirecionar
      window.location.href = '/auth';
      
    } catch (error) {
      console.error('[AUTH] Erro no logout:', error);
      // Mesmo com erro, limpar e redirecionar
      setIsAdmin(false);
      setAdminData(null);
      localStorage.clear();
      window.location.href = '/auth';
    }
  };

  const refreshAuth = async () => {
    // Função vazia para compatibilidade
  };

  const forceRefreshAdmin = () => {
    // Função vazia para compatibilidade
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    adminData,
    signOut,
    refreshAuth,
    forceRefreshAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
