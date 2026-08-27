/* =====================================================================
 * Denaro — modelo.js
 * Programa puro (regra DenaroEngSpec §3): cálculo sem DOM.
 * Não toca document, localStorage nem Firestore. Só dados (config.js)
 * e as funções puras abaixo. Roda também no harness (tools/snapshot.js).
 * ===================================================================== */

/* Cubagem de uma peça a partir das medidas normalizadas (cm). */
function cubagemDe(medidas) {
  if (!medidas) return 0;
  if (medidas.formato === "quadrada") return (medidas.largura || 0) * (medidas.profundidade || 0) * (medidas.alturaQ || 0);
  return Math.PI * Math.pow((medidas.diametro || 0) / 2, 2) * (medidas.altura || 0);
}

/* Empacotamento: círculos em círculo — tabela de packing ótimo (PACKING, config.js). */
function getNCircles(circleRadius, containerRadius) {
  if (!circleRadius || !containerRadius) return 0;
  if (circleRadius > containerRadius) return 0;
  const ratio = circleRadius / containerRadius;
  for (let i = 0; i < RADII.length - 1; i++) {
    if (RADII[i + 1] < ratio) return Math.max(1, i);
  }
  return RADII.length - 1;
}

function circulosEmDisco(r, discR) {
  return getNCircles(r, discR);
}
function circulosEmRetangulo(r, compr, larg) {
  if (r <= 0 || compr <= 0 || larg <= 0) return 0;
  const d = 2 * r;
  if (d > Math.min(compr, larg)) return 0;
  const cols = Math.max(1, Math.floor((compr - 2 * r) / d) + 1);
  let count = 0, y = r;
  const dy = Math.sqrt(3) * r;
  while (y <= larg - r) {
    count += cols;
    y += dy;
    if (y <= larg - r) {
      count += cols;
      y += dy;
    }
  }
  return count;
}
function rectsEmRetangulo(w, h, compr, larg) {
  if (w <= 0 || h <= 0 || compr <= 0 || larg <= 0) return 0;
  const a = Math.floor(compr / w) * Math.floor(larg / h);
  const b = Math.floor(compr / h) * Math.floor(larg / w);
  return Math.max(0, a, b);
}
function rectsEmDisco(w, h, discD) {
  const R = discD / 2;
  if (w <= 0 || h <= 0 || R <= 0) return 0;
  if (Math.hypot(w, h) / 2 > R) return 0; /* cantos da peça fora do círculo => não cabe */
  function grid(ww, hh) {
    const outer = R - hh / 2;
    if (outer <= 0) return 0;
    const nRows = Math.max(1, Math.floor((2 * outer) / hh) + 1);
    let count = 0;
    for (let r = 0; r < nRows; r++) {
      const cy = nRows === 1 ? 0 : (-outer + r * hh);
      const halfChord = Math.sqrt(Math.max(0, R * R - Math.pow(Math.abs(cy) + hh / 2, 2)));
      const n = Math.floor((2 * halfChord) / ww);
      if (n > 0) count += n;
    }
    return count;
  }
  if (typeof window.__pack2D === "function") {
    try {
      const lado = discD / Math.SQRT2;
      const res = window.__pack2D({ bins: [{ width: lado, height: lado }], boxes: Array.from({ length: 200 }, () => ({ width: w, height: h })) });
      const boxes = (res.packedBins && res.packedBins[0] && res.packedBins[0].boxes) || [];
      if (boxes.length) return Math.max(boxes.length, grid(w, h), grid(h, w));
    } catch (e) { /* fallback */ }
  }
  return Math.max(grid(w, h), grid(h, w));
}
function porNivelNoPiso(kilnShape, dims, pecaShape, pW, pH, folgaLat) {
  const w = pW + folgaLat, h = pH + folgaLat;
  const U = OCUPACAO;
  if (kilnShape === "quadrada") {
    const L = (dims.L || 0) * U.usarDiametro, P = (dims.P || 0) * U.usarDiametro;
    if (pecaShape === "quadrada") return rectsEmRetangulo(w, h, L, P);
    return circulosEmRetangulo(Math.max(w, h) / 2, Math.max(L, P), Math.min(L, P));
  }
  const discD = (dims.D || 0) * U.usarDiametro;
  if (pecaShape === "quadrada") return rectsEmDisco(w, h, discD);
  return circulosEmDisco(Math.max(w, h) / 2, discD / 2);
}
function calcNiveis(tipo, alt, pieceAlt, mode) {
  const U = OCUPACAO;
  const usable = alt - U.gapBase - U.gapTopo;
  if (usable <= 0) return 0;
  if (mode === "empilha") return Math.max(0, Math.floor(usable / Math.max(1, pieceAlt)));
  if (mode === "encaixa") {
    const hAdd = Math.max(1, pieceAlt * U.fatorEncaixe);
    return Math.max(0, Math.floor((usable - pieceAlt) / hAdd) + 1);
  }
  const folgaVert = tipo === "esmalte" ? U.folgaVerticalEsmalte : U.folgaVerticalBiscoito;
  const slot = U.prateleiraEsp + pieceAlt + folgaVert;
  return Math.max(0, Math.floor(usable / Math.max(1, slot)));
}
function estimarCabem(tipo, forno, m) {
  const kilnShape = forno && forno.formato === "quadrada" ? "quadrada" : "cilindrico";
  const dims = kilnShape === "quadrada"
    ? { L: (forno && forno.larguraCm) || 0, P: (forno && forno.profundidadeCm) || 0 }
    : { D: (forno && forno.diametroCm) || 0 };
  const alt = (forno && forno.alturaCm) || 0;
  const pecaShape = m.formato === "quadrada" ? "quadrada" : "redonda";
  const pW = pecaShape === "quadrada" ? m.largura : m.diametro;
  const pH = pecaShape === "quadrada" ? m.profundidade : m.diametro;
  const pieceAlt = pecaShape === "quadrada" ? m.alturaQ : m.altura;
  if (!alt || !pW || !pH || !pieceAlt) return null;
  if (kilnShape === "quadrada" && (!dims.L || !dims.P)) return null;
  if (kilnShape === "cilindrico" && !dims.D) return null;
  const U = OCUPACAO;
  const folgaLat = tipo === "esmalte" ? U.folgaLateralEsmalte : U.folgaLateralBiscoito;
  const porNivel = porNivelNoPiso(kilnShape, dims, pecaShape, pW, pH, folgaLat);
  let mode = "prateleira";
  if (tipo === "biscoito") {
    const ratio = (pecaShape === "quadrada" ? Math.max(pW, pH) : pW) / Math.max(1, pieceAlt);
    if (ratio >= U.pecaPlana) mode = "empilha";
    else if (pecaShape === "redonda" && ratio >= U.pecaEncaixe) mode = "encaixa";
  }
  const niveis = calcNiveis(tipo, alt, pieceAlt, mode);
  if (porNivel <= 0 || niveis <= 0) return { total: 0, porNivel, niveis, mode };
  return { total: porNivel * niveis, porNivel, niveis, mode };
}

/* --- Fornos e queima (lê só CONFIG — puro) --- */
function acharForno(id) {
  return CONFIG.fornos.find((x) => x.id === id) || CONFIG.servicosFora.find((x) => x.id === id) || null;
}
function volumeUtil(f) {
  if (f.formato === "quadrada") return (f.larguraCm || 0) * (f.profundidadeCm || 0) * (f.alturaCm || 0) * 0.7;
  return Math.PI * Math.pow((f.diametroCm || 0) / 2, 2) * (f.alturaCm || 0) * 0.7;
}
function custoEnergiaPorTipo(f, tipo) {
  const c = CONFIG.configQueima;
  if (tipo === "biscoito") return (f.potenciaKw || 7.2) * c.horasBisque * c.dutyBisque * c.precoKwh;
  if (tipo === "3fogo") return (f.potenciaKw || 7.2) * 3 * 0.3 * c.precoKwh;
  return (f.potenciaKw || 7.2) * c.horasEsmalte * c.dutyEsmalte * c.precoKwh;
}