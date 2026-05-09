const { FinanceTransaction } = require('../models');

async function seedFinance() {
  try {
    const transactions = [
      {
        type: 'receita',
        description: 'Parcela 01/03 - Projeto Residencial Alpha',
        beneficiary: 'Estúdio Zanoello',
        amount: 2500.00,
        status: 'recebido',
        category: 'Projetos 3D',
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentMethod: 'PIX'
      },
      {
        type: 'despesa',
        description: 'Assinatura Adobe Creative Cloud',
        beneficiary: 'Adobe Systems',
        amount: 224.00,
        status: 'pago',
        category: 'Softwares',
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentMethod: 'Cartão de Crédito'
      },
      {
        type: 'receita',
        description: 'Sinal - Animação Cinematic UE5',
        beneficiary: 'Estúdio Zanoello',
        amount: 5000.00,
        status: 'recebido',
        category: 'Animação',
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentMethod: 'Transferência'
      },
      {
        type: 'despesa',
        description: 'Render Cloud - Job #882',
        beneficiary: 'RebusFarm',
        amount: 450.00,
        status: 'pago',
        category: 'Produção',
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentMethod: 'PayPal'
      },
      {
        type: 'receita',
        description: 'Consultoria de Iluminação',
        beneficiary: 'Estúdio Zanoello',
        amount: 1200.00,
        status: 'pendente',
        category: 'Consultoria',
        dueDate: new Date(Date.now() + 86400000 * 5),
        paymentMethod: 'PIX'
      },
      {
        type: 'despesa',
        description: 'Energia Elétrica - Escritório Central',
        beneficiary: 'Enel',
        amount: 380.00,
        status: 'pendente',
        category: 'Infraestrutura',
        dueDate: new Date(Date.now() + 86400000 * 2),
        paymentMethod: 'Boleto'
      },
      {
        type: 'receita',
        description: 'Projeto Comercial - Mall Recreio',
        beneficiary: 'Estúdio Zanoello',
        amount: 8500.00,
        status: 'pendente',
        category: 'Projetos 3D',
        dueDate: new Date(Date.now() + 86400000 * 10),
        paymentMethod: 'Transferência'
      },
      {
        type: 'despesa',
        description: 'Manutenção de Hardware - GPU 4090',
        beneficiary: 'Tech Service',
        amount: 1500.00,
        status: 'atrasado',
        category: 'Equipamentos',
        dueDate: new Date(Date.now() - 86400000 * 3),
        paymentMethod: 'Cartão de Crédito'
      },
      {
        type: 'receita',
        description: 'Upgrade Plano - Cliente Recurring',
        beneficiary: 'Estúdio Zanoello',
        amount: 890.00,
        status: 'recebido',
        category: 'SaaS',
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentMethod: 'PIX'
      },
      {
        type: 'despesa',
        description: 'Licença Forest Pack - 1 Ano',
        beneficiary: 'Itoo Software',
        amount: 980.00,
        status: 'pago',
        category: 'Softwares',
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentMethod: 'Cartão de Crédito'
      }
    ];

    console.log('Seeding transactions...');
    await FinanceTransaction.bulkCreate(transactions);
    console.log('Successfully seeded 10 transactions.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}

seedFinance();
