import React from "react";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  DollarSign, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type SidebarPage = 'dashboard' | 'lancamentos' | 'profissionais' | 'fluxo' | 'admin';

interface SidebarProps {
  activePage: SidebarPage;
  setActivePage: (page: SidebarPage) => void;
  isAdmin: boolean;
  onLogout: () => void;
  organizationName?: string;
}

export const Sidebar = ({ 
  activePage, 
  setActivePage, 
  isAdmin, 
  onLogout,
  organizationName 
}: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lancamentos', label: 'Lançamentos', icon: ClipboardList },
    { id: 'profissionais', label: 'Profissionais', icon: Users },
    { id: 'fluxo', label: 'Fluxo de Caixa', icon: DollarSign },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Administração', icon: Settings });
  }

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 w-64 border-r border-slate-800 transition-all duration-300 ease-in-out">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <div>
          <h2 className="font-bold text-white tracking-tight text-lg">Lumina</h2>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">Control v5.0</p>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50" />
      </div>

      {/* Org Name (Small context) */}
      <div className="px-6 py-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Empresa Atual</p>
        <p className="text-sm font-medium text-slate-300 truncate">{organizationName || 'Lumina Control'}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as SidebarPage)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110 text-slate-500 group-hover:text-primary"
              )} />
              {item.label}
              
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-900/50 rounded-xl p-2 border border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10 gap-3 px-3"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Encerrar Sessão</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
