import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGlobalData } from "@/hooks/useGlobalData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Filter, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { LancamentoForm } from "@/components/LancamentoForm";
import { LancamentoInput } from "@/types/Lancamento";

export const LancamentosList = () => {
  const auth = useAuth();
  const { user, organizationId } = auth;
  const { isAdmin } = auth;
  const { lancamentos: globalLancamentos, profissionais: globalProfissionais, loading: globalLoading, refreshData: refreshGlobalData } = useGlobalData();
  
  // Filtros
  const [tipoPeriodo, setTipoPeriodo] = useState<string>('hoje');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState<boolean>(false);
  const [profissionalFiltro, setProfissionalFiltro] = useState<string>('todos');
  const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState<string>('todas');
  const [registradoPorFiltro, setRegistradoPorFiltro] = useState<string>('todos');
  const [lancamentosOriginal, setLancamentosOriginal] = useState<any[]>([]);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<string[]>(['PIX', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito']);
  
  // Sincronizar dados globais com dados locais sempre que mudarem
  useEffect(() => {
    setLancamentos(globalLancamentos);
    setLancamentosOriginal(globalLancamentos);
    setProfissionais(globalProfissionais);
  }, [globalLancamentos, globalProfissionais]);
  
  // Ordenação
  const [colunaOrdenacao, setColunaOrdenacao] = useState<string | null>(null);
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('asc');
  
  // Modal de edição
  const [editingLancamento, setEditingLancamento] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  
  // Modal de exclusão
  const [deletingLancamento, setDeletingLancamento] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modal de criação
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Tabs por profissional
  const [tabAtiva, setTabAtiva] = useState<string>('todos');
  

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    // Se a data vem no formato YYYY-MM-DD, extrair diretamente sem conversão de timezone
    if (dateString && dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [year, month, day] = dateString.split('-');
      // Criar data local (não UTC) para evitar problemas de timezone
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('pt-BR');
    }
    // Fallback para outros formatos
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  // Verificar se usuário pode editar o lançamento
  const podeEditar = (lancamento: any) => {
    if (isAdmin) return true; // Admin pode editar qualquer lançamento
    return lancamento.user_id === user?.id; // Usuário só pode editar próprios lançamentos
  };

  // Função auxiliar para renderizar indicador de ordenação
  const renderSortIndicator = (coluna: string) => {
    if (colunaOrdenacao !== coluna) return null;
    return direcaoOrdenacao === 'asc' 
      ? <ArrowUp className="h-3 w-3 inline-block ml-1" />
      : <ArrowDown className="h-3 w-3 inline-block ml-1" />;
  };

  // Função para ordenar por coluna (alterna entre asc/desc)
  const ordenarPorColuna = (coluna: string) => {
    // Se clicar na mesma coluna, inverte a direção
    const novaDirecao = colunaOrdenacao === coluna && direcaoOrdenacao === 'asc' ? 'desc' : 'asc';
    
    setColunaOrdenacao(coluna);
    setDirecaoOrdenacao(novaDirecao);
    
    const lancamentosOrdenados = [...lancamentos].sort((a, b) => {
      let valorA, valorB;
      
      switch(coluna) {
        case 'data':
          valorA = new Date(a.data).getTime();
          valorB = new Date(b.data).getTime();
          break;
        case 'descricao':
          valorA = (a.descricao || '').toLowerCase();
          valorB = (b.descricao || '').toLowerCase();
          break;
        case 'profissional':
          valorA = (a.profissional || '').toLowerCase();
          valorB = (b.profissional || '').toLowerCase();
          break;
        case 'valor_atendimento':
          valorA = a.valor_atendimento || 0;
          valorB = b.valor_atendimento || 0;
          break;
        case 'forma_pagamento':
          valorA = (a.forma_pagamento || '').toLowerCase();
          valorB = (b.forma_pagamento || '').toLowerCase();
          break;
        case 'valor_pago':
          valorA = a.valor_pago || 0;
          valorB = b.valor_pago || 0;
          break;
        case 'troco':
          valorA = a.troco || 0;
          valorB = b.troco || 0;
          break;
        case 'repasse_valor':
          valorA = a.repasse_valor || 0;
          valorB = b.repasse_valor || 0;
          break;
        case 'valor_empresa':
          valorA = a.valor_empresa || 0;
          valorB = b.valor_empresa || 0;
          break;
        case 'perfil_registrado':
          valorA = (a.perfil_registrado || '').toLowerCase();
          valorB = (b.perfil_registrado || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      let resultado;
      if (typeof valorA === 'string') {
        resultado = valorA.localeCompare(valorB);
      } else {
        resultado = valorA - valorB;
      }
      
      // Inverter se for descendente
      return novaDirecao === 'desc' ? -resultado : resultado;
    });
    
    setLancamentos(lancamentosOrdenados);
  };

  // Calcular datas com base no período selecionado
  const calcularDatasPeriodo = (periodo: string) => {
    let inicio: string = '';
    let fim: string = '';

    switch (periodo) {
      case 'hoje':
        const hojeHoje = new Date().toISOString().split('T')[0];
        inicio = hojeHoje;
        fim = hojeHoje;
        break;
      
      case 'ontem':
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        inicio = ontem.toISOString().split('T')[0];
        fim = inicio;
        break;
      
      case 'semana-atual':
        const domingo = new Date();
        domingo.setDate(domingo.getDate() - domingo.getDay());
        inicio = domingo.toISOString().split('T')[0];
        fim = new Date().toISOString().split('T')[0];
        break;
      
      case 'semana-passada':
        const domingoPassado = new Date();
        domingoPassado.setDate(domingoPassado.getDate() - domingoPassado.getDay() - 7);
        inicio = domingoPassado.toISOString().split('T')[0];
        const sabadoPassado = new Date(domingoPassado);
        sabadoPassado.setDate(sabadoPassado.getDate() + 6);
        fim = sabadoPassado.toISOString().split('T')[0];
        break;
      
      case 'mes-atual':
        const hojeMesAtual = new Date();
        const primeiroDiaMes = new Date(hojeMesAtual.getFullYear(), hojeMesAtual.getMonth(), 1);
        const ultimoDiaMes = new Date(hojeMesAtual.getFullYear(), hojeMesAtual.getMonth() + 1, 0);
        inicio = primeiroDiaMes.toISOString().split('T')[0];
        fim = ultimoDiaMes.toISOString().split('T')[0];
        break;
      
      case 'mes-passado':
        const hojeMesPassado = new Date();
        const primeiroDiaMesPassado = new Date(hojeMesPassado.getFullYear(), hojeMesPassado.getMonth() - 1, 1);
        const ultimoDiaMesPassado = new Date(hojeMesPassado.getFullYear(), hojeMesPassado.getMonth(), 0);
        inicio = primeiroDiaMesPassado.toISOString().split('T')[0];
        fim = ultimoDiaMesPassado.toISOString().split('T')[0];
        break;
      
      case 'vitalicio':
        inicio = '';
        fim = '';
        break;
      
      case 'personalizado':
        return { inicio: dataInicio, fim: dataFim, mostrarPersonalizado: true };
      
      default:
        inicio = '';
        fim = '';
    }

    return { inicio, fim, mostrarPersonalizado: periodo === 'personalizado' };
  };

  // Filtrar lançamentos
  const aplicarFiltros = () => {
    let lancamentosFiltrados = [...lancamentosOriginal];

    const { inicio, fim, mostrarPersonalizado: mostrar } = calcularDatasPeriodo(tipoPeriodo);
    
    if (mostrar) {
      // Usar datas do personalizado
      if (dataInicio) {
        lancamentosFiltrados = lancamentosFiltrados.filter(l => l.data >= dataInicio);
      }
      if (dataFim) {
        lancamentosFiltrados = lancamentosFiltrados.filter(l => l.data <= dataFim);
      }
    } else {
      // Usar datas calculadas
      if (inicio) {
        lancamentosFiltrados = lancamentosFiltrados.filter(l => l.data >= inicio);
      }
      if (fim) {
        lancamentosFiltrados = lancamentosFiltrados.filter(l => l.data <= fim);
      }
    }

    if (profissionalFiltro && profissionalFiltro !== 'todos') {
      lancamentosFiltrados = lancamentosFiltrados.filter(
        l => l.profissional === profissionalFiltro
      );
    }

    if (formaPagamentoFiltro && formaPagamentoFiltro !== 'todas') {
      lancamentosFiltrados = lancamentosFiltrados.filter(
        l => l.forma_pagamento === formaPagamentoFiltro
      );
    }

    if (registradoPorFiltro && registradoPorFiltro !== 'todos') {
      lancamentosFiltrados = lancamentosFiltrados.filter(
        l => l.perfil_registrado === registradoPorFiltro
      );
    }

    setLancamentos(lancamentosFiltrados);
  };

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (lancamentosOriginal.length > 0) {
      aplicarFiltros();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicio, dataFim, profissionalFiltro, formaPagamentoFiltro, registradoPorFiltro, tipoPeriodo, lancamentosOriginal]);

  // Função para abrir modal de edição
  const handleEdit = (lancamento: any) => {
    setEditingLancamento(lancamento);
    setEditFormData({
      data: lancamento.data,
      descricao: lancamento.descricao || '',
      profissional: lancamento.profissional,
      valor_atendimento: lancamento.valor_atendimento,
      valor_pago: lancamento.valor_pago,
      forma_pagamento: lancamento.forma_pagamento,
      repasse_pct: lancamento.repasse_pct,
    });
    setIsEditDialogOpen(true);
  };

  // Função para salvar edição
  const handleSaveEdit = async () => {
    if (!editingLancamento || saving) return;

    try {
      setSaving(true);
      
      // Buscar percentual de repasse do profissional selecionado
      const profissionalSelecionado = profissionais.find(p => p.nome === editFormData.profissional);
      const repassePct = profissionalSelecionado?.repasse_pct || editFormData.repasse_pct || 50;
      
      // Calcular troco, repasse e valor empresa
      const troco = (editFormData.valor_pago || 0) - (editFormData.valor_atendimento || 0);
      const repasseValor = ((editFormData.valor_atendimento || 0) * repassePct) / 100;
      const valorEmpresa = (editFormData.valor_atendimento || 0) - repasseValor;

      const { error } = await supabase
        .from('lancamentos')
        .update({
          data: editFormData.data,
          descricao: editFormData.descricao || null,
          profissional: editFormData.profissional,
          valor_atendimento: editFormData.valor_atendimento,
          valor_pago: editFormData.valor_pago,
          troco: troco >= 0 ? troco : 0,
          forma_pagamento: editFormData.forma_pagamento,
          repasse_pct: repassePct,
          repasse_valor: repasseValor,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingLancamento.id)
        .eq('organization_id', organizationId);

    if (error) {
        console.error("[LANCAMENTOS] Erro ao atualizar:", error);
        toast.error("Erro ao atualizar lançamento");
    } else {
        toast.success("Lançamento atualizado com sucesso!");
        setIsEditDialogOpen(false);
        setEditingLancamento(null);
        await refreshGlobalData(true); // Recarregar dados globais (sem fluxo de caixa)
      }
    } catch (error) {
      console.error("[LANCAMENTOS] Erro:", error);
      toast.error("Erro ao atualizar lançamento");
    } finally {
      setSaving(false);
    }
  };

  // Função para abrir modal de exclusão
  const handleDelete = (lancamento: any) => {
    setDeletingLancamento(lancamento);
    setConfirmingDelete(false);
    setIsDeleteDialogOpen(true);
  };

  // Função para confirmar exclusão (dupla confirmação)
  const handleDeleteConfirm = async () => {
    if (!deletingLancamento || isDeleting) return;

    // Primeira confirmação: mostrar botão de confirmação
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    // Segunda confirmação: executar exclusão
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('lancamentos')
        .delete()
        .eq('id', deletingLancamento.id)
        .eq('organization_id', organizationId);

      if (error) {
        console.error("[LANCAMENTOS] Erro ao excluir:", error);
        toast.error("Erro ao excluir lançamento");
      } else {
        toast.success("Lançamento excluído com sucesso!");
        setIsDeleteDialogOpen(false);
        setDeletingLancamento(null);
        setConfirmingDelete(false);
        await refreshGlobalData(true); // Recarregar dados globais (sem fluxo de caixa)
      }
    } catch (error) {
      console.error("[LANCAMENTOS] Erro:", error);
      toast.error("Erro ao excluir lançamento");
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para criar novo lançamento
  const handleCreateLancamento = async (formData: LancamentoInput) => {
    try {
      // Buscar o profissional para obter o percentual de repasse
      const { data: profissionaisData } = await supabase
        .from('profissionais')
        .select('repasse_pct')
        .eq('organization_id', organizationId)
        .eq('nome', formData.profissional)
        .eq('ativo', true)
        .single();

      const repassePct = profissionaisData?.repasse_pct || formData.repasse_pct || 50;
      const repasseValor = (formData.valor_atendimento * repassePct) / 100;
      const valorEmpresa = formData.valor_atendimento - repasseValor;
      const troco = formData.valor_pago - formData.valor_atendimento;

      // Buscar o perfil do usuário atual
      const { data: profileData } = await supabase
        .from('profiles')
        .select('perfil')
        .eq('id', user?.id)
        .single();

      const perfilRegistrado = profileData?.perfil || 'usuario';

      const { error } = await supabase
        .from('lancamentos')
        .insert({
          data: formData.data,
          descricao: formData.descricao || null,
          profissional: formData.profissional,
          valor_atendimento: formData.valor_atendimento,
          valor_pago: formData.valor_pago,
          troco: troco >= 0 ? troco : 0,
          forma_pagamento: formData.forma_pagamento,
          repasse_pct: repassePct,
          repasse_valor: repasseValor,
          valor_empresa: valorEmpresa,
          user_id: user?.id,
          organization_id: organizationId,
          perfil_registrado: perfilRegistrado,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error("[LANCAMENTOS] Erro ao criar lançamento:", error);
        toast.error("Erro ao criar lançamento");
      } else {
        toast.success("Lançamento criado com sucesso!");
        setIsCreateDialogOpen(false);
        await refreshGlobalData(true); // Recarregar dados globais (sem fluxo de caixa)
      }
    } catch (error) {
      console.error("[LANCAMENTOS] Erro:", error);
      toast.error("Erro ao criar lançamento");
    }
  };


  if (globalLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando lançamentos...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center mb-4">
              <span>📋 Lançamentos</span>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
                    </Button>
            </CardTitle>
            
            {/* Filtros */}
    <div className="space-y-4">
              {/* Título dos Filtros */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Filtros</h3>
        </div>

              {/* Filtros lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Select de Período */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <Select value={tipoPeriodo} onValueChange={setTipoPeriodo}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                      <SelectItem value="semana-atual">Semana Atual</SelectItem>
                      <SelectItem value="semana-passada">Semana Passada</SelectItem>
                      <SelectItem value="mes-atual">Mês Atual</SelectItem>
                      <SelectItem value="mes-passado">Mês Passado</SelectItem>
                <SelectItem value="vitalicio">Vitalício</SelectItem>
                <SelectItem value="personalizado">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

                {/* Select de Profissional */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profissional</label>
                  <Select value={profissionalFiltro} onValueChange={setProfissionalFiltro}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Profissionais</SelectItem>
                      {Array.from(new Set(lancamentosOriginal.map(l => l.profissional))).map(prof => (
                        <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select de Forma de Pagamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de Pagamento</label>
                  <Select value={formaPagamentoFiltro} onValueChange={setFormaPagamentoFiltro}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
              </SelectTrigger>
              <SelectContent>
                      <SelectItem value="todas">Todas as Formas</SelectItem>
                      {Array.from(new Set(lancamentosOriginal.map(l => l.forma_pagamento))).map(forma => (
                        <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
              {/* Filtro Registrado Por - apenas para admins */}
              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registrado Por</label>
                  <Select value={registradoPorFiltro} onValueChange={setRegistradoPorFiltro}>
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Usuários</SelectItem>
                      {Array.from(new Set(lancamentosOriginal.map(l => l.perfil_registrado).filter(Boolean))).map(usuario => (
                        <SelectItem key={usuario} value={usuario}>{usuario}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
        
              {/* Mostrar campos personalizados se selecionado */}
              {tipoPeriodo === 'personalizado' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Início</label>
                    <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
              />
            </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Fim</label>
                    <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        )}
        
              {/* Botão Limpar Filtros */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setTipoPeriodo('hoje');
                  setDataInicio('');
                  setDataFim('');
                  setProfissionalFiltro('todos');
                  setFormaPagamentoFiltro('todas');
                  setRegistradoPorFiltro('todos');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lancamentos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum lançamento encontrado</p>
        </div>
            ) : (
              <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="space-y-4">
                {/* Tabs por profissional */}
                <TabsList className="w-full flex-wrap h-auto justify-start">
                  <TabsTrigger value="todos">
                    Todos ({lancamentos.length})
                  </TabsTrigger>
                  {Array.from(new Set(lancamentosOriginal.map(l => l.profissional))).sort().map(prof => {
                    const qtd = lancamentos.filter(l => l.profissional === prof).length;
                    return (
                      <TabsTrigger key={prof} value={prof}>
                        {prof} ({qtd})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* Tab "Todos" */}
                <TabsContent value="todos" className="mt-4">
                  <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th 
                        className="text-left p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('data')}
                      >
                        Data {renderSortIndicator('data')}
                      </th>
                      <th 
                        className="text-left p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('descricao')}
                      >
                        <span className="block">Descrição {renderSortIndicator('descricao')}</span>
                      </th>
                      <th 
                        className="text-left p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('profissional')}
                      >
                        <span className="block">Profissional {renderSortIndicator('profissional')}</span>
                      </th>
                      <th 
                        className="text-right p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('valor_atendimento')}
                      >
                        <span className="block">Valor</span>
                        <span className="block">Atendimento {renderSortIndicator('valor_atendimento')}</span>
                      </th>
                      <th 
                        className="text-left p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('forma_pagamento')}
                      >
                        <span className="block">Forma</span>
                        <span className="block">Pagamento {renderSortIndicator('forma_pagamento')}</span>
                      </th>
                      <th 
                        className="text-right p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('valor_pago')}
                      >
                        <span className="block">Pagamento</span>
                        <span className="block">Efetuado {renderSortIndicator('valor_pago')}</span>
                      </th>
                      <th 
                        className="text-right p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('troco')}
                      >
                        Troco {renderSortIndicator('troco')}
                      </th>
                      <th 
                        className="p-3 text-sm font-semibold leading-tight text-right cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('repasse_valor')}
                      >
                        <span className="block">Repasse</span>
                        <span className="block">LYB {renderSortIndicator('repasse_valor')}</span>
                      </th>
                      <th 
                        className="p-3 text-sm font-semibold leading-tight text-right cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('valor_empresa')}
                      >
                        <span className="block">Valor Líquido</span>
                        <span className="block">Profissional {renderSortIndicator('valor_empresa')}</span>
                      </th>
                      <th 
                        className="p-3 text-sm font-semibold leading-tight text-left cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => ordenarPorColuna('perfil_registrado')}
                      >
                        <span className="block">Registrado</span>
                        <span className="block">Por {renderSortIndicator('perfil_registrado')}</span>
                      </th>
                      <th className="text-center p-3 text-sm font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamentos.map((lancamento) => (
                      <tr key={lancamento.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-3 py-1.5 text-sm align-top">{formatDate(lancamento.data)}</td>
                        <td className="px-3 py-1.5 text-sm text-muted-foreground italic align-top">{lancamento.descricao || '-'}</td>
                        <td className="px-3 py-1.5 text-sm font-medium align-top">{lancamento.profissional}</td>
                        <td className="px-3 py-1.5 text-sm text-right font-semibold text-blue-600 align-top">
                          {formatCurrency(lancamento.valor_atendimento)}
                        </td>
                        <td className="px-3 py-1.5 text-sm align-top">{lancamento.forma_pagamento}</td>
                        <td className="px-3 py-1.5 text-sm text-right font-semibold text-purple-600 align-top">
                          {formatCurrency(lancamento.valor_pago || 0)}
                        </td>
                        <td className="px-3 py-1.5 text-sm text-right font-medium text-orange-600 align-top">
                          {formatCurrency(lancamento.troco || 0)}
                        </td>
                        <td className="px-3 py-1.5 text-sm text-right font-medium text-yellow-600 align-top">
                          {formatCurrency(lancamento.repasse_valor || 0)}
                        </td>
                        <td className="px-3 py-1.5 text-sm text-right text-green-600 align-top">
                          {formatCurrency(lancamento.valor_empresa)} ({lancamento.repasse_pct}%)
                        </td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground align-top">{lancamento.perfil_registrado || 'Sistema'}</td>
                        <td className="px-3 py-1.5 text-center">
                          {podeEditar(lancamento) && (
                            <div className="flex gap-2 justify-center">
                              <Button variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(lancamento)}>
                                ✏️
                              </Button>
                              <Button variant="ghost" size="sm" title="Excluir" onClick={() => handleDelete(lancamento)}>
                                🗑️
                              </Button>
                            </div>
                          )}
                          {!podeEditar(lancamento) && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Linha de Totais */}
                  <tfoot>
                    <tr className="border-t-2 border-primary font-semibold bg-muted/30">
                      <td className="px-3 py-1.5 text-sm font-bold align-top" colSpan={3}>
                        TOTAIS
                      </td>
                      <td className="px-3 py-1.5 text-sm text-right font-bold text-blue-600 align-top">
                        {formatCurrency(lancamentos.reduce((sum, l) => sum + (l.valor_atendimento || 0), 0))}
                      </td>
                      <td className="px-3 py-1.5 text-sm text-left align-top">
                        -
                      </td>
                      <td className="px-3 py-1.5 text-sm text-right font-bold text-purple-600 align-top">
                        {formatCurrency(lancamentos.reduce((sum, l) => sum + (l.valor_pago || 0), 0))}
                      </td>
                      <td className="px-3 py-1.5 text-sm text-right font-bold text-orange-600 align-top">
                        {formatCurrency(lancamentos.reduce((sum, l) => sum + (l.troco || 0), 0))}
                      </td>
                      <td className="px-3 py-1.5 text-sm text-right font-bold text-yellow-600 align-top">
                        {formatCurrency(lancamentos.reduce((sum, l) => sum + (l.repasse_valor || 0), 0))}
                      </td>
                      <td className="px-3 py-1.5 text-sm text-right font-bold text-green-600 align-top">
                        {formatCurrency(lancamentos.reduce((sum, l) => sum + (l.valor_empresa || 0), 0))}
                      </td>
                      <td className="px-3 py-1.5 text-xs text-left text-muted-foreground align-top">-</td>
                      <td className="px-3 py-1.5 text-center align-top">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
                </TabsContent>

                {/* Tabs individuais por profissional */}
                {Array.from(new Set(lancamentosOriginal.map(l => l.profissional))).sort().map(prof => {
                  const lancamentosProfissional = lancamentos.filter(l => l.profissional === prof);
                  
                  if (lancamentosProfissional.length === 0) return null;
                  
                  return (
                    <TabsContent key={prof} value={prof} className="mt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => ordenarPorColuna('data')}>
                                Data {renderSortIndicator('data')}
                              </th>
                              <th className="text-left p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => ordenarPorColuna('descricao')}>
                                Descrição {renderSortIndicator('descricao')}
                              </th>
                              <th className="text-right p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => ordenarPorColuna('valor_atendimento')}>
                                <span className="block">Valor</span>
                                <span className="block">Atendimento {renderSortIndicator('valor_atendimento')}</span>
                              </th>
                              <th className="text-left p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => ordenarPorColuna('forma_pagamento')}>
                                <span className="block">Forma</span>
                                <span className="block">Pagamento {renderSortIndicator('forma_pagamento')}</span>
                              </th>
                              <th className="text-right p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => ordenarPorColuna('valor_pago')}>
                                <span className="block">Pagamento</span>
                                <span className="block">Efetuado {renderSortIndicator('valor_pago')}</span>
                              </th>
                              <th className="text-right p-3 text-sm font-semibold leading-tight cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => ordenarPorColuna('troco')}>
                                Troco {renderSortIndicator('troco')}
                              </th>
                              <th className="p-3 text-sm font-semibold leading-tight text-right cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => ordenarPorColuna('repasse_valor')}>
                                <span className="block">Valor Líquido</span>
                                <span className="block">Profissional {renderSortIndicator('repasse_valor')}</span>
                              </th>
                              <th className="p-3 text-sm font-semibold leading-tight text-right cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => ordenarPorColuna('valor_empresa')}>
                                <span className="block">Repasse</span>
                                <span className="block">LYB {renderSortIndicator('valor_empresa')}</span>
                              </th>
                              <th className="p-3 text-sm font-semibold leading-tight text-left cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => ordenarPorColuna('perfil_registrado')}>
                                <span className="block">Registrado</span>
                                <span className="block">Por {renderSortIndicator('perfil_registrado')}</span>
                              </th>
                              <th className="text-center p-3 text-sm font-semibold">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lancamentosProfissional.map((lancamento) => (
                              <tr key={lancamento.id} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="px-3 py-1.5 text-sm align-top">{formatDate(lancamento.data)}</td>
                                <td className="px-3 py-1.5 text-sm text-muted-foreground italic align-top">{lancamento.descricao || '-'}</td>
                                <td className="px-3 py-1.5 text-sm text-right font-semibold text-blue-600 align-top">
                                  {formatCurrency(lancamento.valor_atendimento)}
                                </td>
                                <td className="px-3 py-1.5 text-sm align-top">{lancamento.forma_pagamento}</td>
                                <td className="px-3 py-1.5 text-sm text-right font-semibold text-purple-600 align-top">
                                  {formatCurrency(lancamento.valor_pago || 0)}
                                </td>
                                <td className="px-3 py-1.5 text-sm text-right font-medium text-orange-600 align-top">
                                  {formatCurrency(lancamento.troco || 0)}
                                </td>
                                <td className="px-3 py-1.5 text-sm text-right font-medium text-yellow-600 align-top">
                                  {formatCurrency(lancamento.repasse_valor || 0)}
                                </td>
                                <td className="px-3 py-1.5 text-sm text-right text-green-600 align-top">
                                  {formatCurrency(lancamento.valor_empresa)} ({lancamento.repasse_pct}%)
                                </td>
                                <td className="px-3 py-1.5 text-xs text-muted-foreground align-top">{lancamento.perfil_registrado || 'Sistema'}</td>
                                <td className="px-3 py-1.5 text-center">
                                  {podeEditar(lancamento) && (
                                    <div className="flex gap-2 justify-center">
                                      <Button variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(lancamento)}>
                                        ✏️
                                      </Button>
                                      <Button variant="ghost" size="sm" title="Excluir" onClick={() => handleDelete(lancamento)}>
                                        🗑️
                                      </Button>
                                    </div>
                                  )}
                                  {!podeEditar(lancamento) && (
                                    <span className="text-xs text-muted-foreground">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          {/* Linha de Totais */}
                          <tfoot>
                            <tr className="border-t-2 border-primary font-semibold bg-muted/30">
                              <td className="px-3 py-1.5 text-sm font-bold align-top" colSpan={2}>
                                TOTAIS - {prof}
                              </td>
                              <td className="px-3 py-1.5 text-sm text-right font-bold text-blue-600 align-top">
                                {formatCurrency(lancamentosProfissional.reduce((sum, l) => sum + (l.valor_atendimento || 0), 0))}
                              </td>
                              <td className="px-3 py-1.5 text-sm text-left align-top">-</td>
                              <td className="px-3 py-1.5 text-sm text-right font-bold text-purple-600 align-top">
                                {formatCurrency(lancamentosProfissional.reduce((sum, l) => sum + (l.valor_pago || 0), 0))}
                              </td>
                              <td className="px-3 py-1.5 text-sm text-right font-bold text-orange-600 align-top">
                                {formatCurrency(lancamentosProfissional.reduce((sum, l) => sum + (l.troco || 0), 0))}
                              </td>
                              <td className="px-3 py-1.5 text-sm text-right font-bold text-yellow-600 align-top">
                                {formatCurrency(lancamentosProfissional.reduce((sum, l) => sum + (l.repasse_valor || 0), 0))}
                              </td>
                              <td className="px-3 py-1.5 text-sm text-right font-bold text-green-600 align-top">
                                {formatCurrency(lancamentosProfissional.reduce((sum, l) => sum + (l.valor_empresa || 0), 0))}
                              </td>
                              <td className="px-3 py-1.5 text-xs text-left text-muted-foreground align-top">-</td>
                              <td className="px-3 py-1.5 text-center align-top">-</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </CardContent>
          </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lançamento</DialogTitle>
            <DialogDescription>
              Atualize os dados do lançamento. Os cálculos serão feitos automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-data">Data</Label>
                <Input
                  id="edit-data"
                  type="date"
                  value={editFormData.data || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, data: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-profissional">Profissional</Label>
                <Select
                  value={editFormData.profissional || ''}
                  onValueChange={(value) => {
                    const prof = profissionais.find(p => p.nome === value);
                    setEditFormData({ 
                      ...editFormData, 
                      profissional: value,
                      repasse_pct: prof?.repasse_pct || editFormData.repasse_pct
                    });
                  }}
                >
                  <SelectTrigger id="edit-profissional">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map(prof => (
                      <SelectItem key={prof.id} value={prof.nome}>
                        {prof.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Input
                id="edit-descricao"
                value={editFormData.descricao || ''}
                onChange={(e) => setEditFormData({ ...editFormData, descricao: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-valor-atendimento">Valor do Atendimento</Label>
                <Input
                  id="edit-valor-atendimento"
                  type="number"
                  step="0.01"
                  value={editFormData.valor_atendimento || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, valor_atendimento: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-valor-pago">Valor Pago</Label>
                <Input
                  id="edit-valor-pago"
                  type="number"
                  step="0.01"
                  value={editFormData.valor_pago || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, valor_pago: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-forma-pagamento">Forma de Pagamento</Label>
                <Select
                  value={editFormData.forma_pagamento || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, forma_pagamento: value })}
                >
                  <SelectTrigger id="edit-forma-pagamento">
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map(forma => (
                      <SelectItem key={forma} value={forma}>
                        {forma}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-repasse-pct">% Repasse</Label>
                <Input
                  id="edit-repasse-pct"
                  type="number"
                  step="0.01"
                  value={editFormData.repasse_pct || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, repasse_pct: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Mostrar cálculos automáticos */}
            {editFormData.valor_atendimento && editFormData.valor_pago && editFormData.repasse_pct && (
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Troco:</span>
                  <span className="font-semibold">
                    {formatCurrency((editFormData.valor_pago || 0) - (editFormData.valor_atendimento || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Repasse Profissional ({editFormData.repasse_pct}%):</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(((editFormData.valor_atendimento || 0) * (editFormData.repasse_pct || 0)) / 100)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor Empresa:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency((editFormData.valor_atendimento || 0) - (((editFormData.valor_atendimento || 0) * (editFormData.repasse_pct || 0)) / 100))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              {confirmingDelete 
                ? "⚠️ Última confirmação: Esta ação não pode ser desfeita. Clique novamente para excluir definitivamente."
                : "Esta ação não pode ser desfeita. Clique em 'Confirmar Exclusão' para continuar."
              }
            </DialogDescription>
          </DialogHeader>
          
          {deletingLancamento && (
            <div className="space-y-3 py-4">
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Data:</span>
                  <span>{formatDate(deletingLancamento.data)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Profissional:</span>
                  <span>{deletingLancamento.profissional}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Valor do Atendimento:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(deletingLancamento.valor_atendimento)}</span>
                </div>
                {deletingLancamento.descricao && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Descrição:</span>
                    <span className="text-muted-foreground italic">{deletingLancamento.descricao}</span>
                  </div>
                )}
              </div>
              
              {!isAdmin && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Você só pode excluir seus próprios lançamentos.
                </div>
              )}
              
              {isAdmin && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ Como administrador, você pode excluir qualquer lançamento.
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConfirmingDelete(false);
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            {!confirmingDelete ? (
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                Confirmar Exclusão
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  'Sim, Excluir Definitivamente'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Lançamento</DialogTitle>
            <DialogDescription>Preencha os campos para registrar um novo lançamento.</DialogDescription>
          </DialogHeader>

          <LancamentoForm
            onSubmit={(dados) => handleCreateLancamento(dados)}
            onCancel={() => setIsCreateDialogOpen(false)}
          />

        </DialogContent>
      </Dialog>
    </div>
  );
};
