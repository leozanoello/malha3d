require('dotenv').config();
const { NotificationTemplate } = require('../models');

async function seedNotifications() {
  const templates = [
    {
      name: 'Novo Lead Cadastrado',
      subject: '🚀 Novo Lead no CRM: {{leadName}}',
      body: 'Olá! Um novo lead acaba de ser cadastrado no sistema. Nome: {{leadName}}. Origem: {{source}}.',
      triggerEvent: 'crm_new_lead',
      type: 'email'
    },
    {
      name: 'Proposta Visualizada',
      subject: '👀 Proposta Visualizada: {{proposalTitle}}',
      body: 'O cliente {{clientName}} acabou de visualizar a proposta "{{proposalTitle}}". Fique atento para o follow-up!',
      triggerEvent: 'proposal_viewed',
      type: 'email'
    },
    {
      name: 'Orçamento Aprovado',
      subject: '✅ Orçamento Aprovado! - {{proposalTitle}}',
      body: 'Parabéns! O orçamento "{{proposalTitle}}" foi aprovado pelo cliente {{clientName}}. O projeto já pode ser iniciado.',
      triggerEvent: 'proposal_approved',
      type: 'email'
    },
    {
      name: 'Nova Solicitação de Revisão',
      subject: '🎨 Nova Revisão Solicitada: {{projectName}}',
      body: 'O cliente enviou uma nova solicitação de revisão para o projeto {{projectName}}. Verifique os detalhes no portal.',
      triggerEvent: 'revision_requested',
      type: 'email'
    },
    {
      name: 'Prazo de Entrega Próximo',
      subject: '⏰ Alerta de Prazo: {{projectName}} vence em {{hours}}h',
      body: 'Atenção! O prazo de entrega do projeto {{projectName}} expira em {{hours}} horas. Priorize esta entrega.',
      triggerEvent: 'deadline_approaching',
      type: 'email'
    },
    {
      name: 'Confirmação de Pagamento',
      subject: '💰 Pagamento Confirmado: {{transactionId}}',
      body: 'Recebemos a confirmação do pagamento de R$ {{amount}} referente ao projeto {{projectName}}.',
      triggerEvent: 'payment_received',
      type: 'email'
    },
    {
      name: 'Arquivos Enviados pelo Cliente',
      subject: '📁 Novos Arquivos Recebidos: {{clientName}}',
      body: 'O cliente {{clientName}} fez upload de novos arquivos ou referências para o projeto {{projectName}}.',
      triggerEvent: 'client_upload',
      type: 'email'
    },
    {
      name: 'Feedback no Portal',
      subject: '💬 Novo Feedback de Cliente: {{projectName}}',
      body: 'Você recebeu uma nova mensagem ou feedback do cliente {{clientName}} através do Portal do Cliente.',
      triggerEvent: 'client_feedback',
      type: 'email'
    },
    {
      name: 'Briefing Próximo',
      subject: '📅 Reunião de Briefing em Breve: {{projectName}}',
      body: 'Lembrete: Sua reunião de briefing para o projeto {{projectName}} está agendada para {{dateTime}}.',
      triggerEvent: 'briefing_scheduled',
      type: 'email'
    },
    {
      name: 'Etapa Concluída pela Equipe',
      subject: '🏁 Etapa Finalizada: {{stepName}} - {{projectName}}',
      body: 'A etapa de {{stepName}} do projeto {{projectName}} foi marcada como concluída pela equipe.',
      triggerEvent: 'step_completed',
      type: 'email'
    }
  ];

  try {
    console.log('Seeding notification templates...');
    for (const template of templates) {
      await NotificationTemplate.findOrCreate({
        where: { triggerEvent: template.triggerEvent },
        defaults: template
      });
    }
    console.log('Notification templates seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
}

seedNotifications();
