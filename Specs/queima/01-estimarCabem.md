# Calcular ocupação do forno (`estimarCabem`)

ZenSpec de programa. Este programa existe para que **a ceramista veja, em tempo real, quantas peças como a que ela faz ocupam o forno nas duas queimas** — e quanto custa queimar de verdade.

> **As duas queimas têm ocupações diferentes.** No **biscoito** a peça entra **crua** (como foi moldada) e pode ser empilhada uma sobre a outra — pratos/bowls vão direto em coluna até o teto, sem prateleira e sem regra de distanciamento. No **esmalte** a peça já **encolheu** (saiu do biscoito menor) e precisa de **prateleiras reais com distância mínima entre peças** (~5mm), porque peça que encosta cola e vira refugo.
>
> **Estado atual:** o cálculo (`estimarCabem`) e o render-duplo (biscoito/esmalte) já existem **embutidos no bloco Tamanho da precificação** (ver `cubagemDe` e `desenharForno`). O **painel separado** de ocupação — `ocupacaoPanel` (tela futura) com seletor de peça salva, chip de tipo e slider de carga real — é um programa **futuro** (a estimativa por **peso** — `capacidadeKg` — e o aviso de forno meio vazio pertencem a ele, ver research `padrao-ouro-queima` R24). Esta ZenSpec cobre o núcleo (implementado, `estimarCabem`) e o alvo (painel).

Requisitos: `00-fornosPanel.md` (fornos, `estimarCabem`, render SVG).

---

## Intenção

Esta feature existe para que **a ceramista** consiga **descobrir quantas peças cabem no forno e quanto custa cada queima de verdade** — sem conta manual e sem raciocínio espacial. O programa calcula a ocupação **ao vivo** nas duas pernas (biscoito cru / esmalte encolhido) e mostra o **custo por peça com a carga real**.

---

## Conceito

O `estimarCabem` junta três coisas que já existem no Denaro:

1. **O forno** (da tela Fornos & queima) — medidas, capacidade, preço por tipo de queima.
2. **A peça crua** (medidas do formulário) — o tamanho que a ceramista **molda**; é o que entra no biscoito. Referência única do formulário, consistente com o peso (também cru).
3. **A argila** (do seletor) — carrega a **retração linear** (`ARGILAS[].retracaoLinear`, default global 10%). A retração deriva a peça do esmalte: `esmalte = crua × (1 − s)`.

E acrescenta o que nenhum deles mostra: **a carga real**. Com um slider "quantas peças você vai queimar?", o app recalcula o **custo por peça real** e avisa quando o forno vai meio vazio (programa futuro `ocupacaoPanel`).

Metáfora: é o **"quanto cabe e quanto custa de verdade"** — o lugar onde a ceramista decide se espera lotar o forno ou queima agora.

---

## Lógica

### Fluxo

```
pricingPanel → (medidas crua + argila) → retracao (ARGILAS) → medidasDaPerna(tipo) → estimarCabem → { total, porNivel, niveis, mode }
custoQueimaLinha / renderFornoSVG → estimarCabem (fonte única por perna)
```

| Programa         | Recebe                                  | Faz                                            | Manda para              |
| ---------------- | --------------------------------------- | ---------------------------------------------- | ----------------------- |
| `lerMedidas`     | campos + select de argila               | medidas **crua** + `retracao` (0..1) resolvida | `estimarCabem`/`desenharForno` |
| `medidasDaPerna` | tipo + medidas crua + retracao          | devolve o footprint da perna (ver abaixo)      | `estimarCabem`/`desenharForno` |
| `estimarCabem`   | tipo + forno + medidas crua + retracao  | `{ total, porNivel, niveis, mode }`            | custo de queima + render |
| `desenharForno`  | medidas crua + forno + retracao         | string SVG do render-duplo com o footprint de cada perna | `pricingPanel` |

### Regras

- **Perna = geometria própria.** O `tipo` é `"biscoito"` (pilha solta, peça crua) ou qualquer queima de peça já biscoitada (`esmalte`/`baixa`/`alta`/`3fogo` → prateleiras, peça encolhida).
- **Referência única (crua):** as medidas digitadas são **cruas** (como moldadas) — o que entra no biscoito. Nada de "tamanho final" digitado; o tamanho final é **derivado e mostrado** (`escalaLinear` + readout na precificação).
- **Retração linear `s`:** 1 por argila no catálogo (`ARGILAS[].retracaoLinear`), default global `CONFIG.retracaoPadrao` (0,10). Aplica **por dimensão** (linear). Defaults de corpo: grês ~10–12%, terracota ~8–9%, porcelana ~12–15% — o valor é de cada argila e ajustável.
- **`medidasDaPerna(tipo, m, s)`** (fonte única do footprint): `biscoito → m` (crua); demais → `m × (1−s)`. Mesma regra no cálculo e no render — nunca duplicada.
- **Biscoito = pilha solta até o teto.** O que empilha/encaixa vai **sem prateleira** (coluna direta até o teto); o que não empilha ganha níveis em prateleiras **simples** (só a espessura — sem a folga de segurança do esmalte). Estratégia por forma:
  - peça **plana** (maior diâmetro/lado ≥ 2,5× altura) → **empilha** em coluna (prato sobre prato);
  - **tigela** (redonda, diâmetro ≥ 1,1× altura) → **encaixa** (nidificação, fator 0,7);
  - demais (caneca, vaso…) → **solto**, em níveis com prateleira simples.
- **Peça plana larga "em pé":** no biscoito, se a peça plana **não cabe deitada** no piso (`porNivel = 0`) mas a maior dimensão ≤ altura útil do forno → **`em_pe`**: cabe **em pé, apoiada na borda** (contagem ~1 por carga — peça no limite da câmara; sem espessura digitada, sem falsa precisão).
- **Esmalte = prateleiras reais + folga mínima:** slot de nível = `prateleiraEsp` + altura da peça (encolhida) + `folgaVerticalEsmalte`; peças por piso com **`folgaPecaPecaEsmalte` (0,5cm = 5mm)** — peça que encosta no esmalte cola.
- **Sem número mágico:** folgas, gaps, fatores de encaixe, retração padrão e limites de "plana" vivem em `OCUPACAO`/`CONFIG` (`app/js/config.js`).
- **Fonte única:** `estimarCabem(tipo, forno, medidas, retracao)` é o mesmo cálculo usado na precificação (unidade `carga`), na cubagem por volume da perna e no render — nunca duplicado.
- **Carga real (padrão ouro, R7, painel futuro):** `custoPorPeçaReal = custoDaQueima ÷ max(1, peçasReais)`.

### Contrato

Entrada:

- `fornoId`: id de um forno/serviço de `CONFIG.fornos`/`servicosFora`.
- `medidas`: **crua** `{ formato: "redonda"|"quadrada", diametro?, altura?, largura?, profundidade?, alturaQ? }` (ou `pecaId` de uma peça salva).
- `tipo`: `"biscoito"` (crua, pilha) | demais (`esmalte`, `baixa`, `alta`, `3fogo` = encolhida, prateleiras).
- `retracao`: `number` 0..1 (linear; default `CONFIG.retracaoPadrao` quando ausente).
- `pecasReais`: número ≥ 1 (slider, painel futuro).

Saída (calculada, não persistida):

- `estimarCabem(...)` → `{ total, porNivel, niveis, mode }`, com `mode`: `"empilha" | "encaixa" | "solto" | "em_pe" | "prateleira"`.
- `medidasDaPerna(tipo, m, s)` → medidas da perna; `escalaLinear(m, fator)` → medidas × fator por dimensão.
- `escalaLinear` também alimenta o readout de **tamanho final estimado** (`m × (1−s)`) na precificação.
- `ocupacaoPct` = `min(100, pecasReais / total × 100)` (painel futuro).
- `custoPorPeçaReal` = `custoDaQueima ÷ max(1, pecasReais)` (usando a unidade/preço do forno).

Erros:

- `semForno` → cartão orienta cadastrar forno em Fornos & queima.
- `semMedidas` → pede as medidas da peça (ou carrega peça salva).
- `OcupacaoValidationError` → peçasReais < 1 bloqueado (slider mínimo 1).
- `total: 0` por perna → "não cabe" **naquela queima** (a outra perna pode caber — ex.: prato largo que não cabe deitado no biscoito, mas cabe em pé; e a versão encolhida cabe deitada no esmalte).

### Edge cases

- `pecasReais` > `total` → ocupação 100% e custo por peça = custo ÷ peçasReais (permitido; avisa "cabe no máximo ~N por carga").
- Peça sem queima → ocupação não se aplica; programa orienta que não há custo de queima.
- **Divergência entre pernas é normal:** a peça crua pode não caber (deitada) no biscoito mas caber em pé; e a encolhida pode caber deitada no esmalte. Cada perna tem o seu veredito — o render mostra os dois.
- Prato (peça plana) no biscoito → empilha em coluna; no esmalte → 1 por prateleira com folga `folgaPecaPecaEsmalte`. O render mostra os dois.
- Argila sem retração declarada ou nenhuma argila selecionada → usa `CONFIG.retracaoPadrao`.
- Mudar o forno → redesenha com as medidas do forno novo; peça mantida.
- Slider no máximo (total) → custo por peça = custo ÷ total (referência "forno cheio").

### Critérios de aceitação

- Com os mesmos dados, a ocupação e o custo por peça são sempre iguais (determinístico; harness `tools/snapshot.js`).
- A ceramista entende "quantas cabem" **em cada queima** e "quanto custa cada queima" sem nenhuma conta manual.
- A peça do esmalte é sempre **menor ou igual** à do biscoito (retração nunca aumenta a peça).
- O render nunca mostra peça fora do forno (clamps do padrão de ilustração).
- O aviso de forno meio vazio aparece quando a carga real < 70% (painel futuro).

---

## Interface

### Layout (mobile-first)

```
┌──────────────────────────────┐
│  ←  Fornos & queima         │
├──────────────────────────────┤
│  Ocupação do forno           │
│  Forno: [Meu forno][da viz.] │
│  Peça:   medidas [25]×[5]    │
│          (ou: peça salva ▾)  │
│  Tipo:   [Biscoito] [Esmalte]│
│                              │
│  ┌──────────┐ ┌──────────┐   │
│  │ BISCOITO │ │ ESMALTE  │   │ ← render SVG
│  │  ~10 no  │ │ ~3 no    │   │   (peça crua vs encolhida)
│  │  forno   │ │ 1×3      │   │
│  └──────────┘ └──────────┘   │
│                              │
│  Quantas você vai queimar?   │
│  [    ] 8  ◄───────►  (10)   │ ← slider de carga real
│  forno a 80% · 1 queima      │
│                              │
│  ┌──────────────────────────┐│
│  │ custo por peça (cheio)   ││
│  │ R$ 24,54                 ││
│  │ custo por peça (real: 8) ││
│  │ R$ 30,68   ▲              ││
│  │ forno a 80% ✓             ││
│  └──────────────────────────┘│
│  aviso (se <70%):            │
│  "forno a 50% → a queima por │
│   peça quase dobra"          │
└──────────────────────────────┘
```

### Hierarquia visual

- Render SVG: padrão de ilustração registrado (2 views, isométrico, determinístico, clamps); cada view desenha o **footprint da própria perna**.
- Slider de carga real com o máximo visível (total).
- Cartão de custo: "custo por peça (forno cheio)" e "custo por peça (carga real)" lado a lado; a diferença em destaque quando sobe.
- Aviso de forno meio vazio: `tinta-suave`, com exemplo em linguagem natural.

### Interações

- Tudo ao vivo (input → recálculo imediato).
- Slider com `inputmode="numeric"` e stepper mínimo 1.
- Peça salva: dropdown que preenche as medidas.
- Tipo em chips (Biscoito/Esmalte); baixa/alta compartilham o comportamento esmalte.

### Acessibilidade

- Render SVG com `aria-hidden` + legenda em texto real (a conta nunca vive só na imagem).
- Slider com alvo ≥ 44px; contraste ≥ 4.5:1.
