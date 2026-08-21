# Padrão ouro 2026 — Pesquisa internacional para a UI do Alice

Pesquisa de estado-da-arte (agosto/2026) para embasar decisões de UI e modelo de negócio do Alice. O projeto serve **uma ceramista com TDAH que odeia planilhas** — a UI precisa ser **quase um assistente**, **poka-yoke** (à prova de erro) e esconder todos os cálculos. Este documento é a fonte das decisões registradas nos ZenSpecs e no `Alice-sensei.md`.

---

## 1. Escolha inicial: "O que você vai precificar?"

**Padrão ouro 2026:** nem wizard genérico de 8 telas, nem tela única com tudo. É **1ª tela com grade de cards grandes (foto + nome do tipo) → wizard curto (3–4 passos) que abre SÓ os campos relevantes àquele tipo**.

- **Wizard é o padrão ouro em mobile para processo desconhecido/alto valor** (Lollypop, LinkedIn/UX): quebra a carga cognitiva, validação passo a passo, erros pegos na hora. É o correto para usuário leigo em processo não-diário.
- A técnica tem nome: **Progressive Disclosure condicional** — "escolhe o tipo e abre só o que importa" (Lollypop).
- **Quando NÃO usar wizard:** tarefa repetida e usuário experiente (power user) → tela única. No Alice, precificação é ação não-diária e a usuária é leiga → **wizard**.
- **Referência de fluxo:** listing do Airbnb (3 etapas macro, sub-passos progressivos, "voltar" e "salvar e sair" não punitivos).
- **Tradução para o Alice:** tela inicial "**Vamos precificar?**" → 5 cards grandes (foto + nome). Tap → abre só as seções do tipo escolhido. Categoria é atributo, não primeira pergunta.

## 2. Taxonomia de categorias (cerâmica)

O mundo real (Etsy) separa a peça acabada em **funcional vs decorativo/arte**:

| Raiz (recomendada para o app) | Função                                   | Exemplos                 |
| ----------------------------- | ---------------------------------------- | ------------------------ |
| **Utensílio / Utilitário**    | Uso diário, servir, comida-safe          | caneca, prato, bowl      |
| **Decoração**                 | Exibir                                   | vaso, objeto decorativo  |
| **Escultura / Arte**          | Peça única, autoral                      | escultura, obra          |
| **Acessório**                 | Complemento                              | (se aplicável)           |
| **Outro**                     | —                                        | —                        |

- **Peça única vs série não é categoria, é modo de produção** (Etsy: "made to order" / quantity; Craftybase/Stocksmith: *batch* → custo por unidade). Peça única = batch de quantidade 1.
- **Atributos por tipo** (não categorias): função (uso/servir/exibição), acabamento (food-safe), produção (peça única/série → nº na fornada), método (torno/placa/modelagem).

## 3. Técnicas UI poka-yoke / TDAH-friendly (padrão 2026)

Fonte: NN/g "Preventing User Errors: Avoiding Unconscious Slips" + progressive disclosure + wizard.

1. **Cálculos escondidos** — zero números visíveis; entra material/horas em linguagem natural, app devolve preço.
2. **Defaults bons** (NN/g) — markup 100% (keystone), faixas predefinidas, campos pré-preenchidos.
3. **Constraints + formato tolerante** — campo de moeda que formata enquanto digita, bloquear preço < custo.
4. **Validação por passo** — erro tratado na hora, não no fim do form.
5. **Confirmação progressiva** — botão "Continuar" só habilita quando o passo é válido; preço sugerido em destaque com confirmação explícita.
6. **Assistente motivacional** (Duolingo) — pergunta por objetivo, não por configuração.
7. **Feedback motivacional** — mostrar "quanto você ganha por hora" no preço escolhido.

## 4. Frete / transporte (3 cenários da Alice)

Padrão internacional: **comprador paga frete à parte** (transparente, checkout). Embutir no preço é anti-padrão (só "frete grátis acima de R$ X").

| Cenário da Alice                     | Modelo padrão (Etsy)                       | No app                                          |
| ------------------------------------ | ------------------------------------------ | ----------------------------------------------- |
| (a) Entrega própria (leva até pessoa) | "Local delivery" — frete fixo local        | campo valor fixo de entrega + "grátis acima de X" |
| (b) Correios (1 ou várias peças)      | Frete calculado (peso + dimensões + CEP)   | produto com peso/dimensões; calcula por CEP ou faixa |
| (c) Rateio (divide entre peças)       | Etsy "1º item cheio + adicionais"          | regra automática: 1ª peça cheia + menor por extra |

**Rateio na prática:** várias peças num só envio → app soma custo real do frete ÷ nº de peças e rateia no preço de cada item. É o único "rateio" com padrão consolidado (Etsy).

## 5. Canais de venda e comissões (Brasil 2026)

> ⚠️ **Elo7 ENCERROU operações em 11/05/2026** (comprada pela Enjoei). Não é mais canal válido — substituir por Etsy/Shopee/ML no seletor, com aviso.

| Canal                              | Taxa 2026                                          | Fonte |
| ---------------------------------- | -------------------------------------------------- | ----- |
| **Pix** (Nuvem Pago)               | 0,99%                                              | NuvemShop oficial |
| **Cartão de crédito** (Nuvem Pago) | 3,29%–5,69% + R$0,35 (plano/prazo)                 | NuvemShop oficial |
| **NuvemShop — tarifa por venda**   | 0% c/ Nuvem Pago; 0,7%–2% c/ gateway externo; planos R$0–449/mês | NuvemShop oficial |
| **Mercado Livre**                  | 10–19% comissão + taxa fixa até R$6,75/item        | NuvemShop blog |
| **Shopee**                         | 14–20% + taxa fixa R$4–26/item                     | NuvemShop blog |
| **Amazon (artesanato)**            | 16% + plano                                        | NuvemShop blog |
| **Etsy**                           | US$0,20/listagem + 6,5%/venda + taxa de pagamento  | NuvemShop blog |
| **Boleto** (Nuvem Pago)            | taxa não publicada na página → deixar editável     | — |

## 6. Imposto por regime (Brasil 2026)

| Regime    | O que incide                                          | Na fórmula                     |
| --------- | ----------------------------------------------------- | ------------------------------ |
| Informal  | Nada legal                                             | imposto = 0 (app incentiva formalização) |
| **MEI**   | DAS fixo mensal: INSS 5% do sal. mín. + ICMS R$1 / ISS R$5-6. Sal. mín. 2026 = R$1.621 → DAS ≈ R$82-86/mês | **não incide por venda** (custo fixo mensal) |
| Simples   | Alíquota efetiva: Anexo I comércio 4,0%; Anexo II indústria 4,5%; Anexo III serviços 6% | imposto = alíquota efetiva da faixa (campo editável) |

**Regra fiscal do app:** única pergunta "Você é MEI, Simples ou informal?" → aplica o imposto certo automaticamente.

## 7. Preço com impostos embutidos vs somados

Dois modos consagrados; **default recomendado = modo "líquido"** (artesã entende, evita prejuízo):

1. **"Quero receber X líquido"** → `preço ao cliente = líquido ÷ (1 − %comissão − %imposto − %taxa)`. O que cai na conta fica exato.
2. **"Quero que o preço inclua tudo"** → `líquido = preço × (1 − %comissão − %imposto − %taxa)`.

## 8. Fórmula-padrão de mercado (motor escondido)

`Preço de venda = (Materiais + Mão de obra + Overhead) × (1 + Markup)` — markup default 100% (keystone); wholesale = 50% do retail. Confirmada em Craftybase, CraftsTrack, MiniWebTool, CraftProfessional, PricingForge, r/CraftFairs.

## 9. Ferramentas de IA / estado da arte (2024–2026)

Nenhuma faz "foto → preço" mainstream. Estado da arte = **dados de mercado (comparáveis Etsy) + custo escondido**: EverBee (pricing optimizer, profit/fee calculator, 206M listings), InsightAgent (pricing recomendada por mercado), Alura (Etsy fee calculator, A/B test de preços), eRank (price range por keyword), Craftybase→Stocksmith (COGS/batch/BOM — a base invisível por trás de toda precificação correta).

---

## Decisões registradas (para os ZenSpecs)

1. **Topo** → tela inicial "**Vamos precificar?**" com cards grandes (Peça feita à mão / Produto revenda·kit) e wizard curto; categoria (Utensílio/Escultura/Outros) como atributo da peça, não primeira pergunta.
2. **Frete** → 3 cenários com padrão Etsy: entrega própria (fixo local), Correios (calculado), rateio (1º item cheio + adicionais).
3. **Canais** → cards com comissões pré-preenchidas e editáveis; **Elo7 removido**; pergunta fiscal única (MEI/Simples/informal) puxa imposto.
4. **Imposto** → default modo "líquido" (÷ (1−taxas)) já usado nos produtos; unificar convenção documentando a diferença peça (× (1+taxas)) vs produto (÷ (1−taxas)).
5. **Embalagem** → grupos com ícones + ícone por grupo; permitir adicionar/remover itens; conectar visualmente com a futura aba de matérias-primas (a seção EMBALAGEM já existe em `MATERIAS_PRIMAS`).
