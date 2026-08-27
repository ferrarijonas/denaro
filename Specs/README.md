# Specs — Índice dos programas

Regra do projeto (ver `../DenaroEngSpec.md` §3–4): **o programa tem um único nome** — o mesmo no spec, na função no código e no nome do arquivo. Para reconhecer qualquer programa: o nome do arquivo `.zenspec.md` é exatamente a função que você procura no código.

- Núcleo puro (não toca a tela): `app/js/`
- UI / fiação (lê e escreve a tela): `app/index.html`

## Núcleo puro

| Programa (arquivo = função)                 | O que faz                    | Código                | Modelo/fórmula       |
| ------------------------------------------- | ---------------------------- | --------------------- | -------------------- |
| `calcularCustoPeca.zenspec.md`              | custo + preços da **peça**   | `calcularCustoPeca` (modelo.js) | `precificacao/modelo-de-precificacao.md` |
| `calcularCustoProduto.zenspec.md`           | custo + preços do **produto**| `calcularCustoProduto` (modelo.js) | `precificacao/modelo-de-precificacao.md` |
| `estimarCabem.zenspec.md`                   | "quantas peças cabem"        | `estimarCabem` (modelo.js) | `queima/fornosPanel.zenspec.md` |
| `cubagemDe.zenspec.md`                      | cubagem e tamanho da peça    | `cubagemDe` (modelo.js) | `precificacao/modelo-de-precificacao.md` |
| `desenharForno.zenspec.md`                  | SVG do forno (biscoito/esmalte) | `desenharForno` (desenho.js) | `queima/estimarCabem.zenspec.md` |
| `lerMedidas.zenspec.md`                     | normaliza o formulário       | `lerMedidas` (fronteira) | — |

Dados declarados (sem lógica): `app/js/config.js` → `CONFIG`, `OCUPACAO`, `PACKING`, `RENDER`.

## UI (telas, em `app/index.html`)

| Programa (arquivo)            | Tela                |
| ----------------------------- | ------------------- |
| `precificacao/pricingPanel.zenspec.md` | Precificar |
| `queima/fornosPanel.zenspec.md`        | Fornos   |
| `custos/costsPanel.zenspec.md`         | Custos   |
| `pecas/piecesListPanel.zenspec.md`     | Orçamentos |

## Infra

- Persistência (Firestore doc `alice/estado` + `localStorage`): `app/index.html` — `../DenaroEngSpec.md` §4.4.
- Harness de snapshot (garante que o visual não muda): `../tools/snapshot.js`.

## Como navegar

1. Abriu uma spec? O nome do arquivo é o nome da função — procure essa função no código.
2. Viu uma função? Procure o arquivo com esse nome em `Specs/`.
3. Dúvida de fórmula? `precificacao/modelo-de-precificacao.md` é a fonte da verdade (validada contra as planilhas).