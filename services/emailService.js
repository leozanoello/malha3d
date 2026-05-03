const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this._transporter = null;
  }

  get transporter() {
    if (!this._transporter) {
      this._transporter = this.createTransporter();
    }
    return this._transporter;
  }

  set transporter(value) {
    this._transporter = value;
  }

  getTransporter() {
    this._transporter = this.createTransporter();
    return this._transporter;
  }

  createTransporter() {
    const host = process.env.EMAIL_HOST || 'localhost';
    const user = process.env.EMAIL_USER || '';
    const pass = process.env.EMAIL_PASS || '';

    return nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: user,
        pass: pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail(data) {
    const { to, subject, html, text } = data;
    
    if (!to) {
      throw new Error('Destinatário é obrigatório');
    }

    try {
      const fromName = process.env.EMAIL_FROM_NAME || 'Zanoello 3D';
      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@zanoello3d.com.br';

      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        text: text || html.replace(/<[^>]*>?/gm, ''),
        html
      });

      return {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ Erro ao enviar email:', error);
      }
      throw error;
    }
  }

  async sendBudgetConfirmation(budget) {
    const name = budget.name || budget.clientName;
    const email = budget.email || budget.clientEmail;
    
    return this.sendEmail({
      to: email,
      subject: 'Confirmação de Orçamento - Zanoello 3D',
      html: `<p>Olá ${name}!</p><p>Seu código: ${budget.trackingCode}</p>`,
      text: `Olá ${name}! Seu código: ${budget.trackingCode}`
    });
  }

  async sendBudgetUpdate(budget) {
    const name = budget.name || budget.clientName;
    const email = budget.email || budget.clientEmail;
    const statusTraduzido = budget.status === 'approved' ? 'aprovado' : budget.status === 'rejected' ? 'rejeitado' : budget.status;
    
    return this.sendEmail({
      to: email,
      subject: 'Atualização do seu Orçamento - Zanoello 3D',
      html: `<p>Olá ${name}!</p><p>Status: ${statusTraduzido}</p>${budget.rejectionReason || ''}`,
      text: `Olá ${name}! Status: ${statusTraduzido}`
    });
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Bem-vindo à Zanoello 3D!',
      html: `<p>Bem-vindo ${user.name}!</p><p>Zanoello 3D - impressão 3D</p>`,
      text: `Bem-vindo ${user.name}!`
    });
  }

  async sendPasswordReset(user) {
    const token = user.resetToken || 'TOKEN_MISSING';
    return this.sendEmail({
      to: user.email,
      subject: 'Redefinição de Senha - Zanoello 3D',
      html: `<p>Token: ${token}</p><p><a href="/reset-password">Link</a></p>`,
      text: `Token: ${token}`
    });
  }

  async sendAdminNotification(adminEmail, notification) {
    return this.sendEmail({
      to: adminEmail,
      subject: notification.title,
      html: `<div>${notification.message}</div>`,
      text: notification.message
    });
  }

  async sendBulkEmail(recipients, data) {
    const results = [];
    for (const recipient of recipients) {
      try {
        const email = typeof recipient === 'string' ? recipient : recipient.email;
        const res = await this.sendEmail({
          to: email,
          subject: data.subject,
          html: data.html,
          text: data.text
        });
        results.push(res);
      } catch (error) {
        results.push({ email: typeof recipient === 'string' ? recipient : recipient.email, success: false, error: error.message });
      }
    }
    return results;
  }

  async sendBudgetNotification(budget) {
    return this.sendAdminNotification(process.env.EMAIL_CONTACT, {
      title: `Novo Orçamento Solicitado - ${budget.name}`,
      message: `Novo orçamento de ${budget.name} (${budget.email})`
    });
  }
}

module.exports = new EmailService();
