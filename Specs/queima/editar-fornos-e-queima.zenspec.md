# Editar fornos e queima (`fornosPanel`)

ZenSpec de componente de UI. Este programa existe para que **a Alice mantenha os fornos, serviços de queima e a conta da queima atualizados** em um lugar só, amigável — sem planilha e sem decoreba de fórmulas.

Decisões de pesquisa que embasam esta tela: `padrao-ouro-queima-2026-pesquisa.md` (R19–R24).

Modo UI-first: a casca visual usa **mock provisório** (marcado aqui como provisório). A persistência real vive em `guardar-fornos-e-queima.zenspec.md`.

---

## Intenção

Esta feature existe para que **Alice** consiga **descobrir quanto custa queimar uma peça** com precisão — servindo tanto a uma iniciante que queima no forno da vizinha quanto a um ateliê robusto com 5 fornos — sem precisar de **fórmula, planilha ou decoreba**.

A peça precificada pergunta só o essencial: **onde queima**, **quantas queimas** e **o tamanho/peso** (o app estima quantas cabem na carga). Todo o resto (kW, duty cycle, capacidade, tarifas) vive **aqui**, escondido, amigável.

---

## Conceito

O `fornosPanel` é a tela de configuração da queima. Dentro dela, em cards amigáveis, estão os **meus fornos** (medidas, formato, capacidade), os **serviços de queima** (o que se paga para outro forno), e a **conta da queima** (energia). O que é salvo aqui alimenta o custo de queima no `pricingPanel`.

Metáfora: é a **parede da garagem com os fornos desenhados** — cada forno é um card com suas medidas; o que é complexo fica em gavetas que só abrem se precisar.

**Princípio central (R19):** a queima tem **duas camadas** separadas:

```
custo direto da queima = energia + desgaste + mão de obra da queima
tarifa da queima       = custo direto + overhead + risco + margem
```

Para o v1, só a **energia** entra no cálculo de peça (e a opção "eu sei quanto gasta"). **Desgaste, mão de obra, overhead, margem e depreciação ficam para uma fase futura** (R25) — mantidos aqui como estrutura conceitual, não como campos.

### Estudo: por que "quantas peças cabem no forno?" trava a Alice

A pergunta "quantas peças vão na carga?" é o maior atrito do modelo. Motivos:

1. **É raciocínio espacial, não conta.** Estimar quantos pratos cabem exige rotação mental, empilhamento e layout 3D — sobrecarrega a memória de trabalho espacial (déficit central do TDAH). O **prato é o pior caso**: largo e raso, domina a área da prateleira mas empilha fino; o mental model "N por prateleira × M níveis" quebra para peças altas e confunde para pratos.
2. **Pergunta de fornada feita na hora da peça.** Para precificar UMA peça, ela teria que imaginar a fornada inteira. É inverso: "quantas peças" é pergunta de carga, mas ela está precificando peça.
3. **Peso é mentalmente fácil; volume é espacialmente difícil.** "25 kg no forno ÷ 0,5 kg o prato ≈ 50" não exige imaginar o espaço — é uma divisão. É por isso que o mundo real (Alemanha, Itália, Japão) cobra por kg.
4. **Pratos/travessas são limitados por ÁREA, não por peso.** Um prato de 500g é leve, mas ocupa a prateleira toda — o método por peso **superestima** peças largas. Precisamos de um "modo prato": estimar por tamanho (diâmetro × altura → área de prateleira × nº de níveis).

**Abordagem adotada (R24):** o app **nunca pergunta "quantas cabem?" em branco**. Ele **estima por peso por padrão** (capacidade do forno em kg ÷ peso da peça — o peso **já existe** no `kgsArgila` da tela principal, zero pergunta nova) e **troca para por-tamanho** quando a peça é larga (prato, travessa, bandeja), pedindo só diâmetro e altura. O resultado vem como **sugestão com slider** ("cabe ~30 · quer ajustar?"), nunca como pergunta fria.

---

## Lógica

### Fluxo

```
fornosPanel  →  (salvar)  →  guarda  →  feedback
fornosPanel  →  (+ adicionar forno)  →  folha do forno  →  recalcula capacidade e custo/queima
fornosPanel  →  (escolher "eu sei" / "me ajuda")  →  mostra campos mínimos ou a conta
pricingPanel →  (onde queima? quantas queimas? tamanho/peso)  →  estima peças na carga → custo de queima
```

| Programa      | Recebe                      | Faz                                          | Manda para                |
| ------------- | --------------------------- | -------------------------------------------- | ------------------------- |
| `fornosPanel` | toques da Alice             | carrega e edita fornos, serviços e a conta   | API `/api/costs`          |
| `fornosPanel` | toque em "+ adicionar forno"| abre folha de novo forno (formato + medidas) | — (tela)                  |
| `fornosPanel` | toque em "eu sei" / "me ajuda a calcular" | alterna o modo de custo do forno | — (tela) |
| `fornosPanel` | toque em "+ queimar fora"   | abre folha de serviço externo (cobrança)     | — (tela)                  |
| `pricingPanel`| onde queima + ciclos + tamanho/peso | estima peças na carga e calcula `(custo por queima ÷ peças) × ciclos` | custo da peça |
| `pricingPanel`| slider "cabe ~N"            | ajusta a estimativa sem recalcular fórmula   | custo da peça |

> **Nota (mock provisório):** Na Fase 1, os valores vêm de um mock local com um **forno médio de exemplo** e defaults amigáveis, visivelmente marcados `MOCK`. A integração real com `/api/costs` ocorre na Fase 3.

### Estrutura da tela (3 blocos no v1; 2 avançados em futuro)

**Bloco 1 — `Meus fornos`** (fornos próprios; card por forno):

| Campo | O que é | TDAH-friendly |
| ----- | ------- | ------------- |
| Nome | ex.: "Forno 1", "Forno cilíndrico" | default preenchido, editável |
| Formato | `cilíndrico` (diâmetro + altura) ou `quadrado` (largura × profundidade × altura) | 2 toggles com desenho |
| Medidas | cm, digitadas só se quiser volume / estimar capacidade | opcional |
| Capacidade | **"quantos kg de peças cabem numa carga?"** (campo direto) | default sugerido: `volume × 0,25 kg/L` |
| Como calcular o custo | **"Eu sei quanto gasta"** (default) ou **"Me ajuda a calcular"** | toggle de 2 opções |
| Custo | "Eu sei" → `R$ por bisque` e `R$ por esmalte` · "Me ajuda" → `kW` → app calcula energia | campos mínimos |

- Abaixo do card, sempre visível: `Volume útil: X L` · `cabe ~Y kg de peças` · `custa R$ W por bisque · R$ Z por esmalte`.
- **Capacidade em kg** é a âncora mental (R24): o app só estima quantas peças cabem se souber isso. Se ela não digitar e não houver medidas, usa o default "forno médio".

**Bloco 2 — `Queimar fora`** (serviços externos: vizinho, atelier, serviço profissional):

| Campo | O que é |
| ----- | ------- |
| Nome | ex.: "Forno da vizinha", "Atelier X" |
| Cobra por | `kg` · `peça` · `carga` (toggle) |
| Preço | R$ na unidade escolhida |
| Mínimo por pedido | R$ (opcional) |

**Bloco 3 — `A conta da queima`** (energia; colapsável, defaults bons):

| Campo | Default |
| ----- | ------- |
| Preço do kWh | R$ 0,90 (editável) |
| Duty cycle bisque | 0,50 |
| Duty cycle esmalte | 0,65 |
| Horas por bisque | 8 |
| Horas por esmalte | 9 |
| Energia do forno **já está no custo fixo** (luz/CEMIG)? | `não` (desmarcado) |

> **Futuro (R25):** desgaste (elementos, prateleiras), mão de obra da queima, overhead, margem da tarifa, depreciação do forno e o bloco **"Quem queima comigo"** (compartilhamento/receita) entram em uma fase posterior. Estrutura conceitual já definida na pesquisa (§1, §5), mas fora dos campos do v1.

### Regras

- **A peça nunca vê as fórmulas.** No `pricingPanel`, a peça pergunta: (1) **onde queima?** → um `Meu forno`, um serviço de `Queimar fora` ou **não queima**; (2) **quantas queimas?** → 0 · 1 · 2 (bisque+esmalte é o padrão); (3) **tamanho/peso** → o app estima as peças na carga.
- **Estimativa por peso (default, R24):** `pecasNaCarga ≈ capacidadeKgDoForno ÷ pesoDaPeça`, com `pesoDaPeça = kgsArgila` (já preenchido na tela principal — nenhuma pergunta nova). Resultado arredondado e apresentado como **sugestão com slider** "cabe ~N".
- **Modo por tamanho (peça larga — prato, travessa, bandeja):** a peça informa `diâmetro` (ou L×P) e `altura` em cm. O app estima `pecasPorPrateleira = áreaÚtil ÷ áreaDaPeça` (fator 0,85) × `níveis = alturaÚtil ÷ (alturaDaPeça + 5cm)`; pratos empilham sem poste entre eles (usar espessura real). Sempre com slider de ajuste.
- **Custo de queima da peça (R20):** `custoQueimaPeça = (custoPorQueima ÷ peçasNaCarga) × ciclos`. **Sem queima → custo 0** (zero ciclos). Nunca confundir "sem queima" com "queima grátis".
- **Queimar fora:** por `kg` → custo = tarifa × peso × ciclos; por `peça` → tarifa × ciclos; por `carga` → tarifa ÷ peças na carga × ciclos.
- **`custoPorQueima` por tipo** (bisque/esmalte), modo "me ajuda": `energia = kW × horas × dutyCycle × precoKwh`; no v1 `custoPorQueima = energia` (desgaste/mão de obra entram em R25). Modo "eu sei": exatamente os R$ digitados.
- **Energia duplicada com os custos fixos (poka-yoke):** o custo fixo atual tem "CEMIG / luz (600)". Se marcar `a energia do forno já está no custo fixo`, o app usa **energia = 0**. Ao cadastrar o primeiro forno com a opção desmarcada, o app sugere reduzir o "CEMIG/luz" dos Fixos pela parcela do forno.
- **Volume útil** (R23): cilíndrico `π(d/2)²×h`; quadrado `L×P×A`; ~70% do nominal (prateleiras, pinos, folgas). Capacidade em kg sugerida = `volume útil (L) × 0,25` (massa verde empacotada, faixa 0,2–0,3 kg/L).
- **Derivados são automáticos**: volume útil, capacidade em kg, custo por queima (por tipo), peças na carga estimadas — ninguém digita.
- Se a Alice toca **"Salvar"** e tudo é válido → guarda e mostra feedback `verde-argila` "Fornos salvos". Campos inválidos → `terracota` com mensagem; nada salvo.
- Toda alteração **persiste automaticamente** (Firestore `alice/estado`; `localStorage` como cache/offline).

### Contrato

Entrada (carregamento — da API/mock):

- `fornos`: `[{ id, nome, formato: "cilindrico"|"quadrado", medidas: { diametroCm?, alturaCm?, larguraCm?, profundidadeCm? }, capacidadeKg?, potenciaKw?, modoCusto: "digitar"|"calcular", custoBisque?, custoEsmalte? }]`
- `servicosFora`: `[{ id, nome, unidade: "kg"|"peca"|"carga", preco, minimo? }]`
- `configQueima`: `{ precoKwh, dutyCycleBisque, dutyCycleEsmalte, horasBisque, horasEsmalte, energiaNoFixos }`

Saída (salvar):

- `fornosReference`: mesmos campos acima, validados. Derivados (volume útil, capacidade sugerida, custo por queima por tipo) não são salvos — recalculados na leitura.

Erros:

- `FornosValidationError` → campo(s) inválido(s) apontados na tela.
- `FornosSaveError` → banner `terracota` "Não foi possível salvar. Tente de novo."
- `FornosLoadError` → tela abre com defaults + banner de aviso; nada digitado antes é perdido (persistido localmente).

### Edge cases

- Nenhum forno nem serviço cadastrado → no `pricingPanel`, "onde queima?" oferece só **não queima** + atalho "cadastrar forno".
- Peça sem queima (decoração, objeto seco ao ar) → `custoQueimaPeça = 0`; os demais custos seguem.
- Forno sem `capacidadeKg` e sem medidas → usa default "forno médio" (~7,2 kW, ~100 L, ~20 kg) com aviso `tinta-suave` "estimado".
- Prato muito largo para a prateleira (`áreaDaPeça > áreaÚtil`) → estimativa de 1 peça por prateleira; o slider permite menos que 1 por carga (peça que ocupa o forno quase sozinha).
- `pecasNaCarga` final (após slider) < 1 → permitido; a conta vira "custo por peça = custo da queima" (peça domina a carga).
- `pecasNaCarga = 0` → erro de validação (não divide por zero).
- Serviço por `kg` sem peso → usa `kgsArgila` da peça; se ausente, pede o peso.
- `precoKwh = 0` no modo "me ajuda" → energia = 0 (permitido).
- `custoBisque`/`custoEsmalte` = 0 no modo "eu sei" → custo daquele tipo = 0.
- Marcar `energiaNoFixos` → energia vira 0; card mostra "energia já coberta pelos custos fixos".
- Excluir o último forno → bloco vazio, sem erro; peça passa a oferecer só "queimar fora / não queima".
- `dutyCycle` fora de 0,1–1,0 ou horas ≤ 0 → aviso `tinta-suave`, mas permitido.

### Critérios de aceitação

- Com os mesmos dados de forno/serviço/config/tamanho de peça, `custoQueimaPeça` é sempre igual (determinístico).
- Uma iniciante precifica em < 1 minuto usando só "Queimar fora" (tarifa) ou "Eu sei quanto gasta" — sem abrir nenhum bloco avançado.
- Um ateliê com 5 fornos cadastra cada forno com medidas, capacidade e kW; a peça escolhe o forno e o app estima "cabe ~N" sem pergunta espacial.
- Para um **prato** (peça larga), o app usa o modo por tamanho (diâmetro + altura) e NÃO superestima por peso.
- O custo de queima aparece rastreável no `pricingPanel` (linha "Queima" no detalhe do custo).

---

## Interface

### Layout (mobile-first)

```
┌──────────────────────────────┐
│  ←  Alice                   │
├──────────────────────────────┤
│  Fornos & queima             │
│                              │
│  ▼ MEUS FORNOS               │
│  ┌───────────────────────────┐│
│  │ Meu forno                 ││
│  │ [cilíndrico] [quadrado]   ││ ← toggles com desenho
│  │ diâmetro [40] cm · alt [60]││
│  │ Quantos kg cabem? [ 15 ]  ││ ← âncora mental
│  │ Como calcular:            ││
│  │ (•) Eu sei  ( ) Me ajuda  ││
│  │ bisque  R$ [ 9,00]        ││
│  │ esmalte R$ [15,00]        ││
│  │ Volume 52L · cabe ~15kg   ││
│  │ Custa R$9 bisq/R$15 esm.  ││
│  └───────────────────────────┘│
│  + adicionar forno            │
│                              │
│  ▼ QUEIMAR FORA               │
│  ┌───────────────────────────┐│
│  │ Forno da vizinha          ││
│  │ Cobra [kg] (•)peça [carga]││
│  │ R$ [ 15,00] por peça      ││
│  │ mín. R$ [ 10,00]          ││
│  └───────────────────────────┘│
│  + adicionar serviço          │
│                              │
│  ▶ A CONTA DA QUEIMA          │ ← colapsável (energia)
│                              │
│  [       SALVAR       ]       │
└──────────────────────────────┘
```

### Na precificação da peça (pricingPanel)

```
Onde queima?   [ Meu forno ] [ Forno da vizinha ] [ Não queima ]
Quantas queimas?   (0)  (1)  (•)2   ← bisque + esmalte

Tamanho da peça  →  [ como essa peça é? ]  →  peso 0,4 kg (do kgsArgila)
Cabe no forno ~ 30 peças            ← estimativa automática
   [        ] 30  ◄──────────────►   ← slider de ajuste (±)
```

- **Peça comum** → estima por peso (capacidade ÷ kgsArgila), nenhuma pergunta nova.
- **Peça larga** (prato/travessa) → o app pergunta `diâmetro [25] cm` e `altura [5] cm` e estima por área × níveis. Mostra o raciocínio em linguagem natural: "1 prateleira cabe ~7 · o forno tem 4 níveis → ~28".

### Hierarquia visual

- Cabeçalhos de bloco: `tinta-suave`, 13px, peso 600, uppercase, com `▼/▶` colapsável.
- Cards de forno: fundo `cartao`, borda `1px linha`, cantos 12px; formato em toggles com ilustração.
- Valores derivados (volume, capacidade kg, custo por queima): `tinta-suave`, 13px, logo abaixo dos campos.
- Estimativa "cabe ~N": destaque `tinta`, 16px, peso 600, com slider.
- Labels: `tinta-suave`, 13px. Valores: `tinta`, 16px, peso 500.

### Estados visuais

| Estado                 | Visual                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| toggle de formato      | selecionado = fundo `argila` claro + ícone de forno; não = contorno  |
| campo `focus`          | borda `1.5px argila` + halo                                          |
| erro de campo          | borda `1.5px terracota` + mensagem 12px                              |
| "+ adicionar forno/serviço" | texto `argila`, fundo transparente, peso 600, 13px, à esquerda   |
| botão "Salvar"         | `argila`, texto `cartao`, 48px, cantos 10px                          |
| feedback "salvo"       | `verde-argila`, 13px, 2s                                             |
| aviso estimado         | `tinta-suave`, 13px                                                  |
| banner de erro salvar  | fundo leve `terracota` (10%), texto `terracota`, 13px                |

### Interações

- Toggles de formato com **desenho** (cilíndrico = círculo; quadrado = retângulo).
- "Quantos kg cabem?" com `inputmode="decimal"`; o valor é a âncora de todas as estimativas de carga.
- "Eu sei / Me ajuda" em linguagem natural: "Você sabe quanto gasta? ou quer que eu calcule?".
- Bloco "A conta da queima" fechado por default; abrir não altera valores.
- "+ adicionar forno": bottom sheet com Nome, Formato, Medidas, capacidade, modo de custo.
- "+ adicionar serviço": bottom sheet com Nome, unidade, preço, mínimo.
- **Persistência:** toda alteração grava imediatamente (Firestore + `localStorage`). "Salvar" confirma, mas nada depende dele.
- Voltar sem salvar: se houve alteração, pergunta "Descartar alterações?".
- Remover forno/serviço: "✕" → confirmação nativa.

### Acessibilidade

- Toggles, botões "+" e campos com alvo ≥ 44px.
- Contraste ≥ 4.5:1 sobre `cartao`/`papel` nos valores derivados.
- Bottom sheet navegável por teclado (foco no primeiro campo).