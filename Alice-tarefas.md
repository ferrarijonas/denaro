# Alice — ZenTarefas

## Legenda do slice

A Alice abre o celular, escolhe **Peça ou Produto** e preenche as seções: insumos (argila, esmalte em R$, acessórios), mão de obra (tempo em horas/minutos, dificuldade 1–5) e embalagem (caixas, papéis, etiquetas, plástico bolha, frete). O sistema calcula o custo detalhado e mostra o preço em cada linha (Exclusiva/Padrão/Revenda para peças; Autoral/Profissional/Essencial para produtos). Ela escolhe, salva e reaproveita depois. Modelo 1:1 com as planilhas de orçamento.

```
celular → toggle tipo → seções → cálculo → preços por linha → salvar → lista de itens
```

## Último movimento

Adicionei **itens sugeridos (valor 0)** nas categorias de custo fixo (R9): Aluguel, IPTU, Condomínio, Gás no Espaço; Domínio, Hospedagem, Impulsionamento em Serviços; Plano de saúde e Vale-refeição na Mão de obra; Papelaria e Novos equipamentos nas outras. Criei o **merge automático** que adiciona os sugeridos sem apagar valores já preenchidos. Banco limpo para recomeçar com os padrões completos. Próximo: validar no celular.

## Agora (Top 10)

- [>] T9b — Servidor de persistência no ar (R7)  #fase3
  ↳ `server.js` Node puro (`node:http` + `node:sqlite`) — `GET/PUT /api/costs` + static serve `mock/` na porta 8787 — zero dependências
- [ ] T16b — Banco `data/alice.db` criado  #fase3
  ↳ tabela `kv(key TEXT PRIMARY KEY, value TEXT)` criada na 1ª execução; escrita atômica
- [ ] T31b — Mock conectado ao servidor  #fase3
  ↳ `salvarLocalStorage` → também `PUT /api/costs`; `carregarLocalStorage` → `GET /api/costs` com fallback offline
- [ ] T34b — Botão "Exportar backup"  #fase3
  ↳ baixa `alice-backup.json` com todos os custos; funciona offline
- [ ] T35b — Subir com pm2  #fase3
  ↳ `pm2 start server.js --name alice` mantém de pé; teste de reinício

## Agora (Top 10)

- [>] R2 — Validar mock 1:1 com a Alice (seções, tipos, números das planilhas)  #fase1
  ↳ revisar `mock/preview.html` no celular + `modelo-de-precificacao.md` — números devem bater com `Alice_Custos_FUNCIONA`
- [ ] T1 — Calculadora documentada na tela  #fase1
  ↳ ZenSpec do `pricingPanel` — `./specs/pecas/apresentar-calculadora-no-celular.zenspec.md`
- [ ] T2 — Ferramentas da UI no ar  #fase1
  ↳ setup Vite + Tailwind + estrutura — `./src/ui/*`
- [ ] T3 — Casca da calculadora no celular (mock)  #fase1
  ↳ `pricingPanel` com mock provisório marcado `MOCK` — `./src/ui/app/pricing-panel.ts`
- [ ] T4 — Custos documentados na tela  #fase1
  ↳ ZenSpec do `costsPanel` — `./specs/custos/editar-custos-de-referencia.zenspec.md`
- [ ] T5 — Casca dos custos no celular (mock)  #fase1
  ↳ `costsPanel` com mock provisório marcado `MOCK` — `./src/ui/app/costs-panel.ts`
- [ ] T6 — Lista de itens documentada na tela  #fase1
  ↳ ZenSpec do `piecesListPanel` — `./specs/pecas/listar-e-reusar-pecas.zenspec.md`
- [ ] T7 — Casca da lista no celular (mock)  #fase1
  ↳ `piecesListPanel` com mock provisório marcado `MOCK` — `./src/ui/app/pieces-list-panel.ts`
- [ ] T8 — Telas testadas (estados)  #fase1
  ↳ testes de estado das 3 telas — `./tests/unit/ui/*.test.ts`

## Pausado

- [ ] T9 — Ferramentas de base (package.json, TS, ESLint, Prettier, Vitest, Zod)  #bloqueado(fase2)
  ↳ `npm init` + configs em `./src/shared/*` — stack do `AliceStackSpec.md`

## Próximo

- [ ] T10 — Calculadora de peça documentada  #fase2
  ↳ ZenSpec de `pricingEngine` — `./specs/precificacao/calcular-custo-e-precos.zenspec.md`
- [ ] T13 — Calculadora de produto documentada  #fase2
  ↳ ZenSpec de `productEngine` — `./specs/produtos/calcular-custo-de-produto.zenspec.md`
- [ ] T16 — Entradas normalizadas (tempo h:min)  #fase2
  ↳ ZenSpec de `pricingInputNormalizer` — `./specs/precificacao/normalizar-entradas-de-precificacao.zenspec.md`
- [ ] T19 — Banco de dados criado e documentado  #fase3
  ↳ ZenSpec do `storage` (schema SQLite) — `./specs/infrastructure/spec.md`
- [ ] T33 — Telas ligadas ao cálculo real (remover mocks)  #fase3
  ↳ conexão das telas ao `/api/*` e aos engines
