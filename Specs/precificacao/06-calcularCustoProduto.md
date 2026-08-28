# Calcular custo de produto (`calcularCustoProduto`)

ZenSpec de programa. Este programa existe para que **a ceramista veja o custo de um produto** (lote fabricado a partir de uma receita em gramas) **e o preço em cada linha** — sem conta manual.

Programa puro (regra `DenaroEngSpec.md` §3): `calcularCustoProduto(inputs, config)` devolve um **objeto resultado** (nunca escreve DOM). Fórmula em `07-modelo-de-precificacao.md` §4.

---

## Intenção

Esta feature existe para que **a ceramista** consiga **descobrir o custo e o preço de venda de produtos feitos em lote** (giz, aquarela, caixas) — sem **planilha ou decoreba**.

---

## Conceito

O produto começa de uma **receita em gramas** (Σ insumo × preço/kg) dividida pelas **unidades produzidas**, soma **embalagem**, **montagem** (mão de obra) e **risco**; aplica **taxas** (regime + canal) e multiplica pela **linha comercial** (Autoral/Profissional/Essencial).

Metáfora: é a **calculadora do lote** — entra a receita, sai o preço da caixa.

---

## Lógica

### Fluxo

```
pricingPanel → normalizar → calcularCustoProduto(inputs, config) → PricingResult → renderResultado (tela)
```

### Regras (ordem exata)

```
custoReceita     = Σ (gramas/1000 × precoKg) de cada insumo da receita
custoPorUnidade  = custoReceita ÷ unidadesProduzidas
custoEmbalagem   = Σ (qtd × preco) dos itens de embalagem (por unidade)
montagem         = tempoMontagemHoras × custoHoraTotal   ← realidade do código (ver nota)
risco            = taxaPerda × (custoPorUnidade + montagem)
custoTotal       = custoPorUnidade + custoEmbalagem + montagem + risco
taxas            = impostoPorRegime + canalTotal
custoComTaxas    = custoTotal ÷ (1 − taxas)
precoPorLinha    = custoComTaxas × multiplicadorDaLinha
```

> **Nota de divergência (registrada):** `07-modelo-de-precificacao.md` §4.2 prevê `montagem × custoHoraPessoa`, mas o código usa `custoHoraTotal` (embute os fixos rateados). Como o comportamento atual é o que a ceramista aprovou, **o código é a realidade**; o exemplo do modelo (§4.3) precisa de revisão quando o modelo for atualizado. Não mudar o número sem decisão explícita (regra: nada do visual muda).

### Contrato

Entrada (`inputs` — montado pelo `pricingPanel`, que resolve catálogo/taxas na fronteira):

- `unidades`: number ≥ 1.
- `tempoMontagemHoras`: number ≥ 0 (`prodH + prodM/60`).
- `receita`: `[{ gramas, precoKg }]` (insumos do catálogo já resolvidos).
- `embalagem`: `[{ qtd, preco }]`.
- `custoHoraTotal`: number (embute os fixos rateados — ver nota de divergência abaixo).
- `taxaPerda`: number (nível de perda).
- `imposto`: number (regime fiscal).
- `canalPct`: number (Σ comissões do canal).

`config` = `CONFIG` (usa `linhasProduto`).

Saída (`PricingResult`):

- `custoReceita`, `porUnidade`, `custoEmbalagem`, `montagem`, `risco`, `custoTotal`, `taxas`, `custoComTaxas`.
- `linhas`: `[{ nome, mult, sub, preco }]`.

Erros:

- `unidadesProduzidas = 0` → erro de validação (não divide por zero).

### Edge cases

- `tempoMontagemHoras = 0` → montagem 0 (permitido).
- Receita vazia → `custoReceita = 0`.
- `taxas ≥ 1` → não divide por zero; validação.

### Critérios de aceitação

- Mesmos inputs → mesmos custos e preços (determinístico).
- Conferência: caixa de aquarela 7 cores — `custoReceita ≈ 41,75`, embalagem R$12, montagem conforme a nota acima, `custoComTaxas` com imposto + canal.

---

## Interface

Sem interface própria — renderizado pelo `pricingPanel`. Ver `01-pricingPanel.md`.