# Malha3D — Arquitetura do Sistema ERP

## Visão Geral

**Malha3D** é um sistema integrado de **CRM + Gestão de Projetos + ERP Financeiro** para estúdios de visualização arquitetônica (ArchViz). O sistema consolida operações de venda, produção e finanças em uma única plataforma com design dark-mode-first e otimização para performance.

### Versão
- **v2.0** — ERP Financeiro completo com AR/AP, DRE, Fluxo de Caixa, IA e BI

## Stack Técnico

### Backend
- **Node.js** + **Express.js** (routing, middleware, session)
- **Sequelize ORM** — multi-database: SQLite (dev) / PostgreSQL (prod via SUPABASE_DB_URL)
- **SQLite3** — development / local testing
- **PostgreSQL** — production (via connection string SUPABASE_DB_URL)

### Frontend
- **Handlebars** (.hbs templates) — server-side rendering
- **Tailwind CSS** (CDN runtime) — utility-first styling
- **Custom CSS** — .kcard (design system), .uv-card, .uv-flip-card
- **Material Symbols Outlined** — Google icons
- **Native HTML5 Drag-and-Drop API** — replaced SortableJS for performance

### Database
- **7 Financial Models:**
  - `BankAccount` — contas bancárias
  - `ChartOfAccounts` — plano contábil
  - `CostCenter` — centros de custo
  - `AccountsReceivable` — títulos a receber (AR)
  - `AccountsPayable` — títulos a pagar (AP)
  - `ArInstallment` — parcelas de AR
  - `ApInstallment` — parcelas de AP
  - `CrmForecastProbability` — previsão de vendas

- **7 Core Models:**
  - `Budget` (projects + CRM leads via `kanbanType` column)
  - `Project` (extended Budget data)
  - `Client`
  - `User`
  - `Task`
  - `FinanceTransaction` (legacy, being phased out → AR/AP)
  - `CrmForecastProbability`

### Security
- **bcrypt** — password hashing
- **Express Session** — session management
- **requireAuth** middleware — all admin routes protected
- **checkPermission** middleware — role-based access control
- **Helmet.js** — HTTP headers security

## Arquitetura do Banco de Dados

### Estrutura de Dados Compartilhada

```
┌─────────────────────────────────────────────────────────┐
│                     Budget (Core)                        │
├─────────────────────────────────────────────────────────┤
│ id, name, clientId, status, kanbanType                  │
│ ('vendas' para CRM, 'modelagem' para Projetos)          │
│ createdAt, updatedAt, userId, color, probability...    │
└─────────────────────────────────────────────────────────┘
         ↓                                        ↓
    ┌────────────────┐              ┌──────────────────┐
    │   CRM/Vendas   │              │  Projetos/Produção
    │  (kanbanType   │              │  (kanbanType
    │   = 'vendas')  │              │  = 'modelagem')
    └────────────────┘              └──────────────────┘
```

### Tabelas Financeiras (AR/AP Model)

```
Budget ──────────┐
                 ├─→ AccountsReceivable (receivables)
                 └─→ AccountsPayable (payables)
                     │
                     ├─→ ArInstallment (AR parcelas)
                     └─→ ApInstallment (AP parcelas)

ChartOfAccounts ──→ BankAccount (contas)
               └─→ CostCenter (centros de custo)
```

## Módulos Implementados

### Etapa 1: CRM — Gestão de Vendas
- ✅ Kanban com drag-and-drop (nativo HTML5)
- ✅ Pipeline de leads com probabilidade de conversão
- ✅ IA para scoring de leads
- ✅ Previsão de receita (pipeline forecast)
- ✅ Integração com WhatsApp

### Etapa 2: Projetos — Gestão de Produção
- ✅ Kanban de fases de produção (Parado → Em Produção → Entregando → Finalizado)
- ✅ 7 tabs por projeto: Perfil | Planejamento | Financeiro | Entregáveis | Tarefas | Chat | Histórico
- ✅ Drag-and-drop de tarefas
- ✅ Integração com financeiro (revenue tracking)
- ✅ Análise de margem por projeto

### Etapa 3: ERP Financeiro
- ✅ **Contas a Receber (AR)** — emissão, vencimento, recebimento, juros
- ✅ **Contas a Pagar (AP)** — lançamentos, vencimento, pagamento
- ✅ **DRE (Demonstrativo de Resultados)** — receita, despesa, lucro
- ✅ **Fluxo de Caixa** — projeção com IA (linear regression)
- ✅ **Relatório de Envelhecimento (Aging)** — vencidos, a vencer, recebidos
- ✅ **Reconciliação Bancária** — match automático (Levenshtein distance)
- ✅ **Repartição de Pagamentos** — split payment parcial
- ✅ **Recorrência** — pagamentos automáticos

### Etapa 4: BI — Business Intelligence
- ✅ KPIs mensais (receita, despesa, lucro, variação)
- ✅ Previsão de Caixa (IA) — forecast com intervalo de confiança
- ✅ Anomalias Detectadas — desvios em transactions
- ✅ Pipeline por Vendedor — análise de conversão
- ✅ Capacidade de Produção — utilização vs forecast
- ✅ Relatórios de Lucratividade (Gross Margin, Project Margin)

### Etapa 5: IA e Automação
- ✅ **Lead Scoring** — API `/admin/api/lead-score/:id`
- ✅ **Sugestão de Preço** — API `/admin/api/ai/suggest-price`
- ✅ **Previsão de Caixa** — API `/admin/api/erp/cash-forecast-ai`
- ✅ **Detecção de Anomalias** — API `/admin/api/ai/anomalies`
- ✅ **Resumo Semanal** — API `/admin/api/ai/weekly-summary`

### Etapa Bônus: Públicas
- ✅ **Calculadora Rápida** — `/orcamento-rapido` (public form)
- ✅ **Notificações** — central consolidada em tempo real
- ✅ **Busca Global** — Ctrl+K across 4 tables (Projetos, Leads, Clientes, Tarefas)
- ✅ **Timeline** — eventos agregados de todos os módulos
- ✅ **Central de Exportações** — CSV, XLSX, JSON, backup
- ✅ **PWA Support** — offline-first com Service Worker, manifest.json

## Design System

### Tema
- **Dark Mode Default** — `body { background: #0a0c10; color: #fff; }`
- **Light Mode Overrides** — `body.theme-light { ... }` (148+ rules)
- **Accent Color** — Orange `#f97316` (Tailwind `orange-500`)

### Component Kit (`.kcard`)

```html
<div class="kcard">
  <div class="kcard-body">
    <h3 class="kcard-title">Título</h3>
    <p class="kcard-text">Descrição</p>
  </div>
</div>
```

**Estilo aplicado:**
```css
.kcard {
  background: #151515;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 16px;
}
```

### Tipografia
- **Headings** — `font-black`, uppercase tracking
- **Body** — `system-ui` font family, `text-xs` / `text-sm`
- **Icons** — Material Symbols Outlined (13-16px)

### Layout Grid
- Mobile-first
- 1 col (sm), 2 cols (md), 3-6 cols (lg/xl/2xl)
- Tailwind grid helpers: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`

## APIs Implementadas (40+)

### CRM
- `GET /admin/crm` — kanban view
- `POST /admin/api/crm/lead` — new lead
- `PUT /admin/api/crm/:id` — update lead
- `DELETE /admin/api/crm/:id` — delete lead
- `GET /admin/api/crm/pipeline-by-vendor` — pipeline analysis

### Projetos
- `GET /admin/projetos` — kanban view
- `POST /admin/api/projetos` — new project
- `PUT /admin/api/projetos/:id` — update project
- `GET /admin/api/projetos/geo` — geolocation stats
- `POST /admin/api/projetos/duplicate/:id` — duplicate project

### Financeiro
- `GET /admin/api/erp/monthly-comparison` — current vs previous month
- `GET /admin/api/erp/cash-forecast-ai` — AI-powered cash forecast
- `GET /admin/api/erp/aging` — AR/AP aging report
- `POST /admin/api/erp/reconcile` — bank reconciliation
- `POST /admin/api/erp/split-payment` — split payment across items
- `POST /admin/api/erp/payables/:id/recurrence` — recurrence setup
- `GET /admin/api/erp/client-profitability` — margin by client

### BI
- `GET /admin/api/lead-score/:id` — lead scoring (0-100)
- `GET /admin/api/capacity-forecast` — production capacity
- `GET /admin/api/ai/weekly-summary` — AI-generated insights
- `GET /admin/api/ai/anomalies` — anomaly detection
- `GET /admin/api/ai/suggest-price` — price recommendation

### Utilitários
- `GET /admin/api/notifications` — all alerts consolidated
- `GET /admin/api/search?q=TERM` — global search
- `GET /admin/api/export/:type` — CSV export (projetos, leads, ar, ap, dre)
- `GET /admin/api/public/estimate` — public calculator
- `GET /admin/api/deadline-alerts` — upcoming deadlines
- `GET /admin/manifest.json` — PWA manifest
- `GET /admin/sw.js` — Service Worker
- `GET /admin/api/backup/export` — full DB snapshot
- `POST /admin/api/freelancers/:id/start-timer` — timer API
- `POST /admin/api/freelancers/:id/stop-timer` — timer stop

## Páginas Implementadas (15+)

### Admin Routes
- ✅ `/admin` — dashboard
- ✅ `/admin/crm` — CRM kanban
- ✅ `/admin/projetos` — Projects kanban
- ✅ `/admin/financeiro` — Finance module (tabs: Painel, A Receber, A Pagar, DRE, Lucratividade)
- ✅ `/admin/contacts` — contacts registry (grid/block/list/search views)
- ✅ `/admin/calendar` — calendar + schedule
- ✅ `/admin/freelancers` — freelancer management
- ✅ `/admin/notifications` — notification center
- ✅ `/admin/buscar` — global search results
- ✅ `/admin/bi` — BI dashboard
- ✅ `/admin/export` — export hub
- ✅ `/admin/timeline` — activity timeline

### Public Routes
- ✅ `/orcamento-rapido` — public budget calculator
- ✅ `/admin/login` — login page
- ✅ `GET /manifest.json` — PWA manifest
- ✅ `GET /sw.js` — Service Worker

## Fluxos de Dados

### Fluxo CRM → Projeto
```
Lead criado no CRM (kanbanType='vendas')
  ↓
Lead scored + probabilidade calculada
  ↓
Lead ganha (status='ganhado')
  ↓
Transformado em Projeto (kanbanType='modelagem')
  ↓
AR criada automaticamente com valor previsto
```

### Fluxo Projeto → Financeiro
```
Projeto lançado
  ↓
Receita prevista calculada (Budget.price)
  ↓
Ao finalizar: AR aberta
  ↓
Cliente paga: AR sinalizada como paid
  ↓
DRE atualizada automaticamente
```

### Fluxo IA/BI
```
Novos dados gravados no Budget/AR/AP
  ↓
Endpoints IA recalculam nightly
  ↓
Dashboards mostram insights em tempo real
  ↓
Anomalias alertam via notificação
```

## Transações ACID

Todas as operações críticas usam `sequelize.transaction()`:

```javascript
const t = await sequelize.transaction();
try {
  // operação 1
  // operação 2
  await t.commit();
} catch (e) {
  await t.rollback();
  throw e;
}
```

Exemplos:
- Criação de projeto (cria Budget + Project + AR)
- Pagamento de AR (atualiza AR.status + ArInstallment + saldo BankAccount)
- Split payment (distribui valor entre múltiplas linhas AP)

## Performance Otimizações

1. **Lazy Loading** — IntersectionObserver para imagens (80px height em cards)
2. **Native D&D** — HTML5 Drag API vs SortableJS (50% menos DOM reflow)
3. **Paginação** — 50-200 items por request, limit/offset
4. **Query Optimization** — N+1 prevention com `.include()`
5. **Caching** — Redis ready (SUPABASE_REDIS_URL)
6. **Compression** — Gzip enabled

## Segurança

1. **Autenticação** — bcrypt hashing + session cookies
2. **Autorização** — `requireAuth` middleware, role-based `checkPermission`
3. **SQL Injection Prevention** — Sequelize parameterized queries
4. **XSS Prevention** — Handlebars auto-escaping
5. **CSRF Protection** — session-based
6. **Rate Limiting** — configurable per endpoint
7. **Password Field Lock** — requires "0235" admin unlock code

## Deployment

### Variáveis de Ambiente
```env
# Database
SUPABASE_DB_URL=postgresql://user:pass@host:5432/db  # prod
DATABASE_URL=postgres://...  # fallback

# Session
SESSION_SECRET=<64-char random>

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Redis (optional)
SUPABASE_REDIS_URL=redis://...

# Email (optional)
SENDGRID_API_KEY=...

# Environment
NODE_ENV=production
PORT=3000
```

### Production Checklist
- [ ] Use HTTPS
- [ ] Set NODE_ENV=production
- [ ] Enable CORS appropriately
- [ ] Set strong SESSION_SECRET
- [ ] Configure database backups
- [ ] Setup monitoring (error logs, performance)
- [ ] Enable rate limiting
- [ ] Configure firewall rules

## Roadmap Futuro

### v2.1
- [ ] Integração com Stripe/PagSeguro (pagamentos online)
- [ ] OCR para reconhecimento de recibos
- [ ] Integração com Google Drive (versionamento de arquivos)
- [ ] Relatório PDF exportável

### v2.2
- [ ] Gamification (pontos, badges, leaderboard)
- [ ] Mobile app (React Native)
- [ ] Integração com Slack
- [ ] Webhooks customizados

### v3.0
- [ ] AI-powered project estimation
- [ ] Integração com software 3D (Revit, SketchUp)
- [ ] Multi-tenant support (white-label)

---

**Desenvolvido com ❤️ por Malha3D Studio**
