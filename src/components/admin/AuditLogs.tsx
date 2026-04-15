/**
 * @file: AuditLogs.tsx
 * @responsibility: Display audit logs for admin
 * @exports: AuditLogs
 * @layer: components/admin
 */

import { useState, useEffect } from "react";
import { getAuditLogs, AuditLog } from "@/services/auditService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FileText, Search } from "lucide-react";

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    // Load last 30 days by default
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 30);
    
    setDataInicio(inicio.toISOString().split('T')[0]);
    setDataFim(fim.toISOString().split('T')[0]);
    
    loadLogs(inicio.toISOString().split('T')[0], fim.toISOString().split('T')[0]);
  }, []);

  const loadLogs = async (inicio?: string, fim?: string) => {
    setLoading(true);
    const { data, error } = await getAuditLogs({
      data_inicio: inicio,
      data_fim: fim,
    });
    
    if (error) {
      toast.error('Erro ao carregar logs', { description: error.message });
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    loadLogs(dataInicio, dataFim);
  };

  const getAcaoLabel = (acao: string) => {
    return {
      CREATE: 'Criação',
      UPDATE: 'Edição',
      DELETE: 'Exclusão',
    }[acao] || acao;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <CardTitle>Log de Auditoria</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Buscando...' : 'Filtrar'}
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum log encontrado</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.acao === 'CREATE' ? 'bg-success/20 text-success' :
                          log.acao === 'UPDATE' ? 'bg-primary/20 text-primary' :
                          log.acao === 'DELETE' ? 'bg-warning/20 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {getAcaoLabel(log.acao)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{log.usuario_nome || 'Sistema'}</TableCell>
                      <TableCell className="capitalize">{log.tabela}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                        {log.registro_id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};