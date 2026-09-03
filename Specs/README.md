# Specs — Índice dos programas

Regra do projeto (ver `../DenaroEngSpec.md` §3–4): **o programa tem um único nome** — o mesmo no spec, na função no código e no nome do arquivo. Para reconhecer qualquer programa: o nome do arquivo `.md` (descontado o prefixo numérico `NN-`, que é só ordem de leitura) é exatamente a função que você procura no código.

- Ordem das specs de um módulo: prefixo numérico sequencial (`00-`, `01-`, …), mantido por `ZenSpecKit/reorder.js --check` / `--fix` (a ordem vive em `Specs/.ordem.json`).
- Núcleo puro (não toca a tela): `app/js/`
- UI / fiação (lê e escreve a tela): `app/index.html`

## Núcleo puro

| Programa (arquivo = função)                 | O que faz                    | Código                | Modelo/fórmula       |
| ------------------------------------------- | ---------------------------- | --------------------- | -------------------- |
| `precificacao/05-calcularCustoPeca.md` | custo + preços da **peça**   | `calcularCustoPeca` (modelo.js) | `precificacao/07-modelo-de-precificacao.md` |
| `precificacao/06-calcularCustoProduto.md` | custo + preços do **produto**| `calcularCustoProduto` (modelo.js) | `precificacao/07-modelo-de-precificacao.md` |
| `queima/01-estimarCabem.md`                   | "quantas peças cabem"        | `estimarCabem` (modelo.js) | `queima/00-fornosPanel.md` |
| `precificacao/03-cubagemDe.md`      | cubagem e tamanho da peça    | `cubagemDe` (modelo.js) | `precificacao/07-modelo-de-precificacao.md` |
| `precificacao/04-desenharForno.md`  | SVG do forno (biscoito/esmalte) | `desenharForno` (desenho.js) | `queima/01-estimarCabem.md` |
| `precificacao/02-lerMedidas.md`     | normaliza o formulário       | `lerMedidas` (fronteira) | — |

Dados declarados (sem lógica): `app/js/config.js` → `CONFIG`, `OCUPACAO`, `PACKING`, `RENDER`.

## UI (telas, em `app/index.html`)

| Programa (arquivo)            | Tela                |
| ----------------------------- | ------------------- |
| `precificacao/01-pricingPanel.md` | Precificar |
| `queima/00-fornosPanel.md`        | Fornos   |
| `custos/00-costsPanel.md`         | Custos   |
| `pecas/00-piecesListPanel.md`     | Orçamentos |

## Infra

- Persistência (Firestore doc `alice/estado` + `localStorage`): `app/index.html` — `../DenaroEngSpec.md` §4.4.
- Harness de snapshot (garante que o visual não muda): `../tools/snapshot.js`.

## Como navegar

1. Abriu uma spec? O nome do arquivo é o nome da função — procure essa função no código.
2. Viu uma função? Procure o arquivo com esse nome em `Specs/`.
3. Dúvida de fórmula? `precificacao/07-modelo-de-precificacao.md` é a fonte da verdade (validada contra as planilhas).