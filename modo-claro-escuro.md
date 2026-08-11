# MODO CLARO & ESCURO — Regras de Tema (Malha3D)

> **Nome do arquivo:** `modo-claro-escuro.md`
> **Propósito:** Garantir que TODOS os componentes do sistema alternem corretamente entre modo claro e escuro.
> **Gatilho:** Classe `body.theme-light` ativada pelo toggle de tema no menu lateral.

---

## 1. COMO FUNCIONA

O sistema usa uma classe no `<body>`:
- **Modo escuro (padrão):** `<body class="bg-dark-950 text-gray-100">`
- **Modo claro:** `<body class="bg-dark-950 text-gray-100 theme-light">`

Todos os overrides são feitos via `body.theme-light .classe { ... }` no CSS global (`views/layouts/admin.hbs`).

---

## 2. TOKENS DE COR (Dark → Light)

| Token | Modo Escuro | Modo Claro |
|-------|-------------|------------|
| Background página | `#0a0c10` | `#f1f5f9` |
| Background card | `#151515` | `#ffffff` |
| Texto principal | `#ffffff` | `#0f172a` |
| Texto secundário | `rgba(255,255,255,0.55)` | `#64748b` |
| Texto muted | `#555555` / `#777777` | `#94a3b8` |
| Borda card | `rgba(255,255,255,0.06)` | `rgba(15,23,42,0.08)` |
| Sombra card | `0 2px 8px rgba(0,0,0,0.6)` | `0 1px 4px rgba(15,23,42,0.08)` |
| Background inner | `rgba(255,255,255,0.02)` | `rgba(0,0,0,0.02)` |
| Borda inner | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.08)` |

---

## 3. COMPONENTES COM SUPORTE

| Componente | Classe | Override Claro |
|------------|--------|----------------|
| Card Kanban | `.kcard` | ✅ `background: #fff; border: rgba(15,23,42,0.08)` |
| Card Panel | `.kcard-panel` | ✅ `background: #fff` |
| Título | `.kcard-title` | ✅ `color: #0f172a` |
| Badge | `.kcard-badge` | ✅ `color: #334155; bg: rgba(0,0,0,0.04)` |
| Dashboard Card | `.ds-card` | ✅ Full override |
| Uiverse Card | `.uv-card` | ✅ `background: #fff; glow opacity: 0.15` |
| Finance Tab | `.finance-tab-btn` | ✅ `color: #64748b` |
| Tables | `th`, `td` | ✅ Cores ajustadas |
| Modais inline | `style="background:#151515"` | ✅ Override via `[style*=]` |
| Inner sections | `style="background:rgba(255,255,255,0.02)"` | ✅ Invertido |
| Inputs | `.ds-input` | ✅ `bg: rgba(0,0,0,0.02); color: #0f172a` |
| Cor semântica emerald | `.text-emerald-400` | ✅ `#059669` (mais escuro) |
| Cor semântica orange | `.text-orange-400` | ✅ `#d97706` |
| Cor semântica red | `.text-red-400` | ✅ `#dc2626` |

---

## 4. COMO ADICIONAR SUPORTE A UM NOVO COMPONENTE

Ao criar qualquer novo card/componente com fundo `#151515`:

### Opção A: Usar classe existente (`.kcard` ou `.kcard-panel`)
O override já está aplicado globalmente. Apenas use a classe.

### Opção B: Inline style (quando necessário)
Se usou `style="background:#151515"`, o CSS global já faz override:
```css
body.theme-light [style*="background:#151515"] {
    background: #ffffff !important;
    border-color: rgba(15,23,42,0.08) !important;
}
```

### Opção C: Novo componente custom
Adicione o override em `views/layouts/admin.hbs` na seção "MODO CLARO":
```css
body.theme-light .meu-novo-componente {
    background: #ffffff;
    color: #0f172a;
    border-color: rgba(15,23,42,0.08);
}
```

---

## 5. REGRAS OBRIGATÓRIAS

1. **NUNCA** usar `color: white` hardcoded sem override claro
2. **NUNCA** usar `background: #151515` sem estar dentro de `.kcard` ou `.kcard-panel`
3. **SEMPRE** que criar texto branco, ele DEVE ter override para `#0f172a` no modo claro
4. **SEMPRE** que criar borda `rgba(255,255,255,X)`, deve existir override para `rgba(0,0,0,X)`
5. **CORES SEMÂNTICAS** (verde/vermelho/laranja) devem ficar mais escuras no modo claro para legibilidade

---

## 6. TESTE DE VERIFICAÇÃO

Para testar o modo claro:
1. Abrir qualquer página do admin
2. No console do browser: `document.body.classList.toggle('theme-light')`
3. Verificar que TODOS os cards, textos e bordas alternaram
4. Se algo ficou com fundo escuro ou texto branco ilegível → precisa de override

---

## 7. LISTA DE ARQUIVOS AFETADOS

O CSS de modo claro está em **um único local**:
- `views/layouts/admin.hbs` → seção "MODO CLARO — Todos os cards, modais e componentes"

Os overrides cobrem:
- `.kcard` + `.kcard-title` + `.kcard-badge` + `.kcard-body`
- `.kcard-panel`
- `.ds-card` + `.ds-card-header` + `.ds-text` + `.ds-input`
- `.uv-card` + `.uv-inner` + `.uv-value`
- `.finance-tab-btn`
- `[style*="background:#151515"]` (inline)
- `[style*="background:rgba(255,255,255,0.02)"]` (inner sections)
- `table th`, `table td`
- Cores: `.text-emerald-400`, `.text-orange-400`, `.text-red-400`, `.text-blue-400`, `.text-purple-400`, `.text-cyan-400`, `.text-amber-400`
