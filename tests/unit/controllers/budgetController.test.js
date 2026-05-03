/**
 * Testes unitários para o BudgetController
 */

const { BudgetController } = require('../../../controllers');
const { Budget, User } = require('../../../models');
const { Op } = require('sequelize');

// Mock do modelo Budget
jest.mock('../../../models', () => ({
  Budget: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  }
}));

describe('BudgetController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
      user: { id: 1, role: 'admin' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      render: jest.fn()
    };
    next = jest.fn();

    // Limpar mocks
    jest.clearAllMocks();
  });

  describe('index', () => {

    test('deve retornar lista de orçamentos com paginação', async () => {
      const mockBudgets = [
        {
          id: 1,
          clientName: 'Cliente 1',
          clientEmail: 'cliente1@teste.com',
          status: 'pending',
          createdAt: new Date()
        },
        {
          id: 2,
          clientName: 'Cliente 2',
          clientEmail: 'cliente2@teste.com',
          status: 'approved',
          createdAt: new Date()
        }
      ];

      const mockPagination = {
        count: 2,
        rows: mockBudgets
      };

      Budget.findAndCountAll.mockResolvedValue(mockPagination);

      req.query = { page: 1, limit: 10 };

      await BudgetController.index(req, res);

      expect(Budget.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        budgets: mockBudgets,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
          totalItems: 2
        }
      });
    });

    test('deve aplicar filtros quando fornecidos', async () => {
      const mockBudgets = [
        {
          id: 1,
          clientName: 'Cliente 1',
          status: 'pending'
        }
      ];

      const mockPagination = {
        count: 1,
        rows: mockBudgets
      };

      Budget.findAndCountAll.mockResolvedValue(mockPagination);

      req.query = {
        status: 'pending',
        projectType: 'peça-funcional',
        clientName: 'Cliente'
      };

      await BudgetController.index(req, res);

      expect(Budget.findAndCountAll).toHaveBeenCalledWith({
        where: {
          status: 'pending',
          projectType: 'peça-funcional',
          clientName: { [Op.like]: '%Cliente%' }
        },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
    });

    test('deve tratar erros do banco de dados', async () => {
      const dbError = new Error('Erro de conexão com banco');
      Budget.findAndCountAll.mockRejectedValue(dbError);

      await BudgetController.index(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Erro ao buscar orçamentos',
        details: dbError.message
      });
    });

  });

  describe('show', () => {

    test('deve retornar orçamento específico', async () => {
      const mockBudget = {
        id: 1,
        clientName: 'Cliente Teste',
        clientEmail: 'cliente@teste.com',
        status: 'pending',
        notes: []
      };

      Budget.findByPk.mockResolvedValue(mockBudget);

      req.params.id = 1;

      await BudgetController.show(req, res);

      expect(Budget.findByPk).toHaveBeenCalledWith(1, {
        include: expect.any(Array)
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ budget: mockBudget });
    });

    test('deve retornar 404 quando orçamento não existe', async () => {
      Budget.findByPk.mockResolvedValue(null);

      req.params.id = 999;

      await BudgetController.show(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Orçamento não encontrado'
      });
    });

  });

  describe('store', () => {

    test('deve criar novo orçamento com dados válidos', async () => {
      const budgetData = {
        clientName: 'Novo Cliente',
        clientEmail: 'novo@teste.com',
        clientPhone: '11999999999',
        projectType: 'peça-funcional',
        description: 'Descrição do projeto',
        dimensions: '10x10x5',
        quantity: 1,
        material: 'PLA',
        color: 'Branco',
        quality: 'alta',
        infill: 20,
        deadline: '2024-12-31',
        priority: 'normal'
      };

      const mockCreatedBudget = {
        id: 1,
        ...budgetData,
        status: 'pending',
        trackingCode: 'BUDGET-001',
        createdAt: new Date()
      };

      Budget.create.mockResolvedValue(mockCreatedBudget);

      req.body = budgetData;

      await BudgetController.store(req, res);

      expect(Budget.create).toHaveBeenCalledWith(expect.objectContaining({
        clientName: budgetData.clientName,
        clientEmail: budgetData.clientEmail,
        status: 'pending'
      }));

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ budget: mockCreatedBudget });
    });

    test('não deve criar orçamento com dados inválidos', async () => {
      const invalidData = {
        clientName: '', // Nome vazio
        clientEmail: 'email_invalido', // E-mail inválido
        clientPhone: '' // Telefone vazio
        // Faltando campos obrigatórios
      };

      req.body = invalidData;

      await BudgetController.store(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Dados inválidos',
        details: expect.any(Array)
      });
    });

    test('deve calcular valor estimado quando parâmetros forem fornecidos', async () => {
      const budgetData = {
        clientName: 'Cliente Teste',
        clientEmail: 'cliente@teste.com',
        clientPhone: '11999999999',
        projectType: 'peça-funcional',
        description: 'Peça de teste',
        dimensions: '10x10x5',
        quantity: 2,
        material: 'PLA',
        color: 'Branco',
        quality: 'alta',
        infill: 20,
        deadline: '2024-12-31',
        priority: 'normal'
      };

      const mockCreatedBudget = {
        id: 1,
        ...budgetData,
        estimatedValue: 180.00,
        status: 'pending',
        trackingCode: 'BUDGET-002'
      };

      Budget.create.mockResolvedValue(mockCreatedBudget);

      req.body = budgetData;

      await BudgetController.store(req, res);

      expect(Budget.create).toHaveBeenCalledWith(expect.objectContaining({
        estimatedValue: expect.any(Number)
      }));
    });

  });

  describe('update', () => {

    test('deve atualizar orçamento existente', async () => {
      const existingBudget = {
        id: 1,
        clientName: 'Cliente Original',
        status: 'pending',
        update: jest.fn()
      };

      const updateData = {
        status: 'approved',
        estimatedValue: 200.00,
        notes: 'Orçamento aprovado'
      };

      Budget.findByPk.mockResolvedValue(existingBudget);
      existingBudget.update.mockResolvedValue({
        ...existingBudget,
        ...updateData
      });

      req.params.id = 1;
      req.body = updateData;

      await BudgetController.update(req, res);

      expect(Budget.findByPk).toHaveBeenCalledWith(1);
      expect(existingBudget.update).toHaveBeenCalledWith(updateData);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deve retornar 404 quando orçamento não existe', async () => {
      Budget.findByPk.mockResolvedValue(null);

      req.params.id = 999;
      req.body = { status: 'approved' };

      await BudgetController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Orçamento não encontrado'
      });
    });

    test('não deve permitir atualização de campos protegidos', async () => {
      const existingBudget = {
        id: 1,
        trackingCode: 'BUDGET-001',
        update: jest.fn()
      };

      Budget.findByPk.mockResolvedValue(existingBudget);

      req.params.id = 1;
      req.body = {
        trackingCode: 'CODIGO-MODIFICADO', // Campo protegido
        clientEmail: 'novo@email.com'
      };

      await BudgetController.update(req, res);

      expect(existingBudget.update).toHaveBeenCalledWith({
        clientEmail: 'novo@email.com' // Apenas campo permitido
      });
    });

  });

  describe('destroy', () => {

    test('deve excluir orçamento existente', async () => {
      const existingBudget = {
        id: 1,
        destroy: jest.fn()
      };

      Budget.findByPk.mockResolvedValue(existingBudget);
      existingBudget.destroy.mockResolvedValue(true);

      req.params.id = 1;

      await BudgetController.destroy(req, res);

      expect(Budget.findByPk).toHaveBeenCalledWith(1);
      expect(existingBudget.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Orçamento excluído com sucesso'
      });
    });

    test('deve retornar 404 quando orçamento não existe', async () => {
      Budget.findByPk.mockResolvedValue(null);

      req.params.id = 999;

      await BudgetController.destroy(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Orçamento não encontrado'
      });
    });

  });

  describe('getStats', () => {

    test('deve retornar estatísticas de orçamentos', async () => {
      const mockStats = {
        total: 150,
        byStatus: {
          pending: 50,
          approved: 30,
          rejected: 20,
          completed: 50
        },
        byProjectType: {
          'peça-funcional': 60,
          'protótipo': 40,
          'arte': 30,
          'outro': 20
        },
        monthly: [
          { month: '2024-01', count: 25, totalValue: 5000 },
          { month: '2024-02', count: 30, totalValue: 6200 }
        ]
      };

      // Mock das contagens por status
      Budget.count.mockImplementation(({ where }) => {
        if (where && where.status) {
          return Promise.resolve(mockStats.byStatus[where.status] || 0);
        }
        return Promise.resolve(mockStats.total);
      });

      // Mock da agregação por tipo de projeto
      Budget.findAll.mockResolvedValue([
        { projectType: 'peça-funcional', count: 60 },
        { projectType: 'protótipo', count: 40 },
        { projectType: 'arte', count: 30 },
        { projectType: 'outro', count: 20 }
      ]);

      await BudgetController.getStats(req, res);

      expect(Budget.count).toHaveBeenCalled();
      expect(Budget.findAll).toHaveBeenCalledWith({
        attributes: expect.any(Array),
        group: ['projectType']
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ stats: expect.any(Object) });
    });

    test('deve retornar estatísticas vazias quando não há dados', async () => {
      Budget.count.mockResolvedValue(0);
      Budget.findAll.mockResolvedValue([]);

      await BudgetController.getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        stats: {
          total: 0,
          byStatus: { pending: 0, approved: 0, rejected: 0, completed: 0 },
          byProjectType: {},
          monthly: []
        }
      });
    });

  });

  describe('addNote', () => {

    test('deve adicionar nota ao orçamento', async () => {
      const existingBudget = {
        id: 1,
        notes: [],
        update: jest.fn()
      };

      Budget.findByPk.mockResolvedValue(existingBudget);

      const noteData = {
        note: 'Esta é uma nota de teste',
        type: 'observation'
      };

      req.params.id = 1;
      req.body = noteData;
      req.user = { id: 1, name: 'Admin User' };

      await BudgetController.addNote(req, res);

      expect(Budget.findByPk).toHaveBeenCalledWith(1);
      expect(existingBudget.update).toHaveBeenCalledWith({
        notes: expect.any(Array)
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        note: expect.objectContaining({
          content: noteData.note,
          type: noteData.type,
          author: 'Admin User'
        })
      });
    });

    test('deve retornar 404 quando orçamento não existe', async () => {
      Budget.findByPk.mockResolvedValue(null);

      req.params.id = 999;
      req.body = { note: 'Nota teste' };

      await BudgetController.addNote(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Orçamento não encontrado'
      });
    });

    test('não deve adicionar nota vazia', async () => {
      req.params.id = 1;
      req.body = { note: '' };

      await BudgetController.addNote(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Nota não pode estar vazia'
      });
    });

  });

});
