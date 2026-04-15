# Template de Email - Convite de Usuário

## Configuração no Supabase Dashboard:

1. **Vá para Authentication > Email Templates**
2. **Selecione "Invite user"**
3. **Substitua o conteúdo por:**

---

**Subject:** 🎉 Convite para o Sistema LYB Controle Financeiro

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Convite LYB</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #218838; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">💼 LYB Controle Financeiro</div>
            <p>Estética LYB - Sistema de Gestão</p>
        </div>
        
        <div class="content">
            <h2>🎉 Você foi convidado!</h2>
            
            <p>Olá! Você foi convidado para acessar o <strong>Sistema LYB Controle Financeiro</strong> da Estética LYB.</p>
            
            <p>Este sistema permite o controle completo do caixa, lançamentos financeiros e gestão de profissionais da estética.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    🚀 Aceitar Convite e Criar Conta
                </a>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>📋 O que você poderá fazer:</h3>
                <ul>
                    <li>✅ Registrar lançamentos financeiros</li>
                    <li>✅ Controlar entradas e saídas</li>
                    <li>✅ Gerenciar profissionais</li>
                    <li>✅ Visualizar relatórios</li>
                    <li>✅ Acompanhar o fluxo de caixa</li>
                </ul>
            </div>
            
            <p><strong>⚠️ Importante:</strong> Este link é válido por 24 horas. Se não conseguir acessar, solicite um novo convite ao administrador.</p>
            
            <p>Se você não esperava este convite, pode ignorar este email com segurança.</p>
        </div>
        
        <div class="footer">
            <p>💼 <strong>LYB Controle Financeiro</strong></p>
            <p>Estética LYB - Sistema de Gestão Financeira</p>
            <p>Este é um email automático, não responda.</p>
        </div>
    </div>
</body>
</html>
```

---

## 2. Template de Confirmação de Email (Confirm signup):

**Subject:** ✅ Confirme seu cadastro no LYB Controle Financeiro

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmação LYB</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #0056b3; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✅ LYB Controle Financeiro</div>
            <p>Confirmação de Cadastro</p>
        </div>
        
        <div class="content">
            <h2>🎉 Bem-vindo ao LYB!</h2>
            
            <p>Olá! Seu cadastro no <strong>Sistema LYB Controle Financeiro</strong> está quase completo.</p>
            
            <p>Para finalizar sua conta e começar a usar o sistema, confirme seu email clicando no botão abaixo:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    ✅ Confirmar Email e Ativar Conta
                </a>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>🔐 Próximos Passos:</h3>
                <ol>
                    <li>Clique no botão acima para confirmar seu email</li>
                    <li>Defina uma senha segura para sua conta</li>
                    <li>Faça login no sistema</li>
                    <li>Comece a usar o LYB Controle Financeiro!</li>
                </ol>
            </div>
            
            <p><strong>⏰ Prazo:</strong> Este link expira em 24 horas.</p>
            
            <p>Se você não criou esta conta, pode ignorar este email com segurança.</p>
        </div>
        
        <div class="footer">
            <p>💼 <strong>LYB Controle Financeiro</strong></p>
            <p>Estética LYB - Sistema de Gestão Financeira</p>
            <p>Este é um email automático, não responda.</p>
        </div>
    </div>
</body>
</html>
```

---

## 3. Template de Reset de Senha (Reset password):

**Subject:** 🔐 Redefinir senha - LYB Controle Financeiro

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Senha LYB</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #c82333; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐 LYB Controle Financeiro</div>
            <p>Redefinição de Senha</p>
        </div>
        
        <div class="content">
            <h2>🔑 Redefinir sua senha</h2>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Sistema LYB Controle Financeiro</strong>.</p>
            
            <p>Se você solicitou esta redefinição, clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    🔐 Redefinir Senha
                </a>
            </div>
            
            <div style="background: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>⚠️ Importante:</h3>
                <ul>
                    <li>Este link é válido por apenas 1 hora</li>
                    <li>Use uma senha forte e única</li>
                    <li>Não compartilhe este link com ninguém</li>
                </ul>
            </div>
            
            <p><strong>Se você não solicitou esta redefinição:</strong> Pode ignorar este email com segurança. Sua senha atual permanece inalterada.</p>
        </div>
        
        <div class="footer">
            <p>💼 <strong>LYB Controle Financeiro</strong></p>
            <p>Estética LYB - Sistema de Gestão Financeira</p>
            <p>Este é um email automático, não responda.</p>
        </div>
    </div>
</body>
</html>
```

---

## 📋 **COMO APLICAR NO SUPABASE:**

### **1. Acesse o Dashboard do Supabase**
### **2. Vá para Authentication > Email Templates**
### **3. Para cada template:**
   - **Invite user** → Cole o primeiro template
   - **Confirm signup** → Cole o segundo template  
   - **Reset password** → Cole o terceiro template
### **4. Salve as alterações**

## 🎯 **RESULTADO:**

- ✅ **Emails em português** - Totalmente personalizados
- ✅ **Design profissional** - Visual atrativo e moderno
- ✅ **Branding LYB** - Identidade visual da empresa
- ✅ **Instruções claras** - Usuários sabem o que fazer
- ✅ **Responsivo** - Funciona em qualquer dispositivo

**Aplique esses templates no Supabase e teste o convite de usuário!** 🚀
