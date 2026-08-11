# PADRÃO MALHA 3D — Constituição do Sistema

> **Este documento é a "Constituição" do sistema Malha3D.**
> Todas as decisões de design, produto, tecnologia e regras de negócio devem ser consultadas aqui ANTES de implementar qualquer funcionalidade nova.
> Última atualização: Agosto 2026.

---

## 1. REGRA DE BANNERS (Geração por IA)

### Obrigatoriedade
Sempre que o sistema exigir um banner (em qualquer card, menu, header ou modal), ele DEVE ser gerado por Inteligência Artificial.

### Tema
- **Estritamente:** Arquitetura e Design de Interiores
- **Preferência:** Estéticas minimalistas, projetos contemporâneos, iluminação natural
- **Proibido:** Pessoas reconhecíveis, textos sobrepostos, logos de terceiros

### Unicidade
Cada card deve ter um banner ÚNICO. Não repetir imagens entre cards na mesma página.

### Performance
| Regra | Especificação |
|-------|---------------|
| Formato | WebP (preferencial) ou AVIF |
| Peso máximo | 50KB por banner (compressão agressiva) |
| Dimensões | Exatas do container (não usar imagem 4K para container de 300px) |
| Carregamento | `loading="lazy"` obrigatório |
| Placeholder | SVG inline 1-byte (cor #111) até carregar |
| Fallback | Imagem local de `/assets/` se IA falhar |

### Banco Local de Banners
O sistema mantém 10 imagens ArchViz pré-geradas em `/public/assets/` como fallback offline. São selecionadas deterministicamente por hash do ID do card.

---

## 2. CATÁLOGO DE PRODUTOS PADRÃO

O sistema prevê o trabalho com as seguintes entregas de ArchViz:

| # | Produto | Descrição | Formato de Saída |
|---|---------|-----------|------------------|
| 1 | **Imagem** | Render fotorrealista estático | JPG/PNG/TIFF |
| 2 | **Vídeo** | Animação walkthrough ou flythrough | MP4 (4K/1080p) |
| 3 | **Imagem 360** | Panorama esférico interativo | Equirectangular JPG |
| 4 | **Vídeo Interativo** | Tour virtual navegável pelo cliente | Web/HTML5 |
| 5 | **Planta Humanizada** | Planta baixa com mobiliário e texturas | PNG/PDF vetorial |
| 6 | **Vídeo por IA** | Animação gerada/assistida por IA generativa | MP4/GIF |

### Campos obrigatórios por produto:
- Quantidade de unidades
- Resolução (px ou formato)
- Prazo de produção (dias)
- Valor unitário

---

## 3. STACK DE SOFTWARES OFICIAIS

### Modelagem 3D
| Software | Uso Principal | Prioridade |
|----------|--------------|------------|
| **Revit** | Projetos arquitetônicos BIM | Alta |
| **3ds Max** | Modelagem avançada e cenografia | Alta |
| **SketchUp** | Conceituação rápida e volumes | Média |
| **Blender** | Modelagem orgânica e esculturas | Média |
| **ZBrush** | Detalhamento de superfícies | Baixa |

### Renderização e Visualização
| Software | Uso Principal | Prioridade |
|----------|--------------|------------|
| **D5 Render** | Ferramenta PRINCIPAL de visualização em tempo real | 🔥 Máxima |
| **Corona Renderer** | Fotorrealismo máximo (interior) | Alta |
| **V-Ray** | Versatilidade e compatibilidade | Alta |
| **Twinmotion** | Apresentações rápidas para clientes | Média |

### Pós-Produção
| Software | Uso |
|----------|-----|
| After Effects | Composição e motion graphics |
| Photoshop | Retoque e finalização |
| Premiere Pro | Edição de vídeo |

---

## 4. PADRÃO VISUAL (Design System)

### Referência
Arquivo: `TEMPLATE_PADRAO.md` — contém tokens CSS, estrutura HTML, tipografia e componentes.

### Resumo dos Tokens
| Token | Modo Escuro | Modo Claro |
|-------|-------------|------------|
| Background card | `#151515` | `#ffffff` |
| Border radius | `5px` | `5px` |
| Box shadow | `0 2px 8px rgba(0,0,0,0.6)` | `0 1px 4px rgba(15,23,42,0.08)` |
| Border | `1px solid rgba(255,255,255,0.06)` | `1px solid rgba(15,23,42,0.08)` |
| Fonte títulos | 900 (font-black), uppercase | idem |
| Cor primária | `#f97316` (laranja) | `#ea580c` |

### Classe principal
Todos os cards usam `.kcard` (definida globalmente em `admin.hbs`).

---

## 5. ESTRUTURA DE MENUS DO SISTEMA

### Etapa 1 (Ativa — Funcional)
| Menu | Rota | Status |
|------|------|--------|
| Dashboard | `/admin/` | ✅ Ativo |
| CRM | `/admin/crm` | ✅ Ativo |
| Projetos | `/admin/projetos` | ✅ Ativo |
| Financeiro | `/admin/financeiro` | ✅ Ativo |
| Previsão | `/admin/previsao` | ✅ Ativo |
| Relatórios | `/admin/relatorios` | ✅ Ativo |
| Contatos | `/admin/contatos` | ✅ Ativo |
| Chat da Equipe | `/admin/chat` | ✅ Ativo |
| Freelancers | `/admin/freelancers` | ✅ Ativo |
| Agenda | `/admin/agenda` | ✅ Ativo |
| Tabelas | `/admin/tabelas` | ✅ Ativo |
| Configurações | `/admin/configuracoes` | ✅ Ativo |

### Etapa 2 (Fantasma — UI sem lógica)
| Menu | Rota | Status |
|------|------|--------|
| Aprendizado | `/admin/aprendizado` | 🔒 Em Breve |
| Meus Planos | `/admin/meus-planos` | 🔒 Em Breve |
| Marketing IA | `/admin/marketing-ia` | 🔒 Em Breve |
| Marketplace | `/admin/marketplace` | 🔒 Em Breve |
| Automações | `/admin/automacoes` | 🔒 Em Breve |
| Rastreio Ativo | `/admin/rastreio-ativo` | 🔒 Em Breve |
| Admin Avançado | `/admin/avancado` | 🔒 Em Breve |

---

## 6. REGRAS DE NEGÓCIO FINANCEIRAS

### Contas a Receber
- Descrição = APENAS o nome do projeto (nunca tipo de produto)
- Valor Parcela = `totalAmount / installmentsCount`
- Status: aberto → parcial → quitado

### Contas a Pagar
- Descrição = nome do fornecedor ou despesa
- Classificação: Fixo (recorrente) ou Variável (por projeto)
- Centros de Custo: Produção | Comercial | Administrativo | Marketing | TI

### DRE
```
Receita Bruta (AR pagas)
- Custos Variáveis (AP variáveis pagos)
= Lucro Operacional
- Despesas Fixas (AP fixos pagos)
= Lucro Líquido
Margem = Lucro / Receita × 100%
```

---

## 7. REGRAS TÉCNICAS

### Performance
- Lazy loading em TODAS as imagens (`loading="lazy"` + IntersectionObserver)
- Drag-and-drop: HTML5 nativo (sem SortableJS CDN)
- CSS: `contain: layout style paint` em cards repetidos
- Zero `backdrop-blur` em elementos repetidos (kanban)

### Segurança
- Transações ACID (BEGIN/COMMIT/ROLLBACK) em operações financeiras
- Validação de input no backend (nunca confiar no frontend)
- Senha de admin para campos sensíveis (código: 0235)

### Código
- Seguir `padroes-de-conexao.md` para toda interação front↔back
- Seguir `modo-claro-escuro.md` para todo novo componente
- Seguir `card-oficial.md` para novos cards visuais
- Nunca `glass-card`, nunca `rounded-2xl`, nunca `backdrop-blur` em cards

---

## 8. PORTAL DO CLIENTE

O "Portal do Cliente" é uma funcionalidade de Etapa 2 que será acessada:
- Dentro de cada card de Projeto (link direto por token)
- Dentro de cada card de CRM (link para proposta)
- NÃO terá menu dedicado no sidebar (será acessado via cards)

---

## 9. DOCUMENTOS DE REFERÊNCIA

| Arquivo | Propósito |
|---------|-----------|
| `TEMPLATE_PADRAO.md` | Design System (CSS tokens, HTML, tipografia) |
| `PADRAO_MALHA3D.md` | Este arquivo (regras de negócio e produto) |
| `card-oficial.md` | Template do card flip Uiverse |
| `modo-claro-escuro.md` | Regras de tema claro/escuro |
| `padroes-de-conexao.md` | Regras anti "botão morto" (front↔back) |
| `receitas.md` | Mapa de entradas financeiras |
| `despesas.md` | Mapa de saídas financeiras |
| `centrodecustos.md` | Estrutura de centros de custo |
