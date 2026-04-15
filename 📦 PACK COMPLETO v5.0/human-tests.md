# 🧪 HUMAN TESTS v6.0

## NÍVEL 1 — Interface Básica
- [ ] Clicar em todos os botões principais
- [ ] Verificar se as respostas/ações são as esperadas
- [ ] Testar fluxos normais do usuário

## NÍVEL 2 — Acesso Direto (URL/IDOR)
Testar URLs e IDs:
- /admin, /dashboard, /user/999, etc.
- Esperado: bloqueio ou redirecionamento correto

## NÍVEL 3 — Ataques Manuais (CURL / DevTools)
Testar:
- IDOR (acessar recurso de outro usuário)
- Injection (SQL, XSS via inputs)
- Race condition (múltiplas requisições simultâneas)
- Upload de arquivos maliciosos
- Manipulação de parâmetros

## REGRA DE OURO
Se algo estranho, inesperado ou suspeito acontecer:
→ Reportar imediatamente
→ Não ignorar
→ Marcar como potencial vulnerabilidade