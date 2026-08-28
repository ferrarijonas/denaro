# AGENTS.md — Denaro

## Regras de spec (obrigatórias para editar `Specs/`, `Denaro*.md` ou `ZenSpecKit/`)

- Toda spec segue o formato do ZenSpecKit: `ZenSpecKit/ZenSpec.md` (princípios/formatos) e templates `ZenConceptSpec.md`, `ZenEngSpec.md`, `ZenStackSpec.md`.
- **Spec antes de código.** Mudou comportamento → atualize a spec primeiro, depois o código. Spec é a fonte da verdade (`DenaroEngSpec.md` §3, `ZenSpec.md`).
- **Ordem de arquivos:** prefixo numérico `NN-` em specs de um módulo. A lista de ordem vive no `ORDEM` de `tools/reorder.js`. Arquivo novo → adicione à lista na posição certa e rode `node tools/reorder.js --fix`.
- **Verificação:** antes de terminar qualquer mudança de spec, rode `node tools/reorder.js --check` e `node tools/snapshot.js --check`.

## Cadeia de documentos

`DenaroConceptSpec.md` → `DenaroEngSpec.md` → `DenaroStackSpec.md` → ZenSpecs em `Specs/<modulo>/NN-*.md` → código.

## Proibições

- Não adicionar `#`, `##` nem rodapés fora do formato ZenSpec.
- Não criar pasta/arquivo de spec novo sem registrar a posição no `ORDEM` do `reorder.js`.