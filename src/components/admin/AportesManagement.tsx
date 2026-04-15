import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Wallet, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGlobalData } from '@/hooks/useGlobalData';

export const AportesManagement = () => {
  const { refreshData } = useGlobalData();
  const [aportes, setAportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal de criação/edição
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAporte, setEditingAporte] = useState<any>(null);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: '',
    descricao: '',
    forma_pagamento: 'Dinheiro',
    tipo: 'entrada' // Adicionar campo tipo
  });
  
  // Modal de exclusão
  const [deletingAporte, setDeletingAporte] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formasPagamento = ['Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Transferência Bancária'];

  useEffect(() => {
    loadAportes();
  }, []);

  const loadAportes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('aportes_caixa')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setAportes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar movimentações:', error);
      toast.error('Erro ao carregar movimentações');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAporte(null);
    setFormData({
      data: new Date().toISOString().split('T')[0],
      valor: '',
      descricao: '',
      forma_pagamento: 'Dinheiro',
      tipo: 'entrada'
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (aporte: any) => {
    setEditingAporte(aporte);
    setFormData({
      data: aporte.data,
      valor: Math.abs(aporte.valor).toString(),
      descricao: aporte.descricao || '',
      forma_pagamento: aporte.forma_pagamento,
      tipo: aporte.valor >= 0 ? 'entrada' : 'saida'
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = async () => {
    const valor = parseFloat(formData.valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
    
    if (isNaN(valor) || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }

    if (!formData.data) {
      toast.error('Data é obrigatória');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', user?.id)
        .single();

      // Aplicar sinal baseado no tipo
      const valorFinal = formData.tipo === 'saida' ? -valor : valor;

      if (editingAporte) {
        const { error } = await supabase
          .from('aportes_caixa')
          .update({
            data: formData.data,
            valor: valorFinal,
            descricao: formData.descricao || null,
            forma_pagamento: formData.forma_pagamento
          })
          .eq('id', editingAporte.id);

        if (error) throw error;
        toast.success('Movimentação atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('aportes_caixa')
          .insert({
            data: formData.data,
            valor: valorFinal,
            descricao: formData.descricao || null,
            forma_pagamento: formData.forma_pagamento,
            user_id: user?.id,
            perfil_registrado: profile?.nome || 'Admin',
            email_registrado: user?.email || ''
          });

        if (error) throw error;
        toast.success('Movimentação registrada com sucesso!');
      }

      setIsCreateDialogOpen(false);
      await loadAportes();
      await refreshData(); // Forçar recálculo completo do fluxo de caixa
    } catch (error: any) {
      console.error('Erro ao salvar movimentação:', error);
        toast.error(`Erro ao salvar movimentação: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (aporte: any) => {
    setDeletingAporte(aporte);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAporte) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('aportes_caixa')
        .delete()
        .eq('id', deletingAporte.id);

      if (error) throw error;
      
      toast.success('Movimentação excluída com sucesso!');
      setIsDeleteDialogOpen(false);
      await loadAportes();
      await refreshData(); // Forçar recálculo completo do fluxo de caixa
    } catch (error: any) {
      console.error('Erro ao excluir movimentação:', error);
      toast.error(`Erro ao excluir movimentação: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            Movimentações de Caixa
          </h2>
          <p className="text-muted-foreground">
            Registre entradas e retiradas do caixa
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
            </div>
          ) : aportes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma movimentação registrada
            </p>
          ) : (
            <div className="space-y-2">
              {aportes.map((aporte) => (
                <div key={aporte.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {formatDate(aporte.data)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {aporte.forma_pagamento}
                      </Badge>
                      {aporte.perfil_registrado && (
                        <Badge variant="secondary" className="text-xs">
                          👤 {aporte.perfil_registrado}
                        </Badge>
                      )}
                    </div>
                    {aporte.descricao && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {aporte.descricao}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`font-bold ${aporte.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(aporte.valor))}
                      </div>
                      <Badge variant={aporte.valor >= 0 ? 'default' : 'destructive'} className="mt-1">
                        {aporte.valor >= 0 ? '💰 Entrada' : '💸 Retirada'}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(aporte.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(aporte)}
                        disabled={saving}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(aporte)}
                        disabled={saving || isDeleting}
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

      {/* Modal de criação/edição */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAporte ? 'Editar Movimentação' : 'Nova Movimentação'}
            </DialogTitle>
            <DialogDescription>
              Registre uma entrada ou retirada do caixa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Movimentação</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => setFormData({...formData, tipo: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">💰 Entrada</SelectItem>
                  <SelectItem value="saida">💸 Retirada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="text"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select 
                value={formData.forma_pagamento} 
                onValueChange={(value) => setFormData({...formData, forma_pagamento: value})}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="descricao">Descrição (Opcional)</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição do aporte..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : (editingAporte ? 'Atualizar' : 'Registrar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Movimentação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {deletingAporte && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="font-medium">{formatDate(deletingAporte.data)}</div>
              <div className={`font-bold ${deletingAporte.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(deletingAporte.valor))}
              </div>
              <Badge variant={deletingAporte.valor >= 0 ? 'default' : 'destructive'}>
                {deletingAporte.valor >= 0 ? '💰 Entrada' : '💸 Retirada'}
              </Badge>
              <div className="text-sm text-muted-foreground">{deletingAporte.descricao}</div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

