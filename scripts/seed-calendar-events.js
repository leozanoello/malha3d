require('dotenv').config();
const { CalendarEvent } = require('../models');

// Spreads production/commercial events across 2026, with extra coverage in
// May per the studio's request to populate the Agenda beyond a single day.
const events = [
  {
    title: 'Reunião de Kickoff - Residencial Aurora',
    startTime: new Date('2026-02-10T09:00:00'),
    endTime: new Date('2026-02-10T10:00:00'),
    type: 'reuniao',
    description: 'Alinhamento inicial de briefing com o cliente.'
  },
  {
    title: 'Entrega: Renders Fachada Comercial',
    startTime: new Date('2026-03-18T17:00:00'),
    type: 'entrega',
    description: 'Envio dos renders finais da torre comercial.'
  },
  {
    title: 'Follow-up Proposta Construtora Horizonte',
    startTime: new Date('2026-04-22T14:30:00'),
    type: 'followup',
    description: 'Retorno sobre a proposta enviada na semana anterior.'
  },
  {
    title: 'Reunião Malha3D',
    startTime: new Date('2026-05-04T09:00:00'),
    endTime: new Date('2026-05-04T09:45:00'),
    type: 'reuniao',
    description: 'Reunião semanal de equipe.'
  },
  {
    title: 'Entrega: Logo 3D',
    startTime: new Date('2026-05-08T16:00:00'),
    type: 'entrega',
    description: 'Entrega final da animação de logo em 3D.'
  },
  {
    title: 'Follow-up Cliente Villa Nova',
    startTime: new Date('2026-05-14T11:00:00'),
    type: 'followup',
    description: 'Follow-up comercial pós-envio de orçamento.'
  },
  {
    title: 'Revisão Interna - Projeto Masterplan',
    startTime: new Date('2026-05-21T10:00:00'),
    type: 'interno',
    description: 'Revisão de qualidade antes do envio ao cliente.'
  },
  {
    title: 'Entrega Final: Área Gourmet Casa Lago',
    startTime: new Date('2026-06-12T15:00:00'),
    type: 'entrega',
    description: 'Entrega dos arquivos finais em alta resolução.'
  },
  {
    title: 'Reunião de Planejamento Trimestral',
    startTime: new Date('2026-08-05T09:30:00'),
    type: 'interno',
    description: 'Planejamento de metas do estúdio para o trimestre.'
  },
  {
    title: 'Entrega: Vídeo Institucional Penthouse',
    startTime: new Date('2026-10-09T18:00:00'),
    type: 'entrega',
    description: 'Envio do vídeo institucional finalizado.'
  },
  {
    title: 'Follow-up Renovação Contrato Alpha S.A.',
    startTime: new Date('2026-11-16T13:00:00'),
    type: 'followup',
    description: 'Conversa sobre renovação do contrato anual.'
  },
  {
    title: 'Confraternização de Fim de Ano Malha3D',
    startTime: new Date('2026-12-18T19:00:00'),
    type: 'interno',
    description: 'Encerramento do ano com a equipe.'
  }
];

async function seedCalendarEvents() {
  try {
    let created = 0;
    for (const ev of events) {
      const existing = await CalendarEvent.findOne({ where: { title: ev.title, startTime: ev.startTime } });
      if (!existing) {
        await CalendarEvent.create(ev);
        created++;
      }
    }
    console.log(`Calendar seed complete. ${created} new event(s) created (of ${events.length} total defined).`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding calendar events:', error);
    process.exit(1);
  }
}

seedCalendarEvents();
