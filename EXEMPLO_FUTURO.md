# EXEMPLO FUTURO — Padrão de Congelamento de Ferramentas (v2.0)

> **Este arquivo documenta o padrão para congelar funcionalidades que ainda não estão prontas.**
> Aplicar em qualquer módulo que será liberado apenas na v2.0 do sistema.

---

## Regras

1. **CONGELE** — A funcionalidade não executa ações reais (sem API calls, sem CRUD)
2. **DEIXE OPACO** — O botão/aba aparece com `opacity-50` e um badge `EM BREVE`
3. **MOSTRE PARA O CLIENTE** — O módulo continua visível no menu/tabs, não é removido
4. **AO CLICAR** — Exibe uma versão EXEMPLAR da página com dados fictícios simulados
5. **AVISO OBRIGATÓRIO** — Banner no topo com texto: "EXEMPLO FUTURO DE FERRAMENTA"

---

## Implementação Padrão (HTML)

### Botão/Aba no Menu:
```html
<button class="... opacity-50 pointer-events-auto relative" data-tab="NOME_TAB">
 <span class="material-symbols-outlined text-[12px]">ICON</span> NOME
 <span class="absolute -top-1 -right-1 text-[6px] font-black bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30">v2.0</span>
</button>
```

### Banner de Aviso (dentro do tab pane):
```html
<div class="flex items-center gap-2 p-3 rounded-[5px] mb-4" style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25);">
 <span class="material-symbols-outlined text-amber-400 text-sm">info</span>
 <div>
  <p class="text-[9px] font-black text-amber-400 uppercase tracking-widest">Exemplo Futuro de Ferramenta</p>
  <p class="text-[8px] text-amber-400/70">Esta visualização contém dados simulados. Funcionalidade completa disponível na versão 2.0.</p>
 </div>
</div>
```

### Overlay sobre dados fictícios (opcional, para tabelas):
```html
<div class="relative">
 <!-- Conteúdo fictício renderizado normalmente -->
 <div class="pointer-events-none select-none">
  ... tabela/cards com dados fake ...
 </div>
</div>
```

---

## Dados Fictícios — Padrão de Geração

Usar números REALISTAS para ArchViz 3D:
- Receitas mensais: R$ 45.000 ~ R$ 120.000
- Despesas mensais: R$ 25.000 ~ R$ 65.000
- Margem líquida: 28% ~ 42%
- Ticket médio: R$ 8.500 ~ R$ 35.000
- Projetos/mês: 4 ~ 12

---

## Módulos Aplicados

| Módulo | Arquivo | Status |
|--------|---------|--------|
| DRE (Financeiro) | `views/admin/finance.hbs` | ✅ Congelado v2.0 |
| Lucratividade (Financeiro) | `views/admin/finance.hbs` | ✅ Congelado v2.0 |

---

## Como Aplicar em Novos Módulos

1. Copie o banner HTML acima para o topo do tab pane
2. Substitua dados dinâmicos (API calls) por dados estáticos fictícios
3. Adicione `opacity-50` + badge `v2.0` no botão da aba
4. No JS, substitua a chamada API por um `return` (dados hardcoded)
5. Adicione o módulo na tabela acima para tracking
