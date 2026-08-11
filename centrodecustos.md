# CENTRO DE CUSTOS — Estrutura e Lançamentos (Malha3D ERP)

> **Referência para replicação:** Estrutura completa de centros de custo, distribuição de despesas, receita futura e lucratividade.

---

## 1. TABELA: `cost_centers`

```sql
CREATE TABLE cost_centers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR NOT NULL,        -- "Produção ArchViz"
  code        VARCHAR,                 -- "PROD"
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  color       VARCHAR DEFAULT '#8b5cf6',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Dados Cadastrados:

| ID | Nome | Código | Cor | % Participação |
|----|------|--------|-----|----------------|
| 1 | Produção ArchViz | PROD | #f97316 | 31% |
| 2 | Comercial / Vendas | COM | #3b82f6 | 13% |
| 3 | Administrativo | ADM | #8b5cf6 | 32% |
| 4 | Marketing | MKT | #ec4899 | 7% |
| 5 | Infraestrutura / TI | TI | #06b6d4 | 19% |

---

## 2. LANÇAMENTOS POR CENTRO DE CUSTO

### Produção ArchViz (PROD) — 31% | R$ 19.740

| Descrição | Valor | Tipo |
|-----------|-------|------|
| Freelancer — Modelagem Residencial Aurora (120h) | R$ 9.600 | Variável |
| Freelancer — Renderização Edifício Horizonte (80h) | R$ 6.400 | Variável |
| Render Farm Cloud — Ago/2026 (800h GPU) | R$ 2.400 | Variável |
| Assets 3D — Biblioteca de Mobiliário Premium | R$ 890 | Variável |
| Texturas PBR — Pack Arquitetônico v3 | R$ 450 | Variável |

### Administrativo (ADM) — 32% | R$ 20.350

| Descrição | Valor | Tipo |
|-----------|-------|------|
| Aluguel Estúdio — Agosto/2026 | R$ 4.500 | Fixo |
| Pró-Labore Sócio 1 — Agosto | R$ 8.000 | Fixo |
| Pró-Labore Sócio 2 — Agosto | R$ 6.000 | Fixo |
| Assessoria Contábil — Ago/2026 | R$ 1.200 | Fixo |
| Limpeza e Copa — Agosto | R$ 650 | Fixo |

### Infraestrutura / TI — 19% | R$ 12.049

| Descrição | Valor | Tipo |
|-----------|-------|------|
| Licença D5 Render Pro — Anual | R$ 2.400 | Fixo |
| Licença 3ds Max — Anual | R$ 7.200 | Fixo |
| Internet Fibra 1Gbps — Agosto | R$ 399 | Fixo |
| Energia Elétrica (Render Farm Local) | R$ 1.800 | Fixo |
| Storage Cloud (2TB) — Agosto | R$ 250 | Fixo |

### Comercial / Vendas (COM) — 13% | R$ 8.100

| Descrição | Valor | Tipo |
|-----------|-------|------|
| Google Ads — Campanha ArchViz Ago/2026 | R$ 3.200 | Variável |
| Meta Ads — Leads Construtoras | R$ 1.800 | Variável |
| Comissão Vendas — Projeto Shopping Center | R$ 3.100 | Variável |

### Marketing (MKT) — 7% | R$ 4.300

| Descrição | Valor | Tipo |
|-----------|-------|------|
| Design Identidade Visual — Portfólio 2026 | R$ 2.800 | Variável |
| Fotógrafo — Sessão de Portfólio | R$ 1.500 | Variável |

---

## 3. RECEITA FUTURA (Parcelas Pendentes)

**Total a Receber:** R$ 309.166,67 (em 15+ parcelas)

| Projeto | Valor Total | Parcelas | Forma |
|---------|-------------|----------|-------|
| Condomínio Parque das Flores — Fachada 3D | R$ 35.000 | 4x Boleto | Set-Dez/2026 |
| Hotel Boutique Marina — Animação 4K | R$ 55.000 | 5x Transferência | Set/2026-Jan/2027 |
| Clínica Premium — Interiores (8 ambientes) | R$ 22.000 | 3x PIX | Set-Nov/2026 |
| Escola Montessori — Tour Virtual | R$ 18.000 | 2x PIX | Set-Out/2026 |
| Galpão Logístico — Render Técnico | R$ 8.500 | 1x PIX | Set/2026 |

---

## 4. LUCRATIVIDADE

```
RECEITA REALIZADA:     R$ 107.540,33
CUSTOS TOTAIS PAGOS:   R$  59.713,00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LUCRO LÍQUIDO:         R$  47.827,33
MARGEM LÍQUIDA:        44%
```

### Custo por Centro (apenas pagos):

| Centro | Custo Realizado |
|--------|-----------------|
| Administrativo | ~R$ 12.000 |
| Produção ArchViz | ~R$ 11.500 |
| Infraestrutura / TI | ~R$ 7.200 |
| Comercial / Vendas | ~R$ 4.800 |
| Marketing | ~R$ 2.500 |

---

## 5. APIs DISPONÍVEIS

| Endpoint | Retorno |
|----------|---------|
| `GET /admin/api/erp/cost-centers` | Lista de centros de custo ativos |
| `GET /admin/api/erp/cost-distribution` | Distribuição % de despesas por centro |
| `GET /admin/api/erp/future-revenue` | Receita futura (parcelas pendentes por mês) |
| `GET /admin/api/erp/profitability` | Lucratividade global + por centro de custo |
| `GET /admin/api/erp/dre` | DRE mensal (Receita - Custos - Fixas = Lucro) |
| `GET /admin/api/erp/cash-flow` | Fluxo de caixa 6 meses (projetado vs realizado) |

---

## 6. COMO REPLICAR

Para adicionar um novo centro de custo e seus lançamentos:

```javascript
// 1. Criar o centro
const center = await CostCenter.create({
  name: 'Novo Centro',
  code: 'NOV',
  color: '#f97316'
});

// 2. Criar despesa vinculada
const ap = await AccountsPayable.create({
  description: 'Despesa Exemplo',
  totalAmount: 5000,
  costCenterId: center.id,
  costClassification: 'variavel', // ou 'fixo'
  status: 'aberto',
  dueDate: '2026-09-15',
  approvalStatus: 'aprovado'
});

// 3. Criar parcela
await ApInstallment.create({
  payableId: ap.id,
  installmentNumber: 1,
  amount: 5000,
  dueDate: '2026-09-15',
  status: 'pendente'
});
```

---

## 7. RELACIONAMENTOS

```
cost_centers (1) ←→ (N) accounts_payable.cost_center_id
cost_centers (1) ←→ (N) accounts_receivable.cost_center_id
accounts_payable (1) ←→ (N) ap_installments.payable_id
accounts_receivable (1) ←→ (N) ar_installments.receivable_id
```

---

## 8. REFLEXO NO FRONT-END

Os dados aparecem em:
- **Financeiro → DRE:** Custos Variáveis (soma AP variáveis pagos) + Despesas Fixas (soma AP fixos pagos)
- **Financeiro → Fluxo de Caixa:** Projeção = AR pendentes - AP pendentes por mês
- **Financeiro → Lucratividade:** Margem = (Receita - Custos) / Receita × 100
- **Relatórios → Dashboard:** Distribuição % por centro
