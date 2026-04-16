// Script para limpar completamente o cache e parar loops
// Cole este código no console do navegador (F12 > Console)

console.log('=== LIMPANDO CACHE COMPLETAMENTE ===');

// 1. Limpar localStorage
localStorage.clear();
console.log('✅ localStorage limpo');

// 2. Limpar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpo');

// 3. Limpar todos os cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies limpos');

// 4. Parar todos os intervalos e timeouts
for (let i = 1; i < 99999; i++) {
  clearInterval(i);
  clearTimeout(i);
}
console.log('✅ Intervalos e timeouts limpos');

// 5. Limpar cache do navegador
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
  console.log('✅ Cache do navegador limpo');
}

// 6. Forçar reload completo
console.log('🔄 Recarregando página...');
window.location.reload(true);

console.log('=== CACHE LIMPO COMPLETAMENTE ===');
