// Teste simples de promoção - Cole no console do navegador (F12 > Console)

console.log('=== TESTE SIMPLES DE PROMOÇÃO ===');

// 1. Verificar William atual
console.log('1. Verificando William atual...');
supabase
  .from('profiles')
  .select('id, nome, role')
  .eq('id', 'b9edee45-0bf5-46c5-b381-2cfe54742c42')
  .single()
  .then(william => {
    console.log('William atual:', william);
    
    // 2. Atualizar para admin
    console.log('2. Atualizando William para admin...');
    return supabase
      .from('profiles')
      .update({ role: 'adm' })
      .eq('id', 'b9edee45-0bf5-46c5-b381-2cfe54742c42')
      .select();
  })
  .then(result => {
    console.log('Resultado da atualização:', result);
    
    // 3. Verificar se mudou
    console.log('3. Verificando se William virou admin...');
    return supabase
      .from('profiles')
      .select('id, nome, role')
      .eq('id', 'b9edee45-0bf5-46c5-b381-2cfe54742c42')
      .single();
  })
  .then(williamFinal => {
    console.log('William final:', williamFinal);
    
    if (williamFinal.data && williamFinal.data.role === 'adm') {
      console.log('🎉 SUCESSO! William é admin agora!');
    } else {
      console.log('❌ FALHA! William não virou admin.');
    }
  })
  .catch(error => {
    console.error('❌ Erro:', error);
  });
