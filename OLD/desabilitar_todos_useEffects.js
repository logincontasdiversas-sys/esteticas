// Script para desabilitar todos os useEffects problemáticos
// Execute este script no console do navegador (F12 > Console)

console.log('=== DESABILITANDO TODOS OS USEEFFECTS ===');

// 1. Interceptar React.useEffect
const originalUseEffect = React.useEffect;
React.useEffect = function(effect, deps) {
  console.log('🚫 useEffect BLOQUEADO:', effect.toString().substring(0, 100) + '...');
  // Não executar o useEffect
  return;
};

// 2. Interceptar useState também para evitar re-renders
const originalUseState = React.useState;
React.useState = function(initialState) {
  console.log('🚫 useState BLOQUEADO');
  return [initialState, () => {}];
};

// 3. Limpar localStorage
localStorage.clear();
sessionStorage.clear();

// 4. Forçar reload
console.log('🔄 Recarregando página...');
window.location.reload(true);

console.log('=== USEEFFECTS DESABILITADOS ===');
