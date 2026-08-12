# Malha3D — Proposta Evolutiva do Software

## Contexto: O que É Hoje

Malha3D v2.0 é um **ERP integrado para estúdios ArchViz** — consolida CRM, gestão de projetos e financeiro em uma plataforma. O foco é na eficiência operacional de pequenas equipes que entregam visualizações arquitetônicas.

Stack: Node.js/Express, Sequelize, SQLite/PostgreSQL, Handlebars + Tailwind.

**Problema que resolve:** Um estúdio 3D hoje usa 5-7 ferramentas desconectadas (Trello, Spreadsheet, WhatsApp, Sistema Financeiro, Email). Malha3D unifica isso em um lugar.

---

## Visão Evolutiva: Os Próximos 3 Anos

### Fase 1 (Próximos 6 meses) — **Malha3D Studio**
**Do:** Ferramenta interna para um estúdio  
**Para:** Plataforma que escala para redes de estúdios

**Mudanças chave:**
- **Multi-tenant** — Um proprietário pode ter múltiplos estúdios (filiais, parcerias, sub-contratos)
- **Colaboração inter-estúdio** — Lead de Estúdio A vira projeto no Estúdio B automaticamente
- **Dashboard para gerentes de rede** — Visão consolidada de todos os estúdios, pipeline agregado, performance comparativa
- **Marketplace interno** — Estúdios podem contratar serviços uns dos outros (renderização, animação, consultoria) via plataforma

**Impacto:** 1 estúdio → 5-10 estúdios conectados

---

### Fase 2 (Meses 6-12) — **Malha3D Ecosystem**
**Do:** Apenas gestão operacional  
**Para:** Plataforma + ecossistema de integração

**Mudanças chave:**
- **APIs públicas** — Desenvolvedores podem construir extensões (integração SketchUp, Revit, V-Ray, Unreal)
- **Webhooks** — Conectar com Slack, Zapier, Make, Google Sheets, Notion
- **Plugin SDK** — Criar botões customizados, campos personalizados, workflows automáticos
- **App Store** — Catálogo de extensões verificadas (pago/grátis)

**Novos módulos via plugins:**
- Gerador de apresentações automáticas (Prezi/Pitch-like)
- Integração com bancos de imagens (Unsplash, Pexels para referência)
- Auto-rendering via cloud (render farms como serviço)
- Geração de mockups via IA (mostrar projeto em contexto)

**Impacto:** Ecossistema de integradores, marketplace B2B

---

### Fase 3 (Meses 12-24) — **Malha3D Cloud + IA**
**Do:** Gestão manual com automação básica  
**Para:** Plataforma inteligente e autônoma

**Mudanças chave:**

#### IA Generativa
- **Gerador de proposta com IA** — "Criar proposta para renderização de apartamento 120m²" → documento pronto em 30s
- **Agente autônomo de cobrança** — IA que envia cobranças, negocia prazos, calcula multas
- **Auto-resumo executivo** — Ao finalizar projeto, gera relatório visual + insights automáticos
- **Chatbot de atendimento** — Responde FAQ de clientes (status, prazo, revisões)

#### Cloud Rendering
- **Integração com cloud render farms** (Backburner, Deadline, RenderFarm)
- **Auto-scaling de renders** — Projeto grande? Distribui automaticamente entre provedores
- **Histórico de renders** — Galeria versionada de todos os renders, comparação antes/depois

#### Mobile App
- **App iOS/Android** — Ver pipeline, aprovar renders, assinar documentos
- **Notificações push** — Lead convertido, render pronto, cliente pediu revisão
- **Offline sync** — Usar app sem internet, sincroniza quando volta online

#### IA Pricing
- **Sugestão de preço em tempo real** — "Cliente X, renderização similar = R$5-8k. Market está em R$6k. Sugerir R$7k?"
- **Análise de rentabilidade** — "Margem em queda? Aumentar preço ou otimizar produção em 20%?"
- **Previsão de demanda** — "Agosto é 40% mais demandado. Aumentar capacidade em julho?"

**Impacto:** Automação 70-80% das tarefas operacionais

---

### Fase 4 (Meses 24+) — **Malha3D Collective**
**Do:** Software para gestão de estúdios  
**Para:** Rede global de criadores descentralizada

**Visão futura:**
- **Marketplace global** — Clientes em qualquer lugar encontram estúdios 3D, compram renderizações
- **Leilão de projetos** — "Renderizar loja em São Paulo" → Estúdios fazem propostas, cliente escolhe
- **Pool de recursos** — Estúdios compartilham modelos 3D, texturas, scripts (monetizado)
- **Certificações** — Estúdios certificados Malha3D ganham badge de confiança, acesso a taxa de comissão reduzida
- **DAO (governance descentralizada)** — Comunidade de criadores vota em features, roadmap, políticas

**Impacto:** De B2B (estúdios) para B2B2C (marketplace global)

---

## Mudanças de Arquitetura por Fase

### Banco de Dados
```
Hoje:
  - Budget (PK: id)
  - Project (PK: id)
  - User (PK: id)
  - Client (PK: id)

Fase 1 (Multi-tenant):
  - Studio (PK: id) — novo
  - Budget (PK: id, FK: studio_id) — adicionar multi-tenant
  - Replicar Client, User, Project por Studio

Fase 2 (APIs + Plugins):
  - Extension (PK: id) — plugin registry
  - ApiKey (PK: id, FK: user_id) — auth para APIs
  - Webhook (PK: id, FK: studio_id, event_type) — event log
  - CustomField (PK: id, FK: studio_id) — campos custom

Fase 3 (IA + Cloud):
  - AiJob (PK: id, FK: project_id, status) — render jobs
  - AiAsset (PK: id, url, metadata) — cache de renders
  - MobileSession (PK: id, FK: user_id) — offline sync
  - PricingHistory (PK: id, FK: project_id) — audit de preços

Fase 4 (Collective):
  - Marketplace (PK: id) — novo marketplace central
  - StudioProfile (PK: id, FK: studio_id, certifications) — perfil público
  - ProjectListing (PK: id, FK: client_id) — leilão de projetos
  - ResourcePool (PK: id, FK: studio_id) — compartilhado
```

---

## UX/UI Evolution

### Hoje: Operacional
- Dark mode, cards compactos, Kanban eficiente
- Foco: velocidade de entrada de dados, kanban fluido

### Fase 1: Colaborativo
- Adição de "Team View" — ver outros estúdios
- "Marketplace interno" — interface de compra/venda entre estúdios
- Chat P2P entre estúdios integrado

### Fase 2: Extensível
- Panel de "Apps" (como Slack App Store)
- Builder de campos customizados (UI no-code)
- Webhook debugger

### Fase 3: Inteligente
- Copilot sidebar — IA sempre disponível, sugestões contextuais
- Mobile app nativa com Offline-first sync
- Cloud render queue visual (gráfico de fila de render)
- IA pricing widget inline nos modais

### Fase 4: Social
- Perfil de estúdio público (como AirBnB para 3D)
- Leilão de projetos (tipo Upwork, mas integrado)
- Certificações visíveis
- Reputação/reviews por cliente

---

## Oportunidades de Monetização

### Hoje
- Freemium (2 usuários grátis) → Premium ($199/mês por estúdio)

### Fase 1
- **By-studio pricing** — Basado em projetos por mês, não usuários
- **Add-ons:** Integração com ERPs (Sage, SAP)

### Fase 2
- **API/Plugin monetization** — Taxa 30% de plugins premium no App Store
- **Integração de cloud render** — Comissão 5-10% em cada render que passa pela plataforma

### Fase 3
- **IA credits** — Por uso de gerador de propostas, agente de cobrança, etc.
- **Cloud rendering as service** — Margin em cima de render farms
- **Mobile app** — $9.99/mês
- **Analytics premium** — Dashboard avançado, previsão, benchmark vs. mercado

### Fase 4
- **Marketplace commission** — 8-15% em cada projeto vendido (como Upwork, Etsy)
- **Studio certification** — $99/ano por estúdio certificado
- **Pool monetization** — 20% em cada ativo vendido no ResourcePool
- **Enterprise DAO governance** — Estúdios enterprise pagam taxa para voto

---

## Differenciadores Competitivos por Fase

| Fase | Difrencial | vs Concorrente |
|------|-----------|----------------|
| **Hoje** | CRM + Projetos + Financeiro integrado | Trello + Spreadsheet + Wave |
| **Fase 1** | Multi-tenant + Marketplace inter-estúdio | Monday.com (caro, genérico) |
| **Fase 2** | APIs abertas + Extensibilidade | Asana (fechada), Airtable (caro) |
| **Fase 3** | IA + Mobile + Cloud rendering nativo | Konkord (não tem IA), Togal (gera orçamento) |
| **Fase 4** | Marketplace descentralizado de criadores | Ninguém (novo mercado) |

---

## Roadmap em Sprints

### Sprint 1-4 (Meses 1-4 | Fase 1)
- [ ] Database schema multi-tenant
- [ ] "Studio" CRUD
- [ ] User model com studio_id
- [ ] Dashboard consolidado (gerente de rede)
- [ ] UI: Team switcher no top-nav

### Sprint 5-8 (Meses 5-8 | Fase 2)
- [ ] ApiKey generation + JWT
- [ ] Webhook system (6 eventos: project_created, lead_won, invoice_paid, etc.)
- [ ] Plugin SDK docs
- [ ] App Store UI (mockup de apps)
- [ ] 3 plugins proof-of-concept (Slack, Google Sheets, Zapier)

### Sprint 9-12 (Meses 9-12 | Fase 3)
- [ ] AI-powered proposal generator (via Claude/GPT API)
- [ ] Cloud render job queue (mock com storage)
- [ ] React Native app (iOS/Android alpha)
- [ ] Offline sync engine
- [ ] Smart pricing widget

### Sprint 13-16 (Meses 13-16 | Fase 4)
- [ ] Marketplace staging (projeto público)
- [ ] Studio profiles + certifications
- [ ] Project auction UI
- [ ] Resource pool (compartilhar assets)
- [ ] Reputation/review system

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| **Complexidade cresce rápido** | Manter 80/20: core features bem, extras modular |
| **Multi-tenant = bugs de isolamento** | Testes de segurança rigorosos, audit trail |
| **Dependência de cloud render farms** | Fallback para local rendering sempre disponível |
| **Marketplace = moderation overhead** | AI moderation para fraude, reviews falsas |
| **Churn se não agregar valor rápido** | Beta tester program (free premium em troca de feedback) |

---

## Métricas de Sucesso por Fase

### Fase 1
- ✅ 10+ estúdios conectados
- ✅ 80% de retenção ao fim do trimestre
- ✅ NPS > 40

### Fase 2
- ✅ 20+ plugins no App Store
- ✅ 50% de usuários usando integração
- ✅ Webhook adoption > 30%

### Fase 3
- ✅ 5k+ downloads de mobile app
- ✅ 40% de renders via cloud
- ✅ IA pricing usado em 60% de novos projetos

### Fase 4
- ✅ 100+ estúdios no marketplace
- ✅ 1k+ projetos listados/mês
- ✅ Marketplace revenue > 20% do ARR total

---

## Conclusão

Malha3D evolui de **software de eficiência** (hoje) para **plataforma de ecossistema** (Fase 2) para **IA + marketplace** (Fase 3-4).

Cada fase é autossustentável:
- **Fase 1** sólida: estúdios pagam mais porque conseguem gerenciar redes
- **Fase 2** sólida: plugins viram receita, developers ganham 70%
- **Fase 3** sólida: IA + mobile são features premium
- **Fase 4** sólida: marketplace é novo mercado (não concorrência)

**OKR Geral:** De "SaaS para CRM de 1 estúdio" → "Rede global de criadores 3D descentralizada"

