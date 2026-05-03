#!/bin/bash

# =============================================================================
# ZANOELLO 3D - SCRIPT DE INICIALIZAÇÃO
# Este script auxilia na configuração inicial do projeto
# =============================================================================

set -e

echo "🚀 Iniciando configuração do Zanoello 3D Landing Page..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js encontrado: $NODE_VERSION"
    else
        log_error "Node.js não encontrado. Por favor, instale o Node.js versão 16 ou superior."
        exit 1
    fi
}

# Verificar se npm está instalado
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "NPM encontrado: $NPM_VERSION"
    else
        log_error "NPM não encontrado. Por favor, instale o NPM."
        exit 1
    fi
}

# Verificar se MySQL está instalado
check_mysql() {
    if command -v mysql &> /dev/null; then
        MYSQL_VERSION=$(mysql --version)
        log_success "MySQL encontrado: $MYSQL_VERSION"
    else
        log_warning "MySQL não encontrado. Certifique-se de ter um servidor MySQL disponível."
    fi
}

# Instalar dependências
install_dependencies() {
    log_info "Instalando dependências..."
    npm install
    log_success "Dependências instaladas com sucesso!"
}

# Criar arquivo .env
create_env_file() {
    if [ ! -f .env ]; then
        log_info "Criando arquivo .env..."
        cp .env.example .env
        log_success "Arquivo .env criado! Por favor, configure as variáveis de ambiente."
        log_warning "Edite o arquivo .env com suas configurações antes de continuar."
    else
        log_warning "Arquivo .env já existe. Pulando esta etapa."
    fi
}

# Criar diretórios necessários
create_directories() {
    log_info "Criando diretórios necessários..."
    mkdir -p uploads/{projects,testimonials,budgets,temp}
    mkdir -p logs
    mkdir -p backups
    mkdir -p public/uploads/{projects,testimonials}
    log_success "Diretórios criados com sucesso!"
}

# Configurar permissões
set_permissions() {
    log_info "Configurando permissões..."
    chmod -R 755 uploads/
    chmod -R 755 logs/
    chmod -R 755 backups/
    chmod -R 755 public/uploads/
    log_success "Permissões configuradas!"
}

# Testar conexão com banco de dados
test_database() {
    log_info "Testando conexão com banco de dados..."
    
    # Verificar se o arquivo .env existe
    if [ ! -f .env ]; then
        log_warning "Arquivo .env não encontrado. Teste de banco de dados será pulado."
        return
    fi
    
    # Carregar variáveis do .env
    source .env
    
    # Testar conexão
    if command -v mysql &> /dev/null; then
        if mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD -e "USE $DB_NAME;" &> /dev/null; then
            log_success "Conexão com banco de dados bem-sucedida!"
        else
            log_warning "Não foi possível conectar ao banco de dados. Verifique as configurações no arquivo .env"
            log_info "Você pode criar o banco de dados manualmente com:"
            echo "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        fi
    else
        log_warning "MySQL client não encontrado. Teste de conexão pulado."
    fi
}

# Executar migrações
run_migrations() {
    log_info "Executando migrações do banco de dados..."
    npm run db:migrate || log_warning "Migrações falharam. Verifique as configurações do banco de dados."
}

# Popular banco de dados com dados iniciais
run_seeders() {
    read -p "Deseja popular o banco de dados com dados de exemplo? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        log_info "Populando banco de dados com dados de exemplo..."
        npm run db:seed || log_warning "Seeders falharam."
    fi
}

# Criar usuário administrativo
create_admin_user() {
    read -p "Deseja criar um usuário administrador? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        log_info "Criando usuário administrador..."
        node scripts/create-admin.js || log_warning "Criação de usuário administrador falhou."
    fi
}

# Verificar porta disponível
check_port() {
    source .env
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
        log_warning "Porta $PORT já está em uso."
        read -p "Deseja usar uma porta diferente? (s/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            read -p "Digite a nova porta: " NEW_PORT
            sed -i "s/PORT=$PORT/PORT=$NEW_PORT/g" .env
            log_success "Porta alterada para $NEW_PORT"
        fi
    fi
}

# Menu principal
show_menu() {
    echo
    echo "=================================================="
    echo "🎯 ZANOELLO 3D - MENU DE CONFIGURAÇÃO"
    echo "=================================================="
    echo "1. Configuração completa (recomendado)"
    echo "2. Apenas instalar dependências"
    echo "3. Apenas configurar banco de dados"
    echo "4. Apenas criar estrutura de pastas"
    echo "5. Verificar requisitos"
    echo "6. Sair"
    echo "=================================================="
}

# Configuração completa
full_setup() {
    log_info "Iniciando configuração completa..."
    
    check_node
    check_npm
    check_mysql
    install_dependencies
    create_env_file
    create_directories
    set_permissions
    check_port
    
    log_info "Configuração básica concluída!"
    log_warning "Por favor, configure o arquivo .env antes de continuar."
    
    read -p "Deseja continuar com a configuração do banco de dados? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        test_database
        run_migrations
        run_seeders
        create_admin_user
    fi
    
    log_success "Configuração completa finalizada!"
}

# Loop principal
main() {
    while true; do
        show_menu
        read -p "Escolha uma opção (1-6): " choice
        
        case $choice in
            1)
                full_setup
                break
                ;;
            2)
                check_node
                check_npm
                install_dependencies
                ;;
            3)
                test_database
                run_migrations
                ;;
            4)
                create_directories
                set_permissions
                ;;
            5)
                check_node
                check_npm
                check_mysql
                ;;
            6)
                log_info "Saindo..."
                exit 0
                ;;
            *)
                log_error "Opção inválida!"
                ;;
        esac
    done
}

# Mensagem final
show_final_message() {
    echo
    echo "=================================================="
    echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
    echo "=================================================="
    echo
    echo "Próximos passos:"
    echo "1. Configure o arquivo .env com suas informações"
    echo "2. Configure o banco de dados MySQL"
    echo "3. Execute: npm start"
    echo
    echo "Acesse: http://localhost:3000"
    echo "Painel Admin: http://localhost:3000/admin"
    echo
    echo "Para suporte: suporte@zanoello3d.com"
    echo "=================================================="
}

# Executar script
main
show_final_message