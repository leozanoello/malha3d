/**
 * Testes unitários para serviços de e-mail
 */

// Mock do nodemailer deve vir antes do require do serviço se possível, 
// mas como o Jest faz o hoisting, o importante é limpar o cache do require.
jest.mock('nodemailer');

const nodemailer = require('nodemailer');

describe('EmailService', () => {
  let emailService;
  let mockTransporter;

  beforeEach(() => {
    // Limpar cache do require para garantir um novo singleton ou classe limpa
    jest.resetModules();
    const nodemailerMock = require('nodemailer');
    emailService = require('../../../services/emailService');
    // Criar mock do transporter
    mockTransporter = {
      sendMail: jest.fn()
    };

    // Configurar mock do createTransport
    nodemailerMock.createTransport.mockReturnValue(mockTransporter);

    // Limpar mocks
    jest.clearAllMocks();

    // Configurar variáveis de ambiente para testes
    process.env.EMAIL_HOST = 'smtp.teste.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'teste@teste.com';
    process.env.EMAIL_PASS = 'senha-teste';
    process.env.EMAIL_FROM = 'noreply@teste.com';
  });

  describe('sendEmail', () => {

    test('deve enviar e-mail com sucesso', async () => {
      const emailData = {
        to: 'destinatario@teste.com',
        subject: 'Assunto do E-mail',
        html: '<h1>Conteúdo HTML</h1>',
        text: 'Conteúdo em texto'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: '123456789',
        accepted: ['destinatario@teste.com']
      });

      const result = await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@teste.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });

      expect(result).toEqual({
        success: true,
        messageId: '123456789',
        accepted: ['destinatario@teste.com']
      });
    });

    test('deve enviar e-mail com configurações padrão quando não fornecidas', async () => {
      const emailData = {
        to: 'destinatario@teste.com',
        subject: 'Assunto do E-mail',
        html: '<h1>Conteúdo HTML</h1>'
        // text não fornecido
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: '123456789',
        accepted: ['destinatario@teste.com']
      });

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@teste.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: expect.any(String) // Deve ser gerado a partir do HTML
      });
    });

    test('deve lançar erro quando falha ao enviar e-mail', async () => {
      const emailData = {
        to: 'destinatario@teste.com',
        subject: 'Assunto do E-mail',
        html: '<h1>Conteúdo HTML</h1>'
      };

      const sendError = new Error('Erro de conexão SMTP');
      mockTransporter.sendMail.mockRejectedValue(sendError);

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('Erro de conexão SMTP');
    });

    test('não deve enviar e-mail sem destinatário', async () => {
      const invalidEmailData = {
        subject: 'Assunto do E-mail',
        html: '<h1>Conteúdo HTML</h1>'
        // to não fornecido
      };

      await expect(emailService.sendEmail(invalidEmailData)).rejects.toThrow('Destinatário é obrigatório');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

  });

  describe('sendBudgetConfirmation', () => {

    test('deve enviar e-mail de confirmação de orçamento', async () => {
      const budgetData = {
        clientName: 'João Silva',
        clientEmail: 'joao@teste.com',
        projectType: 'peça-funcional',
        description: 'Peça para automação industrial',
        estimatedValue: 150.00,
        trackingCode: 'BUDGET-001'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'conf-123456',
        accepted: ['joao@teste.com']
      });

      const result = await emailService.sendBudgetConfirmation(budgetData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@teste.com',
        to: budgetData.clientEmail,
        subject: 'Confirmação de Orçamento - Malha 3D',
        html: expect.stringContaining(budgetData.clientName),
        text: expect.stringContaining(budgetData.clientName)
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('conf-123456');
    });

    test('deve incluir código de rastreamento no e-mail de confirmação', async () => {
      const budgetData = {
        clientName: 'Maria Santos',
        clientEmail: 'maria@teste.com',
        projectType: 'protótipo',
        description: 'Protótipo de produto',
        estimatedValue: 200.00,
        trackingCode: 'BUDGET-002'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'conf-789012',
        accepted: ['maria@teste.com']
      });

      await emailService.sendBudgetConfirmation(budgetData);

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.html).toContain(budgetData.trackingCode);
      expect(sendMailCall.text).toContain(budgetData.trackingCode);
    });

  });

  describe('sendBudgetUpdate', () => {

    test('deve enviar e-mail de atualização de orçamento', async () => {
      const budgetData = {
        clientName: 'Pedro Oliveira',
        clientEmail: 'pedro@teste.com',
        projectType: 'arte',
        description: 'Escultura decorativa',
        status: 'approved',
        estimatedValue: 300.00,
        trackingCode: 'BUDGET-003'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'update-123456',
        accepted: ['pedro@teste.com']
      });

      const result = await emailService.sendBudgetUpdate(budgetData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@teste.com',
        to: budgetData.clientEmail,
        subject: 'Atualização do seu Orçamento - Malha 3D',
        html: expect.stringContaining('aprovado'),
        text: expect.stringContaining('aprovado')
      });

      expect(result.success).toBe(true);
    });

    test('deve incluir novo status no e-mail de atualização', async () => {
      const budgetData = {
        clientName: 'Ana Costa',
        clientEmail: 'ana@teste.com',
        projectType: 'peça-funcional',
        description: 'Peça mecânica',
        status: 'rejected',
        estimatedValue: 180.00,
        trackingCode: 'BUDGET-004',
        rejectionReason: 'Fora do escopo de serviço'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'update-789012',
        accepted: ['ana@teste.com']
      });

      await emailService.sendBudgetUpdate(budgetData);

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.html).toContain('rejeitado');
      expect(sendMailCall.html).toContain(budgetData.rejectionReason);
    });

  });

  describe('sendWelcomeEmail', () => {

    test('deve enviar e-mail de boas-vindas', async () => {
      const userData = {
        name: 'Carlos Eduardo',
        email: 'carlos@teste.com'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'welcome-123456',
        accepted: ['carlos@teste.com']
      });

      const result = await emailService.sendWelcomeEmail(userData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@teste.com',
        to: userData.email,
        subject: 'Bem-vindo à Malha 3D!',
        html: expect.stringContaining(userData.name),
        text: expect.stringContaining(userData.name)
      });

      expect(result.success).toBe(true);
    });

    test('deve incluir informações da empresa no e-mail de boas-vindas', async () => {
      const userData = {
        name: 'Lucia Ferreira',
        email: 'lucia@teste.com'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'welcome-789012',
        accepted: ['lucia@teste.com']
      });

      await emailService.sendWelcomeEmail(userData);

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.html).toContain('Malha 3D');
      expect(sendMailCall.html).toContain('archviz');
    });

  });

  describe('sendPasswordReset', () => {

    test('deve enviar e-mail de redefinição de senha', async () => {
      const userData = {
        name: 'Roberto Lima',
        email: 'roberto@teste.com',
        resetToken: 'reset-token-123'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'reset-123456',
        accepted: ['roberto@teste.com']
      });

      const result = await emailService.sendPasswordReset(userData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@teste.com',
        to: userData.email,
        subject: 'Redefinição de Senha - Malha 3D',
        html: expect.stringContaining(userData.resetToken),
        text: expect.stringContaining(userData.resetToken)
      });

      expect(result.success).toBe(true);
    });

    test('deve incluir link de redefinição no e-mail', async () => {
      const userData = {
        name: 'Sandra Mendes',
        email: 'sandra@teste.com',
        resetToken: 'reset-token-456'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'reset-789012',
        accepted: ['sandra@teste.com']
      });

      await emailService.sendPasswordReset(userData);

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.html).toContain('/reset-password');
      expect(sendMailCall.html).toContain(userData.resetToken);
    });

  });

  describe('sendAdminNotification', () => {

    test('deve enviar notificação para administradores', async () => {
      const notificationData = {
        type: 'new_budget',
        title: 'Novo Orçamento Solicitado',
        message: 'Um novo orçamento foi solicitado por João Silva',
        budgetId: 123
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'admin-123456',
        accepted: ['admin@teste.com']
      });

      const result = await emailService.sendAdminNotification(
        'admin@teste.com',
        notificationData
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'admin@teste.com',
        subject: notificationData.title,
        html: expect.stringContaining(notificationData.message)
      }));

      expect(result.success).toBe(true);
    });

    test('deve formatar corretamente diferentes tipos de notificações', async () => {
      const notificationData = {
        type: 'budget_approved',
        title: 'Orçamento Aprovado',
        message: 'O orçamento #BUDGET-001 foi aprovado',
        budgetId: 456
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'admin-789012',
        accepted: ['admin@teste.com']
      });

      await emailService.sendAdminNotification(
        'admin@teste.com',
        notificationData
      );

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.subject).toBe('Orçamento Aprovado');
      expect(sendMailCall.html).toContain('aprovado');
    });

  });

  describe('sendBulkEmail', () => {

    test('deve enviar e-mail em lote para múltiplos destinatários', async () => {
      const recipients = [
        'cliente1@teste.com',
        'cliente2@teste.com',
        'cliente3@teste.com'
      ];

      const emailData = {
        subject: 'Promoção Especial - Malha 3D',
        html: '<h1>Promoção Especial!</h1><p>Aproveite nossos descontos...</p>',
        text: 'Promoção Especial! Aproveite nossos descontos...'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'bulk-123456',
        accepted: recipients
      });

      const results = await emailService.sendBulkEmail(recipients, emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
    });

    test('deve tratar erros individuais no envio em lote', async () => {
      const recipients = [
        'cliente1@teste.com',
        'cliente2@teste.com'
      ];

      const emailData = {
        subject: 'Newsletter',
        html: '<h1>Newsletter</h1>',
        text: 'Newsletter'
      };

      // Primeiro envio bem-sucedido, segundo falha
      mockTransporter.sendMail
        .mockResolvedValueOnce({
          messageId: 'bulk-123',
          accepted: ['cliente1@teste.com']
        })
        .mockRejectedValueOnce(new Error('E-mail inválido'));

      const results = await emailService.sendBulkEmail(recipients, emailData);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('E-mail inválido');
    });

  });

  describe('getTransporter', () => {

    test('deve criar transporter com configurações corretas', () => {
      const nodemailerMock = require('nodemailer');
      const transporter = emailService.getTransporter();

      expect(nodemailerMock.createTransport).toHaveBeenCalledWith({
        host: 'smtp.teste.com',
        port: 587,
        secure: false,
        auth: {
          user: 'teste@teste.com',
          pass: 'senha-teste'
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    });

    test('deve usar configurações padrão quando variáveis não estão definidas', () => {
      const nodemailerMock = require('nodemailer');
      // Limpar variáveis de ambiente
      delete process.env.EMAIL_HOST;
      delete process.env.EMAIL_PORT;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;

      const transporter = emailService.getTransporter();

      expect(nodemailerMock.createTransport).toHaveBeenCalledWith({
        host: 'localhost',
        port: 587,
        secure: false,
        auth: {
          user: '',
          pass: ''
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    });

  });

});
