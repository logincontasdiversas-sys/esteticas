import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iuvsjjqotuhcrnofcoug.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dnNqanFvdHVoY3Jub2Zjb3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NDM2OCwiZXhwIjoyMDc1ODIwMzY4fQ.nYUSyLjDK_rgAvZ7YhS9yC7EX13obSFLcLiBifwLfBs';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminUser() {
  const email = 'admin@lyb.com';
  const password = 'adm12345';

  console.log(`🚀 Iniciando criação de administrador mestre para: ${email}`);

  // 1. Criar ou obter usuário no Auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome: 'Administrador Mestre' }
  });

  let userId = userData?.user?.id;

  if (userError) {
    if (userError.message.includes('already registered')) {
      console.log('ℹ️ Usuário já existe no Auth. Recuperando ID...');
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        userId = user.id;
        console.log('ℹ️ ID recuperado:', userId);
        // Resetamos a senha para garantir o acesso solicitado
        await supabase.auth.admin.updateUserById(userId, { password });
      } else {
        console.error('❌ Falha ao encontrar usuário existente.');
        return;
      }
    } else {
      console.error('❌ Erro ao criar usuário no Auth:', userError.message);
      return;
    }
  } else {
    console.log('✅ Usuário criado no Auth.');
  }

  // 2. Garantir Perfil na tabela 'profiles'
  console.log('🛠️ Garantindo registro na tabela "profiles"...');
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ 
      id: userId, 
      email: email, 
      nome: 'Administrador Mestre',
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('❌ Erro na tabela profiles:', profileError.message);
  } else {
    console.log('✅ Perfil configurado.');
  }

  // 3. Garantir Role de 'adm' na tabela 'user_roles'
  console.log('🔐 Atribuindo permissão "adm"...');
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({ 
      user_id: userId, 
      role: 'adm' 
    }, { onConflict: 'user_id' });

  if (roleError) {
    console.error('❌ Erro ao atribuir role:', roleError.message);
  } else {
    console.log('✅ Role ADM configurada.');
    console.log('\n=======================================');
    console.log('🚀 SUCESSO! ACESSO LIBERADO:');
    console.log(`📧 E-mail: ${email}`);
    console.log(`🔑 Senha:  ${password}`);
    console.log('=======================================');
  }
}

createAdminUser();
