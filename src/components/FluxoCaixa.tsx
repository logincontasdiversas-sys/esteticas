import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { saldoInicialService, FluxoCaixa as FluxoCaixaType } from "@/services/saldoInicialService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Wallet,
  Filter,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const FluxoCaixa = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixaType | null>(null);
  const [movimentacoesDiarias, setMovimentacoesDiarias] = useState<any[]>([]);
  const [aportesRegistrados, setAportesRegistrados] = useState<any[]>([]);
  
  // Filtros
  const [tipoPeriodo, setTipoPeriodo] = useState<string>('mes-atual');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  
  // Modal de aporte
  const [aporteAberto, setAporteAberto] = useState(false);
  const [aporteData, setAporteData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [aporteValor, setAporteValor] = useState<string>('');
  const [aporteDescricao, setAporteDescricao] = useState<string>('');
  const [aporteFormaPagamento, setAporteFormaPagamento] = useState<string>('Dinheiro');
  
  // Modal de revisar aportes
  const [aportesModalAberto, setAportesModalAberto] = useState(false);
  
  // Modal de editar aporte
  const [editarAporteAberto, setEditarAporteAberto] = useState(false);
  const [aporteEditando, setAporteEditando] = useState<any>(null);
  
  // Modal de excluir aporte
  const [excluirAporteAberto, setExcluirAporteAberto] = useState(false);
  const [aporteExcluindo, setAporteExcluindo] = useState<any>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Calcular datas do período
  const calcularDatasPeriodo = () => {
    const hoje = new Date();
    let inicio: string = '';
    let fim: string = new Date().toISOString().split('T')[0];

    switch (tipoPeriodo) {
      case 'mes-atual':
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        inicio = primeiroDiaMes.toISOString().split('T')[0];
        break;
      case 'mes-selecionado':
        const primeiroDiaSelecionado = new Date(anoSelecionado, mesSelecionado - 1, 1);
        const ultimoDiaSelecionado = new Date(anoSelecionado, mesSelecionado, 0);
        inicio = primeiroDiaSelecionado.toISOString().split('T')[0];
        fim = ultimoDiaSelecionado.toISOString().split('T')[0];
        break;
      case 'personalizado':
        inicio = dataInicio;
        fim = dataFim;
        break;
      default:
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    }

    return { inicio, fim };
  };

  // Buscar fluxo de caixa
  const fetchFluxoCaixa = async () => {
    try {
      setLoading(true);
      
      const { inicio, fim } = calcularDatasPeriodo();
      
      let fluxo: FluxoCaixaType | null = null;
      
      if (tipoPeriodo === 'mes-selecionado') {
        fluxo = await saldoInicialService.getFluxoCaixa(mesSelecionado, anoSelecionado);
      } else if (tipoPeriodo === 'personalizado' && inicio && fim) {
        fluxo = await saldoInicialService.getFluxoCaixaPorPeriodo(undefined, undefined, inicio, fim);
      } else {
        const hoje = new Date();
        fluxo = await saldoInicialService.getFluxoCaixa(hoje.getMonth() + 1, hoje.getFullYear());
      }
      
      setFluxoCaixa(fluxo);
      
      // Buscar movimentações diárias
      await fetchMovimentacoesDiarias(inicio, fim);
      
      // Buscar aportes registrados
      await fetchAportesRegistrados();
      
    } catch (error: any) {
      console.error("[FLUXO] Erro ao buscar fluxo de caixa:", error);
      toast.error("Erro ao carregar fluxo de caixa");
    } finally {
      setLoading(false);
    }
  };

  // Buscar aportes registrados
  const fetchAportesRegistrados = async () => {
    try {
      const { inicio, fim } = calcularDatasPeriodo();
      const { data, error } = await supabase
        .from('aportes_caixa')
        .select('*')
        .gte('data', inicio)
        .lte('data', fim)
        .order('data', { ascending: false });

      if (error) {
        console.error("[FLUXO] Erro ao buscar aportes:", error);
        return;
      }

      setAportesRegistrados(data || []);
    } catch (error) {
      console.error("[FLUXO] Erro ao buscar aportes:", error);
    }
  };

  // Buscar movimentações diárias
  const fetchMovimentacoesDiarias = async (dataInicio: string, dataFim: string) => {
    try {
      const { data: lancamentos, error: lancError } = await supabase
        .from('lancamentos')
        .select('data, repasse_valor, troco')
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('data', { ascending: true });

      const { data: aportes, error: aportesError } = await supabase
        .from('aportes_caixa')
        .select('data, valor')
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('data', { ascending: true });

      if (lancError) {
        console.error("[FLUXO] Erro ao buscar lançamentos:", lancError);
      }
      if (aportesError) {
        console.error("[FLUXO] Erro ao buscar aportes:", aportesError);
      }

      // Agrupar por data
      const movimentacoesPorData = new Map<string, { entradas: number; saidas: number }>();

      lancamentos?.forEach(lanc => {
        const data = lanc.data;
        if (!movimentacoesPorData.has(data)) {
          movimentacoesPorData.set(data, { entradas: 0, saidas: 0 });
        }
        const mov = movimentacoesPorData.get(data)!;
        mov.entradas += lanc.repasse_valor || 0; // Entrada: repasse para LYB
        mov.saidas += lanc.troco || 0; // Saída: troco devolvido
      });

      // Adicionar aportes (positivos = entrada, negativos = saída)
      aportes?.forEach(aporte => {
        const data = aporte.data;
        if (!movimentacoesPorData.has(data)) {
          movimentacoesPorData.set(data, { entradas: 0, saidas: 0 });
        }
        const mov = movimentacoesPorData.get(data)!;
        if (aporte.valor >= 0) {
          mov.entradas += aporte.valor || 0;
        } else {
          mov.saidas += Math.abs(aporte.valor || 0);
        }
      });

      // Converter para array e ordenar
      const movimentacoes = Array.from(movimentacoesPorData.entries())
        .map(([data, valores]) => ({
          data,
          ...valores,
          saldoDia: valores.entradas - valores.saidas
        }))
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      setMovimentacoesDiarias(movimentacoes);
    } catch (error) {
      console.error("[FLUXO] Erro ao buscar movimentações diárias:", error);
    }
  };

  // Registrar aporte
  const handleRegistrarAporte = async () => {
    try {
      const valor = parseFloat(aporteValor.replace(/[^\d,.-]/g, '').replace(',', '.'));
      
      if (isNaN(valor) || valor <= 0) {
        toast.error("Valor inválido");
        return;
      }

      if (!aporteData) {
        toast.error("Data é obrigatória");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', user?.id)
        .single();

      const { error } = await supabase
        .from('aportes_caixa')
        .insert({
          data: aporteData,
          valor: valor,
          descricao: aporteDescricao || null,
          forma_pagamento: aporteFormaPagamento,
          user_id: user?.id,
          perfil_registrado: profile?.nome || 'Admin',
          email_registrado: user?.email || ''
        });

      if (error) {
        console.error("[FLUXO] Erro ao registrar aporte:", error);
        toast.error(`Erro ao registrar aporte: ${error.message}`);
        return;
      }

      console.log("[FLUXO] Aporte registrado com sucesso!");
      toast.success("Aporte registrado com sucesso!");
      setAporteAberto(false);
      setAporteValor('');
      setAporteDescricao('');
      setAporteData(new Date().toISOString().split('T')[0]);
      setAporteFormaPagamento('Dinheiro');
      fetchFluxoCaixa();
      fetchAportesRegistrados();
    } catch (error: any) {
      console.error("[FLUXO] Erro ao registrar aporte:", error);
      toast.error("Erro ao registrar aporte");
    }
  };

  // Editar aporte
  const handleEditarAporte = (aporte: any) => {
    setAporteEditando(aporte);
    setEditarAporteAberto(true);
    setAporteData(aporte.data);
    setAporteValor(aporte.valor.toString());
    setAporteDescricao(aporte.descricao || '');
    setAporteFormaPagamento(aporte.forma_pagamento);
  };

  // Limpar campos do modal de aporte
  const limparCamposAporte = () => {
    setAporteData(new Date().toISOString().split('T')[0]);
    setAporteValor('');
    setAporteDescricao('');
    setAporteFormaPagamento('Dinheiro');
  };

  // Salvar edição de aporte
  const handleSalvarEdicaoAporte = async () => {
    if (!aporteEditando) return;
    
    try {
      const valor = parseFloat(aporteValor.replace(/[^\d,.-]/g, '').replace(',', '.'));
      
      if (isNaN(valor) || valor <= 0) {
        toast.error("Valor inválido");
        return;
      }

      if (!aporteData) {
        toast.error("Data é obrigatória");
        return;
      }

      const { error } = await supabase
        .from('aportes_caixa')
        .update({
          data: aporteData,
          valor: valor,
          descricao: aporteDescricao || null,
          forma_pagamento: aporteFormaPagamento
        })
        .eq('id', aporteEditando.id);

      if (error) {
        console.error("[FLUXO] Erro ao editar aporte:", error);
        toast.error(`Erro ao editar aporte: ${error.message}`);
        return;
      }

      toast.success("Aporte editado com sucesso!");
      setEditarAporteAberto(false);
      setAporteEditando(null);
      limparCamposAporte();
      fetchFluxoCaixa();
      fetchAportesRegistrados();
    } catch (error: any) {
      console.error("[FLUXO] Erro ao editar aporte:", error);
      toast.error("Erro ao editar aporte");
    }
  };

  // Excluir aporte
  const handleExcluirAporte = async () => {
    if (!aporteExcluindo) return;
    
    try {
      const { error } = await supabase
        .from('aportes_caixa')
        .delete()
        .eq('id', aporteExcluindo.id);

      if (error) {
        console.error("[FLUXO] Erro ao excluir aporte:", error);
        toast.error(`Erro ao excluir aporte: ${error.message}`);
        return;
      }

      toast.success("Aporte excluído com sucesso!");
      setExcluirAporteAberto(false);
      setAporteExcluindo(null);
      fetchFluxoCaixa();
      fetchAportesRegistrados();
    } catch (error: any) {
      console.error("[FLUXO] Erro ao excluir aporte:", error);
      toast.error("Erro ao excluir aporte");
    }
  };


  useEffect(() => {
    if (isMounted) {
      return;
    }
    if (user) {
      setIsMounted(true);
      fetchFluxoCaixa();
    }
  }, [user]);

  useEffect(() => {
    if (isMounted) {
      fetchFluxoCaixa();
    }
  }, [tipoPeriodo, dataInicio, dataFim, mesSelecionado, anoSelecionado]);

  // Preparar dados do gráfico
  const dadosGrafico = movimentacoesDiarias.map(mov => ({
    data: new Date(mov.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    Entradas: mov.entradas,
    Saídas: mov.saidas,
    Saldo: mov.saldoDia
  }));
  

  // Gerar lista de meses
  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading && !fluxoCaixa) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando fluxo de caixa...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">💰 Fluxo de Caixa</CardTitle>
          {isAdmin && (
            <div className="flex gap-2">
              <Dialog open={aportesModalAberto} onOpenChange={setAportesModalAberto}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Ver Aportes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Aportes Registrados</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    {aportesRegistrados.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum aporte registrado no período selecionado
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 text-sm font-semibold">Data</th>
                              <th className="text-right p-2 text-sm font-semibold">Valor</th>
                              <th className="text-left p-2 text-sm font-semibold">Forma</th>
                              <th className="text-left p-2 text-sm font-semibold">Descrição</th>
                              <th className="text-left p-2 text-sm font-semibold">Registrado Por</th>
                              <th className="text-center p-2 text-sm font-semibold">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aportesRegistrados.map((aporte) => (
                              <tr key={aporte.id} className="border-b hover:bg-muted/30">
                                <td className="p-2 text-sm">{formatDate(aporte.data)}</td>
                                <td className="p-2 text-sm text-right font-semibold text-green-600">
                                  {formatCurrency(aporte.valor)}
                                </td>
                                <td className="p-2 text-sm">{aporte.forma_pagamento}</td>
                                <td className="p-2 text-sm text-muted-foreground italic">
                                  {aporte.descricao || '-'}
                                </td>
                                <td className="p-2 text-sm">{aporte.perfil_registrado || '-'}</td>
                                <td className="p-2 text-sm">
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditarAporte(aporte)}
                                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setAporteExcluindo(aporte);
                                        setExcluirAporteAberto(true);
                                      }}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 bg-muted/30 font-semibold">
                              <td className="p-2 text-sm font-bold">TOTAL</td>
                              <td className="p-2 text-sm text-right font-bold text-green-600">
                                {formatCurrency(aportesRegistrados.reduce((sum, a) => sum + a.valor, 0))}
                              </td>
                              <td colSpan={3}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={aporteAberto} onOpenChange={setAporteAberto}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <ArrowUpCircle className="h-4 w-4" />
                    Registrar Aporte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Aporte no Caixa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={aporteData}
                        onChange={(e) => setAporteData(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor (R$)</Label>
                      <Input
                        type="text"
                        value={aporteValor}
                        onChange={(e) => setAporteValor(e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Forma de Pagamento</Label>
                      <Select value={aporteFormaPagamento} onValueChange={setAporteFormaPagamento}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                          <SelectItem value="Cartão">Cartão</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição (opcional)</Label>
                      <Textarea
                        value={aporteDescricao}
                        onChange={(e) => setAporteDescricao(e.target.value)}
                        placeholder="Descrição do aporte..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleRegistrarAporte} className="w-full">
                      Registrar Aporte
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
      </div>
          )}
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={tipoPeriodo} onValueChange={setTipoPeriodo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes-atual">Mês Atual</SelectItem>
                    <SelectItem value="mes-selecionado">Mês Específico</SelectItem>
                    <SelectItem value="personalizado">Período Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tipoPeriodo === 'mes-selecionado' && (
                <>
                  <div className="space-y-2">
                    <Label>Mês</Label>
                    <Select value={mesSelecionado.toString()} onValueChange={(v) => setMesSelecionado(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {meses.map(mes => (
                          <SelectItem key={mes.value} value={mes.value.toString()}>
                            {mes.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Select value={anoSelecionado.toString()} onValueChange={(v) => setAnoSelecionado(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {anos.map(ano => (
                          <SelectItem key={ano} value={ano.toString()}>
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {tipoPeriodo === 'personalizado' && (
                <>
                  <div className="space-y-2">
                    <Label>Data Início</Label>
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim</Label>
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cards de Métricas */}
        {fluxoCaixa && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(fluxoCaixa.saldo_inicial)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(fluxoCaixa.total_entradas)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Repasses LYB dos atendimentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(fluxoCaixa.total_saidas)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Trocos dados aos clientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${fluxoCaixa.saldo_atual >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatCurrency(fluxoCaixa.saldo_atual)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Saldo final do período
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráfico Temporal */}
        {dadosGrafico.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Evolução do Fluxo de Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="Entradas" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Saídas" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Saldo" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Movimentações Diárias */}
        {movimentacoesDiarias.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Movimentações Diárias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-sm font-semibold">Data</th>
                      <th className="text-right p-2 text-sm font-semibold">Entradas</th>
                      <th className="text-right p-2 text-sm font-semibold">Saídas</th>
                      <th className="text-right p-2 text-sm font-semibold">Saldo do Dia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentacoesDiarias.map((mov, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30">
                        <td className="p-2 text-sm">{formatDate(mov.data)}</td>
                        <td className="p-2 text-sm text-right font-semibold text-green-600">
                          {formatCurrency(mov.entradas)}
                        </td>
                        <td className="p-2 text-sm text-right font-semibold text-red-600">
                          {formatCurrency(mov.saidas)}
                        </td>
                        <td className={`p-2 text-sm text-right font-semibold ${mov.saldoDia >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                          {formatCurrency(mov.saldoDia)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {fluxoCaixa && (
                    <tfoot>
                      <tr className="border-t-2 bg-muted/30 font-semibold">
                        <td className="p-2 text-sm font-bold">TOTAL</td>
                        <td className="p-2 text-sm text-right font-bold text-green-600">
                          {formatCurrency(fluxoCaixa.total_entradas)}
                        </td>
                        <td className="p-2 text-sm text-right font-bold text-red-600">
                          {formatCurrency(fluxoCaixa.total_saidas)}
                        </td>
                        <td className={`p-2 text-sm text-right font-bold ${fluxoCaixa.saldo_atual >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                          {formatCurrency(fluxoCaixa.saldo_atual - fluxoCaixa.saldo_inicial)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detalhamento */}
        {fluxoCaixa && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Detalhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Entradas</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lançamentos (Repasse LYB):</span>
                      <span className="font-semibold">{formatCurrency(fluxoCaixa.detalhes.entradas.lancamentos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aportes do mês:</span>
                      <span className="font-semibold">{formatCurrency(fluxoCaixa.detalhes.entradas.outros)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Saídas</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trocos:</span>
                      <span className="font-semibold">{formatCurrency(fluxoCaixa.detalhes.saidas.trocos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outros:</span>
                      <span className="font-semibold">{formatCurrency(fluxoCaixa.detalhes.saidas.outros)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Editar Aporte */}
      <Dialog open={editarAporteAberto} onOpenChange={setEditarAporteAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aporte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={aporteData}
                onChange={(e) => setAporteData(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="text"
                value={aporteValor}
                onChange={(e) => setAporteValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={aporteFormaPagamento} onValueChange={setAporteFormaPagamento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                  <SelectItem value="Cartão">Cartão</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={aporteDescricao}
                onChange={(e) => setAporteDescricao(e.target.value)}
                placeholder="Descrição do aporte..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setEditarAporteAberto(false);
                setAporteEditando(null);
                limparCamposAporte();
              }} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSalvarEdicaoAporte} className="flex-1">
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Excluir Aporte */}
      <Dialog open={excluirAporteAberto} onOpenChange={setExcluirAporteAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Aporte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir este aporte?
            </p>
            {aporteExcluindo && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-semibold">{formatDate(aporteExcluindo.data)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(aporteExcluindo.valor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forma:</span>
                  <span className="font-semibold">{aporteExcluindo.forma_pagamento}</span>
                </div>
                {aporteExcluindo.descricao && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descrição:</span>
                    <span className="font-semibold">{aporteExcluindo.descricao}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setExcluirAporteAberto(false);
                setAporteExcluindo(null);
              }} className="flex-1">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleExcluirAporte} className="flex-1">
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
