// Script para testar promoção do William no console do navegador
// Cole este código no console do navegador (F12 > Console)

console.log('=== TESTE DE PROMOÇÃO DO WILLIAM ===');

// 1. Verificar se o Supabase está disponível
console.log('1. Verificando Supabase...');
console.log('Supabase disponível:', typeof window.supabase !== 'undefined');

// 2. Verificar estado atual do William
console.log('2. Verificando estado atual do William...');
supabase
  .from('profiles')
  .select('id, nome, email, role, updated_at')
  .eq('id', 'b9edee45-0bf5-46c5-b381-2cfe54742c42')
  .single()
  .then(result => {
    console.log('Estado atual do William:', result);
  })
  .catch(error => {
    console.error('Erro ao verificar William:', error);
  });

// 3. Testar atualização para admin
console.log('3. Testando atualização para admin...');
supabase
  .from('profiles')
  .update({ 
    role: 'adm', 
    updated_at: new Date().toISOString() 
  })
  .eq('id', 'b9edee45-0bf5-46c5-b381-2cfe54742c42')
  .select()
  .single()
  .then(result => {
    console.log('✅ Atualização bem-sucedida:', result);
    
    // 4. Verificar se realmente mudou
    console.log('4. Verificando se a mudança foi persistida...');
    return supabase
      .from('profiles')
      .select('id, nome, email, role, updated_at')
      .eq('id', 'b9edee45-0bf5-46c5-b381-2cfe54742c42')
      .single();
  })
  .then(result => {
    console.log('Estado final do William:', result);
    console.log('=== TESTE CONCLUÍDO ===');
  })
  .catch(error => {
    console.error('❌ Erro na atualização:', error);
    console.log('=== TESTE FALHOU ===');
  });
