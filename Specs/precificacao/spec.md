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

O domínio `precificacao` reúne os motores de cálculo e o painel. Cada programa é uma **função pura com contrato** (regra `DenaroEngSpec.md` §3) — entrada → saída, sem tocar DOM. **O nome do programa é o nome da função no código.** A fiação (leitura do formulário, escrita na tela) vive no `pricingPanel`.

| Programa (arquivo = nome)                       | Recebe                                        | Devolve                          |
| ----------------------------------------------- | --------------------------------------------- | -------------------------------- |
| `lerMedidas` (`lerMedidas.zenspec.md`)          | raw do formulário                             | `PricingInput` (objeto plano)    |
| `calcularCustoPeca` (`calcularCustoPeca.zenspec.md`) | `PricingInput` + config                  | `PricingResult` (custo + linhas) |
| `calcularCustoProduto` (`calcularCustoProduto.zenspec.md`) | `ProductPricingInput` + config    | `PricingResult`                  |
| `cubagemDe` (`cubagemDe.zenspec.md`)            | formato + medidas (cm)                        | `medidas` + `cubagemCm3`         |
| `estimarCabem` (`Specs/queima/estimarCabem.zenspec.md`) | tipo + forno + medidas                | `{ total, porNivel, niveis, mode }` |
| `desenharForno` (`desenharForno.zenspec.md`)    | medidas + forno + `estimarCabem`              | string SVG                        |
| `pricingPanel` (`pricingPanel.zenspec.md`)      | toques + resultados                           | estados visuais                   |

Fluxo geral:

```
formulário → normalizar (PricingInput) → calcularCustoPeca|calcularCustoProduto → PricingResult → pricingPanel (render)
formulário → lerMedidas (medidas) → estimarCabem (ocupação) → desenharForno (SVG) → pricingPanel
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

- `cubagemDe.zenspec.md` — formato, medidas, cubagem, slider proporcional + bind por campo.
- `desenharForno.zenspec.md` — render SVG determinístico do forno (biscoito/esmalte).
- `calcularCustoPeca.zenspec.md` — calcula custo e preços por linha de peça.
- `calcularCustoProduto.zenspec.md` — calcula custo e preços por linha de produto.
- `lerMedidas.zenspec.md` — normaliza o formulário em objetos planos.
- `pricingPanel.zenspec.md` — a tela de precificação (UI).
- Ocupação e fornos: `Specs/queima/estimarCabem.zenspec.md` e `Specs/queima/fornosPanel.zenspec.md`.

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

A tela de precificação (mobile-first) é detalhada na ZenSpec de `pricingPanel` (`pricingPanel.zenspec.md`). Resumo:

- Escolha do tipo: **Peça / Produto** (cards iniciais).
- Seções da peça: Insumos (argila + esmalte + tamanho + acessórios), Mão de obra, Queima, Canais, Entrega.
- Abaixo, o custo detalhado e os cartões com o preço de venda em cada linha.
- Botão "Salvar peça" e link "Editar custos" quando faltar custo de referência.