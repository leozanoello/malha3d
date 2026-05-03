# Zanoello 3D - Landing Page Completa

Uma landing page profissional completa para serviços de impressão 3D, com sistema integrado de orçamentos, CRM e painel administrativo.

## 🚀 Funcionalidades

### Landing Page
- ✅ Design moderno e responsivo
- ✅ Hero banner com call-to-action
- ✅ Galeria de projetos com filtros e carrossel
- ✅ Sistema de orçamento integrado
- ✅ Depoimentos de clientes
- ✅ Seção "Sobre Nós" com missão e valores
- ✅ Galeria de vídeos
- ✅ FAQ interativo
- ✅ Formulário de contato
- ✅ Integração com WhatsApp
- ✅ SEO otimizado

### Sistema de Orçamentos
- ✅ Formulário de orçamento detalhado
- ✅ Upload de arquivos (STL, OBJ, etc.)
- ✅ Cálculo automático de valores
- ✅ Notificações por e-mail
- ✅ Status de orçamento
- ✅ Histórico de alterações

### CRM Integrado
- ✅ Gestão completa de orçamentos
- ✅ Sistema de anotações por orçamento
- ✅ Timeline de interações
- ✅ Status personalizáveis
- ✅ Exportação de relatórios
- ✅ Notificações automáticas

### Painel Administrativo
- ✅ Dashboard com estatísticas
- ✅ Gestão de orçamentos
- ✅ Gestão de projetos
- ✅ Gestão de depoimentos
- ✅ Gestão de usuários
- ✅ Sistema de configurações
- ✅ Exportação de dados
- ✅ Sistema de backup

### Sistema de Templates
- ✅ 4 layouts diferentes
- ✅ Customização de cores
- ✅ Sistema de temas
- ✅ Componentes reutilizáveis

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- MySQL (versão 5.7 ou superior)
- NPM ou Yarn

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/zanoello/zanoello-3d-landing-page.git
cd zanoello-3d-landing-page
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
Crie um banco de dados MySQL:
```sql
CREATE DATABASE zanoello_3d CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure as variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure as variáveis:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zanoello_3d
DB_USER=root
DB_PASSWORD=sua_senha

# Session Configuration
SESSION_SECRET=sua_chave_secreta_super_segura

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app

# Application Configuration
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
```

### 5. Execute as migrações
```bash
npm run db:migrate
```

### 6. Popule o banco de dados (opcional)
```bash
npm run db:seed
```

### 7. Inicie o servidor
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
zanoello-3d-landing-page/
├── config/                 # Configurações do banco de dados
├── controllers/           # Lógica de controle
├── middlewares/           # Middlewares customizados
├── migrations/            # Migrações do banco de dados
├── models/                # Modelos do Sequelize
├── public/                # Arquivos estáticos
│   ├── css/              # Estilos CSS
│   ├── js/               # JavaScript
│   └── uploads/          # Arquivos enviados
├── routes/                # Rotas da aplicação
├── seeders/               # Dados iniciais
├── utils/                 # Utilitários
├── views/                 # Templates Handlebars
│   ├── layouts/          # Layouts principais
│   ├── partials/         # Componentes reutilizáveis
│   ├── admin/            # Páginas do painel administrativo
│   └── error/            # Páginas de erro
├── .env                   # Variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
├── index.js              # Arquivo principal do servidor
└── package.json          # Dependências do projeto
```

## 👤 Credenciais de Acesso

Após a instalação, você pode acessar o painel administrativo com:

**URL:** `http://localhost:3000/admin`

**Credenciais padrão (se usar seeds):**
- **E-mail:** admin@zanoello3d.com
- **Senha:** admin123

⚠️ **Importante:** Altere a senha padrão após o primeiro login!

## 🎨 Personalização

### Cores e Temas
Edite as configurações no painel administrativo em `Configurações` para personalizar:
- Cores principais
- Logotipo
- Textos do site
- Informações de contato

### Layouts
O sistema suporta 4 layouts diferentes que podem ser alternados nas configurações:
1. **Moderno** - Layout clean e minimalista
2. **Corporativo** - Layout profissional
3. **Criativo** - Layout com elementos visuais
4. **Técnico** - Layout focado em especificações

### Conteúdo
Todo o conteúdo pode ser gerenciado pelo painel administrativo:
- **Projetos:** Adicione, edite e organize seus trabalhos
- **Depoimentos:** Gerencie avaliações de clientes
- **Páginas:** Crie e edite páginas adicionais
- **Blog:** Sistema de blog integrado (opcional)

## 📧 Configuração de E-mail

### Gmail (Recomendado)
1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma senha de app em: https://myaccount.google.com/apppasswords
3. Configure no arquivo `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=sua_senha_de_app
   ```

### Outros provedores
Consulte a documentação do seu provedor de e-mail para as configurações SMTP.

## 🔒 Segurança

### Medidas implementadas:
- ✅ Helmet.js para headers de segurança
- ✅ Rate limiting para prevenir ataques
- ✅ Validação de entrada de dados
- ✅ Hash de senhas com bcrypt
- ✅ Sessões seguras
- ✅ Proteção contra SQL injection
- ✅ HTTPS ready

### Recomendações adicionais:
- Use HTTPS em produção
- Configure firewall adequadamente
- Mantenha as dependências atualizadas
- Use senhas fortes para o banco de dados
- Configure backups automáticos

## 📊 Performance

### Otimizações implementadas:
- ✅ Compressão Gzip
- ✅ Cache de sessões
- ✅ Lazy loading de imagens
- ✅ Minificação de CSS/JS
- ✅ Paginação de dados
- ✅ Índices de banco de dados

### Recomendações:
- Use CDN para assets estáticos
- Configure cache de banco de dados
- Implemente Redis para cache distribuído
- Monitore performance regularmente

## 🔄 Backup e Restauração

### Backup automático
Configure um cron job para backup automático:
```bash
# Adicione ao crontab
0 2 * * * cd /caminho/do/projeto && npm run backup
```

### Backup manual
```bash
# Backup do banco de dados
npm run backup:db

# Backup completo (DB + uploads)
npm run backup:full
```

### Restauração
```bash
# Restaurar banco de dados
npm run restore:db -- arquivo_backup.sql

# Restaurar backup completo
npm run restore:full -- arquivo_backup.zip
```

## 🐛 Solução de Problemas

### Erro de conexão com banco de dados
1. Verifique se o MySQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Verifique se o banco de dados foi criado
4. Teste a conexão manualmente

### Erro ao enviar e-mails
1. Verifique as configurações SMTP
2. Confirme que o serviço de e-mail está ativado
3. Verifique firewall/antivírus
4. Teste com outro provedor de e-mail

### Erro ao fazer upload de arquivos
1. Verifique permissões da pasta `uploads`
2. Confirme limite de tamanho no servidor
3. Verifique tipos de arquivo permitidos
4. Verifique espaço em disco

### Performance lenta
1. Verifique índices do banco de dados
2. Otimize queries lentas
3. Implemente cache
4. Use CDN para assets

## 📞 Suporte

Para suporte técnico ou dúvidas:

- **E-mail:** suporte@zanoello3d.com
- **WhatsApp:** (11) 99999-9999
- **Documentação:** [docs.zanoello3d.com](https://docs.zanoello3d.com)
- **Issues:** [GitHub Issues](https://github.com/zanoello/zanoello-3d-landing-page/issues)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Bootstrap 5 pela excelente framework CSS
- Chart.js pelos gráficos interativos
- Font Awesome pelos ícones
- AOS pelas animações
- Sequelize pelo ORM
- Express.js pelo framework web

## 📈 Atualizações

Para atualizar o sistema:

1. Faça backup completo
2. Atualize o código:
   ```bash
   git pull origin main
   ```
3. Atualize dependências:
   ```bash
   npm update
   ```
4. Execute migrações:
   ```bash
   npm run db:migrate
   ```
5. Reinicie o servidor

---

**Desenvolvido com ❤️ por Zanoello 3D**