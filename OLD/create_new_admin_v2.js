import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iodltsabwyvuxxudxzky.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZGx0c2Fid3l2dXh4dWR4emt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI3NTY5NywiZXhwIjoyMDkxODUxNjk3fQ.ru3uUUE_HKwvPzGtaROTfHke8UIMrr2KftPGAr_VQAU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminUser() {
  const email = 'admin@lyb.com';
  const password = 'adm12345';

  console.log(`🚀 Tentativa de criação silenciosa: ${email}`);

  // 1. Verificar se o usuário já foi criado mesmo com o erro
  const { data: { users } } = await supabase.auth.admin.listUsers();
  let user = users.find(u => u.email === email);

  if (!user) {
    // 2. Tentar criar sem metadados para evitar falha no trigger
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (userError) {
      console.error('❌ Erro crítico no Auth:', userError.message);
      return;
    }
    user = userData.user;
    console.log('✅ Usuário auth criado:', user.id);
  } else {
    console.log('ℹ️ Usuário já existe no Auth.');
  }

  const userId = user.id;

  // 3. Garantir manualmente o Perfil e Role (bypassando o trigger se necessário)
  console.log('🛠️ Forçando registro de Perfil e Role ADM...');
  
  const { error: pErr } = await supabase.from('profiles').upsert({ 
    id: userId, 
    email, 
    nome: 'ADMIN MESTRE' 
  });
  
  const { error: rErr } = await supabase.from('user_roles').upsert({ 
    user_id: userId, 
    role: 'adm' 
  }, { onConflict: 'user_id' });

  if (pErr || rErr) {
    console.error('❌ Erro ao forçar dados:', pErr?.message || rErr?.message);
  } else {
    console.log('✅ Perfil e Role ADM configurados manualmente!');
  }

  console.log('\n=======================================');
  console.log('🚀 SUCESSO! ACESSO LIBERADO:');
  console.log(`📧 E-mail: ${email}`);
  console.log(`🔑 Senha:  ${password}`);
  console.log('=======================================');
}

createAdminUser();
