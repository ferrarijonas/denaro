# Denaro Stack Spec

Escolhas técnicas claras, sem ambiguidade. Stack Spec diz **com o quê**; Eng Spec diz **a estrutura**; ZenSpec diz **o comportamento**; código diz **como**.
Este documento segue o template de `ZenStackSpec.md` e é derivado de `DenaroConceptSpec` e `DenaroEngSpec`.

---

## 1. Intenção

> Esta stack existe para que **a ceramista e sua ajudante** consigam **usar o precificador no celular, de qualquer lugar**, sem precisar de **instalar nada, pagar serviço ou manter infraestrutura complicada**.

---

## 2. Restrições

| Restrição                               | Imposta por                     | Consequência                                                                 |
| --------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| Hospedagem estática gratuita            | Decisão de hospedagem (link em qualquer lugar) | UI no GitHub Pages; acesso por URL pública HTTPS, sem servidor.             |
| Acesso pelo celular no navegador        | Conceito (`mobile-first`)       | UI responsiva; PWA leve opcional; sem instalar app nativo.                   |
| Dois usuários no máximo (v1)            | Conceito (`ceramista + ajudante`)   | Sem auth complexa no v1; sem multi-tenant.                                   |
| Ambiente atual: Windows + Node 22 + npm | Máquina do desenvolvedor        | Comandos compatíveis com Windows PowerShell e scripts cross-platform.        |
| Custo zero de infraestrutura externa    | Conceito (grátis)               | GitHub Pages (gratuito) + Firebase Firestore (Spark, gratuito) + `localStorage` (cache). Sem servidor para manter. |

---

## 3. Decisões

| Categoria    | Decisão                                          | Alternativa descartada                    | Motivo                                                              |
| ------------ | ------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------- |
| Linguagem    | `JavaScript` (Node) para ferramentas + HTML/JS da UI | `TypeScript` estrito em todo o stack      | O v1 reusa a UI aprovada como app; a estrutura é pequena e sem framework. |
| Servidor     | Nenhum no v1 (site 100% estático no GitHub Pages) | Fastify, Express, Hono                    | GitHub Pages não executa servidor; o Firestore cobre a persistência.   |
| Persistência | `Firestore` (Spark, grátis) — doc `alice/estado` — com `localStorage` como cache/fallback local | `node:sqlite` no servidor, PostgreSQL, JSON em arquivo, só localStorage | Sincroniza os dados entre os aparelhos da ceramista e da ajudante, continua gratuito (Spark) e roda em site estático. |
| Frontend     | `app/index.html` (UI aprovada) publicada no GitHub Pages, com os programas puros em `app/js/*` | Vite + TS + Tailwind                      | Não reconstruir UI que já foi validada.                                 |
| Validação    | Validação leve no frontend (checagem manual)     | `zod` no stack inteiro                    | Sem servidor próprio; validação fica na camada do navegador.           |
| Build        | Sem build (arquivos diretos)                     | Vite, tsup, tsc                           | UI roda sem etapa de compilação.                                        |
| Testes       | Harness de snapshot (`tools/snapshot.js`, Node) + teste manual no navegador | Vitest/Jest                               | Projeto mínimo; o harness garante que refatorações não mudem a saída.   |
| Qualidade    | Sem linter no v1                                 | ESLint + Prettier                         | Evita configuração; código pequeno e revisado.                          |
| Deploy       | GitHub Pages (workflow Actions publica `app/`) + regras do Firestore via CLI | pm2, Docker                               | Hospedagem estática gratuita, HTTPS automático, sem servidor para manter. |
| Nuvem (dados) | Firebase Firestore via SDK compat no navegador  | Costura `BACKEND_URL` (Apps Script, VPS)  | Firestore resolve a sincronização multi-dispositivo sem servidor próprio; a costura `BACKEND_URL` foi removida. |

---

## 4. Dependências

### 4.1 Prod (runtime — modo GitHub Pages)

| Recurso        | Onde vive                      | Papel                                  |
| -------------- | ------------------------------ | -------------------------------------- |
| GitHub Pages   | Nuvem (hospedagem estática)    | Serve `app/` (HTML/JS/CSS) com HTTPS gratuito. |
| Firestore      | Nuvem (projeto Firebase, plano Spark) | Doc `alice/estado` com custos + histórico de preços; sincroniza entre aparelhos (ceramista + ajudante). |
| `localStorage` | Navegador (celular/desktop)    | Cache local/offline (fonte quando a nuvem falha) + guarda a base64 das fotos. |
| Firebase Storage | Nuvem (mesmo projeto, Spark grátis) | Fotos dos orçamentos em `alice-fotos/` (a nuvem guarda a URL; base64 fica como cache no aparelho). |

### 4.2 Dev/Test/Build

Sem build, sem linter, sem framework no v1. Testes: harness de snapshot (`tools/snapshot.js`) para os programas puros + teste manual via navegador. Ferramentas: `firebase-tools` (CLI) apenas para publicar as regras do Firestore.

---

## 5. Scripts

| Comando            | O que faz                                              |
| ------------------ | ------------------------------------------------------ |
| `npm run firebase:login` | Autentica a CLI Firebase na sua conta Google (uma vez por máquina). |
| `npm run deploy:rules` | Publica `firestore.rules` no projeto (`firebase deploy --only firestore:rules`). |
| `git push`         | Dispara o workflow do GitHub Pages, que publica `app/`. |

---

## 6. Pastas

```text
.
├── package.json       # Scripts: login/deploy do Firestore
├── app/               # UI aprovada (index.html + logo.webp + firebase-config.js + js/) — publicada no GitHub Pages
├── app/js/            # Programas puros do núcleo (config.js, modelo.js, desenho.js)
├── tools/             # Harness de snapshot (garante que refatorações não mudem a saída)
├── firebase.json      # Configuração da CLI Firebase (aponta para firestore.rules)
├── firestore.rules    # Regras de segurança do Firestore (versionadas, publicadas via CLI)
├── .firebaserc        # Aponta o projeto Firebase padrão
├── Specs/             # Spec de módulo + ZenSpecs filhas
├── backup/            # Exports manuais antigos (legado, sem uso) — ignorado no git
└── .github/workflows/ # Workflow que publica app/ no GitHub Pages
```

---

## 7. Escopo fora

| O que não usamos                  | Por quê (uma frase)                                                        |
| --------------------------------- | --------------------------------------------------------------------------- |
| Framework SPA (React/Next/etc.)   | A UI já aprovada roda sem framework; nada a reconstruir.             |
| Framework HTTP (Fastify/Express)  | Sem servidor próprio; o Firestore cobre a persistência no site estático.    |
| Sincronização manual entre aparelhos | Resolvida pelo Firestore (Spark) — sem custo e sem servidor para manter.    |
| Build/TypeScript no v1            | UI roda direto, estática; sem etapa de compilação.                        |
| Autenticação                      | Firestore sem login por enquanto; regras restringem o acesso ao doc `alice/estado`. Auth por usuário fica para o futuro. |

---

## 8. Deploy (GitHub Pages + Firestore)

Hospedagem gratuita, HTTPS automático, sem servidor para manter.

### 8.1 Pré-requisito

Repositório no GitHub. Para o GitHub Pages ser gratuito o repositório é **público** — os dados pessoais **não** vão para o repositório (ficam no Firestore e no `localStorage` de cada aparelho). Também é preciso um **projeto Firebase** (plano Spark, gratuito) com Firestore criado em modo produção.

### 8.2 Fluxo

> **Estado atual (2026-08):** já configurado — projeto Firebase dedicado `denaro-precificador` (nome de exibição **Denaro**), Firestore `(default)` criado em `southamerica-east1` (modo produção, free tier), chaves em `app/firebase-config.js`, `.firebaserc` preenchido e regras de `firestore.rules` publicadas. O passo 4 abaixo só precisa ser refeito quando as regras mudarem.

1. Cria o repositório no GitHub e faz o primeiro push da branch `main`.
2. Cria o projeto no [console Firebase](https://console.firebase.google.com) e registra um app **Web** — copia as chaves para `app/firebase-config.js`.
3. No Firebase Console: **Build → Firestore Database → Criar banco de dados** (modo Produção, região `southamerica-east1`).
4. Preenche o `projectId` em `.firebaserc`, roda `npm run firebase:login` (uma vez) e `npm run deploy:rules` para publicar as regras de `firestore.rules`.
5. O workflow em `.github/workflows/pages.yml` publica o conteúdo de `app/`.
6. Em **Settings → Pages**, seleciona **Source: GitHub Actions** (o workflow cria o deploy).
7. O link fica em `https://<usuário>.github.io/<repositorio>/`.

### 8.3 Regras

- **Nunca commitar dados pessoais:** `data/`, `backup/` e os `.xlsx` de custos estão no `.gitignore` — qualquer coisa com preços reais fica fora do repositório público.
- **Dados na nuvem:** custos e histórico de preços vivem no Firestore (doc `alice/estado`) e sincronizam entre aparelhos; `localStorage` é o cache offline. As regras do Firestore limitam leitura/escrita ao doc `alice/estado`.
- **Fotos:** sobem para o Firebase Storage (`alice-fotos/`, mesmo projeto) e sincronizam entre aparelhos; a base64 continua no aparelho como cache/garantia local. O doc do Firestore fica leve (guardam URLs, nunca base64).
