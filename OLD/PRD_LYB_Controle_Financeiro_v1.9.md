# PRD: Sistema de Supervisão de Caixa da Estética LYB (v1.9 - Nome: LYB Controle Financeiro)

## 1. Overview
- **Nome do Produto**: LYB Controle Financeiro.
- **Descrição**: App web para registrar pagamentos diários, calcular trocos/repasses e dashboards para auditar saldos. Resolve sumiços no caixa mensal.
- **Objetivo Principal**: Automatizar cadastros e relatórios para secretárias/gestoras, com painel ADM para gerenciamento avançado.
- **Escopo do MVP**: Cadastro, lista, dashboard com relatórios custom, painel administrativo. Sem integrações externas.
- **Assunções**: Acesso via browser em PC/laptop. Dados na nuvem (Supabase) para multi-dispositivo.

## 2. Usuários e Permissões
- **Secretárias**: Cadastro e lista (sem editar histórico).
- **Gestoras**: Tudo, incluindo dashboard e edições (exceto painel ADM).
- **ADM (Administradores)**: Acesso full, incluindo painel administrativo exclusivo para gerenciamento de usuários, profissionais e configs.
- **Login Básico**: Via Supabase Auth (email/senha simples, roles via RLS – Row Level Security: secretária, gestora, ADM).

## 3. Requisitos Funcionais (Features Básicas)
- **Cadastro de Lançamento**: Botão "Novo" abre popup com: Data (default hoje), Valor Atendimento, Valor Pago (> atendimento), Troco (auto: pago - atendimento, editável), Profissional (dropdown fixo), Forma Pagamento (dropdown: Pix, Cartão Débito/Crédito, Dinheiro, Outros), % Repasse (default 50%, auto calcula valor repasse). Validações: Obrigatórios, positivos, troco >=0. Salva no Supabase (tabela lancamentos).
- **Lista de Lançamentos**: Tabela: Colunas como Data, Profissional, Valores, etc. Ações limitadas por role. Filtros: Por Profissional/Forma/Data. Tabs por Profissional, subgrupos por Forma.
- **Dashboard**: Filtro de Período Customizado: Date pickers para Data Inicial e Data Final (default: hoje ou mês atual). Botão "Aplicar" recalcula tudo no período selecionado. Abas opcionais (Mês Anterior/Este, Semana Passada/Esta) como presets rápidos. Totais: Cards com Saldo Bruto, Repasse Total, Ganho Líquido. Formas Pagamento: Tabela ou pizza com totais por tipo. Trocos: Soma total + alerta se >5% do bruto. Relatórios e Export: Botão "Gerar Relatório" abre preview. Opções: Export CSV ou PDF (formato imprimível com logo LYB). Limitado por role.
- **Painel Administrativo (Acesso Exclusivo ADM)**: Menu lateral ou aba "Admin" visível só para role ADM. Inclusão de Usuários: Form com Email, Senha (hash auto), Role. Gerenciamento de Profissionais: Lista editável de nomes (CRUD). Configurações Globais: % Repasse Default, Lista de Formas Pagamento, Threshold Alerta Trocos. Relatórios e Export Avançado: Export full audit logs, relatórios consolidados. Log de Auditoria: Tabela readonly com Ação, Usuário, Data, Detalhes.

## 4. Requisitos Não-Funcionais
- **UI/UX**: Clean e profissional – design bonito com layout minimalista, responsivo (mobile-first). **Implementado com Tailwind CSS e componentes `shadcn/ui` para popups, tabelas e cards.** Cores: Paleta neutra (branco/cinza claro fundo, azul #4A90E2 pros CTAs, verde #50C878 pra saldos positivos, vermelho suave #E74C3C pra alertas). Textos: Fontes profissionais (Inter/Roboto). Campos: Inputs com labels flutuantes, validações visuais. Botões: Arredondados, hover effects sutis. Animações: Fade-in no popup, loading spinner clean. **Destaque Central**: Logo da LYB como componente React (`Logo.tsx`) no header central. Relatórios: Preview em modal com botão "Imprimir" ou download. Painel ADM: Sidebar clean com ícones.
- **Performance**: <2s load, realtime via Supabase.
- **Segurança**: Supabase RLS (ex: ADM só vê users table; triggers pra logs). Senhas hashed.
- **Tech Stack**: React com Tailwind CSS e `shadcn/ui` para design. Backend: Node.js/Express (serverless via Vercel Functions). DB: Supabase (tabelas: users, lancamentos, profissionais, configs, audit_logs). Env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY. Libs: PapaParse (CSV), jsPDF (PDF), @supabase/supabase-js (SDK).
- **Constraints**: MVP low-volume.

## 5. User Flows Exemplo
- **Secretária**: Login > Dashboard > Seleciona período custom (ex: 10/10/2025 a 12/10/2025) > Aplicar > Gera relatório > Export PDF e imprime.
- **Gestora**: Login > Dashboard > Aba Mês > Totais + gráfico > Filtra lista.
- **ADM**: Login > Admin Panel > Adiciona usuário novo > Configura % default > Exporta relatório mensal full.

## 6. Sucessos e Métricas
- **Sucesso**: Balanço mensal zero discrepância; Usuários gerenciados sem erros; Relatórios custom gerados em <10s.
- **Métricas**: Cadastro <30s; 100% trackeados; Tempo pra relatório custom <1min.

## 7. Deploy/Setup (Vercel + Supabase)
- **Supabase Setup**: Crie projeto free em supabase.com. Rode SQL migrations para tables (ex: CREATE TABLE lancamentos). ENABLE RLS; CREATE POLICY. Adicione triggers pra audit_logs. Pluge env vars no Vercel. **Migrações já estão configuradas em `supabase/migrations` para todas as tabelas mencionadas.**
- **Vercel Setup**: Crie repo GitHub com o código gerado. No Vercel dashboard: Import repo > Deploy (auto-detecta React pra frontend, api/ pra functions backend). Env vars: Copie de Supabase (URL, keys). Comandos locais: npm install; npm run dev (Vite); git push > Vercel auto-deploy. Preview: Branches criam URLs test.
- **README Esboço**: Inclua passos acima + "Acesse: [vercel-url]. Login inicial: admin@lyb.com / senha123 (mude no ADM). Teste: Novo lançamento > Dashboard período > Export PDF."
