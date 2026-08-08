## Plan: Ajustar responsividade do dashboard admin

TL;DR: Ajustar `views/admin.hbs` e `public/css/admin.css` para eliminar larguras fixas, permitir cards fluidos e deixar o dashboard responsivo em desktop, tablet e mobile.

**Steps**
1. Atualizar o HTML do dashboard em `views/admin.hbs`.
   - Trocar classes de colunas das estatísticas para algo como `col-12 col-sm-6 col-lg-3`.
   - Para os gráficos, usar `col-12 col-lg-8` e `col-12 col-lg-4` ou `row row-cols-1 row-cols-xl-3` para maior fluidez.
   - Garantir que todos os cards usem classes Bootstrap de grid e `mb-4` para espaçamento responsivo.
2. Ajustar `public/css/admin.css` no admin panel.
   - Adicionar base para `.admin-content` com `padding: 1.5rem` e `min-height: calc(100vh - var(--admin-header-height))`.
   - Simplificar `.admin-main` para `flex:1; margin-left: var(--admin-sidebar-width);` e garantir media query com `margin-left:0` em telas menores.
   - Remover regras de altura fixa e usar `min-height:auto` em `.stat-card`, `.chart-card` e `.activity-card`.
   - Tornar `.chart-card canvas` responsivo com `max-width:100%`, `height:auto`, `display:block`.
   - Ajustar `.header-content` e `.header-actions` para `flex-wrap:wrap` e `gap:1rem` em tela pequena.
   - Garantir `body.admin-body` e `.admin-panel` não causem overflow horizontal em mobile.
3. Reforçar breakpoints existentes.
   - Em `@media (max-width: 992px)`: `.admin-main { margin-left:0 !important; }`, `.admin-sidebar { position: fixed; width: var(--admin-sidebar-width); }`, e `.header-content` com padding reduzido.
   - Em `@media (max-width: 768px)`: `.stat-card { padding:1rem; }`, `.header-actions { width:100%; flex-direction:column; }`, `.activity-item { flex-direction:column; text-align:center; }`.
   - Em `@media (max-width: 576px)`: garantir `row` se empilha em `col-12`, `card` ocupa largura total e `sidebar` fica sobreposta ou oculta.
4. Validar no navegador.
   - Testar `http://localhost:3001/admin` em desktop, tablet e mobile.
   - Confirmar que cards não estouram a largura, gráficos se redimensionam e menu sidebar não bloqueia conteúdo.

**Relevant files**
- `views/admin.hbs`
- `public/css/admin.css`

**Verification**
1. Abrir a página admin e checar renderização do dashboard.
2. Reduzir a largura da janela para <992px e <576px e confirmar empilhamento correto.
3. Verificar `canvas` dos gráficos e a sidebar no toggle para telas pequenas.

**Decisions**
- Foco no dashboard responsivo principal e no menu lateral do painel.
- Não alterar backend nem rotas de outras páginas admin.

**Important note**
- Estou em modo de planejamento e não posso aplicar as alterações de código diretamente daqui. Use este plano para executar as edições no repositório ou me chamar em modo de implementação se disponível.
