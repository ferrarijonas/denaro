# Apresentar calculadora no celular (`pricingPanel`)

ZenSpec de componente de UI. Este programa existe para que **a ceramista precifique uma peça ou produto pelo celular em poucos toques**.

O painel é a **fiação** entre o formulário e os programas puros: lê os campos, chama `lerMedidas`, `calcularCustoPeca`/`calcularCustoProduto`, `cubagemDe` e `desenharForno`, e renderiza os resultados. Não contém lógica de cálculo.

---

## Intenção

Esta feature existe para que **a ceramista** consiga **ver o custo e os preços de venda de uma peça ou produto em cada linha comercial** sem precisar de **conta manual ou planilha**.

---

## Conceito

O `pricingPanel` é a tela principal do Denaro. A ceramista escolhe o **tipo** (Peça ou Produto) e preenche as seções do formulário:

- **Peça**: Insumos (argila kg + seletor de argila, esmalte em R$, tamanho/medidas + render no forno, acessórios), Mão de obra (tempo horas/minutos, dificuldade 1–5, nível), Queima (chips de tipo + seletor de forno + "sem queima"), Canais de venda, Entrega (método + quem paga + rateio).
- **Produto**: Receita (insumos em gramas + unidades produzidas) + Embalagem & montagem.

O painel mostra, abaixo, o **custo detalhado** (linha a linha) e o **preço por linha comercial** (Exclusiva/Padrão/Revenda para peças; Autoral/Profissional/Essencial para produtos). Ela escolhe uma linha, salva e segue.

Metáfora: é a **etiquetadora** — preencheu, calculou, escolheu a linha, salvou.

---

## Lógica

### Fluxo

```
toggle Peça/Produto → seções → (cálculo local, ao vivo ou botão) → custo + preços por linha → salvar item
```

| Programa          | Recebe                          | Faz                                        | Manda para                |
| ----------------- | ------------------------------- | ------------------------------------------ | ------------------------- |
| `pricingPanel`    | toques da ceramista nas seções  | lê campos + normaliza                      | `calcularCustoPeca`/`calcularCustoProduto` |
| `pricingPanel`    | resultado do cálculo (objeto)   | renderiza custo e preços por linha         | — (tela)                  |
| `pricingPanel`    | toque em "Salvar peça/produto"  | grava no `storage` (Firestore + local)     | `storage`                 |

### Regras

- Se a ceramista toca **"Calcular preço"** e todas as seções válidas → painel mostra custo detalhado + preços por linha.
- Se algum campo está inválido → campo marcado em `terracota` com mensagem `12px`; nada é calculado.
- **Tempo** é entrado em **horas e minutos** (steppers + atalhos "até 1h", "2–3h", "4–6h", "8–12h", "15–30h+"); convertido para decimal pelo normalizador (`h + m/60`).
- **Dificuldade** é **1–5** na UI; o cálculo usa o fator interno (1,0–1,8).
- Linhas de preço vêm dos custos de referência (peça: Exclusiva/Padrão/Revenda; produto: Autoral/Profissional/Essencial).
- Se não há custos de referência cadastrados → banner suave: "Cadastre seus custos para valores reais" com link para `costsPanel`.
- Tocando numa linha de preço → ela fica **selecionada** (borda `argila`); o preço escolhido vira o preço do item ao salvar.
- Tocando em **"Salvar peça"** sem selecionar linha → seleciona a linha padrão (Padrão p/ peça, Essencial p/ produto) e salva.
- Após salvar → feedback curto (`verde-argila`): "Peça salva" / "Produto salvo" por 2s.
- Seções são colapsáveis; estado de abertura não afeta o cálculo.
- **Tamanho da peça**: chips de formato + medidas em cm + seletor de forno + slider de ajuste (proporcional, com bind à dimensão tocada) + render-duplo do forno (ver `cubagemDe` e `desenharForno`).

### Contrato

Entrada (pedido de cálculo — peça): `tipo: "peca"` + os campos normalizados do formulário (`PricingInput` — ver `02-lerMedidas.md`).

Entrada (pedido de cálculo — produto): `tipo: "produto"` + `receita`, `unidadesProduzidas`, `embalagem`, `tempoMontagemHoras`.

Entrada (resultado — mesmo formato da saída dos engines):

- `custoDetalhado`: `{ [componente]: number }` (varia por tipo)
- `custoTotal`, `custoComTaxas`
- `precosPorLinha`: `[{ linha, valor }]`

Saída (ação):

- `salvarItem`: `{ tipo, dados de entrada, linhaEscolhida, precoEscolhido }`.

Erros:

- `PricingValidationError` → campos inválidos apontados na tela.

### Edge cases

- `kgsArgila = 0` e `tempo = 0` → custo só com esmalte/embalagem; preços por linha ainda mostrados.
- `unidadesProduzidas = 0` → seletor impede; cálculo não roda.
- Resultado com custo 0 → cartões mostram `—` em vez de R$ 0,00.
- Linha de preço com divisão por zero (margem = 100%) → erro de validação em `costsPanel`; linha não é exibida.
- Toggle de tipo com campos preenchidos do outro tipo → estado do tipo não usado fica preservado (não perde o que a ceramista digitou).
- Peça maior que o forno → render "não cabe"; custo de queima segue pela unidade do forno.

### Critérios de aceitação

- Uma peça vira preço em poucos toques (tipo, insumos, tempo, dificuldade, calcular).
- Toda linha de preço tem origem rastreável no custo detalhado (conforme `07-modelo-de-precificacao.md`).
- O render do forno e o custo de queima usam a mesma `estimarCabem` (nunca divergem).

---

## Interface

### Layout (mobile-first, largura ≤ 420px)

```
┌──────────────────────────────┐
│  [logo] Denaro               │  ← marca/aplicação
│  ← Orçamentos                │  ← link de volta à lista
│  Lustre  ☁ Tudo em ordem     │  ← nome do objeto + status (doc-centric)
│  Vamos precificar?           │
│  [Peças] [Acabam.] [Mat.] …  │  ← cards de tipo
│  Peças & Objetos  (trocar)   │
├──────────────────────────────┤
│  ▼ 1. INSUMOS                │
│  ARGILA (KG)  [ 0.4 ] kg ▾   │
│  ESMALTE (R$) [ 5.00 ] R$    │
│  TAMANHO                     │
│  [Redonda] [Quadrada]        │
│  Diâmetro [25]cm Altura[5]cm │
│  Forno: [Meu forno ▾]        │
│  Ajustar tamanho [──●──]     │
│  ┌──┐ ┌──┐  (render-duplo)   │
│  Acessórios ▸ (chips)        │
│                              │
│  ▼ 2. MÃO DE OBRA            │
│  TEMPO  [−] 0h 30min [+]     │
│         até1h 2–3h 4–6h …    │
│  DIFICULDADE (1)(2)(3)(4)(5) │
│  NÍVEL  [profissional ▾]     │
│                              │
│  ▼ 3. QUEIMA                 │
│  [Biscoito] [Baixa] [Alta] … │
│  Forno ▾ · ~N pç  [✕]        │
│  ☑ Sem queima                │
│                              │
│  ▼ CANAIS DE VENDA           │
│  [Direto][Site][Feira]…      │
│                              │
│  ▼ ENTREGA                   │
│  [Entrego eu] [Correios] [Retira]│
│  Quem paga: à parte / frete grátis│
│                              │
│  [    CALCULAR PREÇO   ]     │
│  ┌── RESULTADO ────────────┐ │
│  │ Argila R$2,80 · Esm. R$5 │ │
│  │ Acess. R$0 · Emb. R$3,00 │ │
│  │ Mão de obra R$16,99      │ │
│  │ Queima R$… · Risco R$…   │ │
│  │ CUSTO TOTAL     R$ 35,23 │ │
│  │ CUSTO C/ TAXAS  R$ 37,08 │ │
│  │ Exclusiva R$92,70   [  ] │ │
│  │ Padrão    R$67,42   [ • ]│ │
│  │ Revenda   R$52,97   [  ] │ │
│  │ [ SALVAR PEÇA ]          │ │
│  └──────────────────────────┘│
└──────────────────────────────┘
```

### Variantes por tipo

- **Peça**: seções Insumos / Mão de obra / Queima / Canais / Entrega. Resultado com linhas Exclusiva · Padrão · Revenda.
- **Produto**: seções Receita (seletor de insumo + gramas, "+ adicionar insumo", total da receita, unidades produzidas) / Embalagem & montagem. Resultado com linhas Autoral · Profissional · Essencial.

### Hierarquia visual

- Marca/aplicação: `tinta`, 18px, peso 600 (inalterado).
- Link de volta (`doc-voltar`): `argila`, 12px, peso 600, `← Orçamentos`.
- Nome do objeto (`doc-titulo`): `tinta`, 20px, peso 700, reflete `nome-peca`/`nome-produto` ao vivo; padrão `Novo orçamento`.
- Status de salvamento (`doc-status`): `tinta-suave`, 11px, peso 500, **ao lado do nome do objeto**, com ícone de nuvem `13px` traço `1.7px`; hora `11px #b0a090` só quando há `Salvo`.
- Cabeçalhos de seção: `tinta-suave`, 13px, peso 600, uppercase, com `▼` colapsável + número da seção.
- Rótulos de campo: `tinta-suave`, 13px, peso 600, uppercase.
- `CUSTO TOTAL`/`CUSTO C/ TAXAS`: `tinta`, 26px, peso 600; c/taxas em `argila`.
- Preço da linha selecionada: `argila`, 18px, peso 600.
- Detalhes de custo: `tinta-suave`, 13px; valores `tinta`, peso 500.

### Estados visuais

| Estado                  | Visual                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| card de tipo ativo      | fundo `argila`, texto `cartao`                                          |
| campo `focus`           | borda `1.5px argila` + halo `rgba(91,68,50,0.12)`                       |
| chip dificuldade selec. | fundo `argila`; não selecionado: `cartao`, texto `tinta-suave`          |
| stepper de tempo        | `cartao`, borda `1px linha`, botões ± 42px                              |
| linha de preço selec.   | borda `1.5px argila`, preço em `argila`                                 |
| erro de campo           | borda `1.5px terracota` + mensagem 12px `terracota`                     |
| botão primário          | fundo `argila`, texto `cartao`, 48px, cantos 10px                       |
| feedback "salva"        | texto `verde-argila`, 13px, 2s                                          |
| `doc-status: salvando`  | nuvem `13px tinta-suave` + ponto `6px #c9b896` com `pulse 1s`, texto `Salvando…` `11px tinta-suave` |
| `doc-status: salvo nuvem` | nuvem com check `13px` + texto `Salvo na nuvem · HH:MM` `11px tinta-suave`, hora `11px #b0a090`; após 2.5s vira `Tudo em ordem` |
| `doc-status: salvo local` | nuvem `13px terracota` suave + texto `Salvo neste aparelho · HH:MM` `11px tinta-suave` + link `Salvar agora` `12px argila` só quando offline |
| `doc-status: idle`      | texto `Tudo em ordem` `11px tinta-suave` sem hora, sem ponto pulsante   |

### Interações

- `doc-status` é só informativo (`aria-live="polite"`), sem card nem borda; reflete o `storage.gravar` (autosave 700ms, flush no `pagehide`/`visibilitychange`/troca de tela); `Salvar agora` só aparece quando `nuvemOk=false`.
- Campos numéricos usam teclado numérico no celular (`inputmode="decimal"/"numeric"`).
- Steppers de tempo: toques `−`/`+` (passo 15min nos minutos); atalhos rápidos preenchem horas/minutos.
- Toggle de tipo preserva o estado do tipo não ativo.
- Ao tocar "Calcular preço": o resultado entra com `fade + translateY(4px→0)`, 200ms.
- Ao salvar: feedback `verde-argila` no lugar do botão por 2s.

### Acessibilidade

- Chips de dificuldade funcionam como radio group (um por vez, navegável por seta).
- Steppers e checkboxes são alvos ≥ 44px.
- Contraste de texto sobre `cartao`/`papel`: sempre ≥ 4.5:1.