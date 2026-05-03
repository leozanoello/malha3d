# =============================================================================
# ZANOELLO 3D - SCRIPT DE INICIALIZAÇÃO (WINDOWS)
# Este script auxilia na configuração inicial do projeto no Windows
# =============================================================================

# Configurar para parar em erros
$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando configuração do Zanoello 3D Landing Page..." -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# Funções auxiliares
function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar se Node.js está instalado
function Check-Node {
    try {
        $nodeVersion = node --version
        Write-Success "Node.js encontrado: $nodeVersion"
        return $true
    } catch {
        Write-Error "Node.js não encontrado. Por favor, instale o Node.js versão 16 ou superior."
        return $false
    }
}

# Verificar se npm está instalado
function Check-Npm {
    try {
        $npmVersion = npm --version
        Write-Success "NPM encontrado: $npmVersion"
        return $true
    } catch {
        Write-Error "NPM não encontrado. Por favor, instale o NPM."
        return $false
    }
}

# Verificar se MySQL está instalado
function Check-MySQL {
    try {
        $mysqlVersion = mysql --version
        Write-Success "MySQL encontrado: $mysqlVersion"
        return $true
    } catch {
        Write-Warning "MySQL não encontrado. Certifique-se de ter um servidor MySQL disponível."
        return $false
    }
}

# Instalar dependências
function Install-Dependencies {
    Write-Info "Instalando dependências..."
    npm install
    Write-Success "Dependências instaladas com sucesso!"
}

# Criar arquivo .env
function Create-EnvFile {
    if (-not (Test-Path .env)) {
        Write-Info "Criando arquivo .env..."
        Copy-Item .env.example .env
        Write-Success "Arquivo .env criado! Por favor, configure as variáveis de ambiente."
        Write-Warning "Edite o arquivo .env com suas configurações antes de continuar."
    } else {
        Write-Warning "Arquivo .env já existe. Pulando esta etapa."
    }
}

# Criar diretórios necessários
function Create-Directories {
    Write-Info "Criando diretórios necessários..."
    
    $directories = @(
        "uploads/projects",
        "uploads/testimonials", 
        "uploads/budgets",
        "uploads/temp",
        "logs",
        "backups",
        "public/uploads/projects",
        "public/uploads/testimonials"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-Success "Diretórios criados com sucesso!"
}

# Configurar permissões (Windows - equivalente)
function Set-Permissions {
    Write-Info "Configurando permissões..."
    
    # Em Windows, vamos garantir que os diretórios tenham permissões adequadas
    $directories = @("uploads", "logs", "backups", "public/uploads")
    
    foreach ($dir in $directories) {
        if (Test-Path $dir) {
            # Garantir permissões de escrita
            $acl = Get-Acl $dir
            $permission = "BUILTIN\Users","FullControl","ContainerInherit,ObjectInherit","None","Allow"
            $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
            $acl.SetAccessRule($accessRule)
            Set-Acl $dir $acl
        }
    }
    
    Write-Success "Permissões configuradas!"
}

# Testar conexão com banco de dados
function Test-Database {
    Write-Info "Testando conexão com banco de dados..."
    
    if (-not (Test-Path .env)) {
        Write-Warning "Arquivo .env não encontrado. Teste de banco de dados será pulado."
        return
    }
    
    # Carregar variáveis do .env (simplificado)
    $envContent = Get-Content .env
    $dbHost = ($envContent | Where-Object { $_ -match "^DB_HOST=" }) -replace "DB_HOST=", ""
    $dbUser = ($envContent | Where-Object { $_ -match "^DB_USER=" }) -replace "DB_USER=", ""
    $dbPass = ($envContent | Where-Object { $_ -match "^DB_PASSWORD=" }) -replace "DB_PASSWORD=", ""
    $dbName = ($envContent | Where-Object { $_ -match "^DB_NAME=" }) -replace "DB_NAME=", ""
    
    if (Check-MySQL) {
        try {
            $connectionString = "Server=$dbHost;Uid=$dbUser;Pwd=$dbPass;Database=$dbName;"
            Write-Success "Conexão com banco de dados configurada!"
        } catch {
            Write-Warning "Não foi possível conectar ao banco de dados. Verifique as configurações no arquivo .env"
            Write-Info "Você pode criar o banco de dados manualmente com:"
            Write-Host "CREATE DATABASE $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        }
    } else {
        Write-Warning "MySQL client não encontrado. Teste de conexão pulado."
    }
}

# Executar migrações
function Run-Migrations {
    Write-Info "Executando migrações do banco de dados..."
    try {
        npm run db:migrate
        Write-Success "Migrações executadas com sucesso!"
    } catch {
        Write-Warning "Migrações falharam. Verifique as configurações do banco de dados."
    }
}

# Popular banco de dados com dados iniciais
function Run-Seeders {
    $response = Read-Host "Deseja popular o banco de dados com dados de exemplo? (s/n)"
    
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Info "Populando banco de dados com dados de exemplo..."
        try {
            npm run db:seed
            Write-Success "Dados de exemplo inseridos com sucesso!"
        } catch {
            Write-Warning "Seeders falharam."
        }
    }
}

# Criar usuário administrativo
function Create-AdminUser {
    $response = Read-Host "Deseja criar um usuário administrador? (s/n)"
    
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Info "Criando usuário administrador..."
        try {
            node scripts/create-admin.js
            Write-Success "Usuário administrador criado com sucesso!"
        } catch {
            Write-Warning "Criação de usuário administrador falhou."
        }
    }
}

# Verificar porta disponível
function Check-Port {
    # Carregar porta do .env
    if (Test-Path .env) {
        $envContent = Get-Content .env
        $port = ($envContent | Where-Object { $_ -match "^PORT=" }) -replace "PORT=", ""
        
        if (-not $port) { $port = 3000 }
        
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
            $listener.Start()
            $listener.Stop()
            Write-Success "Porta $port está disponível!"
        } catch {
            Write-Warning "Porta $port já está em uso."
            $newPort = Read-Host "Digite uma nova porta (pressione Enter para manter $port)"
            
            if ($newPort) {
                (Get-Content .env) -replace "PORT=$port", "PORT=$newPort" | Set-Content .env
                Write-Success "Porta alterada para $newPort"
            }
        }
    }
}

# Menu principal
function Show-Menu {
    Write-Host "`n==================================================" -ForegroundColor Blue
    Write-Host "🎯 ZANOELLO 3D - MENU DE CONFIGURAÇÃO" -ForegroundColor Blue
    Write-Host "==================================================" -ForegroundColor Blue
    Write-Host "1. Configuração completa (recomendado)" -ForegroundColor White
    Write-Host "2. Apenas instalar dependências" -ForegroundColor White
    Write-Host "3. Apenas configurar banco de dados" -ForegroundColor White
    Write-Host "4. Apenas criar estrutura de pastas" -ForegroundColor White
    Write-Host "5. Verificar requisitos" -ForegroundColor White
    Write-Host "6. Sair" -ForegroundColor White
    Write-Host "==================================================" -ForegroundColor Blue
}

# Configuração completa
function Full-Setup {
    Write-Info "Iniciando configuração completa..."
    
    $nodeOk = Check-Node
    $npmOk = Check-Npm
    
    if (-not $nodeOk -or -not $npmOk) {
        Write-Error "Requisitos não atendidos. Abortando."
        return
    }
    
    Check-MySQL
    Install-Dependencies
    Create-EnvFile
    Create-Directories
    Set-Permissions
    Check-Port
    
    Write-Success "Configuração básica concluída!"
    Write-Warning "Por favor, configure o arquivo .env antes de continuar."
    
    $response = Read-Host "Deseja continuar com a configuração do banco de dados? (s/n)"
    
    if ($response -eq 's' -or $response -eq 'S') {
        Test-Database
        Run-Migrations
        Run-Seeders
        Create-AdminUser
    }
    
    Write-Success "Configuração completa finalizada!"
}

# Mensagem final
function Show-FinalMessage {
    Write-Host "`n==================================================" -ForegroundColor Green
    Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "`nPróximos passos:" -ForegroundColor White
    Write-Host "1. Configure o arquivo .env com suas informações" -ForegroundColor White
    Write-Host "2. Configure o banco de dados MySQL" -ForegroundColor White
    Write-Host "3. Execute: npm start" -ForegroundColor White
    Write-Host "`nAcesse: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Painel Admin: http://localhost:3000/admin" -ForegroundColor Cyan
    Write-Host "`nPara suporte: suporte@zanoello3d.com" -ForegroundColor White
    Write-Host "==================================================" -ForegroundColor Green
}

# Loop principal
function Main {
    while ($true) {
        Show-Menu
        $choice = Read-Host "Escolha uma opção (1-6)"
        
        switch ($choice) {
            "1" {
                Full-Setup
                break
            }
            "2" {
                Check-Node
                Check-Npm
                Install-Dependencies
            }
            "3" {
                Test-Database
                Run-Migrations
            }
            "4" {
                Create-Directories
                Set-Permissions
            }
            "5" {
                Check-Node
                Check-Npm
                Check-MySQL
            }
            "6" {
                Write-Info "Saindo..."
                exit 0
            }
            default {
                Write-Error "Opção inválida!"
            }
        }
    }
}

# Executar script
Main
Show-FinalMessage