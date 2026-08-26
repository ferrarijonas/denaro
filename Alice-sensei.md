# Alice — Sensei Spec

Ordem de execução clara, em camadas. Sensei Spec diz **em que ordem** transformar Conceito, Engenharia e Stack em ZenSpecs, código e testes.
Este documento segue o template de `ZenSenseiSpec.md` e é derivado de `AliceConceptSpec`, `AliceEngSpec` e `AliceStackSpec`.

**Modo de execução: UI-first/Vertical slice** — a Alice precisa "ver" o visual antes de aprovar o resto; a UI com dados mockados (marcados como provisórios) vem primeiro e o core real é conectado depois.

---

## 1. Entradas

| Tipo       | Arquivo                     | Papel                                                     |
| ---------- | --------------------------- | --------------------------------------------------------- |
| Conceito   | `./AliceConceptSpec.md`     | Define o porquê, o que é e as fronteiras.                 |
| Engenharia | `./AliceEngSpec.md`         | Define componentes, fluxos, ciclo de vida e API pública.  |
| Stack      | `./AliceStackSpec.md`       | Define ferramentas, pastas, dependências e comandos.      |

Todos existem antes deste Sensei.

---

## 2. Saídas

| Nome       | Arquivo                   | Escala | O que contém                          |
| ---------- | ------------------------- | ------ | ------------------------------------- |
| Sensei     | `./Alice-sensei.md`       | Macro  | Fases, componentes e grandes blocos   |
| ZenTarefas | `./Alice-tarefas.md`      | Micro  | Lista mínima de tarefas acionáveis    |

---

## 3. Componentes-alvo

| Nome                       | Tipo         | Fonte principal                                   | Depende de                  |
| -------------------------- | ------------ | ------------------------------------------------- | --------------------------- |
| `pricingEngine`            | Componente   | Eng / 3.1 + modelo-de-precificacao                | —                           |
| `productEngine`            | Componente   | Eng / 3.1 + modelo-de-precificacao                | —                           |
| `pricingInputNormalizer`   | Componente   | Eng / 3.1                                         | —                           |
| `storage`                  | Infra        | Eng / 3.5 + Stack                                 | —                           |
| `costReferenceStore`       | Componente   | Eng / 3.2                                         | `storage`                   |
| `pieceStore`               | Componente   | Eng / 3.2                                         | `storage`                   |
| `productStore`             | Componente   | Eng / 3.2                                         | `storage`                   |
| `aliceApi`                 | Orquestrador | Eng / 3.3 + API pública                           | `pricingEngine`, `productEngine`, stores |
| `pricingPanel`             | UI           | Eng / 3.4 + Conceito (`mobile-first`)             | `aliceApi`                  |
| `costsPanel`               | UI           | Eng / 3.4                                         | `aliceApi`                  |
| `piecesListPanel`          | UI           | Eng / 3.4                                         | `aliceApi`                  |

---

## 4. Fases

| Fase | Objetivo                                  | Critério de "pronto"                                                            |
| ---- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| 1    | Casca visual das 3 telas (mobile-first)   | `pricingPanel`, `costsPanel` e `piecesListPanel` funcionando no celular com dados mockados claramente marcados como provisórios; visual aprovado pela Alice. |
| 2    | Fundar o núcleo de cálculo                | `pricingEngine`, `productEngine` e `pricingInputNormalizer` com ZenSpec, código e testes verdes; valores conferidos contra as planilhas (`modelo-de-precificacao.md`). |
| 3    | Levantar persistência + API               | `storage`, stores e `aliceApi` respondendo as rotas da API pública, com testes de integração verdes; telas agora conversam com o core real. |
| 4    | Refino de DX e distribuição               | `npm run build` + `pm2` rodando; celular acessa o app; README com jornada mínima. |

Fase 1 produz só casca visual + mocks (sem core real). Fase 2 não depende de nada além de TypeScript e Zod. Fase 3 conecta a UI aprovada ao core/persistência reais. Fase 4 amarra tudo para a Alice usar de verdade.

Fluxo de revisão UI-first: a Alice valida o visual na Fase 1; mudanças que ela pedir alteram as ZenSpecs de UI e o `AliceDesignSpec.md` **antes** de qualquer código real.

---

## 5. Tarefas por fase

| ID  | Fase | Tipo    | Tarefa                                              | Origem              | Saída                                                        | Pode ser paralelo? |
| --- | ---- | ------- | --------------------------------------------------- | ------------------- | ------------------------------------------------------------ | ------------------ |
| T1  | 1    | ZenSpec | Criar ZenSpec do `pricingPanel` (UI)                | Eng / 3.4 + Design  | `./specs/pecas/apresentar-calculadora-no-celular.zenspec.md` | Não                |
| T2  | 1    | Infra   | Setup Vite + Tailwind + estrutura da UI             | Stack / 3 e 6       | `./src/ui/*` configurado                                     | Sim                |
| T3  | 1    | Código  | Implementar casca do `pricingPanel` (mock provisório) | T1, T2            | `./src/ui/app/pricing-panel.ts` + mocks                      | Não                |
| T4  | 1    | ZenSpec | Criar ZenSpec do `costsPanel` (UI)                  | Eng / 3.4 + Design  | `./specs/custos/editar-custos-de-referencia.zenspec.md`      | Sim                |
| T5  | 1    | Código  | Implementar casca do `costsPanel` (mock provisório) | T4, T2              | `./src/ui/app/costs-panel.ts` + mocks                        | Não                |
| T6  | 1    | ZenSpec | Criar ZenSpec do `piecesListPanel` (UI)             | Eng / 3.4 + Design  | `./specs/pecas/listar-e-reusar-pecas.zenspec.md`             | Sim                |
| T7  | 1    | Código  | Implementar casca do `piecesListPanel` (mock provisório) | T6, T2           | `./src/ui/app/pieces-list-panel.ts` + mocks                  | Não                |
| T8  | 1    | Teste   | Testes de estado das telas (Vitest + jsdom)         | T1, T4, T6          | `./tests/unit/ui/*.test.ts`                                  | Sim                |
| T9  | 2    | Infra   | `npm init` + TypeScript + ESLint + Prettier + Vitest + zod | Stack / 3 e 4 | `package.json`, `tsconfig.json`, configs                    | Sim                |
| T10 | 2    | ZenSpec | Criar ZenSpec de `pricingEngine`                    | Eng / 3.1 + modelo | `./specs/precificacao/calcular-custo-e-precos.zenspec.md`    | Não                |
| T11 | 2    | Código  | Implementar `pricingEngine`                         | T10                 | `./src/core/pricing-engine.ts`                               | Não                |
| T12 | 2    | Teste   | Testes do `pricingEngine` (validar vs. planilha)    | T10                 | `./tests/unit/core/pricing-engine.test.ts`                   | Sim                |
| T13 | 2    | ZenSpec | Criar ZenSpec de `productEngine`                    | Eng / 3.1 + modelo | `./specs/produtos/calcular-custo-de-produto.zenspec.md`      | Sim                |
| T14 | 2    | Código  | Implementar `productEngine`                         | T13                 | `./src/core/product-engine.ts`                               | Não                |
| T15 | 2    | Teste   | Testes do `productEngine` (validar vs. planilha)    | T13                 | `./tests/unit/core/product-engine.test.ts`                   | Sim                |
| T16 | 2    | ZenSpec | Criar ZenSpec de `pricingInputNormalizer`           | Eng / 3.1           | `./specs/precificacao/normalizar-entradas-de-precificacao.zenspec.md` | Sim          |
| T17 | 2    | Código  | Implementar `pricingInputNormalizer` (tempo h:min)  | T16                 | `./src/core/pricing-input-normalizer.ts`                     | Não                |
| T18 | 2    | Teste   | Testes do `pricingInputNormalizer`                  | T16                 | `./tests/unit/core/pricing-input-normalizer.test.ts`         | Sim                |
| T19 | 3    | ZenSpec | Criar ZenSpec do `storage` (schema SQLite)          | Eng / 3.5 + Stack   | `./specs/infrastructure/spec.md` + schema                     | Não                |
| T20 | 3    | Código  | Implementar `storage` + `db:init`                   | T19                 | `./src/db/*` e `./scripts/db-init.ts`                        | Não                |
| T21 | 3    | ZenSpec | Criar ZenSpec de `costReferenceStore`               | Eng / 3.2           | `./specs/custos/guardar-custos-de-referencia.zenspec.md`     | Sim                |
| T22 | 3    | Código  | Implementar `costReferenceStore`                    | T21, T20            | `./src/stores/cost-reference-store.ts`                       | Não                |
| T23 | 3    | Teste   | Testes do `costReferenceStore`                      | T21                 | `./tests/unit/stores/cost-reference-store.test.ts`           | Sim                |
| T24 | 3    | ZenSpec | Criar ZenSpec de `pieceStore`                       | Eng / 3.2           | `./specs/pecas/salvar-e-listar-pecas.zenspec.md`             | Sim                |
| T25 | 3    | Código  | Implementar `pieceStore`                            | T24, T20            | `./src/stores/piece-store.ts`                                | Não                |
| T26 | 3    | Teste   | Testes do `pieceStore`                              | T24                 | `./tests/unit/stores/piece-store.test.ts`                    | Sim                |
| T27 | 3    | ZenSpec | Criar ZenSpec de `productStore`                     | Eng / 3.2           | `./specs/produtos/salvar-e-listar-produtos.zenspec.md`       | Sim                |
| T28 | 3    | Código  | Implementar `productStore`                          | T27, T20            | `./src/stores/product-store.ts`                              | Não                |
| T29 | 3    | Teste   | Testes do `productStore`                            | T27                 | `./tests/unit/stores/product-store.test.ts`                  | Sim                |
| T30 | 3    | ZenSpec | Criar ZenSpec do `aliceApi` (rotas REST)            | Eng / 6 e 7         | `./specs/infrastructure/atender-api-rest.zenspec.md`         | Não                |
| T31 | 3    | Código  | Implementar `aliceApi`                              | T30, T11, T14, T22, T25, T28 | `./src/server/*`                                | Não                |
| T32 | 3    | Teste   | Testes de integração da API                         | T30                 | `./tests/integration/api.test.ts`                            | Sim                |
| T33 | 3    | Código  | Conectar telas ao core real (remover mocks)         | T3, T5, T7, T31     | telas chamando `/api/*` e os engines                         | Não                |
| T34 | 4    | Doc     | README com jornada mínima + IP/porta de acesso      | Stack / 5 e 9       | `./README.md`                                                | Sim                |
| T35 | 4    | Infra   | Validar `npm run build` + `pm2` + acesso pelo celular | T3, T5, T7, T33   | servidor rodando e página abrindo no celular                 | Não                |

Regra do trio obrigatório aplicada: todo componente de core, store e orquestrador tem ZenSpec → Código → Teste. Telas de UI na Fase 1 usam mocks provisórios (marcados como provisórios nas ZenSpecs e no Sensei) e ganham os testes de estado na Fase 1, com testes de integração na Fase 3.

---

## 6. ZenTarefas (micro)

O arquivo diário é `./Alice-tarefas.md` (ver próxima seção de saída).

### Pipeline

```
Concept → Eng → Stack → Sensei → ZenSpec → Código → Testes → Exemplo → README
```

### Blocos de trabalho

| Bloco         | Quando usar                          | To-dos mínimos                                                          |
| ------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| Casca visual  | Primeiro de tudo                     | T1–T8 (ZenSpecs de UI + setup + cascas com mocks + testes de estado)    |
| Kernel        | Quando a casca está aprovada         | T9–T18 (tooling + `pricingEngine` + `productEngine` + normalizador + testes) |
| Persistência  | Quando o kernel anda                 | T19–T32 (storage + stores + API)                                         |
| Conexão       | Quando a API responde                | T33 (remover mocks e ligar telas ao core real)                          |
| DX            | Quando o sistema já anda             | T28 (README) + T29 (deploy no servidor)                                  |

---

## 7. Ganchos para GitHub

| Alvo       | Como usar                                                          |
| ---------- | ------------------------------------------------------------------ |
| Issues     | Cada tarefa vira issue `T<ID> - <Tarefa>` (ex.: `T1 - ZenSpec pricingEngine`). |
| Labels     | `tipo/ZenSpec`, `tipo/Código`, `tipo/Teste`, `tipo/Infra`, `tipo/Doc` e `fase/1..4`. |
| Milestones | `Fase 1 - Núcleo`, `Fase 2 - Persistência e API`, `Fase 3 - Telas`, `Fase 4 - Distribuição`. |
| PRs        | Ideal: 1 PR por bloco lógico (Kernel, Persistência, UI, DX).        |

---

## 8. Regras de passagem de fase

| Fase | Pode encerrar quando…                                                                                           |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| 1    | As 3 telas funcionam no celular com mocks provisórios e o **visual foi aprovado pela Alice** (design especificado e revisado). |
| 2    | `pricingEngine` e `pricingInputNormalizer` com ZenSpec aprovada, testes verdes e nenhum TODO pendente.          |
| 3    | Todas as rotas da API pública respondem conforme a Eng Spec (seção 6), telas conectadas ao core real, com testes verdes. |
| 4    | `npm run build` + `pm2` funcionando; a Alice abre o app no celular e precifica uma peça de ponta a ponta.      |

---

## 9. Escopo fora

Este Sensei não faz:

- Gestão de equipe, datas e sprints.  
- Prioridade de negócio do roadmap da empresa.  
- Estimativa de esforço (horas, story points).  
- Decisões de stack (estão no `AliceStackSpec.md`).  
- Redefinir conceito ou arquitetura (papel do Concept/Eng Spec).

---

## 10. Registro de mudanças

| ID | Origem (tarefa/evento) | O que mudou | Tarefas afetadas |
| -- | ---------------------- | ----------- | ---------------- |
| R1 | Decisão do usuário: começar pelo visual | Modo de execução trocado de Core-first para **UI-first/Vertical slice**; Fase 1 agora é a casca visual com mocks provisórios; núcleo, persistência e conexão foram reordenados; tabela de tarefas renumerada (T1–T29). | Todas |
| R2 | Análise das planilhas (Orcamentos, Custos esmaltes, Custos Aquarelas) | Modelo de cálculo atualizado para **1:1 com as planilhas** (`modelo-de-precificacao.md`): esmalte em R$, margem como % do preço (`÷(1−m)`), dificuldade 1–5 → fator até 1,8, custo hora derivado dos custos fixos, embalagem, acessórios, risco/refação, taxas; adicionados `productEngine` e `productStore`; tabela renumerada (T1–T35). | Todas |
| R3 | Decisão do usuário: foco em custos fixos | Aba Fixos do `costsPanel` reorganizada em **6 categorias** (Espaço, Energia&Internet, Pessoal, Serviços/Impostos/Digital, Equipamentos, Insumos gerais) com os **20 itens das planilhas pré-cadastrados**; salário movido para a categoria Pessoal (fim da duplicação); adicionado fluxo "+ adicionar custo" (bottom sheet); `totalGastos`, rateio e custo da hora passam a ser **derivados automáticos** da soma. ZenSpec de custos e `modelo-de-precificacao.md` §2.1/§3.4 atualizados. | T4, T5 |
| R4 | Decisão do usuário: simplificar a arquitetura de custos fixos | Aba Fixos reestruturada em **2 blocos**: **Mão de obra** (salário + horas/dia + dias/mês + hora pessoa derivada) e **4 categorias de despesa** (Espaço & contas, Serviços & digital, Equipamentos & manutenção, Suprimentos & provisões); juntadas Espaço+Energia; **rateio e faturamento médio removidos** (hora total já embute os fixos); botão "⇄ mover item" entre Mão de obra e categorias. ZenSpec de custos e `modelo-de-precificacao.md` §2.1 atualizados. | T4, T5 |
| R5 | Revisão da Mão de obra com o usuário | Bloco renomeado para **Mão de obra & pessoal**; pré-cadastrados itens de **Impostos do salário (INSS, IR)** e **Freelas / terceirizados**; `custoHoraPessoa` passa a somar toda a Mão de obra (salário + impostos + freelas) ÷ horasMes; bottom sheet de "+ adicionar custo" ganha **sugestões rápidas contextuais** (pessoal: Freela, INSS, Plano de saúde; despesas: Aluguel, IPTU, Provedor). Corrigido bug de render com dados antigos de `localStorage` (chave v2 + render defensivo). | T4, T5 |
| R6 | Decisão do usuário: hora pessoa = só salário + hierarquia em cards | `custoHoraPessoa` volta a ser **só o Salário ÷ horasMes**; impostos do salário e freelas passam a entrar só no total gastos (hora total); **freelas viram 5ª categoria de despesa** `Freelas & terceirizados`; hierarquia visual da aba Fixos redesenhada com **cards por categoria** (cabeçalho nome + subtotal) em vez de subtítulos soltos. ZenSpec de custos e `modelo-de-precificacao.md` §2.1 atualizados. | T4, T5 |
| R7 | Decisão do usuário: persistência simples | Implementação da persistência em **Node puro + `node:sqlite`** (sem Fastify/better-sqlite3/Vite/TS no v1), reusando o mock aprovado como UI servida estaticamente. Criados `server.js` (API `GET/PUT /api/costs` + static serve na porta 8787) e banco `data/alice.db` (tabela `kv`). Adicionado botão **Exportar backup** no `costsPanel`. Stack Spec, Eng Spec e ZenSpec de custos atualizados para refletir a escolha. | T4, T5, T9, T16–T19, T30–T32 |
| R8 | Decisão do usuário: categorias dinâmicas | `costsPanel` passa a permitir **criar, renomear e excluir categorias** de despesa (botão "+ nova categoria" e "⋯" no card da categoria, com confirmação ao excluir). Categorias são renderizadas dinamicamente em `#lista-despesas`; Mão de obra permanece bloco fixo não excluível. Persistência automática mantida. ZenSpec de custos atualizada. | T4, T5 |
| R9 | Revisão dos custos com o usuário | Adicionados **itens sugeridos (valor 0)** nas categorias: Espaço (Aluguel, IPTU, Condomínio, Gás), Serviços (Domínio, Hospedagem, Impulsionamento), Equipamentos (Novos equipamentos), Suprimentos (Papelaria), Mão de obra (Plano de saúde, Vale-refeição). Criação de `mergeItensSugeridos()` — ao carregar dados salvos, itens sugeridos ausentes são adicionados com 0 sem sobrescrever valores preenchidos. Banco limpo para recomeçar com padrões enriquecidos. | T4, T5 |
| R10 | Decisão do usuário + pesquisa internacional (padrão ouro 2026) | Documento `Specs/precificacao/padrao-ouro-2026-pesquisa.md` criado com pesquisa de estado-da-arte. **Topo**: tela inicial "Vamos precificar?" com cards grandes (Peça/Produto) + wizard curto (progressive disclosure); categoria como atributo, não 1ª pergunta. **Canais**: fichas pré-salvas com comissões reais 2026 (Pix 0,99%, cartão 3,29–5,69%+R$0,35, ML 10–19%, Shopee 14–20%, Etsy 6,5%+US$0,20); **Elo7 encerrou em 05/2026 — removido**; pergunta fiscal única (MEI/Simples/informal). **Frete**: 3 cenários padrão Etsy (entrega própria = fixo local, Correios = calculado, rateio = 1º item cheio + adicionais). **Poka-yoke/TDAH**: cálculos escondidos, defaults bons, validação por passo, confirmação progressiva. | T1–T8 |
| R11 | Decisão do usuário: UI poka-yoke para TDAH | Confirmado o público-alvo (pessoa que odeia planilhas, TDAH) → toda a UI deve ser **quase um assistente**: zero números visíveis desnecessários, 1 pergunta por vez, default = modo "líquido" (÷(1−taxas)), feedback motivacional ("quanto você ganha por hora"). Registrado no documento de pesquisa e nos ZenSpecs de UI. | T1–T8 |
| R12 | Auditoria de cálculo + padrão internacional | Fórmula de taxas da peça unificada para o **modo líquido** `custoTotal ÷ (1 − Σ taxas)` (igual ao produto; padrão Etsy). Antes usava `× (1 + taxas)`, que sub-recuperava a taxa (perda ~3% por item no Mercado Livre). `modelo-de-precificacao.md` §3.3 atualizado. | T10–T12, T13–T15 |
| R13 | Auditoria de cálculo: produto com overhead | `productEngine`/`calcularProduto` passa a usar `custoHoraTotal()` (custo fixo + salário ÷ horas mês) em vez de `custoHoraPessoa()` (só salário) para a montagem, e inclui **Risco/refação** (linha `rp-risco`). Antes o produto ignorava overhead e perda — sub-precificava aulas/kits. | T13–T15 |
| R14 | Decisão do usuário: escala de perda | `taxaPerda` virou uma **escala de 3 níveis** (`CONFIG.perdas`): **Baixa 15% · Média 30% (default) · Alta 45%**, escolhida por chips na aba Taxas (`chips-perda`). Justificativa: a perda real de ateliê soma alocação de matéria-prima (15–20%) + quebra/refação (10–20%) + promocionais e seconds monetizados com desconto — a literatura internacional trata separado, o ateliê sente junto. Pesquisa: CraftsTrack (tiers 5/10/15%), FeeProofed (linha fixa de perda), Ultimate Finance (alocação 15–20%), East Fork (seconds a 30%). Dados antigos com `taxaPerda` caem no default Média. | T4, T5, T10–T15 |
| R15 | Decisão do usuário: GitHub Pages é a hospedagem única | **Fim do servidor local (`node server.js`).** Todo o mock passa a rodar 100% estático em `https://ferrarijonas.github.io/denaro/` com `localStorage` como fonte de verdade (LS_KEY `alice-mock-custos-v3`); exportar/importar backup é a portabilidade. Workflow `pages.yml` público. Nada de paths absolutos; `BACKEND_URL` fica vazia. | T34, T35 |
| R16 | Revisão UX + padrão internacional: seção "Entrega" | Seção "Como a peça sai?" estava confusa por **misturar dois eixos** (método de entrega + rateio) num só seletor. Redesenhada no modelo Etsy: **método de entrega** em chips ("Entrego eu mesma" / "Vai pelos Correios" / "Ela retira aqui") + **divisão automática** do frete pelo campo "peças no mesmo envio" (combined shipping). "Ela retira aqui" (local pickup) = R$ 0 sem campos. Ícone `i-retirada` adicionado ao sprite (18 símbolos). `padrao-ouro-2026-pesquisa.md` §4 e `modelo-de-precificacao.md` §8 atualizados. | T1–T8 |
| R17 | Pesquisa internacional: frete em 3 países | Pesquisa direta nas políticas de ateliês sólidos (Japão: 1616/Arita, Fukagawa, Koransha, KIKOF, Bizen; Itália: Bitossi, Ginori 1735, F.lli Mari, Torretti, Casola; EUA: East Fork, Heath, Jono Pandolfi, A.MANO). **Consenso: frete SEMPRE à parte, nunca embutido**; "grátis acima de X" é padrão no Japão (¥11.000) e Itália (€99–500) e isca pontual nos EUA; embalagem entra no custo (COGS); ida ao correio = overhead; quebra monetizada (seconds a 30%). Registrado em `padrao-ouro-2026-pesquisa.md` §4.1. **Decisão pendente: app deve permitir escolher por peça "frete à parte" vs "embutir no preço".** | T1–T8 |
| R18 | Simulação de 3 agentes (Japão/Itália/EUA) → UI Entrega | Cruzei 3 agentes personificando os ateliês. **Consenso: "frete não é preço".** Seção Entrega reescrita em **2 perguntas**: (A) método de entrega (Entrego eu mesma / Correios / Ela retira) e (B) **quem paga** ("A cliente paga à parte" default / "Frete grátis pra ela"). À parte → frete é repasse informativo FORA do custo; embutido → frete entra no custo e sobe com margem, badge "Frete grátis pra ela"; retirada pula B e rateio. Linha de resultado ganha rótulo+dica dinâmicos. Pendências futuras: escolha por tamanho de caixa (pré-API), regra global "grátis acima de X", recap chip por peça. | T1–T8 |
| R19 | Persistência na nuvem (Firestore) + app vira "Denaro" + autosave | Migração do `localStorage`-only para **Firebase Firestore** (projeto dedicado `denaro-precificador`, nome de exibição "Denaro"; Spark grátis; banco `(default)` em `southamerica-east1`; regras limitam ao doc `alice/estado`). SDK compat no mock; `localStorage` vira cache/fallback. Repositório renomeado para `ferrarijonas/denaro` (URL `/denaro/`). **Autosave contínuo**: debounce 700ms em qualquer mudança (input/chip/stepper) + save ao sair (`pagehide`); rascunho dos formulários de peça/produto é persistido e restaurado; custos (horas/dia/imposto) sincronizados do formulário antes de gravar. `BACKEND_URL` removida; `server.js`/SQLite viram legado. | — |
| R20 | Limpeza + "Orçamentos" + fim do backup manual + fotos no Storage | Removidos os **3 itens mockados** de "Meus itens" (código e nuvem) e adicionado botão **✕ apagar** por orçamento. Tela renomeada para **"Orçamentos"** (nav + título + vazio). **Seção "Exportar/Importar backup" removida** (a nuvem grava em tempo real; portabilidade é automática). **Fotos na nuvem**: base64 sobe para o **Firebase Storage** (`alice-fotos/`, mesmo projeto, Spark grátis) e o Firestore guarda a URL; base64 fica no `localStorage` como garantia com re-upload no próximo save (fallback à prova de perda). Regras do Storage publicadas; `deploy:rules` agora cobre Firestore + Storage. | — |
| R19 | Persistência na nuvem (Firestore) + app vira "Denaro" + autosave | Migração do `localStorage`-only para **Firebase Firestore** (projeto dedicado `denaro-precificador`, nome de exibição "Denaro"; Spark grátis; banco `(default)` em `southamerica-east1`; regras limitam ao doc `alice/estado`). SDK compat no mock; `localStorage` vira cache/fallback. Repositório renomeado para `ferrarijonas/denaro` (URL `/denaro/`). **Autosave contínuo**: debounce 700ms em qualquer mudança (input/chip/stepper) + save ao sair (`pagehide`); rascunho dos formulários de peça/produto é persistido e restaurado; custos (horas/dia/imposto) sincronizados do formulário antes de gravar. `BACKEND_URL` removida; `server.js`/SQLite viram legado. | — |
|    |                        |             |                  |
