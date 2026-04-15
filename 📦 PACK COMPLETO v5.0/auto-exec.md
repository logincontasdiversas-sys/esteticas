# 🤖 AUTO-EXECUTION v6.0

## LOOP AUTOMÁTICO
Enquanto houver problema ou tarefa pendente:

1. Planejar com anti-regression
2. Implementar edição cirúrgica
3. Testar funcionalidade
4. Realizar Red Teaming (tentar quebrar)
5. Corrigir falhas
6. Validar o que já funcionava antes

## RED TEAM (OBRIGATÓRIO)
Testar sempre:
- Inputs inválidos e maliciosos
- IDOR e bypass de autorização
- Race conditions
- Abuso de lógica de negócio
- Injection (SQL, XSS)
- Accesso indevido a rotas sensíveis

## PARAR APENAS QUANDO
- Sistema está funcional
- Todas as funcionalidades antigas continuam funcionando
- Não existem falhas críticas de segurança
- Red Teaming não encontrou vulnerabilidades graves

## MODO SEGURO
Sempre priorizar estabilidade sobre novas features.