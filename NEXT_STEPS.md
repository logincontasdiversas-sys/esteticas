# ESTADO ATUAL
Sistema funcional, porém com instabilidades no fluxo de convite.
Bloqueio principal: sincronização Auth ↔ Database.

# PRÓXIMOS PASSOS (ESTABILIZAÇÃO)

## Prioridade 0: Autenticação & Convites
- [ ] **Deploy da Edge Function**: Realizar o deploy da nova versão bloqueante (`await`) da função `invite-user`.
- [ ] **Teste de Stress de Ativação**: Gerar um novo convite e validar se o redirecionamento para o Dashboard ocorre sem erros de "Organization missing".
- [ ] **Validação de Metadata**: Confirmar se o `user_metadata` está sendo injetado corretamente na sessão JWT durante o primeiro login.

## Prioridade 1: Observabilidade
- [ ] **Audit Logs de Convite**: Garantir que cada tentativa de convite (sucesso ou falha) seja registrada na tabela `audit_logs`.
- [ ] **Monitoramento de Erros**: Implementar captura de erros de auth no Discord Sentinel para alertas em tempo real.

## Prioridade 2: Fluxo Financeiro
- [ ] **Revisão de Lançamentos**: Testar se os novos usuários criados pela Edge Function conseguem realizar lançamentos financeiros imediatamente (permissões de RLS).

---
> [!IMPORTANT]
> O foco imediato é o **Deploy da Edge Function** para validar se as correções de sincronia resolvem o travamento na tela de senha.
