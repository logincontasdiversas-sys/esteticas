// EMERGÊNCIA: Parar loop imediatamente
// Cole este código no console do navegador (F12 > Console)

console.log('🚨 EMERGÊNCIA: Parando loop imediatamente');

// 1. Parar todos os intervalos e timeouts
for (let i = 1; i < 99999; i++) {
  clearInterval(i);
  clearTimeout(i);
}

// 2. Limpar tudo
localStorage.clear();
sessionStorage.clear();

// 3. Parar React
if (window.React) {
  console.log('🛑 Parando React...');
  // Interceptar useState
  const originalUseState = window.React.useState;
  window.React.useState = function(initialState) {
    console.log('🚫 useState BLOQUEADO');
    return [initialState, () => {}];
  };
  
  // Interceptar useEffect
  const originalUseEffect = window.React.useEffect;
  window.React.useEffect = function(effect, deps) {
    console.log('🚫 useEffect BLOQUEADO');
    return;
  };
}

// 4. Forçar reload
console.log('🔄 Recarregando página...');
window.location.reload(true);
