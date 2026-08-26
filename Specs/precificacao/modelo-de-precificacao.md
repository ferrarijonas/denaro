# Modelo de precificação do Alice

Fonte da verdade da fórmula de cálculo, extraída e validada contra as planilhas `Orcamentos Alice.xlsx`, `Custos esmaltes .xlsx` e `ALICE - Custos Aquarelas .xlsx`. Todo cálculo do sistema segue este modelo, que é derivado de `AliceConceptSpec` e `AliceEngSpec`.

---

## 1. Dois tipos de item

O Alice precifica **dois tipos** de item, como as planilhas fazem:

| Tipo    | O que é                                  | Exemplo nas planilhas                       | Modelo de custo                          |
| ------- | ---------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| **Peça** | Peça de cerâmica unitária (feita à mão)  | Copo, prato, vaso (`Conj_Entrelinhas_*`)    | Argila + esmalte + mão de obra + embalagem + risco + taxas |
| **Produto** | Lote fabricado a partir de uma receita em gramas | Giz, aquarela, caixa de 7 cores (`Giz_*`, `Aquarela_*`) | Receita em gramas + embalagem + montagem + taxas |

O tipo é escolhido na tela de precificação (toggle Peça / Produto). Cada tipo tem seções próprias de entrada.

---

## 2. Custos de referência (configuração central)

Os custos de referência vêm de três blocos que as planilhas já têm, e alimentam os dois tipos.

### 2.1 Custos fixos → custo da hora

Os custos fixos são **mensais** e divididos em **dois blocos** (conforme `editar-custos-de-referencia.zenspec.md`):

**Bloco Mão de obra & pessoal** — salário + impostos sobre o salário + tempo de trabalho:

- Itens: Salário (3.500), Impostos do salário / INSS / IR (0).
- Parâmetros: horas trabalhadas por dia (8), dias por mês (22) → horas/mês (176).
- **Hora pessoa = só o Salário ÷ horasMes.** Impostos do salário e freelas entram no total gastos, mas **não** na hora pessoa.

**Despesas fixas do ateliê** — 5 categorias:

| Categoria                     | Itens pré-cadastrados (das planilhas)                          |
| ----------------------------- | -------------------------------------------------------------- |
| `Espaço & contas`             | Água (50), Manutenção do espaço (50), CEMIG / luz (600), Internet (50) |
| `Freelas & terceirizados`     | Freelas / ajudantes (0)                                         |
| `Serviços & digital`          | Contador (300), Site (100), Imposto (600)                      |
| `Equipamentos & manutenção`   | Empréstimo forno (300), Manutenção forno (100), Ferramentas (10), Fluke (10) |
| `Suprimentos & provisões`     | Café (30), Papel higiênico (5), Papel toalha (30), Detergente (5), Embalagens internas (20), Insumos bolo (20), Cursos (0), Escambo/presentes (200) |

| Campo                          | Fórmula                              | Exemplo real (planilha)    |
| ------------------------------ | ------------------------------------ | -------------------------- |
| `totalCustosFixos`             | **Σ Mão de obra & pessoal + Σ das 5 categorias** (automático, nunca digitado) | 5.980 |
| `salarioMensal`                | valor do item **Salário** da Mão de obra (não soma impostos/freelas) | 3.500 |
| `horasMes`                     | horas/dia × dias/mês                 | 8 × 22 = 176               |
| `custoHoraPessoa`              | `salarioMensal / horasMes`           | 3500/176 = R$ 19,89        |
| `custoHoraTotal`               | `totalCustosFixos / horasMes`        | 5980/176 = R$ 33,98        |

- `custoHoraPessoa` é usado na **mão de obra de montagem de produtos**.
- `custoHoraTotal` é usado na **mão de obra de peças** (já inclui o custo fixo rateado).
- **Regra:** `totalCustosFixos`, `custoHoraPessoa` e `custoHoraTotal` são **sempre derivados** da soma dos itens — a tela não permite digitá-los. A Alice edita apenas itens, categorias e parâmetros de hora (horas/dia, dias/mês).
- **Rateio e faturamento médio não existem mais** na tela: `custoHoraTotal` já embute os custos fixos por hora, e faturamento médio não participa de nenhum cálculo.

### 2.2 Insumos / matérias-primas

Tabela `Nome | Unidade | Preço`. Exemplos reais:

| Nome                          | Unidade | Preço |
| ----------------------------- | ------- | ----- |
| Argila Comum                  | Kg      | R$ 7,00  |
| Argila São Simão em Pó        | Kg      | R$ 13,00 |
| Feldspato Potássico           | Kg      | R$ 5,30  |
| Quartzo                       | Kg      | R$ 5,30  |
| Zirconita                     | Kg      | R$ 100,00 |
| ox Cobalto                    | Kg      | R$ 900,00 |
| Pigmento vermelho             | Kg      | R$ 360,00 |
| Frita 3134                    | Kg      | R$ 55,00  |
| Polietilenoglicol             | Kg      | R$ 145,00 |
| Glicerina bidestilada         | Litro   | R$ 33,00  |

### 2.3 Embalagem / acessórios

Tabela `Nome | Unidade | Preço`. Exemplos reais:

| Nome                                      | Unidade | Preço |
| ----------------------------------------- | ------- | ----- |
| CAIXA GIZ 7 CORES 15X9                    | un      | R$ 9,00  |
| CAIXA AQUARELA 7 CORES 12x12              | un      | R$ 12,00 |
| CAIXA 16X11X10 (envio)                    | un      | R$ 4,00  |
| Papel 10X10 dentro caixa                  | un      | R$ 0,50  |
| Etiqueta térmica 100X150                  | un      | R$ 1,00  |
| Etiqueta adesiva 50X140                   | un      | R$ 1,00  |
| Plástico bolha                            | un      | R$ 2,00  |
| Feltro padrão camurça                     | m       | R$ 30,00 |
| Pote aquarela                             | un      | R$ 1,50  |
| Saco papel M                              | un      | R$ 0,80  |
| Fio (acessório)                           | un      | R$ 1,00  |
| Motor (acessório)                         | un      | R$ 5,00  |
| Transporte / ida transportadora           | un      | R$ 2,00  |

---

## 3. Regras de cálculo — Peça

### 3.1 Entradas

- `kgsArgila`: number > 0
- `esmalteReais`: number ≥ 0 (custo do esmalte em **reais**, não em %)
- `tempoHoras`: number > 0 (entrado em horas e minutos; convertido para decimal interno)
- `dificuldade`: 1 | 2 | 3 | 4 | 5 (UI) → fator interno
- `acessorios`: lista `{ item, qtd }` (ex.: fio, motor)
- `embalagem`: lista `{ item, qtd }` (caixas, papéis, etiquetas, bolha, transporte)
- `queima`: `{ onde: "forno"|"servico"|"nenhuma", ciclos: 0|1|2, pecasNaCarga: number }` (config de fornos em `fornosPanel`, ver `Specs/queima/editar-fornos-e-queima.zenspec.md`)
- custos de referência: `precoKgArgila` (**vem do catálogo de insumos**, item "Argila Comum", não é cadastrado na aba Fixos), `custoHoraTotal`, `taxas`, `margensPorLinha`, `taxaPerda`, `fatorDificuldade`, `rateioFrete`

### 3.2 Fator de dificuldade

| Dificuldade (UI) | Fator interno (multiplicador) |
| ---------------- | ----------------------------- |
| 1                | 1,0                           |
| 2                | 1,2                           |
| 3                | 1,4                           |
| 4                | 1,6                           |
| 5                | 1,8                           |

O usuário vê **1 a 5**; o cálculo usa o multiplicador até **1,8**, como nas planilhas.

### 3.3 Contas (ordem exata)

```
custoArgila     = kgsArgila × precoKgArgila
custoMaterial   = custoArgila + esmalteReais
custoAcessorios = Σ (qtd × preco) dos acessórios
custoEmbalagem  = Σ (qtd × preco) dos itens de embalagem
maoDeObra       = tempoHoras × custoHoraTotal × fatorDificuldade
custoQueima     = (custoPorQueima ÷ pecasNaCarga) × ciclos      ← R20; sem queima = 0
riscoRefacao    = taxaPerda × (custoMaterial + maoDeObra + custoQueima)
custoTotal      = custoMaterial + custoAcessorios + custoEmbalagem + maoDeObra + custoQueima + riscoRefacao + rateioFrete
rateioFrete     = valorFrete ÷ max(1, pecasNoEnvio)      ← divisão automática (métodos pagos)
custoComTaxas   = custoTotal ÷ (1 − Σ taxas)      ← modo líquido (padrão Etsy; peças e produtos)
precoPorLinha   = custoComTaxas ÷ (1 − margemDaLinha)   ← margem é % do preço de venda
```

> **Escala de perda (R14):** `taxaPerda` é uma escala de 3 níveis (`CONFIG.perdas`): **Baixa 15%**, **Média 30%** (default), **Alta 45%**. Justificativa internacional: a perda real de ateliê soma **alocação de matéria-prima (15–20%)** + **quebra/refação (10–20%)** + **promocionais e seconds monetizados com desconto** (East Fork vende a 30%), que a literatura internacional trata separadamente mas o ateliê sente junto. A escala usa o valor do nível selecionado (`CONFIG.perdaNivel`).

> **Queima (R19–R24):** `custoPorQueima` vem do `fornosPanel` (`Specs/queima/editar-fornos-e-queima.zenspec.md`) — forno próprio (no v1: energia `kW × horas × dutyCycle × precoKwh`, ou valor digitado; desgaste/mão de obra/overhead em R25) ou serviço externo (tarifa por kg/peça/carga). `peçasNaCarga` é **estimada** pelo app (R24): por peso (capacidade do forno em kg ÷ `kgsArgila`) ou por tamanho para peças largas (prato/travessa). `ciclos`: 0 (sem queima), 1 (single-fire/raku) ou 2 (bisque + esmalte, padrão). Peça sem queima → custo 0. Onde a energia do forno já está no custo fixo, energia = 0 (sem dupla contagem). `custoQueima` também entra na base do risco/refação (a quebra acontece na queima).

### 3.4 Verificação contra os custos fixos pré-cadastrados

Com os 20 itens pré-cadastrados (§2.1): `totalCustosFixos=5.980`, `salario=3.500`, `horasMes=176` → `custoHoraTotal=33,98`. Com `kgsArgila=0,4`, `esmalte=R$5`, `tempo=0,5h`, `dificuldade=1` (fator 1,0), `embalagem= papel R$2 + etiqueta R$1`:

- custoArgila = 0,4 × 7 = 2,80
- custoMaterial = 2,80 + 5,00 = 7,80
- custoEmbalagem = 2,00 + 1,00 = 3,00
- maoDeObra = 0,5 × 33,98 × 1,0 = 16,99
- riscoRefacao = taxaPerda(média 0,3) × (7,80 + 16,99) = 7,44
- custoTotal = 7,80 + 3,00 + 16,99 + 7,44 = 35,23
- custoComTaxas = 35,23 ÷ 0,95 = 37,08 (imposto 5%)
- exclusiva = 36,99 ÷ 0,40 = 92,48 | padrão = 36,99 ÷ 0,55 = 67,26 | revenda = 36,99 ÷ 0,70 = 52,84

**Conferência contra a planilha:** a mesma fórmula com o config da aba `Alice_Custos_FUNCIONA` (total 6.880 → hora total 39,09) reproduz os valores dela: custo 38,55 ✓, c/taxas 40,48 ✓, revenda 57,83 ✓, padrão 73,60 ✓, exclusiva 101,20 ✓. A fórmula é 1:1; muda apenas o config de custos fixos.

Resultado idêntico ao da planilha quando os mesmos custos de referência são usados.

### 3.5 Linhas de margem de peça (padrão sugerido)

| Linha      | Margem (do preço) | Contexto                                   |
| ---------- | ----------------- | ------------------------------------------ |
| Exclusiva  | 0,60              | Peça autoral única, sob encomenda          |
| Padrão     | 0,40–0,45         | Peça de catálogo                           |
| Revenda    | 0,25–0,30         | Lojista / pedido recorrente                |

---

## 4. Regras de cálculo — Produto

### 4.1 Entradas

- `receita`: lista `{ insumo, gramas }` (minerais da receita)
- `unidadesProduzidas`: number > 0 (quantas unidades o lote rende)
- `tempoMontagemHoras`: number ≥ 0 (mão de obra de montagem por lote ou por unidade — ver nota)
- `embalagem`: lista `{ item, qtd }` (potes, caixas, papéis, etiquetas, bolha)
- custos de referência: catálogo de insumos (preço/kg), `custoHoraPessoa`, `taxas`, `linhas`

### 4.2 Contas (ordem exata)

```
custoReceita     = Σ (gramas/1000 × precoKg) de cada insumo
custoPorUnidade  = custoReceita ÷ unidadesProduzidas
custoEmbalagem   = Σ (qtd × preco) dos itens de embalagem (por unidade)
maoMontagem      = tempoMontagemHoras × custoHoraPessoa × fatorDificuldade(1,0 se não aplicável)
custoTotal       = custoPorUnidade + custoEmbalagem + maoMontagem
custoComTaxas    = custoTotal ÷ (1 − Σ taxas)      ← divisor (convenção dos produtos)
precoPorLinha    = custoComTaxas × multiplicadorDaLinha
```

### 4.3 Verificação contra `Aquarela_Caixa_7Elementos_JUN26`

- custoReceita (Σ 7 aquarelas) ≈ R$ 41,75 (planilha `Insumos produto` = 41,75)
- mão de obra montagem = 0,2h × 19,89 = 3,98 ✓
- embalagem envio = R$ 12 ✓
- custoTotal = 41,75 + 3,98 + 12 = 57,73 ✓
- custoComTaxas = 57,73 ÷ (1 − 0,12) = 65,60 ✓ (imposto 6% + NuvemShop 6%)
- preços por linha = custoComTaxas × linha (Autoral/Profissional/Essencial)

### 4.4 Linhas de produto (padrão sugerido)

| Linha        | Multiplicador | Contexto            |
| ------------ | ------------- | ------------------- |
| Autoral      | 3,0           | Peças/cores autorais |
| Profissional | 2,5           | Linha profissional  |
| Essencial    | 2,0           | Atacado/essencial    |

> **Nota de consistência:** a planilha registra multiplicadores 2,0/1,5/1,0 na coluna "Margem", mas os valores calculados por linha usam 3,0/2,5/2,0 sobre o custo com taxas. Este spec adota o que a planilha **calcula de fato** (3,0/2,5/2,0). Multiplicadores são configuráveis em `costsPanel`.

---

## 5. Taxas e canais (configuráveis)

> **Modelo 2026 (registro R10):** as taxas agora vêm de **dois lugares**: o **regime fiscal** (informal/MEI/Simples → imposto por venda) e o **canal de venda** (ficha pré-salva com a pilha de comissões do canal). Elo7 encerrou em 05/2026 e foi substituído por Mercado Livre e Etsy no seletor. Detalhes e tabelas de taxas reais em `padrao-ouro-2026-pesquisa.md` §5–6.

| Taxa                    | Padrão 2026                        | Aplicada a            |
| ----------------------- | ---------------------------------- | --------------------- |
| `imposto (regime)`      | Informal 0% · MEI 0%/venda (DAS fixo mensal) · Simples 4,5% (Anexo II indústria) | Peças e produtos |
| `taxa do canal`         | soma das comissões do canal escolhido (Pix 0,99%, cartão 3,29–5,69%, ML 10–19%, Etsy 6,5%) | Peças e produtos |
| `taxaPerda` (risco)     | Escala: Baixa 15% · **Média 30%** · Alta 45% | Peças e produtos (R14) |
| `rateioFrete`           | R$ 0–5 (ou cenário de transporte, ver §7) | Peças          |

**Canais pré-salvos (fichas editáveis em `costsPanel`):** Direto/Pix (Pix 0,99%), Site/NuvemShop (cartão 4,99% + TPV 2%), Feira/maquininha (cartão 3,5% + Pix 0,99%), Mercado Livre (comissão 13% + cartão 4,99%), Etsy (comissão 6,5% + taxa de pagamento 4%).

**Regra fiscal (poka-yoke):** pergunta única "Como você emite a venda?" → Informal / MEI / Simples → aplica o imposto certo automaticamente. MEI paga DAS fixo (não incide por venda).

---

## 6. Edge cases (comuns aos dois tipos)

- `kgsArgila = 0` → custoArgila 0; preços por margem ainda calculados sobre o restante.
- `esmalteReais = 0` → custoEsmalte 0.
- Receita com `unidadesProduzidas = 0` → erro de validação (não divide por zero).
- `tempo = 0` → mão de obra 0 (permitido em produtos; em peças é validado como > 0).
- Custos de referência ausentes (argila, custo hora, insumo da receita) → falha explícita com orientação a `costsPanel`.
- Margem = 1 (100%) → divisão por zero → erro de validação (margens ficam < 1).
- Resultado com custo 0 → cartões mostram `—` em vez de R$ 0,00.

---

## 7. Escopo fora deste modelo

- Importação automática das planilhas (fica no escopo futuro). Os valores aqui são referência para o v1.
- **Tarifas de quem queima comigo** (receita do forno) — config existente no `fornosPanel`, mas a tela de "fechar fornada" (quanto cobrar de cada pessoa) fica para um módulo futuro.
- Contabilidade/financeiro completo, estoque.

> **Queima dentro do escopo:** o custo de queima por peça individual **entrou no modelo** (R19–R23, §3.3) via `fornosPanel` — `Specs/queima/editar-fornos-e-queima.zenspec.md`. Antes a queima só entrava no custo fixo via `custoHoraTotal`; agora é custo direto opcional, com guarda anti-dupla-contagem com a "luz" dos Fixos.

---

## 8. Transporte / frete — método de entrega + divisão automática (padrão Etsy 2026)

O frete da peça segue o padrão internacional (Etsy shipping): **o comprador paga o transporte**, e o app pergunta o **método de entrega** em chips — o rateio não é um método separado, é uma regra automática:

| Cenário                 | Modelo padrão Etsy           | Cálculo no app                                          |
| ----------------------- | ---------------------------- | ------------------------------------------------------- |
| **Entrego eu mesma**    | Local delivery (fixo local)  | `frete = valor digitado ÷ max(1, peças no envio)`       |
| **Vai pelos Correios**  | Standard shipping            | `frete = valor estimado digitado ÷ max(1, peças no envio)` |
| **Ela retira aqui**     | Local pickup                 | `frete = 0` (sem campo, sem peças)                      |
| **Peças no mesmo envio**| Combined shipping automático | divide o frete entre as peças; 1 peça = sem divisão     |

**Quem paga (R18, consenso 3 países):** decisão por peça em 2 perguntas — método (acima) + **pagante**: `à parte` (default) → frete NÃO entra no custo, é repasse informativo; `frete grátis` → frete entra no custo e sobe com margem, badge "Frete grátis pra ela". Retirada pula ambas. Regra: **frete nunca entra no preço sem escolha consciente**.

Regra: o frete entra em `custoTotal` (antes das taxas) **somente quando embutido**, como `rateioFrete`. O modo default é "Entrego eu mesma" (R$ 0 até digitar). Detalhes em `padrao-ouro-2026-pesquisa.md` §4.
