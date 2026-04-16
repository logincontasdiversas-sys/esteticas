// EMERGÊNCIA MÁXIMA - Parar QUALQUER loop
// Cole no console do navegador (F12 > Console)

console.log('=== EMERGÊNCIA MÁXIMA - PARANDO QUALQUER LOOP ===');

// 1. Parar TODOS os processos JavaScript
console.log('1. Parando todos os processos...');
for (let i = 1; i < 99999; i++) {
  clearInterval(i);
  clearTimeout(i);
}

// 2. Interceptar React.useEffect globalmente
if (window.React && window.React.useEffect) {
  const originalUseEffect = window.React.useEffect;
  window.React.useEffect = function(effect, deps) {
    console.log('🚫 useEffect BLOQUEADO GLOBALMENTE');
    return;
  };
  console.log('✅ useEffect bloqueado globalmente');
}

// 3. Interceptar React.useState globalmente
if (window.React && window.React.useState) {
  const originalUseState = window.React.useState;
  window.React.useState = function(initialState) {
    console.log('🚫 useState BLOQUEADO GLOBALMENTE');
    return [initialState, () => {}];
  };
  console.log('✅ useState bloqueado globalmente');
}

// 4. Limpar TUDO
console.log('2. Limpando todos os dados...');
localStorage.clear();
sessionStorage.clear();

// 5. Limpar caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}

// 6. Forçar reload com parâmetro único
console.log('3. Forçando reload com parâmetro único...');
const timestamp = Date.now();
window.location.href = window.location.origin + window.location.pathname + '?v=' + timestamp + '&emergency=true';

console.log('=== EMERGÊNCIA MÁXIMA APLICADA ===');
