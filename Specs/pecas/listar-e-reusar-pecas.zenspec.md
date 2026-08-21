# Listar e reusar peças (`piecesListPanel`)

ZenSpec de componente de UI. Este programa existe para que **a Alice reaproveite peças já precificadas** sem recalcular do zero.

Modo UI-first: a casca visual usa **mock provisório** (marcado aqui como provisório). A persistência real vive em `salvar-e-listar-pecas.zenspec.md`.

---

## Intenção

Esta feature existe para que **Alice** consiga **abrir uma peça já precificada e copiá-la ou editá-la** sem precisar de **refazer os cálculos ou procurar em papel**.

---

## Conceito

O `piecesListPanel` é a lista de peças salvas. Cada linha mostra o nome da peça, o preço escolhido e um resumo (peso, dificuldade, data). Tocar numa peça abre a calculadora (`pricingPanel`) preenchida com os dados daquela peça, pronta para recalcilar, copiar ou salvar como nova.

Metáfora: é o **caderno de receitas** — a peça de hoje é a receita da semana passada, um toque para reusar.

---

## Lógica

### Fluxo

```
piecesListPanel  →  (lista peças)  →  renderiza linhas
piecesListPanel  →  (tocar peça)  →  abre pricingPanel preenchido
```

| Programa            | Recebe                     | Faz                                    | Manda para              |
| ------------------- | -------------------------- | -------------------------------------- | ----------------------- |
| `piecesListPanel`   | toques da Alice            | carrega e lista as peças salvas        | API `/api/pieces`       |
| `piecesListPanel`   | seleção de uma peça        | abre `pricingPanel` com os dados       | `pricingPanel`          |

> **Nota (mock provisório):** Na Fase 1, a lista usa peças mock provisórias (marcadas `MOCK`), ex.: "Vaso florido", "Caneca", "Pote pequeno". A integração real com `/api/pieces` ocorre na Fase 3 (T27).

### Regras

- Se a lista está vazia → estado vazio com mensagem "Nenhuma peça ainda. Precifique a primeira." + botão para `pricingPanel`.
- Cada linha mostra: nome, preço escolhido (destaque), e metadados (peso, dificuldade, data) em `tinta-suave`.
- Tocar numa peça → abre `pricingPanel` **preenchido** com os dados da peça (não abre tela separada de detalhe no v1).
- Copiar peça: ao abrir a peça no `pricingPanel`, a Alice pode alterar dados e tocar "Salvar peça" → gera uma **nova** peça (não sobrescreve a original).
- Botão apagar (gesto de deslizar ou "⋯"): pede confirmação "Apagar esta peça?" antes de remover.

### Contrato

Entrada (listagem — da API/mock):

- `pieces`: array de `PieceListItem`:
  - `id`: string
  - `nome`: string
  - `precoEscolhido`: number
  - `margemEscolhida`: number
  - `pesoArgilaKg`: number
  - `dificuldade`: 1 | 2 | 3 | 4 | 5
  - `criadoEm`: ISO datetime

Saída (ação):

- `abrirPiece(id)` → navega para `pricingPanel` com `PieceInput` da peça.

Erros:

- `PiecesLoadError` → banner `terracota` "Não foi possível carregar as peças." + botão "Tentar de novo".

### Edge cases

- Lista vazia → estado vazio com CTA para a calculadora.
- Peça apagada por outro usuário (ajudante) entre carregar e abrir → ao abrir, `pricingPanel` mostra aviso "Peça não encontrada" e lista atualiza.
- Nome em branco na peça → exibido como "Sem nome".

### Critérios de aceitação

- Reusar uma peça leva no máximo 2 toques (abrir peça → salvar como nova).
- Nenhuma ação de apagar acontece sem confirmação.

---

## Interface

### Layout (mobile-first)

```
┌──────────────────────────────┐
│  Alice                (+)    │  ← topo; "+" abre a calculadora nova
├──────────────────────────────┤
│  Minhas peças                │  ← título de tela 20px
│                              │
│  ┌────────────────────────┐  │
│  │ Vaso florido       R$74│  │  ← nome 16px + preço 22px `tinta`
│  │ 0,8kg · dificuldade 3  │  │     metadados 12px `tinta-suave`
│  │ 12/08/2026       ⋯      │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ Caneca            R$49 │  │
│  │ 0,5kg · dificuldade 2  │  │
│  │ 10/08/2026       ⋯      │  │
│  └────────────────────────┘  │
│                              │
│  [estado vazio, se não houver peças] │
└──────────────────────────────┘
```

### Hierarquia visual

- Título da tela: `tinta`, 20px, peso 500 (display).
- Nome da peça: `tinta`, 16px, peso 500.
- Preço escolhido: `tinta`, 22px, peso 600, alinhado à direita.
- Metadados: `tinta-suave`, 12px, peso 400.
- Cartões: `cartao`, borda `1px linha`, canto 10px, `16px` de espaço interno.

### Estados visuais

| Estado                | Visual                                                             |
| --------------------- | ------------------------------------------------------------------ |
| linha em `hover` (desktop) | fundo `papel`, transição 150ms                                |
| linha tocada (`active`) | escala `0.98`                                                    |
| menu "⋯" aberto       | pequeno menu com "Abrir", "Copiar", "Apagar" (`cartao`, sombra leve) |
| confirmação apagar    | diálalog simples nativo: "Apagar esta peça?" [Cancelar] [Apagar `terracota`] |
| estado vazio          | ícone traço fino + texto `tinta-suave` 14px centrado + botão "Precificar primeira peça" (`argila`) |
| erro de carregamento  | banner `terracota` (10%) + "Tentar de novo"                        |

### Interações

- O `+` no topo abre `pricingPanel` vazio (peça nova).
- Tocar no cartão → abre `pricingPanel` preenchido com os dados da peça.
- "⋯" abre menu: "Abrir", "Copiar", "Apagar".
- Rolagem vertical contínua da lista; scroll suave.

### Acessibilidade

- Cartões são elementos clicáveis grandes (≥ 48px de altura).
- Menu "⋯" navegável por teclado; estado focado visível.
- Contraste ≥ 4.5:1 em todos os textos.
