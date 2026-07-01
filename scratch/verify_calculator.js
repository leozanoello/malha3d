const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const aiService = require('../services/aiService');

async function testPricingEngine() {
  console.log('=== TESTE DO MOTOR DE IA / HEURÍSTICA ===');
  
  // Test case 1: Standard simple briefing
  const res1 = await aiService.analyzeBriefingComplexity('Quarto simples com cama e armário comum.', ['Quarto Solteiro']);
  console.log('\nCaso 1: Briefing Simples');
  console.log(`Multiplicador: ${res1.multiplier}x`);
  console.log(`Justificativa: "${res1.rationale}"`);
  console.log(`Origem: ${res1.source}`);

  // Test case 2: Complex high-end parametric briefing
  const res2 = await aiService.analyzeBriefingComplexity(
    'O cliente exige teto paramétrico orgânico de madeira ripada e biofilia densa com plantas nativas da Amazônia. Detalhamento de alto luxo clássico.', 
    ['Living', 'Espaço Gourmet', 'Paisagismo/Jardim']
  );
  console.log('\nCaso 2: Briefing Paramétrico Altíssimo Padrão');
  console.log(`Multiplicador: ${res2.multiplier}x`);
  console.log(`Justificativa: "${res2.rationale}"`);
  console.log(`Origem: ${res2.source}`);

  console.log('\n=== SIMULAÇÃO MATEMÁTICA DE CUSTOS (CALCULADORA) ===');
  const baseM2 = 50.00;
  const baseImage = 350.00;
  const baseAnimation = 120.00;
  const baseTour = 800.00;
  const baseEnv = 100.00;

  const metragem = 250;
  const imagens = 5;
  const segundos = 15;
  const tour = true;
  const envsCount = 4;

  const modelagemBase = metragem * baseM2;
  const imagensBase = imagens * baseImage;
  const animacaoBase = segundos * baseAnimation;
  const tourBase = tour ? baseTour : 0;
  const ambientesBase = envsCount * baseEnv;

  console.log(`Modelagem Base: R$ ${modelagemBase}`);
  console.log(`Imagens Base: R$ ${imagensBase}`);
  console.log(`Animação Base: R$ ${animacaoBase}`);
  console.log(`Tour Base: R$ ${tourBase}`);
  console.log(`Ambientes Base: R$ ${ambientesBase}`);

  // Multipliers
  const formatMult = 1.25; // Desenho 2D
  const styleMult = 1.20; // Clássico
  const detailMult = 1.30; // Alto fotorrealismo
  const aiMult = res2.multiplier;
  const slaMult = 1.30; // Urgente

  const modelagemComplexidade = modelagemBase * formatMult * styleMult * detailMult;
  const subtotalComplexidade = modelagemComplexidade + imagensBase + animacaoBase + tourBase + ambientesBase;
  const valorComRisco = subtotalComplexidade * aiMult;
  const finalPrice = valorComRisco * slaMult;

  console.log(`\nSubtotal Complexidade: R$ ${subtotalComplexidade.toFixed(2)}`);
  console.log(`Valor com Risco IA (${aiMult}x): R$ ${valorComRisco.toFixed(2)}`);
  console.log(`Valor Final SLA (${slaMult}x): R$ ${finalPrice.toFixed(2)}`);

  console.log('\n=== FIM DO TESTE ===');
}

testPricingEngine().catch(err => console.error(err));
