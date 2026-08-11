# RECEITAS — Mapa de Entradas Financeiras do Sistema Malha3D

> **Referência rápida:** Todas as fontes de receita que alimentam o módulo financeiro.
> Atualizado conforme a arquitetura ERP (Fase 5).

---

## 1. FONTES DE RECEITA (De onde vem o dinheiro)

| # | Fonte | Tabela/Model | Campo de Valor | Gatilho |
|---|-------|--------------|----------------|---------|
| 1 | Projeto fechado (CRM → Projeto) | `budgets` | `estimatedValue` / `valorGanho` | Lead convertido com `winStatus = 'ganho'` |
| 2 | Parcelas de projeto | `ar_installments` | `amount` | Gerado via `POST /api/erp/receivables/generate` |
| 3 | Lançamento manual (Receita) | `finance_transactions` + `accounts_receivable` | `amount` / `totalAmount` | Modal "Receita" no Financeiro |
| 4 | Receita avulsa (consultoria, extra) | `accounts_receivable` | `totalAmount` | Botão "+ Novo" na aba "A Receber" |

---

## 2. TABELAS ENVOLVIDAS

### `accounts_receivable` (Contas a Receber)
```
id               UUID (PK)
budget_id        UUID → budgets.id (projeto de origem)
project_id       UUID → projects.id
client_id        UUID → clients.id
description      STRING — "Residencial Aurora — Renderização"
total_amount     DECIMAL(12,2) — valor total do contrato
installments_count INTEGER — número de parcelas
payment_method   STRING — pix, boleto, cartao_credito, transferencia
status           ENUM — aberto, parcial, quitado, cancelado, atrasado
bank_account_id  UUID → bank_accounts.id
origin_date      DATE — data de criação do recebível
```

### `ar_installments` (Parcelas a Receber)
```
id                UUID (PK)
receivable_id     UUID → accounts_receivable.id
installment_number INTEGER — 1, 2, 3...
amount            DECIMAL(12,2) — valor desta parcela
due_date          DATE — vencimento
paid_date         DATE — quando foi pago (null se pendente)
paid_amount       DECIMAL(12,2) — valor efetivamente recebido
status            ENUM — pendente, pago, atrasado, cancelado
bank_account_id   UUID → bank_accounts.id (banco que recebeu)
payment_method    STRING — forma de pagamento utilizada
```

---

## 3. APIs DE RECEITA

| Método | Endpoint | Função |
|--------|----------|--------|
| GET | `/admin/api/erp/receivables` | Listar todas contas a receber (com parcelas) |
| POST | `/admin/api/erp/receivables/generate` | Gerar AR + N parcelas (ACID) |
| POST | `/admin/api/erp/receivables/installments/:id/pay` | Dar baixa em parcela (credita banco) |
| POST | `/admin/api/financeiro` | Criar transação (gera AR automaticamente se tipo=receita) |

---

## 4. FLUXO DE ENTRADA

```
CRM Lead (estimatedValue) 
    → Conversão para Projeto (valorGanho)
        → POST /api/erp/receivables/generate
            → accounts_receivable (1 registro)
            → ar_installments (N parcelas)
                → Cliente paga parcela
                    → POST /installments/:id/pay
                        → ar_installments.status = 'pago'
                        → bank_accounts.balance += amount
                        → Se todas pagas: AR.status = 'quitado'
```

---

## 5. CAMPOS DE VALOR NO SISTEMA

| Model | Campo | Significado |
|-------|-------|-------------|
| `Budget` | `estimatedValue` | Valor estimado do lead/orçamento |
| `Budget` | `valorGanho` | Valor efetivo quando ganho |
| `Budget` | `installments` | Número de parcelas definido |
| `Budget` | `installmentsData` | JSONB com cronograma de parcelas |
| `Project` | `price` | Preço do projeto |
| `FinanceTransaction` | `amount` (type=receita) | Lançamento legado |
| `AccountsReceivable` | `totalAmount` | Valor total do recebível ERP |
| `ArInstallment` | `amount` | Valor de cada parcela |
| `ArInstallment` | `paidAmount` | Valor efetivamente recebido |

---

## 6. CATEGORIAS DE RECEITA

Tabela: `categories_receita` (CategoryReceita)

| Categoria | Uso |
|-----------|-----|
| Recebível de Projeto | Parcelas de contratos fechados |
| Consultoria | Serviços pontuais |
| Licenciamento | Licença de uso de imagens/animações |
| Aditivo de Contrato | Extras aprovados pelo cliente |
| Outros Receitas | Geral |

---

## 7. ONDE CONSULTAR NO FRONT-END

- **Dashboard** (`/admin/`) → KPI "Total Receitas"
- **CRM Previsão** (`/admin/crm/previsao`) → Pipeline Ponderado (previsão)
- **Financeiro** (`/admin/financeiro`) → Aba "A Receber"
- **Relatórios** (`/admin/relatorios`) → Aba "Vendas" (faturamento efetuado)
- **DRE** (`/admin/financeiro` → Aba "DRE") → Receita Bruta
