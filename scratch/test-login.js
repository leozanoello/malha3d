const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    const user = await User.findOne({ where: { email: 'admin@malha3d.com' } });
    if (!user) {
      console.log('❌ Usuário admin@malha3d.com não encontrado.');
    } else {
      const match = await bcrypt.compare('admin123', user.password);
      console.log('✅ Usuário encontrado:', user.email);
      console.log('🔑 Senha hash no banco:', user.password);
      console.log('❓ Comparação com "admin123":', match ? 'CORRETA (Match)' : 'INCORRETA (Erro)');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

test();
