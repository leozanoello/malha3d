const { Setting } = require('../models');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Curated ArchViz stock renders used as an instant fallback banner whenever no
// image-generation API key is configured, or the AI call fails.
// Usa Picsum (lorem picsum) com baixíssima resolução para servir imagens
// realmente aleatórias que mudam a cada chamada — não a mesma imagem para
// todos os cards. O parâmetro ?random=N garante aleatoriedade total.
function buildRandomArchVizBanner() {
  const randomId = Math.floor(Math.random() * 1000);
  // Resolução baixíssima (64x64) mas com qualidade visual aceitável via blur
  // CSS no front-end. Picsum entrega uma imagem JPEG bem leve (~5KB).
  return `https://picsum.photos/seed/archviz${randomId}/64/64.jpg?blur=1&random=${Date.now()}`;
}
function pickRandomArchVizBanner() {
  // Pega URL aleatória da Picsum — cada lead recebe uma imagem ÚNICA e diferente.
  return buildRandomArchVizBanner();
}

/**
 * AI Service for ArchViz Subjectivity & Risk Analysis
 */
class AIService {
  /**
   * Deterministically picks a fallback banner for a lead (stable across reloads).
   * @param {string} seed Any stable identifier (usually the lead id)
   */
  pickFallbackBanner(seed) {
    // Sempre aleatório: cada chamada gera uma nova imagem única via Picsum
    return pickRandomArchVizBanner();
  }

  /**
   * Generates an AI architecture visualization banner for a CRM lead/card.
   * Tries OpenAI's image generation API (DALL-E 3) using the same
   * Settings-table-or-env credential lookup as analyzeBriefingComplexity.
   * Falls back to a curated stock ArchViz render when no key is configured
   * or the request fails, so the card always ends up with a real image.
   * @param {object} lead Plain lead/budget object (id, projectType, visualStyle, etc.)
   * @returns {Promise<{ imageUrl: string, source: 'ai' | 'fallback' }>}
   */
  async generateArchVizImage(lead) {
    try {
      const openAiKeySetting = await Setting.findOne({ where: { key: 'openai_api_key' } });
      const openAiKey = openAiKeySetting?.value || process.env.OPENAI_API_KEY;

      if (openAiKey && openAiKey.trim() !== '') {
        const styleParts = [
          lead.projectCategory,
          lead.projectType,
          lead.predominantStyle || lead.visualStyle,
          lead.desiredAtmosphere
        ].filter(Boolean).join(', ');

        const prompt = `Professional architecture visualization (ArchViz) render, photorealistic, ` +
          `${styleParts || 'contemporary residential building'}, golden hour lighting, ` +
          `high-end real estate marketing photo, ultra detailed, 8k, no text, no watermark, no people.`;

        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey.trim()}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'url'
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const remoteUrl = resData.data?.[0]?.url;
          if (remoteUrl) {
            const imageRes = await fetch(remoteUrl);
            if (imageRes.ok) {
              const buffer = Buffer.from(await imageRes.arrayBuffer());
              const dir = path.join(__dirname, '..', 'public', 'uploads', 'leads');
              fs.mkdirSync(dir, { recursive: true });
              const filename = `${lead.id}-${Date.now()}.webp`;
              // Comprimir com Sharp para WebP (max 1200px, 75% quality)
              try {
                const sharp = require('sharp');
                await sharp(buffer)
                  .resize({ width: 1200, withoutEnlargement: true })
                  .webp({ quality: 75 })
                  .toFile(path.join(dir, filename));
              } catch (sharpErr) {
                fs.writeFileSync(path.join(dir, filename.replace('.webp', '.png')), buffer);
                return { imageUrl: `/uploads/leads/${filename.replace('.webp', '.png')}`, source: 'ai' };
              }
              return { imageUrl: `/uploads/leads/${filename}`, source: 'ai' };
            }
          }
        } else {
          const errBody = await response.text().catch(() => '');
          console.error('[AI Service] OpenAI image generation failed:', response.status, errBody);
        }
      }
    } catch (error) {
      console.error('[AI Service] Erro ao gerar imagem ArchViz, ativando fallback:', error.message);
    }

    return { imageUrl: this.pickFallbackBanner(lead.id), source: 'fallback' };
  }

  /**
   * Reads a receipt/invoice photo and extracts structured transaction data
   * using OpenAI's vision-capable chat completions endpoint (gpt-4o-mini).
   * @param {string} imagePath Absolute path to the uploaded image on disk
   * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
   */
  async extractReceiptData(imagePath) {
    const openAiKeySetting = await Setting.findOne({ where: { key: 'openai_api_key' } });
    const openAiKey = openAiKeySetting?.value || process.env.OPENAI_API_KEY;

    if (!openAiKey || openAiKey.trim() === '') {
      return {
        success: false,
        message: 'Nenhuma chave de API de IA configurada. Adicione uma chave OpenAI em Configurações para usar o upload inteligente.'
      };
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).replace('.', '') || 'jpeg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const base64Image = imageBuffer.toString('base64');

    const prompt = `Você é um assistente financeiro. Analise a imagem de um comprovante, recibo, nota fiscal ou print de pagamento e extraia as informações da transação.

Retorne APENAS um objeto JSON no formato abaixo, sem blocos de código markdown ou texto extra:
{
  "description": "Nome do estabelecimento ou descrição curta da transação",
  "amount": 123.45,
  "type": "despesa ou receita",
  "paymentMethod": "pix, boleto, cartao, ted ou dinheiro (o que mais se aproximar do comprovante)",
  "date": "YYYY-MM-DD se identificável, senão null"
}

Se não conseguir identificar algum campo com confiança, use null para ele (exceto "type", que deve ser sempre "despesa" ou "receita", assumindo "despesa" em caso de dúvida).`;

    try {
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
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
              ]
            }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        console.error('[AI Service] Receipt extraction failed:', response.status, errBody);
        return { success: false, message: 'Não foi possível analisar a imagem. Tente novamente ou preencha manualmente.' };
      }

      const resData = await response.json();
      const content = resData.choices?.[0]?.message?.content;
      if (!content) {
        return { success: false, message: 'A IA não retornou dados legíveis para essa imagem.' };
      }

      const parsed = JSON.parse(content.trim());
      return {
        success: true,
        data: {
          description: parsed.description || null,
          amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || null,
          type: parsed.type === 'receita' ? 'receita' : 'despesa',
          paymentMethod: parsed.paymentMethod || null,
          date: parsed.date || null
        }
      };
    } catch (error) {
      console.error('[AI Service] Erro ao extrair dados do comprovante:', error.message);
      return { success: false, message: 'Erro de conexão ao analisar a imagem.' };
    }
  }

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
