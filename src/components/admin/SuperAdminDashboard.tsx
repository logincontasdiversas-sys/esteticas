/**
 * @file: SuperAdminDashboard.tsx
 * @responsibility: Master control panel for Super Admin (God Mode)
 * @exports: SuperAdminDashboard
 * @layer: components/admin
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Navigate } from "react-router-dom";
import { getOrganizations, createOrganization, Organization } from "@/services/organizationService";
import { createUserWithRole } from "@/services/userManagementService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, UserPlus, ShieldAlert, Rocket, ArrowLeft, RefreshCw, Send } from "lucide-react";

export const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, loading: authLoading } = useAuth();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  
  // Form states
  const [newOrgName, setNewOrgName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [targetOrgId, setTargetOrgId] = useState("");

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await getOrganizations();
    if (error) {
      toast.error("Erro ao carregar organizações");
    } else {
      setOrganizations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;

    setCreating(true);
    const { data, error } = await createOrganization(newOrgName);
    
    if (error) {
      toast.error("Erro ao criar organização");
    } else {
      toast.success("Organização criada com sucesso!");
      setNewOrgName("");
      loadData();
    }
    setCreating(false);
  };

  const handleInviteOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerEmail || !ownerName || !targetOrgId) {
      toast.error("Preencha todos os campos para o convite");
      return;
    }

    setInviting(true);
    const { error } = await createUserWithRole(ownerEmail, ownerName, 'gestora', targetOrgId);
    
    if (error) {
      toast.error("Erro ao convidar empresário: " + error.message);
    } else {
      toast.success("Empresário convidado com sucesso!");
      setOwnerEmail("");
      setOwnerName("");
    }
    setInviting(false);
  };

  if (authLoading) return <div className="p-8 text-center">Verificando autoridade...</div>;
  if (!isSuperAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Premium Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">Lumina: Modo Deus</h1>
              <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Arquitetura de Expansão</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white hover:bg-white/5 gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Sistema
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-slate-950 border-indigo-500/20 shadow-2xl shadow-indigo-500/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-2xl font-black tracking-tight">
                <Rocket className="w-6 h-6 text-indigo-400" /> Soberania Administrativa
              </CardTitle>
              <CardDescription className="text-slate-300 font-medium max-w-md">
                Bem-vindo ao centro de comando. Aqui você escala o ecossistema Lumina criando novos universos empresariais.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/5 p-6 rounded-2xl flex-1 border border-white/10 hover:border-indigo-500/50 transition-all cursor-default group shadow-2xl">
                  <p className="text-[10px] text-indigo-400 uppercase font-black mb-2 tracking-widest">Total de Organizações</p>
                  <p className="text-5xl font-black text-white group-hover:scale-105 transition-transform origin-left">{organizations.length}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl flex-1 border border-white/10 hover:border-indigo-500/50 transition-all cursor-default group shadow-2xl">
                  <p className="text-[10px] text-indigo-400 uppercase font-black mb-2 tracking-widest">Status do Sistema</p>
                  <div className="flex items-center gap-3 text-emerald-400">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                    <p className="text-sm font-black uppercase tracking-widest">100% Operacional</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Org Quick Form */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm">🏢 Criar Nova Organização</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName" className="text-xs text-slate-300 font-bold uppercase">Nome da Empresa</Label>
                  <Input 
                    id="orgName"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Ex: Estética Sol Nascente"
                    className="bg-black/60 border-white/20 focus:border-indigo-500 text-white placeholder:text-slate-600"
                  />
                </div>
                <Button type="submit" disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Criar Empresa"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Invite Master User */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> Convite de Empresário (Dono)
              </CardTitle>
              <CardDescription>
                Selecione uma organização e envie o convite para o gestor soberano.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteOwner} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
                <Label className="text-xs text-slate-300 font-bold uppercase">Organização Destino</Label>
                <select 
                  className="w-full h-10 bg-black/60 border border-white/20 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                  value={targetOrgId}
                  onChange={(e) => setTargetOrgId(e.target.value)}
                >
                  <option value="" className="bg-slate-900">Selecione...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id} className="bg-slate-900">{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-300 font-bold uppercase">Nome do Empresário</Label>
                <Input 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nome Completo"
                  className="bg-black/60 border-white/20 text-white placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-300 font-bold uppercase">Email do Empresário</Label>
                <Input 
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  className="bg-black/60 border-white/20 text-white placeholder:text-slate-600"
                />
              </div>
              <Button type="submit" disabled={inviting} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {inviting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Enviar Convite</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Organizations Table */}
        <Card className="bg-slate-900/50 border-white/10 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Eco-Map: Organizações Ativas</CardTitle>
            <Button variant="ghost" size="sm" onClick={loadData} className="text-slate-500 hover:text-white">
              <RefreshCw className="w-3 h-3 mr-2" /> Recarregar
            </Button>
          </CardHeader>
          <Table>
            <TableHeader className="bg-black/60">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-indigo-300 font-bold uppercase tracking-widest text-[10px]">Organização</TableHead>
                <TableHead className="text-indigo-300 font-bold uppercase tracking-widest text-[10px]">Slug / Namespace</TableHead>
                <TableHead className="text-indigo-300 font-bold uppercase tracking-widest text-[10px]">ID Identificador</TableHead>
                <TableHead className="text-indigo-300 font-bold uppercase tracking-widest text-[10px]">Data de Criação</TableHead>
                <TableHead className="text-indigo-300 font-bold uppercase tracking-widest text-[10px] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id} className="border-white/10 hover:bg-white/10 transition-colors group">
                  <TableCell className="font-black text-white flex items-center gap-2 py-4">
                    <Building2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    {org.name}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-300 font-bold">{org.slug}</TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-400">{org.id}</TableCell>
                  <TableCell className="text-xs text-slate-200 font-medium">
                    {new Date(org.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1">Ativa</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-600">
                    Nenhum universo empresarial detectado. Use o semeador para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </main>
      
      <footer className="max-w-7xl mx-auto p-12 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Lumina Ecosystem Sovereign Control — v4.0 Alpha</p>
      </footer>
    </div>
  );
};
