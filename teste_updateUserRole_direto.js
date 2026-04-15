// Script para testar a função updateUserRole diretamente
// Cole este código no console do navegador (F12 > Console)

console.log('=== TESTE DIRETO DA FUNÇÃO updateUserRole ===');

// 1. Verificar se a função está disponível
console.log('1. Verificando se updateUserRole está disponível...');

// 2. Simular a chamada da função (você precisará importar ou acessar de alguma forma)
console.log('2. Para testar a função updateUserRole, você precisa:');
console.log('   - Ir para o painel admin');
console.log('   - Tentar promover um usuário');
console.log('   - Observar os logs detalhados no console');

// 3. Verificar se conseguimos acessar o Supabase
console.log('3. Testando acesso ao Supabase...');
supabase
  .from('profiles')
  .select('count')
  .then(result => {
    console.log('✅ Supabase acessível:', result);
  })
  .catch(error => {
    console.error('❌ Erro ao acessar Supabase:', error);
  });

// 4. Verificar usuário atual
console.log('4. Verificando usuário atual...');
supabase.auth.getUser().then(result => {
  console.log('Usuário atual:', result);
});

console.log('=== INSTRUÇÕES ===');
console.log('1. Vá para o painel admin no app');
console.log('2. Tente promover o William de "gestora" para "adm"');
console.log('3. Observe os logs detalhados que aparecerão no console');
console.log('4. Me informe o que aparece nos logs');
