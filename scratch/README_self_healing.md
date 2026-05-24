# 🔮 Skill de Auditoria E2E e Auto-Correção (Self-Healing QA Engine)

Esta Skill fornece ao ERP Malha 3D a capacidade de simular navegações reais de usuários e auditar todas as principais páginas da aplicação em segundo plano, identificando falhas de frontend, backend ou renderização para que elas possam ser corrigidas instantaneamente e de forma automatizada pelo Agente de IA.

---

## 🚀 Como Funciona

O ecossistema de auto-correção é composto por três componentes:

1. **`scratch/run_e2e_audit.js`**: Usa **Puppeteer** para abrir um navegador headless, realizar o login seguro (`admin@malha3d.com` / `admin123`), visitar 8 telas cruciais do sistema, ouvir erros de console, exceções de JS no frontend, erros HTTP e palavras-chave de renderização que indicam crash (500, etc.). Ele gera o relatório `scratch/qa_report.json`.
2. **`scratch/self_healing_runner.js`**: É o orquestrador que executa a auditoria, formata a resposta no console com elegância e ativa o workflow de auto-correção.
3. **Agente de IA (Antigravity)**: Intercepta o relatório de falhas do runner, edita cirurgicamente o código fonte para consertar o bug de backend ou frontend, e relança a auditoria.

---

## 🛠️ Como Utilizar a Skill

### Requisitos
* O servidor local deve estar rodando (`npm run dev`).
* A dependência `puppeteer` deve estar instalada.

### Executar a Auditoria Completa
Para rodar a simulação e verificar o estado de saúde do ERP em tempo real, execute o comando:
```bash
node scratch/self_healing_runner.js
```

### Resultados da Auditoria
* Se o sistema estiver **100% Saudável**, você verá um display verde:
  `🎉 EXCELENTE! Todas as funções do site estão funcionando perfeitamente.`
* Se houver qualquer falha (ex: erro 500 ao entrar no menu de Projetos ou um erro de rede AJAX), o runner falhará com status code 1 e listará exatamente a origem do erro.

---

## 🧠 Exemplo de Fluxo de Auto-Correção Automática

Quando um erro é detectado:
1. O relatório `qa_report.json` registra:
   ```json
   {
     "type": "render_content_error",
     "pageName": "Projetos (Kanban)",
     "url": "http://localhost:3000/admin/projetos/kanban",
     "keywordMatched": "Internal Server Error"
   }
   ```
2. O Agente de IA identifica que o arquivo do template ou rota correspondente tem uma falha.
3. O Agente edita o arquivo corrigindo o bug.
4. O Agente roda novamente o comando `node scratch/self_healing_runner.js`.
5. A tela agora carrega com sucesso e o status geral torna-se `🟢 SAUDÁVEL`!
