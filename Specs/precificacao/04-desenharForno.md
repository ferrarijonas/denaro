# Desenhar forno (`desenharForno`)

ZenSpec de programa. Este programa existe para que **a ceramista veja, em tempo real, um desenho do forno com as peças como a que ela faz** (biscoito e esmalte lado a lado) — sem raciocínio espacial. O desenho **declara o cálculo**: a legenda mostra "quantas cabem" e "como" (empilhado / por prateleira).

Programa puro (regra `DenaroEngSpec.md` §3): `desenharForno(medidas, forno)` devolve a **string SVG**. A injeção no DOM (`renderFornoSVG`) é do `pricingPanel`. Hoje o render-duplo vive **embutido no bloco Tamanho** da precificação; um painel separado de ocupação (com slider de carga real) é futuro (ver `Specs/queima/01-estimarCabem.md`).

---

## Intenção

Esta feature existe para que **a ceramista** consiga **ver a peça dentro do forno, nas duas queimas**, com o número declarado — sem **conta manual, desenho mental ou planilha**.

---

## Conceito

O render é **SVG puro gerado por JavaScript** — sem imagens externas, sem bibliotecas, determinístico. Duas mini-visualizações lado a lado (`render-duplo`), cada uma com rótulo + legenda:

- **Biscoito** — peças empilhadas em colunas; legenda "~N no forno · empilhado em coluna" (ou "tigelas encaixadas" / "X por prateleira × Y níveis").
- **Esmalte** — prateleiras tracejadas com peças ordenadas; legenda "~N no forno · X por prateleira × Y prateleiras".

O tamanho na tela é **proporcional ao real** (peça ÷ forno). A conta vem de `estimarCabem` (`Specs/queima/01-estimarCabem.md`) — **fonte única**, a mesma usada pelo custo de queima. Nada sai do forno (clamps horizontais e verticais).

Metáfora: é o **boneco do forno** — a ceramista olha e entende "quantas cabem" sem virar a peça na cabeça.

---

## Lógica

### Fluxo

```
pricingPanel → (medidas + forno) → estimarCabem → desenharForno(medidas, forno) → string SVG → injeção no DOM
```

| Programa        | Recebe                 | Faz                                         | Manda para        |
| --------------- | ---------------------- | ------------------------------------------- | ----------------- |
| `estimarCabem`  | tipo + forno + medidas | `{ total, porNivel, niveis, mode }`         | `desenharForno`   |
| `desenharForno` | medidas + forno        | gera a string SVG das 2 vistas              | `pricingPanel`    |

### Regras

1. **Duas vistas lado a lado** (`render-duplo`), cada uma com rótulo (Biscoito/Esmalte) + legenda que **declara a conta**.
2. **Forno**: cilindro em vista lateral-corte (elipse no topo + corpo + linha do piso); quadrado = caixa com topo em paralelogramo. Fundo claro `rgba(247,244,239,0.96)`, contorno `#ab9881`.
3. **Peças em 3D isométrico**:
   - `pecaRedonda` (cilíndrica) — boca em elipse + corpo com base arredondada.
   - `pecaQuadrado` (caixa) — 3 faces (frente, topo, lateral em paralelogramo).
4. **Estados da peça** (realidade atual):

   | Estado | Visual |
   |---|---|
   | `main` | preenchida `rgba(91,68,50,0.92)`, contorno `#5b4432` — a peça em destaque |
   | `copy` | preenchimento fraco `rgba(91,68,50,0.18)` — as demais da fornada |

   (O estado `ghost` descrito em versões antigas da spec não existe no código; a pilha usa `copy` com opacidade menor.)
5. **Escala proporcional real**: peça na tela ∝ peça real ÷ forno real (clamps de legibilidade: mínimo de 6–8px).
6. **Determinístico**: posições calculadas, sem aleatoriedade — mesmo render a cada carga.
7. **Precisão (nada sai do forno)**: clamps horizontais e verticais; `halfW` inclui as faces isométricas da peça quadrada; margem das bordas internas.
8. **Cálculo declarado**: `estimarCabem` devolve `{ total, porNivel, niveis, mode }`; a legenda mostra o número real e o modo. O desenho **capa a representação** em até 6 colunas × 6 níveis por legibilidade; o número da legenda é o total real (teto "12+" acima de 12) — o desenho ilustra, a legenda declara.
9. **Empacotamento real (nunca chute)** — parâmetros declarados no config `OCUPACAO` (nosso algoritmo, auditável, em `app/js/config.js`): usar diâmetro 0,9 · gaps 4cm base/topo · prateleira 2cm · folgas laterais 1/2cm · folgas verticais 2/8cm · peça plana ≥2,5× · tigela encaixa ≥1,1× com fator 0,7.
   - **Círculos em círculo** (peça redonda em forno redondo): `getNCircles` — tabela de packing ótimo (`PACKING`, config declarado, referência `jcmiller11/circlepacking`, MIT).
   - **Círculos em retângulo** (redonda em forno quadrado): linhas hexagonais.
   - **Retângulos em retângulo**: grade com rotação (exata para peças idênticas).
   - **Retângulos em disco**: fileiras dentro do círculo com cantos verificados (`Math.hypot`), rotação considerada; `pack2D` (`binpackingjs`, esm.sh) quando disponível; nunca superestima.
   - **Biscoito**: peça plana (diâmetro ≥ 2,5× altura) empilha em coluna; tigela encaixa (≥ 1,1×, redonda) com nidificação (fator 0,7); demais em prateleira densa.
   - **Esmalte**: prateleiras reais (espessura + folga 8cm) × nº de níveis.
   - Peça maior que o forno (piso ou altura) → `total: 0` = "não cabe", render vazio com a mensagem.
10. **Constantes de desenho declaradas**: os ajustes visuais (clamps de legibilidade, proporções isométricas, margens, largura das colunas) vivem no config `RENDER` em `app/js/config.js` — separados da matemática `OCUPACAO`. Nada de número mágico no meio do código.

### Contrato

Entrada:

- `medidas`: `{ formato, diametro?, altura?, largura?, profundidade?, alturaQ? }`.
- `forno`: `{ formato: "cilindrico"|"quadrada", diametroCm?/larguraCm?/profundidadeCm?, alturaCm }`.

Saída:

- `string` SVG com o `render-duplo` (2 vistas) — mesmo conteúdo que hoje é injetado em `#render-forno`.

Erros:

- `estimarCabem.total = 0` → desenho do forno vazio + legenda "não cabe · peça maior que o forno".
- Sem forno → usa o primeiro da config como fallback (`CONFIG.fornos[0]` / `servicosFora[0]`).

### Edge cases

- Peça muito fina (altura 1cm) → clamps de legibilidade mantêm o desenho visível.
- Peça quadrada em forno redondo → cantos verificados; nunca desenha peça fora do disco.
- Número muito alto (`total > 12`) → legenda "12+", desenho capado em 12 por legibilidade.
- Trocar o forno → redesenha com as medidas do forno novo; medidas da peça mantidas.

### Critérios de aceitação

- Mesmas medidas + mesmo forno → mesmo SVG (determinístico; validado pelo harness `tools/snapshot.js`).
- Nada fora do forno em nenhum tamanho/posição.
- A legenda declara o mesmo número que `estimarCabem` calcula.

---

## Interface

### Layout (mobile-first)

```
┌──────────────┐ ┌──────────────┐
│ BISCOITO     │ │ ESMALTE      │
│  (SVG forno) │ │  (SVG forno) │
│ ~10 no forno │ │ ~3 no forno  │
│ 1×3 níveis   │ │ 1×3 prat.    │
└──────────────┘ └──────────────┘
```

### Hierarquia visual

- `render-duplo`: 2 itens flex igualmente divididos; SVG `width:100%`, `height:auto`.
- Rótulo (`render-item-rotulo`): 10px, peso 700, uppercase, `argila`.
- Legenda (`render-legenda`): 9px, `tinta-suave`, com o número em `<b>` `argila`.
- Detalhe (`render-det`): 8px, opacidade 0.9.

### Interações

- Nenhuma (render passivo ao vivo: muda medida/forno → redesenha). Slider de carga real é do painel de ocupação **futuro**.

### Acessibilidade

- SVG com `aria-hidden="true"` + legenda em texto real (a conta nunca vive só na imagem).