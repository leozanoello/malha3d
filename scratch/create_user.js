const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Caminho absoluto para o .env

const User = require('../models/User');

async function run() {
  try {
    const email = 'atelie@zanoello.com';
    const password = '3dmalha3d';
    
    // Log para depurar se carregou
    if (!process.env.SUPABASE_DB_URL) {
       console.error('❌ ERRO: SUPABASE_DB_URL ainda não foi encontrada no .env');
       return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      await User.create({
        name: 'Ateliê Zanoello',
        email: email,
        password: password,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Usuário criado com sucesso no Supabase!');
    } else {
      user.password = password;
      await user.save();
      console.log('✅ Usuário já existia. Senha atualizada com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    const { sequelize } = require('../config/database');
    await sequelize.close();
  }
}

run();
