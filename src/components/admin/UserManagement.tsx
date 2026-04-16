/**
 * @file: UserManagement.tsx
 * @responsibility: Admin panel for user management
 * @exports: UserManagement
 * @layer: components/admin
 */

import { useState, useEffect } from "react";
import { getUsers, createUserWithRole, updateUserRole, deleteUser, UserWithRole } from "@/services/userManagementService";
import { useGlobalRefresh } from "@/hooks/useGlobalRefresh";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import type { AppRole } from "@/types/Lancamento";

export const UserManagement = () => {
  const { refreshTrigger, triggerRefresh } = useGlobalRefresh();
  const { forceRefreshAdmin, organizationId, organizationName, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState<AppRole | 'adm'>('secretaria');

  useEffect(() => {
    if (organizationId) {
      loadUsers();
    }
  }, [organizationId]);

  // Recarregar usuários quando houver mudanças globais
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Global refresh triggered, reloading users...');
      loadUsers();
    }
  }, [refreshTrigger]);

  const loadUsers = async () => {
    setLoading(true);
    console.log('🔄 [UserManagement] Carregando usuários para org:', organizationId);
    const { data, error } = await getUsers(organizationId);
    if (error) {
      console.error('❌ [UserManagement] Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários', { description: error.message });
    } else {
      console.log('✅ [UserManagement] Usuários carregados:', data);
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 [UserManagement] handleSubmit INICIADO');
    console.log('🔄 [UserManagement] editingUser:', editingUser);
    console.log('🔄 [UserManagement] role:', role);
    
    if (editingUser) {
      // Update role
      console.log('🔄 [UserManagement] MODO ATUALIZAÇÃO - Atualizando role:', { userId: editingUser.id, newRole: role });
      console.log('🔄 [UserManagement] Chamando updateUserRole...');
      
      const { data, error } = await updateUserRole(editingUser.id, role);
      console.log('📊 [UserManagement] Resultado da atualização:', { data, error });
      
      if (error) {
        console.error('❌ [UserManagement] Erro ao atualizar usuário:', error);
        toast.error('Erro ao atualizar usuário', { description: error.message });
      } else {
        console.log('✅ [UserManagement] Usuário atualizado com sucesso:', data);
        toast.success('Usuário atualizado com sucesso!');
        setDialogOpen(false);
        resetForm();
        
        // Recarregar lista de usuários
        console.log('🔄 [UserManagement] Recarregando lista de usuários...');
        await loadUsers();
        
        // Forçar atualização do status de admin
        // Isso garante que se o usuário promovido estiver logado, seu painel será atualizado
        console.log('🔄 [UserManagement] Disparando refresh de admin...');
        forceRefreshAdmin();
        
        // Também disparar refresh global para outros componentes
        console.log('🔄 [UserManagement] Disparando refresh global...');
        triggerRefresh();
      }
    } else {
      // Invite new user - send magic link
      if (!email || !nome) {
        toast.error('Preencha todos os campos');
        return;
      }
      
      const { error } = await createUserWithRole(email, nome, role, organizationId, organizationName);
      if (error) {
        toast.error('Erro ao convidar usuário', { description: error.message });
      } else {
        toast.success('Convite enviado! O usuário receberá um email para definir sua senha.');
        setDialogOpen(false);
        resetForm();
        // Recarregar após um pequeno delay para o banco processar os triggers
        setTimeout(() => loadUsers(), 500);
      }
    }
    
    console.log('🔄 [UserManagement] handleSubmit FINALIZADO');
  };

  const resetForm = () => {
    setEmail('');
    setNome('');
    setRole('secretaria');
    setEditingUser(null);
  };

  const handleEdit = (user: UserWithRole) => {
    setEditingUser(user);
    setRole(user.role || 'secretaria');
    setDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    const { error } = await deleteUser(userId);
    if (error) {
      toast.error('Erro ao deletar usuário', { description: error.message });
    } else {
      toast.success('Usuário deletado com sucesso!');
      loadUsers();
    }
  };

  const getRoleLabel = (role: AppRole | 'adm' | null) => {
    if (!role) return 'Sem Role';
    return {
      secretaria: 'Secretária',
      gestora: 'Gestor(a)',
      adm: 'Administrador',
    }[role];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Role do Usuário' : 'Convidar Novo Usuário'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingUser && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Maria Silva"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="maria@exemplo.com"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        O usuário receberá um email para definir sua senha
                      </p>
                    </div>
                  </>
                )}
                
                {editingUser && (
                  <div className="space-y-2">
                    <Label>Usuário</Label>
                    <p className="text-sm text-muted-foreground">{editingUser.nome}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="role">Perfil de Acesso</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as AppRole | 'adm')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secretaria">Secretária</SelectItem>
                      <SelectItem value="gestora">Gestor(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingUser ? 'Atualizar' : 'Criar'}
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
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isTargetGestora = user.role === 'gestora';
                const canEdit = isSuperAdmin || !isTargetGestora;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'gestora' ? 'bg-primary/20 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
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
                                    Tem certeza que deseja deletar o usuário "{user.nome}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(user.id)}>
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};