# Precificação — Spec de módulo

Spec de módulo do domínio `precificacao` do Denaro. Define conceito, regras de negócio e a Interface. Contratos campo-a-campo de cada programa vivem nas ZenSpecs filhas desta pasta.

---

## Intenção

Esta feature existe para que **a ceramista e sua ajudante** consigam **descobrir o preço de venda de uma peça em várias margens** sem precisar de **contas manuais ou planilhas**.

---

## Conceito

A precificação transforma dados simples de uma peça (peso da argila com catálogo, custo do esmalte em reais, tamanho/medidas, dificuldade artística, tempo de execução, queima, embalagem, frete) em um **custo auditável** e em **preços de venda por margem**. O custo é composto de material (argila + esmalte), acessórios/embalagem, mão de obra (tempo × valor da hora × fator de dificuldade), queima (forno escolhido) e risco/refação, mais taxas (regime fiscal + canal) e frete.

Metáfora: a precificação é a **etiquetadora** — entra o que a peça "custa de fazer", sai quanto ela "deve custar para vender".

---

## Programas

O domínio `precificacao` reúne os motores de cálculo e o painel. Cada programa é uma **função pura com contrato** (regra `DenaroEngSpec.md` §3) — entrada → saída, sem tocar DOM. A fiação (leitura do formulário, escrita na tela) vive no `pricingPanel`.

| Programa (spec)                                  | Função no código        | Recebe                                        | Devolve                          |
| ------------------------------------------------ | ----------------------- | --------------------------------------------- | -------------------------------- |
| `pricingInputNormalizer` (normalizar-entradas)   | leitura do form + `lerMedidas` | raw do formulário                      | `PricingInput` (objeto plano)    |
| `pricingEngine` (calcular-custo-de-peca)         | `calcularCustoPeca`     | `PricingInput` + config                       | `PricingResult` (custo + linhas) |
| `productEngine` (calcular-custo-de-produto)      | `calcularCustoProduto`  | `ProductPricingInput` + config                | `PricingResult`                  |
| `medirTamanho` (medir-tamanho-da-peca)           | `lerMedidas` + `cubagem`| formato + medidas (cm)                        | `medidas` + `cubagemCm3`         |
| `ocupacaoEngine` (em `Specs/queima/`)            | `estimarCabem`          | tipo + forno + medidas                        | `{ total, porNivel, niveis, mode }` |
| `renderForno` (desenhar-forno)                   | `desenharForno`         | medidas + forno + `estimarCabem`              | string SVG                        |
| `pricingPanel` (apresentar-calculadora)          | camada DOM do `index.html` | toques + resultados                      | estados visuais                   |

Fluxo geral:

```
formulário → normalizar (PricingInput) → pricingEngine|productEngine → PricingResult → pricingPanel (render)
formulário → medirTamanho (medidas) → ocupacaoEngine (estimarCabem) → renderForno (SVG) → pricingPanel
```

---

## Regras do domínio (resumo)

- Se peso da argila = 0 → custo de material = 0 e a conta segue com esmalte = 0.
- Se esmalte (R$) = 0 → custo de esmalte = 0.
- Dificuldade ∈ {1, 2, 3, 4, 5} → fator interno (1,0 / 1,2 / 1,4 / 1,6 / 1,8).
- Se tempo de execução = 0 → custo de mão de obra = 0.
- Preço por linha = `custoComTaxas ÷ (1 − margem)` (peça) ou `custoComTaxas × multiplicador` (produto).
- `estimarCabem` é a **fonte única** de "quantas cabem" — usada pelo custo de queima e pelo render.
- O modelo completo, número a número, vive em `modelo-de-precificacao.md`.

---

## Contratos

Os contratos campo-a-campo dos programas vivem nas ZenSpecs filhas desta pasta:

- `medir-tamanho-da-peca.zenspec.md` — formato, medidas, cubagem, slider proporcional + bind por campo.
- `desenhar-forno.zenspec.md` — render SVG determinístico do forno (biscoito/esmalte).
- `calcular-custo-de-peca.zenspec.md` — `pricingEngine`.
- `calcular-custo-de-produto.zenspec.md` — `productEngine`.
- `normalizar-entradas.zenspec.md` — `pricingInputNormalizer`.
- `apresentar-calculadora-no-celular.zenspec.md` — `pricingPanel` (UI).
- Ocupação e fornos: `Specs/queima/calcular-ocupacao-do-forno.zenspec.md` e `Specs/queima/editar-fornos-e-queima.zenspec.md`.

---

## Edge cases

- `raw` fora do formato → erro de validação com campo apontado.
- Peso, esmalte, tempo, dificuldade ou medidas inválidos → erro de validação, sem cálculo parcial.
- Custos de referência ausentes (argila ou valor da hora sem cadastro) → banner suave com link para `costsPanel`.
- Peça maior que o forno → `estimarCabem` devolve `total: 0`; render mostra "não cabe".

---

## Critérios de aceitação

- Para os mesmos dados de entrada, o custo e os preços por margem são sempre iguais (determinístico).
- Todo valor exibido tem origem rastreável nas contas de material, mão de obra, queima e risco.
- O harness `tools/snapshot.js` valida que refatorações não mudam a saída dos programas puros.

---

## Interface

A tela de precificação (mobile-first) é detalhada na ZenSpec de `pricingPanel` (`apresentar-calculadora-no-celular.zenspec.md`). Resumo:

- Escolha do tipo: **Peça / Produto** (cards iniciais).
- Seções da peça: Insumos (argila + esmalte + tamanho + acessórios), Mão de obra, Queima, Canais, Entrega.
- Abaixo, o custo detalhado e os cartões com o preço de venda em cada linha.
- Botão "Salvar peça" e link "Editar custos" quando faltar custo de referência.