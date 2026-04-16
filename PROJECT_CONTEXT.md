# VISÃO GERAL
O **LYB Estética (Lumina Control)** é um ecossistema SaaS de alta performance projetado para a gestão financeira e operacional de clínicas de estética e salões de beleza. O sistema oferece uma interface premium para controle de faturamento, repasse de comissões para profissionais e visão consolidada de fluxo de caixa.

# OBJETIVO
Eliminar a complexidade na gestão financeira de micro e pequenas empresas do setor de beleza, garantindo que gestoras tenham clareza total sobre lucros, pagamentos de profissionais e saúde financeira da empresa em tempo real.

# STACK
- **Frontend**: Vite + React + TypeScript + TailwindCSS / Lucide Icons.
- **Backend/BAAS**: Supabase (Auth, PostgreSQL, Edge Functions).
- **Inteligência**: Antigravity (Advanced Agentic Coding).
- **Deployment**: Vercel (Frontend) & Supabase (Backend).

# COMO FUNCIONA
1. **Multi-tenancy**: Cada empresa possui sua própria organização isolada.
2. **Fluxo de Convites**: Admins convidam novos membros através de Edge Functions que configuram o perfil e enviam links de acesso seguro.
3. **Gestão de Lançamentos**: Registro detalhado de serviços, formas de pagamento e cálculo automático de repasses.
4. **Dashboard**: Telas intuitivas com métricas de desempenho e alertas de caixa.

# FEATURES ATUAIS
- [x] Autenticação Segura com Refresh de Sessão.
- [x] Convite de usuários via Edge Functions (Auth Admin).
- [x] Gestão de Organizações izoladas.
- [x] Controle de Lançamentos Financeiros.
- [x] Cálculo de Repasses para Profissionais.
- [x] Dashboard com gráficos de faturamento.
- [x] Auditoria de logs de ações críticas.

# PROBLEMAS ATUAIS
- **Sincronização de Convite**: Deadlock ocasional entre a criação do usuário no Auth e a gravação do perfil no banco de dados (em resolução com Omega Stability v5.0).
- **Estabilização de Dashboard**: Garantir que o `organization_id` esteja sempre presente no momento do redirecionamento após o primeiro login.

# DIREÇÃO
Evoluir para um sistema de gestão 360º, incluindo agendamentos inteligentes e automação de marketing para as clientes finais das clínicas.
