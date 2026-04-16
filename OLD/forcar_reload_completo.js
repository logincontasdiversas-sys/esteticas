// FORÇAR RELOAD COMPLETO - Cole no console do navegador (F12 > Console)

console.log('=== FORÇANDO RELOAD COMPLETO ===');

// 1. Parar TUDO
console.log('1. Parando todos os processos...');
for (let i = 1; i < 99999; i++) {
  clearInterval(i);
  clearTimeout(i);
}

// 2. Limpar TUDO
console.log('2. Limpando todos os dados...');
localStorage.clear();
sessionStorage.clear();

// 3. Limpar caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}

// 4. Forçar reload com cache limpo
console.log('3. Forçando reload com cache limpo...');
window.location.href = window.location.href + '?t=' + Date.now();

console.log('=== RELOAD FORÇADO ===');
