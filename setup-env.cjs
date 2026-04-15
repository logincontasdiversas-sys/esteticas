#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ler o arquivo de configuração
const configPath = path.join(__dirname, 'config-supabase.env');
const envPath = path.join(__dirname, '.env');

try {
  // Ler o conteúdo do arquivo de configuração
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Escrever no arquivo .env
  fs.writeFileSync(envPath, configContent);
  
  console.log('✅ Arquivo .env criado com sucesso!');
  console.log('📁 Localização:', envPath);
  console.log('🔧 Variáveis configuradas:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - VITE_SUPABASE_ANON_KEY');
  console.log('   - SITE_URL');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env:', error.message);
  process.exit(1);
}
