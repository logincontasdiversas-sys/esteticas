/**
 * @file: SetPassword.tsx
 * @responsibility: Page for users to set password after invite
 * @exports: SetPassword
 * @layer: pages
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const SetPassword = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<{score: number, feedback: string}>({ score: 0, feedback: '' });

  // Validar força da senha
  const validatePassword = (pwd: string) => {
    let score = 0;
    let feedback = '';
    
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
    
    if (score <= 1) feedback = 'Senha muito fraca';
    else if (score <= 2) feedback = 'Senha fraca';
    else if (score <= 3) feedback = 'Senha média';
    else if (score <= 4) feedback = 'Senha forte';
    else feedback = 'Senha muito forte';
    
    setPasswordStrength({ score, feedback });
  };

  // Monitorar o estado de autenticação global para liberar a tela
  useEffect(() => {
    console.log('[SET-PASSWORD] 🔍 Monitoramento Auth:', { userEmail: user?.email, authLoading });
    
    if (user) {
      console.log('[SET-PASSWORD] ✨ Usuário detectado via Cérebro Global! Liberando formulário.');
      setValidating(false);
    } else if (!authLoading) {
      // Se terminou de carregar o auth global e ainda não temos usuário, damos 4 segundos
      // para o caso de o processamento do link estar em andamento no useAuth.
      const timer = setTimeout(() => {
        if (!user) {
          console.warn('[SET-PASSWORD] ⚠️ Nenhuma sessão detectada. Link pode estar inválido ou expirado.');
          setValidating(false);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error("A senha está muito fraca. Use uma senha mais forte.");
      return;
    }

    setLoading(true);

    // Check if we have Supabase configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl || supabaseUrl.includes('your_supabase_project_url')) {
      // Demo mode - simulate password setting
      console.log('Modo demonstração: Simulando definição de senha');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Senha definida com sucesso! (Modo demonstração)");
      navigate("/");
      setLoading(false);
      return;
    }

    // Real Supabase implementation
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success("Senha definida com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao definir senha");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Logo />
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground text-center">
              Validando acesso...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <h2 className="text-xl font-semibold text-center">Defina sua Senha</h2>
          <p className="text-sm text-muted-foreground text-center">
            Crie uma senha segura para acessar o sistema
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length > 0) {
                  validatePassword(e.target.value);
                } else {
                  setPasswordStrength({ score: 0, feedback: '' });
                }
              }}
              required
              disabled={loading}
              placeholder="Mínimo 8 caracteres"
              minLength={6}
            />
            {password.length > 0 && passwordStrength.feedback && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      passwordStrength.score <= 1 ? 'bg-red-500' :
                      passwordStrength.score <= 2 ? 'bg-orange-500' :
                      passwordStrength.score <= 3 ? 'bg-yellow-500' :
                      passwordStrength.score <= 4 ? 'bg-green-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs ${
                  passwordStrength.score <= 2 ? 'text-red-600' :
                  passwordStrength.score <= 3 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {passwordStrength.feedback}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Digite a senha novamente"
              minLength={6}
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                As senhas não coincidem
              </p>
            )}
            {confirmPassword.length > 0 && password === confirmPassword && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Senhas coincidem
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || password.length < 8 || passwordStrength.score < 3}>
            {loading ? "Salvando..." : "Definir Senha e Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SetPassword;
