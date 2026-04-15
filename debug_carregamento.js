// Script para debug do carregamento infinito
// Cole no console do navegador (F12 > Console)

console.log('=== DEBUG CARREGAMENTO INFINITO ===');

// 1. Verificar estado do usuário
console.log('1. Verificando estado do usuário...');
supabase.auth.getUser().then(result => {
  console.log('Usuário atual:', result);
});

// 2. Verificar localStorage
console.log('2. Verificando localStorage...');
const adminKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('admin_')) {
    adminKeys.push(key);
  }
}
console.log('Chaves de admin no localStorage:', adminKeys);

// 3. Verificar se há loop infinito
console.log('3. Verificando se há loop infinito...');
let count = 0;
const interval = setInterval(() => {
  count++;
  console.log(`Loop ${count}: Verificando se ainda está carregando...`);
  
  if (count > 10) {
    console.log('❌ Possível loop infinito detectado!');
    clearInterval(interval);
  }
}, 1000);

// 4. Verificar se o problema é de timeout
console.log('4. Verificando timeouts...');
console.log('Se o problema for timeout, você verá: "Timeout na verificação de admin"');

// 5. Solução de emergência
console.log('5. Solução de emergência:');
console.log('Se estiver travado, execute:');
console.log('localStorage.clear(); window.location.reload();');

console.log('=== DEBUG INICIADO ===');
