/**
 * Testes de integração para rotas de orçamentos
 */

const request = require('supertest');
const app = require('../../server');
const { Budget, User, sequelize } = require('../../models');

describe('Rotas de Orçamentos', () => {
  let adminUser;
  let testBudget;

  beforeAll(async () => {
    // Sincronizar banco de dados antes dos testes
    await sequelize.sync({ force: true });

    // Criar usuário administrador para testes
    adminUser = await User.create({
      name: 'Admin Teste',
      email: 'admin@teste.com',
      password: 'senha123',
      role: 'admin'
    });

    // Criar um orçamento de teste
    testBudget = await Budget.create({
      name: 'Cliente Teste',
      email: 'cliente@teste.com',
      phone: '11999999999',
      projectType: 'Impressão 3D',
      description: 'Peça de teste para automação',
      dimensions: '10x10x5',
      quantity: 1,
      material: 'PLA',
      color: 'Branco',
      quality: 'alta',
      infill: 20,
      deadline: '2024-12-31',
      priority: 'normal',
      estimatedValue: 150.00,
      status: 'novo'
    });
  });

  afterAll(async () => {
    // Limpar dados de teste
    await Budget.destroy({ where: {} });
    await User.destroy({ where: {} });
    await sequelize.close();
  });

  describe('GET /api/budgets', () => {

    test('deve retornar lista de orçamentos', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .expect(200);

      expect(response.body).toHaveProperty('budgets');
      expect(Array.isArray(response.body.budgets)).toBe(true);
      expect(response.body.budgets.length).toBeGreaterThan(0);
    });

    test('deve aceitar parâmetros de paginação', async () => {
      const response = await request(app)
        .get('/api/budgets?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    test('deve filtrar por status', async () => {
      const response = await request(app)
        .get('/api/budgets?status=novo')
        .expect(200);

      expect(response.body.budgets.every(budget => budget.status === 'novo')).toBe(true);
    });

  });

  describe('GET /api/budgets/:id', () => {

    test('deve retornar orçamento específico', async () => {
      const response = await request(app)
        .get(`/api/budgets/${testBudget.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('budget');
      expect(response.body.budget.id).toBe(testBudget.id);
      expect(response.body.budget.name).toBe(testBudget.name);
    });

    test('deve retornar 404 para orçamento inexistente', async () => {
      const response = await request(app)
        .get('/api/budgets/99999999-9999-9999-9999-999999999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

  });

  describe('POST /api/budgets', () => {

    test('deve criar um novo orçamento', async () => {
      const newBudgetData = {
        clientName: 'Novo Cliente',
        clientEmail: 'novo@cliente.com',
        clientPhone: '11988888888',
        projectType: 'Impressão 3D',
        description: 'Descrição do novo projeto'
      };

      const response = await request(app)
        .post('/api/budgets')
        .send(newBudgetData)
        .expect(201);

      expect(response.body).toHaveProperty('budget');
      expect(response.body.budget.name).toBe(newBudgetData.clientName);
      expect(response.body.budget.email).toBe(newBudgetData.clientEmail);
      expect(response.body.budget).toHaveProperty('trackingCode');
    });

    test('deve retornar 400 se faltar campos obrigatórios', async () => {
      const incompleteData = {
        description: 'Sem nome e e-mail'
      };

      const response = await request(app)
        .post('/api/budgets')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

  });

  describe('PUT /api/budgets/:id', () => {

    test('deve atualizar status de um orçamento', async () => {
      const updateData = {
        status: 'respondido'
      };

      const response = await request(app)
        .put(`/api/budgets/${testBudget.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.budget.status).toBe('respondido');
    });

  });

  describe('POST /api/budgets/:id/notes', () => {

    test('deve adicionar uma nota ao orçamento', async () => {
      const noteData = {
        note: 'Nota de teste',
        type: 'observation'
      };

      const response = await request(app)
        .post(`/api/budgets/${testBudget.id}/notes`)
        .send(noteData)
        .expect(201);

      expect(response.body).toHaveProperty('note');
      expect(response.body.note.content).toBe(noteData.note);
      expect(response.body.note.budgetId).toBe(testBudget.id);
    });

  });

  describe('DELETE /api/budgets/:id', () => {

    test('deve excluir um orçamento', async () => {
      const budgetToDelete = await Budget.create({
        name: 'Deletar',
        email: 'deletar@teste.com',
        phone: '11999999999',
        description: 'Deletar este orçamento',
        projectType: 'Outro'
      });

      await request(app)
        .delete(`/api/budgets/${budgetToDelete.id}`)
        .expect(200);

      const found = await Budget.findByPk(budgetToDelete.id);
      expect(found).toBeNull();
    });

  });
});
