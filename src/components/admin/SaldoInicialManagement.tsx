import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar, DollarSign, Save, History, Edit, Trash2 } from 'lucide-react';
import { toast } from '../ui/use-toast';
import { saldoInicialService, SaldoInicial, SaldoInicialInput } from '../../services/saldoInicialService';

export default function SaldoInicialManagement() {
  const [saldoAtual, setSaldoAtual] = useState<SaldoInicial | null>(null);
  const [historico, setHistorico] = useState<SaldoInicial[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSaldo, setEditingSaldo] = useState<SaldoInicial | null>(null);
  const [deletingSaldo, setDeletingSaldo] = useState<SaldoInicial | null>(null);
  
  // Formulário
  const [formData, setFormData] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    saldo_inicial: 0,
    tipo_saldo: 'Dinheiro',
    observacoes: ''
  });

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

  const tiposSaldo = [
    { value: 'Dinheiro', label: 'Dinheiro' },
    { value: 'PIX', label: 'PIX' },
    { value: 'Débito em Conta', label: 'Débito em Conta' },
    { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
    { value: 'Transferência Bancária', label: 'Transferência Bancária' },
    { value: 'Outros', label: 'Outros' }
  ];

  useEffect(() => {
    loadSaldoAtual();
    loadHistorico();
  }, []);

  const loadSaldoAtual = async () => {
    setLoading(true);
    try {
      const saldo = await saldoInicialService.getSaldoInicialAtual();
      setSaldoAtual(saldo);
      
      if (saldo) {
        setFormData({
          mes: saldo.mes,
          ano: saldo.ano,
          saldo_inicial: saldo.saldo_inicial,
          tipo_saldo: saldo.tipo_saldo || 'Dinheiro',
          observacoes: saldo.observacoes || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar saldo atual:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar saldo inicial",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistorico = async () => {
    try {
      const historicoData = await saldoInicialService.getHistoricoSaldoInicial();
      setHistorico(historicoData);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleSave = async () => {
    if (formData.saldo_inicial < 0) {
      toast({
        title: "Erro",
        description: "O saldo inicial não pode ser negativo",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const input: SaldoInicialInput = {
        mes: formData.mes,
        ano: formData.ano,
        saldo_inicial: formData.saldo_inicial,
        tipo_saldo: formData.tipo_saldo,
        observacoes: formData.observacoes
      };

      let resultado;
      if (editingSaldo) {
        // Atualizar saldo existente
        resultado = await saldoInicialService.updateSaldoInicial(editingSaldo.id, input);
      } else {
        // Criar novo saldo
        resultado = await saldoInicialService.upsertSaldoInicial(input);
      }
      
      if (resultado) {
        setSaldoAtual(resultado);
        await loadHistorico();
        setEditingSaldo(null);
        
        toast({
          title: "Sucesso",
          description: `Saldo inicial de ${meses[formData.mes - 1].label}/${formData.ano} ${editingSaldo ? 'atualizado' : 'salvo'} com sucesso!`,
        });
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar saldo inicial:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar saldo inicial",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (saldo: SaldoInicial) => {
    setEditingSaldo(saldo);
    setFormData({
      mes: saldo.mes,
      ano: saldo.ano,
      saldo_inicial: saldo.saldo_inicial,
      tipo_saldo: saldo.tipo_saldo,
      observacoes: saldo.observacoes || ''
    });
  };

  const handleDelete = async (saldo: SaldoInicial) => {
    if (!confirm(`Tem certeza que deseja excluir o saldo inicial de ${meses[saldo.mes - 1].label}/${saldo.ano}?`)) {
      return;
    }

    setSaving(true);
    try {
      const success = await saldoInicialService.deleteSaldoInicial(saldo.id);
      
      if (success) {
        await loadSaldoAtual();
        await loadHistorico();
        
        toast({
          title: "Sucesso",
          description: `Saldo inicial de ${meses[saldo.mes - 1].label}/${saldo.ano} excluído com sucesso!`,
        });
      } else {
        throw new Error('Erro ao excluir');
      }
    } catch (error) {
      console.error('Erro ao excluir saldo inicial:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir saldo inicial",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSaldo(null);
    setFormData({
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
      saldo_inicial: 0,
      tipo_saldo: 'Dinheiro',
      observacoes: ''
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Controle de Saldo Inicial
          </h2>
          <p className="text-muted-foreground">
            Gerencie o saldo inicial mensal da empresa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Saldo Inicial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {editingSaldo ? 'Editar Aporte de Saldo' : 'Registrar Aporte de Saldo'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <Select 
                  value={formData.mes.toString()} 
                  onValueChange={(value) => setFormData({...formData, mes: parseInt(value)})}
                >
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
                <Label htmlFor="ano">Ano</Label>
                <Select 
                  value={formData.ano.toString()} 
                  onValueChange={(value) => setFormData({...formData, ano: parseInt(value)})}
                >
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="saldo_inicial">Saldo Inicial (R$)</Label>
              <Input
                id="saldo_inicial"
                type="number"
                step="0.01"
                min="0"
                value={formData.saldo_inicial}
                onChange={(e) => setFormData({...formData, saldo_inicial: parseFloat(e.target.value) || 0})}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_saldo">Tipo de Saldo</Label>
              <Select 
                value={formData.tipo_saldo} 
                onValueChange={(value) => setFormData({...formData, tipo_saldo: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposSaldo.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Observações sobre o saldo inicial..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={saving || loading}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : (editingSaldo ? 'Atualizar Saldo' : 'Salvar Saldo Inicial')}
              </Button>
              {editingSaldo && (
                <Button 
                  onClick={handleCancelEdit}
                  variant="outline"
                  disabled={saving || loading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Saldo Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
              </div>
            ) : saldoAtual ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(saldoAtual.saldo_inicial)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {meses[saldoAtual.mes - 1].label} de {saldoAtual.ano}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {saldoAtual.tipo_saldo}
                  </Badge>
                </div>
                
                {saldoAtual.observacoes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Observações:</strong> {saldoAtual.observacoes}
                    </p>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Última atualização: {new Date(saldoAtual.updated_at).toLocaleString('pt-BR')}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Nenhum saldo inicial definido para este mês
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Saldos Iniciais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum histórico encontrado
            </p>
          ) : (
            <div className="space-y-2">
              {historico.map((saldo) => (
                <div key={`${saldo.ano}-${saldo.mes}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {meses[saldo.mes - 1].label} de {saldo.ano}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {saldo.tipo_saldo}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        👤 {saldo.usuario?.nome || 'Usuário não encontrado'}
                      </Badge>
                    </div>
                    {saldo.observacoes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {saldo.observacoes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(saldo.saldo_inicial)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(saldo.updated_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(saldo)}
                        disabled={saving}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(saldo)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
