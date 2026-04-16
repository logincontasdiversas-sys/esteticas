const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iodltsabwyvuxxudxzky.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZGx0c2Fid3l2dXh4dWR4emt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI3NTY5NywiZXhwIjoyMDkxODUxNjk3fQ.ru3uUUE_HKwvPzGtaROTfHke8UIMrr2KftPGAr_VQAU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function audit() {
  console.log('🔍 Iniciando Auditoria Completa do Banco de Dados...\n');
  
  // Lista de tabelas para verificar
  const tables = ['profiles', 'user_roles', 'profissionais', 'lancamentos', 'saldo_inicial', 'aportes_caixa'];
  
  for (const table of tables) {
    console.log(`--------------------------------------------------`);
    console.log(`📋 ANALISANDO TABELA: ${table.toUpperCase()}`);
    
    // Tenta pegar um registro para ver as colunas
    const { data: sample, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.log(`❌ Erro ao acessar: ${error.message}`);
    } else {
      const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : null;
      
      if (columns) {
        console.log(`✅ Colunas Encontradas: ${columns.join(', ')}`);
      } else {
        console.log(`⚠️ Tabela existe, mas está VAZIA. Não foi possível listar as colunas via API.`);
        console.log(`💡 Dica: Rode SELECT * FROM information_schema.columns WHERE table_name = '${table}' no SQL Editor.`);
      }
    }
  }
}

audit();
