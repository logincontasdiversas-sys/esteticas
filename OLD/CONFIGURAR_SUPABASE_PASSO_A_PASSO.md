# 🚀 Configuração Completa do Supabase - Passo a Passo

## Passo 1: Configurar o Projeto no Supabase

1. **Acesse o Supabase**: Vá para [https://supabase.com](https://supabase.com) e faça login
2. **Crie um novo projeto**:
   - Clique em **"New Project"**
   - **Name**: `LYB Controle Financeiro`
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: Escolha **South America (São Paulo)** se disponível
   - Clique em **"Create new project"**
3. **Aguarde** alguns minutos para o projeto ser criado

## Passo 2: Obter as Credenciais

No painel do Supabase:
1. Vá em **Settings** → **API**
2. **Copie as seguintes informações**:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (chave longa)
   - **service_role** key (chave longa - mantenha segura!)

## Passo 3: Configurar Variáveis de Ambiente

Na pasta do seu projeto, crie um arquivo `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Site URL for magic links
SITE_URL=http://localhost:5173

# Supabase Service Role Key (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

**Substitua** os valores pelos dados do seu projeto Supabase.

## Passo 4: Executar Migrações do Banco

1. No Supabase, vá em **SQL Editor**
2. Execute cada arquivo SQL da pasta `supabase/migrations/` em ordem:

### Migração 1: Tabelas básicas
```sql
-- Execute o conteúdo do arquivo: supabase/migrations/20251012025751_4eca48b7-241e-491b-9ff2-d49110154e00.sql
```

### Migração 2: Roles e permissões
```sql
-- Execute o conteúdo do arquivo: supabase/migrations/20251012031151_cbdec2f1-9fc0-41f2-a175-ae93d4cf2189.sql
```

### Continue com as outras migrações...

## Passo 5: Configurar Edge Function

1. No Supabase, vá em **Edge Functions**
2. Clique em **"Create a new function"**
3. **Name**: `invite-user`
4. **Copy and paste** o código de `supabase/functions/invite-user/index.ts`
5. **Deploy** a função

## Passo 6: Configurar Email (Opcional)

1. Vá em **Authentication** → **Settings**
2. **Site URL**: `http://localhost:5173` (para desenvolvimento)
3. **Redirect URLs**: Adicione `http://localhost:5173/set-password`

## Passo 7: Testar a Configuração

1. **Reinicie o servidor**:
   ```bash
   npx vite --host
   ```
2. **Acesse**: `http://localhost:5173`
3. **Teste o fluxo**:
   - Faça login
   - Vá no painel admin
   - Cadastre um usuário
   - Verifique se não há mais erros

## Passo 8: Verificar Logs

Se houver problemas:
1. **Console do navegador** (F12) para erros do frontend
2. **Supabase Logs** → **Edge Functions** para erros da função
3. **Supabase Logs** → **Auth** para problemas de autenticação

## ✅ Checklist Final

- [ ] Projeto criado no Supabase
- [ ] Arquivo `.env` configurado
- [ ] Migrações executadas
- [ ] Edge Function deployada
- [ ] Site URL configurado
- [ ] Teste funcionando

## 🆘 Troubleshooting

### Erro "Invalid API key"
- Verifique se as chaves no `.env` estão corretas
- Reinicie o servidor após alterar o `.env`

### Erro "Edge Function not found"
- Verifique se a função `invite-user` foi deployada
- Confirme se o nome está exatamente `invite-user`

### Link mágico não funciona
- Verifique se `SITE_URL` está correto no `.env`
- Confirme se a rota `/set-password` está acessível

## 🎯 Próximos Passos

Após configurar tudo:
1. **Teste o fluxo completo**
2. **Configure deploy na Vercel**
3. **Atualize as URLs** para produção
