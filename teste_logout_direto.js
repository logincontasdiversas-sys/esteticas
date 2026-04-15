// Teste direto de logout - Cole no console do navegador (F12 > Console)

console.log('=== TESTE DIRETO DE LOGOUT ===');

// 1. Verificar estado atual
console.log('1. Estado atual do usuário:');
supabase.auth.getUser().then(result => {
  console.log('Usuário atual:', result);
});

// 2. Verificar localStorage
console.log('2. Verificando localStorage:');
const supabaseKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.startsWith('sb-') || key.startsWith('admin_'))) {
    supabaseKeys.push(key);
  }
}
console.log('Chaves do Supabase no localStorage:', supabaseKeys);

// 3. Testar logout simples
console.log('3. Testando logout simples...');
supabase.auth.signOut()
  .then(result => {
    console.log('Resultado do logout:', result);
  })
  .catch(error => {
    console.error('Erro no logout:', error);
  });

// 4. Função de logout manual (se o Supabase falhar)
function logoutManual() {
  console.log('4. Executando logout manual...');
  
  // Limpar localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('sb-') || key.startsWith('admin_'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('localStorage limpo:', keysToRemove);
  
  // Redirecionar para auth
  console.log('Redirecionando para auth...');
  window.location.href = '/auth';
}

// 5. Botão para logout manual (se necessário)
console.log('5. Se o logout automático falhar, execute: logoutManual()');
console.log('   Ou clique no botão de logout no app novamente');

console.log('=== TESTE CONCLUÍDO ===');
