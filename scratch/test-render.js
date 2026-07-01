const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

async function testRender() {
  const app = express();
  
  const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'login',
    layoutsDir: path.join(__dirname, '../views/layouts'),
    partialsDir: path.join(__dirname, '../views/partials')
  });

  app.engine('.hbs', hbs.engine);
  app.set('view engine', '.hbs');
  app.set('views', path.join(__dirname, '../views'));

  app.render('admin/login', { title: 'Login - Admin' }, (err, html) => {
    if (err) {
      console.error('❌ Erro de Renderização:', err);
      process.exit(1);
    } else {
      console.log('✅ Renderizado com sucesso! Comprimento do HTML:', html.length);
      process.exit(0);
    }
  });
}

testRender();
