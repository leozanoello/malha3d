/**
 * Testes para o modelo de Usuário
 */

const { User } = require('../../../models');
const bcrypt = require('bcryptjs');

describe('Modelo de Usuário', () => {

  beforeEach(async () => {
    // Limpar tabela de usuários antes de cada teste
    await User.destroy({ where: {} });
  });

  describe('Criação de usuário', () => {

    test('deve criar um usuário com dados válidos', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123',
        role: 'user',
        status: 'active'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.status).toBe(userData.status);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('deve hashear a senha antes de salvar', async () => {
      const plainPassword = 'minhaSenha123';
      const user = await User.create({
        name: 'Maria Souza',
        email: 'maria@example.com',
        password: plainPassword
      });

      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toMatch(/^\$2[aby]\$/); // Formato bcrypt
    });

    test('não deve criar usuário sem e-mail', async () => {
      await expect(User.create({
        name: 'Usuário Sem Email',
        password: 'senha123'
      })).rejects.toThrow();
    });

    test('não deve criar usuário sem nome', async () => {
      await expect(User.create({
        email: 'semnome@example.com',
        password: 'senha123'
      })).rejects.toThrow();
    });

    test('não deve criar usuário com e-mail duplicado', async () => {
      const email = 'duplicado@example.com';

      await User.create({
        name: 'Usuário 1',
        email: email,
        password: 'senha123'
      });

      await expect(User.create({
        name: 'Usuário 2',
        email: email,
        password: 'outraSenha123'
      })).rejects.toThrow();
    });

  });

  describe('Validação de e-mail', () => {

    test('deve aceitar e-mail válido', async () => {
      const user = await User.create({
        name: 'Email Válido',
        email: 'valido@example.com',
        password: 'senha123'
      });

      expect(user.email).toBe('valido@example.com');
    });

    test('não deve aceitar e-mail inválido', async () => {
      await expect(User.create({
        name: 'Email Inválido',
        email: 'email_invalido',
        password: 'senha123'
      })).rejects.toThrow();
    });

  });

  describe('Métodos de instância', () => {

    test('deve verificar senha corretamente', async () => {
      const plainPassword = 'senhaCorreta123';
      const user = await User.create({
        name: 'Teste Senha',
        email: 'senha@example.com',
        password: plainPassword
      });

      const isValid = await bcrypt.compare(plainPassword, user.password);
      expect(isValid).toBe(true);
    });

    test('deve rejeitar senha incorreta', async () => {
      const user = await User.create({
        name: 'Teste Senha Errada',
        email: 'senhaerrada@example.com',
        password: 'senhaCorreta123'
      });

      const isValid = await bcrypt.compare('senhaIncorreta', user.password);
      expect(isValid).toBe(false);
    });

  });

  describe('Valores padrão', () => {

    test('deve definir role padrão como "user"', async () => {
      const user = await User.create({
        name: 'Role Padrão',
        email: 'role@example.com',
        password: 'senha123'
      });

      expect(user.role).toBe('user');
    });

    test('deve definir status padrão como "active"', async () => {
      const user = await User.create({
        name: 'Status Padrão',
        email: 'status@example.com',
        password: 'senha123'
      });

      expect(user.status).toBe('active');
    });

    test('deve definir lastAccess como data atual', async () => {
      const beforeCreation = new Date();
      const user = await User.create({
        name: 'Last Access',
        email: 'lastaccess@example.com',
        password: 'senha123'
      });
      const afterCreation = new Date();

      expect(+new Date(user.lastAccess)).toBeGreaterThanOrEqual(+beforeCreation);
      expect(+new Date(user.lastAccess)).toBeLessThanOrEqual(+afterCreation);
    });

  });

  describe('Roles e permissões', () => {

    test('deve aceitar role "admin"', async () => {
      const user = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'senha123',
        role: 'admin'
      });

      expect(user.role).toBe('admin');
    });

    test('não deve aceitar role inválido', async () => {
      await expect(User.create({
        name: 'Role Inválido',
        email: 'invalidrole@example.com',
        password: 'senha123',
        role: 'superuser' // Role não permitido
      })).rejects.toThrow();
    });

  });

  describe('Status de usuário', () => {

    test('deve aceitar status "inactive"', async () => {
      const user = await User.create({
        name: 'Inactive User',
        email: 'inactive@example.com',
        password: 'senha123',
        status: 'inactive'
      });

      expect(user.status).toBe('inactive');
    });

    test('não deve aceitar status inválido', async () => {
      await expect(User.create({
        name: 'Status Inválido',
        email: 'invalidstatus@example.com',
        password: 'senha123',
        status: 'deleted' // Status não permitido
      })).rejects.toThrow();
    });

  });

});
