const { sequelize } = require('../config/database');

function calcularSubtotalItem(entregavel) {
  const qtd = Number(entregavel.qtd) || 1;
  const valorBase = Number(entregavel.valorBase) || 0;
  const config = entregavel.config || {};
  const fatores = config.fatores_preco || {};

  const fatorResolucao = (fatores.resolucao && fatores.resolucao[config.resolucao]) || 1.0;
  const fatorArquivoAberto = config.arquivo_aberto ? (Number(fatores.arquivo_aberto) || 0) : 0;
  const revisoesInclusas = Number(config.revisoes_inclusas) || 2;
  const revisoesExtra = Math.max(0, revisoesInclusas - 2);
  const custoRevisaoExtra = Number(fatores.revisao_extra) || 0;

  const subtotal = (qtd * valorBase * fatorResolucao * (1 + fatorArquivoAberto))
    + (revisoesExtra * custoRevisaoExtra);

  return Math.round(subtotal * 100) / 100;
}

async function recalcularAncestral(entregavelId, options = {}) {
  const CpqEntregavel = require('../models/CpqEntregavel');
  const CpqAmbiente = require('../models/CpqAmbiente');
  const CpqFase = require('../models/CpqFase');
  const CpqOrcamento = require('../models/CpqOrcamento');

  const tx = options.transaction || await sequelize.transaction();
  const isExternalTx = !!options.transaction;

  try {
    const entregavel = await CpqEntregavel.findByPk(entregavelId, { transaction: tx });
    if (!entregavel) {
      if (!isExternalTx) await tx.commit();
      return;
    }

    entregavel.subtotalCached = calcularSubtotalItem(entregavel);
    await entregavel.save({ transaction: tx });

    const ambiente = await CpqAmbiente.findByPk(entregavel.ambienteId, { transaction: tx });
    if (ambiente) {
      const entregaveis = await CpqEntregavel.findAll({
        where: { ambienteId: ambiente.id },
        transaction: tx
      });
      ambiente.subtotalCached = entregaveis.reduce((sum, e) => sum + Number(e.subtotalCached), 0);
      await ambiente.save({ transaction: tx });

      const fase = await CpqFase.findByPk(ambiente.faseId, { transaction: tx });
      if (fase) {
        const ambientes = await CpqAmbiente.findAll({
          where: { faseId: fase.id },
          transaction: tx
        });
        fase.subtotalCached = ambientes.reduce((sum, a) => sum + Number(a.subtotalCached), 0);
        await fase.save({ transaction: tx });

        const orcamento = await CpqOrcamento.findByPk(fase.orcamentoId, { transaction: tx });
        if (orcamento) {
          const fases = await CpqFase.findAll({
            where: { orcamentoId: orcamento.id },
            transaction: tx
          });
          orcamento.totalCached = fases.reduce((sum, f) => sum + Number(f.subtotalCached), 0);
          await orcamento.save({ transaction: tx });
        }
      }
    }

    if (!isExternalTx) await tx.commit();
  } catch (err) {
    if (!isExternalTx) await tx.rollback();
    throw err;
  }
}

async function recalcularDesdeAmbiente(ambienteId, options = {}) {
  const CpqEntregavel = require('../models/CpqEntregavel');
  const CpqAmbiente = require('../models/CpqAmbiente');
  const CpqFase = require('../models/CpqFase');
  const CpqOrcamento = require('../models/CpqOrcamento');

  const tx = options.transaction || await sequelize.transaction();
  const isExternalTx = !!options.transaction;

  try {
    const ambiente = await CpqAmbiente.findByPk(ambienteId, { transaction: tx });
    if (!ambiente) {
      if (!isExternalTx) await tx.commit();
      return;
    }

    const entregaveis = await CpqEntregavel.findAll({
      where: { ambienteId: ambiente.id },
      transaction: tx
    });
    ambiente.subtotalCached = entregaveis.reduce((sum, e) => sum + Number(e.subtotalCached), 0);
    await ambiente.save({ transaction: tx });

    const fase = await CpqFase.findByPk(ambiente.faseId, { transaction: tx });
    if (fase) {
      const ambientes = await CpqAmbiente.findAll({
        where: { faseId: fase.id },
        transaction: tx
      });
      fase.subtotalCached = ambientes.reduce((sum, a) => sum + Number(a.subtotalCached), 0);
      await fase.save({ transaction: tx });

      const orcamento = await CpqOrcamento.findByPk(fase.orcamentoId, { transaction: tx });
      if (orcamento) {
        const fases = await CpqFase.findAll({
          where: { orcamentoId: orcamento.id },
          transaction: tx
        });
        orcamento.totalCached = fases.reduce((sum, f) => sum + Number(f.subtotalCached), 0);
        await orcamento.save({ transaction: tx });
      }
    }

    if (!isExternalTx) await tx.commit();
  } catch (err) {
    if (!isExternalTx) await tx.rollback();
    throw err;
  }
}

module.exports = {
  calcularSubtotalItem,
  recalcularAncestral,
  recalcularDesdeAmbiente
};
