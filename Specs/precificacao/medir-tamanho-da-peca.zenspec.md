# Medir tamanho da peça (`cubagemDe`)

ZenSpec de programa. Este programa existe para que **a ceramista informe como é a peça (formato e medidas em cm)** e o app **estime a cubagem** usada no custo de queima e na ocupação do forno — sem conta manual e sem raciocínio espacial.

Programa puro (regra `DenaroEngSpec.md` §3): recebe os valores do formulário e devolve `medidas` normalizadas + `cubagemCm3`. A leitura dos inputs (`lerMedidas`) é a fronteira do `pricingPanel`.

---

## Intenção

Esta feature existe para que **a ceramista** consiga **dizer o tamanho da peça em 2 formatos** (redonda ou quadrada) e o app **cubar automaticamente** para o custo de queima — sem precisar de **fórmula de volume ou planilha**.

---

## Conceito

A peça tem **formato** (redonda = diâmetro + altura; quadrada = largura × profundidade × altura) e **medidas em cm**. A cubagem (cm³) alimenta o custo de queima por unidade `cm3` e a estimativa de quantas peças cabem no forno.

O bloco de tamanho mostra também o **render no forno** (ver `desenhar-forno.zenspec.md`) e um **slider de ajuste**: por padrão ele escala a peça **proporcionalmente** (preserva a razão entre as medidas); ao tocar em um campo de medida, o slider passa a controlar **só aquela dimensão**.

Metáfora: é a **régua do ateliê** — mediu, o app fez a conta.

---

## Lógica

### Fluxo

```
pricingPanel → (escolher formato) → mostra as medidas certas (redonda ou quadrada)
pricingPanel → (digitar medidas) → normaliza → cubagem + estimarCabem + render
pricingPanel → (slider) → proporcional OU dimensão tocada → atualiza medidas → recalcula
```

| Programa       | Recebe                    | Faz                                        | Manda para            |
| -------------- | ------------------------- | ------------------------------------------ | --------------------- |
| `cubagemDe` | formato + medidas (cm)    | normaliza e calcula `cubagemCm3`           | custo de queima + `estimarCabem` |
| `pricingPanel` | toque no formato          | mostra os campos do formato escolhido      | — (tela)              |
| `pricingPanel` | toque em um campo de medida | vincula o slider àquela dimensão           | — (tela)              |

### Regras

- **Formatos**: `redonda` → `diametro` + `altura`; `quadrada` → `largura` + `profundidade` + `alturaQ`. Mudar de formato preserva os valores digitados do outro (não perde).
- **Cubagem**: redonda `π × (d/2)² × h`; quadrada `L × P × H` (cm³). Zero em qualquer medida → cubagem 0.
- **Medidas mínimas**: campos com `min=0`, `step=1`, `inputmode="decimal"`, unidade `cm` no sufixo.
- **Slider proporcional (padrão)**: "Ajustar tamanho" escala a peça **preservando a razão** entre as medidas (largura/diâmetro e altura juntos), nos dois formatos. `max` = a menor dimensão do forno **selecionado** no seletor de forno (não o primeiro da lista).
- **Bind por campo (A)**: ao focar/tocar um campo de medida (altura, largura, profundidade, diâmetro), o slider vira o slider **daquela dimensão** — slide altera só ela (o rótulo mostra "Ajustar altura", "Ajustar largura", etc.). O vínculo **persiste** ao sair do campo (para não interromper o ajuste ao tocar o slider); só volta ao **modo proporcional** ao trocar o formato.
- **Fonte única**: as medidas saem do formulário (`lerMedidas`) e alimentam `cubagem`, `estimarCabem` e `desenharForno` — nunca há uma segunda cópia no estado.
- **Render integrado**: o bloco de tamanho mostra o seletor de forno e o render-duplo (ver `desenhar-forno.zenspec.md`).

### Contrato

Entrada:

- `formato`: `"redonda" | "quadrada"`.
- `medidas`: `{ diametro?, altura?, largura?, profundidade?, alturaQ? }` em cm (number ≥ 0).
- `fornoId` (opcional): id do forno selecionado no render (define o `max` do slider).

Saída:

- `medidas` normalizadas (só os campos do formato atual).
- `cubagemCm3` (number ≥ 0).
- `estimarCabem(...)` → `{ total, porNivel, niveis, mode }` (ver `Specs/queima/calcular-ocupacao-do-forno.zenspec.md`).

Erros:

- Medida ≤ 0 ou ausente → campo com `min`; `cubagemCm3 = 0`; ocupação não calcula (render mostra estado vazio).

### Edge cases

- Medida > forno (ex.: diâmetro 55 num forno de 40) → `estimarCabem.total = 0` → render "não cabe".
- Formato quadrado num forno cilíndrico → peça quadrada dentro do disco (cantos verificados).
- Trocar o forno → `max` do slider e o render atualizam para o forno novo; medidas mantidas.

### Critérios de aceitação

- Mesmas medidas → mesma cubagem e mesma ocupação (determinístico).
- O slider proporcional preserva a razão em qualquer passo, nos 2 formatos.
- Tocar em "Altura" faz o slider controlar só a altura; tocar em "Largura", só a largura.
- O `max` do slider corresponde ao forno selecionado no seletor.

---

## Interface

### Layout (mobile-first)

```
Tamanho (pra cubar a queima)
[ Redonda ] [ Quadrada ]
Diâmetro [ 25 ] cm   Altura [ 5 ] cm
        (ou) Largura [20] · Profund. [20] · Altura [5]
Forno: [ Meu forno ▾ ]   onde a peça queima
Ajustar tamanho
[══════════●══════════]   ← slider proporcional / da dimensão tocada
┌──────────┐ ┌──────────┐
│ BISCOITO │ │ ESMALTE  │  ← render (desenhar-forno)
└──────────┘ └──────────┘
```

### Hierarquia visual

- Chips de formato: 2 botões lado a lado; selecionado = fundo `argila`, texto `cartao`.
- Campos de medida com sufixo `cm`, rótulo uppercase `medida-label`.
- Slider `accent-color: var(--argila)`, rótulo "Ajustar tamanho" + hint de qual dimensão está ativa quando o bind por campo está ligado.
- Render-duplo com rótulos "Biscoito"/"Esmalte" e legenda que declara a conta.

### Interações

- Formato em chips (tocar alterna e mostra os campos certos).
- Slider: `input` ao vivo → atualiza medida(s) → recalcula cubagem + render (sem botão "calcular").
- Bind por campo: `focus`/`tap` numa medida liga o slider a ela; indicador visual sutil (ex.: rótulo "Altura: 5 cm" no slider).

### Acessibilidade

- Slider com alvo ≥ 44px; `aria-label` dizendo "Ajustar tamanho" e a dimensão ativa.
- Campos com `inputmode="decimal"`; contraste ≥ 4.5:1.