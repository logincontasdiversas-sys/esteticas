import { createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";

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
  loading: false,
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
  console.log("[AUTH] Sistema MINIMAL - Sem hooks, sem loops");

  const signOut = async () => {
    console.log('[AUTH] Logout minimal');
    localStorage.clear();
    window.location.href = '/auth';
  };

  const refreshAuth = async () => {
    console.log('[AUTH] Refresh minimal');
  };

  const forceRefreshAdmin = () => {
    console.log('[AUTH] Force refresh minimal');
  };

  const value = {
    user: null,
    session: null,
    loading: false,
    isAdmin: false,
    adminData: null,
    signOut,
    refreshAuth,
    forceRefreshAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
