import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env is in the same directory
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('--- Criando Usuário Mestre ---');
  
  const email = 'admin@lyb.com';
  const password = 'adm12345';

  // 1. Criar usuário no Auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome: 'Administrador Mestre' }
  });

  if (userError) {
    if (userError.message.includes('already registered')) {
      console.log('Usuário já existe. Tentando promover...');
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        await promoteUser(existingUser.id);
      }
    } else {
      console.error('Erro ao criar usuário:', userError.message);
    }
    return;
  }

  console.log('✅ Usuário auth criado com sucesso ID:', userData.user.id);
  await promoteUser(userData.user.id);
}

async function promoteUser(userId) {
  // 2. Garantir que o perfil existe
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      nome: 'Administrador Mestre',
      email: 'admin@lyb.com'
    });

  if (profileError) {
    console.error('Erro ao criar/atualizar perfil:', profileError.message);
  } else {
    console.log('✅ Perfil atualizado.');
  }

  // 3. Atribuir role de ADM
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: 'adm'
    }, { onConflict: 'user_id' });

  if (roleError) {
    console.error('Erro ao atribuir role adm:', roleError.message);
  } else {
    console.log('🚀 Usuário promovido a ADM com sucesso!');
    console.log('\n--- ACESSO LIBERADO ---');
    console.log('E-mail: admin@lyb.com');
    console.log('Senha:  adm12345');
  }
}

createAdminUser();
