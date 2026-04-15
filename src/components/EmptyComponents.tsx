import React from "react";

// Componente vazio para substituir todos os componentes problemáticos
export const EmptyComponent = ({ children }: { children?: React.ReactNode }) => {
  console.log("[EMPTY] Componente vazio renderizado");
  return <div>Componente vazio - Sem loops</div>;
};

// Substituir todos os componentes principais
export const Dashboard = EmptyComponent;
export const ProfissionaisReport = EmptyComponent;
export const FluxoCaixa = EmptyComponent;
export const LancamentosList = EmptyComponent;
export const UserManagement = EmptyComponent;
export const SaldoInicialManagement = EmptyComponent;
export const ConfigManagement = EmptyComponent;
export const ProfissionaisManagement = EmptyComponent;
export const AuditLogs = EmptyComponent;
export const LancamentoForm = EmptyComponent;
export const UserProfile = EmptyComponent;
export const WelcomeDropdown = EmptyComponent;
