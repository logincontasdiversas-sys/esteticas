# 🚀 Configuração Rápida - LYB Controle Financeiro

## ✅ Suas credenciais já estão prontas!

### Passo 1: Criar arquivo .env
1. **Copie** o conteúdo do arquivo `config-supabase.env`
2. **Crie** um arquivo `.env` na raiz do projeto
3. **Cole** o conteúdo no arquivo `.env`

### Passo 2: Configurar Banco de Dados
1. Acesse: [https://supabase.com/dashboard/project/iuvsjjqotuhcrnofcoug](https://supabase.com/dashboard/project/iuvsjjqotuhcrnofcoug)
2. Vá em **SQL Editor**
3. Copie TODO o conteúdo do arquivo `SETUP_DATABASE_COMPLETO.sql`
4. Cole no SQL Editor e clique **"Run"**
5. Aguarde executar (1-2 minutos)

### Passo 3: Configurar Edge Function
1. No Supabase, vá em **Edge Functions**
2. Clique **"Create a new function"**
3. **Name**: `invite-user`
4. Copie o código de `supabase/functions/invite-user/index.ts`
5. **Deploy** a função

### Passo 4: Configurar Authentication
1. Vá em **Authentication** → **Settings**
2. **Site URL**: `http://localhost:5173`
3. **Redirect URLs**: Adicione `http://localhost:5173/set-password`

### Passo 5: Testar
1. **Reinicie o servidor**: `npx vite --host`
2. **Acesse**: `http://localhost:5173`
3. **Teste o fluxo completo**:
   - Faça login (primeiro usuário será gestora)
   - Vá no painel admin
   - Cadastre um usuário
   - Verifique se não há mais erros

## 🎯 Checklist Final
- [ ] Arquivo `.env` criado
- [ ] Banco de dados configurado
- [ ] Edge Function deployada
- [ ] Authentication configurado
- [ ] Teste funcionando

## 🆘 Se houver problemas:
1. **Console do navegador** (F12) para erros
2. **Supabase Logs** → **Edge Functions** para erros da função
3. **Verifique** se todas as credenciais estão corretas no `.env`

## 🎉 Próximos Passos:
1. **Teste completo** do fluxo
2. **Deploy na Vercel** para produção
3. **Configurar URLs** de produção
