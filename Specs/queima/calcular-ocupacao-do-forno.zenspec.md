# Calcular ocupação do forno (`ocupacaoEngine`)

ZenSpec de programa. Este programa existe para que **a ceramista veja, em tempo real, quantas peças como a que ela faz ocupam o forno** — e quanto custa queimar de verdade com a **carga real** (forno cheio vs o que ela realmente queima).

> **Estado atual:** o cálculo (`estimarCabem`) e o render-duplo (biscoito/esmalte) já existem **embutidos no bloco Tamanho da precificação** (ver `medir-tamanho-da-peca` e `desenhar-forno`). O **painel separado** de ocupação — com seletor de peça salva, chip de tipo e slider de carga real — é um programa **futuro**, aberto a partir de **Fornos & queima** ou de **"ver no forno"**. Esta ZenSpec cobre o núcleo (já implementado) e o alvo (painel).

Requisitos: `editar-fornos-e-queima.zenspec.md` (fornos, `estimarCabem`, render SVG).

---

## Intenção

Esta feature existe para que **a ceramista** consiga **descobrir quantas peças cabem no forno e quanto custa cada queima de verdade** — sem conta manual e sem raciocínio espacial. O programa calcula a ocupação **ao vivo** e mostra o **custo por peça com a carga que ela realmente queima** (padrão ouro: forno meio vazio = queima por peça mais cara).

---

## Conceito

O `ocupacaoEngine` junta três coisas que já existem no Denaro:
1. **O forno** (da tela Fornos & queima) — medidas, capacidade, preço por tipo de queima.
2. **A peça** (medidas → cubagem) — do bloco "Sobre a peça" da precificação.
3. **O cálculo de ocupação** (`estimarCabem`) — peças por prateleira × nº de prateleiras.

E acrescenta o que nenhum deles mostra: **a carga real**. Com um slider "quantas peças você vai queimar?", o app recalcula o **custo por peça real** e avisa quando o forno vai meio vazio.

Metáfora: é o **"quanto cabe e quanto custa de verdade"** — o lugar onde a ceramista decide se espera lotar o forno ou queima agora.

---

## Lógica

### Fluxo

```
ocupacaoPanel → (escolher forno)  →  (medidas da peça / peça salva)  →  render ao vivo
ocupacaoPanel → (escolher tipo: biscoito/esmalte)  →  estimativa ao vivo
ocupacaoPanel → (slider: quantas vai queimar)  →  ocupação % + custo por peça REAL
```

| Programa        | Recebe                        | Faz                                          | Manda para            |
| --------------- | ----------------------------- | -------------------------------------------- | --------------------- |
| `ocupacaoPanel` | toque em um forno da lista    | carrega medidas/preços do forno              | render ao vivo        |
| `ocupacaoPanel` | medidas da peça (ou peça salva)| calcula cubagem e `estimarCabem`            | render + cartões      |
| `ocupacaoPanel` | chip de tipo (biscoito/esmalte)| recalcula ocupação (empilha vs prateleiras)  | render + cartões      |
| `ocupacaoPanel` | slider de carga real          | ocupação % e custo por peça com carga real   | cartão de custo       |

### Regras

- **Tempo real**: nada de botão "calcular" — toda mudança (forno, medidas, tipo, slider) atualiza na hora.
- **Lógica declarada**: mostra "X por prateleira × Y prateleiras = ~N" e "empilhado com delicadeza" para biscoito (vem de `estimarCabem`).
- **Carga real (padrão ouro, R7)**: `custoPorPeçaReal = custoDaQueima ÷ max(1, peçasReais)`. O custo por peça com o forno cheio usa `total`; com o slider em menos, o custo sobe.
- **Aviso poka-yoke**: se a carga real < 70% do total → aviso `tinta-suave`: *"forno a X% → a queima por peça quase dobra. Espere lotar ou junte com outras peças."*
- **Render elegante**: o SVG do padrão de ilustração (2 views: biscoito/esmalte, peça principal + cópias, nada fora do forno, determinístico).
- **Peça salva**: permite carregar uma peça já precificada para ver a ocupação dela no forno escolhido.
- **Fonte única**: `estimarCabem(tipo, forno, medidas)` é o mesmo cálculo usado na precificação (unidade `carga`) — nunca duplicado.

### Contrato

Entrada:

- `fornoId`: id de um forno/serviço de `CONFIG.fornos`/`servicosFora`.
- `medidas`: `{ formato: "redonda"|"quadrada", diametro?, altura?, largura?, profundidade?, alturaQ? }` (ou `pecaId` de uma peça salva).
- `tipo`: `"biscoito" | "esmalte"` (baixa/alta usam o mesmo comportamento de esmalte).
- `pecasReais`: número ≥ 1 (slider).

Saída (calculada, não persistida):

- `estimarCabem(...)` → `{ total, porNivel, niveis }`.
- `ocupacaoPct` = `min(100, pecasReais / total × 100)`.
- `custoPorPeçaReal` = `custoDaQueima ÷ max(1, pecasReais)` (usando a unidade/preço do forno).
- `custoPorPeçaCheia` = `custoDaQueima ÷ max(1, total)`.

Erros:

- `semForno` → cartão orienta cadastrar forno em Fornos & queima.
- `semMedidas` → pede as medidas da peça (ou carrega peça salva).
- `OcupacaoValidationError` → peçasReais < 1 bloqueado (slider mínimo 1).

### Edge cases

- `pecasReais` > `total` → ocupação 100% e custo por peça = custo ÷ pecasReais (mais peças que a teoria → custo ainda menor; permitido, mas avisa "cabe no máximo ~N por carga").
- Peça sem queima → ocupação não se aplica; programa orienta que não há custo de queima.
- Forno sem capacidade/preço → estimativa mostra "—" e orienta completar o forno.
- Prato (peça plana) no biscoito → empilha (colunas); no esmalte → 1 por prateleira com folga. O render mostra os dois.
- Mudar o forno → redesenha com as medidas do forno novo; peça mantida.
- Slider no máximo (total) → custo por peça = custo ÷ total (referência "forno cheio").

### Critérios de aceitação

- Com os mesmos dados, a ocupação e o custo por peça são sempre iguais (determinístico).
- A ceramista entende "quantas cabem" e "quanto custa cada queima" sem nenhuma conta manual.
- O render nunca mostra peça fora do forno (clamps do padrão de ilustração).
- O aviso de forno meio vazio aparece quando a carga real < 70%.

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
│  │  ~10 no  │ │ ~3 no    │   │   (padrão de ilustração)
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

- Render SVG: padrão de ilustração registrado (2 views, isométrico, determinístico, clamps).
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