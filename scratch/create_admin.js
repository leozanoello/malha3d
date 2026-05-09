require('dotenv').config();
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const plainPassword = 'admin123';
    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@malha3d.com' },
      defaults: {
        name: 'Admin Global',
        password: plainPassword,
        role: 'admin',
        isActive: true
      }
    });
    
    if (!created) {
      await user.update({ password: plainPassword, role: 'admin' });
      console.log('✅ Usuário admin@malha3d.com atualizado!');
    } else {
      console.log('✅ Usuário admin@malha3d.com criado!');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
