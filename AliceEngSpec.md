# Alice Eng Spec

Arquitetura clara, sem ambiguidade. Eng Spec diz **a estrutura**; ZenSpec diz **o comportamento**; código diz **como**.
Este documento segue o template de `ZenEngSpec.md` e é derivado de `AliceConceptSpec`.

---

## 1. Intenção

> Esta arquitetura existe para que **Alice e sua ajudante** consigam **precificar peças de cerâmica pelo celular, com custo auditável e preço em várias margens**, sem precisar de **planilhas frágeis, contas manuais ou servidor para manter**.

---

## 2. Glossário

| Termo              | Definição                                                                          |
| ------------------ | ---------------------------------------------------------------------------------- |
| `Peça`             | Item de cerâmica unitário precificado por peça (argila + esmalte + mão de obra + embalagem + risco). Ex.: copo, vaso. |
| `Produto`          | Item fabricado em lote a partir de uma receita em gramas (giz, aquarela, caixa de 7 cores). |
| `Receita`          | Lista de insumos em gramas que compõe um produto (ex.: 400g feldspato + 250g caulim). |
| `Linha`            | Faixa comercial que define a margem (peças: Exclusiva/Padrão/Revenda) ou o multiplicador (produtos: Autoral/Profissional/Essencial). |
| `Custo de referência` | Valores fixos cadastrados usados nos cálculos (custos fixos → custo da hora, insumos, embalagens, taxas, margens). |
| `Dificuldade`      | Nível artístico 1–5 (UI) mapeado para multiplicador interno 1,0–1,8 que ajusta a mão de obra. |
| `Margem`           | Percentual que, subtraído do preço de venda, deixa o custo: `preco = custoComTaxas ÷ (1 − margem)`. |
| `Esmalte (R$)`     | Custo do esmalte da peça informado em **reais** (não em %). |
| `Cálculo`          | Resultado determinístico dos motores `pricingEngine`/`productEngine` a partir do modelo em `modelo-de-precificacao.md`. |
| `Armazenamento`    | Onde os dados vivem: no v1 publicado, o `localStorage` do navegador; no modo local opcional, o SQLite do `server.js`. A UI conversa com o backend (quando houver) pela constante `BACKEND_URL`. |

---

## 3. Componentes

Para cada componente: nome em `código`, metáfora em **negrito**, resumo e contrato resumido.

### 3.1 Núcleo (domínio `precificacao`)

O modelo exato de cálculo vive em `Specs/precificacao/modelo-de-precificacao.md` (extraído das planilhas, validado número a número).

- `pricingEngine` — **calculadora de peças**
  Computa o custo de uma **peça** (argila + esmalte + mão de obra + embalagem + acessórios + risco + taxas) e os preços por linha (Exclusiva/Padrão/Revenda). Programa simples, sem dependências externas.  
  `Entrada: PecinhaPricingInput + CostReference. Saída: PricingResult.`

- `productEngine` — **calculadora de produtos**
  Computa o custo de um **produto** (receita em gramas ÷ unidades + embalagem + montagem + taxas) e os preços por linha (Autoral/Profissional/Essencial).  
  `Entrada: ProductPricingInput + CostReference. Saída: PricingResult.`

- `pricingInputNormalizer` — **tradutor**
  Valida e normaliza entradas do usuário (números, limites, tempo horas+minutos → decimal) antes do cálculo, para peça ou produto.  
  `Entrada: raw do formulário. Saída: PecinhaPricingInput | ProductPricingInput.`

### 3.2 Persistência (domínio `custos`)

- `costReferenceStore` — **gaveta de fichas**
  Lê e grava os custos de referência: custos fixos (→ custo da hora), catálogo de insumos, catálogo de embalagens/acessórios, taxas, fatores de dificuldade, linhas de margem.  
  `Entrada: CostReference | query. Saída: CostReference | lista.`

- `pieceStore` — **caderno de peças**
  Salva, lista, atualiza e apaga **peças** no banco local.  
  `Entrada: Piece | query. Saída: Piece | lista.`

- `productStore` — **caderno de produtos**
  Salva, lista, atualiza e apaga **produtos** (receitas) no banco local.  
  `Entrada: Product | query. Saída: Product | lista.`

> **Nota de implantação (v1):** no modo GitHub Pages não há banco nem `costReferenceStore` remoto — os custos de referência vivem no `localStorage` do navegador (`LS_KEY`), com backup **exportar/importar** na tela de Custos. `pieceStore`/`productStore` (peças e produtos salvos) ainda são em memória no mock e entram no armazenamento persistente numa versão futura. O `server.js` (SQLite) é o modo local opcional com a mesma API.

### 3.3 API (servidor)

- `aliceApi` — **balcão**
  Servidor HTTP que expõe os recursos REST e serve a UI estática. Orquestrador de `pricingEngine`, `costReferenceStore` e `pieceStore`.  
  `Entrada: HTTP requests. Saída: JSON | static files.`

### 3.4 UI (mobile-first)

- `pricingPanel` — **balcão do precificador**
  Tela principal com toggle **Peça / Produto** e seções por categoria (Insumos, Mão de obra, Embalagem/Caixas/Papéis/Etiquetas/Acessórios). Tempo em **horas e minutos**; dificuldade em **1–5**. Mostra custo detalhado + preços por linha.  
  `Entrada: ações de toque + PricingResult. Saída: estados visuais.`

- `costsPanel` — **gaveta visível**
  Tela de cadastro/edição dos custos de referência, dividida em abas: Fixos (→ custo hora), Insumos, Embalagens/Acessórios, Taxas & Margens.  
  `Entrada: Custos. Saída: formulário + persistência.`

- `piecesListPanel` — **caderno aberto**
  Tela que lista peças e produtos salvos, com filtro por tipo, e permite abrir/copiar/editar.  
  `Entrada: lista de itens. Saída: seleção + navegação.`

### 3.5 Infraestrutura

- `storage` — **arquivo local**
  No v1 publicado: `localStorage` do navegador. No modo local opcional: SQLite via `node:sqlite` do Node 22. Fonte de verdade da persistência.  
  `Entrada: comandos do store. Saída: dados persistidos.`

> **Nota de stack (v1):** a `aliceApi` do v1 é implementada em **Node puro** (`node:http` + `node:sqlite`), sem framework — **usada apenas no modo local opcional**. No GitHub Pages o frontend roda sem API: `fetch` só acontece se `BACKEND_URL` estiver preenchido (hoje vazio). As rotas, contratos e o modelo de erros abaixo permanecem idênticos ao que a Eng Spec define — só muda a ferramenta por baixo (ver `AliceStackSpec.md`).

---

## 4. Fluxo

**Linha do fluxo:**

```
celular → aliceApi → pricingEngine|productEngine / costReferenceStore / pieceStore|productStore → storage → resposta (JSON) → UI
```

**Tabela imediata:**

| Componente             | Recebe                          | Faz                                          | Manda para                        |
| ---------------------- | ------------------------------- | -------------------------------------------- | --------------------------------- |
| `pricingPanel`         | toques do usuário               | monta o pedido de cálculo (peça ou produto)  | `aliceApi` (POST /api/pricing)   |
| `aliceApi`             | HTTP POST /api/pricing          | valida e chama o cálculo certo               | `pricingInputNormalizer`          |
| `pricingInputNormalizer` | `raw` do formulário           | valida e normaliza (tempo h:min → decimal)   | `pricingEngine` ou `productEngine` |
| `pricingEngine`        | `PecinhaPricingInput`           | calcula custo e preços por linha de peça     | `aliceApi` (JSON de resposta)     |
| `productEngine`        | `ProductPricingInput`           | calcula custo e preços por linha de produto  | `aliceApi` (JSON de resposta)     |
| `aliceApi`             | resposta do engine              | devolve JSON                                  | `pricingPanel`                    |
| `costsPanel`           | toques do usuário               | lê/escreve custos de referência               | `aliceApi` (GET/PUT /api/costs)  |
| `aliceApi`             | HTTP GET/PUT /api/costs         | delega persistência                           | `costReferenceStore`              |
| `costReferenceStore`   | `CostReference`                 | lê/grava no banco                             | `storage`                         |
| `piecesListPanel`      | toques do usuário               | lista/abre/copia/edita peças e produtos       | `aliceApi` (GET/POST/PUT/DELETE /api/pieces, /api/products) |
| `aliceApi`             | HTTP sobre /api/pieces e /api/products | delega persistência                     | `pieceStore` / `productStore`     |
| `pieceStore`           | `Piece`                         | lê/grava/apaga no banco                       | `storage`                         |
| `productStore`         | `Product`                       | lê/grava/apaga no banco                       | `storage`                         |

Regra: toda seta do diagrama aparece na tabela. Sem atalhos.

---

## 5. Ciclo de vida

**Diagrama de estados:**

```
[iniciado] → [servidor pronto] → [recebendo requisições] → [parado]
```

**Tabela de fases:**

| Estado                     | O que acontece                                    | Se falhar                      |
| -------------------------- | ------------------------------------------------- | ------------------------------ |
| `iniciado`                 | Processo sobe, lê config e abre o banco           | falha explícita, log + exit    |
| `servidor pronto`          | `aliceApi` escutando na porta configurada         | log de erro, tentativa de bind |
| `recebendo requisições`    | Atende GET/POST/PUT/DELETE                        | resposta 500 com mensagem      |
| `parado`                   | Processo encerrado (Ctrl+C / pm2 stop)            | —                              |

Regra: toda transição de estado tem exatamente um gatilho. Não há estados além destes no v1.

---

## 6. API pública

| Nome                     | O que faz                                       | Grupo     | Idempotência                                        |
| ------------------------ | ----------------------------------------------- | --------- | --------------------------------------------------- |
| `GET /api/pricing`       | Calcula preços por margem (query params)        | Nuclear   | Sim — mesmo input → mesmo resultado, sem efeito colateral |
| `POST /api/pricing`      | Calcula a partir do corpo JSON (peça ou produto, campo `tipo`) | Nuclear   | Sim — mesma entrada → mesmo corpo de saída          |
| `GET /api/costs`         | Devolve os custos de referência                 | Nuclear   | Sim — só leitura                                     |
| `PUT /api/costs`         | Substitui os custos de referência               | Opcional  | Sim — gravar o mesmo valor duas vezes = mesmo estado |
| `GET /api/pieces`        | Lista peças salvas (com filtros opcionais)      | Nuclear   | Sim — só leitura                                     |
| `POST /api/pieces`       | Salva uma peça                                  | Nuclear   | Não — cada POST cria um novo registro; usar `PUT /api/pieces/:id` para atualizar |
| `GET /api/pieces/:id`    | Devolve uma peça                                | Nuclear   | Sim — só leitura                                     |
| `PUT /api/pieces/:id`    | Atualiza uma peça existente                     | Nuclear   | Sim — gravar o mesmo estado = mesmo resultado        |
| `DELETE /api/pieces/:id` | Apaga uma peça                                  | Opcional  | Sim — apagar a mesma peça duas vezes = segundo é no-op |
| `GET /api/products`      | Lista produtos salvos (receitas)                | Nuclear   | Sim — só leitura                                     |
| `POST /api/products`     | Salva um produto                                | Nuclear   | Não — cada POST cria um novo registro; usar `PUT /api/products/:id` para atualizar |
| `GET /api/products/:id`  | Devolve um produto                              | Nuclear   | Sim — só leitura                                     |
| `PUT /api/products/:id`  | Atualiza um produto existente                   | Nuclear   | Sim — gravar o mesmo estado = mesmo resultado        |
| `DELETE /api/products/:id` | Apaga um produto                              | Opcional  | Sim — apagar o mesmo produto duas vezes = segundo é no-op |

Todas as rotas respondem JSON. A UI estática é servida na raiz (`/`). Erros seguem o modelo da seção 7.

---

## 7. Modelo de erros

**Tabela:**

| Situação                                      | Comportamento                                                  |
| --------------------------------------------- | -------------------------------------------------------------- |
| Entrada inválida (peso ≤ 0, tempo ≤ 0, % fora de 0–100, dificuldade fora de 1–5) | `400` com mensagem clara em português e campo apontado |
| `pricingEngine` recebe input que não passa na validação | falha explícita (`PricingError`), nunca retorna preço parcial |
| Custo de referência ausente (sem argila/hora cadastrados) | `409` "cadastre os custos de referência" + link no erro |
| Peça inexistente em `GET/PUT/DELETE /api/pieces/:id` | `404` com mensagem                                      |
| Falha no banco (arquivo corrompido, sem permissão) | `500` com mensagem genérica e log no servidor           |
| Rota desconhecida                                | `404`                                                          |

Regra: toda situação de erro listada é rastreável a um componente ou estado do ciclo de vida. Nunca sucesso parcial silencioso.

---

## 8. Decisões e alternativas descartadas

> **Decisão:** O cálculo segue o modelo exato das planilhas (`modelo-de-precificacao.md`): custo de peça = `argila + esmalte(em R$) + embalagem + acessórios + mão de obra + risco + rateio frete`, com preço por linha = `custoComTaxas ÷ (1 − margem)`. Produtos usam receita em gramas ÷ unidades + embalagem + montagem, com preço = `custoComTaxas × multiplicador`.
> **Alternativa descartada:** esmalte como percentual sobre a argila e margem como markup sobre custo (`custo × (1 + margem)`).
> **Motivo:** a planilha usa esmalte em **reais** e margem como **% do preço** (`÷ (1 − m)`); os valores da planilha foram conferidos número a número com esta regra.

> **Decisão:** Dois motores (`pricingEngine` para peças, `productEngine` para produtos) em vez de um único.
> **Alternativa descartada:** um engine genérico único com flag de tipo.
> **Motivo:** as contas diferem em estrutura (peça soma argila+risco; produto divide receita por unidades), e manter cada um com seu contrato deixa o trio ZenSpec→Código→Teste mais direto.

> **Decisão:** `dificuldade` é 1–5 na UI, mapeado para multiplicador interno 1,0/1,2/1,4/1,6/1,8 (como a planilha).
> **Alternativa descartada:** dificuldade já cadastrada como multiplicador direto na tela.
> **Motivo:** a Alice pensa em 1 a 5; o multiplicador fica escondido e vai até 1,8, como nas planilhas.

> **Decisão:** Persistência em SQLite local no servidor da casa.
> **Alternativa descartada:** JSON em arquivo ou banco externo.
> **Motivo:** SQLite é robusto o suficiente para 2 usuárias, não exige serviço extra e sobrevive a quedas de energia melhor que arquivo solto.

> **Decisão:** Servidor HTTP único serve API + UI estática (modo local opcional).
> **Alternativa descartada:** separar frontend estático (CDN/outro servidor) do backend.
> **Motivo:** a casa não tem CDN; um único processo é mais simples de subir no servidor local.

> **Decisão:** No v1 publicado, o armazenamento é o `localStorage` do navegador, com backup exportar/importar em JSON.
> **Alternativa descartada:** manter SQLite no servidor como obrigatório.
> **Motivo:** GitHub Pages é estático e gratuito; os dados de custo ficam no aparelho, e o JSON exportado garante portabilidade (o dia em que houver backend, o mesmo JSON migra).

> **Decisão:** O frontend conversa com o backend por uma costura única (`BACKEND_URL`, vazio hoje) em vez de `fetch` fixo no servidor.
> **Alternativa descartada:** deixar os `fetch("/api/...")` fixos no código.
> **Motivo:** com `BACKEND_URL` vazio o app roda 100% estático; preencher a constante liga um backend futuro sem tocar em mais nada.

---

## 9. Distribuição e uso

- **Formato (v1):** app web estático publicado no **GitHub Pages** (HTTPS, gratuito); acesso pelo navegador em `https://<usuário>.github.io/<repositorio>/`. Dados por aparelho em `localStorage`, com backup exportar/importar.
- **Formato (modo local opcional):** processo Node no servidor da casa (via `pm2`); acesso pelo celular na rede Wi-Fi (`http://<ip-do-servidor>:<porta>`). Nenhuma mudança no frontend — basta preencher `BACKEND_URL`.
- **Jornada mínima:** abrir o link → cadastrar custos de referência → precificar a primeira peça.
- **Pré-requisitos:** para o modo local, Node.js no servidor e porta liberada no firewall; para o GitHub Pages, apenas o repositório público.

---

## 10. Escopo fora

- Multi-tenancy, autenticação por usuário e permissões (v1 usa o mesmo armazenamento por aparelho; auth fica para quando houver backend).  
- Sincronização em nuvem entre aparelhos, backups automáticos externos (a costura `BACKEND_URL` já está pronta; hoje o backup é manual, exportar/importar).  
- Persistência real de peças e produtos salvos (no mock atual ficam em memória).  
- Importação das planilhas atuais (fica no escopo futuro do conceito; os valores de referência do v1 vêm de `modelo-de-precificacao.md`).  
- Custos de queima por peça individual (entram no custo fixo via `custoHoraTotal`).  
- Cálculos de lucro por mês, relatórios e dashboards.
