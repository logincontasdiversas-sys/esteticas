import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Dashboard } from "@/components/Dashboard";
import { LancamentosList } from "@/components/LancamentosList";
import { ProfissionaisReport } from "@/components/ProfissionaisReport";
import { FluxoCaixa } from "@/components/FluxoCaixa";
import { Sidebar, SidebarPage } from "@/components/Sidebar";
import { Menu, X, Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, organizationName, adminData, loading: authLoading } = useAuth();
  const [activePage, setActivePage] = useState<SidebarPage>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'lancamentos': return <LancamentosList />;
      case 'profissionais': return <ProfissionaisReport />;
      case 'fluxo': return <FluxoCaixa />;
      case 'admin': navigate('/admin'); return null;
      default: return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return { title: '📊 Dashboard', subtitle: 'Visão geral do sistema' };
      case 'lancamentos': return { title: '📋 Lançamentos', subtitle: 'Gestão de entradas e saídas' };
      case 'profissionais': return { title: '👩‍💼 Profissionais', subtitle: 'Relatórios de atendimento' };
      case 'fluxo': return { title: '💰 Fluxo de Caixa', subtitle: 'Acompanhamento financeiro' };
      default: return { title: 'Painel de Controle', subtitle: 'Gestão Lumina Control' };
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          isAdmin={isAdmin} 
          onLogout={handleSignOut}
          organizationName={organizationName}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative animate-in slide-in-from-left duration-300">
            <Sidebar 
              activePage={activePage} 
              setActivePage={(p) => { setActivePage(p); setIsMobileMenuOpen(false); }} 
              isAdmin={isAdmin} 
              onLogout={handleSignOut}
              organizationName={organizationName}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="hidden sm:flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
                {getPageTitle().title}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                {getPageTitle().subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-500 border border-slate-200">
              <Search className="w-4 h-4" />
              <span className="text-xs font-medium">Buscar dados...</span>
              <span className="ml-4 text-[10px] bg-white border border-slate-300 px-1 rounded shadow-sm">⌘K</span>
            </div>
            
            <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">
                  {adminData?.nome || 'Usuário'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {organizationName || 'LYB Estética'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                {adminData?.nome?.[0] || <User className="w-5 h-5" />}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="container mx-auto py-8 px-6 max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;