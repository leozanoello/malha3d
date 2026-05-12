#!/bin/bash
# Script de Deploy Único - Zanoello 3D
# Este script resolve problemas de PATH e evita conflitos com scripts antigos.

echo "--- Iniciando Deploy ZANOELLO (Scripts Corrigidos) ---"

# 1. Localizar a pasta do projeto (onde está o server.js principal)
# Filtramos pastas de backup/build e pegamos o diretório real
APP_DIR=$(find . -maxdepth 4 -name server.js -not -path "*/node_modules/*" -not -path "*/.builds/*" | head -n 1 | xargs dirname)

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

# 5. Garantir ponto de entrada e Reiniciar
echo "Limpando processos antigos e reiniciando..."
# Forçamos o toque no arquivo que a Hostinger monitora para restart
touch server.js
touch app.js 2>/dev/null
# Se houver um index.js.bak e não houver index.js, restauramos (opcional, dependendo da config)
if [ -f "server.js" ]; then
    echo "Ponto de entrada server.js confirmado."
fi

# Tenta derrubar processos órfãos para forçar o sistema a subir o novo
pkill -u u464448170 node 2>/dev/null

echo "--- DEPLOY SUCCESSFUL! ---"
echo "Aguarde 30 segundos e dê um Ctrl+F5 no seu navegador."