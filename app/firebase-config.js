/* ===== Configuração do Firebase (Firestore, plano Spark — gratuito) =====
 *
 * Projeto dedicado: denaro-precificador (nome de exibição: "Denaro").
 * Firestore (doc único `alice/estado`) — banco `(default)` em modo produção,
 * região southamerica-east1, free tier. Regras publicadas via CLI
 * (`npm run deploy:rules` → firestore.rules).
 *
 * IMPORTANTE: estas chaves NÃO são segredo (são públicas por design, ficam no
 * navegador). A segurança real vem das Regras do Firestore (firestore.rules),
 * que limitam leitura/escrita ao doc `alice/estado`. Se um dia quiser
 * restringir por usuário, adicione Firebase Auth com e-mail/senha.
 */
window.ALICE_FIREBASE = {
  apiKey: "AIzaSyDZrTMPbWQkuEe34ZOXcVUk5FSLIhevvO8",
  authDomain: "denaro-precificador.firebaseapp.com",
  projectId: "denaro-precificador",
  storageBucket: "denaro-precificador.firebasestorage.app"
};
