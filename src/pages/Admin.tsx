import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { UserManagement } from "@/components/admin/UserManagement";
import { ProfissionaisManagement } from "@/components/admin/ProfissionaisManagement";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { AportesManagement } from "@/components/admin/AportesManagement";
import { AdminSidebar, AdminSidebarPage } from "@/components/admin/AdminSidebar";
import { Menu, X, Shield, Bell, User } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, organizationName, adminData } = useAuth();
  const [activePage, setActivePage] = useState<AdminSidebarPage>('users');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-slate-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso Negado</h2>
          <p className="text-slate-500 mb-8">
            Você não tem permissões de administrador para acessar o Painel Master.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
          >
            Voltar ao Sistema
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activePage) {
      case 'users': return <UserManagement />;
      case 'profissionais': return <ProfissionaisManagement />;
      case 'aportes': return <AportesManagement />;
      case 'audit': return <AuditLogs />;
      default: return <UserManagement />;
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'users': return 'Gestão de Usuários';
      case 'profissionais': return 'Gestão de Profissionais';
      case 'aportes': return 'Movimentações de Caixa';
      case 'audit': return 'Auditoria & Logs do Sistema';
      default: return 'Painel Administrativo';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Admin Sidebar Desktop */}
      <div className="hidden md:block">
        <AdminSidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          userEmail={user?.email}
        />
      </div>

      {/* Mobile Admin Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative animate-in slide-in-from-left duration-300">
            <AdminSidebar 
              activePage={activePage} 
              setActivePage={(p) => { setActivePage(p); setIsMobileMenuOpen(false); }} 
              userEmail={user?.email}
            />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 -right-12 p-2 bg-slate-900 text-white rounded-lg shadow-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse absolute -top-0.5 -right-0.5" />
                <Bell className="w-4 h-4 text-slate-500" />
              </div>
              <div className="h-4 w-[1px] bg-slate-300 mx-1" />
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold text-slate-900 leading-none">
                  Soberano: {adminData?.nome || user?.email?.split('@')[0]}
                </p>
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shadow-inner">
                  {adminData?.nome?.[0] || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Administrative Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="container mx-auto py-8 px-6 max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;