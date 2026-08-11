# DESPESAS — Mapa de Saídas Financeiras do Sistema Malha3D

> **Referência rápida:** Todos os custos e despesas que o sistema registra.
> Atualizado conforme a arquitetura ERP (Fase 5).

---

## 1. FONTES DE DESPESA (Para onde vai o dinheiro)

| # | Fonte | Tabela/Model | Campo de Valor | Gatilho |
|---|-------|--------------|----------------|---------|
| 1 | Pagamento de Freelancer | `accounts_payable` + `ap_installments` | `totalAmount` / `amount` | Horas aprovadas ou contrato fechado |
| 2 | Licenças de Software | `accounts_payable` | `totalAmount` | Lançamento manual (custo fixo recorrente) |
| 3 | Aluguel / Infraestrutura | `accounts_payable` | `totalAmount` | Custo fixo mensal |
| 4 | Render Farm (Cloud GPU) | `accounts_payable` | `totalAmount` | Por demanda de projeto |
| 5 | Marketing / Ads | `accounts_payable` | `totalAmount` | Investimento comercial |
| 6 | Despesa avulsa | `finance_transactions` + `accounts_payable` | `amount` / `totalAmount` | Modal "Despesa" no Financeiro |

---

## 2. TABELAS ENVOLVIDAS

### `accounts_payable` (Contas a Pagar)
```
id                UUID (PK)
freelancer_id     UUID → freelancers.id (se for pagamento de freelancer)
supplier_id       UUID → fornecedor (futuro)
project_id        UUID → projects.id (vinculado a projeto específico)
description       STRING — "Freelancer João — Modelagem 80h"
total_amount      DECIMAL(12,2) — valor total da obrigação
installments_count INTEGER — parcelas
status            ENUM — aberto, parcial, quitado, cancelado, atrasado
due_date          DATE — vencimento principal
bank_account_id   UUID → bank_accounts.id (banco que pagará)
chart_account_id  UUID → chart_of_accounts.id (plano de contas)
cost_center_id    UUID → cost_centers.id (centro de custo)
cost_classification ENUM — fixo, variavel
approval_status   ENUM — pendente, aprovado, rejeitado
```

### `ap_installments` (Parcelas a Pagar)
```
id                UUID (PK)
payable_id        UUID → accounts_payable.id
installment_number INTEGER — 1, 2, 3...
amount            DECIMAL(12,2) — valor desta parcela
due_date          DATE — vencimento
paid_date         DATE — quando foi pago (null se pendente)
paid_amount       DECIMAL(12,2) — valor efetivamente pago
status            ENUM — pendente, pago, atrasado, cancelado
bank_account_id   UUID → bank_accounts.id (banco usado)
payment_method    STRING — pix, boleto, transferencia
```

---

## 3. APIs DE DESPESA

| Método | Endpoint | Função |
|--------|----------|--------|
| GET | `/admin/api/erp/payables` | Listar todas contas a pagar (com parcelas) |
| POST | `/admin/api/erp/payables/generate` | Gerar AP + parcela (ACID) |
| POST | `/admin/api/erp/payables/installments/:id/pay` | Dar baixa (debita banco) |
| POST | `/admin/api/financeiro` | Criar transação (gera AP automaticamente se tipo=despesa) |

---

## 4. FLUXO DE SAÍDA

```
Freelancer trabalha (hourlyRate × horas)
    → Horas aprovadas
        → POST /api/erp/payables/generate
            → accounts_payable (1 registro)
            → ap_installments (1 parcela)
                → Aprovação de pagamento
                    → POST /installments/:id/pay
                        → ap_installments.status = 'pago'
                        → bank_accounts.balance -= amount
                        → Se todas pagas: AP.status = 'quitado'
```

---

## 5. CLASSIFICAÇÃO DE CUSTOS

### Por Natureza (costClassification)

| Tipo | Exemplos | Comportamento |
|------|----------|---------------|
| **Fixo** | Aluguel, Licenças, Pró-labore, Internet, Contabilidade | Recorrente, previsível, independe de produção |
| **Variável** | Freelancers, Render Farm, Assets 3D, Trilhas sonoras | Proporcional à produção, varia por projeto |

### Centros de Custo (cost_centers)

| Centro | Código | O que entra |
|--------|--------|-------------|
| Produção ArchViz | PROD | Freelancers, render farm, assets, plugins |
| Comercial / Vendas | COM | Marketing, comissões, eventos, viagens |
| Administrativo | ADM | Aluguel, contabilidade, jurídico, limpeza |
| Marketing | MKT | Google Ads, Meta Ads, branding, social |
| Infraestrutura / TI | TI | Hardware, internet, storage, licenças |

---

## 6. PLANO DE CONTAS (Despesas)

Tabela: `chart_of_accounts` (ChartOfAccounts)

| Código | Nome | Tipo |
|--------|------|------|
| 2 | Custos Variáveis | despesa |
| 2.1 | Freelancers (Modelagem) | despesa |
| 2.2 | Freelancers (Renderização) | despesa |
| 2.3 | Render Farm | despesa |
| 2.4 | Assets / Texturas | despesa |
| 3 | Despesas Fixas | despesa |
| 3.1 | Aluguel | despesa |
| 3.2 | Internet / Energia | despesa |
| 3.3 | Licenças de Software | despesa |
| 3.4 | Pró-Labore | despesa |
| 3.5 | Contabilidade | despesa |

---

## 7. CATEGORIAS DE DESPESA

Tabela: `categories_despesa` (CategoryDespesa)

Organizado em 3 grupos:

**Operacional / Produção 3D:**
- Render Farms Externas
- Plugins e Scripts 3D
- Biblioteca de Modelos/Assets
- Freelancers: Modelagem / Renderização / Animação
- Licenças de Softwares
- Ferramentas de IA

**Administrativo / Fixos:**
- Aluguel do Espaço
- Energia Elétrica
- Internet Fibra Óptica
- Pró-Labore dos Sócios
- Salários Equipe CLT/PJ
- Assessoria Contábil / Jurídica

**Comercial / Crescimento:**
- Google Ads / Meta Ads
- Comissões de Vendas
- Eventos e Feiras
- Viagens Comerciais

---

## 8. CONEXÃO COM FREELANCERS

| Campo no Freelancer | Significado |
|---------------------|-------------|
| `hourlyRate` | Valor/hora (base para cálculo do AP) |
| `monthlyHours` | Horas acumuladas no mês |
| `remunerationModel` | "hora" ou "projeto" |
| `pixKey` | Chave PIX para pagamento |
| `bankDetails` | Dados bancários (transferência) |

**Fórmula:** `AP.totalAmount = freelancer.hourlyRate × horasAprovadas`

---

## 9. ONDE CONSULTAR NO FRONT-END

- **Dashboard** (`/admin/`) → KPI "Total Despesas"
- **Financeiro** (`/admin/financeiro`) → Aba "A Pagar"
- **Financeiro DRE** → Custos Variáveis + Despesas Fixas
- **Relatórios** (`/admin/relatorios`) → Aba "Financeiros" (detalhamento)
- **Freelancers** (`/admin/freelancers`) → Produtividade e custos por artista

---

## 10. DRE — IMPACTO DAS DESPESAS

```
RECEITA BRUTA (AR pagas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(-) CUSTOS VARIÁVEIS (AP tipo=variavel, pagas)
    • Freelancers
    • Render Farm
    • Assets
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
= LUCRO OPERACIONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(-) DESPESAS FIXAS (AP tipo=fixo, pagas)
    • Aluguel
    • Licenças
    • Pró-labore
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
= LUCRO LÍQUIDO
```
