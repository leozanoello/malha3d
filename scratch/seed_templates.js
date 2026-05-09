require('dotenv').config();
const { ProjectTemplate, sequelize } = require('../models');

const templates = [
  { name: 'Render Residencial Externo', category: 'ArqViz', content: 'Projeto de renderização externa. Ambientes: Fachada, Piscina, Área Gourmet. Estilo: Moderno.' },
  { name: 'Interiores Apartamento Luxo', category: 'ArqViz', content: 'Modelagem e renderização de interiores. Foco em marcenaria detalhada e iluminação fotorealista.' },
  { name: 'Comercial: Fachada de Loja', category: 'Varejo', content: 'Renderização de fachada comercial. Inclusão de sinalização e iluminação noturna.' },
  { name: 'Produto: Mobiliário Design', category: 'Produto', content: 'Modelagem high-poly de móvel. Foco em texturas de madeira e tecidos.' },
  { name: 'Animação: Walkthrough Imobiliário', category: 'Vídeo', content: 'Vídeo de 60s percorrendo todos os ambientes do projeto.' },
  { name: 'Tour Virtual 360', category: 'Interativo', content: 'Geração de panoramas 360 para integração em plataforma web.' },
  { name: 'Masterplan Urbano', category: 'Urbanismo', content: 'Visualização de loteamento ou condomínio em grande escala.' },
  { name: 'Render Noturno Fotorealista', category: 'Especial', content: 'Configuração avançada de IES lights e iluminação artificial.' },
  { name: 'Modelagem 3D para Fabricação', category: 'Industrial', content: 'Arquivo otimizado para CNC ou Impressão 3D.' },
  { name: 'Humanização de Planta Baixa', category: 'Vendas', content: 'Planta humanizada 3D com mobiliário padrão.' },
  { name: 'Cenografia para Eventos', category: 'Eventos', content: 'Visualização de palco e stands de feiras.' },
  { name: 'Render de Jóias/Acessórios', category: 'Produto', content: 'Foco em materiais metálicos e pedras preciosas.' },
  { name: 'Perspectiva Explodida Técnica', category: 'Diagrama', content: 'Diagrama 3D mostrando componentes internos do projeto.' },
  { name: 'Animação de Logotipo 3D', category: 'Branding', content: 'Introdução em vídeo com logo 3D e efeitos de partículas.' },
  { name: 'Simulação de Tecidos (Clo3D)', category: 'Moda', content: 'Renderização de vestuário com simulação física.' },
  { name: 'V-Ray: Configuração de Interior', category: 'Preset', content: 'Template de cena com iluminação pronta para interiores.' },
  { name: 'Corona: Render Externo Day', category: 'Preset', content: 'Cena externa configurada para luz do dia.' },
  { name: 'Unreal Engine: Interior RT', category: 'Real-time', content: 'Ambiente interativo com Ray Tracing ativado.' },
  { name: 'Blender: Escultura Orgânica', category: 'Asset', content: 'Personagem ou objeto orgânico esculpido.' },
  { name: 'Post-Production: PSD Setup', category: 'Post', content: 'Estrutura de camadas para pós-produção no Photoshop.' },
  { name: 'Render de Cozinha Planejada', category: 'Interiores', content: 'Foco em materiais de quartzo, madeira e eletros.' },
  { name: 'Banheiro Suite Master', category: 'Interiores', content: 'Detalhe de revestimentos e metais sanitários.' },
  { name: 'Área Comum de Prédio', category: 'Condomínio', content: 'Academia, Salão de Festas e Brinquedoteca.' },
  { name: 'Fachada Prédio Corporativo', category: 'Comercial', content: 'Vidros refletivos e estrutura metálica.' },
  { name: 'Skybox Customizada 8K', category: 'Sky', content: 'HDRIs e nuvens para renderização de alta qualidade.' },
  { name: 'Asset: Vegetação Brasileira', category: 'Landscape', content: 'Modelos 3D de plantas nativas.' },
  { name: 'Render Automotivo Studio', category: 'Produto', content: 'Iluminação de estúdio para veículos.' },
  { name: 'Simulação de Fluídos', category: 'VFX', content: 'Animação de água ou líquidos.' },
  { name: 'Rigging de Personagem', category: 'Animação', content: 'Estrutura de ossos para movimentação 3D.' },
  { name: 'Otimização para WebGL', category: 'Web', content: 'Modelagem low-poly com texturas baked.' }
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Create table if not exists
    await ProjectTemplate.bulkCreate(templates);
    console.log('30 Templates seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Template seed error:', err);
    process.exit(1);
  }
}

seed();
