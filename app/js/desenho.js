/* =====================================================================
 * Denaro — desenho.js
 * Programa puro (regra DenaroEngSpec §3): gera a string SVG do forno.
 * desenharForno(medidas, forno) → string. Não toca DOM.
 * Depende de estimarCabem/OCUPACAO/RENDER (modelo.js/config.js).
 * ===================================================================== */

function pecaRedonda(x, baseY, w, h, mode) {
  const rx = w / 2, ry = Math.max(1.5, w * 0.09);
  const y = baseY - h - ry;
  if (mode === "copy") {
    return '<g opacity="0.5"><path d="M' + (x - rx) + ' ' + (y + ry) + ' L' + (x - rx) + ' ' + (y + h) + ' a' + rx + ',' + ry + ' 0 0 0 ' + (2 * rx) + ',0 L' + (x + rx) + ' ' + (y + ry) + ' Z" fill="rgba(91,68,50,0.18)"/></g>';
  }
  const P = mode === "main" ? ["rgba(91,68,50,0.92)", "#5b4432", "", 1]
    : ["none", "#ab9881", "3 3", 0.8];
  return '<g opacity="' + P[3] + '">' +
    '<path d="M' + (x - rx) + ' ' + (y + ry) + ' L' + (x - rx) + ' ' + (y + h) + ' a' + rx + ',' + ry + ' 0 0 0 ' + (2 * rx) + ',0 L' + (x + rx) + ' ' + (y + ry) + ' Z" fill="' + P[0] + '" stroke="' + P[1] + '" stroke-width="1.1"' + (P[2] ? ' stroke-dasharray="' + P[2] + '"' : "") + "/>" +
    '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + P[0] + '" stroke="' + P[1] + '" stroke-width="1.1"' + (P[2] ? ' stroke-dasharray="' + P[2] + '"' : "") + "/>" +
    "</g>";
}
function pecaQuadrado(x, baseY, w, h, mode) {
  const t = w * 0.22;
  const y0 = baseY - h;
  if (mode === "copy") {
    return '<g opacity="0.5"><path d="M' + (x - w / 2) + ' ' + y0 + ' L' + (x - w / 2) + ' ' + (baseY) + ' L' + (x + w / 2) + ' ' + (baseY) + ' L' + (x + w / 2) + ' ' + y0 + ' Z" fill="rgba(91,68,50,0.18)"/></g>';
  }
  const P = mode === "main" ? ["rgba(91,68,50,0.92)", "#5b4432", "", 1]
    : ["none", "#ab9881", "3 3", 0.8];
  const lado = "rgba(91,68,50," + (mode === "main" ? "0.55" : mode === "copy" ? "0.14" : "0.12") + ")";
  const front = "M" + (x - w / 2) + " " + y0 + " L" + (x - w / 2) + " " + (baseY) + " L" + (x + w / 2) + " " + (baseY) + " L" + (x + w / 2) + " " + y0 + " Z";
  const top = "M" + (x - w / 2) + " " + y0 + " L" + (x - w / 2 + t) + " " + (y0 - t * 0.5) + " L" + (x + w / 2 + t) + " " + (y0 - t * 0.5) + " L" + (x + w / 2) + " " + y0 + " Z";
  const side = "M" + (x + w / 2) + " " + y0 + " L" + (x + w / 2 + t) + " " + (y0 - t * 0.5) + " L" + (x + w / 2 + t) + " " + (baseY) + " L" + (x + w / 2) + " " + (baseY) + " Z";
  return '<g opacity="' + P[3] + '">' +
    '<path d="' + front + '" fill="' + P[0] + '" stroke="' + P[1] + '" stroke-width="1.1"' + (P[2] ? ' stroke-dasharray="' + P[2] + '"' : "") + "/>" +
    '<path d="' + top + '" fill="' + P[0] + '" stroke="' + P[1] + '" stroke-width="1.1"' + (P[2] ? ' stroke-dasharray="' + P[2] + '"' : "") + "/>" +
    '<path d="' + side + '" fill="' + lado + '" stroke="' + P[1] + '" stroke-width="1.1"' + (P[2] ? ' stroke-dasharray="' + P[2] + '"' : "") + "/>" +
    "</g>";
}

/* Gera a string SVG do render-duplo (biscoito/esmalte) para um forno.
   `medidas` = objeto do tamanho da peça; `forno` = objeto do forno resolvido. */
function desenharForno(medidas, forno) {
  const m = medidas;
  const fornoDiam = forno && forno.formato === "quadrada"
    ? (Math.max(forno.larguraCm || 0, forno.profundidadeCm || 0) || 40)
    : ((forno && forno.diametroCm) || 40);
  const fornoAlt = (forno && forno.alturaCm) || 60;
  const VB = RENDER.viewBox;
  const R = RENDER;

  function umRender(tipo, W, H, topoY, chaoY) {
    const cx = W / 2, rx = W / 2 - R.raioMargem;
    const ryLid = rx * R.ryLidFator;
    const bodyTop = topoY + ryLid;
    const interiorTop = bodyTop + R.interiorTopOffset;
    const interiorH = chaoY - interiorTop;
    const usableW = (rx - R.paredeMargem) * 2;
    const usableH = interiorH - R.interiorFolga;
    const propPW = Math.max(R.minPW, (((m.formato === "quadrada" ? Math.max(m.largura, m.profundidade) : m.diametro) || 1) / Math.max(1, fornoDiam)) * usableW);
    const propPH = Math.max(R.minPH, (((m.formato === "quadrada" ? m.alturaQ : m.altura) || 1) / Math.max(1, fornoAlt)) * usableH);
    const est = estimarCabem(tipo, forno, m);
    const draw = (m.formato === "quadrada" ? pecaQuadrado : pecaRedonda);
    let s = '<svg viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">';
    if (forno && forno.formato === "quadrada") {
      s += '<path d="M' + (cx - rx) + ' ' + topoY + ' L' + (cx - rx + 8) + ' ' + (topoY - 5) + ' L' + (cx + rx + 8) + ' ' + (topoY - 5) + ' L' + (cx + rx) + ' ' + topoY + ' Z" fill="rgba(171,152,129,0.22)" stroke="#ab9881" stroke-width="1.4"/>';
      s += '<rect x="' + (cx - rx) + '" y="' + bodyTop + '" width="' + (2 * rx) + '" height="' + (chaoY - bodyTop) + '" rx="3" fill="rgba(247,244,239,0.96)" stroke="#ab9881" stroke-width="1.4"/>';
    } else {
      s += '<ellipse cx="' + cx + '" cy="' + topoY + '" rx="' + rx + '" ry="' + ryLid + '" fill="rgba(247,244,239,0.96)" stroke="#ab9881" stroke-width="1.4"/>';
      s += '<path d="M' + (cx - rx) + ' ' + bodyTop + ' L' + (cx - rx) + ' ' + chaoY + ' a' + rx + ',' + ryLid + ' 0 0 0 ' + (2 * rx) + ',0 L' + (cx + rx) + ' ' + bodyTop + '" fill="rgba(247,244,239,0.96)" stroke="#ab9881" stroke-width="1.4"/>';
    }
    s += '<line x1="' + (cx - rx) + '" y1="' + chaoY + '" x2="' + (cx + rx) + '" y2="' + chaoY + '" stroke="#ab9881" stroke-width="1.2" opacity="0.6"/>';
    if (est && est.total > 0) {
      const nCol = Math.max(1, Math.min(est.porNivel || 1, R.capColsNiveis));
      const nLvl = Math.max(1, Math.min(est.niveis || 1, R.capColsNiveis));
      const slotY = interiorH / nLvl;
      const colW = Math.min(propPW, (usableW - R.colEspaco) / nCol);
      const halfW = colW / 2 + (m.formato === "quadrada" ? colW * R.isoPecaLado : 0);
      const topE = (m.formato === "quadrada" ? colW * R.isoTopo : 0);
      const maxOff = Math.max(0, rx - halfW - R.margemLateral);
      if (tipo === "biscoito") {
        const encaixaDenso = est.mode === "empilha" || est.mode === "encaixa";
        const layerH = encaixaDenso ? Math.max(R.layerDensoMin, slotY - R.layerDensoFolga) : Math.min(propPH, Math.max(R.layerNormalMin, slotY - R.layerNormalFolga));
        const centro = Math.floor(nCol / 2);
        for (let c = 0; c < nCol; c++) {
          const f = nCol === 1 ? 0 : (c / (nCol - 1) - 0.5) * 2;
          const x = cx + f * maxOff * R.offsetCol;
          const maxL = nCol >= 3 ? (c === centro ? nLvl : Math.max(1, nLvl - 1)) : (c === 0 ? nLvl : Math.max(1, nLvl - 1));
          for (let r = 0; r < maxL; r++) {
            const yBase = chaoY - R.yBaseFolga - r * slotY;
            if (yBase - layerH - topE < interiorTop) break;
            const main = (c === centro && r === 0);
            s += draw(x, yBase, colW, layerH, main ? "main" : "copy");
          }
        }
      } else {
        const porV = Math.max(1, Math.min(est.porNivel || 1, R.capColsNiveis));
        const pecaH = Math.min(propPH, Math.max(R.pecaEsmalteMin, slotY * R.pecaEsmalteFator));
        for (let i = 0; i < nLvl; i++) {
          const yBase = chaoY - R.yBaseFolga - i * slotY;
          if (yBase - pecaH - topE < interiorTop) break;
          s += '<line x1="' + (cx - rx) + '" y1="' + yBase + '" x2="' + (cx + rx) + '" y2="' + yBase + '" stroke="#ab9881" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>';
          for (let k = 0; k < porV; k++) {
            const f = porV === 1 ? 0 : (k / (porV - 1) - 0.5) * 2;
            const x = cx + f * maxOff * R.offsetCol;
            const main = (i === Math.floor(nLvl / 2) && k === Math.floor(porV / 2));
            s += draw(x, yBase, colW * R.colEsmalteFator, pecaH, main ? "main" : "copy");
          }
        }
      }
    }
    s += "</svg>";
    const rotulo = tipo === "biscoito" ? "Biscoito" : "Esmalte";
    let leg = "—";
    if (est) {
      if (est.total <= 0) {
        leg = "<b>não cabe</b><span class=\"render-det\">peça maior que o forno</span>";
      } else {
        const num = est.total > 12 ? "12+" : est.total;
        const detalhe = tipo === "esmalte"
          ? est.porNivel + " por prateleira × " + est.niveis + " prateleiras"
          : est.mode === "empilha" ? "empilhado em coluna"
            : est.mode === "encaixa" ? "tigelas encaixadas"
              : est.porNivel + " por prateleira × " + est.niveis + " níveis";
        leg = "~<b>" + num + "</b> no forno<span class=\"render-det\">" + detalhe + "</span>";
      }
    }
    return '<div class="render-item"><div class="render-item-rotulo">' + rotulo + "</div>" + s + '<div class="render-legenda">' + leg + "</div></div>";
  }

  return '<div class="render-duplo">' + umRender("biscoito", VB.W, VB.H, VB.topoY, VB.chaoY) + umRender("esmalte", VB.W, VB.H, VB.topoY, VB.chaoY) + "</div>";
}