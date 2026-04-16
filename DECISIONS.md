# DECISÕES ARQUITETURAIS

## Auth + Convites
- **Uso de Supabase Auth Admin via Edge Functions**: Decidido para permitir que gestores convidem novos membros sem que estes precisem de uma conta prévia pública.
- **Problema conhecido**: Race condition entre a criação no Auth e a gravação do perfil no Database (PostgreSQL).
- **Solução adotada**: Fluxo bloqueante com `await` (Omega Stability v5.0), garantindo que o perfil exista antes do envio do e-mail.

## Multi-tenancy
- **Isolamento por organization_id obrigatório**: O sistema é 100% dependente da separação de dados por organização.
- **Segurança**: Nunca confiar no client para definir o `organization_id`; este dado é injetado via JWT Claims (user_metadata) ou buscado diretamente no banco via RLS.

## Dashboard
- **Dependência de Contexto**: O Dashboard depende 100% de um `organization_id` válido no contexto global.
- **Tratamento de Erros**: Qualquer ausência de organização após o login é tratada como erro crítico, redirecionando o usuário para validação.

## Filosofia de Desenvolvimento
- **Estabilidade sobre Novidades**: Priorizar o funcionamento perfeito do que já existe antes de implementar novas features.
- **KISS (Keep It Simple, Stupid)**: Evitar overengineering e complexidade desnecessária nos módulos de autenticação e finanças.
