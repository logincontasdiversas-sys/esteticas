/**
 * @file: ProfissionaisManagement.tsx
 * @responsibility: Admin panel for managing profissionais
 * @exports: ProfissionaisManagement
 * @layer: components/admin
 */

import { useState, useEffect } from "react";
import { getAllProfissionais, createProfissional, updateProfissional, hardDeleteProfissional, Profissional } from "@/services/profissionalService";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalRefresh } from "@/hooks/useGlobalRefresh";
import { useGlobalData } from "@/hooks/useGlobalData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { UserPlus, Pencil, Trash2 } from "lucide-react";

export const ProfissionaisManagement = () => {
  const { triggerRefresh } = useGlobalRefresh();
  const { refreshData } = useGlobalData();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Profissional | null>(null);
  
  const [nome, setNome] = useState('');
  const [repassePct, setRepassePct] = useState(50);
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    loadProfissionais();
  }, []);

  const loadProfissionais = async () => {
    setLoading(true);
    const { data, error } = await getAllProfissionais();
    if (error) {
      toast.error('Erro ao carregar profissionais', { description: error.message });
    } else {
      setProfissionais(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (repassePct < 0 || repassePct > 100) {
      toast.error('Porcentagem de repasse deve estar entre 0 e 100');
      return;
    }
    
    if (editingProf) {
      const { error } = await updateProfissional(editingProf.id, nome, repassePct, ativo);
      if (error) {
        toast.error('Erro ao atualizar profissional', { description: error.message });
      } else {
        // Recalcular lançamentos deste profissional automaticamente usando função RPC
        // Usar nome ANTIGO para encontrar os lançamentos, e NOVO para atualizar
        const nomeParaBuscar = editingProf.nome; // Nome antigo (já tem lançamentos)
        
        const { error: updateError } = await supabase.rpc('recalcular_lancamentos_profissional', {
          p_profissional_nome: nomeParaBuscar,
          p_novo_repasse_pct: repassePct
        });
        
        if (updateError) {
          console.error('Erro ao recalcular lançamentos:', updateError);
          toast.warning('Profissional atualizado, mas houve erro ao recalcular lançamentos. Execute o script SQL manualmente.');
        } else {
          // Se mudou o nome, atualizar também o campo profissional nos lançamentos
          if (editingProf.nome !== nome) {
            await supabase
              .from('lancamentos')
              .update({ profissional: nome })
              .eq('profissional', editingProf.nome);
          }
          toast.success('Profissional e lançamentos atualizados!');
        }
        setDialogOpen(false);
        resetForm();
        loadProfissionais();
        // Atualizar dados globais para refletir as mudanças nos lançamentos
        triggerRefresh();
        await refreshData();
      }
    } else {
      const { error } = await createProfissional(nome, repassePct);
      if (error) {
        toast.error('Erro ao criar profissional', { description: error.message });
      } else {
        toast.success('Profissional criado!');
        setDialogOpen(false);
        resetForm();
        loadProfissionais();
      }
    }
  };

  const resetForm = () => {
    setNome('');
    setRepassePct(50);
    setAtivo(true);
    setEditingProf(null);
  };

  const handleEdit = (prof: Profissional) => {
    setEditingProf(prof);
    setNome(prof.nome);
    setRepassePct(prof.repasse_pct);
    setAtivo(prof.ativo);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await hardDeleteProfissional(id);
    if (error) {
      toast.error('Erro ao deletar profissional', { description: error.message });
    } else {
      toast.success('Profissional deletado com sucesso!');
      loadProfissionais();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gerenciamento de Profissionais</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProf(null)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Profissional
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProf ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do profissional"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="repasse">Porcentagem de Repasse (%)</Label>
                  <Input
                    id="repasse"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={repassePct}
                    onChange={(e) => setRepassePct(parseFloat(e.target.value))}
                    placeholder="50.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual que o profissional repassa para a estética
                  </p>
                </div>
                
                {editingProf && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={ativo}
                      onCheckedChange={setAtivo}
                    />
                    <Label htmlFor="ativo">Ativo</Label>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingProf ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Repasse (%)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profissionais.map((prof) => (
                <TableRow key={prof.id}>
                  <TableCell className="font-medium">{prof.nome}</TableCell>
                  <TableCell>{prof.repasse_pct}%</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      prof.ativo ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {prof.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(prof.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(prof)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar o profissional "{prof.nome}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(prof.id)}>
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};