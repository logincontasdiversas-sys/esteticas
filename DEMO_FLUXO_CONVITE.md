# Demo: Fluxo de Convite de Usuários (Sem Supabase)

## Como testar o fluxo completo:

### 1. Iniciar o Projeto
```bash
npx vite --host
```
Acesse: `http://localhost:5173`

### 2. Simular Login como Admin
- Na página de login, use qualquer email/senha
- O sistema está em modo demonstração, então aceita qualquer credencial

### 3. Testar Cadastro de Usuário
1. Vá para o painel administrativo
2. Clique em "Novo Usuário"
3. Preencha:
   - **Nome**: Maria Silva
   - **Email**: maria@exemplo.com
   - **Perfil**: Secretária
4. Clique em "Criar"

**Resultado**: Sistema simula o envio do convite (sem email real)

### 4. Simular Acesso ao Link Mágico
1. Acesse diretamente: `http://localhost:5173/set-password`
2. O sistema detecta que está em modo demonstração
3. Preencha a senha (mínimo 6 caracteres)
4. Clique em "Definir Senha e Entrar"

**Resultado**: Sistema simula a definição de senha e redireciona para o app

## O que está funcionando:

✅ **Interface completa** do fluxo de convite  
✅ **Validações** de formulário  
✅ **Simulação** de envio de convite  
✅ **Página** de definição de senha  
✅ **Navegação** entre telas  

## O que precisa do Supabase:

❌ **Envio real** de emails  
❌ **Autenticação** real  
❌ **Banco de dados** para persistir usuários  
❌ **Permissões** por role  

## Para ativar funcionalidade real:

1. Configure o Supabase (veja `SETUP_SUPABASE.md`)
2. Crie o arquivo `.env` com as credenciais
3. O sistema automaticamente detectará e usará o Supabase real

## Próximos Passos:

1. **Teste a demonstração** primeiro
2. **Configure o Supabase** quando quiser funcionalidade real
3. **Deploy na Vercel** para produção
