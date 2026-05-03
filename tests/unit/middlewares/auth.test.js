/**
 * Testes unitários para middlewares de autenticação
 */

const authMiddleware = require('../../../middleware/auth');
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');

// Mock do modelo User
jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn()
  }
}));

// Mock do jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Limpar mocks
    jest.clearAllMocks();

    // Resetar variáveis de ambiente
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticate', () => {

    test('deve autenticar usuário com token válido', async () => {
      const mockUser = {
        id: 1,
        email: 'teste@teste.com',
        role: 'admin'
      };

      const mockDecoded = { userId: 1 };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(mockUser);

      await authMiddleware.authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando não há token', async () => {
      await authMiddleware.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token não fornecido'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando token é inválido', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await authMiddleware.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando usuário não é encontrado', async () => {
      const mockDecoded = { userId: 999 };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(null);

      await authMiddleware.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuário não encontrado'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando usuário está inativo', async () => {
      const mockUser = {
        id: 1,
        email: 'teste@teste.com',
        role: 'client',
        status: 'inactive'
      };

      const mockDecoded = { userId: 1 };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(mockUser);

      await authMiddleware.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuário inativo'
      });
      expect(next).not.toHaveBeenCalled();
    });

  });

  describe('requireAuth', () => {

    test('deve permitir acesso quando usuário está autenticado', async () => {
      req.user = {
        id: 1,
        email: 'teste@teste.com',
        role: 'admin'
      };

      await authMiddleware.requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      req.user = null;

      await authMiddleware.requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Autenticação necessária'
      });
      expect(next).not.toHaveBeenCalled();
    });

  });

  describe('requireRole', () => {

    test('deve permitir acesso quando usuário tem role necessária', async () => {
      req.user = {
        id: 1,
        email: 'admin@teste.com',
        role: 'admin'
      };

      const requireAdmin = authMiddleware.requireRole('admin');
      await requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve permitir acesso quando usuário tem uma das roles necessárias', async () => {
      req.user = {
        id: 1,
        email: 'admin@teste.com',
        role: 'admin'
      };

      const requireAdminOrManager = authMiddleware.requireRole(['admin', 'manager']);
      await requireAdminOrManager(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve retornar 403 quando usuário não tem role necessária', async () => {
      req.user = {
        id: 1,
        email: 'cliente@teste.com',
        role: 'client'
      };

      const requireAdmin = authMiddleware.requireRole('admin');
      await requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acesso negado. Permissão insuficiente.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 403 quando usuário não tem nenhuma das roles necessárias', async () => {
      req.user = {
        id: 1,
        email: 'cliente@teste.com',
        role: 'client'
      };

      const requireAdminOrManager = authMiddleware.requireRole(['admin', 'manager']);
      await requireAdminOrManager(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acesso negado. Permissão insuficiente.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      req.user = null;

      const requireAdmin = authMiddleware.requireRole('admin');
      await requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Autenticação necessária'
      });
      expect(next).not.toHaveBeenCalled();
    });

  });

  describe('optionalAuth', () => {

    test('deve autenticar usuário quando token é fornecido', async () => {
      const mockUser = {
        id: 1,
        email: 'teste@teste.com',
        role: 'admin'
      };

      const mockDecoded = { userId: 1 };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(mockUser);

      await authMiddleware.optionalAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('deve continuar sem autenticação quando não há token', async () => {
      await authMiddleware.optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve continuar sem autenticação quando token é inválido', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await authMiddleware.optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

  });

  describe('rateLimit', () => {

    test('deve permitir requisição quando dentro do limite', async () => {
      // Mock do Redis ou outro armazenamento de rate limit
      const mockRateLimitStore = new Map();
      const rateLimitMiddleware = authMiddleware.rateLimit({
        windowMs: 60000, // 1 minuto
        max: 5, // 5 requisições
        store: mockRateLimitStore
      });

      req.ip = '127.0.0.1';

      await rateLimitMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve bloquear requisição quando limite é excedido', async () => {
      // Mock do Redis ou outro armazenamento de rate limit
      const mockRateLimitStore = new Map();
      mockRateLimitStore.set('127.0.0.1', {
        count: 10,
        resetTime: Date.now() + 60000
      });

      const rateLimitMiddleware = authMiddleware.rateLimit({
        windowMs: 60000,
        max: 5,
        store: mockRateLimitStore
      });

      req.ip = '127.0.0.1';

      await rateLimitMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Muitas requisições, tente novamente mais tarde'
      });
      expect(next).not.toHaveBeenCalled();
    });

  });

});
