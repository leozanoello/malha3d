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
      const fromName = process.env.EMAIL_FROM_NAME || 'Malha 3D';
      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@malha3d.com.br';

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
      subject: 'Confirmação de Orçamento - Malha 3D',
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
      subject: 'Atualização do seu Orçamento - Malha 3D',
      html: `<p>Olá ${name}!</p><p>Status: ${statusTraduzido}</p>${budget.rejectionReason || ''}`,
      text: `Olá ${name}! Status: ${statusTraduzido}`
    });
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Bem-vindo à Malha 3D!',
      html: `<p>Bem-vindo ${user.name}!</p><p>Malha 3D - archviz</p>`,
      text: `Bem-vindo ${user.name}!`
    });
  }

  async sendPasswordReset(user) {
    const token = user.resetToken || 'TOKEN_MISSING';
    const name = user.name || user.firstName || 'Cliente';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/admin/reset-password?token=${token}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha - Malha 3D</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; width: 100% !important;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030712; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Card Central -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #0b0f19; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Linha superior brilhante -->
          <tr>
            <td height="4" style="background: linear-gradient(to right, #f97316, #fb923c); background-color: #f97316; line-height: 4px; font-size: 1px;">&nbsp;</td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 36px;">
              <!-- Logo / Branding -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                          <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; text-align: center; line-height: 44px;">
                            <span style="font-size: 20px; color: #ffffff; font-weight: bold;">3D</span>
                          </div>
                        </td>
                        <td style="vertical-align: middle; text-align: left;">
                          <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase;">Malha<span style="color: #f97316;">3D</span></span>
                          <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #64748b; margin-top: -2px; font-weight: bold;">archviz</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Mensagem Principal -->
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 16px 0; text-align: center; letter-spacing: -0.3px;">Esqueceu sua senha?</h1>
              
              <p style="color: #94a3b8; font-size: 14px; line-height: 22px; margin: 0 0 24px 0; text-align: center;">
                Olá, <strong>${name}</strong>!<br>
                Recebemos um pedido de redefinição de senha para sua conta na plataforma Malha 3D.
              </p>

              <!-- Botão de Ação -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${resetLink}" target="_blank" style="background-color: #f97316; color: #ffffff; display: inline-block; font-size: 14px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 220px; border-radius: 12px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Caixa de Segurança com Link Copiável -->
              <div style="background-color: rgba(255, 255, 255, 0.02); border-radius: 12px; padding: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Link de Redefinição:</p>
                <p style="margin: 0; font-size: 12px; color: #f97316; word-break: break-all; font-family: monospace; line-height: 16px;">${resetLink}</p>
              </div>

              <!-- Rodapé do Card -->
              <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 30px 0 20px 0;">
              <p style="color: #64748b; font-size: 11px; line-height: 16px; margin: 0; text-align: center;">
                Este link expira em <strong>1 hora</strong> por motivos de segurança.<br>
                Se você não solicitou esta redefinição, apenas ignore este e-mail. Sua senha atual continuará segura.
              </p>
            </td>
          </tr>
        </table>

        <!-- Assinatura/Copyright Externo -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; margin-top: 24px;">
          <tr>
            <td align="center" style="color: #64748b; font-size: 11px; line-height: 16px;">
              <p style="margin: 0 0 6px 0;">&copy; 2026 Malha 3D. Todos os direitos reservados.</p>
              <p style="margin: 0;">Plataforma Integrada de Produção e Entrega de Renders 3D.</p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Redefinição de Senha - Malha 3D',
      html,
      text: `Olá, ${name}! Para redefinir sua senha, acesse: ${resetLink}`
    });
  }

  async sendVerificationCode(user, code) {
    return this.sendEmail({
      to: user.email,
      subject: 'Código de Verificação - Malha 3D',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a;">
          <h2 style="color: #f97316;">Olá, ${user.name}!</h2>
          <p>Obrigado por criar sua identidade digital na Malha 3D.</p>
          <p>Para ativar sua conta, utilize o código de verificação abaixo:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p>Se você não solicitou este cadastro, pode ignorar este e-mail.</p>
        </div>
      `,
      text: `Olá, ${user.name}! Seu código de verificação é: ${code}`
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

  async sendProjectNotification(budget) {
    return this.sendAdminNotification(process.env.EMAIL_CONTACT, {
      title: `🚀 Novo Orçamento Solicitado - ${budget.name}`,
      message: `Novo orçamento de ${budget.name} (${budget.email})`
    });
  }

  // --- ARCHVIZ CREATIVE AUTOMATIONS ---

  async sendProjectProductionStart(project, clientEmail, clientName) {
    return this.sendEmail({
      to: clientEmail,
      subject: `✨ A magia começou: ${project.title} está em produção!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a;">
          <h2 style="color: #10b981;">Olá, ${clientName}!</h2>
          <p>Sua visão está ganhando forma. Acabamos de dar o "Play" na produção do projeto <strong>${project.title}</strong>.</p>
          <p>Nossa equipe de artistas 3D já está trabalhando na iluminação, texturização e composição para garantir que cada detalhe seja impecável.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Fique atento ao seu dashboard para atualizações em tempo real.</p>
        </div>
      `
    });
  }

  async sendProjectReviewReady(project, clientEmail, clientName) {
    return this.sendEmail({
      to: clientEmail,
      subject: `📸 Renders prontos para sua apreciação: ${project.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a;">
          <h2 style="color: #6366f1;">As luzes estão acesas!</h2>
          <p>Olá, ${clientName}. Temos novidades empolgantes.</p>
          <p>A primeira versão dos renders para o projeto <strong>${project.title}</strong> está disponível para sua revisão.</p>
          <p>Acesse o portal do cliente para validar os ângulos e a atmosfera que criamos.</p>
          <a href="${process.env.APP_URL}/meus-projetos" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">Revisar Agora</a>
        </div>
      `
    });
  }

  async sendProjectFinished(project, clientEmail, clientName) {
    return this.sendEmail({
      to: clientEmail,
      subject: `🏁 Entrega Finalizada: ${project.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a;">
          <h2 style="color: #f59e0b;">Projeto Concluído!</h2>
          <p>Olá, ${clientName}. É hora de impressionar o mundo.</p>
          <p>O projeto <strong>${project.title}</strong> foi finalizado com sucesso e todos os arquivos em alta resolução estão prontos para download.</p>
          <p>Foi um prazer transformar essa ideia em realidade com você.</p>
          <p>Até o próximo render!</p>
        </div>
      `
    });
  }
}

module.exports = new EmailService();
