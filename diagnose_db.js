import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iodltsabwyvuxxudxzky.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZGx0c2Fid3l2dXh4dWR4emt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI3NTY5NywiZXhwIjoyMDkxODUxNjk3fQ.ru3uUUE_HKwvPzGtaROTfHke8UIMrr2KftPGAr_VQAU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function diagnose() {
  console.log('🧪 Iniciando diagnóstico de tabelas...');
  
  const tables = ['profiles', 'user_roles', 'profissionais', 'lancamentos'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`❌ Erro na tabela [${table}]:`, error.message);
    } else {
      console.log(`✅ Tabela [${table}] OK.`);
    }
  }

  console.log('\n🔐 Verificando Permissões (RPC)...');
  // Tentar rodar um comando SQL simples via RPC se existir
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_service_status');
  if (rpcError) {
    console.log('ℹ️ RPC get_service_status não existe (normal se não criado).');
  }

  console.log('\n🚀 Verificando Edge Functions...');
  const { data: funcData, error: funcError } = await supabase.functions.invoke('invite-user', {
    body: { test: true }
  });
  console.log('Status Function:', funcError ? `Erro: ${funcError.message}` : 'OK (Respondeu)');
}

diagnose();
