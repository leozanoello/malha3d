const { Setting } = require('../models');

/**
 * AI Service for ArchViz Subjectivity & Risk Analysis
 */
class AIService {
  /**
   * Analyzes an ArchViz project briefing and environment list to return a risk multiplier
   * @param {string} briefing Textual description of the project
   * @param {Array<string>} environments List of selected environments
   * @returns {Promise<{ multiplier: number, rationale: string, source: 'ai' | 'heuristic' }>}
   */
  async analyzeBriefingComplexity(briefing, environments = []) {
    const cleanBriefing = (briefing || '').trim();
    const envsList = Array.isArray(environments) ? environments : [];

    try {
      // 1. Fetch AI credentials from the Settings table or process environment
      const [geminiKeySetting, openAiKeySetting] = await Promise.all([
        Setting.findOne({ where: { key: 'gemini_api_key' } }),
        Setting.findOne({ where: { key: 'openai_api_key' } })
      ]);

      const geminiKey = geminiKeySetting?.value || process.env.GEMINI_API_KEY;
      const openAiKey = openAiKeySetting?.value || process.env.OPENAI_API_KEY;

      const prompt = `Você é um Diretor de Arte Sênior de um estúdio Tier-1 de ArchViz.
Analise a complexidade deste briefing de projeto arquitetônico e a lista de ambientes fornecidos para calcular o "Multiplicador de Risco e Esforço Artístico".

Ambientes do Projeto: ${envsList.join(', ') || 'Nenhum ambiente especificado'}
Briefing do Cliente: "${cleanBriefing || 'Nenhum briefing adicional fornecido'}"

Determine um multiplicador de risco entre 1.0 (arquitetura padrão, blocagem simples, esforço mínimo) e 2.0 (geometria paramétrica de altíssima complexidade, vegetação densa/customizada, design orgânico ou briefing altamente detalhado/subjetivo).

Retorne APENAS um objeto JSON no formato abaixo, sem blocos de código markdown ou texto extra:
{
  "multiplier": 1.25,
  "rationale": "Breve justificativa técnica em português explicando o motivo do multiplicador com base no briefing e ambientes."
}`;

      // 2. Try Gemini API first (most cost-effective and powerful for text analysis)
      if (geminiKey && geminiKey.trim() !== '') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const jsonText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText.trim());
            if (parsed && typeof parsed.multiplier === 'number') {
              return {
                multiplier: Math.max(1.0, Math.min(2.0, parseFloat(parsed.multiplier))),
                rationale: parsed.rationale || 'Análise de briefing processada por inteligência artificial.',
                source: 'ai'
              };
            }
          }
        }
      }

      // 3. Fallback to OpenAI API if configured
      if (openAiKey && openAiKey.trim() !== '') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey.trim()}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'user', content: prompt }
            ],
            temperature: 0.2
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const content = resData.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content.trim());
            if (parsed && typeof parsed.multiplier === 'number') {
              return {
                multiplier: Math.max(1.0, Math.min(2.0, parseFloat(parsed.multiplier))),
                rationale: parsed.rationale || 'Análise de briefing processada por inteligência artificial.',
                source: 'ai'
              };
            }
          }
        }
      }
    } catch (error) {
      console.error('[AI Service] Erro ao consultar LLM externo, ativando fallback heurístico:', error.message);
    }

    // 4. Advanced Heuristic Rule-Based Fallback
    return this.runHeuristicAnalysis(cleanBriefing, envsList);
  }

  /**
   * Run a local rule-based heuristic token analysis to estimate risk multiplier
   * @param {string} briefing
   * @param {Array<string>} envs
   * @returns {{ multiplier: number, rationale: string, source: 'heuristic' }}
   */
  runHeuristicAnalysis(briefing, envs) {
    const text = (`${briefing} ${envs.join(' ')}`).toLowerCase();
    let multiplier = 1.0;
    const reasons = [];

    // Category 1: High organic and parametric design features (+0.10 to +0.20)
    const highComplexity = [
      { keys: ['paramétrico', 'parametric', 'generativo', 'generative'], val: 0.20, label: 'formas paramétricas' },
      { keys: ['orgânico', 'organico', 'organic', 'curvas', 'fluido', 'fluida'], val: 0.15, label: 'geometria orgânica fluida' },
      { keys: ['amazônica', 'amazonica', 'vegetação densa', 'vegetacao densa', 'jardim vertical', 'paisagismo complexo'], val: 0.12, label: 'biofilia/vegetação de alta densidade' },
      { keys: ['alto padrão', 'alto padrao', 'altíssimo padrão', 'altissimo padrao', 'luxo', 'luxury', 'high-end', 'premium'], val: 0.10, label: 'padrão de acabamento high-end' }
    ];

    // Category 2: Medium complex elements (+0.05 to +0.08)
    const mediumComplexity = [
      { keys: ['customizado', 'sob medida', 'marcenaria complexa', 'teto de madeira', 'painel de ripas', 'ripado'], val: 0.08, label: 'detalhamento de marcenaria' },
      { keys: ['iluminação', 'iluminacao', 'lighting', 'cenografia', 'estande', 'exposição'], val: 0.06, label: 'esquema de iluminação cenográfica' },
      { keys: ['clássico', 'classico', 'neoclássico', 'neoclassico', 'industrial', 'rústico', 'rustico'], val: 0.05, label: 'estilo arquitetônico detalhado' }
    ];

    // Evaluate high complexity
    highComplexity.forEach(item => {
      if (item.keys.some(k => text.includes(k))) {
        multiplier += item.val;
        reasons.push(item.label);
      }
    });

    // Evaluate medium complexity
    mediumComplexity.forEach(item => {
      if (item.keys.some(k => text.includes(k))) {
        multiplier += item.val;
        reasons.push(item.label);
      }
    });

    // Environment counts factor (more than 10 environments adds overhead)
    if (envs.length > 10) {
      multiplier += 0.10;
      reasons.push('escala do escopo (+10 ambientes)');
    } else if (envs.length > 5) {
      multiplier += 0.05;
      reasons.push('escala do escopo (múltiplos ambientes)');
    }

    // Cap the heuristic multiplier at 1.6
    multiplier = parseFloat(Math.min(1.6, multiplier).toFixed(2));

    let rationale = 'Briefing padrão. Estimativa baseada no escopo básico.';
    if (reasons.length > 0) {
      rationale = `Complexidade ajustada em +${Math.round((multiplier - 1) * 100)}% devido a: ${reasons.slice(0, 3).join(', ')}.`;
    }

    return {
      multiplier,
      rationale,
      source: 'heuristic'
    };
  }
}

module.exports = new AIService();
