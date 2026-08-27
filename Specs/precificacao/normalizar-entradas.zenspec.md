# Normalizar entradas (`lerMedidas`)

ZenSpec de programa. Este programa existe para que **o formulário vire objetos planos validados** que os motores (`calcularCustoPeca`/`calcularCustoProduto`) e a ocupação consomem — sem "sujeira" de DOM ou formato solto.

É a **fronteira entre a tela e o núcleo** (regra `DenaroEngSpec.md` §3): a leitura dos inputs (`lerMedidas`, peso, esmalte, tempo) acontece aqui; tudo o que sai é objeto puro.

---

## Intenção

Esta feature existe para que **os cálculos recebam sempre entradas válidas e no formato certo** — sem **erro de tipo, campo vazio ou unidade confusa**.

---

## Conceito

O normalizador lê os campos do formulário (números, chips, listas) e devolve um `PricingInput` limpo: números como `number`, tempo horas+minutos virado decimal, medidas em cm, listas de seleção com `{ item, qtd }`. Se algo está inválido, marca o campo e **não calcula** (nunca sucesso parcial).

Metáfora: é o **portão da fábrica** — só entra quem está no formato certo.

---

## Lógica

### Fluxo

```
pricingPanel → raw do formulário → normalizar → PricingInput | error com campo apontado
```

### Regras

- **Peso (argila)**: `number ≥ 0`, `step 0.05`, unidade kg.
- **Esmalte**: `number ≥ 0`, em **reais** (R$), `step 0.50`.
- **Tempo**: entrado em **horas e minutos** (steppers/atalhos); interno = `h + m/60` (decimal).
- **Dificuldade**: 1–5 na UI → fator interno `CONFIG.fatores` (1,0/1,2/1,4/1,6/1,8).
- **Medidas (`lerMedidas`)**: lê os inputs do formato ativo e devolve `{ formato, diametro?, altura?, largura?, profundidade?, alturaQ? }` (number ≥ 0, cm). Ver `medir-tamanho-da-peca.zenspec.md`.
- **Seleções**: acessórios/embalagem viram `{ item, qtd }` (qtd ≥ 1) com o preço do catálogo.
- **Queima**: `queimas: [{ tipo, forno }]` + flag `semQueima`.
- **Frete**: `fretePagante` (`cliente|atele`) + `pecasNoEnvio ≥ 1`.

### Contrato

Entrada:

- `raw` (valores do formulário, do jeito que o DOM entrega).

Saída:

- `PricingInput` (objeto plano, tipado) **ou** `ValidationError` com `{ campo, mensagem }`.

Erros:

- `ValidationError` → campo marcado em `terracota` + mensagem 12px; nada é calculado.

### Edge cases

- Campo vazio/`NaN` → 0 (campos com default preenchido) ou erro conforme regra do campo.
- `peso = 0` → permitido (material 0); `medidas = 0` → cubagem 0 (ocupação não calcula).
- `unidadesProduzidas = 0` → erro (não divide por zero).
- `taxas ≥ 1` → erro.

### Critérios de aceitação

- O mesmo raw sempre produz o mesmo `PricingInput` (determinístico).
- Nenhum motor recebe `undefined`/string em campo numérico.

---

## Interface

Sem interface própria — a marcação de erro é feita pelo `pricingPanel` (borda `terracota` + mensagem).

### Acessibilidade

- Erro sempre em texto (não só cor) e vinculado ao campo (`aria-describedby`).