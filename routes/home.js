const express = require('express');
const router = express.Router();
const { Project, Testimonial, Setting, Client, Budget, Milestone, Task, TaskFile, TaskHistoryComment, User } = require('../models');
const emailService = require('../services/emailService');

// Página inicial
router.get('/', async (req, res) => {
  try {


    // Buscar projetos em destaque
    const featuredProjects = await Project.findAll({
      where: { isActive: true, isFeatured: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      limit: 6
    });

    // Buscar depoimentos ativos
    const testimonials = await Testimonial.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      limit: 6
    });

    // Buscar configurações da página
    const settings = await Setting.findAll({
      where: {
        group: ['about', 'contact', 'videos', 'faq', 'footer']
      }
    });

    // Organizar configurações por grupo
    const settingsByGroup = {};
    settings.forEach(setting => {
      if (!settingsByGroup[setting.group]) {
        settingsByGroup[setting.group] = {};
      }
      settingsByGroup[setting.group][setting.key] = setting.value;
    });

    res.render('home', {

      title: 'Malha 3D - Renderização e Modelagem 3D Profissional',
      banner: settingsByGroup.banner || {},
      projects: featuredProjects,
      testimonials: testimonials,
      about: settingsByGroup.about || {},
      contact: settingsByGroup.contact || {},
      videos: settingsByGroup.videos || {},
      faq: settingsByGroup.faq || {},
      footer: settingsByGroup.footer || {}
    });
  } catch (error) {
    console.error('Erro ao carregar página inicial:', error);
    res.status(500).render('error/500', {
      title: 'Erro ao carregar página',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Página de contato
router.get('/contato', (req, res) => {
  res.render('contato', {
    title: 'Contato - Malha 3D'
  });
});

// Portal do Cliente - Rota Pública Segura
router.get('/portal/c/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).render('error/500', {
        title: 'Portal não encontrado',
        error: { message: 'O link de acesso do portal é inválido ou expirou.' }
      });
    }

    const budgets = await Budget.findAll({
      where: { clientId: client.id },
      order: [['createdAt', 'DESC']]
    });

    const projects = await Project.findAll({
      where: { clientId: client.id },
      order: [['createdAt', 'DESC']]
    });

    const activeBudgets = budgets.filter(b => b.winStatus === 'aberto');
    const executedBudgets = budgets.filter(b => b.winStatus === 'ganho');

    const activeProjects = projects.filter(p => p.status !== 'concluido');
    const completedProjects = projects.filter(p => p.status === 'concluido');

    // Load Global Settings from DB
    const cpSettingsRaw = await Setting.findAll({ where: { group: 'portal_cliente' } });
    const cpSettings = {};
    cpSettingsRaw.forEach(s => {
      cpSettings[s.key] = s.value;
    });

    const defaults = {
      'cp_domain': 'portal.malha3d.com',
      'cp_expiry': 'never',
      'cp_watermark': 'true',
      'cp_wm_text': 'MALHA 3D - PREVIEW',
      'cp_wm_opacity': '30',
      'cp_wm_pos': 'diagonal',
      'cp_require_sig': 'true',
      'cp_allow_4k': 'true',
      'cp_color_accent': '#ff6f00',
      'cp_color_bg': '#030712'
    };

    // Set defaults if they are missing
    for (const key in defaults) {
      if (cpSettings[key] === undefined) {
        cpSettings[key] = defaults[key];
      }
    }

    res.render('client/portal-view', {
      layout: false, // Standalone Layout Customizado
      title: `Portal do Cliente - ${client.name} | Malha 3D`,
      client: client.toJSON ? client.toJSON() : client,
      activeBudgets: activeBudgets.map(b => b.toJSON ? b.toJSON() : b),
      executedBudgets: executedBudgets.map(b => b.toJSON ? b.toJSON() : b),
      activeProjects: activeProjects.map(p => p.toJSON ? p.toJSON() : p),
      completedProjects: completedProjects.map(p => p.toJSON ? p.toJSON() : p),
      cpSettings
    });
  } catch (error) {
    console.error('Erro ao carregar Portal do Cliente:', error);
    res.status(500).render('error/500', {
      title: 'Erro no Portal',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Portal do Cliente - Rota Pública Segura baseada em Token do Projeto
router.get('/portal/p/:externalToken', async (req, res) => {
  try {
    const { externalToken } = req.params;
    const project = await Project.findOne({
      where: { externalToken },
      include: [
        { model: Client, as: 'customer' },
        {
          model: Milestone,
          as: 'milestones',
          include: [{
            model: Task,
            as: 'tasks',
            where: { parentTaskId: null },
            required: false,
            include: [
              { model: Task, as: 'subTasks', required: false },
              { model: TaskFile, as: 'files', required: false },
              { model: TaskHistoryComment, as: 'comments', required: false }
            ]
          }]
        }
      ],
      order: [
        [{ model: Milestone, as: 'milestones' }, 'order', 'ASC']
      ]
    });

    if (!project) {
      return res.status(404).render('error/500', {
        title: 'Projeto não encontrado',
        error: { message: 'O link de acesso do portal é inválido ou expirou.' }
      });
    }

    // Carregar configurações do portal
    const cpSettingsRaw = await Setting.findAll({ where: { group: 'portal_cliente' } });
    const cpSettings = {};
    cpSettingsRaw.forEach(s => {
      cpSettings[s.key] = s.value;
    });

    const defaults = {
      'cp_domain': 'portal.malha3d.com',
      'cp_expiry': 'never',
      'cp_watermark': 'true',
      'cp_wm_text': 'MALHA 3D - PREVIEW',
      'cp_wm_opacity': '30',
      'cp_wm_pos': 'diagonal',
      'cp_require_sig': 'true',
      'cp_allow_4k': 'true',
      'cp_color_accent': '#ff6f00',
      'cp_color_bg': '#030712'
    };

    for (const key in defaults) {
      if (cpSettings[key] === undefined) {
        cpSettings[key] = defaults[key];
      }
    }

    let totalTasks = 0;
    let completedTasks = 0;
    if (project.milestones) {
      project.milestones.forEach(m => {
        if (m.tasks) {
          m.tasks.forEach(t => {
            totalTasks++;
            if (t.status === 'concluido') {
              completedTasks++;
            }
            if (t.subTasks) {
              t.subTasks.forEach(st => {
                totalTasks++;
                if (st.status === 'concluido') {
                  completedTasks++;
                }
              });
            }
          });
        }
      });
    }
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.render('client/project-portal', {
      layout: false, // standalone design
      title: `Portal de Aprovação - ${project.title} | Malha 3D`,
      project: project.toJSON ? project.toJSON() : project,
      cpSettings,
      progressPercent
    });
  } catch (error) {
    console.error('Erro ao carregar Portal do Projeto:', error);
    res.status(500).render('error/500', {
      title: 'Erro no Portal',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/portal/p/:externalToken/action - Enviar ação do cliente (Aprovar/Ajustar)
router.post('/api/portal/p/:externalToken/action', async (req, res) => {
  try {
    const { externalToken } = req.params;
    const { taskId, fileId, action, feedback } = req.body;

    const project = await Project.findOne({ where: { externalToken } });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Projeto não encontrado.' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Tarefa não encontrada.' });
    }

    const file = await TaskFile.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ success: false, error: 'Arquivo não encontrado.' });
    }

    if (action === 'approve') {
      await file.update({
        isApprovedByClient: true,
        clientFeedback: feedback || null
      });

      await task.update({
        status: 'concluido'
      });

      await TaskHistoryComment.create({
        taskId,
        type: 'client_feedback',
        content: `✅ Arquivo V${file.versionNumber} aprovado pelo cliente: ${feedback || 'Sem comentários'}`
      });
    } else if (action === 'adjust') {
      await file.update({
        isApprovedByClient: false,
        clientFeedback: feedback || 'Necessário ajustes'
      });

      const nextRound = (task.revisionRound || 0) + 1;
      await task.update({
        status: 'em_revisao', // Em Revisão
        revisionRound: nextRound
      });

      await TaskHistoryComment.create({
        taskId,
        type: 'client_feedback',
        content: `❌ Pedido de ajuste do cliente na imagem V${file.versionNumber}: ${feedback}`
      });

      // Notificar o artista responsável (assignee) por e-mail
      if (task.assigneeId) {
        try {
          const artist = await User.findByPk(task.assigneeId);
          if (artist && artist.email) {
            await emailService.sendEmail({
              to: artist.email,
              subject: `🔄 Ajuste solicitado na tarefa: ${task.title}`,
              html: `<p>Olá, <strong>${artist.name}</strong>!</p>
                     <p>O cliente solicitou alterações na imagem da tarefa <strong>${task.title}</strong> do projeto <strong>${project.title}</strong>.</p>
                     <p><strong>Feedback do cliente:</strong> "${feedback}"</p>
                     <p>A tarefa foi movida para o status <strong>Em Revisão</strong> (Rodada de Revisão: Rev ${String(nextRound).padStart(2, '0')}).</p>
                     <p style="font-size: 12px; color: #666;">Malha 3D - Gestão de Archviz</p>`
            });
          }
        } catch (err) {
          console.error('Erro ao notificar o artista por e-mail:', err);
        }
      }
    }

    // WebSocket trigger
    const io = req.app.get('io');
    if (io) {
      io.emit('task_update', {
        taskId: task.id,
        projectId: project.id,
        assigneeId: task.assigneeId,
        action,
        feedback
      });
    }

    res.json({ success: true, message: 'Feedback enviado com sucesso.' });
  } catch (error) {
    console.error('Erro na ação do Portal do Cliente:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
