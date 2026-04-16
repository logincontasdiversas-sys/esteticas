// Script de emergência para resolver carregamento infinito
// Cole no console do navegador (F12 > Console)

console.log('=== FIX CARREGAMENTO INFINITO ===');

// 1. Limpar localStorage completamente
console.log('1. Limpando localStorage...');
localStorage.clear();
console.log('✅ localStorage limpo');

// 2. Limpar sessionStorage
console.log('2. Limpando sessionStorage...');
sessionStorage.clear();
console.log('✅ sessionStorage limpo');

// 3. Forçar reload da página
console.log('3. Recarregando página...');
window.location.reload();

console.log('=== FIX APLICADO ===');
console.log('A página deve recarregar agora...');
