# Apresentar calculadora no celular (`pricingPanel`)

ZenSpec de componente de UI. Este programa existe para que **a Alice precifique uma peça ou produto pelo celular em poucos toques**.

Modo UI-first: os dados desta ZenSpec alimentam a **casca visual com mocks provisórios** (marcados aqui como provisórios). O contrato técnico de cálculo vive em `calcular-custo-e-precos.zenspec.md` e `calcular-custo-de-produto.zenspec.md`, ambos derivados de `modelo-de-precificacao.md`.

---

## Intenção

Esta feature existe para que **Alice** consiga **ver o custo e os preços de venda de uma peça ou produto em cada linha comercial** sem precisar de **conta manual ou planilha**.

---

## Conceito

O `pricingPanel` é a tela principal do Alice. A Alice escolhe o **tipo** (Peça ou Produto) e preenche as seções do formulário: **Insumos** (argila, esmalte em R$, acessórios), **Mão de obra** (tempo em horas e minutos, dificuldade 1–5) e **Embalagem** (caixas, papéis, etiquetas, plástico bolha, frete). Para produtos, a seção vira **Receita** (insumos em gramas + unidades produzidas) e **Embalagem & montagem**.

O painel mostra, abaixo, o **custo detalhado** (linha a linha) e o **preço por linha comercial** (Exclusiva/Padrão/Revenda para peças; Autoral/Profissional/Essencial para produtos). Ela escolhe uma linha, salva e segue.

Metáfora: é a **etiquetadora** — preencheu, calculou, escolheu a linha, salvou.

---

## Lógica

### Fluxo

```
toggle Peça/Produto → seções → (pedido de cálculo) → preços por linha → salvar item
```

| Programa          | Recebe                          | Faz                                        | Manda para           |
| ----------------- | ------------------------------- | ------------------------------------------ | -------------------- |
| `pricingPanel`    | toques da Alice nas seções      | valida localmente, monta pedido            | API `/api/pricing`   |
| `pricingPanel`    | resultado do cálculo (JSON)     | renderiza custo e preços por linha         | — (tela)             |
| `pricingPanel`    | toque em "Salvar peça/produto"  | envia item para salvar                     | API `/api/pieces` ou `/api/products` |

> **Nota (mock provisório):** Na Fase 1, o "cálculo" é feito por um mock local com dados provisórios, visivelmente marcados (`MOCK`). A integração real com `/api/pricing` ocorre na Fase 3 (tarefa T33).

### Regras

- Se a Alice toca **"Calcular preço"** e todas as seções válidas → painel mostra custo detalhado + preços por linha.
- Se algum campo está inválido → campo marcado em `terracota` com mensagem `12px`; nada é calculado.
- **Tempo** é entrado em **horas e minutos** (steppers + atalhos "até 1h", "2–3h", "4–6h", "8–12h", "15–30h+"); é convertido para decimal interno pelo normalizador (`h + m/60`).
- **Dificuldade** é **1–5** na UI; o cálculo usa o fator interno (1,0–1,8), mostrado como legenda junto do chip selecionado.
- Linhas de preço vêm dos custos de referência (peça: Exclusiva/Padrão/Revenda; produto: Autoral/Profissional/Essencial).
- Se não há custos de referência cadastrados → banner suave: "Cadastre seus custos para valores reais" com link para `costsPanel`.
- Tocando numa linha de preço → ela fica **selecionada** (borda `argila`); o preço escolhido vira o preço do item ao salvar.
- Tocando em **"Salvar peça"** sem selecionar linha → seleciona a linha padrão (Padrão p/ peça, Essencial p/ produto) e salva.
- Após salvar → feedback curto (`verde-argila`): "Peça salva" / "Produto salvo" por 2s.
- Seções são colapsáveis; estado de abertura não afeta o cálculo.

### Contrato

O contrato campo-a-campo da tela é a Interface abaixo. A assinatura do pedido/recebimento de dados:

Entrada (pedido de cálculo — peça):

- `tipo`: `"peca"`
- `kgsArgila`: number
- `esmalteReais`: number ≥ 0
- `acessorios`: `[{ nome, qtd }]`
- `embalagem`: `[{ nome, qtd }]`
- `tempoHoras`: number (já convertido de h+min)
- `dificuldade`: 1 | 2 | 3 | 4 | 5
- `freteReais`: number ≥ 0

Entrada (pedido de cálculo — produto):

- `tipo`: `"produto"`
- `receita`: `[{ insumo, gramas }]`
- `unidadesProduzidas`: number > 0
- `embalagem`: `[{ nome, qtd }]`
- `tempoMontagemHoras`: number ≥ 0

Entrada (resultado — da API/mock, mesma assinatura das ZenSpecs de cálculo):

- `custoDetalhado`: `{ [componente]: number }` (varia por tipo)
- `custoTotal`: number
- `custoComTaxas`: number
- `precosPorLinha`: `[{ linha, valor }]`

Saída (ação):

- `salvarItem`: `{ tipo, dados de entrada, linhaEscolhida, precoEscolhido }`

Erros:

- `PricingValidationError` → campos inválidos apontados na tela.

### Edge cases

- `kgsArgila = 0` e `tempo = 0` → custo só com esmalte/embalagem; preços por linha ainda mostrados.
- `unidadesProduzidas = 0` → seletor impede; cálculo não roda.
- Resultado com custo 0 → cartões mostram `—` em vez de R$ 0,00.
- Linha de preço com divisão por zero (margem = 100%) → erro de validação em `costsPanel`; linha não é exibida.
- Toggle de tipo com campos preenchidos do outro tipo → estado do tipo não usado fica preservado (não perde o que a Alice digitou).

### Critérios de aceitação

- Uma peça vira preço em até 5 toques (tipo, insumos, tempo, dificuldade, calcular).
- Toda linha de preço tem origem rastreável no custo detalhado (conforme `modelo-de-precificacao.md`).
- O mock provisório é visivelmente marcado na tela durante a Fase 1.

---

## Interface

### Layout (mobile-first, largura 390px)

```
┌──────────────────────────────┐
│  Alice              (mock)   │
│  Precificar                  │
│  [ Peça ] [ Produto ]        │  ← toggle
├──────────────────────────────┤
│  ▼ INSUMOS                   │
│  ARGILA (KG)   [ 0.4  ] kg   │
│  ESMALTE (R$)  [ 5.00 ] R$   │
│  Acessórios:  ☐fio ☐motor    │
│                              │
│  ▼ MÃO DE OBRA               │
│  TEMPO  [−] 0h 30min [+]     │
│         até1h 2–3h 4–6h …    │
│  DIFICULDADE  (1)(2)(3)(4)(5)│
│  nível 1 → fator 1,0 · desc  │
│                              │
│  ▼ EMBALAGEM                 │
│  ☑ Papel 10X10    R$2,00  +1 │
│  ☑ Etiqueta       R$1,00  +1 │
│  ☐ Caixa envio    R$4,00     │
│  ☐ Plástico bolha R$2,00     │
│  FRETE/TRANSPORTE [ 0 ] R$   │
│                              │
│  [    CALCULAR PREÇO   ]     │
│  ┌── RESULTADO ────────────┐ │
│  │ Argila R$2,80 Esmalte R$5,00│
│  │ Acessórios R$0 · Embal. R$3,00│
│  │ Mão de obra R$19,55 (×1,0)│
│  │ Risco/refação R$8,20      │
│  │ CUSTO TOTAL     R$ 38,55  │
│  │ CUSTO C/ TAXAS  R$ 40,48  │
│  │ Exclusiva R$101,19  [  ]  │
│  │ Padrão    R$ 73,59  [ • ] │
│  │ Revenda   R$ 57,82  [  ]  │
│  │ [ SALVAR PEÇA ]           │
│  └──────────────────────────┘│
└──────────────────────────────┘
```

### Variantes por tipo

- **Peça**: seções Insumos / Mão de obra / Embalagem. Resultado com linhas Exclusiva · Padrão · Revenda.
- **Produto**: seções Receita (seletor de insumo + gramas, "+ adicionar insumo", total da receita, unidades produzidas) / Embalagem & montagem. Resultado com linhas Autoral · Profissional · Essencial.

### Hierarquia visual

- Título da tela: `tinta`, 20px, peso 500 (display).
- Cabeçalhos de seção: `tinta-suave`, 13px, peso 600, uppercase, com `▼` colapsável.
- Rótulos de campo: `tinta-suave`, 13px, peso 600, uppercase.
- `CUSTO TOTAL`/`CUSTO C/ TAXAS`: `tinta`, 26px, peso 600; c/taxas em `argila`.
- Preço da linha selecionada: `argila`, 18px, peso 600.
- Detalhes de custo: `tinta-suave`, 13px; valores `tinta`, peso 500.

### Estados visuais

| Estado                  | Visual                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| toggle ativo            | fundo `argila`, texto `cartao`                                          |
| campo `focus`           | borda `1.5px argila` + halo `rgba(181,98,60,0.12)`                     |
| chip dificuldade selec. | fundo `argila`; não selecionado: `cartao`, texto `tinta-suave`          |
| stepper de tempo        | `cartao`, borda `1px linha`, botões ± 42px                              |
| linha de preço selec.   | borda `1.5px argila`, preço em `argila`                                 |
| erro de campo           | borda `1.5px terracota` + mensagem 12px `terracota`                     |
| botão primário          | fundo `argila`, texto `cartao`, 48px, cantos 10px                       |
| feedback "salva"        | texto `verde-argila`, 13px, 2s                                          |

### Interações

- Campos numéricos usam teclado numérico no celular (`inputmode="decimal"/"numeric"`).
- Steppers de tempo: toques `−`/`+` (passo 15min nos minutos); atalhos rápidos preenchem horas/minutos.
- Toggle de tipo preserva o estado do tipo não ativo.
- Ao tocar "Calcular preço": o resultado entra com `fade + translateY(4px→0)`, 200ms.
- Ao salvar: feedback `verde-argila` no lugar do botão por 2s.

### Acessibilidade

- Chips de dificuldade funcionam como radio group (um por vez, navegável por seta).
- Steppers e checkboxes são alvos ≥ 44px.
- Contraste de texto sobre `cartao`/`papel`: sempre ≥ 4.5:1.
