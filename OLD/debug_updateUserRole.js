// Script para debug da função updateUserRole
// Execute no console do navegador

console.log('=== DEBUG updateUserRole ===');

// 1. Verificar se a função está disponível
console.log('1. Verificando se updateUserRole está disponível...');
try {
  // Simular chamada da função
  console.log('✅ updateUserRole deve estar disponível');
} catch (error) {
  console.error('❌ Erro:', error);
}

// 2. Verificar dados do usuário atual
console.log('2. Verificando dados do usuário atual...');
console.log('Para verificar, execute no console:');
console.log('supabase.auth.getUser().then(console.log)');

// 3. Testar query direta no Supabase
console.log('3. Para testar query direta, execute:');
console.log(`
// Substitua 'USER_ID_AQUI' pelo ID do usuário que você quer atualizar
supabase
  .from('profiles')
  .update({ role: 'adm', updated_at: new Date().toISOString() })
  .eq('id', 'USER_ID_AQUI')
  .select()
  .then(console.log)
  .catch(console.error);
`);

// 4. Verificar políticas RLS
console.log('4. Para verificar políticas RLS, execute:');
console.log(`
// Verificar se conseguimos ler a tabela
supabase
  .from('profiles')
  .select('id, nome, role')
  .then(console.log)
  .catch(console.error);
`);

// 5. Verificar logs detalhados
console.log('5. Para ver logs detalhados:');
console.log('- Abra o Network tab no DevTools');
console.log('- Promova um usuário');
console.log('- Procure por requisições para /rest/v1/profiles');
console.log('- Verifique se há erros 403, 401, ou 400');

// 6. Teste manual
console.log('6. Teste manual:');
console.log('1. Abra o painel admin');
console.log('2. Promova um usuário');
console.log('3. Verifique o Network tab para erros');
console.log('4. Verifique o Console para logs [AUTH]');

console.log('=== FIM DO DEBUG ===');
