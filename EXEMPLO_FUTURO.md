# EXEMPLO FUTURO — Padrão de Congelamento de Páginas e Ferramentas (v2.0)

> **Este arquivo documenta o padrão oficial para congelar páginas/funcionalidades que ainda não estão prontas.**
> Aplicar em QUALQUER módulo que será liberado apenas na v2.0 do sistema Malha3D.

---

## 🎯 Regras Fundamentais

1. **A PÁGINA É APENAS VISUAL** — Front-end aparece, mas não executa ações reais (sem API calls, sem CRUD, sem mutations)
2. **50% OPACA** — Toda a página (incluindo o nome) fica `opacity-50` para indicar claramente que não é funcional
3. **NADA É INTERATIVO** — Botões não funcionam, nada é clicável, nada é movível, drag-and-drop desativado, hover-effects desativados
4. **DADOS FICTÍCIOS** — Apenas dados estáticos hardcoded aparecem (nunca dados reais do banco)
5. **BADGE v2.0 PRÓXIMO AO NOME** — Marca visual sempre ao lado do título da página, sem quebrar o layout
6. **BANNER PADRÃO AMARELO** — Texto fixo que aparece em toda página congelada

---

## 📐 Anatomia de uma Página Congelada v2.0

```
┌────────────────────────────────────────────────────────┐
│ [Nome da Página]  [v2.0]   ← Badge ao lado do título  │
├────────────────────────────────────────────────────────┤
│ ⚠️ BANNER AMARELO — Texto padrão "Exemplo Futuro..."   │
├────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐   │
│ │ Conteúdo (50% opaco)                              │   │
│ │ - Cards, tabelas, gráficos com dados FICTÍCIOS    │   │
│ │ - pointer-events-none (nada clicável)             │   │
│ │ - select-none (nada selecionável)                 │   │
│ │ - static (não há drag/drop)                       │   │
│ └──────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementação Padrão (HTML)

### 1. Badge `v2.0` ao lado do título da página

**IMPORTANTE:** O badge deve estar **INLINE** (não flutuante/absoluto) para não quebrar o layout nem bugar o design.

```html
<!-- Título + Badge INLINE -->
<div class="flex items-center gap-2 mb-2">
  <h1 class="text-2xl font-black text-white tracking-tight">Nome da Página</h1>
  <span class="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">v2.0</span>
</div>
<p class="text-sm text-gray-500 font-medium">Descrição curta da página.</p>
```

### 2. Container principal com 50% de opacidade

```html
<!-- Envolve TUDO da página -->
<div class="opacity-50 pointer-events-none select-none">
  <!-- Todo o conteúdo da página aqui -->
  <!-- Cards, tabelas, gráficos, formulários, etc. -->
</div>
```

### 3. Banner padrão amarelo (OBRIGATÓRIO)

**Texto fixo para todas as páginas v2.0** (copiar exatamente):

```html
<div class="flex items-center gap-3 p-4 rounded-[5px] mb-4"
     style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25);">
  <span class="material-symbols-outlined text-amber-400 text-base">info</span>
  <div>
    <p class="text-[10px] font-black text-amber-400 uppercase tracking-widest">Exemplo Futuro de Ferramenta</p>
    <p class="text-[9px] text-amber-400/70 leading-relaxed">
      Esta página é apenas um exemplo visual de como será a ferramenta na versão 2.0.
      Os dados exibidos são fictícios e nenhuma ação é executada.
      A funcionalidade completa estará disponível no lançamento da v2.0.
    </p>
  </div>
</div>
```

### 4. Estrutura Completa (Template Pronto)

```handlebars
<div class="p-4 md:p-5 flex flex-col gap-4 bg-transparent">

  <!-- Cabeçalho: Título + Badge v2.0 -->
  <div class="flex justify-between items-end shrink-0">
    <div>
      <div class="flex items-center gap-2 mb-2">
        <h1 class="text-2xl font-black text-white tracking-tight">NOME DA PÁGINA</h1>
        <span class="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">v2.0</span>
      </div>
      <p class="text-sm text-gray-500 font-medium">Descrição da página.</p>
    </div>
  </div>

  <!-- Banner de Aviso -->
  <div class="flex items-center gap-3 p-4 rounded-[5px]"
       style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25);">
    <span class="material-symbols-outlined text-amber-400 text-base">info</span>
    <div>
      <p class="text-[10px] font-black text-amber-400 uppercase tracking-widest">Exemplo Futuro de Ferramenta</p>
      <p class="text-[9px] text-amber-400/70 leading-relaxed">
        Esta página é apenas um exemplo visual de como será a ferramenta na versão 2.0.
        Os dados exibidos são fictícios e nenhuma ação é executada.
        A funcionalidade completa estará disponível no lançamento da v2.0.
      </p>
    </div>
  </div>

  <!-- CONTAINER 50% OPACO — Tudo dentro aqui -->
  <div class="opacity-50 pointer-events-none select-none flex-1">

    <!-- Cards fictícios, tabelas, gráficos... -->
    <div class="kcard">
      <div class="kcard-body">
        <h3 class="text-base font-black text-white">Exemplo de Card Fictício</h3>
        <p class="text-xs text-gray-500">R$ 99.999,99 (dado inventado)</p>
      </div>
    </div>

    <!-- Mais elementos fictícios aqui -->

  </div>
</div>
```

---

## 🎨 Variantes do Badge v2.0

### Inline (RECOMENDADO — para títulos de página)
```html
<span class="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">v2.0</span>
```

### Absoluto (apenas para abas/botões pequenos — NÃO usar em títulos)
```html
<span class="absolute -top-1 -right-1 text-[6px] font-black bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30">v2.0</span>
```

---

## 🔧 Classes Utilitárias Obrigatórias

| Classe | Função | Aplicar em |
|--------|--------|-----------|
| `opacity-50` | Deixa página inteira semi-transparente | Container principal |
| `pointer-events-none` | Desativa cliques, hovers, drags | Container principal |
| `select-none` | Impede seleção de texto | Container principal |
| `cursor-not-allowed` | Cursor visual de "não permitido" (opcional) | Elementos interativos específicos |
| `disabled` | Para inputs/buttons (opcional) | Form fields |

---

## 📊 Dados Fictícios — Padrão ArchViz 3D

Usar números REALISTAS para ArchViz 3D:

| Métrica | Faixa Fictícia |
|---------|----------------|
| Receitas mensais | R$ 45.000 ~ R$ 120.000 |
| Despesas mensais | R$ 25.000 ~ R$ 65.000 |
| Margem líquida | 28% ~ 42% |
| Ticket médio | R$ 8.500 ~ R$ 35.000 |
| Projetos/mês | 4 ~ 12 |
| Leads qualificados/mês | 15 ~ 35 |
| Taxa de conversão | 18% ~ 35% |

### Dados de clientes fictícios:
```javascript
const CLIENTES_FICTICIOS = [
  'Construtora Aurora',
  'Residencial Vista Verde',
  'Edifício Metropolitano',
  'Galpão Industrial SP',
  'Casa de Praia Itanhaém',
  'Hotel Boutique Centro',
  'Loft Industrial Vila Madalena'
];
```

---

## 📁 Módulos Aplicados (Tracking)

| # | Módulo/Página | Arquivo | Status | Badge v2.0 | Banner | 50% Opaco |
|---|---------------|---------|--------|------------|--------|-----------|
| 1 | DRE (Financeiro) | `views/admin/finance.hbs` | ✅ | ✅ | ✅ | ✅ |
| 2 | Lucratividade (Financeiro) | `views/admin/finance.hbs` | ✅ | ✅ | ✅ | ✅ |
| 3 | Portal do Cliente | `views/admin/portal-cliente.hbs` | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Como Aplicar em Nova Página v2.0

1. **Copie a estrutura completa** do template "Estrutura Completa" acima
2. **Substitua o título** pelo nome real da página (mantendo o badge inline)
3. **Substitua o conteúdo** dentro de `<div class="opacity-50 pointer-events-none select-none">` por elementos com dados hardcoded
4. **Verifique:**
   - [ ] Badge `v2.0` ao lado do título (NÃO absoluto, INLINE)
   - [ ] Banner amarelo com texto padrão EXATO
   - [ ] Container `opacity-50 pointer-events-none select-none`
   - [ ] Sem chamadas API / fetch / mutations
   - [ ] Sem drag-and-drop funcional
   - [ ] Sem botões clicáveis (apenas visuais)
5. **Adicione na tabela de tracking** acima

---

## ⚠️ Erros Comuns a Evitar

| ❌ NÃO FAÇA | ✅ FAÇA EM VEZ DISSO |
|------------|----------------------|
| Badge `v2.0` com `position: absolute` no título | Badge `v2.0` inline (flex) |
| Esquecer o banner amarelo | SEMPRE incluir banner com texto padrão |
| `opacity-30` (muito transparente) | `opacity-50` (50% exato) |
| Página interativa "só pra teste" | Página 100% estática, nada funciona |
| Dados reais do banco | Dados hardcoded fictícios |
| Botões que abrem modais | Botões visuais sem onclick |

---

## 📝 Texto Padrão do Banner (Copie Exato)

> **Exemplo Futuro de Ferramenta**
>
> Esta página é apenas um exemplo visual de como será a ferramenta na versão 2.0.
> Os dados exibidos são fictícios e nenhuma ação é executada.
> A funcionalidade completa estará disponível no lançamento da v2.0.

Este texto é **FIXO** e deve aparecer em toda página congelada sem variações.