# CARD OFICIAL — Template Uiverse (ElSombrero2) | Malha3D

> **Este é o card OFICIAL do sistema.** Todo card novo deve seguir esta estrutura.
> Fonte: Uiverse.io by ElSombrero2 — adaptado para o ecossistema Malha3D.

---

## 1. ESTRUTURA HTML

```html
<div class="uv-flip-card">
  <div class="uv-flip-content">
    <!-- VERSO (visível por padrão — glow laranja animado) -->
    <div class="uv-flip-back">
      <div class="uv-flip-back-inner">
        <!-- Ícone ou imagem central -->
        <span class="material-symbols-outlined text-3xl text-white">icon</span>
        <strong class="text-[10px] text-white uppercase tracking-widest">Texto</strong>
      </div>
    </div>
    <!-- FRENTE (aparece no hover — conteúdo real) -->
    <div class="uv-flip-front">
      <!-- Background decorativo (circles animados) -->
      <div class="uv-flip-img">
        <div class="uv-circle"></div>
        <div class="uv-circle" id="uv-right"></div>
        <div class="uv-circle" id="uv-bottom"></div>
      </div>
      <!-- Conteúdo -->
      <div class="uv-flip-front-content">
        <small class="uv-flip-badge">Categoria</small>
        <div class="uv-flip-description">
          <div class="uv-flip-title">
            <p><strong>Título do Card</strong></p>
          </div>
          <p class="uv-flip-footer">Info 1 &nbsp;|&nbsp; Info 2</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 2. CSS COMPLETO

```css
/* === UIVERSE FLIP CARD (ElSombrero2) === */
.uv-flip-card {
  overflow: visible;
  width: 100%;
  height: 220px;
}
.uv-flip-content {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 300ms;
  box-shadow: 0px 0px 10px 1px #000000ee;
  border-radius: 5px;
  position: relative;
}
.uv-flip-back, .uv-flip-front {
  background-color: #151515;
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 5px;
  overflow: hidden;
}
.uv-flip-back {
  justify-content: center;
  display: flex;
  align-items: center;
}
.uv-flip-back::before {
  position: absolute;
  content: '';
  display: block;
  width: 160px;
  height: 160%;
  background: linear-gradient(90deg, transparent, #ff9966, #ff9966, #ff9966, #ff9966, transparent);
  animation: uv-flip-rotation 5000ms infinite linear;
}
.uv-flip-back-inner {
  position: absolute;
  width: 99%;
  height: 99%;
  background-color: #151515;
  border-radius: 5px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
.uv-flip-card:hover .uv-flip-content {
  transform: rotateY(180deg);
}
@keyframes uv-flip-rotation {
  0% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
}
.uv-flip-front {
  transform: rotateY(180deg);
  color: white;
}
.uv-flip-front-content {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.uv-flip-badge {
  background-color: rgba(0,0,0,0.35);
  padding: 2px 10px;
  border-radius: 10px;
  backdrop-filter: blur(2px);
  width: fit-content;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.uv-flip-description {
  box-shadow: 0px 0px 10px 5px rgba(0,0,0,0.5);
  width: 100%;
  padding: 10px;
  background-color: rgba(0,0,0,0.6);
  backdrop-filter: blur(5px);
  border-radius: 5px;
}
.uv-flip-title {
  font-size: 11px;
  max-width: 100%;
  display: flex;
  justify-content: space-between;
}
.uv-flip-footer {
  color: rgba(255,255,255,0.5);
  margin-top: 5px;
  font-size: 8px;
}
.uv-flip-img {
  position: absolute;
  width: 100%;
  height: 100%;
}
.uv-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-color: #ffbb66;
  position: relative;
  filter: blur(15px);
  animation: uv-floating 2600ms infinite linear;
}
#uv-bottom {
  background-color: #ff8866;
  left: 50px;
  top: 0px;
  width: 150px;
  height: 150px;
  animation-delay: -800ms;
}
#uv-right {
  background-color: #ff2233;
  left: 160px;
  top: -80px;
  width: 30px;
  height: 30px;
  animation-delay: -1800ms;
}
@keyframes uv-floating {
  0% { transform: translateY(0px); }
  50% { transform: translateY(10px); }
  100% { transform: translateY(0px); }
}

/* MODO CLARO */
body.theme-light .uv-flip-back,
body.theme-light .uv-flip-front { background-color: #ffffff; }
body.theme-light .uv-flip-back-inner { background-color: #ffffff; color: #0f172a; }
body.theme-light .uv-flip-content { box-shadow: 0 1px 6px rgba(15,23,42,0.1); }
body.theme-light .uv-flip-back::before { opacity: 0.3; }
body.theme-light .uv-flip-description { background-color: rgba(255,255,255,0.85); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
body.theme-light .uv-flip-title { color: #0f172a; }
body.theme-light .uv-flip-footer { color: #64748b; }
body.theme-light .uv-flip-badge { background-color: rgba(0,0,0,0.06); color: #334155; }
```

---

## 3. USO NO SISTEMA (Vendas / Projetos / CRM)

### Card de Projeto/Lead (Kanban):
```html
<div class="uv-flip-card">
  <div class="uv-flip-content">
    <div class="uv-flip-back">
      <div class="uv-flip-back-inner">
        <span class="material-symbols-outlined text-2xl">architecture</span>
        <strong class="text-[9px] uppercase tracking-widest">{{lead.name}}</strong>
        <span class="text-[8px] text-emerald-400 font-black">{{formatCurrency lead.estimatedValue}}</span>
      </div>
    </div>
    <div class="uv-flip-front">
      <div class="uv-flip-img">
        <div class="uv-circle"></div>
        <div class="uv-circle" id="uv-right"></div>
        <div class="uv-circle" id="uv-bottom"></div>
      </div>
      <div class="uv-flip-front-content">
        <small class="uv-flip-badge">{{lead.projectType}}</small>
        <div class="uv-flip-description">
          <div class="uv-flip-title">
            <p><strong>{{lead.name}}</strong></p>
          </div>
          <p class="uv-flip-footer">{{lead.clientName}} &nbsp;|&nbsp; {{formatCurrency lead.estimatedValue}}</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 4. REGRAS

1. **Border-radius:** sempre `5px` (nunca rounded-2xl)
2. **Background:** `#151515` dark / `#ffffff` light
3. **Glow:** gradiente laranja rotacional (`#ff9966`) no verso
4. **Circles:** 3 blobs animados no fundo da frente (laranja/vermelho)
5. **Flip:** hover rotaciona 180° no eixo Y
6. **Badge:** semi-transparente, 8px uppercase
7. **Footer:** 8px, cor muted
8. **Título:** 11px, bold, max-width 100%
