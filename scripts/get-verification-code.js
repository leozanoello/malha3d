require('dotenv').config();
const { User } = require('../models');

async function findCode() {
  const email = process.argv[2] || 'atelie+usuario1@gmail.com';
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      console.log(`\n==========================================`);
      console.log(`CÓDIGO PARA ${email}: ${user.verificationCode}`);
      console.log(`==========================================\n`);
    } else {
      console.log(`Usuário ${email} não encontrado.`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findCode();
