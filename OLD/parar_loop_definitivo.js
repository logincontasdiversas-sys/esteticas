// PARAR LOOP DEFINITIVO - Cole no console do navegador (F12 > Console)

console.log('=== PARANDO LOOP DEFINITIVO ===');

// 1. Parar TODOS os intervalos e timeouts
console.log('1. Parando todos os processos...');
for (let i = 1; i < 99999; i++) {
  clearInterval(i);
  clearTimeout(i);
}

// 2. Limpar TUDO
console.log('2. Limpando todos os dados...');
localStorage.clear();
sessionStorage.clear();

// 3. Limpar caches do navegador
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}

// 4. Forçar reload com parâmetro único
console.log('3. Forçando reload com parâmetro único...');
const timestamp = Date.now();
window.location.href = window.location.origin + window.location.pathname + '?v=' + timestamp;

console.log('=== LOOP PARADO ===');
