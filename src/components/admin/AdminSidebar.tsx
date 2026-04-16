import React from "react";
import { 
  Users, 
  Star, 
  ArrowLeftRight, 
  Activity, 
  ShieldAlert, 
  ArrowLeft,
  Settings,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export type AdminSidebarPage = 'users' | 'profissionais' | 'aportes' | 'audit';

interface AdminSidebarProps {
  activePage: AdminSidebarPage;
  setActivePage: (page: AdminSidebarPage) => void;
  userEmail: string | undefined;
}

export const AdminSidebar = ({ 
  activePage, 
  setActivePage, 
  userEmail
}: AdminSidebarProps) => {
  const navigate = useNavigate();
  const isSuperGod = userEmail === 'admin@god.com';

  const menuItems = [
    { id: 'users', label: 'Gestão de Usuários', icon: Users },
    { id: 'profissionais', label: 'Profissionais', icon: Star },
    { id: 'aportes', label: 'Movimentações', icon: ArrowLeftRight },
    { id: 'audit', label: 'Auditoria/Logs', icon: Activity },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 w-64 border-r border-slate-800 transition-all duration-300 ease-in-out">
      {/* Admin Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30">
          <Settings className="w-6 h-6 text-amber-500 animate-spin-slow" />
        </div>
        <div>
          <h2 className="font-bold text-white tracking-tight text-lg">Painel Master</h2>
          <p className="text-[10px] text-amber-500/80 uppercase font-black tracking-widest leading-none">Admin Soberano</p>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Administração</p>
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as AdminSidebarPage)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110 text-slate-500 group-hover:text-amber-500"
              )} />
              {item.label}
            </button>
          );
        })}

        {/* Special Access for God mode */}
        {isSuperGod && (
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <p className="px-3 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Soberania Master</p>
            <button
              onClick={() => navigate('/god-mode')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 border border-transparent hover:border-indigo-500/30 group"
            >
              <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Acesso Exclusivo
            </button>
          </div>
        )}
      </nav>

      {/* Back to System */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-900/50 rounded-xl p-2 border border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-primary hover:bg-primary/10 gap-3 px-3"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar ao Sistema</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
