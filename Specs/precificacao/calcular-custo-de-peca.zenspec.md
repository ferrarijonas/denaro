# Calcular custo de peça (`pricingEngine`)

ZenSpec de programa. Este programa existe para que **a ceramista veja o custo de uma peça** (material + acessórios + embalagem + mão de obra + queima + risco + frete + taxas) **e o preço em cada linha comercial** — sem conta manual.

Programa puro (regra `DenaroEngSpec.md` §3): `calcularCustoPeca(inputs, config)` devolve um **objeto resultado** (nunca escreve DOM). A fórmula exata vive em `modelo-de-precificacao.md` §3 (validada número a número contra as planilhas).

---

## Intenção

Esta feature existe para que **a ceramista** consiga **descobrir o custo real e o preço de venda em várias margens** de uma peça — sem **planilha, decoreba ou medo de cobrar errado**.

---

## Conceito

A peça soma: **material** (argila do catálogo × peso + esmalte em R$), **acessórios** e **embalagem** (Σ qtd × preço), **mão de obra** (tempo × custo da hora com fator de dificuldade), **queima** (do forno escolhido, via `estimarCabem`), **risco/refação** (taxa de perda sobre material + mão de obra + queima), **frete** (quando embutido) e **taxas** (regime fiscal + canal). O preço por linha é `custoComTaxas ÷ (1 − margem)`.

Metáfora: é a **calculadora da peça** — entra o custo de fazer, sai o preço de vender.

---

## Lógica

### Fluxo

```
pricingPanel → normalizar → calcularCustoPeca(inputs, config) → PricingResult → renderResultado (tela)
```

| Programa        | Recebe            | Faz                                        | Manda para       |
| --------------- | ----------------- | ------------------------------------------ | ---------------- |
| `pricingEngine` | `inputs` + config | calcula custo + preços por linha de peça   | `pricingPanel`   |

### Regras (ordem exata — `modelo-de-precificacao.md` §3.3)

```
custoArgila     = kgsArgila × precoKgArgila (catálogo)
custoMaterial   = custoArgila + esmalteReais
custoAcessorios = Σ (qtd × preco) dos acessórios
custoEmbalagem  = Σ (qtd × preco) dos itens de embalagem
maoDeObra       = tempoHoras × (custoHoraTotal × fatorNivel)  ← nível (aprendiz/profissional/especialista)
queima          = custoQueimaTotal (Σ por tipo, via estimarCabem)
riscoRefacao    = taxaPerda × (custoMaterial + maoDeObra + queima)
freteNaConta    = frete ÷ max(1, pecasNoEnvio)  quando fretePagante = "atele" (frete grátis); senão 0
custoTotal      = custoMaterial + custoAcessorios + custoEmbalagem + maoDeObra + queima + riscoRefacao + freteNaConta
taxas           = impostoPorRegime + canalTotal
custoComTaxas   = custoTotal ÷ (1 − taxas)
precoPorLinha   = custoComTaxas ÷ (1 − margemDaLinha)
```

> A mão de obra de peça usa `custoHoraTotal` (já embute os custos fixos rateados); a de produto usa `custoHoraPessoa`. `horaAtelie` e `custoHoraTotal` vêm dos custos fixos (ver `Specs/custos/editar-custos-de-referencia.zenspec.md`).

### Contrato

Entrada (`inputs` — montado pelo normalizador):

- `kgsArgila`: number ≥ 0 (peso da argila, kg).
- `esmalteReais`: number ≥ 0.
- `tempoHoras`: number ≥ 0 (tempo em decimal; h + min/60).
- `dificuldade`: 1–5 (UI) → fator interno via `CONFIG.fatores`.
- `nivel`: `"aprendiz" | "profissional" | "especialista"` → multiplicador `CONFIG.niveis`.
- `acessorios`, `embalagem`: listas `{ item, qtd }` com preço do catálogo.
- `queimas`: `[{ tipo, forno }]` + `semQueima` (bool).
- `frete`: valor (R$) e `fretePagante` (`"cliente" | "atele"`), `pecasNoEnvio`.
- `medidas`: objeto do tamanho da peça (para `estimarCabem`).
- `argilaSelecionada` (nome) e `canal`.

Saída (`PricingResult`):

- `custoArgila`, `custoMaterial`, `custoAcessorios`, `custoEmbalagem`, `maoDeObra`, `queima`, `risco`, `frete`, `custoTotal`, `custoComTaxas`.
- `linhas`: `[{ nome, margem, sub, preco }]`.

Erros:

- `PricingInputError` → campo apontado; nunca retorna preço parcial.

### Edge cases

- `kgsArgila = 0` → custoArgila 0; preços seguem sobre o restante.
- `esmalteReais = 0` → custoEsmalte 0.
- `tempo = 0` → mão de obra 0.
- `taxas ≥ 1` (soma 100%+) → não divide por zero; validação.
- `estimarCabem.total = 0` (peça não cabe) → queima por peça usa a unidade do forno (kg/cm³/peça) mesmo assim; sem erro.

### Critérios de aceitação

- Mesmos inputs → mesmos custos e preços (determinístico; validado pelo harness contra `modelo-de-precificacao.md` §3.4).
- Exemplo conferido: peso 0,4 · esmalte R$5 · tempo 0,5h · dificuldade 1 · embalagem papel R$2 + etiqueta R$1 → custoTotal R$ 35,23 · c/taxas R$ 37,08 (imposto 5%) · exclusiva R$ 92,48 · padrão R$ 67,26 · revenda R$ 52,84.

---

## Interface

Sem interface própria — o resultado é renderizado pelo `pricingPanel` (custo detalhado + linhas de preço). Ver `apresentar-calculadora-no-celular.zenspec.md`.

### Acessibilidade

- Resultado sempre em texto (nunca só cor); valores tabulares alinhados.