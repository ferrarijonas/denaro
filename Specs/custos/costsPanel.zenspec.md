# Editar custos de referência (`costsPanel`)

ZenSpec de componente de UI. Este programa existe para que **a ceramista mantenha os custos fixos, insumos, embalagens, taxas e margens atualizados** em um lugar só.

A persistência vai para o `storage` (Firestore doc `alice/estado` + `localStorage`) — não há API própria.

---

## Intenção

Esta feature existe para que **a ceramista** consiga **cadastrar e ajustar os custos usados no precificador** sem precisar de **planilha ou lembrar de atualizar em vários lugares**.

---

## Conceito

O `costsPanel` é a tela de "configuração" do Denaro. Ela edita os **custos fixos** (organizados em categorias como Espaço, Energia, Pessoal), o preço do kg de argila, o catálogo de insumos e embalagens, as taxas, margens e fatores de dificuldade. O que é salvo aqui alimenta o cálculo da calculadora (`pricingPanel`).

Os **custos fixos são mensais** e divididos em **dois blocos**: **Mão de obra** (salário + parâmetros de horas → hora pessoa) e **4 categorias de despesas fixas do ateliê**. O salário vive na Mão de obra (um só lugar). Todos os valores derivados — total gastos, hora pessoa, hora total — são **calculados automaticamente** a partir da soma dos itens, nunca digitados.

Metáfora: é a **gaveta das fichas** — os números de referência do ateliê, guardados, organizados e editáveis.

---

## Lógica

### Fluxo

```
costsPanel  →  (salvar custos)  →  guarda  →  feedback
costsPanel  →  (carregar custos)  →  exibe Mão de obra + categorias
costsPanel  →  (+ adicionar custo)  →  insere item  →  subtotais recalculados
costsPanel  →  (⇄ mover item)  →  desloca entre Mão de obra e categorias
```

| Programa        | Recebe                        | Faz                                  | Manda para            |
| --------------- | ----------------------------- | ------------------------------------ | --------------------- |
| `costsPanel`    | toques da ceramista           | carrega e edita os custos            | `storage`             |
| `costsPanel`    | toque em "+ adicionar custo"  | abre folha de novo item fixo         | — (tela)              |
| `costsPanel`    | toque em "⇄"                  | abre folha para mover item           | — (tela)              |
| `costsPanel`    | toque em "+ nova categoria"   | cria categoria de despesa            | — (tela)              |
| `costsPanel`    | toque em "⋯" da categoria     | renomeia ou exclui a categoria       | — (tela)              |
| `costsPanel`    | resposta do `storage`         | renderiza blocos com valores         | — (tela)              |

### Custos fixos — estrutura (padrão do v1)

**Bloco Mão de obra & pessoal** (salário + impostos sobre o salário + tempo de trabalho):

- Itens: Salário (3.500), Impostos do salário (INSS, IR — 0).
- Parâmetros: horas trabalhadas por dia (8), dias por mês (22) → horas no mês (176).
- **Hora pessoa = só o Salário ÷ horasMes** (`salario ÷ horasMes`). Impostos do salário entram no total gastos (via hora total), mas **não** na hora pessoa.

**Despesas fixas do ateliê** (5 categorias, cada uma como card):

| Categoria                     | Itens pré-cadastrados (das planilhas)                          | Itens sugeridos (valor 0)             |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| `Espaço & contas`             | Água (50), CEMIG / luz (600), Internet (50), Manutenção do espaço (50) | Aluguel, IPTU, Condomínio, Gás |
| `Freelas & terceirizados`     | Freelas / ajudantes (0)                                         | —                                     |
| `Serviços & digital`          | Contador (300), Imposto (600), Site (100)                      | Domínio do site, Hospedagem / provedor, Impulsionamento |
| `Equipamentos & manutenção`   | Empréstimo forno (300), Manutenção forno (100), Ferramentas (10), Fluke (10) | Novos equipamentos |
| `Suprimentos & provisões`     | Café (30), Papel higiênico (5), Papel toalha (30), Detergente (5), Embalagens internas (20), Insumos bolo (20), Cursos (0), Escambo/presentes (200) | Papelaria |

**Bloco Mão de obra & pessoal** — itens sugeridos (valor 0): Plano de saúde, Vale-refeição.

**Regra de merge:** ao carregar dados salvos, itens sugeridos que ainda não existem são **adicionados com valor 0**, sem sobrescrever valores já preenchidos. A ceramista pode remover com ✕ se não usar.

**Freelas & terceirizados são uma despesa fixa**, não entram na hora pessoa. A ceramista pode renomear categorias, remover itens, adicionar novos e **mover itens entre a Mão de obra e as categorias**. Todos os custos fixos são **mensais**.

### Regras

- Se a ceramista toca **"Salvar"** e tudo é válido → guarda e mostra feedback `verde-argila` "Custos salvos".
- Se algum valor é inválido (nome vazio, valor < 0, margem fora de 0–100, fator fora de 0.5–3) → campo marcado em `terracota` com mensagem `12px`; nada é salvo.
- **Subtotal por categoria, total gastos, hora pessoa e hora total são calculados automaticamente** pela soma dos itens — ninguém digita total.
- **Total gastos = Mão de obra & pessoal + soma das 5 categorias**; alimenta a "hora total" (`totalGastos ÷ horasMes`).
- **Hora pessoa = só o item Salário ÷ horasMes**. Impostos do salário (INSS, IR) e freelas **não** entram na hora pessoa — entram no total gastos (hora total).
- **Não existe mais rateio nem faturamento médio na tela**: `custoHoraTotal` já embute os custos fixos por hora; faturamento médio não participa de cálculo.
- **Preço da argila não é cadastrado na aba Fixos**: ele vem do catálogo de **insumos** (item "Argila Comum"), editado na aba Insumos. A aba Fixos não tem campo de argila.
- **Todo item adicionado ou movido é persistido automaticamente** (nuvem: Firestore doc `alice/estado`; cache/offline: `localStorage`). Nada de custo digitado fica só na memória.
- **Mover item**: o item é deslocado entre Mão de obra e categorias preservando nome e valor; subtotais dos dois blocos recalculam na hora.
- **"+ nova categoria"** (em Despesas fixas): cria uma categoria de despesa vazia, que já aparece como card e persiste.
- **"⋯" na categoria**: abre folha para **renomear** ou **excluir** a categoria. Excluir pede confirmação e apaga a categoria com todos os itens. A Mão de obra **não** é excluível nem renomeável via "⋯" (é o bloco fixo).
- A tela abre com os valores **atuais** (do `storage`) preenchidos — nunca vazia.
- Alterações não salvas: botão "Salvar" fica em `argila`; após salvar, vira "Salvos ✓" por 2s.
- Voltar sem salvar: se houve alteração, perguntar "Descartar alterações?" (confirmação nativa simples).
- Remover um item → confirmação nativa "Remover este custo?" antes de apagar.

### Contrato

Entrada (carregamento — do `storage`):

- `maoDeObra`: `{ id, categoria: "Mão de obra & pessoal", itens: [{ nome: string, valor: number }] }`
- `custosFixos`: `[{ id, categoria: string, itens: [{ nome: string, valor: number }] }]` (5 categorias de despesa)
- `parametros`: `{ horasDia: number, diasMes: number }`
- `insumos`: `[{ nome, unidade, preco }]`
- `embalagens`: `[{ nome, categoria, preco }]`
- `taxas`: `{ imposto, marketplace, maquina, taxaPerda }`
- `fatoresDificuldade`: `{ [nivel: 1|2|3|4|5]: number }`
- `margensPeca`: `[{ nome, margem }]`
- `linhasProduto`: `[{ nome, multiplicador }]`

Saída (salvar):

- `costReference`: mesmos campos acima, validados.
- Cada item tem `{ nome, valor }` e pertence à Mão de obra ou a uma categoria identificada por `id`; mover um item = mudar a referência (persistida em seguida).

Erros:

- `CostsValidationError` → campo(s) inválido(s) apontados na tela.
- `CostsSaveError` → falha ao salvar: banner `terracota` "Não foi possível salvar. Tente de novo."
- `CostsLoadError` → falha ao carregar: tela abre com valores padrão + banner de aviso; nada digitado antes é perdido (persistido localmente).

### Edge cases

- Categoria sem itens → subtotal `R$ 0,00`, categoria continua visível (não some).
- Nome de item duplicado na mesma categoria → permitido (ex.: "Internet" na casa e no ateliê).
- Campo de valor vazio → conta como inválido (não como 0).
- Todas as categorias vazias → total gastos `R$ 0,00`; hora total `R$ 0,00` (cálculo continua determinístico).
- Fator de dificuldade fora de faixa razoável (0.5–3) → aviso `tinta-suave` "Valor fora do comum", mas permitido.
- Remover todos os itens da Mão de obra (salário, impostos) → hora pessoa vira `R$ 0,00` (sem erro).
- Mover item para categoria que já tem item com o mesmo nome → permitido (não sobrescreve; cria outro item).
- Excluir a última categoria de despesa → lista de despesas fica vazia, sem erro; total gastos recalculado.
- Criar categoria com nome vazio → folha não confirma (botão sem efeito).
- Renomear categoria para nome igual ao de outra → permitido (id é o que distingue).
- Nova categoria usa `id` único (timestamp) — mover itens para ela funciona normalmente.
- Movendo o único item de uma categoria → a categoria fica vazia e permanece visível.
- Argila sem preço no catálogo de insumos → cálculo de peça falha com orientação para cadastrar o preço da argila nos Insumos.

### Critérios de aceitação

- Toda alteração salva reflete no próximo cálculo do `pricingPanel` (sem reiniciar).
- Nenhum valor é salvo com estado inválido.
- Total gastos e derivados batem com a soma dos itens (verificado contra `modelo-de-precificacao.md`).

---

## Interface

### Layout (mobile-first)

```
┌──────────────────────────────┐
│  ←  Denaro                   │  ← topo com seta de voltar
├──────────────────────────────┤
│  Custos de referência        │
│  [Fixos][Insumos][Embalagens][Taxas]│
│                              │
│  ▼ MÃO DE OBRA & PESSOAL       │
│  ┌───────────────────────────┐ │
│  │ Mão de obra & pessoal     │ │ ← card
│  │ Salário         [3500] R$ │ ⇄ ✕│
│  │ Impostos (INSS,IR)[ 0 ] R$│ ⇄ ✕│
│  │ + adicionar custo         │ │
│  └───────────────────────────┘ │
│  Horas/dia [8] · dias/mês [22] │
│  Hora pessoa (só salário) R$19,89│ ← só o Salário ÷ horas
│                              │
│  ▼ DESPESAS FIXAS DO ATELIÊ  │
│  ┌───────────────────────────┐ │
│  │ Espaço & contas ⋯  R$ 750 │ │ ← ⋯ = renomear/excluir; subtotal no topo
│  │ Água           [ 50 ] R$  │ ⇄ ✕│
│  │ CEMIG (luz)    [600 ] R$  │ ⇄ ✕│
│  │ + adicionar custo         │ │
│  └───────────────────────────┘ │
│  + nova categoria              │ ← cria categoria nova (folha com nome)
│  ┌───────────────────────────┐ │
│  │ Freelas & terceir.  R$ 0  │ │ ← freela é despesa, não hora pessoa
│  │ Freelas/ajudantes [ 0 ]R$ │ ⇄ ✕│
│  │ + adicionar custo         │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ Serviços & digital R$1000 │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ Equipamentos & manut. R$420│ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ Suprimentos & provis. R$310│ │
│  └───────────────────────────┘ │
│                              │
│  TOTAL GASTOS         R$5980 │  ← derivados, automáticos
│  Hora total (c/ fixos) R$33,98│
│                              │
│  [       SALVAR       ]      │  ← primário `button-background`
└──────────────────────────────┘
```

### Hierarquia visual

- Cabeçalhos de seção: `tinta-suave`, 13px, peso 600, uppercase, com `▼` colapsável.
- Subtotal da categoria: alinhado à direita, `tinta`, 14px, peso 600.
- Labels de campo: `tinta-suave`, 13px.
- Valores: `tinta`, 16px, peso 500.
- Bloco "TOTAL GASTOS" e derivados: fundo `cartao`, borda `1px linha`, separados por `linha-sep`.

### Estados visuais

| Estado                 | Visual                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| campo `focus`          | borda `1.5px argila` + halo                                            |
| erro de campo          | borda `1.5px terracota` + mensagem 12px                                |
| botão "+ adicionar custo" | texto `argila`, fundo transparente, peso 600, `13px`, alinhado à esquerda |
| botão "Salvar"         | `argila`, texto `cartao`, 48px, cantos 10px                            |
| feedback "salvo"       | `verde-argila`, 13px, 2s                                               |
| banner de erro salvar  | fundo leve `terracota` (10%), texto `terracota`, 13px                  |
| folha de novo item     | bottom sheet `cartao`, cantos superiores 16px, sombra leve             |

### Interações

- Campos de valor: teclado numérico, `inputmode="decimal"`.
- "+ adicionar custo": abre bottom sheet com `Nome` + `Valor R$` e **sugestões rápidas** — na Mão de obra: Freela/ajudante, INSS, Plano de saúde, Vale-refeição; nas categorias: Aluguel, IPTU, Condomínio, Provedor, Domínio. Tocar numa sugestão preenche o nome. Tocar "Adicionar" insere, **persiste automaticamente** e recalcula ao vivo.
- "+ nova categoria": abre folha com `Nome da categoria`; tocar "Criar" adiciona o card, persiste e recalcula.
- "⋯" na categoria: folha com campo de renomear + botão "Excluir categoria" (confirmação nativa antes de apagar). Toda mudança persiste automaticamente.
- "⇄" (mover item): abre bottom sheet listando a Mão de obra e as outras categorias; tocar em uma delas move o item (nome e valor intactos), persiste e recalcula os dois subtotais.
- Remover item: "✕" → confirmação nativa → remove, persiste e recalcula.
- Cabeçalho de bloco/categoria colapsável (abrir/fechar não altera valores).
- Horas trabalhadas por dia e dias/mês editáveis no bloco Mão de obra; derivados atualizam e persistem ao vivo.
- Teclado numérico em todos os campos monetários/percentuais.
- **Persistência:** toda alteração (adicionar, mover, editar valor, remover, parâmetros) é gravada imediatamente — no Firestore (`alice/estado`), com `localStorage` como cache/offline. O botão "Salvar" confirma e dá o feedback, mas nenhum dado depende dele para não se perder.

### Acessibilidade

- Campos e botões "+" com alvo ≥ 44px.
- Subtotais legíveis em contraste ≥ 4.5:1 sobre `cartao`/`papel`.
- Bottom sheet navegável por teclado (foco no primeiro campo).
