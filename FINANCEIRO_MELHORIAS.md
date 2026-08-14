# Melhorias do Financeiro — Ordenação, Vinculação a Projetos e Correção de Ferramentas

## 1. ADICIONAR ORDENAÇÃO POR COLUNA

### Implementação:
- Adicionar ícones de ordenação nos headers da tabela
- Implementar função de ordenação ascendente/descendente
- Ciclo: Sem ordem → Ascendente → Descendente → Sem ordem

### A Receber (Contas a Receber):
- **Descrição** → Ordenar A→Z / Z→A
- **Valor Total** → Maior → Menor / Menor → Maior
- **Valor Parcela** → Maior → Menor / Menor → Maior
- **Status** → Por status predefinido (Quitado > Parcial > Aberto > Atrasado > Cancelado)

### A Pagar (Contas a Pagar):
- **Descrição** → Ordenar A→Z / Z→A
- **Valor Total** → Maior → Menor / Menor → Maior
- **Valor Parcela** → Maior → Menor / Menor → Maior
- **Vencimento** → Data mais próxima → mais distante / mais distante → mais próxima
- **Status** → Por status predefinido

---

## 2. VINCULAÇÃO A RECEBER COM PROJETOS

**Problema:** Valores "A Receber" devem vir do campo "Projeto" que foi lançado no módulo de Projetos.

### Solução:
- Criar modelo `AccountsReceivable` com `projectId` (FK)
- Ao criar Receita vinculada a Projeto → Gerar `AccountsReceivable` automaticamente
- Modal de Lançamento: Campo "Projeto Vinculado" já aparece em `fields-common`
- API `/admin/api/erp/receivables` buscar junto com Budget/Project

---

## 3. CORRIGIR FERRAMENTAS: CRIAR E LIMPAR LANÇAMENTOS

### Problema:
- `openGenerateReceivableModal()` e `openGeneratePayableModal()` usam `prompt()` do navegador (antigo)
- Ao criar, não integra com toda a lógica de campos do modal
- Modal fica inconsistente com sistema de modais customizados

### Solução:
- Remover `prompt()` e reorientar para modal visual
- Usar o modal `#newTransactionModal` que já existe e está completo
- Botões "Novo" devem abrir modal com campos pré-populados
- Sistema de "Criar e Limpar" precisa fazer o ciclo completo de validações

---

## 4. ESTRUTURA DE DADOS E BANCO

### Models necessários:
```javascript
// AccountsReceivable
- id (UUID)
- budgetId (FK → Budget) — Projeto que gerou a receita
- projectId (FK → Project) — Se houver projeto específico
- description (String)
- totalAmount (Decimal)
- installmentsCount (Integer)
- installments → hasMany ARInstallment
- status (aberto, parcial, quitado, atrasado, cancelado)
- paymentMethod
- originDate
- bankAccount
```

```javascript
// ARInstallment
- id (UUID)
- accountsReceivableId (FK)
- installmentNumber (Integer)
- amount (Decimal)
- dueDate (Date)
- paidDate (Date nullable)
- status (pendente, pago, atrasado)
```

Idem para `AccountsPayable` e `APInstallment`.

---

## 5. FUNÇÕES JS A IMPLEMENTAR

### Frontend (finance.hbs):
```javascript
// Ordenação
window.sortARTable = function(column, order) { /* ASC/DESC */ }
window.sortAPTable = function(column, order) { /* ASC/DESC */ }

// Criar/Limpar integrado
window.openCreateReceivableModal = function() { /* Modal visual */ }
window.openCreatePayableModal = function() { /* Modal visual */ }
```

### Backend (routes/admin.js):
```javascript
POST /admin/api/erp/receivables/generate
DELETE /admin/api/erp/receivables/clear

POST /admin/api/erp/payables/generate
DELETE /admin/api/erp/payables/clear
```

---

## 6. SEQUENCE DE IMPLEMENTAÇÃO

1. **Backend → Models** (AccountsReceivable, ARInstallment, etc.)
2. **Backend → API endpoints** (generate, clear, sort logic)
3. **Frontend → Headers sortáveis** (adicionar ícones e onclick)
4. **Frontend → Funções de ordenação** (sort logic)
5. **Frontend → Modal criar/limpar** (visual, integrado)
6. **Testes** (geração de dados, filtros, ordenação)

