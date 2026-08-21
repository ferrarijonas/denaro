const http = require("node:http");
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const PORT = process.env.PORT || 8787;
const ROOT = __dirname;
const MOCK_DIR = path.join(ROOT, "mock");
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "alice.db");
const COSTS_KEY = "costs";

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_FILE);
db.exec("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)");

const readStmt = db.prepare("SELECT value FROM kv WHERE key = ?");
const writeStmt = db.prepare(
  "INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
);

function readCosts() {
  const row = readStmt.get(COSTS_KEY);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.normalize(path.join(MOCK_DIR, urlPath));
  if (!filePath.startsWith(MOCK_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Não encontrado");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
    });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error("body muito grande"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const route = url.pathname;

  if (req.method === "GET" && route === "/api/costs") {
    const costs = readCosts();
    json(res, 200, costs !== null ? { data: costs, salvoEm: null } : { data: null, salvoEm: null });
    return;
  }

  if (req.method === "PUT" && route === "/api/costs") {
    let body;
    try {
      body = await readBody(req);
    } catch {
      json(res, 413, { erro: "Corpo muito grande" });
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      json(res, 400, { erro: "JSON inválido" });
      return;
    }
    writeStmt.run(COSTS_KEY, JSON.stringify(parsed));
    json(res, 200, { ok: true, salvoEm: new Date().toISOString() });
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Alice servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`Banco: ${DB_FILE}`);
});
