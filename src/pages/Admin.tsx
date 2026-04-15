import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { UserManagement } from "@/components/admin/UserManagement";
import { ProfissionaisManagement } from "@/components/admin/ProfissionaisManagement";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { AportesManagement } from "@/components/admin/AportesManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🚫 Acesso Negado</CardTitle>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = "/"}>
              Voltar ao Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">⚙️ Painel Administrativo</h1>
            <p className="text-sm opacity-90">
              Gerenciamento completo do sistema
            </p>
            {user && (
              <p className="text-xs opacity-75 mt-1">
                👤 Admin: {user.email}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {isSuperAdmin && (
              <Button variant="outline" className="bg-slate-900 border-indigo-500/50 text-indigo-400 hover:bg-slate-800" onClick={() => window.location.href = "/god-mode"}>
                🛠️ Modo Deus
              </Button>
            )}
            <Button variant="secondary" onClick={() => window.location.href = "/"}>
              ← Voltar ao Sistema
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">👥 Usuários</TabsTrigger>
            <TabsTrigger value="profissionais">👩‍💼 Profissionais</TabsTrigger>
            <TabsTrigger value="aportes">💰 Movimentações</TabsTrigger>
            <TabsTrigger value="audit">📋 Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="profissionais">
            <ProfissionaisManagement />
          </TabsContent>

          <TabsContent value="aportes">
            <AportesManagement />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;