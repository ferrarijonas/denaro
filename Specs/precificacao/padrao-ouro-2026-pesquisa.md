# Padrão ouro 2026 — Pesquisa internacional para a UI do Denaro

Pesquisa de estado-da-arte (agosto/2026) para embasar decisões de UI e modelo de negócio do Denaro. O projeto serve **uma ceramista com TDAH que odeia planilhas** — a UI precisa ser **quase um assistente**, **poka-yoke** (à prova de erro) e esconder todos os cálculos. Este documento é a fonte das decisões registradas nos ZenSpecs.

---

## 1. Escolha inicial: "O que você vai precificar?"

**Padrão ouro 2026:** nem wizard genérico de 8 telas, nem tela única com tudo. É **1ª tela com grade de cards grandes (foto + nome do tipo) → wizard curto (3–4 passos) que abre SÓ os campos relevantes àquele tipo**.

- **Wizard é o padrão ouro em mobile para processo desconhecido/alto valor** (Lollypop, LinkedIn/UX): quebra a carga cognitiva, validação passo a passo, erros pegos na hora. É o correto para usuário leigo em processo não-diário.
- A técnica tem nome: **Progressive Disclosure condicional** — "escolhe o tipo e abre só o que importa" (Lollypop).
- **Quando NÃO usar wizard:** tarefa repetida e usuário experiente (power user) → tela única. No Denaro, precificação é ação não-diária e a usuária é leiga → **wizard**.
- **Referência de fluxo:** listing do Airbnb (3 etapas macro, sub-passos progressivos, "voltar" e "salvar e sair" não punitivos).
- **Tradução para o Denaro:** tela inicial "**Vamos precificar?**" → 5 cards grandes (foto + nome). Tap → abre só as seções do tipo escolhido. Categoria é atributo, não primeira pergunta.

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

## 4. Frete / transporte (modelo Etsy: método de entrega + divisão automática)

Padrão internacional (Etsy): o **comprador paga frete à parte** (transparente, no checkout) e o vendedor escolhe o **método de entrega** (local pickup / local delivery / shipping). O rateio entre múltiplas peças é **automático** no checkout (combined shipping), não é um método separado — misturar "método" com "rateio" no mesmo seletor confunde.

| Cenário da ceramista                 | Modelo padrão (Etsy)                                   | No app                                          |
| ------------------------------------ | ------------------------------------------------------ | ----------------------------------------------- |
| (a) Entrego eu mesma                 | "Local delivery" — frete fixo local                    | chip "Entrego eu mesma" + R$ por entrega        |
| (b) Envio pelos Correios             | "Standard shipping" — frete calculado ou fixo          | chip "Vai pelos Correios" + R$ do frete         |
| (c) Ela retira aqui                  | "Local pickup" — sem custo, sem campo                  | chip "Ela retira aqui" → R$ 0, sem campos       |
| Várias peças num envio               | Combined shipping automático (1º item + adicionais)    | campo "peças no mesmo envio" → app divide o frete sozinho |

**Rateio na prática (padrão Etsy):** várias peças num só envio → app divide o frete real pelo nº de peças (1 peça = sem divisão). Não é um 4º método — é uma regra que se aplica a qualquer método pago.

### 4.1 O que ateliês sólidos do Japão, Itália e EUA fazem (agosto/2026)

Pesquisa direta nas políticas de frete de ateliês documentados. **Consenso absoluto nos 3 países:**

1. **Frete é SEMPRE à parte, nunca embutido no preço da peça.** O preço do produto é "limpo"; o transporte é linha separada no checkout.
   - EUA: East Fork (NC) repassa o custo exato sem margem ("exact calculations of what it will cost East Fork to ship"); Heath publica tabelas completas por faixa+região; A.MANO (Brooklyn) cobra por peso/destino.
   - Itália: Bitossi cobra por peso/volume/destino; Ginori 1735 mostra frete no checkout, nunca embutido; Deruta/Torretti calcula no sistema e comunica extras antes de fechar.
   - Japão: Fukagawa, Koransha, KIKOF, Bizen 星 — todos com taxa de envio à parte publicada em página de guia; peça única de ¥550.000 usa a MESMA regra de frete separado.

2. **"Frete grátis acima de X" existe nos 3, com papéis diferentes:**
   - **Japão: padrão quase universal** — limiar típico ¥11.000 (o valor que, com imposto de 10%, dá ¥10.000 líquido): Fukagawa, Koransha, Maruhiro, Tachikichi. KIKOF usa ¥15.000; MAARKET ¥10.000. É a norma, não promoção.
   - **Itália: difundido por posicionamento** — €99 (Torretti/Deruta), €150 (Bitossi Home), €199 (F.lli Mari), €300 (Ginori Europa), €500 (Casola EUA/UK com seguro).
   - **EUA: isca pontual, NÃO regra** — Jono Pandolfi fixo $100; Heath $175 só em promoção de dezembro; East Fork NÃO tem "free over X" (usa código de primeira compra).

3. **Preço apresentado tax-inclusive** (Japão 税込 e Itália IVA incluso, por lei; EUA soma no checkout mas transparente). Frete nunca disfarçado.

4. **Embalagem é custo técnico, não luxo:** EUA trata como investimento anti-quebra (papel honeycomb/Geami/ExpandOS em vez de isopor; breakage normalizado 3–5%; seguro ~$2–3/$100). Não existe linha "handling" separada — embalagem entra no custo do produto (COGS) e o frete é só o transporte (Craftybase).

5. **Peça única/obra:** frete SEMPRE cotado/orçado à parte (Ginori Arte = "ENQUIRE"; Bizen 星 precifica por tamanho de caixa; casse de madeira + seguro em orçamento). Nunca embutido no preço da obra.

6. **Ida até o correio (transporte do vendedor):** não é frete — é overhead do vendedor, diluído no custo-hora/custos fixos. Ateliês que fazem pickup local (A.MANO, Bridgetown Sparrow, Notary) oferecem como serviço; e-commerce de escala recusa pickup para simplificar (East Fork).

7. **Segurança/retorno:** política de quebra clara (5–7 dias, foto + nº do pedido, reposição) e protocolo "accettazione con riserva" (recusar pacote danificado). East Fork vende *seconds* online a 30% — perda vira produto.

**Padrão ouro consolidado (Japão+Itália+EUA):** preço limpo + frete à parte transparente + opção "grátis acima de X" como política (padrão japonês/italiano) ou promoção (americano) + embalagem no custo + ida ao correio no overhead + quebra monetizada. Nenhum ateliê sólido embute frete no preço da peça.

### 4.2 Simulação de consenso (3 agentes: Japão, Itália, EUA) — R18

Cruzei 3 agentes personificando os ateliês estudados. **Consenso unânime:**

1. **"Frete não é preço."** O frete é serviço à parte. "À parte" = repasse exato sem margem (East Fork). "Embutido" = absorção consciente, **nunca escondida** — o custo absorvido fica sempre documentado (Japão cede a precisão, EUA a transparência).
2. **Separar físico de dinheiro em 2 perguntas:** (A) "Como a peça chega?" → método; (B) "Quem paga o caminho?" → à parte / frete grátis. O bug da versão antiga era misturar os dois num seletor e dizer "quem compra paga" enquanto o cálculo embutia.
3. **Uma pergunta por vez, poka-yoke:** retirada pula B e o rateio; ML/Etsy travam "à parte" (plataforma cobra do comprador); impossível criar estado contraditório.
4. **Resultado em um número só:** à parte → linha "Frete a cobrar à parte" (informativa, fora do preço); embutido → badge "Frete grátis pra ela" (custo absorvido no expansor); retirada → "sem frete".
5. **Rateio automático** por peças no mesmo envio (default 1), divisão escondida.
6. **Pergunta B default "à parte"** e "grátis" exige intenção consciente (anti-regra americano: frete grátis é presente, não padrão).

**Decisões por país:** Japão quer regra "grátis acima de X" (¥11.000) + recap chip; Itália quer preço da peça sagrado + escolha por tamanho de caixa (estimativa) e trava de canal; EUA quer custo real sempre visível + "grátis" como isca justificada. Implementado o núcleo comum (perguntas A+B + linha de frete por estado). Pendências futuras: escolha por tamanho de caixa (pré-API), regra global "grátis acima de X", recap chip por peça.

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
6. **Frete (R17, padrão ouro 3 países)** → preço limpo + frete à parte transparente; opção "grátis acima de X" como política; embalagem no custo da peça; ida ao correio diluída nos custos fixos; quebra monetizada (seconds). Decidir no app: "frete à parte" vs "embutir no preço" por peça.
