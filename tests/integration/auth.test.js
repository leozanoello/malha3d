/**
 * Testes de integração para rotas de autenticação
 */

const request = require('supertest');
const app = require('../../server');
const { User, sequelize } = require('../../models');

describe('Rotas de Autenticação', () => {
  let testUser;

  beforeAll(async () => {
    // Limpar usuários de teste anteriores
    await User.destroy({ where: { email: 'teste@autenticacao.com' } });
  });

  afterAll(async () => {
    // Limpar dados de teste
    await User.destroy({ where: { email: 'teste@autenticacao.com' } });
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {

    test('deve registrar novo usuário com dados válidos', async () => {
      const newUser = {
        name: 'Usuário Teste',
        email: 'teste@autenticacao.com',
        password: 'senha123',
        phone: '11999999999',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.name).toBe(newUser.name);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('token');

      testUser = response.body.user;
    });

    test('não deve registrar usuário com e-mail duplicado', async () => {
      const duplicateUser = {
        name: 'Outro Usuário',
        email: 'teste@autenticacao.com', // Mesmo e-mail
        password: 'senha456',
        phone: '11888888888'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('não deve registrar usuário com dados inválidos', async () => {
      const invalidUser = {
        name: '', // Nome vazio
        email: 'email_invalido', // E-mail inválido
        password: '123', // Senha muito curta
        phone: 'telefone_invalido'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('não deve registrar usuário sem campos obrigatórios', async () => {
      const incompleteUser = {
        name: 'Usuário Incompleto'
        // Faltando email e password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

  });

  describe('POST /api/auth/login', () => {

    test('deve fazer login com credenciais válidas', async () => {
      const credentials = {
        email: 'teste@autenticacao.com',
        password: 'senha123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(credentials.email);
      expect(response.body).toHaveProperty('token');
    });

    test('não deve fazer login com senha incorreta', async () => {
      const invalidCredentials = {
        email: 'teste@autenticacao.com',
        password: 'senha_incorreta'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('não deve fazer login com e-mail inexistente', async () => {
      const nonExistentUser = {
        email: 'nao_existe@teste.com',
        password: 'qualquer_senha'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(nonExistentUser)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('não deve fazer login sem campos obrigatórios', async () => {
      const incompleteCredentials = {
        email: 'teste@autenticacao.com'
        // Faltando password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteCredentials)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

  });

  describe('POST /api/auth/logout', () => {

    test('deve fazer logout com sucesso', async () => {
      // Primeiro fazer login para obter token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@autenticacao.com',
          password: 'senha123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('deve aceitar logout sem token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

  });

  describe('GET /api/auth/profile', () => {

    test('deve retornar perfil do usuário autenticado', async () => {
      // Fazer login para obter token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@autenticacao.com',
          password: 'senha123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('teste@autenticacao.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('não deve retornar perfil sem autenticação', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('não deve retornar perfil com token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token_invalido')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

  });

  describe('PUT /api/auth/profile', () => {

    test('deve atualizar perfil do usuário autenticado', async () => {
      // Fazer login para obter token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@autenticacao.com',
          password: 'senha123'
        });

      const token = loginResponse.body.token;

      const updatedData = {
        name: 'Nome Atualizado',
        phone: '11777777777'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe(updatedData.name);
      expect(response.body.user.phone).toBe(updatedData.phone);
    });

    test('não deve atualizar e-mail já existente', async () => {
      // Criar outro usuário
      await User.create({
        name: 'Outro Usuário',
        email: 'outro@teste.com',
        password: 'senha123',
        phone: '11666666666'
      });

      // Fazer login com usuário principal
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@autenticacao.com',
          password: 'senha123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'outro@teste.com' }) // Tentar usar e-mail existente
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('não deve atualizar perfil sem autenticação', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ name: 'Nome Tentativa' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

  });

  describe('POST /api/auth/change-password', () => {

    test('deve alterar senha do usuário autenticado', async () => {
      // Fazer login para obter token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@autenticacao.com',
          password: 'senha123'
        });

      const token = loginResponse.body.token;

      const passwordData = {
        currentPassword: 'senha123',
        newPassword: 'novaSenha456'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verificar que a senha foi alterada
      const loginWithNewPassword = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@autenticacao.com',
          password: 'novaSenha456'
        })
        .expect(200);

      expect(loginWithNewPassword.body).toHaveProperty('token');
    });

    test('não deve alterar senha com senha atual incorreta', async () => {
      // Fazer login para obter token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@autenticacao.com',
          password: 'novaSenha456'
        });

      const token = loginResponse.body.token;

      const passwordData = {
        currentPassword: 'senhaErrada',
        newPassword: 'outraSenha789'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('não deve alterar senha sem autenticação', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'senha123',
          newPassword: 'novaSenha456'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

  });

});
