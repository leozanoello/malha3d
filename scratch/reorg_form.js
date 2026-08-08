const fs = require('fs');
let content = fs.readFileSync('views/admin/crm.hbs', 'utf8');

const formStart = content.indexOf('<form id="editLeadForm"');
const formEnd = content.indexOf('</form>', formStart) + '</form>'.length;

const newForm = `     <form id="editLeadForm" action="" method="POST" class="modal-pane space-y-4 text-sm" data-pane-id="modal-tab-details">
 <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <!-- COLUNA 1 -->
 <div class="space-y-3">
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Nome do Lead/Projeto</label>
 <input type="text" id="editName" name="name" required class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>

 <!-- CARD CONTATO -->
 <div class="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
 <div class="flex items-center justify-between mb-1">
 <h5 class="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
 <span class="material-symbols-outlined text-xs">contact_page</span> Contato
 </h5>
 <button type="button" id="btn-save-contact" onclick="window.saveLeadContact()" class="text-[7px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-1">
 <span class="material-symbols-outlined text-[10px]">person_add</span> Salvar Contato
 </button>
 </div>
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Nome do Contato</label>
 <input type="text" id="editClientName" name="clientName" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>
 <div class="grid grid-cols-2 gap-2">
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Email</label>
 <input type="email" id="editEmail" name="email" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Telefone</label>
 <input type="text" id="editPhone" name="phone" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>
 </div>
 <div class="grid grid-cols-2 gap-2">
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Estado</label>
 <select id="editLeadState" name="state" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all appearance-none">
 <option value="">Selecione...</option>
 </select>
 </div>
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Cidade</label>
 <select id="editLeadCity" name="city" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all appearance-none" disabled>
 <option value="">Selecione o Estado...</option>
 </select>
 </div>
 </div>
 </div>

 <!-- CARD COMERCIAL & ACOMPANHAMENTO -->
 <div class="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
 <h5 class="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
 <span class="material-symbols-outlined text-xs">insights</span> Comercial &amp; Acompanhamento
 </h5>
 <div>
 <div class="flex items-center justify-between mb-1">
 <label class="block text-[8px] text-gray-400 font-bold uppercase">Probabilidade de Fechamento</label>
 <span id="editProbabilityValue" class="text-[10px] font-black text-orange-400">50%</span>
 </div>
 <input type="range" id="editProbability" name="probability" min="0" max="100" step="5" oninput="document.getElementById('editProbabilityValue').textContent = this.value + '%'" class="w-full accent-orange-500">
 </div>
 <div class="grid grid-cols-2 gap-2">
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Prioridade</label>
 <select id="editPriority" name="priority" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all appearance-none">
 <option value="baixa" class="bg-gray-900">Baixa</option>
 <option value="media" class="bg-gray-900">Média</option>
 <option value="alta" class="bg-gray-900">Alta</option>
 </select>
 </div>
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Responsável</label>
 <select id="editAssignedUserId" name="assignedUserId" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all appearance-none">
 <option value="">Selecione...</option>
 {{#each users}}
 <option value="{{this.id}}" class="bg-gray-900">{{this.name}}</option>
 {{/each}}
 </select>
 </div>
 </div>
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Etapa (Kanban)</label>
 <select id="editStatus" name="status" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all appearance-none">
 {{#each columns}}
 <option value="{{this.statusKey}}" class="bg-gray-900">{{this.title}}</option>
 {{/each}}
 </select>
 </div>
 </div>

 <!-- VALOR + METRAGEM -->
 <div class="grid grid-cols-2 gap-2">
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Valor Estimado (R$)</label>
 <input type="number" step="0.01" id="editEstimatedValue" name="estimatedValue" class="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-400 font-black focus:border-emerald-500 focus:outline-none transition-all">
 </div>
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Metragem (m²)</label>
 <input type="number" step="0.01" id="editTotalArea" name="totalArea" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>
 </div>

 <!-- BUDGET CLIENTE -->
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Budget do Cliente (R$)</label>
 <input type="number" step="0.01" id="editClientBudget" name="clientBudget" class="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-400 font-black focus:border-emerald-500 focus:outline-none transition-all">
 </div>

 <!-- DESCRIÇÃO -->
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Breve Descrição do Projeto</label>
 <textarea id="editDescription" name="description" rows="2" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all"></textarea>
 </div>

 <!-- SOFTWARE ALVO -->
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Software Alvo</label>
 <select id="editTargetSoftware" name="targetSoftware" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all appearance-none">
 <option value="D5 Render" class="bg-gray-900">D5 Render</option>
 <option value="Corona" class="bg-gray-900">Corona Renderer</option>
 <option value="V-Ray" class="bg-gray-900">V-Ray</option>
 </select>
 </div>

 <!-- FORMATO DE ARQUIVO -->
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Formato de Arquivo</label>
 <input type="text" id="editVisualStyle" name="visualStyle" placeholder="Ex: SketchUp, DWG, PDF" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>
 </div>

 <!-- COLUNA 2 -->
 <div class="space-y-3">
 <div class="grid grid-cols-2 gap-2">
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Tipologia</label>
 <select id="editProjectType" name="projectType" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all appearance-none">
 <option value="Interiores" class="bg-gray-900">Interiores</option>
 <option value="Arquitetônico" class="bg-gray-900">Arquitetônico</option>
 <option value="Comercial" class="bg-gray-900">Comercial</option>
 <option value="Outro" class="bg-gray-900">Outro</option>
 </select>
 </div>
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Cor de Destaque</label>
 <div class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
 <input type="color" id="editColor" name="color" class="w-5 h-5 rounded cursor-pointer bg-transparent border-0">
 <span class="text-[10px] text-gray-400">Card Color</span>
 </div>
 </div>
 </div>

 <!-- ENTREGÁVEIS -->
 <div class="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
 <h5 class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
 <span class="material-symbols-outlined text-xs">inventory_2</span> Entregáveis
 </h5>
 <div class="grid grid-cols-3 gap-2">
 <div>
 <label class="block text-[7px] text-gray-400 font-bold uppercase mb-1 text-center">Imagens</label>
 <input type="number" id="editImagesCount" name="imagesCount" min="0" class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-center text-white focus:border-orange-500 focus:outline-none">
 </div>
 <div>
 <label class="block text-[7px] text-gray-400 font-bold uppercase mb-1 text-center">Animação (s)</label>
 <input type="number" id="editAnimationSeconds" name="animationSeconds" min="0" class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-center text-white focus:border-orange-500 focus:outline-none">
 </div>
 <div>
 <label class="block text-[7px] text-gray-400 font-bold uppercase mb-1 text-center">Plantas Hum.</label>
 <input type="number" id="editFloorPlansCount" name="floorPlansCount" min="0" class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-center text-white focus:border-orange-500 focus:outline-none">
 </div>
 </div>
 </div>

 <!-- PRAZOS -->
 <div class="grid grid-cols-2 gap-2">
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Prazo (Dias)</label>
 <input type="number" id="editProductionDays" name="productionDays" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Deadline (Data)</label>
 <input type="date" id="editDeadline" name="deadline" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>
 </div>

 <!-- REVISÕES -->
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Revisões Inclusas</label>
 <input type="number" id="editRevisionsIncluded" name="revisionsIncluded" min="0" max="10" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>

 <!-- LINK DRIVE -->
 <div>
 <label class="block text-[8px] text-gray-400 font-bold uppercase mb-1">Link Drive/Moodboard</label>
 <input type="url" id="editDriveLink" name="driveLink" placeholder="https://" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none transition-all">
 </div>
 </div>
 </div>

 <div id="edit-actions" class="pt-3 flex gap-2 hidden">
 <button type="button" id="btn-cancel-edit" class="flex-1 py-2.5 rounded-lg bg-white/5 text-white font-black text-[9px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
 Cancelar
 </button>
 <button type="submit" class="flex-[2] py-2.5 rounded-lg bg-orange-500 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5">
 <span class="material-symbols-outlined text-xs">save</span> Salvar Alterações
 </button>
 </div>
 </form>`;

content = content.substring(0, formStart) + newForm + content.substring(formEnd);
fs.writeFileSync('views/admin/crm.hbs', content);
console.log('✓ Formulário reorganizado. formStart=' + formStart + ' formEnd=' + formEnd);
