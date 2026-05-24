const moment = require('moment');

/**
 * Retorna os campos automatizados para uma etapa específica do funil do CRM.
 * 
 * @param {string} targetStatus - O status destino no funil
 * @param {object} currentBudget - O estado atual da negociação (para preservar dados se aplicável)
 * @returns {object} Os campos que devem ser atualizados no banco de dados
 */
function getAutomatedFieldsForStatus(targetStatus, currentBudget = {}) {
  const now = moment();
  let priority = currentBudget.priority || 'media';
  let probability = currentBudget.probability || 50;
  let nextActionDate = null;
  let nextActionNote = "";
  let proposalStatus = currentBudget.proposalStatus || 'rascunho';

  // Garantir que trabalhamos com strings limpas
  const statusKey = (targetStatus || '').trim().toLowerCase();

  switch (statusKey) {
    case 'novo':
      priority = 'media';
      probability = 15;
      nextActionDate = now.clone().add(24, 'hours').toDate();
      nextActionNote = "Novo lead recebido! Enviar mensagem de apresentação e briefing básico pelo WhatsApp.";
      break;

    case 'qualificacao':
      priority = 'media';
      probability = 35;
      nextActionDate = now.clone().add(48, 'hours').toDate();
      nextActionNote = "Coletar informações do briefing (metragem, estilo, formato base, prazo) para precificação.";
      break;

    case 'proposta':
      priority = 'alta';
      probability = 60;
      proposalStatus = 'enviada';
      nextActionDate = now.clone().add(72, 'hours').toDate();
      nextActionNote = "Calcular orçamento inteligente no sistema, gerar PDF da proposta e enviar ao cliente.";
      break;

    case 'ajustes':
      priority = 'alta';
      probability = 75;
      nextActionDate = now.clone().add(48, 'hours').toDate();
      nextActionNote = "Analisar revisões solicitadas pelo cliente, ajustar valores se necessário e reenviar proposta.";
      break;

    case 'fechamento':
      priority = 'alta';
      probability = 90;
      nextActionDate = now.clone().add(24, 'hours').toDate();
      nextActionNote = "Negociar termos finais de pagamento (parcelamento, contrato) e formalizar o fechamento!";
      break;

    default:
      // Fallback para qualquer outra etapa não mapeada
      nextActionDate = now.clone().add(24, 'hours').toDate();
      nextActionNote = "Realizar contato de rotina com o cliente para dar andamento.";
      break;
  }

  return {
    status: targetStatus,
    priority,
    probability,
    nextActionDate,
    nextActionNote,
    proposalStatus
  };
}

module.exports = {
  getAutomatedFieldsForStatus
};
