import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Dashboard } from "@/components/Dashboard";
import { LancamentosList } from "@/components/LancamentosList";
import { ProfissionaisReport } from "@/components/ProfissionaisReport";
import { FluxoCaixa } from "@/components/FluxoCaixa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, isSuperAdmin, organizationName, loading: authLoading } = useAuth();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold">✨ Lumina Control</h1>
            <p className="text-xs opacity-80">
              Gestão Financeira
            </p>
          </div>

          <div className="flex-1 text-center">
            {organizationName ? (
              <h2 className="text-2xl font-black uppercase tracking-widest text-white animate-pulse">
                🏛️ {organizationName}
              </h2>
            ) : (
              <h2 className="text-lg font-medium opacity-50 italic">
                Aguardando Organização...
              </h2>
            )}
            {user && (
              <p className="text-xs opacity-75 mt-1 font-mono">
                {user.email}
              </p>
            )}
          </div>

          <div className="flex-1 flex justify-end gap-2">
            {isSuperAdmin && (
              <Button variant="outline" size="sm" className="bg-slate-900 border-indigo-500/50 text-indigo-400 hover:bg-slate-800" onClick={() => navigate('/god-mode')}>
                🛠️ Modo Deus
              </Button>
            )}
            {isAdmin && (
              <Button variant="secondary" size="sm" onClick={() => navigate('/admin')}>
                ⚙️ Admin
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="lancamentos">📋 Lançamentos</TabsTrigger>
            <TabsTrigger value="profissionais">👩‍💼 Profissionais</TabsTrigger>
            <TabsTrigger value="fluxo">💰 Fluxo de Caixa</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="lancamentos">
            <LancamentosList />
          </TabsContent>

          <TabsContent value="profissionais">
            <ProfissionaisReport />
          </TabsContent>

          <TabsContent value="fluxo">
            <FluxoCaixa />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;