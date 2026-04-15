import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "./Logo";

export const AuthForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔍 Tentando login com:', { email, password: '***' });
      console.log('🔍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔍 Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔍 Resultado do login:', { data, error });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao LYB Controle Financeiro.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas. Verifique seu email e senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">LYB Controle Financeiro</CardTitle>
          <CardDescription>
            Sistema de controle de caixa da Estética LYB
          </CardDescription>
        </CardHeader>
        <CardContent>
                 <Alert className="mb-4">
                   <AlertTriangle className="h-4 w-4" />
                   <AlertDescription>
                     <strong>Sistema LYB:</strong> Faça login com suas credenciais para acessar o sistema.
                     <br /><br />
                     <strong>Novos Usuários:</strong> Serão convidados pelo administrador via email.
                   </AlertDescription>
                 </Alert>
          
                 <form onSubmit={handleSignIn} className="space-y-4">
                   <div className="space-y-2">
                     <Input
                       type="email"
                       placeholder="seu@email.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                     />
                   </div>
                   <div className="space-y-2">
                     <Input
                       type="password"
                       placeholder="Sua senha"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                     />
                   </div>
                   <Button type="submit" className="w-full" disabled={loading}>
                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Entrar
                   </Button>
                 </form>
          
                 <div className="mt-4 text-center text-sm text-muted-foreground">
                   <p>Novos usuários são convidados pelo administrador.</p>
                 </div>
        </CardContent>
      </Card>
    </div>
  );
};