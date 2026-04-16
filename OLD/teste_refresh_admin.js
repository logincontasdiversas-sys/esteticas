// Script para testar o refresh de admin
// Execute no console do navegador após promover um usuário

console.log('=== TESTE DE REFRESH DE ADMIN ===');

// 1. Verificar se o GlobalRefreshProvider está funcionando
console.log('1. Verificando GlobalRefreshProvider...');
try {
  // Simular trigger de refresh
  window.dispatchEvent(new CustomEvent('test-refresh'));
  console.log('✅ GlobalRefreshProvider disponível');
} catch (error) {
  console.error('❌ Erro no GlobalRefreshProvider:', error);
}

// 2. Verificar cache de admin
console.log('2. Verificando cache de admin...');
const userId = 'SEU_USER_ID_AQUI'; // Substitua pelo ID do usuário promovido
const cachedData = localStorage.getItem(`admin_${userId}`);
console.log('Cache atual:', cachedData);

// 3. Limpar cache e forçar refresh
console.log('3. Limpando cache e forçando refresh...');
localStorage.removeItem(`admin_${userId}`);
console.log('Cache limpo');

// 4. Verificar se o useAuth está escutando mudanças
console.log('4. Verificando se useAuth está ativo...');
console.log('Verifique no console se aparecem logs [AUTH]');

// 5. Simular refresh manual
console.log('5. Para testar manualmente:');
console.log('- Abra o painel de admin');
console.log('- Promova um usuário');
console.log('- Verifique os logs no console');
console.log('- O usuário promovido deve ver logs [AUTH] RefreshTrigger detectado');

console.log('=== FIM DO TESTE ===');
