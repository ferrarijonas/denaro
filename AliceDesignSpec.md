# Alice Design Spec

Direção estética do precificador, derivada de `AliceConceptSpec` (mobile-first, simplicidade máxima). Segue a skill `design`: **funcionalidade como estética** — cada elemento existe porque resolve algo.

---

## 1. Direção

**Minimalismo refinado.** Espaço negativo generoso, poucos elementos, cada detalhe deliberado.

Metáfora visual: **uma bancada de ateliê limpa** — argila, papel, luz natural. Sem ruído, sem decoração, só o que a peça precisa.

---

## 2. Cor

Paleta extraída da identidade real do site **alicegussoni.com.br** — marrom-quente, bege e creme. Fundo em off-white quente, nunca branco puro absoluto.

| Papel                     | Hex       | Uso                                            |
| ------------------------- | --------- | ---------------------------------------------- |
| `main-foreground`         | `#664b38` | Texto principal (marrom-quente do site)        |
| `main-background`         | `#FFFFFF` | Fundo de páginas                               |
| `accent-color`            | `#AB9881` | Acento secundário, etiquetas                   |
| `button-background`       | `#5B4432` | Botão primário, destaque do preço escolhido    |
| `button-foreground`       | `#FFFFFF` | Texto sobre botão primário                     |
| `adbar-background`        | `#EEEDBC` | Faixas de aviso/destaque (creme do site)       |
| `adbar-foreground`        | `#333333` | Texto sobre faixas                             |
| `papel` (fundo do app)    | `#F7F4EF` | Off-white quente de fundo do app               |
| `cartao`                  | `#FFFFFF` | Cards/campos sobre o papel                     |
| `linha`                   | `#E8E0D4` | Bordas finas, separadores                      |
| `tinta-suave`             | `#9C8B7C` | Texto secundário, metadados, legendas          |
| `verde-argila` (positivo) | `#5C6B52` | Estados de sucesso                             |
| `terracota` (alerta)      | `#A34A2F` | Erros e alertas                               |

Regras:

- Acento `button-background` (`#5B4432`) para **uma** ação primária por tela. Nunca dois botões disputando atenção.
- Erros em `terracota`, nunca em vermelho puro `#FF0000`.
- Feedback positivo em `verde-argila`, suave, não neon.

## 3. Tipografia

Fonte do site (mantém a identidade da marca):

- **Tudo em Plus Jakarta Sans** (400, 500, 600, 700) — a mesma fonte de `alicegussoni.com.br`. Sem serifa, alta legibilidade em tela pequena.

Hierarquia construída com **peso e opacidade**, não só com tamanho:

- Título de tela: `18px`, peso 600, `tinta`.
- Rótulo de campo: `13px`, peso 600, `tinta-suave`, uppercase.
- Valor/preço principal: `26px`, peso 600, `tinta` (ou `button-background` no preço selecionado).
- Metadados/legendas: `12px`, peso 400, `tinta-suave`.

Números sempre em figura tabular (monoespaçadas) para alinhar colunas de preço.

## 3.1 Marca

- O cabeçalho usa o **logo oficial** de `alicegussoni.com.br` (arquivo local `mock/logo.webp`, altura 44px) seguido do nome da ferramenta.
- A identidade do app deriva da loja: o usuário reconhece que é "da Alice" na mesma hora.

---

## 4. Espaço e layout

- **Celular primeiro.** Largura alvo: 390px. Nada além de 2 colunas; o comum é 1.
- Espaço negativo generoso: campos com `16px` de respiro; blocos de tela com `24px` de separação.
- Formulário em coluna única, um campo por linha, na ordem em que a Alice pensa:
  `peso → esmalte % → dificuldade → tempo`.
- Cards de preço por margem em **linha única horizontal rolável** (a Alice desliza e vê as margens) OU grid de 2 colunas quando houver espaço. A rolagem horizontal evita esticar a tela.
- Toque amigável: alvos ≥ `44px` de altura (polegar).

---

## 5. Profundidade

- Bordas finas (`1px`, `linha`) como separadores; cards com `1px` borda + sombra quase imperceptível (`0 1px 3px rgba(46,42,37,0.06)`).
- Cantos levemente arredondados (`10px`) — o suficiente para acolher, nunca "pill" genérica em tudo.
- Camadas de background: `papel` (fundo) → `cartao` (card) → destaque (borda `button-background` quando ativo).

---

## 6. Estado como linguagem

| Estado     | Comportamento                                                            |
| ---------- | ------------------------------------------------------------------------ |
| `focus`    | Borda `1.5px` `button-background` + leve halo (`rgba(91,68,50,0.12)`). |
| `hover`    | (Desktop) fundo do card em `papel`, transição suave `150ms`.             |
| `active`   | Pressão: escala `0.98` no alvo tocado.                                   |
| `disabled` | Opacidade `0.4`, sem sombra; cursor desabilitado.                        |
| `selecionado` | Card de margem escolhido: borda `button-background`, fundo `cartao`, preço em `button-background`. |
| `erro`     | Borda `1.5px` `terracota` + mensagem em `12px` abaixo do campo.          |

---

## 7. Movimento

- Mínimo e proposital. Transições CSS-only (`150–200ms`).
- Uma entrada coreografada ao abrir: o card de resultado faz `fade + 4px subida` (`opacity 0→1`, `translateY 4→0`).
- Nada de animações decorativas, parallax ou gradientes.

---

## 8. Ícones e detalhes

- Sem ícone emoji como decoração. Ícones usados só quando funcionam (seta de voltar, check de salvo) — traço fino (`1.5px`), cor `tinta-suave`.
- Sem gradientes. Sem sombras dramáticas.
- Sem logotipo rebuscado: o nome "Alice" na tipografia display, cor `tinta`, no topo da tela, basta.

---

## 9. O que nunca fazer

- Gradiente roxo em fundo branco.  
- Card com sombra pesada e borda arredondada genérica.  
- Ícone emoji como decoração.  
- Template de SaaS 2021.  
- Espaçamento inconsistente.  
- Hierarquia construída só com tamanho de fonte.  
- Botão de ação primária em qualquer cor que não seja `button-background`.
