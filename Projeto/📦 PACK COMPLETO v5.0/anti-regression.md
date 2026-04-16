# 🛡️ ANTI-REGRESSION v6.0

## REGRA PRINCIPAL
Código funcionando = NÃO PODE QUEBRAR

## ANTES DE QUALQUER ALTERAÇÃO
1. Identificar todas as funcionalidades que já funcionam
2. Listar os comportamentos esperados
3. Marcar explicitamente como "protegido"

## DURANTE A ALTERAÇÃO
- Fazer apenas edições cirúrgicas
- Alterar o mínimo possível
- Nunca reescrever arquivos inteiros
- Nunca refatorar código que já está funcionando

## DEPOIS DA ALTERAÇÃO
- Validar todas as funcionalidades que já funcionavam antes
- Testar cenários principais
- Se algo quebrar → rollback imediato + reportar

## PROIBIDO
- Refatorar sem necessidade explícita
- "Melhorar" código que já funciona
- Alterar múltiplas áreas ao mesmo tempo sem motivo justificado
- Remover ou modificar comportamentos existentes sem aprovação

## REGRA DE OURO
Se não tiver 100% de certeza do impacto:
→ NÃO ALTERAR