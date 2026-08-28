/* =====================================================================
 * Denaro — app/js/storage.js
 * Programa de persistência (DenaroEngSpec §4.4 / Specs/persistencia/00-storage.md).
 * Doc único em duas fontes (localStorage + Firestore); no carregamento
 * vence a fonte com `salvoEm` maior. DOM-free e genérico: recebe as
 * dependências injetadas e não sabe nada do shape do app (CONFIG/salvos/
 * rascunho) nem de fotos — a UI monta o doc e aplica o restaurado.
 *
 * criaStorage({ chave, localStorage, firestore, colecao, docId })
 *   → { carregar, gravar, autosave }
 * ===================================================================== */

function criaStorage(opts) {
  const chave = opts.chave;
  const ls = opts.localStorage;
  const ref = opts.firestore
    ? opts.firestore.collection(opts.colecao).doc(opts.docId)
    : null;

  function lerLocal() {
    try {
      const raw = ls.getItem(chave);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function lerNuvem() {
    if (!ref) return Promise.resolve({ doc: null, ok: false });
    return ref.get()
      .then((snap) => ({ doc: snap.exists ? snap.data() : null, ok: true }))
      .catch(() => ({ doc: null, ok: false }));
  }

  function maisRecente(nuvem, local) {
    if (nuvem && local) {
      const tn = nuvem.salvoEm, tl = local.salvoEm;
      if (typeof tn === "number" && typeof tl === "number" && tl > tn) {
        return { dados: local, origem: "local" };
      }
      return { dados: nuvem, origem: "nuvem" };
    }
    if (nuvem) return { dados: nuvem, origem: "nuvem" };
    if (local) return { dados: local, origem: "local" };
    return null;
  }

  async function carregar() {
    const local = lerLocal();
    const { doc: nuvem, ok } = await lerNuvem();
    const vencedor = maisRecente(nuvem, local);
    return vencedor
      ? { dados: vencedor.dados, origem: vencedor.origem, nuvemOk: ok }
      : { dados: null, origem: null, nuvemOk: ok };
  }

  async function gravar(dados, transformarParaNuvem) {
    const doc = Object.assign({}, dados, { salvoEm: Date.now() });
    try { ls.setItem(chave, JSON.stringify(doc)); } catch (e) { /* quota/indisponível — segue para a nuvem */ }
    if (!ref) return false;
    try {
      const variante = transformarParaNuvem ? await transformarParaNuvem(doc) : doc;
      await ref.set(variante);
      return true;
    } catch (e) { return false; }
  }

  function autosave(fn, ms) {
    let timer = null;
    return {
      agendar() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { timer = null; fn(); }, ms);
      },
      flush() {
        if (timer) { clearTimeout(timer); timer = null; }
        fn();
      },
    };
  }

  return { carregar, gravar, autosave, lerLocal };
}