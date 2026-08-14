/**
 * Seeder de Categorias Financeiras — ArchViz
 * Roda no startup: se a tabela estiver vazia, insere as categorias padrão.
 */
const { CategoryReceita, CategoryDespesa } = require('../models');

const CATEGORIAS_RECEITA = [
  { name: 'Projeto 3D / Render', description: 'Receita de projetos contratados', color: '#10b981' },
  { name: 'Render de Imagem Avulsa', description: 'Imagens avulsas sem projeto', color: '#059669' },
  { name: 'Animação 3D', description: 'Animações contratadas', color: '#0891b2' },
  { name: 'Planta Humanizada', description: 'Plantas humanizadas avulsas', color: '#6366f1' },
  { name: 'Tour Virtual / 360°', description: 'Tours virtuais e panoramas', color: '#8b5cf6' },
  { name: 'Modelagem 3D Avulsa', description: 'Modelagem sem render', color: '#a855f7' },
  { name: 'Pós-Produção e Edição', description: 'Edição de imagens e vídeos', color: '#ec4899' },
  { name: 'Consultoria Técnica', description: 'Consultoria de ArchViz/3D', color: '#f59e0b' },
  { name: 'Treinamento / Workshop', description: 'Treinamentos ministrados', color: '#eab308' },
  { name: 'Revisão Extra', description: 'Revisões fora do contrato', color: '#f97316' },
  { name: 'Venda de Asset / Template', description: 'Assets, blocos, templates', color: '#14b8a6' },
  { name: 'Comissão por Indicação', description: 'Comissões recebidas', color: '#06b6d4' },
  { name: 'Job Freelance Externo', description: 'Jobs como freelancer externo', color: '#3b82f6' },
  { name: 'Aluguel de Render Farm', description: 'Aluguel de capacidade de render', color: '#2563eb' },
  { name: 'Contrato Mensal (Retainer)', description: 'Contratos recorrentes mensais', color: '#7c3aed' },
  { name: 'Diária de Produção', description: 'Diárias cobradas por produção', color: '#d946ef' },
  { name: 'Impressão 3D / Maquete', description: 'Impressão ou maquete física', color: '#e11d48' },
  { name: 'Serviço de Drone / Fotografia', description: 'Drone e fotos aéreas', color: '#64748b' },
  { name: 'Bônus por Meta Atingida', description: 'Bônus de performance', color: '#84cc16' },
  { name: 'Outros', description: 'Receitas diversas', color: '#6b7280' }
];

const CATEGORIAS_DESPESA = [
  { name: 'Pagamento Freelancer', description: 'Pagamento a freelancers', color: '#ef4444' },
  { name: 'Render Farm (Cloud)', description: 'Serviços de render na nuvem', color: '#dc2626' },
  { name: 'Licença de Software', description: 'Licenças 3ds Max, V-Ray, D5, etc.', color: '#f97316' },
  { name: 'Plugin / Add-on', description: 'Plugins e extensões', color: '#ea580c' },
  { name: 'Compra de Assets 3D', description: 'Modelos, texturas, HDRIs', color: '#d97706' },
  { name: 'Hardware / Equipamento', description: 'GPU, RAM, Storage, Monitors', color: '#ca8a04' },
  { name: 'Aluguel Escritório/Coworking', description: 'Aluguel do espaço', color: '#4f46e5' },
  { name: 'Internet / Servidor / Cloud', description: 'Internet, hosting, cloud', color: '#7c3aed' },
  { name: 'Energia Elétrica', description: 'Conta de energia', color: '#9333ea' },
  { name: 'Marketing / Anúncios', description: 'Google Ads, Meta, SEO', color: '#db2777' },
  { name: 'Contabilidade / Fiscal', description: 'Honorários contábeis', color: '#0891b2' },
  { name: 'Impostos e Taxas', description: 'DAS, ISS, IRPJ, taxas', color: '#0d9488' },
  { name: 'Material de Escritório', description: 'Materiais gerais', color: '#64748b' },
  { name: 'Viagem / Transporte', description: 'Deslocamentos e viagens', color: '#475569' },
  { name: 'Alimentação / Refeição', description: 'VR, refeições, lanches', color: '#84cc16' },
  { name: 'Treinamento / Curso', description: 'Cursos e capacitação', color: '#f59e0b' },
  { name: 'Seguro', description: 'Seguro equipamento/saúde', color: '#6366f1' },
  { name: 'Manutenção Equipamento', description: 'Reparos e manutenção', color: '#8b5cf6' },
  { name: 'Comissão de Venda', description: 'Comissões pagas a vendedores', color: '#e11d48' },
  { name: 'Outros', description: 'Despesas diversas', color: '#6b7280' }
];

async function seedFinanceCategories() {
  try {
    // Só faz seed se tabela estiver vazia
    const receitaCount = await CategoryReceita.count();
    if (receitaCount === 0) {
      await CategoryReceita.bulkCreate(CATEGORIAS_RECEITA);
      console.log('✓ Seeded ' + CATEGORIAS_RECEITA.length + ' categorias de receita');
    }

    const despesaCount = await CategoryDespesa.count();
    if (despesaCount === 0) {
      await CategoryDespesa.bulkCreate(CATEGORIAS_DESPESA);
      console.log('✓ Seeded ' + CATEGORIAS_DESPESA.length + ' categorias de despesa');
    }
  } catch (err) {
    console.error('Seed categorias erro (non-fatal):', err.message);
  }
}

module.exports = { seedFinanceCategories, CATEGORIAS_RECEITA, CATEGORIAS_DESPESA };
