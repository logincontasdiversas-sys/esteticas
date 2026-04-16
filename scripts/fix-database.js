
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltam credenciais no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ORG_ID = '9da28701-9aca-4f74-903c-ca7492a831d2';
const ORG_NAME = 'LYB Estética';
const OWNER_EMAIL = 'will89.rmadrid@gmail.com';

async function fixDatabase() {
  console.log(`🚀 Iniciando reparo soberano para a organização: ${ORG_NAME}`);

  try {
    // 1. Upsert na tabela organizations
    console.log(`📡 Sincronizando tabela 'organizations' para o ID: ${ORG_ID}...`);
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: ORG_ID,
        name: ORG_NAME,
        slug: 'lyb-estetica'
      }, { onConflict: 'id' })
      .select()
      .single();

    if (orgError) {
      console.error('❌ Erro ao sincronizar organização:', orgError);
    } else {
      console.log('✅ Organização sincronizada com sucesso:', org);
    }

    // 2. Garantir que o perfil do David tem o role 'gestora' e está vinculado
    console.log(`📡 Vinculando perfil ${OWNER_EMAIL} à organização...`);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        organization_id: ORG_ID,
        role: 'gestora' // Garantindo que ele é o gestor para aparecer nos dashboards
      })
      .ilike('email', OWNER_EMAIL)
      .select();

    if (profileError) {
      console.error('❌ Erro ao vincular perfil:', profileError);
    } else {
      console.log('✅ Perfil vinculado com sucesso:', profile);
    }

    console.log('\n✨ Reparo concluído! David, agora dê um F5 no sistema.');
  } catch (error) {
    console.error('💥 Erro catastrófico no script de reparo:', error);
  }
}

fixDatabase();
