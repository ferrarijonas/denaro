# Persistir o doc único (`storage`)

ZenSpec de programa. Este programa existe para que **os dados do Denaro (config, salvos e rascunho) sobrevivam entre sessões e aparelhos sem perda quando a escrita de nuvem falha ou chega atrasada** — sem API própria por tela.

Programa genérico e DOM-free em `app/js/storage.js`; a UI (`app/index.html`) monta o doc e aplica o dado restaurado. Usado por `pricingPanel`, `costsPanel`, `fornosPanel` e `piecesListPanel`.

> **Estado atual:** o `storage` era uma camada fina inline no `index.html`; virou programa próprio (DenaroEngSpec §4.4) quando a regra de frescor entrou — para que o rascunho local mais novo nunca seja engolido por um doc de nuvem velho.

Requisitos: `DenaroEngSpec.md` §4.4/§5/§6.

---

## Intenção

Esta feature existe para que **a ceramista** consiga **fechar o app e reabrir com tudo no lugar (incluindo o rascunho do formulário)** sem precisar de **salvar manualmente nem perder dados quando a nuvem falha no último instante**.

---

## Conceito

O `storage` guarda **um doc único** (config + `salvos` + `rascunho`) em duas fontes: Firestore (doc `alice/estado`) e `localStorage`. Todo doc gravado carrega `salvoEm` (timestamp). No carregamento, **vence a fonte mais recente** — se a escrita de nuvem foi perdida (fechamento do app durante o `set` async), o rascunho local mais novo não é engolido pelo doc antigo da nuvem.

Metáfora: é o **arquivo local + nuvem** — a mesma pasta em dois lugares, e quem abre é a versão mais nova.

---

## Lógica

### Fluxo

```
tela → montar doc (UI) → storage.gravar → localStorage (sync) + Firestore (async)
carregar (UI) → storage.carregar → fonte com salvoEm maior → aplicar dados (UI)
```

| Programa | Recebe                          | Faz                                       | Manda para |
| -------- | ------------------------------- | ----------------------------------------- | ---------- |
| `storage` | `{ chave, localStorage, firestore, colecao, docId }` (config) | lê/grava o doc único e escolhe a fonte mais recente | — (persistência) |
| `storage` | `gravar(dados, transformarParaNuvem?)` | `localStorage` síncrono + Firestore async | devolve `true`/`false` (nuvem ok) |
| `storage` | `autosave(fn, ms)`              | debounce + `flush` no `pagehide`           | chama `gravar` |

### Regras

- **Um doc, duas fontes:** `localStorage` (`chave`) + Firestore (`colecao/docId`). Nenhuma outra forma de persistir.
- **Frescor por `salvoEm`:** `carregar()` lê nuvem e local e escolhe: só uma tem dado → essa; as duas têm → a de `salvoEm` maior; `salvoEm` ausente ou empatado → nuvem. Nenhuma → `null`.
- **Nuvem é best-effort:** `gravar()` grava o local primeiro (síncrono — é o que garante o dado); a escrita de nuvem falha em silêncio e devolve `false` (o badge fica com a UI). O dado nunca se perde se o local gravou.
- **DOM-free:** `storage` não lê `document`, `window`, `CONFIG`, `salvos` nem `estado`; recebe o doc pronto e devolve o doc bruto (a UI aplica via `aplicarDados`).
- **Determinismo:** mesma dupla de fontes + mesmos `salvoEm` → mesma escolha.

### Contrato

Entrada:

- `opts`: `{ chave: string, localStorage: Storage, firestore: Firestore | null, colecao: string, docId: string }` (dependências agrupadas no final).
- `gravar(dados: object, transformarParaNuvem?: (doc) => object | Promise<object>)` → grava `{ ...dados, salvoEm: Date.now() }` no local e na nuvem (a transform é aplicada só na variante de nuvem — é onde a UI enxuga/sobe fotos).
- `carregar()` → `Promise<{ dados: object | null, origem: "nuvem" | "local" | null, nuvemOk: boolean }>`.
- `autosave(fn: () => void, ms: number)` → `{ agendar(), flush() }`.

Saída:

- `carregar()` devolve o doc vencedor e de qual fonte veio; `nuvemOk` diz se a leitura da nuvem completou (para o badge da UI).

Erros:

- `storageIndisponivel` → `carregar()` devolve `{ dados: null }`; `gravar()` segue só na memória (a UI não trava).
- Escrita de nuvem falha → `gravar()` devolve `false` e o `storage` não lança.

### Edge cases

- `salvoEm` local > nuvem → vence local (rascunho mais novo não se perde).
- `salvoEm` nuvem > local → vence nuvem (última sessão em outro aparelho).
- Só local, sem nuvem (Firestore não configurado) → vence local.
- Só nuvem, sem local → vence nuvem.
- Nenhuma das duas → `{ dados: null }` (primeira vez; a UI segue com defaults).
- `localStorage` cheio (quota com foto base64) → `gravar()` não lança; a nuvem é tentada (foto já normalizada pela UI).
- `agendar()` chamado de novo antes do timer → o timer reinicia (debounce).

### Critérios de aceitação

- Fechar o app no meio de uma sessão (escrita de nuvem perdida) e reabrir → o rascunho local mais novo é restaurado.
- Mesmas fontes + mesmos `salvoEm` → mesma escolha sempre.
- `storage` não referencia `document`, `window`, `CONFIG`, `salvos` nem `estado`.

---

## Escopo fora

- Auth/permisões por usuário (as regras do Firestore hoje limitam ao doc `alice/estado`).
- Conflitos de edição simultânea em dois aparelhos (sincronização por doc, última escrita vence).
- Migração de schema entre versões (`salvoEm` é a única metadada; sem controle de versão do doc).
- Gerenciamento das fotos no Storage (apagar órfãs) — vive na UI (`normalizarFotosParaNuvem`/`paraNuvem`/`reanexarFotos`).