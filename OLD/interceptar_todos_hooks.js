// Interceptar TODOS os hooks React para parar loops
// Cole este código no console do navegador (F12 > Console)

console.log('=== INTERCEPTANDO TODOS OS HOOKS REACT ===');

// 1. Interceptar React.useEffect
if (window.React && window.React.useEffect) {
  const originalUseEffect = window.React.useEffect;
  window.React.useEffect = function(effect, deps) {
    console.log('🚫 useEffect BLOQUEADO:', effect.toString().substring(0, 50) + '...');
    return;
  };
  console.log('✅ useEffect interceptado');
}

// 2. Interceptar React.useState
if (window.React && window.React.useState) {
  const originalUseState = window.React.useState;
  window.React.useState = function(initialState) {
    console.log('🚫 useState BLOQUEADO');
    return [initialState, () => {}];
  };
  console.log('✅ useState interceptado');
}

// 3. Interceptar React.useCallback
if (window.React && window.React.useCallback) {
  const originalUseCallback = window.React.useCallback;
  window.React.useCallback = function(callback, deps) {
    console.log('🚫 useCallback BLOQUEADO');
    return callback;
  };
  console.log('✅ useCallback interceptado');
}

// 4. Interceptar React.useMemo
if (window.React && window.React.useMemo) {
  const originalUseMemo = window.React.useMemo;
  window.React.useMemo = function(factory, deps) {
    console.log('🚫 useMemo BLOQUEADO');
    return factory();
  };
  console.log('✅ useMemo interceptado');
}

// 5. Parar todos os intervalos e timeouts
for (let i = 1; i < 99999; i++) {
  clearInterval(i);
  clearTimeout(i);
}

// 6. Limpar tudo
localStorage.clear();
sessionStorage.clear();

// 7. Forçar reload
console.log('🔄 Recarregando página...');
window.location.reload(true);

console.log('=== TODOS OS HOOKS INTERCEPTADOS ===');
