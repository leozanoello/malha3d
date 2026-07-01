const { Client } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function seedContacts() {
  try {
    const categories = ['Lead', 'Cliente', 'Parceiro'];
    const names = [
      'Ana Clara', 'Bruno Alves', 'Carla Souza', 'Daniel Ferreira', 'Elena Santos',
      'Fabio Lima', 'Gisele Rocha', 'Hugo Mendes', 'Iris Costa', 'Joao Oliveira',
      'Kelly Barros', 'Lucas Pereira', 'Maria Julia', 'Natan Silva', 'Olivia Ramos',
      'Paulo Victor', 'Quenia Luz', 'Rafael Castro', 'Sofia Martins', 'Tiago Nobre',
      'Ursula Vaz', 'Vitor Hugo', 'Wagner Dias', 'Xuxa Meneghel', 'Yago Martins',
      'Zuleide Lima', 'Arnaldo Cezar', 'Bia Haddad', 'Caio Castro', 'Drauzio Varella'
    ];

    const companies = ['Studio Arch', 'Brick & Mortar', 'Visions 3D', 'Skyline Design', 'Urban Planning', 'Nexus ArchViz', 'Creative Loft', 'Zenith 3D', 'Horizon Studios', 'Vertex Design'];

    const contacts = names.map((name, i) => ({
      id: uuidv4(),
      name: name,
      type: Math.random() > 0.5 ? 'PF' : 'PJ',
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      phone: `(11) 9${Math.floor(Math.random() * 90000000 + 10000000)}`,
      company: companies[Math.floor(Math.random() * companies.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      source: 'Auto-Seed',
      notes: `Contato gerado automaticamente para teste de interface. Indice: ${i + 1}`,
      status: 'active'
    }));

    await Client.bulkCreate(contacts);
    console.log('Successfully seeded 30 random contacts!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding contacts:', error);
    process.exit(1);
  }
}

seedContacts();
