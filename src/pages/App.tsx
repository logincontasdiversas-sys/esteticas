/**
 * @file: App.tsx
 * @responsibility: Main app layout with auth guard
 * @exports: AppPage
 * @imports: auth hooks, components
 * @layer: pages
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/services/authService";
import { Logo } from "@/components/Logo";

const AppPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate('/auth');
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast.error('Erro ao sair', { description: error.message });
    } else {
      toast.success('Até logo!');
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Logo />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <Logo />
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lançamentos</h1>
              <p className="text-muted-foreground">
                Gerencie os pagamentos da estética
              </p>
            </div>
            <Button className="btn-primary gap-2">
              <Plus className="h-5 w-5" />
              Novo Lançamento
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-card rounded-lg p-6 shadow-card card-hover border border-border">
              <h3 className="text-sm font-medium text-muted-foreground">Saldo Bruto</h3>
              <p className="text-3xl font-bold text-foreground mt-2">R$ 0,00</p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-card card-hover border border-border">
              <h3 className="text-sm font-medium text-muted-foreground">Repasses</h3>
              <p className="text-3xl font-bold text-warning mt-2">R$ 0,00</p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-card card-hover border border-border">
              <h3 className="text-sm font-medium text-muted-foreground">Ganho Líquido</h3>
              <p className="text-3xl font-bold text-success mt-2">R$ 0,00</p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-card border border-border">
            <p className="text-center text-muted-foreground py-12">
              Nenhum lançamento ainda. Clique em "Novo Lançamento" para começar.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppPage;