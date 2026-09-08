# Apresentar calculadora no celular (`pricingPanel`)

ZenSpec de componente de UI. Este programa existe para que **a ceramista precifique uma peça ou produto pelo celular em poucos toques**.

O painel é a **fiação** entre o formulário e os programas puros: lê os campos, chama `lerMedidas`, `calcularCustoPeca`/`calcularCustoProduto`, `cubagemDe` e `desenharForno`, e renderiza os resultados. Não contém lógica de cálculo.

---

## Intenção

Esta feature existe para que **a ceramista** consiga **ver o custo e os preços de venda de uma peça ou produto em cada linha comercial** sem precisar de **conta manual ou planilha**.

---

## Conceito

O `pricingPanel` é a tela principal do Denaro. A ceramista escolhe o **tipo** (Peça ou Produto) e preenche as seções do formulário:

- **Peça**: seção **0. A peça** (identidade: galeria de fotos, nome, "pra quem é", categoria) + Insumos (argila kg + seletor de argila, esmalte em R$, tamanho/medidas + render no forno, acessórios), Mão de obra (tempo horas/minutos, dificuldade 1–5, nível), Queima (chips de tipo + seletor de forno + "sem queima"), Canais de venda, Entrega (método + quem paga + rateio).
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
│  [logo] Denaro        ☁      │  ← marca/aplicação + status de salvamento
│  Vamos precificar?           │  ← (1ª visita) escolha de tipo, inalterado
│  [Peças] [Acabam.] [Mat.] …  │  ← cards de tipo
├──────────────────────────────┤
│  ▼ 0. A PEÇA                 │
│  NOME DA PEÇA                │
│  [ Prato médio Entrelinhas ] │  ← nome primeiro (título da etiqueta)
│  PRA QUEM É  [ Ana · enc. ]  │
│  CATEGORIA [Utilitário][Esc.] [Outros]│
│  FOTOS (opcional · 1ª vira capa)       │
│  ┌────────────────────────┐  │
│  │  [ capa 3:2 ]    trocar│  │  ← vazio: painel quente ilustrado
│  └────────────────────────┘  │    com ícone + microcopy (não um vão)
│  [ ▸][ ▸][ ▸][ + ]           │  ← miniaturas / adicionar
│                              │
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

- **Peça**: seções **0. A peça** (identidade + fotos) / Insumos / Mão de obra / Queima / Canais / Entrega. Resultado com linhas Exclusiva · Padrão · Revenda.
- **Produto**: seções Receita (seletor de insumo + gramas, "+ adicionar insumo", total da receita, unidades produzidas) / Embalagem & montagem. Resultado com linhas Autoral · Profissional · Essencial.

### Hierarquia visual

- Marca/aplicação: `logo.webp` 44px à esquerda + status de salvamento (`doc-status`) à direita. Abaixo, uma **linha de navegação** (`doc-topo`): seta `←` (`doc-voltar`, volta para a tela **Orçamentos**) + nome do item em edição (`doc-titulo`, espelha `nome-peca`/`nome-produto` ao vivo; padrão `Nova peça` em peso 500 quando vazio; tocar no título foca o campo do nome). Sem mini-foto, sem metadados, sem abas no topo: a identidade visual (fotos, categoria) vive no cartão **0. A peça** — uma fonte por tela.
- Cartão **0. A peça**: seção numerada como as demais; é a **única** identidade — foto, nome, "pra quem é" e categoria não se repetem em outro lugar da tela. Ordem: **nome primeiro**, depois "pra quem é" e categoria, e **Fotos** como campo final (foto é suporte, não porta de entrada).
- Nome da peça: rótulo `13px peso 600 uppercase tinta-suave`; input de identidade (`input-hero`: `19px peso 600 tinta`, padding `14px`, cantos `12px`) — o título da etiqueta.
- Galeria (campo **Fotos**, rótulo com dica "opcional — a 1ª vira capa"): capa `3:2`, cantos `14px`; **vazia** mostra um painel quente (`--fundo-alt`) com ícone da peça (`argila`, 30px) + microcopy "Adicionar foto / ajuda a reconhecer a peça depois" (min-height `120px`, nunca um vão de 4:3 vazio); com foto mostra a capa (`cover`).
- Ação sobre a capa: chip fantasma `trocar` (`12px`, `tinta-suave`, fundo `cartao`) no canto inferior direito — abre o seletor e **substitui** a capa.
- Miniaturas: fileira de quadrados `64px`, `1px linha`, cantos `8px`; última é o tile `+` (adiciona, aceita múltiplas). Cada miniatura tem `✕` circular translúcido para remover.
- Capa indicada: miniatura ativa com borda `1.5px argila` + tag `capa`; tocar numa miniatura a torna capa.
- Status de salvamento (`doc-status`): `tinta-suave`, na barra de marca; idle: ícone sozinho; salvando: `Salvando…` + ponto pulsante; salvo: `Salvo HH:MM`.
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
| `doc-status: salvando`  | nuvem `14px tinta-suave` + ponto `6px #c9b896` com `pulse 1s` + texto `Salvando…` `11px tinta-suave` |
| `doc-status: salvo nuvem` | nuvem ok `14px` + texto `Salvo HH:MM` `11px tinta-suave`; após 2.5s → idle |
| `doc-status: offline`    | nuvem off `14px terracota` + texto `Sem nuvem` `11px tinta-suave` |
| `doc-status: idle`      | nuvem ok `14px tinta-suave` sem texto, sem ponto |
| galeria vazia           | painel `--fundo-alt` (min-height `120px`), borda tracejada `1.5px linha-forte`, ícone da peça `argila` 30px + `Adicionar foto` / `ajuda a reconhecer a peça depois` `tinta-suave`; toque abre o seletor |
| galeria com capa        | capa `cover` em área `3:2`, cantos `14px`; chip `trocar` canto inferior direito (`cartao`, `12px`) |
| miniatura               | `64px`, `1px linha`, cantos `8px`, botão `✕` circular translúcido (`rgba(46,42,37,.55)`, texto `cartao`) no canto superior direito; remover pede confirmação |
| miniatura capa          | borda `1.5px argila` + tag `capa` (`argila`/`cartao`, `8px`) |

### Interações

- `doc-status` é só informativo (`aria-live="polite"`), sem card nem borda; reflete o `storage.gravar` (autosave 700ms, flush no `pagehide`/`visibilitychange`/troca de tela).
- Galeria: `+` / capa vazia abre o seletor; o seletor aceita **várias** fotos (append). `·trocar·` substitui a capa no lugar. `✕` na miniatura remove (confirmado); remover a capa promove a próxima. Tocar numa miniatura a torna capa. A **capa** é a única foto persistida no v1 (`foto` no doc; ver persistência).
- Nome/cliente/categoria alimentam o salvamento e o rascunho automático; sem espelho no cabeçalho.
- Campos numéricos usam teclado numérico no celular (`inputmode="decimal"/"numeric"`).
- Steppers de tempo: toques `−`/`+` (passo 15min nos minutos); atalhos rápidos preenchem horas/minutos.
- Toggle de tipo preserva o estado do tipo não ativo.
- Ao tocar "Calcular preço": o resultado entra com `fade + translateY(4px→0)`, 200ms.
- Ao salvar: feedback `verde-argila` no lugar do botão por 2s.

### Acessibilidade

- Chips de dificuldade funcionam como radio group (um por vez, navegável por seta).
- Steppers e checkboxes são alvos ≥ 44px.
- Botões principais da galeria (capa, `+`, `trocar`) são alvos ≥ 44px; o `✕` de remoção é compacto (22px) e sempre pede confirmação antes de remover.
- Contraste de texto sobre `cartao`/`papel`: sempre ≥ 4.5:1.