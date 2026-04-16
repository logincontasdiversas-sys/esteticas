# REGRAS DE DESENVOLVIMENTO
Este documento define os padrões de conduta e qualidade para a evolução do LYB Estética.

# PRINCÍPIOS
- **Código Completo**: Sempre gerar arquivos e funções funcionais de ponta a ponta.
- **Simplicidade Letal**: Evitar complexidade desnecessária; o código deve ser legível por humanos e resiliente a erros.
- **Respeito ao Legado**: Não reinventar partes já definidas ou funcionando e manter o padrão estético/arquitetural do projeto.
- **Segurança v4.0**: Aplicar validações Zod, IDOR protection e defesa em profundidade em cada nova implementação.

# COMUNICAÇÃO
- **Transparência**: Perguntar explicitamente antes de assumir coisas faltantes ou ambíguas.
- **Logs**: Manter logs de erro detalhados e amigáveis para facilitar diagnósticos (padrão `[APP-COMPONENT] Mensagem`).

# QUALIDADE
- Arquivos ≤ 300 linhas.
- Funções ≤ 40 linhas (preferencialmente).
- Separação clara de responsabilidades: Logic (.ts), UI (.tsx), Styles (.css).
