/**
 * @file: DashboardWithFilters.tsx
 * @responsibility: Enhanced dashboard with custom date filters and export
 * @exports: DashboardWithFilters
 * @layer: components
 */

import { getLancamentos } from "@/services/lancamentoService";
import { useAuth } from "@/hooks/useAuth";
import { Lancamento } from "@/types/Lancamento";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, AlertTriangle, Download, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export const DashboardWithFilters = () => {
  const { organizationId } = useAuth();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    // Default: current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setDataInicio(firstDay.toISOString().split('T')[0]);
    setDataFim(lastDay.toISOString().split('T')[0]);
    
    if (organizationId) {
      fetchData(firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]);
    }
  }, [organizationId]);

  const fetchData = async (inicio: string, fim: string) => {
    setLoading(true);
    const { data } = await getLancamentos(organizationId, {
      data_inicio: inicio,
      data_fim: fim,
    });
    setLancamentos(data || []);
    setLoading(false);
  };

  const handleAplicarFiltro = () => {
    if (!dataInicio || !dataFim) {
      toast.error('Selecione as datas de início e fim');
      return;
    }
    
    if (new Date(dataInicio) > new Date(dataFim)) {
      toast.error('Data inicial deve ser anterior à data final');
      return;
    }
    
    fetchData(dataInicio, dataFim);
  };

  const calculateMetrics = () => {
    const saldoBruto = lancamentos.reduce((sum, l) => sum + l.valor_atendimento, 0);
    const repasseTotal = lancamentos.reduce((sum, l) => sum + l.repasse_valor, 0);
    const trocoTotal = lancamentos.reduce((sum, l) => sum + l.troco, 0);
    const ganhoLiquido = saldoBruto - repasseTotal - trocoTotal;
    
    const trocoPct = saldoBruto > 0 ? (trocoTotal / saldoBruto) * 100 : 0;
    const trocoAlerta = trocoPct > 5;

    return { saldoBruto, repasseTotal, ganhoLiquido, trocoTotal, trocoPct, trocoAlerta };
  };

  const getFormasPagamento = () => {
    const formas: Record<string, number> = {};
    lancamentos.forEach((l) => {
      if (!formas[l.forma_pagamento]) formas[l.forma_pagamento] = 0;
      formas[l.forma_pagamento] += l.valor_atendimento;
    });
    return Object.entries(formas).map(([forma, valor]) => ({ forma, valor }));
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Profissional', 'Valor Atend.', 'Valor Pago', 'Troco', 'Forma Pgto', '% Repasse', 'Valor Repasse'];
    const rows = lancamentos.map(l => [
      l.data,
      l.profissional,
      l.valor_atendimento.toFixed(2),
      l.valor_pago.toFixed(2),
      l.troco.toFixed(2),
      l.forma_pagamento,
      l.repasse_pct.toFixed(2),
      l.repasse_valor.toFixed(2),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${dataInicio}_a_${dataFim}.csv`;
    link.click();
    
    toast.success('Relatório CSV exportado!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const metrics = calculateMetrics();
  const formasPagamento = getFormasPagamento();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtro de Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-inicio">Data Inicial</Label>
              <Input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-fim">Data Final</Label>
              <Input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleAplicarFiltro} disabled={loading} className="flex-1">
                {loading ? 'Carregando...' : 'Aplicar'}
              </Button>
              <Button onClick={exportToCSV} variant="outline" disabled={lancamentos.length === 0}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Bruto</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{formatCurrency(metrics.saldoBruto)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Repasse Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.repasseTotal)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganho Líquido</CardTitle>
                <DollarSign className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.ganhoLiquido)}</div>
              </CardContent>
            </Card>
          </div>

          {metrics.trocoAlerta && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Atenção! O troco total ({formatCurrency(metrics.trocoTotal)}) representa {metrics.trocoPct.toFixed(1)}% 
                do saldo bruto, acima do limite de 5%.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forma</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">% do Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formasPagamento.map(({ forma, valor }) => (
                    <TableRow key={forma}>
                      <TableCell className="font-medium">{forma}</TableCell>
                      <TableCell className="text-right">{formatCurrency(valor)}</TableCell>
                      <TableCell className="text-right">
                        {metrics.saldoBruto > 0 ? ((valor / metrics.saldoBruto) * 100).toFixed(1) : '0'}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo de Trocos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total em Trocos:</span>
                  <span className="font-semibold">{formatCurrency(metrics.trocoTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">% do Saldo Bruto:</span>
                  <span className="font-semibold">{metrics.trocoPct.toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};