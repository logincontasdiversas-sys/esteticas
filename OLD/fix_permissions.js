import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iodltsabwyvuxxudxzky.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZGx0c2Fid3l2dXh4dWR4emt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI3NTY5NywiZXhwIjoyMDkxODUxNjk3fQ.ru3uUUE_HKwvPzGtaROTfHke8UIMrr2KftPGAr_VQAU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixAdminPermission() {
  const email = 'admin@lyb.com';
  
  console.log(`🔍 Buscando usuário: ${email}`);
  
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.error('❌ Usuário não encontrado no Auth!');
    return;
  }
  
  const userId = user.id;
  console.log(`✅ ID encontrado: ${userId}`);

  // Forçar inserção sem o ON CONFLICT problemático
  console.log('🛠️ Vinculando role ADM...');
  
  // Primeiro removemos qualquer role existente para evitar duplicidade
  await supabase.from('user_roles').delete().eq('user_id', userId);
  
  // Inserimos a role de mestre
  const { error: roleError } = await supabase.from('user_roles').insert({
    user_id: userId,
    role: 'adm'
  });

  if (roleError) {
    console.error('❌ Erro ao atribuir role:', roleError.message);
  } else {
    console.log('✅ Role ADM atribuída com sucesso!');
  }

  // Garantir perfil
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email: email,
    nome: 'Administrador Mestre'
  });

  if (profileError) {
    console.error('❌ Erro no perfil:', profileError.message);
  } else {
    console.log('✅ Perfil confirmado!');
  }
}

fixAdminPermission();
