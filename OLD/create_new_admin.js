import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iodltsabwyvuxxudxzky.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZGx0c2Fid3l2dXh4dWR4emt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI3NTY5NywiZXhwIjoyMDkxODUxNjk3fQ.ru3uUUE_HKwvPzGtaROTfHke8UIMrr2KftPGAr_VQAU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminUser() {
  const email = 'admin@lyb.com';
  const password = 'adm12345';

  console.log(`🚀 Criando administrador no NOVO projeto: ${email}`);

  // 1. Criar no Auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome: 'Administrador Mestre' }
  });

  if (userError) {
    console.error('❌ Erro no Auth:', userError.message);
    return;
  }

  const userId = userData.user.id;
  console.log('✅ Usuário auth criado:', userId);

  // O Trigger 'on_auth_user_created' que rodamos no SQL já deve ter criado o perfil e a role 'adm'
  // Mas vamos conferir se deu tudo certo:
  console.log('🔍 Validando perfil e role...');
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  const { data: role } = await supabase.from('user_roles').select('*').eq('user_id', userId).single();

  if (profile && role) {
    console.log(`✅ Perfil (${profile.nome}) e Role (${role.role}) confirmados pelo Trigger!`);
  } else {
    // Fallback caso o trigger tenha falhado
    console.log('⚠️ Trigger não criou o perfil/role automaticamente. Criando manualmente...');
    await supabase.from('profiles').upsert({ id: userId, email, nome: 'Administrador Mestre' });
    await supabase.from('user_roles').upsert({ user_id: userId, role: 'adm' });
  }

  console.log('\n=======================================');
  console.log('🚀 SUCESSO! ACESSO LIBERADO NO NOVO SUPABASE:');
  console.log(`📧 E-mail: ${email}`);
  console.log(`🔑 Senha:  ${password}`);
  console.log('=======================================');
}

createAdminUser();
