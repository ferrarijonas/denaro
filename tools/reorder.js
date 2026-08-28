/* =====================================================================
 * Denaro — tools/reorder.js
 * Mantém a ordem das specs de Specs/<modulo>/ na ordem de leitura do app
 * (regra DenaroEngSpec §3: prefixo NN- é só ordem, o nome após o prefixo
 * é o programa). Novo arquivo entra na lista ORDEM do seu módulo e roda
 * --fix. Módulo novo → adicione a ORDEM dele aqui.
 *
 * Uso:
 *   node tools/reorder.js --check    → exit 1 se alguma ordem quebrou
 *   node tools/reorder.js --fix      → renomeia/renumera todos os módulos
 * ===================================================================== */
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const SPECS = path.join(__dirname, "..", "Specs");

const MODULOS = {
  precificacao: [
    "spec.md",
    "pricingPanel.md",
    "lerMedidas.md",
    "cubagemDe.md",
    "desenharForno.md",
    "calcularCustoPeca.md",
    "calcularCustoProduto.md",
    "modelo-de-precificacao.md",
  ],
  queima: ["fornosPanel.md", "estimarCabem.md"],
  custos: ["costsPanel.md"],
  pecas: ["piecesListPanel.md"],
  persistencia: ["storage.md"],
};

const modo = process.argv[2];
if (modo !== "--check" && modo !== "--fix") {
  console.error("uso: node tools/reorder.js --check | --fix");
  process.exit(2);
}

const base = (nome) => nome.replace(/^\d+-/, "");
let quebrou = false;

for (const [modulo, ordem] of Object.entries(MODULOS)) {
  const dir = path.join(SPECS, modulo);
  if (!fs.existsSync(dir)) {
    console.error(`MÓDULO SEM PASTA: ${modulo} — a pasta Specs/${modulo} não existe`);
    quebrou = true;
    continue;
  }
  const largura = Math.max(2, String(ordem.length).length);
  const nomesOk = ordem.map((nome, i) => String(i).padStart(largura, "0") + "-" + nome);

  for (const nome of fs.readdirSync(dir)) {
    if (!nome.endsWith(".md")) continue;
    const alvo = nomesOk[ordem.indexOf(base(nome))];
    if (!alvo) {
      console.error(`FORA DA ORDEM [${modulo}]: ${nome} — adicione a posição no ORDEM de reorder.js`);
      quebrou = true;
    } else if (nome !== alvo) {
      if (modo === "--fix") {
        fs.renameSync(path.join(dir, nome), path.join(dir, alvo));
        console.log(`renomeado: ${nome} → ${alvo}`);
      } else {
        console.error(`fora do lugar [${modulo}]: ${nome} → esperado ${alvo}`);
        quebrou = true;
      }
    }
  }
}
if (modo === "--check" && !quebrou) console.log("ordem ok");
if (quebrou) process.exit(1);