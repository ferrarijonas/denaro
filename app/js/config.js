/* =====================================================================
 * Denaro — config.js
 * Programa puro (regra DenaroEngSpec §3): apenas DADOS declarados.
 * Nenhuma função aqui toca DOM, localStorage ou Firestore.
 * Carregado antes de modelo.js e desenho.js (e do script de UI).
 * ===================================================================== */

/* Catálogos (valores reais das planilhas) */
const ARGILAS = [
  { nome: "Argila Comum", preco: 7.00, fornecedor: "Terra Nova" },
  { nome: "Argila São Simão em Pó", preco: 13.00, fornecedor: "São Simão" },
  { nome: "Argila São Simão (terranova)", preco: 13.00, fornecedor: "São Simão" },
];

/* Matérias-primas organizadas por seção — fonte única que alimentará
   a aba "Matérias-primas" (argilas, minerais, acessórios, embalagens…).
   Os acessórios da peça carregam desta seção "ACESSÓRIOS". */
const MATERIAS_PRIMAS = {
  "ARGILAS": ARGILAS,
  "MINERAIS": [
    { nome: "Feldspato Potássico", preco: 5.30 },
    { nome: "Caulim Branco", preco: 5.50 },
    { nome: "Quartzo", preco: 5.30 },
    { nome: "Bentonita", preco: 25.00 },
  ],
  "ACESSÓRIOS": [
    { nome: "Fio (acessório)", preco: 1.00 },
    { nome: "Cabo com plugue", preco: 12.00 },
    { nome: "Soquete / bocal", preco: 15.00 },
    { nome: "Lâmpada LED", preco: 10.00 },
    { nome: "Interruptor", preco: 8.00 },
    { nome: "Fonte 12V", preco: 25.00 },
    { nome: "Motor (acessório)", preco: 5.00 },
    { nome: "Parafusos / porcas (kit)", preco: 2.00 },
  ],
  "EMBALAGEM": [
    { nome: "Papel entre peças (10x10)", preco: 2.00, cat: "Proteção da peça" },
    { nome: "Papel seda", preco: 1.50, cat: "Proteção da peça" },
    { nome: "Plástico bolha", preco: 2.00, cat: "Proteção da peça" },
    { nome: "Feltro padrão camurça", preco: 30.00, cat: "Decorativa (padrão do ateliê)" },
    { nome: "Cordas / laços", preco: 1.00, cat: "Decorativa (padrão do ateliê)" },
    { nome: "Caixa para 4 pratos", preco: 12.00, cat: "Caixa & transporte (correios)" },
    { nome: "Caixa individual por peça", preco: 5.00, cat: "Caixa & transporte (correios)" },
    { nome: "Caixa envio 16X11X10", preco: 4.00, cat: "Caixa & transporte (correios)" },
    { nome: "Enchimento (papel picado)", preco: 1.00, cat: "Caixa & transporte (correios)" },
    { nome: "Etiqueta de correio", preco: 1.00, cat: "Itens fixos (etiquetas)" },
    { nome: "Etiqueta térmica 100X150", preco: 1.00, cat: "Itens fixos (etiquetas)" },
    { nome: "Etiqueta adesiva 50X140", preco: 1.00, cat: "Itens fixos (etiquetas)" },
  ],
};
const CATALOGO_ACESSORIOS = MATERIAS_PRIMAS["ACESSÓRIOS"] || [];

const CATALOGO_INSUMOS = [
  { nome: "Argila Comum", preco: 7.00 },
  { nome: "Argila São Simão em Pó", preco: 13.00 },
  { nome: "Feldspato Potássico", preco: 5.30 },
  { nome: "Caulim Branco", preco: 5.50 },
  { nome: "Calcita Cinza", preco: 5.30 },
  { nome: "Quartzo", preco: 5.30 },
  { nome: "Frita 3134", preco: 55.00 },
  { nome: "Zirconita", preco: 100.00 },
  { nome: "Bentonita", preco: 25.00 },
  { nome: "ox Cobalto", preco: 900.00 },
  { nome: "ox Ferro Vermelho", preco: 50.00 },
  { nome: "Pigmento vermelho", preco: 360.00 },
  { nome: "Pigmento azul", preco: 120.00 },
  { nome: "Pigmento preto", preco: 110.00 },
  { nome: "Polietilenoglicol", preco: 145.00 },
  { nome: "Glicerina bidestilada", preco: 33.00 },
  { nome: "Preparado Goma Arábica", preco: 110.00 },
  { nome: "CMC", preco: 124.00 },
];

const CONFIG = {
  horasDia: 8, diasMes: 22,
  argilaPreco: 7.00,
  marketplace: 0.0, maquina: 0.0,
  perdaNivel: "media",
  perdas: { baixa: 0.15, media: 0.30, alta: 0.45 },
  canais: [
    { id: "direto", nome: "Direto / Pix", itens: [{ nome: "Pix", pct: 0.0099 }] },
    { id: "site", nome: "Site (NuvemShop)", itens: [
      { nome: "Cartão de crédito", pct: 0.0499 },
      { nome: "TPV plataforma", pct: 0.02 },
    ] },
    { id: "feira", nome: "Feira / maquininha", itens: [
      { nome: "Cartão maquininha", pct: 0.035 },
      { nome: "Pix", pct: 0.0099 },
    ] },
    { id: "mercado-livre", nome: "Mercado Livre", itens: [
      { nome: "Comissão", pct: 0.13 },
      { nome: "Cartão de crédito", pct: 0.0499 },
    ] },
    { id: "etsy", nome: "Etsy", itens: [
      { nome: "Comissão", pct: 0.065 },
      { nome: "Taxa de pagamento", pct: 0.04 },
    ] },
  ],
  regimeFiscal: "informal",
  impostosRegime: { informal: 0, mei: 0.0, simples: 0.045 },
  fatores: { 1: 1.0, 2: 1.2, 3: 1.4, 4: 1.6, 5: 1.8 },
  niveis: { aprendiz: 0.6, profissional: 1.0, especialista: 1.5 },
  niveisNome: { aprendiz: "Aprendiz", profissional: "Profissional", especialista: "Especialista" },
  fornos: [
    { id: "forno1", nome: "Meu forno", formato: "cilindrico", diametroCm: 40, alturaCm: 60, larguraCm: 0, profundidadeCm: 0,
      capacidadeKg: 15, unidade: "cm3", modoCusto: "digitar", potenciaKw: 7.2,
      custos: { biscoito: 0.01, baixa: 0.012, alta: 0.015, "3fogo": 0.004 } },
  ],
  servicosFora: [
    { id: "serv1", nome: "Forno da vizinha", unidade: "kg", minimo: 10,
      custos: { biscoito: 15, baixa: 18, alta: 22, "3fogo": 0 } },
  ],
  configQueima: { precoKwh: 0.90, dutyBisque: 0.5, dutyEsmalte: 0.65, horasBisque: 8, horasEsmalte: 9 },
  margensPeca: [
    { nome: "Exclusiva", margem: 0.60, sub: "autoral única" },
    { nome: "Padrão", margem: 0.45, sub: "catálogo" },
    { nome: "Revenda", margem: 0.30, sub: "lojista" },
  ],
  linhasProduto: [
    { nome: "Autoral", mult: 3.0, sub: "peças autorais" },
    { nome: "Profissional", mult: 2.5, sub: "linha profissional" },
    { nome: "Essencial", mult: 2.0, sub: "atacado" },
  ],
  custosFixos: [
    { categoria: "Espaço & contas", id: "espaco", itens: [
      { nome: "Aluguel", valor: 0 }, { nome: "IPTU", valor: 0 }, { nome: "Condomínio", valor: 0 },
      { nome: "Água", valor: 50 }, { nome: "CEMIG (luz)", valor: 600 }, { nome: "Internet", valor: 50 },
      { nome: "Gás", valor: 0 }, { nome: "Manutenção do espaço", valor: 50 },
    ] },
    { categoria: "Freelas & terceirizados", id: "freelas", itens: [{ nome: "Freelas / ajudantes", valor: 0 }] },
    { categoria: "Serviços & digital", id: "servicos", itens: [
      { nome: "Contador", valor: 300 }, { nome: "Imposto", valor: 600 },
      { nome: "Site", valor: 100 }, { nome: "Domínio do site", valor: 0 }, { nome: "Hospedagem / provedor", valor: 0 }, { nome: "Impulsionamento", valor: 0 },
    ] },
    { categoria: "Equipamentos & manutenção", id: "equipamentos", itens: [
      { nome: "Empréstimo forno", valor: 300 }, { nome: "Manutenção forno", valor: 100 },
      { nome: "Ferramentas", valor: 10 }, { nome: "Fluke", valor: 10 }, { nome: "Novos equipamentos", valor: 0 },
    ] },
    { categoria: "Suprimentos & provisões", id: "insumos", itens: [
      { nome: "Café", valor: 30 }, { nome: "Papel higiênico", valor: 5 }, { nome: "Papel toalha", valor: 30 },
      { nome: "Detergente", valor: 5 }, { nome: "Embalagens internas", valor: 20 }, { nome: "Insumos bolo", valor: 20 },
      { nome: "Cursos", valor: 0 }, { nome: "Escambo / presentes", valor: 200 }, { nome: "Papelaria", valor: 0 },
    ] },
  ],
  maoDeObra: { categoria: "Mão de obra & pessoal", id: "pessoal", itens: [
    { nome: "Salário", valor: 3500 },
    { nome: "Impostos do salário (INSS, IR)", valor: 0 },
    { nome: "Plano de saúde", valor: 0 }, { nome: "Vale-refeição", valor: 0 },
  ] },
};

/* Empacotamento real de círculos em círculo — tabela de packing ótimo
   (adaptado de jcmiller11/circlepacking, GitHub, MIT). Config declarada. */
const PACKING = {
  fonte: "jcmiller11/circlepacking (MIT)",
  radii: [
    1.0, 1.0, 0.5, 0.4641016151377546, 0.41421356237309503, 0.37019190815875014, 0.3333333333333333, 0.3333333333333333,
    0.3025933883486113, 0.2767686539141552, 0.26225892419016583, 0.2548547017171489, 0.24816347057168683, 0.2360679774997897, 0.23103072797100863, 0.22117253908639092,
    0.21666474292442242, 0.20867966557049974, 0.20560464675956822, 0.20560464675956822, 0.19522401101874887, 0.1903921468490535, 0.18383302658168169, 0.1803360092544365,
    0.17693913059596167, 0.17382766142122225, 0.17158025218716685, 0.16930793113457304, 0.16625275003860693, 0.16290364927664436, 0.16134910906468986, 0.15894454156034005,
    0.15553398542277086, 0.15416151794705815, 0.15126402824675547, 0.14931677663511603, 0.14821942976111935, 0.14795590447907633, 0.14363921807328983, 0.14168552174540316,
    0.1403736042027147, 0.13774081292534454, 0.13611374871569787, 0.1347718910802124, 0.1333682458860056, 0.13204959425163018, 0.1307158800382334, 0.12946374732695726,
    0.12834875654284525, 0.12679299626220694, 0.12582548953040418, 0.12457167660236501, 0.12369016459246959, 0.12225562368761991, 0.12189202185696497, 0.12178632452799958,
    0.11928149708236242, 0.1183826376515002, 0.11730819312828653, 0.11638056499604701, 0.11565748013281499, 0.11545614167835687, 0.11325329198258037, 0.11245619291783593,
    0.11158259582572624, 0.11089674372296171, 0.10993505729827056, 0.10906348202318328, 0.10834501770447505, 0.10787764336484912, 0.10700161660576299, 0.10620449983711232,
    0.10555325315906697, 0.10481799968818843, 0.10428362983520856, 0.10339091566644489, 0.102779181946967, 0.10205214698369008, 0.10144343971936973, 0.10095846465445622,
    0.10031949941617659, 0.0998914754916362, 0.09949432780515713, 0.09884491927686671, 0.09852672139045499, 0.09839506369260617, 0.09709962400530128, 0.09649521183618055,
    0.09585579277180084, 0.09523363454386985, 0.09482205958694769, 0.09463627850604674, 0.09359224575469459, 0.09316753462248228, 0.09278131528386693, 0.09224917776072092,
    0.09188471648262463, 0.0914194599063644, 0.0910797982293663, 0.09063601981281943, 0.09023520028847372, 0.08971077052118658, 0.08931072549307773, 0.08876939687067727,
    0.08835749851784307, 0.08800756460785963, 0.08755161105931972, 0.0871683648375564, 0.0867753037108809, 0.08648933589533483, 0.0860817696475519, 0.08574262106974673,
    0.08543157170231562, 0.08512429079325748, 0.08478044104459825, 0.08446321172803425, 0.08405689155110237, 0.08372772204895762, 0.08343379425240932, 0.08304037764943754,
  ],
};
const RADII = PACKING.radii;

/* --- Constantes de desenho do render do forno (declaradas, auditáveis).
   Separadas da matemática de ocupação (OCUPACAO). Mesmos valores que o
   código sempre usou — alterar aqui altera o SVG (o harness garante). --- */
const RENDER = {
  viewBox: { W: 96, H: 118, topoY: 16, chaoY: 106 },
  raioMargem: 6,          /* rx = W/2 - raioMargem (margem do forno ao SVG) */
  ryLidFator: 0.14,       /* elipse do topo do forno: rx * fator */
  paredeMargem: 2,        /* (rx - paredeMargem) * 2 = largura útil */
  interiorTopOffset: 3,   /* interior começa em bodyTop + offset */
  interiorFolga: 6,       /* usableH = interiorH - folga */
  minPW: 8,               /* clamp mínimo da peça na largura (px) */
  minPH: 6,               /* clamp mínimo da peça na altura (px) */
  capColsNiveis: 6,       /* teto de colunas/níveis desenhados (legibilidade) */
  colEspaco: 4,           /* colW = (usableW - colEspaco) / nCol */
  isoPecaLado: 0.22,      /* lateral isométrica da peça quadrada (fração de colW) */
  isoTopo: 0.11,          /* topo isométrico da peça quadrada (fração de colW) */
  margemLateral: 2,       /* maxOff = rx - halfW - margem (nada encosta na parede) */
  offsetCol: 0.9,         /* espalhamento horizontal das colunas/peças */
  layerDensoMin: 6,       /* clamp de altura quando empilha/encaixa (slotY - 2) */
  layerDensoFolga: 2,     /* slotY - 2 */
  layerNormalMin: 6,      /* clamp de altura em prateleira densa (slotY - 3) */
  layerNormalFolga: 3,    /* slotY - 3 */
  pecaEsmalteMin: 6,      /* clamp de altura da peça no esmalte (slotY * 0.6) */
  pecaEsmalteFator: 0.6,  /* pecaH = slotY * fator no esmalte */
  colEsmalteFator: 0.9,   /* peça do esmalte tem 90% da coluna */
  yBaseFolga: 3,          /* primeira peça sobe 3px do piso */
};

/* --- Ocupação do forno — parâmetros declarados (nosso algoritmo, auditável) --- */
const OCUPACAO = {
  usarDiametro: 0.9,      /* % do diâmetro/lado do forno aproveitada pela prateleira (parede) */
  gapBase: 4,             /* cm do piso até a 1ª peça */
  gapTopo: 4,             /* cm da última peça ao teto */
  prateleiraEsp: 2,       /* cm de espessura de cada prateleira */
  folgaLateralBiscoito: 1,
  folgaLateralEsmalte: 2,
  folgaVerticalBiscoito: 2,
  folgaVerticalEsmalte: 8,
  pecaPlana: 2.5,         /* diâmetro >= 2,5× altura => empilha em coluna (biscoito) */
  pecaEncaixe: 1.1,       /* diâmetro >= 1,1× altura => tigela encaixa (biscoito) */
  fatorEncaixe: 0.7,      /* cada tigela encaixada ocupa 70% da altura da peça */
};