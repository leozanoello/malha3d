#!/usr/bin/env node

/**
 * Script para criar usuário administrador
 * Execute: node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// Carregar variáveis de ambiente
require('dotenv').config();

// Configuração do banco de dados
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false
  }
);

// Modelo de Usuário simplificado para o script
const User = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  role: {
    type: Sequelize.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  status: {
    type: Sequelize.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  avatar: {
    type: Sequelize.STRING,
    allowNull: true
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  lastAccess: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'users',
  timestamps: true
});

async function createAdminUser() {
  try {
    console.log('🚀 Criando usuário administrador...');

    // Sincronizar banco de dados
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida.');

    // Sincronizar modelo
    await User.sync();
    console.log('✅ Tabela de usuários sincronizada.');

    // Coletar informações do administrador
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise(resolve => rl.question(query, resolve));

    console.log('\n👤 Configuração do Usuário Administrador');
    console.log('==========================================');

    const name = await question('Nome completo (padrão: Administrador): ') || 'Administrador';
    const email = await question('E-mail (padrão: admin@zanoello3d.com): ') || 'admin@zanoello3d.com';
    const phone = await question('Telefone (opcional): ');

    let password;
    let passwordConfirm;

    do {
      password = await question('Senha (mínimo 6 caracteres): ');
      if (password.length < 6) {
        console.log('❌ A senha deve ter pelo menos 6 caracteres.');
        continue;
      }

      passwordConfirm = await question('Confirme a senha: ');

      if (password !== passwordConfirm) {
        console.log('❌ As senhas não coincidem. Tente novamente.');
      }
    } while (password !== passwordConfirm || password.length < 6);

    rl.close();

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(`⚠️  Usuário com e-mail ${email} já existe.`);

      const updateResponse = await question('Deseja atualizar a senha deste usuário? (s/n): ');
      if (updateResponse.toLowerCase() === 's') {
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
        await existingUser.update({
          password: hashedPassword,
          role: 'admin',
          status: 'active',
          name: name,
          phone: phone || null
        });

        console.log('✅ Usuário atualizado com sucesso!');
        console.log(`📧 E-mail: ${email}`);
        console.log(`🔑 Função: Administrador`);
        console.log(`📞 Telefone: ${phone || 'Não informado'}`);
      }
    } else {
      // Criar novo usuário
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

      const adminUser = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        phone: phone || null,
        avatar: null
      });

      console.log('\n🎉 Usuário administrador criado com sucesso!');
      console.log('==========================================');
      console.log(`👤 Nome: ${adminUser.name}`);
      console.log(`📧 E-mail: ${adminUser.email}`);
      console.log(`🔑 Função: ${adminUser.role}`);
      console.log(`📞 Telefone: ${adminUser.phone || 'Não informado'}`);
      console.log(`📅 Criado em: ${adminUser.createdAt}`);
    }

    console.log('\n🔐 Você pode agora fazer login no painel administrativo:');
    console.log(`   URL: ${process.env.APP_URL || 'http://localhost:3000'}/admin`);
    console.log(`   E-mail: ${email}`);
    console.log('   Senha: [sua senha]');

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n✅ Conexão com banco de dados encerrada.');
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };
