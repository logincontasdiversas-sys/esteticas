// EMERGÊNCIA: Parar loop definitivamente
// Cole no console do navegador (F12 > Console)

console.log('=== EMERGÊNCIA: PARANDO LOOP ===');

// 1. Parar todos os intervalos e timeouts
console.log('1. Parando todos os intervalos e timeouts...');
for (let i = 1; i < 99999; i++) {
  clearInterval(i);
  clearTimeout(i);
}
console.log('✅ Intervalos e timeouts limpos');

// 2. Limpar localStorage completamente
console.log('2. Limpando localStorage...');
localStorage.clear();
console.log('✅ localStorage limpo');

// 3. Limpar sessionStorage
console.log('3. Limpando sessionStorage...');
sessionStorage.clear();
console.log('✅ sessionStorage limpo');

// 4. Limpar todos os caches
console.log('4. Limpando caches...');
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}
console.log('✅ Caches limpos');

// 5. Forçar reload com cache limpo
console.log('5. Recarregando com cache limpo...');
window.location.reload(true);

console.log('=== EMERGÊNCIA APLICADA ===');
console.log('A página deve recarregar agora sem loop...');
