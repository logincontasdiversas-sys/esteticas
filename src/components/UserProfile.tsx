/**
 * @file: UserProfile.tsx
 * @responsibility: User profile management component
 * @exports: UserProfile
 * @layer: components
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGlobalRefresh } from "@/hooks/useGlobalRefresh";
import { supabase } from "@/integrations/supabase/client";
import { updateUserProfileInLancamentos } from "@/services/lancamentoService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { User, Edit, Save, X } from "lucide-react";

interface UserProfileData {
  id: string;
  nome: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserProfileProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const UserProfile = ({ open, onOpenChange }: UserProfileProps = {}) => {
  const { user, adminData, refreshAuth } = useAuth();
  const { triggerRefresh } = useGlobalRefresh();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    nome: '',
    email: ''
  });

  useEffect(() => {
    if (user && adminData) {
      setProfileData({
        id: user.id,
        nome: adminData.nome,
        email: user.email || '',
        role: adminData.role,
        created_at: user.created_at || new Date().toISOString()
      });
      
      setFormData({
        nome: adminData.nome,
        email: user.email || ''
      });
    }
  }, [user, adminData]);

  const handleEdit = () => {
    if (onOpenChange) {
      onOpenChange(true);
    } else {
      setDialogOpen(true);
    }
  };

  const handleSave = async () => {
    if (!profileData) return;
    
    console.log('🔄 Iniciando atualização do perfil:', { 
      id: profileData.id, 
      nome: formData.nome, 
      email: formData.email 
    });
    
    setSaving(true);
    try {
      // Atualizar nome no perfil
      console.log('📝 Atualizando nome no perfil...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nome: formData.nome })
        .eq('id', profileData.id);
      
      if (profileError) {
        console.error('❌ Erro ao atualizar perfil:', profileError);
        toast({
          title: "Erro",
          description: "Erro ao atualizar perfil",
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Nome atualizado no perfil com sucesso');

      // Atualizar perfil_registrado nos lançamentos existentes
      console.log('🔄 Atualizando perfil_registrado nos lançamentos...');
      const { error: lancamentosError } = await updateUserProfileInLancamentos(profileData.id, formData.nome);
      
      if (lancamentosError) {
        console.error('❌ Erro ao atualizar lançamentos:', lancamentosError);
        // Não falhar o processo por causa disso, apenas logar o erro
      } else {
        console.log('✅ Perfil atualizado nos lançamentos com sucesso');
      }

      // Atualizar email no auth (se mudou)
      if (formData.email !== user?.email) {
        console.log('📧 Atualizando email no auth...');
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        
        if (emailError) {
          console.error('❌ Erro ao atualizar email:', emailError);
          toast({
            title: "Erro",
            description: "Erro ao atualizar email. Verifique se o email é válido.",
            variant: "destructive"
          });
          return;
        }
        
        console.log('✅ Email atualizado no auth com sucesso');
      }

      // Recarregar dados do usuário
      console.log('🔄 Recarregando dados do usuário...');
      await refreshAuth();
      console.log('✅ Dados do usuário recarregados');
      
      // Aguardar um pouco para garantir que os estados foram atualizados
      setTimeout(() => {
        console.log('🔄 Verificando se os dados foram atualizados...');
        console.log('📊 Dados atuais do adminData:', adminData);
        
        // Trigger global refresh para atualizar outras partes da aplicação
        console.log('🔄 Triggering global refresh...');
        triggerRefresh();
      }, 100);
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
      
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: profileData?.nome || '',
      email: user?.email || ''
    });
    setDialogOpen(false);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      'adm': 'Administrador',
      'gestora': 'Gestora',
      'secretaria': 'Secretária'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      'adm': 'bg-warning/20 text-warning',
      'gestora': 'bg-primary/20 text-primary',
      'secretaria': 'bg-muted text-muted-foreground'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-muted text-muted-foreground';
  };

  // Se for um modal controlado, renderizar apenas o modal
  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Editar Perfil
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
              />
              <p className="text-xs text-muted-foreground">
                Ao alterar o email, você receberá um link de confirmação
              </p>
            </div>

            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <div className="flex items-center gap-2">
                <Badge className={getRoleColor(profileData?.role || '')}>
                  {getRoleLabel(profileData?.role || '')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (Não pode ser alterado)
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Versão original para uso standalone
  if (!profileData) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Avatar e informações básicas */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{profileData.nome}</span>
          <Badge 
            variant="outline" 
            className={`text-xs ${getRoleColor(profileData.role)}`}
          >
            {getRoleLabel(profileData.role)}
          </Badge>
        </div>
      </div>

      {/* Botão de editar perfil */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Editar Perfil
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
              />
              <p className="text-xs text-muted-foreground">
                Ao alterar o email, você receberá um link de confirmação
              </p>
            </div>

            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <div className="flex items-center gap-2">
                <Badge className={getRoleColor(profileData.role)}>
                  {getRoleLabel(profileData.role)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (Não pode ser alterado)
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
