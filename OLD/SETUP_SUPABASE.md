# Configuração do Supabase para LYB Controle Financeiro

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: LYB Controle Financeiro
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project"
6. Aguarde alguns minutos para o projeto ser criado

## 2. Configurar Variáveis de Ambiente

Após criar o projeto, você encontrará as credenciais em **Settings > API**:

### Para Desenvolvimento Local (.env)
Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
SITE_URL=http://localhost:5173
```

### Para Produção (Vercel)
No painel da Vercel, adicione as variáveis de ambiente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SITE_URL` (URL do seu domínio Vercel)
- `SUPABASE_SERVICE_ROLE_KEY` (para Edge Functions)

## 3. Executar Migrações

As migrações já estão prontas na pasta `supabase/migrations/`. Para aplicá-las:

1. **Via Supabase Dashboard** (Recomendado):
   - Acesse **SQL Editor** no painel do Supabase
   - Copie e execute cada arquivo SQL da pasta `migrations/` em ordem

2. **Via CLI** (Opcional):
   ```bash
   npx supabase db push
   ```

## 4. Configurar Edge Functions

1. No painel do Supabase, vá em **Edge Functions**
2. Crie uma nova função chamada `invite-user`
3. Copie o código de `supabase/functions/invite-user/index.ts`
4. Configure as variáveis de ambiente da função:
   - `SITE_URL`: URL do seu site (localhost para dev, Vercel URL para produção)

## 5. Configurar Email (Opcional)

Para emails de convite funcionarem:

1. Vá em **Authentication > Settings**
2. Configure **Site URL** com sua URL de produção
3. Em **Email Templates**, personalize o template de convite
4. Para produção, configure um provedor de email (SendGrid, Resend, etc.)

## 6. Testar o Fluxo

1. **Admin cadastra usuário**: Use o painel administrativo
2. **Usuário recebe email**: Verifique a caixa de entrada
3. **Usuário clica no link**: Deve abrir a página de definição de senha
4. **Usuário define senha**: Após definir, é redirecionado para o app

## 7. Troubleshooting

### Erro "Edge Function returned a non-2xx status code"
- Verifique se a Edge Function `invite-user` está deployada
- Confirme se as variáveis de ambiente estão corretas
- Verifique os logs da função no painel do Supabase

### Link mágico não funciona
- Confirme se `SITE_URL` está correto
- Verifique se a rota `/set-password` está configurada
- Teste com `http://localhost:5173` para desenvolvimento

### Usuário não consegue definir senha
- Verifique se o usuário foi criado corretamente
- Confirme se as permissões RLS estão configuradas
- Verifique os logs de autenticação
