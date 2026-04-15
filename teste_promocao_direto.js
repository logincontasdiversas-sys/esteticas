// Script para testar promoção diretamente no console
// Cole este código no console do navegador (F12 > Console)

console.log('=== TESTE DIRETO DE PROMOÇÃO ===');

// 1. Verificar usuário atual
console.log('1. Verificando usuário atual...');
supabase.auth.getUser().then(result => {
  console.log('Usuário atual:', result);
});

// 2. Verificar estado atual do William
console.log('2. Verificando estado atual do William...');
supabase
  .from('profiles')
  .select('id, nome, email, role, updated_at')
  .eq('id', 'b9edee45-0bf5-46c5-b381-2cfe54742c42')
  .single()
  .then(result => {
    console.log('Estado atual do William:', result);
    
    // 3. Testar atualização para admin
    console.log('3. Testando atualização para admin...');
    return supabase
      .from('profiles')
      .update({ 
        role: 'adm', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', 'b9edee45-0bf5-46c5-b381-2cfe54742c42')
      .select()
      .single();
  })
  .then(result => {
    console.log('✅ Resultado da atualização:', result);
    
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
    
    if (result.data && result.data.role === 'adm') {
      console.log('🎉 SUCESSO! William foi promovido para admin!');
    } else {
      console.log('❌ FALHA! William não foi promovido.');
    }
    
    console.log('=== TESTE CONCLUÍDO ===');
  })
  .catch(error => {
    console.error('❌ Erro no teste:', error);
    console.log('=== TESTE FALHOU ===');
  });
