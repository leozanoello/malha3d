/* ═══════════════════════════════════════════════════════════════════════════
   CONTACT QUICK MODAL — Sistema de vinculação rápida de contatos
   - Cópia sincronizada do "Criar Contato" do menu Contatos
   - Permite criar novo contato OU vincular existente
   - Ao vincular/criar, o contato fica vinculado ao CRM/Projeto em edição
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // Estados brasileiros
  const ESTADOS_BRASIL = [
    { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
    { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
    { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
    { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
    { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
    { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' }
  ];

  // Cache de cidades por estado
  const CIDADES_CACHE = {};

  // ════════════════════════════════════════════════════════
  // ABRIR / FECHAR MODAL
  // ════════════════════════════════════════════════════════

  window.openContactQuickModal = function(context, callback) {
    // context = 'crm' ou 'projeto'
    window._contactModalContext = context;
    window._contactModalCallback = callback;

    const modal = document.getElementById('contactQuickModal');
    if (!modal) return;

    // Atualizar labels de contexto
    const ctxLabel = context === 'crm' ? 'CRM' : 'Projeto';
    const ctxLabelEl = document.getElementById('contactModalContextLabel');
    const ctxNewLabelEl = document.getElementById('contactCtxNewLabel');
    if (ctxLabelEl) ctxLabelEl.textContent = 'Vinculado ao ' + ctxLabel;
    if (ctxNewLabelEl) ctxNewLabelEl.textContent = ctxLabel;

    // Resetar formulário e aba
    window.switchContactTab('existing');
    const form = document.getElementById('contactQuickNewForm');
    if (form) form.reset();
    window.setCqPersonType('PF');

    // Carregar lista de contatos
    window.loadContactListForModal();

    // Popular select de estados
    window.populateCqStates();

    // Abrir modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  };

  window.closeContactQuickModal = function() {
    const modal = document.getElementById('contactQuickModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    window._contactModalContext = null;
    window._contactModalCallback = null;
  };

  // ════════════════════════════════════════════════════════
  // TABS
  // ════════════════════════════════════════════════════════

  window.switchContactTab = function(tab) {
    const tabExisting = document.getElementById('contactTabExisting');
    const tabNew = document.getElementById('contactTabNew');
    const contentExisting = document.getElementById('contactTabContentExisting');
    const contentNew = document.getElementById('contactTabContentNew');
    const submitBtn = document.getElementById('contactQuickSubmitBtn');
    const submitLabel = document.getElementById('contactQuickSubmitLabel');

    if (tab === 'existing') {
      tabExisting.className = 'flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-cyan-400 border-b-2 border-cyan-500 transition-all';
      tabNew.className = 'flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b-2 border-transparent hover:text-white transition-all';
      contentExisting.classList.remove('hidden');
      contentNew.classList.add('hidden');
      if (submitLabel) submitLabel.textContent = 'Vincular Contato';
    } else {
      tabNew.className = 'flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-cyan-400 border-b-2 border-cyan-500 transition-all';
      tabExisting.className = 'flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b-2 border-transparent hover:text-white transition-all';
      contentNew.classList.remove('hidden');
      contentExisting.classList.add('hidden');
      if (submitLabel) submitLabel.textContent = 'Criar e Vincular';
    }
  };

  // ════════════════════════════════════════════════════════
  // PESSOA (PF / PJ)
  // ════════════════════════════════════════════════════════

  window.setCqPersonType = function(type) {
    const btnPf = document.getElementById('cq-toggle-pf');
    const btnPj = document.getElementById('cq-toggle-pj');
    const inputType = document.getElementById('cq-type');
    const labelName = document.getElementById('cq-name-label');
    const labelDoc = document.getElementById('cq-document-label');
    const inputDoc = document.getElementById('cq-document');
    const inputName = document.getElementById('cq-name');
    const companyField = document.getElementById('cq-company-field');

    if (inputType) inputType.value = type;

    if (type === 'PF') {
      btnPf.className = 'flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-cyan-500 text-white transition-all';
      btnPj.className = 'flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all';
      if (labelName) labelName.textContent = 'Nome Completo';
      if (labelDoc) labelDoc.textContent = 'CPF';
      if (inputDoc) inputDoc.placeholder = '000.000.000-00';
      if (inputName) inputName.placeholder = 'Ex: Leonardo Zanoello';
      if (companyField) companyField.style.display = 'block';
    } else {
      btnPj.className = 'flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-cyan-500 text-white transition-all';
      btnPf.className = 'flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all';
      if (labelName) labelName.textContent = 'Razão Social';
      if (labelDoc) labelDoc.textContent = 'CNPJ';
      if (inputDoc) inputDoc.placeholder = '00.000.000/0000-00';
      if (inputName) inputName.placeholder = 'Ex: Construtora Horizonte Ltda';
      if (companyField) companyField.style.display = 'none';
    }
  };

  // ════════════════════════════════════════════════════════
  // ESTADOS E CIDADES (IBGE)
  // ════════════════════════════════════════════════════════

  window.populateCqStates = function() {
    const select = document.getElementById('cq-state');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione o Estado...</option>' +
      ESTADOS_BRASIL.map(e => '<option value="' + e.uf + '">' + e.uf + ' - ' + e.nome + '</option>').join('');
    select.onchange = window.loadCqCities;
  };

  window.loadCqCities = async function() {
    const stateEl = document.getElementById('cq-state');
    const cityEl = document.getElementById('cq-city');
    if (!stateEl || !cityEl) return;

    const uf = stateEl.value;
    if (!uf) {
      cityEl.innerHTML = '<option value="">Selecione o Estado...</option>';
      cityEl.disabled = true;
      return;
    }

    if (CIDADES_CACHE[uf]) {
      window._renderCqCities(CIDADES_CACHE[uf]);
      return;
    }

    cityEl.innerHTML = '<option value="">Carregando...</option>';
    cityEl.disabled = true;

    try {
      const res = await fetch('https://servicodosdados.com.br/api/v1/localidades/estados/' + uf + '/municipios');
      const cidades = await res.json();
      CIDADES_CACHE[uf] = cidades;
      window._renderCqCities(cidades);
    } catch (err) {
      // Fallback: IBGE oficial
      try {
        const res = await fetch('https://servicodosdados.com.br/api/v1/localidades/estados/' + uf + '/municipios');
        const cidades = await res.json();
        CIDADES_CACHE[uf] = cidades;
        window._renderCqCities(cidades);
      } catch (e) {
        cityEl.innerHTML = '<option value="">Erro ao carregar</option>';
      }
    }
  };

  window._renderCqCities = function(cidades) {
    const cityEl = document.getElementById('cq-city');
    if (!cityEl) return;
    cityEl.innerHTML = '<option value="">Selecione a Cidade...</option>' +
      cidades.map(c => '<option value="' + (c.nome || c.name) + '">' + (c.nome || c.name) + '</option>').join('');
    cityEl.disabled = false;
  };

  // ════════════════════════════════════════════════════════
  // LISTA DE CONTATOS EXISTENTES
  // ════════════════════════════════════════════════════════

  let _contactListCache = [];

  window.loadContactListForModal = async function() {
    const container = document.getElementById('contactListContainer');
    if (!container) return;

    container.innerHTML = '<p class="text-[9px] text-gray-500 text-center py-6">Carregando contatos...</p>';

    try {
      const res = await fetch('/admin/api/contacts/list');
      const json = await res.json();
      if (json.success && Array.isArray(json.contacts)) {
        _contactListCache = json.contacts;
        window.renderContactList(json.contacts);
      } else {
        container.innerHTML = '<p class="text-[9px] text-red-400 text-center py-6">Erro ao carregar contatos</p>';
      }
    } catch (err) {
      // Fallback: tentar endpoint alternativo
      try {
        const res2 = await fetch('/admin/contatos/api/list');
        const json2 = await res2.json();
        if (json2.success && Array.isArray(json2.contacts)) {
          _contactListCache = json2.contacts;
          window.renderContactList(json2.contacts);
        } else {
          container.innerHTML = '<p class="text-[9px] text-red-400 text-center py-6">Erro de rede</p>';
        }
      } catch (e) {
        container.innerHTML = '<p class="text-[9px] text-red-400 text-center py-6">Falha ao carregar</p>';
      }
    }
  };

  window.renderContactList = function(contacts) {
    const container = document.getElementById('contactListContainer');
    if (!container) return;

    if (!contacts || contacts.length === 0) {
      container.innerHTML = '<p class="text-[9px] text-gray-500 text-center py-6">Nenhum contato cadastrado. Use a aba "Criar Novo".</p>';
      return;
    }

    container.innerHTML = contacts.map(c => {
      const initials = (c.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      const color = c.type === 'PJ' ? '6d28d9' : '0891b2';
      return '<div onclick="window.selectContactFromModal(' + c.id + ')" class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 cursor-pointer transition-all">' +
        '<div class="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-black text-cyan-400 shrink-0">' + initials + '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<p class="text-xs font-bold text-white truncate">' + (c.name || 'Sem nome') + '</p>' +
          '<p class="text-[9px] text-gray-500 truncate">' + (c.email || 'Sem e-mail') + (c.phone ? ' • ' + c.phone : '') + '</p>' +
        '</div>' +
        '<span class="text-[8px] font-black text-cyan-400 uppercase tracking-widest">' + (c.type || 'PF') + '</span>' +
      '</div>';
    }).join('');
  };

  window.filterContactList = function() {
    const q = (document.getElementById('contactSearchInput')?.value || '').toLowerCase();
    if (!q) {
      window.renderContactList(_contactListCache);
      return;
    }
    const filtered = _contactListCache.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    );
    window.renderContactList(filtered);
  };

  window.selectContactFromModal = function(contactId) {
    const contact = _contactListCache.find(c => c.id === contactId);
    if (!contact) return;

    if (window.showToast) window.showToast('✓ Contato vinculado: ' + contact.name, 'success');
    else alert('Contato vinculado: ' + contact.name);

    if (typeof window._contactModalCallback === 'function') {
      window._contactModalCallback(contact);
    }

    window.closeContactQuickModal();
  };

  // ════════════════════════════════════════════════════════
  // SUBMIT (VINCULAR EXISTENTE OU CRIAR NOVO)
  // ════════════════════════════════════════════════════════

  window.submitContactQuickModal = async function() {
    const activeTab = document.getElementById('contactTabContentExisting').classList.contains('hidden') ? 'new' : 'existing';

    if (activeTab === 'existing') {
      // Verificar se um contato foi selecionado (via clique)
      if (window.lastSelectedContactId) {
        window.selectContactFromModal(window.lastSelectedContactId);
      } else {
        if (window.showToast) window.showToast('Selecione um contato na lista', 'info');
        else alert('Selecione um contato na lista');
      }
      return;
    }

    // Criar novo contato
    const form = document.getElementById('contactQuickNewForm');
    if (!form) return;

    const data = {
      name: form.querySelector('#cq-name').value.trim(),
      document: form.querySelector('#cq-document').value.trim(),
      type: form.querySelector('#cq-type').value,
      category: form.querySelector('#cq-category').value,
      jobTitle: form.querySelector('#cq-jobTitle').value.trim(),
      email: form.querySelector('#cq-email').value.trim(),
      phone: form.querySelector('#cq-phone').value.trim(),
      company: form.querySelector('#cq-company').value.trim(),
      state: form.querySelector('#cq-state').value,
      city: form.querySelector('#cq-city').value,
      notes: form.querySelector('#cq-notes').value.trim(),
      autoLink: true,
      linkContext: window._contactModalContext
    };

    // Validação
    if (!data.name || !data.document || !data.email) {
      if (window.showToast) window.showToast('Preencha os campos obrigatórios', 'error');
      else alert('Preencha os campos obrigatórios');
      return;
    }

    const btn = document.getElementById('contactQuickSubmitBtn');
    if (btn) btn.disabled = true;

    try {
      const res = await fetch('/admin/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (json.success && json.contact) {
        if (window.showToast) window.showToast('✓ Contato criado e vinculado: ' + json.contact.name, 'success');
        else alert('Contato criado: ' + json.contact.name);

        if (typeof window._contactModalCallback === 'function') {
          window._contactModalCallback(json.contact);
        }

        window.closeContactQuickModal();
      } else {
        if (window.showToast) window.showToast('Erro: ' + (json.error || 'Falha ao criar'), 'error');
        else alert('Erro: ' + (json.error || 'Desconhecido'));
      }
    } catch (err) {
      if (window.showToast) window.showToast('Erro de rede ao criar contato', 'error');
      else alert('Erro de rede');
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  // Fechar com ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('contactQuickModal');
      if (modal && !modal.classList.contains('hidden')) {
        window.closeContactQuickModal();
      }
    }
  });

})();
