# PADRÕES DE CONEXÃO FRONT-END ↔ BACK-END (Malha3D)

> **REGRA OBRIGATÓRIA:** Este documento DEVE ser consultado ANTES de criar qualquer botão, modal, fetch ou interação que dependa do banco de dados. O objetivo é ELIMINAR definitivamente o problema crônico de "botões mortos" no sistema.

---

## 1. REGRA DE OURO: NUNCA CRIE UM BOTÃO SEM A FUNÇÃO

Todo botão que referencia uma `window.functionName()` DEVE ter a função correspondente **NO MESMO ARQUIVO** e **DEFINIDA ANTES** de ser chamada (ou no DOMContentLoaded).

### ❌ ERRADO (Causa botão morto):
```html
<!-- Botão criado via innerHTML -->
<button onclick="window.openDetail('123')">Detalhes</button>

<!-- Função NÃO existe no arquivo → botão morto -->
```

### ✅ CORRETO:
```javascript
// 1. DEFINIR a função ANTES de qualquer render
window.openDetail = async function(id) {
  // ... fetch + modal
};

// 2. DEPOIS renderizar o HTML que a usa
tbody.innerHTML = items.map(item => 
  `<button onclick="window.openDetail('${item.id}')">Detalhes</button>`
).join('');
```

---

## 2. CHECKLIST OBRIGATÓRIO PARA TODA INTERAÇÃO

Antes de considerar pronto, verificar:

| # | Check | Descrição |
|---|-------|-----------|
| 1 | ✅ Função existe? | `window.nomeDaFuncao` está definida no `<script>` |
| 2 | ✅ API existe? | O endpoint `GET/POST /admin/api/...` está no `routes/admin.js` |
| 3 | ✅ Model existe? | A tabela/model referenciada está em `models/` e registrada em `models/index.js` |
| 4 | ✅ Import existe? | O model está importado no `routes/admin.js` (destructuring no topo) |
| 5 | ✅ Rota não interceptada? | Rotas com `:id` devem ficar DEPOIS de rotas nomeadas (ex: `/pendentes` antes de `/:id`) |
| 6 | ✅ Erro tratado? | `try/catch` com fallback visual (alert ou toast) |
| 7 | ✅ Feedback visual? | Após ação: toast de sucesso + reload do componente |

---

## 3. PADRÃO DE MODAL (Template)

```javascript
window.openXxxModal = async function(id) {
  // 1. Remover modal anterior
  var existing = document.getElementById('xxxModal');
  if (existing) existing.remove();

  try {
    // 2. Buscar dados da API
    var res = await fetch('/admin/api/xxx/' + id);
    var data = await res.json();
    if (!data.success) { alert(data.error || 'Erro'); return; }

    // 3. Formatar dados
    var item = data.item;
    var fmt = function(n) { return 'R$ ' + parseFloat(n||0).toLocaleString('pt-BR', {minimumFractionDigits:2}); };

    // 4. Construir HTML
    var modalHtml = '<div id="xxxModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/80" style="display:flex;">' +
      '<div style="background:#151515; border-radius:5px; box-shadow:0 2px 8px rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.06); width:100%; max-width:600px; max-height:85vh; overflow:hidden; display:flex; flex-direction:column;" class="mx-4">' +
      // header
      '<header style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);" class="flex items-center justify-between shrink-0">' +
      '<p class="text-[11px] font-black text-white">' + item.title + '</p>' +
      '<button onclick="document.getElementById(\'xxxModal\').remove()" class="w-7 h-7 rounded-[4px] flex items-center justify-center text-gray-400 hover:text-white" style="background:rgba(255,255,255,0.05);"><span class="material-symbols-outlined text-sm">close</span></button>' +
      '</header>' +
      // body
      '<div style="padding:16px 20px; overflow-y:auto;" class="flex-1 space-y-3 custom-scrollbar">' +
      '<!-- conteúdo -->' +
      '</div></div></div>';

    // 5. Inserir no DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

  } catch(e) {
    alert('Erro ao carregar: ' + e.message);
  }
};
```

---

## 4. PADRÃO DE FETCH (API Call)

```javascript
// POST com JSON
async function apiCall(endpoint, body) {
  try {
    var res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    var data = await res.json();
    if (!data.success) throw new Error(data.error || 'Falha');
    return data;
  } catch(e) {
    if (window.showToast) window.showToast(e.message, 'error');
    throw e;
  }
}
```

---

## 5. PADRÃO DE ROTA (Back-End)

```javascript
// REGRA: Rotas nomeadas ANTES de rotas com :id
router.get('/api/xxx/pendentes', requireAuth, async (req, res) => { ... });  // ← PRIMEIRO
router.get('/api/xxx/resumo', requireAuth, async (req, res) => { ... });      // ← PRIMEIRO
router.get('/api/xxx/:id', requireAuth, async (req, res) => { ... });         // ← POR ÚLTIMO
```

---

## 6. PADRÃO DE TABELA DINÂMICA (innerHTML)

```javascript
window.loadXxx = async function() {
  var tbody = document.getElementById('xxx-tbody');
  if (!tbody) return;
  try {
    var res = await fetch('/admin/api/xxx');
    var data = await res.json();
    if (!data.success || !data.items.length) {
      tbody.innerHTML = '<tr><td colspan="X" class="text-center py-4 text-[9px] text-gray-500">Vazio</td></tr>';
      return;
    }
    tbody.innerHTML = data.items.map(function(item) {
      return '<tr class="xxx-row" data-id="' + item.id + '" data-status="' + item.status + '">' +
        '<td>...</td>' +
        '<td class="text-right"><button onclick="window.openXxxDetail(\'' + item.id + '\')">Detalhes</button></td>' +
        '</tr>';
    }).join('');
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="X" class="text-center py-4 text-[9px] text-red-400">Erro</td></tr>';
  }
};
```

---

## 7. DIAGNÓSTICO DE "BOTÃO MORTO" (Checklist de Debug)

Quando um botão não funciona:

1. **Abrir Console do Browser (F12)** → verificar erro JS
2. **Verificar se a função existe:** Digite `window.nomeDaFuncao` no console — se retornar `undefined`, a função não foi carregada
3. **Verificar se a API responde:** No console: `fetch('/admin/api/xxx').then(r=>r.json()).then(console.log)`
4. **Verificar se o ID está correto:** Inspecionar o elemento e ver o `onclick` — o ID está preenchido ou está vazio/undefined?
5. **Verificar se o `<script>` tag está intacto:** Um `</script>` acidental dentro de um template literal quebra TUDO abaixo

---

## 8. ANTI-PADRÕES (O QUE NUNCA FAZER)

| ❌ Anti-padrão | ✅ Correto |
|----------------|------------|
| `<script>` dentro de template literal | Mover lógica para DEPOIS do `insertAdjacentHTML` |
| `onclick` referenciando função não definida | Definir a função ANTES do render |
| Rota `/:id` antes de rota nomeada | Rotas nomeadas primeiro, `:id` por último |
| `await` sem `try/catch` | Sempre envolver em try/catch com feedback |
| Modal sem botão de fechar | Sempre incluir X no header + click fora |
| Tabela sem loading state | Mostrar "Carregando..." antes do fetch |
| Fetch sem verificação de `data.success` | Sempre validar antes de usar os dados |
