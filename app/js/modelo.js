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

/* Escala LINEAR das medidas por um fator (ex.: retração). Aplica em cada dimensão. */
function escalaLinear(medidas, fator) {
  if (!medidas || fator === 1) return medidas;
  const r = (v) => (v || 0) * fator;
  return {
    formato: medidas.formato,
    diametro: r(medidas.diametro), altura: r(medidas.altura),
    largura: r(medidas.largura), profundidade: r(medidas.profundidade), alturaQ: r(medidas.alturaQ),
  };
}

/* Footprint da peça POR PERNA — fonte única (cálculo + render nunca divergem).
   Biscoito usa a peça crua; as demais queimas usam a peça encolhida (× 1−retracao). */
function medidasDaPerna(tipo, medidas, retracao) {
  if (tipo === "biscoito") return medidas;
  const s = retracao == null ? CONFIG.retracaoPadrao : retracao;
  return escalaLinear(medidas, 1 - s);
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
/* Níveis verticais por PERNA.
   Esmalte (peça já biscoitada): prateleiras reais (espessura + folga vertical 8cm).
   Biscoito: o que empilha/encaixa vai em coluna direta até o teto (sem
   prateleira); o que não empilha ganha níveis em prateleiras SIMPLES — só a
   espessura da prateleira, sem a folga de segurança do esmalte. */
function calcNiveis(tipo, alt, pieceAlt, mode) {
  const U = OCUPACAO;
  const usable = alt - U.gapBase - U.gapTopo;
  if (usable <= 0) return 0;
  if (tipo !== "biscoito") {
    const slot = U.prateleiraEsp + Math.max(1, pieceAlt) + U.folgaVerticalEsmalte;
    return Math.max(0, Math.floor(usable / Math.max(1, slot)));
  }
  if (mode === "empilha") return Math.max(0, Math.floor(usable / Math.max(1, pieceAlt)));
  if (mode === "encaixa") {
    const hAdd = Math.max(1, pieceAlt * U.fatorEncaixe);
    return Math.max(0, Math.floor((usable - pieceAlt) / hAdd) + 1);
  }
  /* solto: não empilha nem encaixa → prateleira simples entre níveis */
  const slot = U.prateleiraEsp + Math.max(1, pieceAlt);
  return Math.max(0, Math.floor(usable / Math.max(1, slot)));
}
/* Ocupação por PERNA de queima — porta única de "quantas cabem".
   `tipo` "biscoito" → peça crua em pilha solta; demais (esmalte/baixa/alta/3fogo)
   → peça encolhida (× 1−retracao) em prateleiras com folga mínima.
   `m` = medidas CRUAS; `retracao` opcional (default CONFIG.retracaoPadrao). */
function estimarCabem(tipo, forno, m, retracao) {
  const kilnShape = forno && forno.formato === "quadrada" ? "quadrada" : "cilindrico";
  const dims = kilnShape === "quadrada"
    ? { L: (forno && forno.larguraCm) || 0, P: (forno && forno.profundidadeCm) || 0 }
    : { D: (forno && forno.diametroCm) || 0 };
  const alt = (forno && forno.alturaCm) || 0;
  const pecaShape = m.formato === "quadrada" ? "quadrada" : "redonda";
  const leg = medidasDaPerna(tipo, m, retracao);
  const pW = pecaShape === "quadrada" ? leg.largura : leg.diametro;
  const pH = pecaShape === "quadrada" ? leg.profundidade : leg.diametro;
  const pieceAlt = pecaShape === "quadrada" ? leg.alturaQ : leg.altura;
  if (!alt || !pW || !pH || !pieceAlt) return null;
  if (kilnShape === "quadrada" && (!dims.L || !dims.P)) return null;
  if (kilnShape === "cilindrico" && !dims.D) return null;
  const U = OCUPACAO;
  const esmalte = tipo !== "biscoito";
  const folgaLat = esmalte ? U.folgaPecaPecaEsmalte : U.folgaLateralBiscoito;
  let porNivel = porNivelNoPiso(kilnShape, dims, pecaShape, pW, pH, folgaLat);
  let mode = "prateleira";
  if (!esmalte) {
    const ratio = (pecaShape === "quadrada" ? Math.max(pW, pH) : pW) / Math.max(1, pieceAlt);
    if (ratio >= U.pecaPlana) mode = "empilha";
    else if (pecaShape === "redonda" && ratio >= U.pecaEncaixe) mode = "encaixa";
    else mode = "solto";
    /* Peça plana larga que não cabe DEITADA no piso mas cabe em altura: em pé,
       apoiada na borda (contagem ~1 — peça no limite da câmara; sem espessura,
       sem falsa precisão). ponytail: fixo ~1 por carga; upgrade: packing por
       inclinação/espessura só se esse caso virar frequente no ateliê. */
    if (porNivel <= 0 && mode === "empilha") {
      const maior = pecaShape === "quadrada" ? Math.max(pW, pH) : pW;
      const usableAlt = alt - U.gapBase - U.gapTopo;
      if (maior > 0 && maior <= usableAlt) { porNivel = 1; mode = "em_pe"; }
    }
  }
  const niveis = mode === "em_pe" ? 1 : calcNiveis(tipo, alt, pieceAlt, mode);
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

/* =====================================================================
 * Motores de precificação (pricingEngine / productEngine) — puros.
 * Recebem `inputs` já resolvidos pelo pricingPanel (catálogo, taxas,
 * queima e frete são resolvidos na fronteira; ver zenspecs). Não tocam DOM.
 * ===================================================================== */

/* pricingEngine — calcula o custo de uma PEÇA e os preços por linha. */
function calcularCustoPeca(inputs, config) {
  const peso = inputs.peso;
  const esmalte = inputs.esmalteReais;
  const frete = inputs.frete;

  const custoArgila = peso * inputs.argilaPreco;
  const custoMaterial = custoArgila + esmalte;
  const custoAcessorios = inputs.acessorios.reduce((s, i) => s + i.qtd * i.preco, 0);
  const custoEmbalagem = inputs.embalagem.reduce((s, i) => s + i.qtd * i.preco, 0);
  const tempoTotalH = inputs.etapas.reduce((s, e) => s + e.tempoH, 0);
  const maoPessoa = inputs.etapas.reduce((s, e) => s + e.tempoH * e.horaNivel, 0);
  const maoDeObra = maoPessoa + tempoTotalH * inputs.horaAtelie;
  const queima = inputs.queima;
  const risco = inputs.taxaPerda * (custoMaterial + maoDeObra + queima);
  const freteEmbutido = inputs.fretePagante === "atele";
  const freteNaConta = freteEmbutido ? frete : 0;
  const custoTotal = custoMaterial + custoAcessorios + custoEmbalagem + maoDeObra + queima + risco + freteNaConta;
  const taxas = inputs.imposto + inputs.canalPct;
  const custoComTaxas = custoTotal / (1 - taxas);
  const linhas = (config.margensPeca || []).map((l) => ({
    nome: l.nome, margem: l.margem, sub: l.sub,
    preco: custoComTaxas / (1 - l.margem),
  }));
  return {
    custoArgila, esmalte, custoAcessorios, custoEmbalagem, maoDeObra, queima,
    risco, frete, freteEmbutido, freteNaConta, custoTotal, taxas, custoComTaxas, linhas,
  };
}

/* productEngine — calcula o custo de um PRODUTO (lote) e os preços por linha. */
function calcularCustoProduto(inputs, config) {
  const un = inputs.unidades;
  const montagemH = inputs.tempoMontagemHoras;
  const custoReceita = inputs.receita.reduce((s, r) => s + (r.gramas / 1000) * r.precoKg, 0);
  const porUnidade = custoReceita / un;
  const custoEmbalagem = inputs.embalagem.reduce((s, i) => s + i.qtd * i.preco, 0);
  const montagem = montagemH * (inputs.montagemHoraNivel || 0);
  const risco = inputs.taxaPerda * (porUnidade + montagem);
  const custoTotal = porUnidade + custoEmbalagem + montagem + risco;
  const taxas = inputs.imposto + inputs.canalPct;
  const custoComTaxas = custoTotal / (1 - taxas);
  const linhas = (config.linhasProduto || []).map((l) => ({
    nome: l.nome, mult: l.mult, sub: l.sub,
    preco: custoComTaxas * l.mult,
  }));
  return {
    custoReceita, porUnidade, custoEmbalagem, montagem, risco,
    custoTotal, taxas, custoComTaxas, linhas, un,
  };
}