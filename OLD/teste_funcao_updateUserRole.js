// Teste da função updateUserRole - Cole no console do navegador (F12 > Console)

console.log('=== TESTE DA FUNÇÃO updateUserRole ===');

// Simular a função updateUserRole
async function testUpdateUserRole(userId, newRole) {
  try {
    console.log('🔄 [TESTE] Atualizando role do usuário:', { userId, newRole });
    
    // Verificar usuário atual
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    console.log('👤 [TESTE] Usuário atual:', currentUser?.email);
    
    if (!currentUser) {
      console.error('❌ [TESTE] Usuário não autenticado!');
      return { data: null, error: { message: 'Usuário não autenticado' } };
    }
    
    // Testar leitura primeiro
    console.log('🔄 [TESTE] Testando leitura da tabela...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, nome, role')
      .eq('id', userId)
      .single();
    
    console.log('📊 [TESTE] Teste de leitura:', { testData, testError });
    
    if (testError) {
      console.error('❌ [TESTE] Erro ao ler tabela:', testError);
      return { data: null, error: testError };
    }
    
    // Fazer a atualização
    console.log('🔄 [TESTE] Executando atualização...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    console.log('📊 [TESTE] Resultado da atualização:', { updateData, updateError });
    
    if (updateError) {
      console.error('❌ [TESTE] Erro na atualização:', updateError);
      return { data: null, error: updateError };
    }
    
    console.log('✅ [TESTE] Atualização bem-sucedida!');
    return { data: updateData, error: null };
    
  } catch (error) {
    console.error('❌ [TESTE] Erro geral:', error);
    return { data: null, error };
  }
}

// Executar o teste
console.log('Executando teste da função updateUserRole...');
testUpdateUserRole('b9edee45-0bf5-46c5-b381-2cfe54742c42', 'adm')
  .then(result => {
    console.log('Resultado final:', result);
    console.log('=== TESTE CONCLUÍDO ===');
  });
