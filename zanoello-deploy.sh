#!/bin/bash
# Script de Deploy Único - Zanoello 3D
# Este script resolve problemas de PATH e evita conflitos com scripts antigos.

echo "--- Iniciando Deploy ZANOELLO (Scripts Corrigidos) ---"

# 1. Localizar a pasta do projeto (onde está o package.json)
APP_DIR=$(find . -name package.json -not -path "*/node_modules/*" -exec dirname {} \;)

if [ -z "$APP_DIR" ]; then
    echo "ERRO: Não foi possível encontrar a pasta do projeto."
    exit 1
fi

cd "$APP_DIR" || exit
echo "Diretório do App: $(pwd)"

# 2. Atualizar código do Git
echo "Puxando atualizações do Git..."
git pull origin main

# 3. Corrigir PATH para o NPM
echo "Configurando ambiente..."
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/opt/alt/alt-nodejs18/root/usr/bin

# 4. Instalar dependências
echo "Instalando dependências (npm install)..."
npm install --production

# 5. Reiniciar o servidor (método Hostinger/Passenger)
echo "Reiniciando servidor Node.js..."
touch server.js

echo "--- DEPLOY SUCCESSFUL! ---"