# Denaro Eng Spec

Arquitetura clara, sem ambiguidade. Eng Spec diz **a estrutura**; ZenSpec diz **o comportamento**; código diz **como**.
Este documento segue o template de `ZenEngSpec.md` e é derivado de `DenaroConceptSpec`.

---

## 1. Intenção

> Esta arquitetura existe para que **a ceramista e sua ajudante** consigam **precificar peças de cerâmica pelo celular, com custo auditável e preço em várias margens**, sem precisar de **planilhas frágeis, contas manuais ou servidor para manter**.

---

## 2. Glossário

| Termo              | Definição                                                                          |
| ------------------ | ---------------------------------------------------------------------------------- |
| `Peça`             | Item de cerâmica unitário precificado por peça (argila + esmalte + mão de obra + embalagem + queima + risco). Ex.: copo, vaso. |
| `Produto`          | Item fabricado em lote a partir de uma receita em gramas (giz, aquarela, caixa de 7 cores). |
| `Receita`          | Lista de insumos em gramas que compõe um produto (ex.: 400g feldspato + 250g caulim). |
| `Linha`            | Faixa comercial que define a margem (peças: Exclusiva/Padrão/Revenda) ou o multiplicador (produtos: Autoral/Profissional/Essencial). |
| `Custo de referência` | Valores fixos cadastrados usados nos cálculos (custos fixos → custo da hora, insumos, embalagens, taxas, margens, fornos). |
| `Dificuldade`      | Nível artístico 1–5 (UI) mapeado para multiplicador interno 1,0–1,8 que ajusta a mão de obra. |
| `Margem`           | Percentual que, subtraído do preço de venda, deixa o custo: `preco = custoComTaxas ÷ (1 − margem)`. |
| `Esmalte (R$)`     | Custo do esmalte da peça informado em **reais** (não em %). |
| `Cálculo`          | Resultado determinístico dos motores `calcularCustoPeca`/`calcularCustoProduto` a partir do modelo em `modelo-de-precificacao.md`. |
| `Armazenamento`    | Onde os dados vivem: o **Firestore** (doc `alice/estado`) com **`localStorage`** como cache/fallback local. A UI usa o SDK do Firebase compat direto no navegador — sem servidor. O `server.js` (SQLite) é apenas legado opcional. |

> **Chave interna:** o doc do Firestore chama-se `alice/estado` por continuidade de dados (não é o nome do produto — o produto é **Denaro**). Não renomear sem migração dos dados existentes.

---

## 3. Princípios de arquitetura

Régua do projeto (Unix-style). Todo programa e toda refatoração seguem isto:

1. **Programa = função pura com contrato.** Cada "programa" é uma função que recebe entrada, devolve saída e **não toca DOM, `localStorage`, Firestore nem estado global**. Efeitos ficam numa camada fina de "fiação".
2. **Texto entra, texto sai.** Dados fluem como objetos planos (JSON-like); o render devolve **string SVG**; nada de estado escondido no meio do caminho.
3. **Composição em pipeline.** `formulário → normalizar → calcular → desenhar`. Cada estágio é independente e pode ser testado isolado (entrada fixa → saída esperada).
4. **Uma fonte de verdade por dado.** O formulário é o input; a config declarada é a fonte do modelo; o estado persistido é a fonte do histórico. Nunca duas cópias que podem dessincronizar.
5. **Config declarada, zero número mágico.** Parâmetros do modelo vivem em objetos declarados (`OCUPACAO`, `PACKING`, `RENDER`), auditáveis, nunca soltos no meio do código.
6. **Determinismo.** Mesmos dados → mesmo resultado e mesmo render. O SVG é gerado por posições calculadas, sem aleatoriedade.

Metáfora: **torneira → cano → copo** — cada parte faz uma coisa e o líquido flui. Nada pula estágio, nada escreve em lugar nenhum além do copo final (a tela).

---

## 4. Componentes

Para cada componente: nome em `código`, metáfora em **negrito**, resumo e contrato resumido.

### 4.1 Núcleo (domínio `precificacao`) — programas puros em `app/js/modelo.js`

O modelo exato de cálculo vive em `Specs/precificacao/modelo-de-precificacao.md` (extraído das planilhas, validado número a número).

> **Regra de nome:** o nome do programa (no spec) é o nome da função no código. Um programa, um nome.

- `calcularCustoPeca` — **calculadora de peças**
  Computa o custo de uma **peça** (argila + esmalte + mão de obra + embalagem + acessórios + queima + risco + taxas) e os preços por linha (Exclusiva/Padrão/Revenda). Função pura: `(estado, config, inputs) → { custo, custoComTaxas, linhas }`.
  `Contrato: calcularCustoPeca.zenspec.md`.

- `calcularCustoProduto` — **calculadora de produtos**
  Computa o custo de um **produto** (receita em gramas ÷ unidades + embalagem + montagem + taxas) e os preços por linha (Autoral/Profissional/Essencial). Função pura.
  `Contrato: calcularCustoProduto.zenspec.md`.

- `lerMedidas` (+ leitura do formulário) — **tradutor**
  Lê os campos do formulário e devolve objetos planos validados (peso, esmalte em R$, tempo h:min → decimal, medidas da peça). É a fronteira entre DOM e núcleo.
  `Contrato: lerMedidas.zenspec.md`.

- `estimarCabem` — **"quantas cabem"**
  Estima quantas peças como a atual ocupam um forno (por prateleira × níveis, empilhamento e encaixe), usando o config `OCUPACAO`. Função pura. Fonte única de "quantas cabem" — usada pelo custo de queima **e** pelo render.
  `Contrato: Specs/queima/estimarCabem.zenspec.md`.

### 4.2 Desenho (domínio `queima`) — programa puro em `app/js/desenho.js`

- `desenharForno` — **ilustrador do forno**
  Recebe `(medidas, forno)` e devolve a **string SVG** das duas vistas (biscoito/esmalte) com a peça principal + cópias, determinístico, nada fora do forno. Não toca DOM.
  `Contrato: Specs/precificacao/desenharForno.zenspec.md`.

### 4.3 Config — `app/js/config.js`

- `config` — **gaveta de fichas**
  Valores padrão e catálogos declarados: `ARGILAS`, `MATERIAS_PRIMAS`, `CATALOGO_*`, `CONFIG` (custos, fornos, margens, taxas), `OCUPACAO`, `PACKING`, `RENDER`. Sem lógica; só dados.

### 4.4 Persistência (domínio `custos`) — camada fina na UI

- `storage` — **arquivo local + nuvem**
  Firestore (doc `alice/estado`) como fonte de verdade + `localStorage` (`LS_KEY = "alice-mock-custos-v3"`) como cache/fallback e guarda da base64 das fotos. Fotos sobem para o Firebase Storage (`alice-fotos/`) e o doc guarda a URL.
  Persistência de peças/produtos/custos vive nessa mesma camada (não há `pieceStore`/`productStore` separados; o doc único guarda `salvos` + `rascunho` + config).

### 4.5 UI (mobile-first) — fiação no `app/index.html`

- `pricingPanel` — **balcão do precificador**
  Tela principal com toggle **Peça / Produto**, seções (Insumos, Mão de obra, Tamanho, Queima, Embalagem, Frete), custo detalhado + preços por linha. Escreve no DOM os resultados dos motores.
  `Contrato: Specs/precificacao/pricingPanel.zenspec.md`.

- `costsPanel` — **gaveta visível**
  Tela de cadastro/edição dos custos de referência (Fixos → custo hora, Insumos, Embalagens/Acessórios, Taxas & Margens).
  `Contrato: Specs/custos/costsPanel.zenspec.md`.

- `fornosPanel` — **parede da garagem**
  Tela de fornos e serviços de queima.
  `Contrato: Specs/queima/fornosPanel.zenspec.md`.

- `piecesListPanel` — **caderno aberto**
  Tela que lista peças e produtos salvos, com filtro por tipo, e permite abrir/copiar/editar.
  `Contrato: Specs/pecas/piecesListPanel.zenspec.md`.

---

## 5. Fluxo

**Linha do fluxo (peça):**

```
formulário → lerMedidas (normalizar) → calcularCustoPeca (engine) → renderResultado (tela)
formulário → lerMedidas → estimarCabem (ocupação) → desenharForno (SVG) → renderFornoSVG (tela)
```

**Tabela imediata:**

| Programa               | Recebe                                | Faz                                          | Manda para                  |
| ---------------------- | ------------------------------------- | -------------------------------------------- | --------------------------- |
| `pricingPanel`         | toques da usuária                     | lê campos + `lerMedidas` → monta `inputs`    | `calcularCustoPeca`/`calcularCustoProduto` |
| `calcularCustoPeca`    | `inputs` + config                     | calcula custo e preços por linha de peça     | `pricingPanel` (render)     |
| `calcularCustoProduto` | `inputs` + config                     | calcula custo e preços por linha de produto  | `pricingPanel` (render)     |
| `estimarCabem`         | tipo + forno + medidas                | peças por prateleira × níveis (empilha/encaixa) | `desenharForno` + custo de queima |
| `desenharForno`        | medidas + forno + `estimarCabem`      | gera a string SVG das 2 vistas               | `pricingPanel` (injeção)    |
| `storage`              | comandos de salvar/carregar           | Firestore + `localStorage` (fotos no Storage) | — (persistência)            |
| `costsPanel`/`fornosPanel` | toques da usuária                 | edita config e grava via `storage`           | `storage`                   |
| `piecesListPanel`      | toques da usuária                     | lista/abre/copia/edita itens salvos          | `storage`                   |

Regra: toda seta do diagrama aparece na tabela. Sem atalhos; nenhum programa de núcleo toca DOM.

---

## 6. Ciclo de vida do app

**Diagrama:**

```
[carregar] → [restaurar rascunho] → [interação] → [autosave (Firestore + local)]
```

| Estado            | O que acontece                                              | Se falhar                          |
| ----------------- | ----------------------------------------------------------- | ---------------------------------- |
| `carregar`        | Lê Firestore (`alice/estado`); se vazio/offline, cai no `localStorage` | segue com defaults + badge "nuvem off" |
| `restaurar`       | Aplica config e rascunho salvos; re-render das telas        | segue com defaults locais          |
| `interação`       | Input/chip/stepper → recálculo + render ao vivo             | erro de validação no campo, sem parcial |
| `autosave`        | Debounce 700ms → grava `localStorage` + Firestore; `pagehide` salva na hora | badge "nuvem off"; local mantém |

---

## 7. Modelo de erros

**Tabela:**

| Situação                                      | Comportamento                                                  |
| --------------------------------------------- | -------------------------------------------------------------- |
| Entrada inválida (peso ≤ 0, tempo ≤ 0, dificuldade fora de 1–5, medidas ≤ 0) | campo marcado em `terracota` com mensagem; nada é calculado |
| `calcularCustoPeca` recebe input que não passa na validação | falha explícita, nunca retorna preço parcial |
| Custo de referência ausente (sem argila/hora cadastrados) | banner suave "Cadastre seus custos para valores reais" + link para `costsPanel` |
| Firestore fora do ar | badge `#sync-status` "nuvem off"; tudo segue no `localStorage` |
| Peça maior que o forno (`estimarCabem.total = 0`) | render vazio + legenda "não cabe · peça maior que o forno" |

Regra: toda situação de erro listada é rastreável a um programa ou estado do ciclo de vida. Nunca sucesso parcial silencioso.

---

## 8. Decisões e alternativas descartadas

> **Decisão:** O cálculo segue o modelo exato das planilhas (`modelo-de-precificacao.md`): custo de peça = `argila + esmalte(em R$) + embalagem + acessórios + mão de obra + queima + risco + rateio frete`, com preço por linha = `custoComTaxas ÷ (1 − margem)`. Produtos usam receita em gramas ÷ unidades + embalagem + montagem, com preço = `custoComTaxas × multiplicador`.
> **Alternativa descartada:** esmalte como percentual sobre a argila e margem como markup sobre custo (`custo × (1 + margem)`).
> **Motivo:** a planilha usa esmalte em **reais** e margem como **% do preço** (`÷ (1 − m)`); os valores da planilha foram conferidos número a número com esta regra.

> **Decisão:** Dois motores (`calcularCustoPeca` para peças, `calcularCustoProduto` para produtos) em vez de um único.
> **Alternativa descartada:** um engine genérico único com flag de tipo.
> **Motivo:** as contas diferem em estrutura (peça soma argila+risco; produto divide receita por unidades), e manter cada um com seu contrato deixa o trio ZenSpec→Código→Teste mais direto.

> **Decisão:** Programas puros (sem DOM) em arquivos separados (`app/js/config.js`, `modelo.js`, `desenho.js`); a UI é uma camada fina de fiação.
> **Alternativa descartada:** lógica de cálculo espalhada e duplicada entre custo e render, com estado em dois lugares.
> **Motivo:** `estimarCabem` é a **fonte única** de "quantas cabem" — o custo por carga e o desenho do forno nunca divergem; funções puras são testáveis por um harness Node.

> **Decisão:** `dificuldade` é 1–5 na UI, mapeado para multiplicador interno 1,0/1,2/1,4/1,6/1,8 (como a planilha).
> **Alternativa descartada:** dificuldade já cadastrada como multiplicador direto na tela.
> **Motivo:** a ceramista pensa em 1 a 5; o multiplicador fica escondido e vai até 1,8, como nas planilhas.

> **Decisão:** Persistência na nuvem via **Firebase Firestore** (plano Spark, gratuito), doc único `alice/estado`, com `localStorage` como cache/fallback local.
> **Alternativa descartada:** SQLite no servidor local, PostgreSQL, JSON em arquivo, e `localStorage` isolado por aparelho.
> **Motivo:** o Firestore sincroniza os dados entre os aparelhos da ceramista e da ajudante sem servidor para manter, continua gratuito (Spark) e funciona em site 100% estático (GitHub Pages).

> **Decisão:** Site 100% estático no GitHub Pages + Firestore; sem servidor próprio no v1.
> **Alternativa descartada:** manter um processo Node (API + UI) no servidor da casa.
> **Motivo:** hospedagem estática gratuita com HTTPS automático; o Firestore cobre a persistência, então não há processo para manter de pé.

> **Decisão:** O frontend usa o **SDK do Firebase compat** direto no navegador, em vez de uma API própria (`aliceApi`).
> **Alternativa descartada:** manter `fetch`/`BACKEND_URL` para um backend próprio (Apps Script ou VPS).
> **Motivo:** com o SDK compat, o app roda 100% estático no GitHub Pages e sincroniza sem infraestrutura; a costura `BACKEND_URL` foi removida.

---

## 9. Distribuição e uso

- **Formato (v1):** app web estático publicado no **GitHub Pages** (HTTPS, gratuito); acesso pelo navegador em `https://ferrarijonas.github.io/denaro/`. Dados sincronizados no **Firestore** (doc `alice/estado`) + **Storage** para fotos, com `localStorage` como cache local.
- **Formato (modo local legado, opcional):** processo Node (`server.js`) na rede de casa via `pm2`; serve a mesma UI e expõe `GET/PUT /api/costs`. Não é usado pelo app publicado.
- **Jornada mínima:** abrir o link → cadastrar custos de referência → precificar a primeira peça.
- **Pré-requisitos:** repositório público no GitHub + projeto Firebase (Spark) com Firestore criado e regras publicadas.

---

## 10. Escopo fora

- Multi-tenancy, autenticação por usuário e permissões (o Firestore hoje usa regras que restringem ao doc `alice/estado`; auth entra numa versão futura).  
- Conflitos de edição simultânea real-time (o Firestore sincroniza por documento; editar ao mesmo tempo em dois aparelhos pode sobrescrever).  
- Controle de quais fotos podem ser apagadas no Storage (hoje o arquivo é mantido mesmo se o orçamento for apagado, por segurança).  
- Importação das planilhas atuais (fica no escopo futuro do conceito; os valores de referência do v1 vêm de `modelo-de-precificacao.md`).  
- Painel separado de ocupação do forno (hoje o render-duplo vive embutido na precificação; o painel com slider de carga real é futuro — ver `Specs/queima/estimarCabem.zenspec.md`).  
- Cálculos de lucro por mês, relatórios e dashboards.