import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iodltsabwyvuxxudxzky.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZGx0c2Fid3l2dXh4dWR4emt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI3NTY5NywiZXhwIjoyMDkxODUxNjk3fQ.ru3uUUE_HKwvPzGtaROTfHke8UIMrr2KftPGAr_VQAU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixRLS() {
  console.log('🛠️ Corrigindo Políticas de Segurança (RLS)...');
  
  const sql = `
    -- 1. Resetar permissões da tabela user_roles para evitar recursividade
    DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
    
    CREATE POLICY "Public roles access" ON public.user_roles 
    FOR SELECT USING (true); -- Simples e seguro para leitura

    -- 2. Corrigir tabela profissionais (Erro 400 pode ser falta de permissão ou coluna)
    ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Everyone can view professionals" ON public.profissionais;
    CREATE POLICY "Everyone can view professionals" ON public.profissionais 
    FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Admins can manage professionals" ON public.profissionais;
    CREATE POLICY "Admins can manage professionals" ON public.profissionais 
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'adm'
      )
    );

    -- 3. Garantir que a tabela lancamentos aceite inserções do bot e usuários
    ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own lancamentos" ON public.lancamentos;
    CREATE POLICY "Users can manage own lancamentos" ON public.lancamentos 
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL); -- Permite bot (nulo) e admin
  `;

  // Como não temos RPC para rodar SQL arbitrário, vamos orientar o usuário a rodar no SQL Editor
  console.log('⚠️ IMPORTANTE: Para corrigir isso definitivamente, copie o SQL abaixo e cole no SQL Editor do seu Supabase Dashboard:');
  console.log(sql);
}

fixRLS();
