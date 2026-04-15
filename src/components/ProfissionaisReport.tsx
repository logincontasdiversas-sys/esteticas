import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGlobalData } from "@/hooks/useGlobalData";
import { Download, Filter, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { exportarRelatorioPDF } from "@/lib/pdfExport";

export const ProfissionaisReport = () => {
  const { user } = useAuth();
  const { lancamentos: globalLancamentos, profissionais: globalProfissionais, loading: globalLoading, refreshData: refreshGlobalData } = useGlobalData();
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sincronizar dados globais
  useEffect(() => {
    setLancamentos(globalLancamentos);
    setProfissionais(globalProfissionais);
  }, [globalLancamentos, globalProfissionais]);
  
  // Controlar loading
  useEffect(() => {
    if (globalLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [globalLoading]);
  
  // Filtros - Padrão: Semana Atual
  const [tipoPeriodo, setTipoPeriodo] = useState<string>('hoje');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [profissionalFiltro, setProfissionalFiltro] = useState<string>('todos');
  
  // Controlar expansão de detalhes por profissional e forma de pagamento
  const [formasExpandidas, setFormasExpandidas] = useState<Set<string>>(new Set());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
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
        return { inicio: dataInicio, fim: dataFim };
      
      default:
        inicio = '';
        fim = '';
    }

    return { inicio, fim };
  };


  // Filtrar lançamentos
  let lancamentosFiltrados = [...lancamentos];
  
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

  if (profissionalFiltro && profissionalFiltro !== 'todos') {
    lancamentosFiltrados = lancamentosFiltrados.filter(l => l.profissional === profissionalFiltro);
  }

  // Agrupar por profissional
  const profissionaisComDados = profissionais.map(prof => {
    const lancamentosProf = lancamentosFiltrados.filter(l => l.profissional === prof.nome);
    
    // Extrair todas as formas de pagamento únicas dos lançamentos deste profissional
    const formasUnicas = Array.from(new Set(lancamentosProf.map(l => l.forma_pagamento).filter(Boolean)));
    const ordemPreferencial = ['PIX', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito'];
    const formasOrdenadas = [
      ...ordemPreferencial.filter(f => formasUnicas.includes(f)),
      ...formasUnicas.filter(f => !ordemPreferencial.includes(f))
    ];
    
    const porForma = formasOrdenadas.map(forma => {
      const lancsForma = lancamentosProf.filter(l => l.forma_pagamento === forma);
      return {
        forma,
        quantidade: lancsForma.length,
        valorTotal: lancsForma.reduce((sum, l) => sum + l.valor_atendimento, 0),
        repasseProf: lancsForma.reduce((sum, l) => sum + (l.valor_empresa || 0), 0), // Valor que fica com o profissional
        repasseLYB: lancsForma.reduce((sum, l) => sum + (l.repasse_valor || 0), 0), // Valor que fica com LYB
        troco: lancsForma.reduce((sum, l) => sum + (l.troco || 0), 0),
        lancamentos: lancsForma, // Incluir os lançamentos individuais
      };
    });

    const totalGeral = lancamentosProf.reduce((sum, l) => sum + l.valor_atendimento, 0);
    const totalRepasseProf = lancamentosProf.reduce((sum, l) => sum + (l.valor_empresa || 0), 0);
    const totalRepasseLYB = lancamentosProf.reduce((sum, l) => sum + (l.repasse_valor || 0), 0);
    const totalTroco = lancamentosProf.reduce((sum, l) => sum + (l.troco || 0), 0);

    return {
      nome: prof.nome,
      repasse_pct: prof.repasse_pct,
      porForma,
      totalGeral,
      totalRepasseProf,
      totalRepasseLYB,
      totalTroco,
      quantidadeTotal: lancamentosProf.length,
      lancamentosTodos: lancamentosProf, // Todos os lançamentos do profissional
    };
  }).filter(p => p.quantidadeTotal > 0); // Apenas profissionais com lançamentos

  // Totais gerais
  const totalGeralTodos = profissionaisComDados.reduce((sum, p) => sum + p.totalGeral, 0);
  const totalRepasseProfTodos = profissionaisComDados.reduce((sum, p) => sum + p.totalRepasseProf, 0);
  const totalRepasseLYBTodos = profissionaisComDados.reduce((sum, p) => sum + p.totalRepasseLYB, 0);
  const totalTrocoTodos = profissionaisComDados.reduce((sum, p) => sum + p.totalTroco, 0);

  // Função de exportação CSV
  const exportarCSV = () => {
    try {
      let csv = 'Profissional,Forma Pagamento,Quantidade,Valor Total,Repasse Profissional,Repasse LYB,Troco\n';
      
      profissionaisComDados.forEach(prof => {
        prof.porForma.forEach(forma => {
          if (forma.quantidade > 0) {
            csv += `"${prof.nome}","${forma.forma}",${forma.quantidade},${forma.valorTotal.toFixed(2)},${forma.repasseProf.toFixed(2)},${forma.repasseLYB.toFixed(2)},${forma.troco.toFixed(2)}\n`;
          }
        });
        // Linha de totais do profissional
        csv += `"${prof.nome}","TOTAL",${prof.quantidadeTotal},${prof.totalGeral.toFixed(2)},${prof.totalRepasseProf.toFixed(2)},${prof.totalRepasseLYB.toFixed(2)},${prof.totalTroco.toFixed(2)}\n`;
        csv += '\n'; // Linha em branco entre profissionais
      });

      // Totais gerais
      csv += `"TOTAL GERAL","",${profissionaisComDados.reduce((sum, p) => sum + p.quantidadeTotal, 0)},${totalGeralTodos.toFixed(2)},${totalRepasseProfTodos.toFixed(2)},${totalRepasseLYBTodos.toFixed(2)},${totalTrocoTodos.toFixed(2)}\n`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_profissionais_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Relatório CSV exportado com sucesso!");
    } catch (error) {
      console.error("[PROFISSIONAIS] Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar CSV");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">👩‍💼 Relatório de Profissionais</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ganhos detalhados por profissional e forma de pagamento
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportarCSV} variant="outline" className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Exportar CSV
                </Button>
                <Button 
                  onClick={() => {
                    try {
                      const periodoTexto = tipoPeriodo === 'semana-atual' ? 'Semana Atual' :
                                          tipoPeriodo === 'mes-atual' ? 'Mês Atual' :
                                          tipoPeriodo === 'personalizado' ? `${dataInicio} a ${dataFim}` :
                                          tipoPeriodo;
                      
                      exportarRelatorioPDF(
                        profissionaisComDados,
                        {
                          totalGeral: totalGeralTodos,
                          totalRepasseProf: totalRepasseProfTodos,
                          totalRepasseLYB: totalRepasseLYBTodos,
                          totalTroco: totalTrocoTodos,
                        },
                        periodoTexto
                      );
                      toast.success("Preparando impressão do relatório PDF...");
                    } catch (error: any) {
                      console.error("[PROFISSIONAIS] Erro ao exportar PDF:", error);
                      toast.error(error.message || "Erro ao exportar PDF");
                    }
                  }} 
                  variant="outline" 
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Filtros</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {profissionais.map(prof => (
                        <SelectItem key={prof.id} value={prof.nome}>
                          {prof.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campos personalizados */}
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

              <Button 
                variant="outline" 
                onClick={() => {
                  setTipoPeriodo('hoje');
                  setDataInicio('');
                  setDataFim('');
                  setProfissionalFiltro('todos');
                }}
              >
                Limpar Filtros
              </Button>
            </div>

            {/* Relatório */}
            {profissionaisComDados.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum lançamento encontrado para o período selecionado
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {profissionaisComDados.map(prof => (
                  <Card key={prof.nome} className="border-2">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="text-lg">
                        {prof.nome} <span className="text-sm text-muted-foreground">({prof.quantidadeTotal} atendimentos)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 text-sm font-semibold">Forma Pagamento</th>
                              <th className="text-center p-2 text-sm font-semibold">Qtd.</th>
                              <th className="text-right p-2 text-sm font-semibold">Valor Total</th>
                              <th className="text-right p-2 text-sm font-semibold">Repasse Prof. ({100 - prof.repasse_pct}%)</th>
                              <th className="text-right p-2 text-sm font-semibold">Repasse LYB ({prof.repasse_pct}%)</th>
                              <th className="text-right p-2 text-sm font-semibold">Troco</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prof.porForma
                              .filter(forma => forma.quantidade > 0)
                              .map(forma => {
                              const chave = `${prof.nome}-${forma.forma}`;
                              const estaExpandida = formasExpandidas.has(chave);
                              return (
                                <React.Fragment key={forma.forma}>
                                  <tr className="border-b hover:bg-muted/30 cursor-pointer" 
                                      onClick={() => {
                                        const novasFormas = new Set(formasExpandidas);
                                        if (estaExpandida) {
                                          novasFormas.delete(chave);
                                        } else {
                                          novasFormas.add(chave);
                                        }
                                        setFormasExpandidas(novasFormas);
                                      }}>
                                    <td className="p-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span>{estaExpandida ? '▼' : '▶'}</span>
                                        <span className="font-medium">{forma.forma}</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-sm text-center">{forma.quantidade}</td>
                                    <td className="p-2 text-sm text-right font-semibold text-blue-600">
                                      {formatCurrency(forma.valorTotal)}
                                    </td>
                                    <td className="p-2 text-sm text-right font-semibold text-green-600">
                                      {formatCurrency(forma.repasseProf)}
                                    </td>
                                    <td className="p-2 text-sm text-right font-semibold text-yellow-600">
                                      {formatCurrency(forma.repasseLYB)}
                                    </td>
                                    <td className="p-2 text-sm text-right text-orange-600">
                                      {formatCurrency(forma.troco)}
                                    </td>
                                  </tr>
                                  {/* Lista de atendimentos detalhados */}
                                  {estaExpandida && forma.lancamentos && forma.lancamentos.length > 0 && (
                                    <tr>
                                      <td colSpan={6} className="p-0 bg-muted/20">
                                        <div className="p-4">
                                          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                                            📋 Atendimentos - {forma.forma} ({forma.lancamentos.length})
                                          </h4>
                                          <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                              <thead>
                                                <tr className="border-b">
                                                  <th className="text-left p-2">Data</th>
                                                  <th className="text-left p-2">Descrição</th>
                                                  <th className="text-right p-2">Valor Atendimento</th>
                                                  <th className="text-right p-2">Valor Pago</th>
                                                  <th className="text-right p-2">Troco</th>
                                                  <th className="text-right p-2">Repasse Prof.</th>
                                                  <th className="text-right p-2">Repasse LYB</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {forma.lancamentos
                                                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                                                  .map((lancamento) => (
                                                  <tr key={lancamento.id} className="border-b hover:bg-background">
                                                    <td className="p-2">{formatDate(lancamento.data)}</td>
                                                    <td className="p-2 text-muted-foreground italic">
                                                      {lancamento.descricao || '-'}
                                                    </td>
                                                    <td className="p-2 text-right font-semibold text-blue-600">
                                                      {formatCurrency(lancamento.valor_atendimento)}
                                                    </td>
                                                    <td className="p-2 text-right text-purple-600">
                                                      {formatCurrency(lancamento.valor_pago || 0)}
                                                    </td>
                                                    <td className="p-2 text-right text-orange-600">
                                                      {formatCurrency(lancamento.troco || 0)}
                                                    </td>
                                                    <td className="p-2 text-right font-semibold text-green-600">
                                                      {formatCurrency(lancamento.valor_empresa || 0)}
                                                    </td>
                                                    <td className="p-2 text-right font-semibold text-yellow-600">
                                                      {formatCurrency(lancamento.repasse_valor || 0)}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                            {/* Linha de totais do profissional */}
                            <tr className="border-t-2 bg-muted/30 font-semibold">
                              <td className="p-2 text-sm font-bold">TOTAL</td>
                              <td className="p-2 text-sm text-center font-bold">{prof.quantidadeTotal}</td>
                              <td className="p-2 text-sm text-right font-bold text-blue-600">
                                {formatCurrency(prof.totalGeral)}
                              </td>
                              <td className="p-2 text-sm text-right font-bold text-green-600">
                                {formatCurrency(prof.totalRepasseProf)}
                              </td>
                              <td className="p-2 text-sm text-right font-bold text-yellow-600">
                                {formatCurrency(prof.totalRepasseLYB)}
                              </td>
                              <td className="p-2 text-sm text-right font-bold text-orange-600">
                                {formatCurrency(prof.totalTroco)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Totais Gerais */}
                <Card className="border-4 border-primary">
                  <CardHeader className="bg-primary/10">
                    <CardTitle className="text-xl">📊 TOTAIS GERAIS</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Faturamento Total</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(totalGeralTodos)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Profissionais</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(totalRepasseProfTodos)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total LYB</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {formatCurrency(totalRepasseLYBTodos)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Trocos</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(totalTrocoTodos)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
