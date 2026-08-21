# Alice Stack Spec

Escolhas técnicas claras, sem ambiguidade. Stack Spec diz **com o quê**; Eng Spec diz **a estrutura**; ZenSpec diz **o comportamento**; código diz **como**.
Este documento segue o template de `ZenStackSpec.md` e é derivado de `AliceConceptSpec` e `AliceEngSpec`.

---

## 1. Intenção

> Esta stack existe para que **Alice e sua ajudante** consigam **usar o precificador no celular, de qualquer lugar**, sem precisar de **instalar nada, pagar serviço ou manter infraestrutura complicada**.

---

## 2. Restrições

| Restrição                               | Imposta por                     | Consequência                                                                 |
| --------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| Hospedagem estática gratuita            | Decisão de hospedagem (link em qualquer lugar) | UI no GitHub Pages; acesso por URL pública HTTPS, sem servidor.             |
| Acesso pelo celular no navegador        | Conceito (`mobile-first`)       | UI responsiva; PWA leve opcional; sem instalar app nativo.                   |
| Dois usuários no máximo (v1)            | Conceito (`Alice + ajudante`)   | Sem auth complexa no v1; sem multi-tenant.                                   |
| Ambiente atual: Windows + Node 22 + npm | Máquina do desenvolvedor        | Comandos compatíveis com Windows PowerShell e scripts cross-platform.        |
| Custo zero de infraestrutura externa    | Conceito (grátis)               | GitHub Pages (gratuito) + armazenamento no navegador (`localStorage`); sem banco remoto no v1. |

---

## 3. Decisões

| Categoria    | Decisão                                          | Alternativa descartada                    | Motivo                                                              |
| ------------ | ------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------- |
| Linguagem    | `JavaScript` (Node) para o servidor opcional + HTML/JS da UI | `TypeScript` estrito em todo o stack      | O v1 reusa o mock aprovado como UI; servidor é pequeno e sem framework. |
| Servidor     | `Node.js` puro (`node:http`), sem framework (opcional, para uso local) | Fastify, Express, Hono                    | Persistência mínima (2 rotas); zero dependência instalada.              |
| Persistência | `localStorage` do navegador (fonte de verdade no v1) | `node:sqlite` no servidor, PostgreSQL, JSON em arquivo | GitHub Pages não tem backend; custos sobrevivem no aparelho e o backup exportável garante portabilidade. |
| Frontend     | `mock/index.html` (UI aprovada) publicada no GitHub Pages | Vite + TS + Tailwind                      | Não reconstruir UI que já foi validada.                                 |
| Validação    | Validação leve no frontend (checagem manual)     | `zod` no stack inteiro                    | Sem backend no v1; validação fica na camada do navegador.               |
| Build        | Sem build (arquivos diretos)                     | Vite, tsup, tsc                           | UI roda sem etapa de compilação.                                        |
| Testes       | Teste manual via navegador + cenário de aceitação | Vitest/Jest                               | Projeto mínimo; testes automatizados podem vir em versão futura.        |
| Qualidade    | Sem linter no v1                                 | ESLint + Prettier                         | Evita configuração; código pequeno e revisado.                          |
| Deploy       | GitHub Pages (workflow Actions publica `mock/`)  | pm2, Docker                               | Hospedagem estática gratuita, HTTPS automático, sem servidor para manter. |
| Backend futuro | Costura `BACKEND_URL` no frontend (vazio hoje)   | N/A                                       | Quando houver multi-dispositivo, basta apontar a constante para um backend (Apps Script ou VPS). |

---

## 4. Dependências

### 4.1 Prod (runtime — modo GitHub Pages)

| Recurso        | Onde vive                      | Papel                                  |
| -------------- | ------------------------------ | -------------------------------------- |
| Nenhum serviço | —                              | O v1 publicado é **100% estático** (HTML/JS servido pelo GitHub Pages). |
| `localStorage` | Navegador (celular/desktop)    | Custos de referência, embalagens e padrão de etapas, por aparelho. |
| Backup exportável | Botão "Exportar/Importar backup" na tela Custos | Portabilidade e recuperação; o JSON exportado é a ponte para migrar dados no futuro. |

### 4.2 Modo local (opcional — `server.js`)

O servidor Node continua existindo para uso na rede de casa: `node:http` + `node:sqlite` (tabela `kv`), **sem pacote npm instalado**. Serve a mesma UI do `mock/` e expõe `GET/PUT /api/costs`. Nenhuma mudança no frontend é necessária para trocar de modo — basta preencher `BACKEND_URL`.

### 4.3 Dev/Test/Build

Sem build, sem linter, sem framework no v1. Testes manuais via navegador + cenário de aceitação (seção 8 da Sensei).

---

## 5. Scripts

| Comando            | O que faz                                              |
| ------------------ | ------------------------------------------------------ |
| `npm start`        | Sobe o `server.js` na porta 8787 (modo local opcional). |
| `pm2 start server.js --name alice` | Mantém o processo local de pé (reinício automático). |
| `git push`         | Dispara o workflow do GitHub Pages, que publica `mock/`. |

---

## 6. Pastas

```text
.
├── server.js          # Node puro: API (/api/costs) + serve estático do mock (modo local opcional)
├── package.json       # Mínimo, só com script start
├── mock/              # UI aprovada (index.html + logo.webp) — publicada no GitHub Pages
├── specs/             # Spec de módulo + ZenSpecs filhas
├── data/              # SQLite local (alice.db) — apenas modo local; ignorado no git
├── backup/            # Exports manuais (alice-backup.json) — ignorado no git
└── .github/workflows/ # Workflow que publica mock/ no GitHub Pages
```

---

## 7. Escopo fora

| O que não usamos                  | Por quê (uma frase)                                                        |
| --------------------------------- | --------------------------------------------------------------------------- |
| Framework SPA (React/Next/etc.)   | A UI já aprovada (mock) roda sem framework; nada a reconstruir.             |
| Framework HTTP (Fastify/Express)  | Duas rotas simples não justificam dependência instalada.                    |
| `better-sqlite3`                  | `node:sqlite` já vem no Node 22 — evita compilar módulo nativo no Windows.  |
| Sincronização na nuvem (multi-dispositivo) | Fica para quando houver 2+ aparelhos; a costura `BACKEND_URL` já está pronta. |
| Build/TypeScript no v1            | Servidor e UI rodam direto; sem etapa de compilação.                        |
| Autenticação                      | Página pública estática sem dados no servidor (dados ficam no aparelho); auth entra junto do backend. |

---

## 8. Deploy (GitHub Pages)

Hospedagem gratuita, HTTPS automático, sem servidor para manter.

### 8.1 Pré-requisito

Repositório no GitHub. Para o GitHub Pages ser gratuito o repositório é **público** — os dados de custo não vão para o repositório (ficam no `localStorage` de cada aparelho e no backup JSON que você baixa).

### 8.2 Fluxo

1. Cria o repositório no GitHub e faz o primeiro push da branch `main`.
2. O workflow em `.github/workflows/pages.yml` publica o conteúdo de `mock/`.
3. Em **Settings → Pages**, seleciona **Source: GitHub Actions** (o workflow cria o deploy).
4. O link fica em `https://<usuário>.github.io/<repositorio>/`.

### 8.3 Regras

- **Nunca commitar dados pessoais:** `data/`, `backup/` e os `.xlsx` de custos estão no `.gitignore` — qualquer coisa com preços reais fica fora do repositório público.
- **Dados por aparelho:** sem backend, cada navegador guarda seus próprios custos. Exportar backup antes de trocar de aparelho.
- **Migração futura:** para sincronizar entre aparelhos, preencher `BACKEND_URL` no `mock/index.html` com a URL de um backend (Apps Script ou VPS) que implemente `GET/PUT /api/costs` com CORS habilitado.
