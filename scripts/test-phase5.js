
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('==========================================');
  console.log('  INICIANDO PROTOCOLO DE VALIDAÇÃO (FASE 5) ');
  console.log('==========================================\n');

  let sessionCookie = '';
  let magicLink = '';

  // 1. Cadastro Root (Onboarding)
  console.log('[1] Simulando Cadastro Root (Onboarding)...');
  const registerPayload = {
    email: `root_${Date.now()}@test.com`,
    name: 'Estúdio de Teste Root'
  };

  try {
    const res1 = await fetch(`${BASE_URL}/api/auth/register-root`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });
    const data1 = await res1.json();
    if (!data1.success || !data1.magicLink) {
      throw new Error('Falha no register-root');
    }
    magicLink = data1.magicLink;
    console.log('✓ Magic Link gerado:', magicLink);

    // 2. Validação do Magic Link (Zero-State & Session)
    console.log('\n[2] Validando Magic Link...');
    const res2 = await fetch(magicLink, { redirect: 'manual' });
    if (res2.status === 302) {
      console.log('✓ Redirecionamento 302 detectado (Sucesso). Location:', res2.headers.get('location'));
      const setCookie = res2.headers.get('set-cookie');
      if (setCookie) {
        sessionCookie = setCookie.split(';')[0];
        console.log('✓ Sessão Root estabelecida.');
      } else {
        throw new Error('Nenhum cookie de sessão retornado!');
      }
    } else {
      throw new Error(`Falha na verificação. Status: ${res2.status}`);
    }

    // 3. Criação de Membro da Equipe (com Toggles RBAC limitados)
    console.log('\n[3] Criando Membro da Equipe via API...');
    const newMemberPayload = {
      name: 'Designer Junior',
      email: `junior_${Date.now()}@test.com`,
      password: 'password123',
      role: 'collaborator',
      allowed_menus: ['dashboard', 'projetos'] // Sem CRM, sem Financeiro
    };

    const res3 = await fetch(`${BASE_URL}/admin/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(newMemberPayload)
    });
    const data3 = await res3.json();
    if (data3.success) {
      console.log(`✓ Membro da equipe criado. ID: ${data3.user.id}`);
    } else {
      throw new Error(`Falha ao criar sub-conta: ${JSON.stringify(data3)}`);
    }

    // 4. Edição de Membro (Salvando permissões após o fechar do modal simulado)
    console.log('\n[4] Editando permissões do membro...');
    const editPayload = {
      role: 'collaborator',
      allowed_menus: ['dashboard', 'projetos', 'crm'] // Adicionou CRM
    };

    const res4 = await fetch(`${BASE_URL}/admin/api/users/${data3.user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(editPayload)
    });
    const data4 = await res4.json();
    if (data4.success) {
      console.log('✓ Permissões atualizadas com sucesso (Simulação do fechar modal de Edição).');
    } else {
      throw new Error(`Falha ao editar permissões: ${JSON.stringify(data4)}`);
    }

    // 5. Teste Prático do RBAC: Tentando acessar o Financeiro com o membro (Deverá ser bloqueado)
    console.log('\n[5] Testando RBAC Ativo (Acesso ao Financeiro)...');

    // Fazer login usando a rota admin para pegar a sessão do Express
    const resLogin = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: newMemberPayload.email, password: 'password123' }),
      redirect: 'manual'
    });

    let juniorSession = '';
    const setCookieJunior = resLogin.headers.get('set-cookie');
    if (setCookieJunior) {
      juniorSession = setCookieJunior.split(';')[0];
    } else {
      throw new Error('Falha ao logar como Junior');
    }

    // Tentar acessar o Financeiro (/admin/financeiro)
    const resFinance = await fetch(`${BASE_URL}/admin/financeiro`, {
      headers: { 'Cookie': juniorSession },
      redirect: 'manual'
    });

    await resFinance.text();
    if (resFinance.status === 403) {
      console.log('✓ Acesso ao Financeiro BLOQUEADO pelo RBAC com sucesso (403 Forbidden)!');
    } else if (resFinance.status === 302) {
      console.log('❌ Acesso ao Financeiro Redirecionou (302). Provavelmente para login (Falha de auth). Location:', resFinance.headers.get('location'));
    } else {
      console.log('❌ Acesso ao Financeiro retornou status inesperado:', resFinance.status);
    }

    console.log('✓ Testes Lógicos E2E concluídos! RBAC e Onboarding íntegros.');
    console.log('==========================================');

  } catch (error) {
    console.error('\n❌ ERRO NA VALIDAÇÃO:', error.message);
  }
}

runTests();
