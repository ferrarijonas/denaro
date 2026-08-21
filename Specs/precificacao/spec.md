# Precificação — Spec de módulo

Spec de módulo do domínio `precificacao` do Alice. Define conceito, regras de negócio e a Interface. Contratos campo-a-campo de cada programa vivem nas ZenSpecs filhas desta pasta.

---

## Intenção

Esta feature existe para que **Alice e sua ajudante** consigam **descobrir o preço de venda de uma peça em várias margens** sem precisar de **contas manuais ou planilhas**.

---

## Conceito

A precificação transforma dados simples de uma peça (peso da argila, custo do esmalte em %, dificuldade artística e tempo de execução) em um **custo auditável** e em **preços de venda por margem**. O custo é composto de material (argila + esmalte) e mão de obra (tempo × valor da hora × fator de dificuldade).

Metáfora: a precificação é a **etiquetadora** — entra o que a peça "custa de fazer", sai quanto ela "deve custar para vender".

---

## Lógica

### Fluxo geral

```
formulário  →  pricingInputNormalizer  →  pricingEngine  →  pricingPanel (preços por margem)
```

| Programa                 | Recebe                          | Faz                                            | Manda para                    |
| ------------------------ | ------------------------------- | ---------------------------------------------- | ----------------------------- |
| `pricingInputNormalizer` | `raw` do formulário             | valida e normaliza entradas                    | `pricingEngine`               |
| `pricingEngine`          | `PricingInput`                  | calcula custo e preços por margem              | `pricingPanel`                |

### Regras do domínio

- Se peso da argila = 0 → custo de material = 0 e a conta segue com esmalte = 0.
- Se esmalte % = 0 → custo de esmalte = 0.
- Dificuldade ∈ {1, 2, 3, 4, 5} → fator de dificuldade = valor cadastrado nos custos de referência (default sugerido: 1.0, 1.15, 1.35, 1.6, 2.0).
- Se tempo de execução = 0 → custo de mão de obra = 0.
- Custo total = custo de material + custo de mão de obra.
- Preço por margem = custo total × (1 + margem). Margens exibidas vêm dos custos de referência (default sugerido: 30%, 50%, 80%, 100%, 150%).

### Contratos

Os contratos campo-a-campo de `pricingEngine` e `pricingInputNormalizer` vivem nas ZenSpecs filhas:

- `calcular-custo-e-precos.zenspec.md`
- `normalizar-entradas-de-precificacao.zenspec.md`

### Edge cases

- `raw` fora do formato → erro de validação com campo apontado.
- Peso, % de esmalte, tempo ou dificuldade inválidos → erro de validação, sem cálculo parcial.
- Custos de referência ausentes (argila ou valor da hora sem cadastro) → falha explícita com orientação.

### Critérios de aceitação

- Para os mesmos 4 dados de entrada, o custo e os preços por margem são sempre iguais (determinístico).
- Todo valor exibido tem origem rastreável nas contas de material e mão de obra.

---

## Interface

A tela de precificação (mobile-first) é detalhada na ZenSpec de `pricingPanel` (`apresentar-calculadora-no-celular.zenspec.md`). Resumo:

- Formulário em coluna: peso (kg), custo do esmalte (%), dificuldade (1–5), tempo (h).
- Abaixo, cartões com o preço de venda em cada margem.
- Botão "Salvar peça" e link "Editar custos" quando faltar custo de referência.
