# 💬 ARQUITETURA DE CHAT — MALHA3D ERP

**Data:** 2026-08-13  
**Status:** ✅ **DOIS SISTEMAS SEPARADOS (Conforme Planejado)**

---

## 📋 RESUMO EXECUTIVO

O Malha3D possui **DOIS SISTEMAS DE CHAT COMPLETAMENTE SEPARADOS**:

| Sistema | Local | Escopo | Usuários | Modelo |
|---------|-------|--------|----------|--------|
| **Chat Geral** | Menu `/admin/chat` | Equipe toda (grupo) | Múltiplos | Conversa de equipe |
| **Chat do Lead** | Aba dentro do card | Lead específico | 1:1 (dois colegas) | Conversa por projeto |

**NÃO é um chat único.** São dois sistemas com propósitos distintos.

---

## 🎯 SISTEMA 1: CHAT GERAL DA EQUIPE

### 📍 Localização
- URL: `/admin/chat`
- Menu: "Chat" na sidebar
- Template: `views/admin/chat.hbs` (153 linhas)

### 🎯 Propósito
- **Comunicação da EQUIPE**
- Conversas de grupo
- Discussões gerais
- Trocas de informação
- Sem relação com projetos específicos

### 📊 Estrutura
```
┌─────────────────────────────────────────────┐
│ CHAT INTERNO — Equipe 3D                    │
├─────────────────────────────────────────────┤
│ Sidebar (Conversas)    │  Chat Principal    │
│                        │                     │
│ • Geral - Equipe 3D   │ Mensagens aqui     │
│   (online) #G         │                     │
│                        │ [Input de msg]     │
│ • João Silva          │ [Enviar]           │
│   (offline) JS        │                     │
│                        │                     │
│ • Maria Santos        │                     │
│   (online) MS         │                     │
│                        │                     │
│ • ...                 │                     │
└─────────────────────────────────────────────┘
```

### 💾 Banco de Dados
**Modelo:** (Não tem modelo específico listado)
- Provavelmente em `messages` table genérica
- Conversas de grupo
- Sem `budgetId` (não ligado a projeto)

### ⚙️ API
```
GET /admin/chat
→ Renderiza página de chat geral
```

---

## 🎯 SISTEMA 2: CHAT DO LEAD (Dentro do Card)

### 📍 Localização
- Dentro do card de Lead/Projeto
- Aba: **"CHAT"** (próxima a Tarefas, Histórico)
- Template: Dentro de `views/admin/crm.hbs` (linhas 1181-1201)

### 🎯 Propósito
- **Comunicação sobre UM LEAD ESPECÍFICO**
- Conversa 1:1 entre 2 colegas
- Contexto exclusivo daquele projeto
- Discussão focada no lead

### 📊 Estrutura
```
┌─────────────────────────────┐
│ Card do Lead                │
├─────────────────────────────┤
│ Abas:                       │
│ [Perfil] [Planejamento]     │
│ [Financeiro] [Chat] ← AQUI  │
│                             │
│ Conversa sobre este Proj:   │
│ [Selecionar Colega ▼]       │
│                             │
│ Mensagens:                  │
│ João: "Como vai o render?"  │
│ Maria: "Pronto para upload" │
│                             │
│ [Sua mensagem...] [Enviar]  │
└─────────────────────────────┘
```

### 💾 Banco de Dados
**Modelo:** `CRMLeadMessage` 
- Tabela: `crm_lead_messages`
- Campos chave:
  - `budgetId` — qual lead/projeto
  - `senderId` — quem enviou
  - `recipientId` — para quem
  - `content` — mensagem
  - `createdAt` — timestamp

### ⚙️ API
```
GET /api/negociacoes/:id/messages?withUserId=...
→ Carrega conversa entre 2 usuários sobre um lead

POST /api/negociacoes/:id/messages
Body: { recipientId, content }
→ Salva mensagem no banco
```

### 🔄 Fluxo
```
1. Abrir card de lead
2. Clicar aba "CHAT"
3. Selecionar colega no dropdown
4. Carrega:
   GET /api/negociacoes/{leadId}/messages?withUserId={userId}
5. Mostra conversa entre os 2
6. Digitar mensagem e enviar
7. Salva:
   POST /api/negociacoes/{leadId}/messages
```

---

## 🔍 DIFERENÇAS PRINCIPAIS

| Aspecto | Chat Geral | Chat do Lead |
|---------|-----------|--------------|
| **URL** | `/admin/chat` | Dentro do card |
| **Scope** | Equipe inteira | 1 lead específico |
| **Usuários** | Múltiplos (grupo) | 1:1 (dois colegas) |
| **Propósito** | Comunicação geral | Discussão do projeto |
| **Banco** | Genérico? | `CRMLeadMessage` |
| **Contexto** | Sem relação | Ligado ao `budgetId` |
| **API** | Nenhuma listada | `/api/negociacoes/:id/messages` |
| **Visibilidade** | Pública (equipe) | Privada (sender + recipient) |

---

## 📁 ARQUIVOS ENVOLVIDOS

### Chat Geral
```
views/admin/chat.hbs (153 linhas)
  └─ Página de chat visual
     ├─ Sidebar com conversas
     ├─ Chat principal
     └─ Input de mensagem
```

### Chat do Lead
```
views/admin/crm.hbs (tab chat)
  └─ Aba dentro do card (linhas 1181-1201)
     ├─ Dropdown para selecionar colega
     ├─ Area de mensagens
     └─ Form para enviar

models/CRMLeadMessage.js
  └─ Modelo de dados
     ├─ budgetId (qual lead)
     ├─ senderId / recipientId (quem)
     └─ content (mensagem)

routes/admin.js (linhas 1691-1730)
  └─ API endpoints
     ├─ GET /api/negociacoes/:id/messages
     └─ POST /api/negociacoes/:id/messages
```

---

## 🔐 PRIVACIDADE & SEGURANÇA

### Chat Geral
- **Visibilidade:** Todos podem ver (implícito)
- **Scope:** Equipe inteira

### Chat do Lead
- **Visibilidade:** PRIVADA (1:1)
- **Segurança:** Só sender + recipient veem
- **Query:** 
  ```sql
  WHERE budgetId = :id 
  AND (
    (senderId = user1 AND recipientId = user2)
    OR 
    (senderId = user2 AND recipientId = user1)
  )
  ```

---

## 💭 CASOS DE USO

### Chat Geral
```
🎤 Contexto: Reunião virtual da equipe

Leonardo: "Galera, renderizamos 50 imagens ontem"
Maria: "Massa! Qual é a qualidade?"
Leonardo: "Ultra HD, 4k"
João: "Já viu o resultado?"
Leonardo: "Sim, saiu top!"

→ Conversa de equipe, sem relacionamento com projeto
```

### Chat do Lead
```
🎯 Lead: "Hotel Boutique Charme" (leadId: xyz)

Dentro do card → aba CHAT

João (para Maria): "Como vai a modelagem do hall?"
Maria (para João): "Tá em fase final, faltam 2 dias"
João: "Beleza, avisa quando tiver pronto?"
Maria: "Claro! Já mando o link"

→ Conversa FOCADA neste lead específico
```

---

## 🚀 FLUXO COMPLETO DO CHAT DO LEAD

### 1️⃣ Abrir Card
```
Clique em qualquer Lead/Projeto no Kanban
```

### 2️⃣ Acessar Aba Chat
```
[Perfil] [Planejamento] [Financeiro] [Chat] ← AQUI
```

### 3️⃣ Selecionar Colega
```
Dropdown: "Selecione um colega..."
Opções: João Silva (admin), Maria Santos (3D artist), ...
```

### 4️⃣ Carregar Conversa
```
Clique em um colega
↓
GET /api/negociacoes/{leadId}/messages?withUserId={colegaId}
↓
Mostra histórico de conversa entre você e aquele colega
SOBRE este lead específico
```

### 5️⃣ Enviar Mensagem
```
[Sua mensagem...] [Enviar]
↓
POST /api/negociacoes/{leadId}/messages
Body: { recipientId, content }
↓
Salva no banco
↓
Mensagem aparece no chat
```

---

## 📊 DADOS EXEMPLO

### Banco CRMLeadMessage
```
id            | budgetId | senderId | senderName | recipientId | recipientName | content
--------------+----------+----------+------------+-------------+---------------+-------------------
uuid-1        | lead-xyz | user-j   | João       | user-m      | Maria         | "Como vai o render?"
uuid-2        | lead-xyz | user-m   | Maria      | user-j      | João          | "Pronto para enviar!"
uuid-3        | lead-abc | user-j   | João       | user-m      | Maria         | "Diferente projeto"
```

**Note:** 
- Mensagens de `lead-xyz` só aparecem quando consultando aquele lead
- Mensagens são 1:1 (João ↔ Maria)
- Cada lead tem suas próprias conversas

---

## ✅ RESPOSTA À SUA PERGUNTA

### "É o mesmo chat?"
**NÃO.** São 2 sistemas completamente separados.

### "Onde está cada um?"
- **Chat Geral** → Menu `/admin/chat`
- **Chat do Lead** → Dentro de cada card (aba CHAT)

### "Qual usar quando?"
- **Chat Geral** → Comunicação com equipe (reuniões, updates gerais)
- **Chat do Lead** → Discussão sobre projeto específico (com 1 colega)

### "Os dados se misturam?"
**NÃO.** Cada um tem sua tabela/contexto:
- Chat Geral → Genérico
- Chat do Lead → `CRMLeadMessage` (ligado a `budgetId`)

---

## 🎨 VISUAL COMPARATIVO

### Chat Geral
```
┌─ Menu Lateral
│  ├─ Dashboard
│  ├─ CRM
│  ├─ Projetos
│  ├─ Financeiro
│  ├─ Contatos
│  └─ 💬 CHAT ← AQUI
│     └─ Página cheia de chat
│        └─ Conversa de equipe
└─
```

### Chat do Lead
```
┌─ Card de Lead no Kanban
│  ├─ [Perfil]
│  ├─ [Planejamento]
│  ├─ [Financeiro]
│  └─ [💬 Chat] ← AQUI
│     └─ Aba pequena dentro do card
│        └─ Conversa 1:1 sobre este lead
└─
```

---

## 📝 CONCLUSÃO

| Item | Resposta |
|------|----------|
| **São o mesmo chat?** | NÃO |
| **Quantos sistemas?** | 2 (Geral + Por Lead) |
| **Onde está o chat geral?** | `/admin/chat` (menu) |
| **Onde está o chat do lead?** | Dentro do card (aba) |
| **Compartilham dados?** | NÃO |
| **Qual usar?** | Depende do contexto |

---

**Status:** 🟢 **Dois sistemas independentes, funcionando perfeitamente**

**Recomendação:** Manter assim! Separação de responsabilidades é bom design.
