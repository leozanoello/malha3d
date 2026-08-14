# Portal do Cliente — Conexões Removidas (Versão 2.0)

## Motivação
O Portal do Cliente foi movido para a Versão 2.0 (desenvolvimento futuro).
Para evitar crashes e bugs, as conexões diretas foram desativadas.

## O que existia no menu principal:
```html
<a href="/admin/portal-cliente" class="...">
  <span class="material-symbols-outlined text-lg">badge</span> Portal do Cliente
</a>
```
**Localização:** `views/layouts/admin.hbs` — Group 2 (Projetos), entre "Projetos" e "Financeiro"

## Rota original (backend):
```javascript
router.get('/portal-cliente', requireAuth, async (req, res) => {
  const clients = await Client.findAll(...);
  const cpSettingsRaw = await Setting.findAll({ where: { group: 'portal_cliente' } });
  // ... defaults, render 'admin/client-portal'
});
```

## Settings associados (tabela Settings, group='portal_cliente'):
- `cp_domain`: 'portal.zanoello3d.com'
- `cp_expiry`: 'never'
- `cp_watermark`: 'true'
- `cp_wm_text`: 'ZANOELLO 3D - PREVIEW'
- `cp_wm_opacity`: '30'
- `cp_wm_pos`: 'diagonal'
- `cp_require_sig`: 'true'
- `cp_allow_4k`: 'true'
- `cp_color_accent`: '#ff6f00'
- `cp_color_bg`: '#030712'

## API endpoints mantidos (mas inacessíveis pelo menu):
- `POST /admin/api/portal/settings` — salvar configurações
- As views `views/admin/client-portal.hbs` e `views/client/portal-view.hbs` continuam existindo

## Como restaurar (para lançamento da Versão 2.0):
1. Mover o item de menu de "Versão 2.0" de volta para o Group 2
2. Restaurar a rota original (remover o render de v2-preview)
3. Remover `style="opacity:0.5"` do link
4. Testar Settings e render

## Data: 2026-08-13
## Status: ADIADO para Versão 2.0
