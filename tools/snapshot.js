/* =====================================================================
 * Denaro — tools/snapshot.js
 * Harness de snapshot (garantia do visual congelado — DenaroEngSpec §3).
 * Carrega os programas puros (app/js/config.js, modelo.js, desenho.js)
 * num contexto Node e gera um snapshot canônico de:
 *   - cubagemDe, estimarCabem (ocupação)
 *   - desenharForno (string SVG do render-duplo)
 * Para cenários fixos. Comparar com `node tools/snapshot.js`:
 *   diff vazio = refatorações não mudaram a saída.
 *
 * Uso:
 *   node tools/snapshot.js            → imprime o snapshot no stdout
 *   node tools/snapshot.js --write    → grava tools/snapshot.baseline.txt
 *   node tools/snapshot.js --check    → compara com o baseline (exit 1 se divergir)
 * ===================================================================== */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const FILES = ["app/js/config.js", "app/js/modelo.js", "app/js/desenho.js"];
const BASELINE = path.join(__dirname, "snapshot.baseline.txt");

/* ---------- cenários fixos ---------- */
const FORNOS = {
  cilindro: { id: "f1", nome: "Meu forno", formato: "cilindrico", diametroCm: 40, alturaCm: 60, larguraCm: 0, profundidadeCm: 0 },
  quadrado: { id: "f2", nome: "Forno quadrado", formato: "quadrada", diametroCm: 0, alturaCm: 50, larguraCm: 30, profundidadeCm: 30 },
};

const MEDIDAS = {
  pratoRedondo: { formato: "redonda", diametro: 25, altura: 5, largura: 0, profundidade: 0, alturaQ: 0 },
  tigela: { formato: "redonda", diametro: 12, altura: 10, largura: 0, profundidade: 0, alturaQ: 0 },
  vaso: { formato: "redonda", diametro: 20, altura: 30, largura: 0, profundidade: 0, alturaQ: 0 },
  caixa: { formato: "quadrada", diametro: 0, altura: 0, largura: 20, profundidade: 20, alturaQ: 10 },
  naoCabe: { formato: "redonda", diametro: 55, altura: 30, largura: 0, profundidade: 0, alturaQ: 0 },
};

/* ---------- monta o contexto (programas puros, sem DOM) ---------- */
function carregarProgramas() {
  const code = FILES.map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n");
  const context = { window: {} };
  context.globalThis = context;
  vm.createContext(context);
  const ex = code + "\n;globalThis.__d = { cubagemDe, estimarCabem, desenharForno };";
  vm.runInContext(ex, context, { filename: "denaro-puros.js" });
  return context.__d;
}

function snapshotDe(p) {
  const out = [];

  out.push("=== cubagemDe (cm3) ===");
  for (const [n, m] of Object.entries(MEDIDAS)) {
    out.push(`${n}: ${p.cubagemDe(m)}`);
  }

  out.push("=== estimarCabem ===");
  for (const [fn, forno] of Object.entries(FORNOS)) {
    for (const [tn, medidas] of Object.entries(MEDIDAS)) {
      for (const tipo of ["biscoito", "esmalte"]) {
        const r = p.estimarCabem(tipo, forno, medidas);
        out.push(`${fn} / ${tn} / ${tipo}: ${JSON.stringify(r)}`);
      }
    }
  }

  out.push("=== desenharForno (SVG) ===");
  for (const [fn, forno] of Object.entries(FORNOS)) {
    for (const [tn, medidas] of Object.entries(MEDIDAS)) {
      const svg = p.desenharForno(medidas, forno);
      out.push(`--- ${fn} / ${tn} ---`);
      out.push(svg);
    }
  }

  return out.join("\n");
}

const mode = process.argv[2] || "";

const p = carregarProgramas();
const snap = snapshotDe(p);

if (mode === "--write") {
  fs.writeFileSync(BASELINE, snap, "utf8");
  console.log("Baseline gravado em", BASELINE);
} else if (mode === "--check") {
  if (!fs.existsSync(BASELINE)) {
    console.error("Sem baseline. Rode primeiro: node tools/snapshot.js --write");
    process.exit(2);
  }
  const prev = fs.readFileSync(BASELINE, "utf8");
  if (prev === snap) {
    console.log("OK — snapshot idêntico ao baseline (nada do visual mudou).");
    process.exit(0);
  }
  const prevLines = prev.split("\n");
  const curLines = snap.split("\n");
  const max = Math.max(prevLines.length, curLines.length);
  let diffs = 0;
  for (let i = 0; i < max; i++) {
    if (prevLines[i] !== curLines[i]) {
      console.log(`linha ${i + 1}:`);
      console.log(`  ANTES: ${prevLines[i]}`);
      console.log(`  AGORA: ${curLines[i]}`);
      diffs++;
      if (diffs > 20) { console.log("  … (diferenças truncadas)"); break; }
    }
  }
  console.error(`DIVERGIU — ${diffs} linha(s) diferentes.`);
  process.exit(1);
} else {
  process.stdout.write(snap + "\n");
}