#!/bin/bash

# Script de deployment para produção
# Uso: ./deploy.sh [environment]
# Environment pode ser: staging, production (default: staging)

set -e

# Configurações
ENVIRONMENT=${1:-staging}
BACKUP_DIR="/var/backups/zanoello3d"
APP_DIR="/var/www/zanoello3d"
LOG_FILE="/var/log/zanoello3d-deploy.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções de log
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] AVISO: $1${NC}" | tee -a "$LOG_FILE"
}

# Verificações iniciais
check_requirements() {
    log "Verificando requisitos..."
    
    # Verifica se está rodando como root
    if [[ $EUID -ne 0 ]]; then
        error "Este script deve ser executado como root"
        exit 1
    fi
    
    # Verifica dependências
    for cmd in git node npm docker docker-compose; do
        if ! command -v $cmd &> /dev/null; then
            error "Comando necessário não encontrado: $cmd"
            exit 1
        fi
    done
    
    # Verifica espaço em disco
    AVAILABLE_SPACE=$(df / | tail -1 | awk '{print $4}')
    if [[ $AVAILABLE_SPACE -lt 1048576 ]]; then # 1GB em KB
        error "Espaço em disco insuficiente. Mínimo 1GB necessário."
        exit 1
    fi
    
    log "Requisitos verificados com sucesso"
}

# Cria backup do banco de dados
create_backup() {
    log "Criando backup do banco de dados..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup do banco de dados
    mysqldump -u root -p zanoello > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" 2>/dev/null || {
        warn "Não foi possível criar backup do banco de dados"
    }
    
    # Backup dos uploads
    tar -czf "$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz" -C "$APP_DIR" uploads 2>/dev/null || {
        warn "Não foi possível criar backup dos uploads"
    }
    
    # Remove backups antigos (mantém últimos 7 dias)
    find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
    
    log "Backup criado com sucesso"
}

# Atualiza código fonte
update_code() {
    log "Atualizando código fonte..."
    
    cd "$APP_DIR"
    
    # Faz pull do repositório
    git fetch origin
    git reset --hard origin/main
    
    # Limpa arquivos não rastreados
    git clean -fd
    
    log "Código atualizado com sucesso"
}

# Instala dependências
install_dependencies() {
    log "Instalando dependências..."
    
    cd "$APP_DIR"
    
    # Instala dependências NPM
    npm ci --production
    
    # Instala dependências do sistema se necessário
    # npm rebuild
    
    log "Dependências instaladas com sucesso"
}

# Configura ambiente
setup_environment() {
    log "Configurando ambiente..."
    
    cd "$APP_DIR"
    
    # Copia arquivo de ambiente se não existir
    if [[ ! -f .env ]]; then
        cp .env.example .env
        warn "Arquivo .env criado a partir do exemplo. Configure as variáveis necessárias."
    fi
    
    # Atualiza variáveis de ambiente baseado no ambiente
    if [[ "$ENVIRONMENT" == "production" ]]; then
        sed -i 's/NODE_ENV=.*/NODE_ENV=production/' .env
        sed -i 's/PORT=.*/PORT=3000/' .env
    else
        sed -i 's/NODE_ENV=.*/NODE_ENV=staging/' .env
        sed -i 's/PORT=.*/PORT=3001/' .env
    fi
    
    log "Ambiente configurado com sucesso"
}

# Executa migrações e seeders
run_migrations() {
    log "Executando migrações e seeders..."
    
    cd "$APP_DIR"
    
    # Executa migrações
    npm run migrate || {
        error "Falha ao executar migrações"
        exit 1
    }
    
    # Executa seeders (apenas em staging ou primeira vez)
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        npm run seed || {
            warn "Falha ao executar seeders"
        }
    fi
    
    log "Migrações e seeders executados com sucesso"
}

# Build da aplicação
build_app() {
    log "Build da aplicação..."
    
    cd "$APP_DIR"
    
    # Executa build se houver script
    if npm run build 2>/dev/null; then
        log "Build executado com sucesso"
    else
        warn "Não há script de build ou falhou"
    fi
    
    log "Build da aplicação concluído"
}

# Configura permissões
setup_permissions() {
    log "Configurando permissões..."
    
    cd "$APP_DIR"
    
    # Permissões para diretórios
    chmod -R 755 uploads logs backups public/uploads
    
    # Permissões para arquivos
    find . -type f -name "*.js" -exec chmod 644 {} \;
    find . -type f -name "*.json" -exec chmod 644 {} \;
    
    # Permissões especiais
    chmod +x scripts/*.js 2>/dev/null || true
    chmod +x scripts/*.sh 2>/dev/null || true
    
    log "Permissões configuradas com sucesso"
}

# Reinicia serviços
restart_services() {
    log "Reiniciando serviços..."
    
    # Para aplicação Node.js
    if systemctl is-active --quiet zanoello3d; then
        systemctl restart zanoello3d
    else
        systemctl start zanoello3d
    fi
    
    # Reinicia Nginx
    systemctl reload nginx
    
    log "Serviços reiniciados com sucesso"
}

# Verifica saúde da aplicação
health_check() {
    log "Verificando saúde da aplicação..."
    
    # Aguarda aplicação iniciar
    sleep 10
    
    # Verifica se a aplicação está respondendo
    PORT=$(grep "^PORT=" "$APP_DIR/.env" | cut -d'=' -f2)
    PORT=${PORT:-3000}
    
    if curl -f http://localhost:$PORT/health &>/dev/null; then
        log "Aplicação está saudável"
    else
        error "Aplicação não está respondendo na porta $PORT"
        exit 1
    fi
    
    # Verifica logs de erro
    if tail -n 50 "$APP_DIR/logs/error.log" | grep -i error; then
        warn "Foram encontrados erros recentes nos logs"
    fi
    
    log "Verificação de saúde concluída"
}

# Limpa recursos antigos
cleanup() {
    log "Limpando recursos antigos..."
    
    # Limpa logs antigos
    find "$APP_DIR/logs" -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Limpa arquivos temporários
    find /tmp -name "npm-*" -mtime +7 -delete 2>/dev/null || true
    
    # Limpa cache do npm
    npm cache clean --force 2>/dev/null || true
    
    log "Limpeza concluída"
}

# Notifica sobre deployment
notify() {
    local status=$1
    local message=$2
    
    # Adicionar notificações aqui (Slack, Discord, e-mail, etc.)
    log "Notificação: $status - $message"
    
    # Exemplo de notificação por e-mail (descomentar se configurado)
    # echo "$message" | mail -s "Deploy $ENVIRONMENT - $status" admin@zanoello3d.com.br
}

# Função principal
main() {
    local start_time=$(date +%s)
    
    log "Iniciando deployment para $ENVIRONMENT..."
    
    # Executa etapas do deployment
    check_requirements
    create_backup
    update_code
    install_dependencies
    setup_environment
    run_migrations
    build_app
    setup_permissions
    restart_services
    health_check
    cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "Deployment concluído com sucesso!"
    log "Duração: ${duration}s"
    
    notify "SUCESSO" "Deployment para $ENVIRONMENT concluído em ${duration}s"
}

# Tratamento de erros
trap 'error "Deployment falhou na linha $LINENO"' ERR

# Executa deployment
main "$@"