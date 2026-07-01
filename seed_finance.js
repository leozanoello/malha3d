const { FinanceTransaction } = require('./models');

async function seedFinance() {
  const transactions = [
    {
      description: 'Venda de Projeto Residencial - Apt 402',
      amount: 15000.00,
      type: 'income',
      category: 'Projetos',
      status: 'paid',
      date: new Date()
    },
    {
      description: 'Assinatura Software Renderização (Octane)',
      amount: 1200.00,
      type: 'expense',
      category: 'Software',
      status: 'paid',
      date: new Date()
    },
    {
      description: 'Freelancer Modelagem Orgânica - Personagem X',
      amount: 3500.00,
      type: 'expense',
      category: 'Terceirização',
      status: 'pending',
      date: new Date()
    },
    {
      description: 'Consultoria Design de Interiores - Escritório J',
      amount: 8000.00,
      type: 'income',
      category: 'Consultoria',
      status: 'paid',
      date: new Date()
    },
    {
      description: 'Upgrade de Hardware - RTX 4090',
      amount: 12500.00,
      type: 'expense',
      category: 'Equipamento',
      status: 'paid',
      date: new Date()
    },
    {
      description: 'Curso Avançado Unreal Engine 5',
      amount: 450.00,
      type: 'expense',
      category: 'Educação',
      status: 'paid',
      date: new Date()
    },
    {
      description: 'Projeto Animação Curta Metragem - Publicidade',
      amount: 25000.00,
      type: 'income',
      category: 'Projetos',
      status: 'pending',
      date: new Date()
    },
    {
      description: 'Hospedagem Site e Portfólio 2024',
      amount: 89.90,
      type: 'expense',
      category: 'Marketing',
      status: 'paid',
      date: new Date()
    },
    {
      description: 'Pagamento Internet Fibra Óptica',
      amount: 199.90,
      type: 'expense',
      category: 'Infraestrutura',
      status: 'paid',
      date: new Date()
    },
    {
      description: 'Venda de Assets 3D - Marketplace',
      amount: 2300.00,
      type: 'income',
      category: 'Assets',
      status: 'paid',
      date: new Date()
    }
  ];

  try {
    for (const t of transactions) {
      await FinanceTransaction.create(t);
    }
    console.log('10 Finance transactions seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding finance:', err);
    process.exit(1);
  }
}

seedFinance();
