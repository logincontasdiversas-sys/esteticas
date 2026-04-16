// Script para limpar cache do Chrome
// Cole este código no console do Chrome (F12 > Console)

console.log('🧹 Limpando cache do Chrome...');

// 1. Limpar localStorage
localStorage.clear();
console.log('✅ localStorage limpo');

// 2. Limpar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpo');

// 3. Limpar cache do service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✅ Service Worker removido');
    }
  });
}

// 4. Forçar reload sem cache
console.log('🔄 Recarregando sem cache...');
window.location.reload(true);
