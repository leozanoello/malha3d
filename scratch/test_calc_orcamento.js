require('dotenv').config();
const express = require('express');
const router = require('../routes/api');

async function runTests() {
  // Mock req and res
  const makeRequest = (body) => {
    return new Promise((resolve) => {
      const req = { body };
      const res = {
        statusCode: 200,
        headers: {},
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          resolve({ status: this.statusCode, data });
        }
      };
      // Find the route in the router stack and invoke it
      const routeStack = router.stack.find(s => s.route && s.route.path === '/calcularOrcamentoAvancado');
      if (!routeStack) {
        resolve({ status: 404, data: { error: 'Route not found' } });
        return;
      }
      const handler = routeStack.route.stack[0].handle;
      handler(req, res, (err) => {
        if (err) resolve({ status: 500, data: { error: err.message } });
      });
    });
  };

  const testCases = [
    {
      name: 'Caso Base Simples (Revit, D5 Render, Sem Urgência, Arquiteto, Moderno)',
      body: {
        metragemTotal: 100, // 100 * 25 = 2500
        tipoCliente: 'Arquiteto',
        estiloPredominante: 'Moderno',
        formatoBase: 'BIM/Revit Limpo',
        qtdImagens: 4, // 4 * 350 = 1400
        segundosAnimacao: 10, // 10 * 120 = 1200
        softwareRender: 'D5 Render',
        rodadasAlteracao: 1, // 0 adicional
        prazoDias: 15 // Sem urgência
      },
      expectedTotal: 5100 // 2500 + 1400 + 1200 = 5100 base. Sem multiplicadores.
    },
    {
      name: 'Caso com Complexidade de Estilo e Base (Clássico, AutoCAD, D5, Sem Urgência, Interiores)',
      body: {
        metragemTotal: 80, // 80 * 25 = 2000
        tipoCliente: 'Interiores',
        estiloPredominante: 'Clássico/Neoclássico', // +30%
        formatoBase: 'AutoCAD 2D', // +40%
        qtdImagens: 2, // 2 * 350 = 700
        segundosAnimacao: 0, // 0
        softwareRender: 'D5 Render',
        rodadasAlteracao: 1, // 0
        prazoDias: 10 // Sem urgência
      },
      expectedTotal: 4590 // Base = 2700. Estilo(+30%) = 810. Base(+40%) = 1080. Total = 2700 + 810 + 1080 = 4590.
    },
    {
      name: 'Caso com Render Farm (3ds Max/Corona, Sketchup Sujo, 2 Rodadas Alteração)',
      body: {
        metragemTotal: 50, // 50 * 25 = 1250
        tipoCliente: 'Arquiteto',
        estiloPredominante: 'Minimalista',
        formatoBase: 'Sketchup Sujo', // +20%
        qtdImagens: 5, // 5 * 350 = 1750
        segundosAnimacao: 0,
        softwareRender: '3ds Max/Corona', // +5 * 150 = 750
        rodadasAlteracao: 2, // +250
        prazoDias: 8
      },
      // Base = 3000. Workflow(+20%) = 600. Render Farm = 750. SubtotalComp = 4350. Refacoes(+250) = 4600. Total = 4600.
      expectedTotal: 4600
    },
    {
      name: 'Caso Construtora de Luxo com Urgência Máxima',
      body: {
        metragemTotal: 200, // 200 * 25 = 5000
        tipoCliente: 'Construtora', // +15%
        estiloPredominante: 'Clássico/Neoclássico', // +30%
        formatoBase: 'Do Zero', // +40%
        qtdImagens: 10, // 10 * 350 = 3500
        segundosAnimacao: 30, // 30 * 120 = 3600
        softwareRender: '3ds Max/Corona', // +10 * 150 = 1500
        rodadasAlteracao: 3, // +500
        prazoDias: 4 // Urgência +35%
      },
      /*
        Base = 5000 + 3500 + 3600 = 12100.
        Estilo(+30%) = 3630.
        BaseRecebida(+40%) = 4840.
        RenderFarm = 1500.
        SubtotalComp = 12100 + 3630 + 4840 + 1500 = 22070.
        Refacoes(+500) = 22570.
        Taxa Construtora(+15%) = 22570 * 0.15 = 3385.5.
        SubtotalCliente = 22570 + 3385.5 = 25955.5.
        Taxa Urgencia(+35%) = 25955.5 * 0.35 = 9084.425.
        Total = 25955.5 + 9084.425 = 35039.925 => 35039.93.
      */
      expectedTotal: 35039.93
    }
  ];

  console.log('🧪 Iniciando testes de precificação avançada (Mock Routing)...');
  let passCount = 0;
  for (const tc of testCases) {
    const { status, data } = await makeRequest(tc.body);
    console.log(`\n🔹 Teste: ${tc.name}`);
    if (status === 200 && data.success) {
      console.log(`   Resultado: R$ ${data.valorTotalSugerido}`);
      console.log('   Breakdown:', JSON.stringify(data.breakdown, null, 2));
      if (tc.expectedTotal !== undefined) {
        const diff = Math.abs(data.valorTotalSugerido - tc.expectedTotal);
        if (diff < 0.01) {
          console.log('   ✅ PASSOU');
          passCount++;
        } else {
          console.error(`   ❌ FALHOU: Esperado R$ ${tc.expectedTotal}, Obtido R$ ${data.valorTotalSugerido}`);
        }
      }
    } else {
      console.error(`   ❌ FALHOU (API Error ${status}):`, data.error || data);
    }
  }

  console.log(`\n📈 Resumo: ${passCount}/${testCases.length} testes passaram.`);
  process.exit(passCount === testCases.length ? 0 : 1);
}

runTests();
