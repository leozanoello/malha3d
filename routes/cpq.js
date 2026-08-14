const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const {
  CpqOrcamento, CpqFase, CpqAmbiente, CpqEntregavel, Budget
} = require('../models');
const { calcularSubtotalItem, recalcularAncestral, recalcularDesdeAmbiente } = require('../utils/cpqCalculo');

// ============================================================
// ORÇAMENTO CPQ (1:1 com Budget)
// ============================================================

// GET /admin/api/cpq/:budgetId — Carrega orçamento completo (árvore inteira)
router.get('/:budgetId', async (req, res) => {
  try {
    let orcamento = await CpqOrcamento.findOne({
      where: { budgetId: req.params.budgetId },
      include: [{
        model: CpqFase,
        as: 'fases',
        order: [['ordem', 'ASC']],
        include: [{
          model: CpqAmbiente,
          as: 'ambientes',
          order: [['ordem', 'ASC']],
          include: [{
            model: CpqEntregavel,
            as: 'entregaveis',
            order: [['ordem', 'ASC']]
          }]
        }]
      }],
      order: [
        [{ model: CpqFase, as: 'fases' }, 'ordem', 'ASC'],
        [{ model: CpqFase, as: 'fases' }, { model: CpqAmbiente, as: 'ambientes' }, 'ordem', 'ASC'],
        [{ model: CpqFase, as: 'fases' }, { model: CpqAmbiente, as: 'ambientes' }, { model: CpqEntregavel, as: 'entregaveis' }, 'ordem', 'ASC']
      ]
    });

    if (!orcamento) {
      orcamento = await CpqOrcamento.create({
        budgetId: req.params.budgetId,
        totalCached: 0
      });
      orcamento.dataValues.fases = [];
    }

    res.json(orcamento);
  } catch (err) {
    console.error('CPQ GET orcamento error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// FASES (Nível 1)
// ============================================================

// POST /admin/api/cpq/:budgetId/fases
router.post('/:budgetId/fases', async (req, res) => {
  try {
    let orcamento = await CpqOrcamento.findOne({ where: { budgetId: req.params.budgetId } });
    if (!orcamento) {
      orcamento = await CpqOrcamento.create({ budgetId: req.params.budgetId, totalCached: 0 });
    }

    const maxOrdem = await CpqFase.max('ordem', { where: { orcamentoId: orcamento.id } }) || 0;

    const fase = await CpqFase.create({
      orcamentoId: orcamento.id,
      nome: req.body.nome || 'Nova Fase',
      descricao: req.body.descricao || null,
      ordem: maxOrdem + 1,
      subtotalCached: 0
    });

    res.status(201).json(fase);
  } catch (err) {
    console.error('CPQ POST fase error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/api/cpq/fases/:id
router.put('/fases/:id', async (req, res) => {
  try {
    const fase = await CpqFase.findByPk(req.params.id);
    if (!fase) return res.status(404).json({ error: 'Fase não encontrada' });

    if (req.body.nome !== undefined) fase.nome = req.body.nome;
    if (req.body.descricao !== undefined) fase.descricao = req.body.descricao;
    await fase.save();

    res.json(fase);
  } catch (err) {
    console.error('CPQ PUT fase error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/api/cpq/fases/:id
router.delete('/fases/:id', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const fase = await CpqFase.findByPk(req.params.id, { transaction: tx });
    if (!fase) {
      await tx.rollback();
      return res.status(404).json({ error: 'Fase não encontrada' });
    }

    const orcamentoId = fase.orcamentoId;
    await fase.destroy({ transaction: tx });

    // Recalcula total do orçamento
    const fases = await CpqFase.findAll({ where: { orcamentoId }, transaction: tx });
    const total = fases.reduce((sum, f) => sum + Number(f.subtotalCached), 0);
    await CpqOrcamento.update({ totalCached: total }, { where: { id: orcamentoId }, transaction: tx });

    await tx.commit();
    res.json({ success: true });
  } catch (err) {
    await tx.rollback();
    console.error('CPQ DELETE fase error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// AMBIENTES (Nível 2)
// ============================================================

// POST /admin/api/cpq/fases/:faseId/ambientes
router.post('/fases/:faseId/ambientes', async (req, res) => {
  try {
    const fase = await CpqFase.findByPk(req.params.faseId);
    if (!fase) return res.status(404).json({ error: 'Fase não encontrada' });

    const maxOrdem = await CpqAmbiente.max('ordem', { where: { faseId: fase.id } }) || 0;

    const ambiente = await CpqAmbiente.create({
      faseId: fase.id,
      nome: req.body.nome || 'Novo Ambiente',
      descricao: req.body.descricao || null,
      ordem: maxOrdem + 1,
      subtotalCached: 0
    });

    res.status(201).json(ambiente);
  } catch (err) {
    console.error('CPQ POST ambiente error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/api/cpq/ambientes/:id
router.put('/ambientes/:id', async (req, res) => {
  try {
    const ambiente = await CpqAmbiente.findByPk(req.params.id);
    if (!ambiente) return res.status(404).json({ error: 'Ambiente não encontrado' });

    if (req.body.nome !== undefined) ambiente.nome = req.body.nome;
    if (req.body.descricao !== undefined) ambiente.descricao = req.body.descricao;
    await ambiente.save();

    res.json(ambiente);
  } catch (err) {
    console.error('CPQ PUT ambiente error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/api/cpq/ambientes/:id
router.delete('/ambientes/:id', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const ambiente = await CpqAmbiente.findByPk(req.params.id, { transaction: tx });
    if (!ambiente) {
      await tx.rollback();
      return res.status(404).json({ error: 'Ambiente não encontrado' });
    }

    const faseId = ambiente.faseId;
    await ambiente.destroy({ transaction: tx });

    // Recalcula fase e orçamento
    const fase = await CpqFase.findByPk(faseId, { transaction: tx });
    if (fase) {
      const ambientes = await CpqAmbiente.findAll({ where: { faseId }, transaction: tx });
      fase.subtotalCached = ambientes.reduce((sum, a) => sum + Number(a.subtotalCached), 0);
      await fase.save({ transaction: tx });

      const orcamento = await CpqOrcamento.findByPk(fase.orcamentoId, { transaction: tx });
      if (orcamento) {
        const fases = await CpqFase.findAll({ where: { orcamentoId: orcamento.id }, transaction: tx });
        orcamento.totalCached = fases.reduce((sum, f) => sum + Number(f.subtotalCached), 0);
        await orcamento.save({ transaction: tx });
      }
    }

    await tx.commit();
    res.json({ success: true });
  } catch (err) {
    await tx.rollback();
    console.error('CPQ DELETE ambiente error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ENTREGÁVEIS (Nível 3) — com CPQ Config e recálculo
// ============================================================

// POST /admin/api/cpq/ambientes/:ambienteId/entregaveis
router.post('/ambientes/:ambienteId/entregaveis', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const ambiente = await CpqAmbiente.findByPk(req.params.ambienteId, { transaction: tx });
    if (!ambiente) {
      await tx.rollback();
      return res.status(404).json({ error: 'Ambiente não encontrado' });
    }

    const maxOrdem = await CpqEntregavel.max('ordem', { where: { ambienteId: ambiente.id }, transaction: tx }) || 0;

    const config = req.body.config || {
      resolucao: 'FullHD',
      arquivo_aberto: false,
      softwares: [],
      revisoes_inclusas: 2,
      fatores_preco: {
        resolucao: { FullHD: 1.0, '4K': 1.5, '8K': 2.2, Web: 0.8 },
        arquivo_aberto: 0.4,
        revisao_extra: 250.0
      },
      prazo_dias: null,
      observacoes: ''
    };

    const entregavel = await CpqEntregavel.create({
      ambienteId: ambiente.id,
      tipo: req.body.tipo || 'imagem',
      nome: req.body.nome || null,
      qtd: req.body.qtd || 1,
      valorBase: req.body.valorBase || 0,
      ordem: maxOrdem + 1,
      config,
      subtotalCached: 0
    }, { transaction: tx });

    entregavel.subtotalCached = calcularSubtotalItem(entregavel);
    await entregavel.save({ transaction: tx });

    await recalcularAncestral(entregavel.id, { transaction: tx });
    await tx.commit();

    const updated = await CpqEntregavel.findByPk(entregavel.id);
    res.status(201).json(updated);
  } catch (err) {
    await tx.rollback();
    console.error('CPQ POST entregavel error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/api/cpq/entregaveis/:id
router.put('/entregaveis/:id', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const entregavel = await CpqEntregavel.findByPk(req.params.id, { transaction: tx });
    if (!entregavel) {
      await tx.rollback();
      return res.status(404).json({ error: 'Entregável não encontrado' });
    }

    if (req.body.tipo !== undefined) entregavel.tipo = req.body.tipo;
    if (req.body.nome !== undefined) entregavel.nome = req.body.nome;
    if (req.body.qtd !== undefined) entregavel.qtd = req.body.qtd;
    if (req.body.valorBase !== undefined) entregavel.valorBase = req.body.valorBase;

    if (req.body.config !== undefined) {
      entregavel.config = { ...entregavel.config, ...req.body.config };
    }

    entregavel.subtotalCached = calcularSubtotalItem(entregavel);
    await entregavel.save({ transaction: tx });
    await recalcularAncestral(entregavel.id, { transaction: tx });

    await tx.commit();

    const updated = await CpqEntregavel.findByPk(entregavel.id);
    res.json(updated);
  } catch (err) {
    await tx.rollback();
    console.error('CPQ PUT entregavel error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/api/cpq/entregaveis/:id
router.delete('/entregaveis/:id', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const entregavel = await CpqEntregavel.findByPk(req.params.id, { transaction: tx });
    if (!entregavel) {
      await tx.rollback();
      return res.status(404).json({ error: 'Entregável não encontrado' });
    }

    const ambienteId = entregavel.ambienteId;
    await entregavel.destroy({ transaction: tx });
    await recalcularDesdeAmbiente(ambienteId, { transaction: tx });

    await tx.commit();
    res.json({ success: true });
  } catch (err) {
    await tx.rollback();
    console.error('CPQ DELETE entregavel error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// REORDENAÇÃO (Drag & Drop)
// ============================================================

// PATCH /admin/api/cpq/reorder/fases
router.patch('/reorder/fases', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const { items } = req.body; // [{id, ordem}]
    for (const item of items) {
      await CpqFase.update({ ordem: item.ordem }, { where: { id: item.id }, transaction: tx });
    }
    await tx.commit();
    res.json({ success: true });
  } catch (err) {
    await tx.rollback();
    res.status(500).json({ error: err.message });
  }
});

// PATCH /admin/api/cpq/reorder/ambientes
router.patch('/reorder/ambientes', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const { items } = req.body; // [{id, ordem, faseId?}]
    for (const item of items) {
      const updateData = { ordem: item.ordem };
      if (item.faseId) updateData.faseId = item.faseId;
      await CpqAmbiente.update(updateData, { where: { id: item.id }, transaction: tx });
    }
    await tx.commit();
    res.json({ success: true });
  } catch (err) {
    await tx.rollback();
    res.status(500).json({ error: err.message });
  }
});

// PATCH /admin/api/cpq/reorder/entregaveis
router.patch('/reorder/entregaveis', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const { items } = req.body; // [{id, ordem, ambienteId?}]
    for (const item of items) {
      const updateData = { ordem: item.ordem };
      if (item.ambienteId) updateData.ambienteId = item.ambienteId;
      await CpqEntregavel.update(updateData, { where: { id: item.id }, transaction: tx });
    }
    await tx.commit();
    res.json({ success: true });
  } catch (err) {
    await tx.rollback();
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// DUPLICAÇÃO (Clonar fase/ambiente/entregável)
// ============================================================

// POST /admin/api/cpq/fases/:id/duplicar
router.post('/fases/:id/duplicar', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const original = await CpqFase.findByPk(req.params.id, {
      include: [{
        model: CpqAmbiente, as: 'ambientes',
        include: [{ model: CpqEntregavel, as: 'entregaveis' }]
      }],
      transaction: tx
    });
    if (!original) {
      await tx.rollback();
      return res.status(404).json({ error: 'Fase não encontrada' });
    }

    const maxOrdem = await CpqFase.max('ordem', { where: { orcamentoId: original.orcamentoId }, transaction: tx }) || 0;

    const novaFase = await CpqFase.create({
      orcamentoId: original.orcamentoId,
      nome: `${original.nome} (Cópia)`,
      descricao: original.descricao,
      ordem: maxOrdem + 1,
      subtotalCached: original.subtotalCached
    }, { transaction: tx });

    for (const amb of (original.ambientes || [])) {
      const novoAmb = await CpqAmbiente.create({
        faseId: novaFase.id,
        nome: amb.nome,
        descricao: amb.descricao,
        ordem: amb.ordem,
        subtotalCached: amb.subtotalCached
      }, { transaction: tx });

      for (const ent of (amb.entregaveis || [])) {
        await CpqEntregavel.create({
          ambienteId: novoAmb.id,
          tipo: ent.tipo,
          nome: ent.nome,
          qtd: ent.qtd,
          valorBase: ent.valorBase,
          subtotalCached: ent.subtotalCached,
          ordem: ent.ordem,
          config: ent.config
        }, { transaction: tx });
      }
    }

    // Recalcula total do orçamento
    const fases = await CpqFase.findAll({ where: { orcamentoId: original.orcamentoId }, transaction: tx });
    const total = fases.reduce((sum, f) => sum + Number(f.subtotalCached), 0);
    await CpqOrcamento.update({ totalCached: total }, { where: { id: original.orcamentoId }, transaction: tx });

    await tx.commit();
    res.status(201).json(novaFase);
  } catch (err) {
    await tx.rollback();
    console.error('CPQ duplicar fase error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// FINALIZAR — Gera BudgetItems a partir do CPQ
// ============================================================

// POST /admin/api/cpq/:budgetId/finalizar
router.post('/:budgetId/finalizar', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const orcamento = await CpqOrcamento.findOne({
      where: { budgetId: req.params.budgetId },
      include: [{
        model: CpqFase, as: 'fases',
        include: [{
          model: CpqAmbiente, as: 'ambientes',
          include: [{ model: CpqEntregavel, as: 'entregaveis' }]
        }]
      }],
      transaction: tx
    });

    if (!orcamento) {
      await tx.rollback();
      return res.status(404).json({ error: 'Orçamento CPQ não encontrado' });
    }

    const BudgetItem = require('../models/BudgetItem');

    // Remove itens antigos gerados pelo CPQ
    await BudgetItem.destroy({
      where: { budgetId: req.params.budgetId, source: 'cpq' },
      transaction: tx
    });

    // Gera novos BudgetItems
    const items = [];
    for (const fase of (orcamento.fases || [])) {
      for (const amb of (fase.ambientes || [])) {
        for (const ent of (amb.entregaveis || [])) {
          const descParts = [fase.nome, amb.nome, ent.nome || ent.tipo];
          if (ent.config && ent.config.resolucao) descParts.push(ent.config.resolucao);

          items.push({
            budgetId: req.params.budgetId,
            description: descParts.join(' › '),
            quantity: ent.qtd,
            unitPrice: Number(ent.subtotalCached) / Number(ent.qtd || 1),
            totalPrice: Number(ent.subtotalCached),
            source: 'cpq'
          });
        }
      }
    }

    if (items.length > 0) {
      await BudgetItem.bulkCreate(items, { transaction: tx });
    }

    // Marca orçamento como finalizado
    orcamento.finalizado = true;
    orcamento.geradoEm = new Date();
    await orcamento.save({ transaction: tx });

    // Atualiza estimatedValue do Budget
    await Budget.update(
      { estimatedValue: orcamento.totalCached },
      { where: { id: req.params.budgetId }, transaction: tx }
    );

    await tx.commit();
    res.json({ success: true, itemsGerados: items.length, total: orcamento.totalCached });
  } catch (err) {
    await tx.rollback();
    console.error('CPQ finalizar error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
