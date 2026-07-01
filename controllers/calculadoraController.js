const { Setting, Budget, SystemLog } = require('../models');
const aiService = require('../services/aiService');

/**
 * Controller to handle ArchViz Smart Pricing Calculator logic
 */
class CalculadoraController {
  /**
   * Main calculation API endpoint
   * POST /api/calculadora/calcular
   */
  async calcularPricingArchvizIA(req, res) {
    try {
      const {
        metragemTotal,
        tipoEmpreendimento,
        ambientes,
        formatoBase,
        estiloArquitetonico,
        detalhamentoExigido,
        briefingTextual,
        imagensEstaticas,
        segundosAnimacao,
        tourVirtual360,
        prazoSLA,
        contatoNome,
        contatoEmail,
        contatoPhone
      } = req.body;

      // 1. Inputs validation
      if (!metragemTotal || isNaN(parseFloat(metragemTotal))) {
        return res.status(400).json({ success: false, error: 'A metragem total é obrigatória e deve ser um número.' });
      }

      const metragem = parseFloat(metragemTotal);
      const imagens = parseInt(imagensEstaticas) || 0;
      const segundos = parseInt(segundosAnimacao) || 0;
      const tour = !!tourVirtual360;
      const envs = Array.isArray(ambientes) ? ambientes : [];

      // 2. Fetch calibrated pricing from Settings DB (with defaults)
      const settingsRaw = await Setting.findAll({
        where: { group: 'calculator' }
      });

      const dbSettings = {};
      settingsRaw.forEach(s => {
        dbSettings[s.key] = parseFloat(s.value);
      });

      const baseM2Price = dbSettings.calculator_base_price_m2 ?? 50.00;
      const baseImagePrice = dbSettings.calculator_base_price_image ?? 350.00;
      const baseAnimationPrice = dbSettings.calculator_base_price_animation ?? 120.00;
      const baseTourPrice = dbSettings.calculator_base_price_tour ?? 800.00;
      const baseEnvPrice = dbSettings.calculator_base_price_environment ?? 100.00;

      // 3. Mathematical Base Calculation
      const modelagemBase = metragem * baseM2Price;
      const imagensBase = imagens * baseImagePrice;
      const animacaoBase = segundos * baseAnimationPrice;
      const tourVirtualBase = tour ? baseTourPrice : 0;
      const ambientesBase = envs.length * baseEnvPrice;


      // 4. Fixed Multipliers (Complexity Modifiers)
      // Base format
      let formatMultiplier = 1.0;
      if (formatoBase === 'Modelo Sujo (Sketchup)' || formatoBase === 'Modelo Sujo') {formatMultiplier = 1.15;} else if (formatoBase === 'Desenho 2D (AutoCAD/PDF)' || formatoBase === 'Desenho 2D') {formatMultiplier = 1.25;} else if (formatoBase === 'Modelagem do Zero') {formatMultiplier = 1.40;}

      // Architectural style
      let styleMultiplier = 1.0;
      if (estiloArquitetonico === 'Moderno') {styleMultiplier = 1.05;} else if (estiloArquitetonico === 'Industrial') {styleMultiplier = 1.10;} else if (estiloArquitetonico === 'Clássico/Neoclássico') {styleMultiplier = 1.20;} else if (estiloArquitetonico === 'Rústico') {styleMultiplier = 1.10;}

      // Detail requirement
      let detailMultiplier = 1.0;
      if (detalhamentoExigido === 'Médio (Aprovação Comercial)' || detalhamentoExigido === 'Médio') {detailMultiplier = 1.15;} else if (detalhamentoExigido === 'Alto (Fotorrealismo High-End)' || detalhamentoExigido === 'Alto') {detailMultiplier = 1.30;}

      // Complexity subtotal (Apply complexity modifiers to modelagem portion)
      const modelagemComplexidade = modelagemBase * formatMultiplier * styleMultiplier * detailMultiplier;
      const subtotalComplexidade = modelagemComplexidade + imagensBase + animacaoBase + tourVirtualBase + ambientesBase;

      // 5. Query LLM internally for Risk Multiplier
      const aiResult = await aiService.analyzeBriefingComplexity(briefingTextual, envs);
      const aiMultiplier = aiResult.multiplier;
      const aiRationale = aiResult.rationale;

      // Value with risk multiplier
      const valorComRisco = subtotalComplexidade * aiMultiplier;

      // 6. SLA modifier
      let slaMultiplier = 1.0;
      if (prazoSLA === 'Urgente (+30%)' || prazoSLA === 'Urgente') {slaMultiplier = 1.30;} else if (prazoSLA === 'Crítico (+50%)' || prazoSLA === 'Crítico') {slaMultiplier = 1.50;}

      const valorTotalSugerido = valorComRisco * slaMultiplier;

      // 7. Breakdown calculation (Modelagem, Renderização, Risco/IA)
      const breakdownModelagem = parseFloat((modelagemComplexidade * slaMultiplier).toFixed(2));
      const breakdownRenderizacao = parseFloat(((imagensBase + animacaoBase + tourVirtualBase + ambientesBase) * slaMultiplier).toFixed(2));
      const breakdownTaxaRisco = parseFloat((valorTotalSugerido - (breakdownModelagem + breakdownRenderizacao)).toFixed(2));

      // 8. CRM Lead integration (Save as Budget deal)
      let savedBudget = null;
      const trackingCode = `Z3D-${Math.floor(1000 + Math.random() * 9000)}`;

      if (contatoNome && contatoEmail) {
        // Map complexity ENUM string
        let dbComplexity = 'Média';
        if (detalhamentoExigido === 'Baixo (Estudo Volumétrico)' || detalhamentoExigido === 'Baixo') {dbComplexity = 'Baixa';} else if (detalhamentoExigido === 'Alto (Fotorrealismo High-End)' || detalhamentoExigido === 'Alto') {dbComplexity = 'Alta';}

        const budgetDesc = `Calculadora IA - Proposta Gerada Automática.
Empreendimento: ${tipoEmpreendimento || 'Não especificado'}
Área: ${metragem} m²
Base: ${formatoBase || 'BIM Limpo'}
Estilo: ${estiloArquitetonico || 'Minimalista'}
Detalhamento: ${detalhamentoExigido || 'Médio'}
Ambientes: ${envs.join(', ')}
Prazo SLA: ${prazoSLA || 'Normal'}
Briefing IA: "${briefingTextual || 'Sem observações extras'}"
Multiplicador Risco IA: ${aiMultiplier} (${aiResult.source})
Rationale IA: "${aiRationale}"`;

        try {
          savedBudget = await Budget.create({
            name: contatoNome.trim(),
            email: contatoEmail.trim().toLowerCase(),
            phone: contatoPhone ? contatoPhone.trim() : null,
            projectType: 'Renderização', // Default compatible ENUM value
            description: budgetDesc,
            status: 'novo',
            winStatus: 'aberto',
            estimatedValue: parseFloat(valorTotalSugerido.toFixed(2)),
            totalArea: metragem,
            imagesCount: imagens,
            animationSeconds: segundos,
            panoramasCount: tour ? 1 : 0,
            complexity: dbComplexity,
            predominantStyle: estiloArquitetonico || 'Minimalista',
            receivedFormat: formatoBase || 'BIM Limpo',
            environments: envs,
            hasUrgency: slaMultiplier > 1.0,
            urgencyFee: parseFloat(((slaMultiplier - 1.0) * 100).toFixed(2)),
            source: 'calculadora_ia',
            trackingCode: trackingCode
          });

          await SystemLog.create({
            action: 'Budget Created via IA Calculator',
            module: 'CRM/Calculator',
            details: `Lead: ${contatoNome} - Est. Value: R$ ${valorTotalSugerido.toFixed(2)}`,
            userName: 'Calculadora IA Website',
            ipAddress: req.ip
          }).catch(() => {});

        } catch (dbErr) {
          console.error('[Calculadora Controller] Erro ao salvar Lead no banco:', dbErr.message);
        }
      }

      // 9. Response
      return res.json({
        success: true,
        trackingCode: savedBudget ? savedBudget.trackingCode : trackingCode,
        valorTotalSugerido: parseFloat(valorTotalSugerido.toFixed(2)),
        aiMultiplier,
        aiRationale,
        aiSource: aiResult.source,
        breakdown: {
          modelagem: breakdownModelagem,
          renderizacao: breakdownRenderizacao,
          taxaRisco: breakdownTaxaRisco
        },
        specs: {
          metragem,
          empreendimento: tipoEmpreendimento,
          ambientesCount: envs.length,
          imagensEstaticas: imagens,
          segundosAnimacao: segundos,
          tourVirtual360: tour,
          prazoSLA
        }
      });

    } catch (error) {
      console.error('[Calculadora Controller] Erro no cálculo avançado:', error);
      return res.status(500).json({ success: false, error: `Erro interno ao calcular orçamento: ${error.message}` });
    }
  }
}

module.exports = new CalculadoraController();
