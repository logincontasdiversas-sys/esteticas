import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useGlobalData } from "@/hooks/useGlobalData";
import { DollarSign, TrendingUp, Filter } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onBack?: () => void;
  onLogout?: () => void;
}

export const Dashboard = ({ onBack, onLogout }: DashboardProps = {}) => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();
  const { lancamentos: globalLancamentos, profissionais: globalProfissionais, fluxoCaixa: globalFluxoCaixa, loading: globalLoading } = useGlobalData();
  
  // Filtros
  const [tipoPeriodo, setTipoPeriodo] = useState<string>('hoje');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [profissionalFilter, setProfissionalFilter] = useState<string>("todos");
  const [formaFilter, setFormaFilter] = useState<string>("todas");
  const [registradoPorFiltro, setRegistradoPorFiltro] = useState<string>('todos');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
        inicio = primeiroDiaMesPassado.toISOString().split('T')[0];
        const ultimoDiaMesPassado = new Date(hojeMesPassado.getFullYear(), hojeMesPassado.getMonth(), 0);
        fim = ultimoDiaMesPassado.toISOString().split('T')[0];
        break;
      
      case 'vitalicio':
        inicio = '';
        fim = '';
        break;
      
      case 'personalizado':
        return { inicio: dataInicio, fim: dataFim };
      
      default:
        inicio = '';
        fim = '';
    }

    return { inicio, fim };
  };

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Filtrar lançamentos
  let lancamentosFiltrados = globalLancamentos;
  
  // Filtro por período
  const { inicio, fim } = calcularDatasPeriodo(tipoPeriodo);
  
  if (tipoPeriodo === 'personalizado') {
    if (dataInicio) {
      lancamentosFiltrados = lancamentosFiltrados.filter(l => l.data >= dataInicio);
    }
    if (dataFim) {
      lancamentosFiltrados = lancamentosFiltrados.filter(l => l.data <= dataFim);
    }
  } else {
    if (inicio) {
      lancamentosFiltrados = lancamentosFiltrados.filter(l => l.data >= inicio);
    }
    if (fim) {
      lancamentosFiltrados = lancamentosFiltrados.filter(l => l.data <= fim);
    }
  }
  
  if (profissionalFilter && profissionalFilter !== "todos") {
    lancamentosFiltrados = lancamentosFiltrados.filter(l => l.profissional === profissionalFilter);
  }
  
  if (formaFilter && formaFilter !== "todas") {
    lancamentosFiltrados = lancamentosFiltrados.filter(l => l.forma_pagamento === formaFilter);
  }

  if (registradoPorFiltro && registradoPorFiltro !== 'todos') {
    lancamentosFiltrados = lancamentosFiltrados.filter(l => l.perfil_registrado === registradoPorFiltro);
  }

  // Extrair todas as formas de pagamento únicas dos lançamentos filtrados
  const todasFormasPagamento = React.useMemo(() => {
    const formas = Array.from(new Set(lancamentosFiltrados.map(l => l.forma_pagamento).filter(Boolean)));
    // Ordenar para manter ordem consistente: PIX, Dinheiro, Cartão Débito, Cartão Crédito, depois outras
    const ordemPreferencial = ['PIX', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito'];
    return [
      ...ordemPreferencial.filter(f => formas.includes(f)),
      ...formas.filter(f => !ordemPreferencial.includes(f))
    ];
  }, [lancamentosFiltrados]);

  // Cálculos
  const totalLancamentos = lancamentosFiltrados.length;
  const totalFaturamento = lancamentosFiltrados.reduce((sum, l) => sum + l.valor_atendimento, 0);
  
  const repasseTotal = lancamentosFiltrados.reduce((sum, l) => sum + l.repasse_valor, 0);
  const valorEmpresaTotal = lancamentosFiltrados.reduce((sum, l) => {
    const valorEmpresaCorreto = l.valor_empresa > 0 ? l.valor_empresa : (l.valor_atendimento - l.repasse_valor);
    return sum + valorEmpresaCorreto;
  }, 0);

  const faturamentoLYB = repasseTotal;
  const faturamentoProfissionais = valorEmpresaTotal;

  // Saldo em caixa (do fluxo de caixa global)
  const saldoEmCaixa = globalFluxoCaixa?.saldo_atual || 0;

  // Resumo de Trocos
  const trocoTotal = lancamentosFiltrados.reduce((sum, l) => sum + (l.troco || 0), 0);
  const trocoPct = totalFaturamento > 0 ? (trocoTotal / totalFaturamento) * 100 : 0;
  const trocoCount = lancamentosFiltrados.filter(l => (l.troco || 0) > 0).length;
  const trocoThreshold = 5; // percentual padrão para alerta

  if (globalLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#FAFAFA] text-[#1A1F2C] p-6 border-b border-[#E5E7EB] shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">📊</span> Dashboard
            </h1>
            <p className="text-sm text-[#4B5563] font-medium">Visão geral do sistema</p>
          </div>
          <div className="flex gap-2">
            {onBack && (
              <Button variant="secondary" onClick={onBack}>
                ← Voltar
              </Button>
            )}
            {onLogout && (
              <Button variant="destructive" onClick={onLogout}>
                Sair
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Filtros</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                  <Select value={profissionalFilter} onValueChange={setProfissionalFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Profissionais</SelectItem>
                      {globalProfissionais.map(prof => (
                        <SelectItem key={prof.id} value={prof.nome}>
                          {prof.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select de Forma de Pagamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de Pagamento</label>
                  <Select value={formaFilter} onValueChange={setFormaFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Formas</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
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
                      {Array.from(new Set(globalLancamentos.map(l => l.perfil_registrado).filter(Boolean))).map(usuario => (
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
                  setProfissionalFilter('todos');
                  setFormaFilter('todas');
                  setRegistradoPorFiltro('todos');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Saldo em Caixa */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(saldoEmCaixa)}
              </div>
              </CardContent>
            </Card>

          {/* Faturamento */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalFaturamento)}
              </div>
              </CardContent>
            </Card>

          {/* Faturamento LYB */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento LYB</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(faturamentoLYB)}
              </div>
              </CardContent>
            </Card>

          {/* Faturamento Profissionais */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Profissionais</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(faturamentoProfissionais)}
          </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Análise */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza - Formas de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>💳 Distribuição por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              {lancamentosFiltrados.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum lançamento encontrado para o período selecionado
                </p>
              ) : (
                <>
                  {/* Gráfico de Pizza */}
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={todasFormasPagamento.map((forma, index) => {
                          const cores = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];
                          return {
                            name: forma,
                            value: lancamentosFiltrados
                              .filter(l => l.forma_pagamento === forma)
                              .reduce((sum, l) => sum + l.valor_atendimento, 0),
                            fill: cores[index % cores.length]
                          };
                        }).filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Cards com detalhes */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {todasFormasPagamento.map((forma) => {
                      const lancamentosForma = lancamentosFiltrados.filter(l => l.forma_pagamento === forma);
                      const totalForma = lancamentosForma.reduce((sum, l) => sum + l.valor_atendimento, 0);
                      const porcentagem = totalFaturamento > 0 ? ((totalForma / totalFaturamento) * 100).toFixed(1) : '0.0';
                      
                      if (totalForma === 0) return null;
                      
                      return (
                        <div key={forma} className="p-2 bg-muted/50 rounded-md">
                          <div className="text-xs font-medium">{forma}</div>
                          <div className="text-sm font-bold">{formatCurrency(totalForma)}</div>
                          <div className="text-xs text-muted-foreground">
                            {porcentagem}% • {lancamentosForma.length} {lancamentosForma.length === 1 ? 'lançamento' : 'lançamentos'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle>👩‍💼 Faturamento por Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              {lancamentosFiltrados.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum lançamento encontrado para o período selecionado
                </p>
              ) : (
                <>
                  {/* Gráfico de Barras */}
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Array.from(new Set(lancamentosFiltrados.map(l => l.profissional))).map(prof => {
                        const lancamentosProf = lancamentosFiltrados.filter(l => l.profissional === prof);
                        const total = lancamentosProf.reduce((sum, l) => sum + l.valor_atendimento, 0);
                        return {
                          nome: prof,
                          'Total': total,
                        };
                      })}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Bar dataKey="Total" fill="#3b82f6" barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Totais */}
                  <div className="mt-4 p-3 bg-muted/50 rounded-md">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Geral</div>
                        <div className="text-sm font-bold text-blue-600">{formatCurrency(totalFaturamento)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total Profissionais</div>
                        <div className="text-sm font-bold text-green-600">{formatCurrency(faturamentoProfissionais)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total LYB</div>
                        <div className="text-sm font-bold text-yellow-600">{formatCurrency(faturamentoLYB)}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Trocos */}
        <Card>
          <CardHeader>
            <CardTitle>💵 Resumo de Trocos</CardTitle>
          </CardHeader>
          <CardContent>
            {lancamentosFiltrados.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum lançamento no período selecionado
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Total em Trocos</div>
                  <div className="text-2xl font-bold text-purple-700">{formatCurrency(trocoTotal)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">% do Faturamento</div>
                  <div className={`text-2xl font-bold ${trocoPct > trocoThreshold ? 'text-red-600' : 'text-emerald-600'}`}>
                    {trocoPct.toFixed(2)}%
                  </div>
                  {trocoPct > trocoThreshold && (
                    <div className="text-xs text-red-600 mt-1">
                      Atenção: trocos acima de {trocoThreshold}% do faturamento
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Lançamentos com Troco</div>
                  <div className="text-2xl font-bold">{trocoCount}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};