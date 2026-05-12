<?php
/**
 * Script de Emergência - Destravamento de Deploy Malha3D
 * Este script roda via PHP para evitar dependências do ambiente Node.js que está quebrado.
 */

header('Content-Type: text/plain');

$token = 'emergency_deploy_zanoello_2024'; // Senha simples para evitar abusos

if (!isset($_GET['token']) || $_GET['token'] !== $token) {
    die("Acesso negado.");
}

echo "Iniciando Destravamento de Emergência...\n";

// Definindo o PATH completo manualmente para garantir que npm e git sejam encontrados
$path = "PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin:/opt/alt/alt-nodejs18/root/usr/bin";

echo "1. Puxando código novo do Git...\n";
$output1 = shell_exec("$path git pull origin main 2>&1");
echo $output1 . "\n";

echo "2. Tentando instalar dependências (npm)...\n";
// Tentamos vários caminhos comuns do npm na Hostinger
$npm_cmd = "npm";
$output2 = shell_exec("$path $npm_cmd install --production 2>&1");
echo $output2 . "\n";

echo "3. Forçando reinício do Node (tocando no server.js)...\n";
shell_exec("touch server.js");

echo "\nProcesso finalizado. Tente acessar o painel admin agora.\n";
?>
