# TEMPLATE PADRÃO — Design System Malha3D

> **Arquivo de referência visual para TODAS as janelas do sistema.**
> Baseado na implementação de `/admin/crm/previsao` (CRM → Previsão).
> Qualquer novo módulo, card, banner ou componente deve seguir ESTRITAMENTE estas regras.

---

## 1. FUNDAÇÃO CSS (Tokens Globais)

```css
/* Background da página */
background: #0a0c10;

/* Card base (.kcard) */
background: #151515;
border-radius: 5px;
box-shadow: 0 2px 8px rgba(0,0,0,0.6);
border: 1px solid rgba(255,255,255,0.06);
overflow: hidden;

/* Card destaque (borda laranja) */
border-color: rgba(249,115,22,0.3);

/* Elementos internos */
border: 1px solid rgba(255,255,255,0.06);
background: rgba(255,255,255,0.02);
border-radius: 5px;
```

---

## 2. TIPOGRAFIA

| Elemento | Tamanho | Peso | Transform | Tracking | Cor |
|----------|---------|------|-----------|----------|-----|
| Título principal (H1) | 1.4rem | 900 (font-black) | normal | tight | `#ffffff` |
| Título de card (.kcard-title) | 0.8rem | 900 | normal | normal | `#ffffff` |
| Label de seção | 9px | 900 (font-black) | UPPERCASE | 0.12em | `#9ca3af` ou cor do contexto |
| Label de stat | 7px | 700 (font-bold) | UPPERCASE | widest | `#555555` |
| Valor numérico grande | 1.5rem - 2rem | 900 | normal | -0.02em | Cor do contexto |
| Texto descritivo | 9-10px | 400-500 | normal | normal | `#9ca3af` |
| Badge | 7px | 900 | UPPERCASE | 0.04em | `rgba(255,255,255,0.85)` |

---

## 3. ESTRUTURA DO CARD (.kcard)

### HTML Base:
```html
<div class="kcard">
    <!-- Imagem de capa (opcional) -->
    <div class="kcard-img">
        <img src="/assets/[imagem].webp" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent"></div>
    </div>

    <!-- Conteúdo -->
    <div class="kcard-body">
        <!-- Badges -->
        <div class="flex items-center gap-1.5 flex-wrap mb-2">
            <span class="kcard-badge kcard-badge-orange">Label</span>
        </div>

        <!-- Título -->
        <h4 class="kcard-title">Título do Card</h4>
        <p class="text-[9px] text-[#777] uppercase tracking-widest mb-2.5">Subtítulo</p>

        <!-- Grid de stats (3 colunas) -->
        <div class="grid grid-cols-3 gap-2 text-[9px] mb-2.5 pb-2.5 border-b border-white/10">
            <div>
                <p class="text-[7px] text-[#555] uppercase tracking-widest">Label</p>
                <p class="font-bold text-emerald-400">Valor</p>
            </div>
            <!-- ... -->
        </div>

        <!-- Ações -->
        <div class="flex items-center gap-1.5">
            <button class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-orange-500 text-[8px] font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors">
                <span class="material-symbols-outlined text-[11px]">icon</span> Ação
            </button>
        </div>
    </div>
</div>
```

---

## 4. VARIANTES DE CARD

### Card sem imagem (apenas conteúdo):
```html
<div class="kcard">
    <div class="kcard-body" style="padding:20px;">
        <!-- conteúdo -->
    </div>
</div>
```

### Card com imagem curta (banner header):
```html
<div class="kcard">
    <div class="kcard-img" style="height:50px;">
        <img src="/assets/render.webp" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent"></div>
    </div>
    <div class="kcard-body" style="padding:16px 20px;">
        <!-- conteúdo -->
    </div>
</div>
```

### Card de linha (row — info + valor à direita):
```html
<div class="kcard">
    <div class="kcard-body" style="padding:14px 20px;">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-orange-400 text-sm">icon</span>
                </div>
                <div>
                    <p class="text-[8px] font-bold text-orange-400 uppercase tracking-widest">Label</p>
                    <p class="text-[7px] text-gray-500">Sublabel</p>
                </div>
            </div>
            <span class="text-base font-black text-white">R$ 50.000,00</span>
        </div>
    </div>
</div>
```

---

## 5. BADGES

```css
.kcard-badge {
    font-size: 7px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.08);
    padding: 2px 7px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
}
```

### Variantes de cor:
| Classe | Background | Color | Border |
|--------|-----------|-------|--------|
| `.kcard-badge-red` | `rgba(239,68,68,0.12)` | `#fca5a5` | `rgba(239,68,68,0.25)` |
| `.kcard-badge-orange` | `rgba(249,115,22,0.12)` | `#fdba74` | `rgba(249,115,22,0.25)` |
| `.kcard-badge-blue` | `rgba(59,130,246,0.12)` | `#93c5fd` | `rgba(59,130,246,0.25)` |
| `.kcard-badge-purple` | `rgba(168,85,247,0.12)` | `#d8b4fe` | `rgba(168,85,247,0.25)` |

---

## 6. BOTÕES

### Primário (laranja):
```html
<button class="flex items-center gap-1.5 px-4 py-2 rounded-md bg-orange-500 text-[8px] font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors">
    <span class="material-symbols-outlined text-[11px]">icon</span> Texto
</button>
```

### Secundário (outline):
```html
<button class="py-1.5 px-3 rounded-[4px] transition-all flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-gray-400 hover:text-white" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);">
    <span class="material-symbols-outlined text-[11px]">icon</span> Texto
</button>
```

### Ícone pequeno (ações do card):
```html
<button class="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
    <span class="material-symbols-outlined text-[10px] text-gray-400">icon</span>
</button>
```

---

## 7. INPUTS

```html
<input type="text" class="w-full px-3 py-2 text-xs text-white rounded-[4px]"
    style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);"
    placeholder="Placeholder...">
```

---

## 8. SEÇÕES INTERNAS (dentro de um .kcard)

```html
<div class="p-4 rounded-[5px]" style="border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02);">
    <h5 class="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1">
        <span class="material-symbols-outlined text-[10px]">icon</span> Título
    </h5>
    <p class="text-[9px] text-gray-400 leading-relaxed">Conteúdo...</p>
</div>
```

---

## 9. BANNER / HEADER DE PÁGINA

Usar a estrutura `.kcard` com imagem de fundo e conteúdo sobre ela:

```html
<div class="kcard">
    <div class="kcard-img">
        <img src="/assets/render-archviz.webp" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/60 to-transparent"></div>
    </div>
    <div class="kcard-body" style="padding:20px 24px;">
        <div class="flex items-center gap-1.5 flex-wrap mb-3">
            <span class="kcard-badge kcard-badge-orange">
                <span class="material-symbols-outlined text-[8px] align-middle mr-0.5">auto_awesome</span> Badge
            </span>
        </div>
        <h4 class="kcard-title" style="font-size:1.4rem; white-space:normal;">Título da Página</h4>
        <p class="text-[9px] text-[#777] uppercase tracking-widest">Subtítulo descritivo</p>
    </div>
</div>
```

---

## 10. GRID / LAYOUT

| Layout | Classes |
|--------|---------|
| Página wrapper | `p-6 md:p-8 flex flex-col gap-5` |
| Grid 3 colunas | `grid grid-cols-1 md:grid-cols-3 gap-4` |
| Grid 2 colunas | `grid grid-cols-1 lg:grid-cols-2 gap-4` |
| Grid 6 KPIs | `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3` |
| Spacing entre cards | `gap-4` ou `gap-5` |

---

## 11. CORES DO SISTEMA

| Cor | Hex | Uso |
|-----|-----|-----|
| Laranja (primário) | `#f97316` / `#ff9966` | CTAs, destaques, glow |
| Emerald (sucesso/dinheiro) | `#10b981` | Valores positivos, VGV |
| Rose/Red (perigo/pessimista) | `#f87171` | Alertas, cenário mínimo |
| Blue (informação) | `#3b82f6` | Leads, dados neutros |
| Purple (premium) | `#8b5cf6` | Categorias, funcionalidades |
| Amber (warning) | `#f59e0b` | Prazo, desconto |
| Cyan (tech) | `#06b6d4` | Ticket, conversão |
| Cinza texto | `#9ca3af` | Texto secundário |
| Cinza label | `#555555` | Labels de stat |
| Cinza muted | `#777777` | Subtítulos |
| Background página | `#0a0c10` | Body |
| Background card | `#151515` | Cards |

---

## 12. PROIBIÇÕES (O QUE NUNCA USAR)

- ❌ `glass-card`
- ❌ `rounded-2xl` ou `rounded-3xl` (usar apenas `rounded-md` / `5px`)
- ❌ `backdrop-blur`
- ❌ `bg-gradient-to-br from-white/X`
- ❌ `shadow-lg shadow-orange-500/30` (sombras coloridas)
- ❌ Blur blobs decorativos (`bg-orange-500/10 blur-[80px]`)
- ❌ `border-radius` maior que 10px (exceto badges com `border-radius: 10px`)
- ❌ Fontes maiores que 1.5rem para valores (exceto título principal)

---

## 13. MODO CLARO (body.theme-light)

```css
body.theme-light .kcard {
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(15,23,42,0.08);
    border: 1px solid rgba(15,23,42,0.08);
}
body.theme-light .kcard-title { color: #0f172a; }
body.theme-light .kcard-body p { color: #334155; }
```

---

## 14. REFERÊNCIA VISUAL

A implementação de referência está em: **`/admin/crm/previsao`**

Elementos-chave presentes:
1. Banner com `.kcard-img` + badge "IA Antigravity" + título + stats + botão
2. Título-seção como `.kcard` compacto com badge
3. Grid 3 colunas de cenários (Pessimista/Provável/Otimista)
4. Gráfico de barras dentro de `.kcard`
5. Sugestões IA com sub-cards internos
6. VGV Total com imagem curta + badges + valor grande

**Todos os componentes seguem: `#151515`, `5px radius`, `0 2px 8px shadow`, `1px solid rgba(255,255,255,0.06)`.**
