/* ============================================================
   EEGG — Agencia de IA para Empresas Cubanas
   Servidor Node.js SIN dependencias externas (solo módulos core)
   Uso:  node server.js   →  http://localhost:3000
   ============================================================ */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PY = process.env.PYTHON || "python";

/* ---------- Modelo tipo Prophet en JS (respaldo) ---------- */
function pronosticoJS(historial, periodos) {
  const n = historial.length;
  const ys = historial.map(d => d.y);
  const mx = (n - 1) / 2, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (i - mx) * (ys[i] - my); den += (i - mx) ** 2; }
  const pend = den ? num / den : 0, inter = my - pend * mx;

  const suma = new Array(7).fill(0), cnt = new Array(7).fill(0);
  historial.forEach((d, i) => {
    const dow = (new Date(d.ds + "T00:00:00").getDay() + 6) % 7;
    const base = inter + pend * i;
    if (base > 0) { suma[dow] += ys[i] / base; cnt[dow]++; }
  });
  const factor = suma.map((s, i) => cnt[i] ? s / cnt[i] : 1);

  const salida = [];
  const ultima = new Date(historial[n - 1].ds + "T00:00:00");
  for (let k = 1; k <= periodos; k++) {
    const f = new Date(ultima); f.setDate(f.getDate() + k);
    const dow = (f.getDay() + 6) % 7, idx = n - 1 + k;
    const yhat = Math.max(500, Math.round((inter + pend * idx) * factor[dow]));
    salida.push({ ds: f.toISOString().slice(0, 10), yhat,
      yhat_lower: Math.round(yhat * 0.88), yhat_upper: Math.round(yhat * 1.12) });
  }
  return salida;
}

/* ---------- Intento de Prophet real en Python ---------- */
function pronosticoPython(cuerpo) {
  return new Promise(resolve => {
    try {
      const py = spawn(PY, [path.join(ROOT, "forecast.py")], { windowsHide: true });
      let out = "", err = "";
      py.stdout.on("data", d => out += d);
      py.stderr.on("data", d => err += d);
      py.on("error", () => resolve(null));
      py.on("close", code => {
        if (code !== 0) return resolve(null);
        try {
          const j = JSON.parse(out);
          if (j.pronostico && j.pronostico.length) resolve(j.pronostico);
          else resolve(null);
        } catch { resolve(null); }
      });
      py.stdin.write(JSON.stringify(cuerpo));
      py.stdin.end();
      setTimeout(() => { if (!py.killed) { py.kill(); resolve(null); } }, 30000);
    } catch { resolve(null); }
  });
}

function enviar(res, code, tipo, contenido) {
  res.writeHead(code, { "Content-Type": tipo, "Access-Control-Allow-Origin": "*" });
  res.end(contenido);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  /* API: pronóstico */
  if (url.pathname === "/api/forecast" && req.method === "POST") {
    let cuerpo = "";
    req.on("data", c => cuerpo += c);
    req.on("end", async () => {
      try {
        const j = JSON.parse(cuerpo || "{}");
        if (!Array.isArray(j.historial) || !j.historial.length)
          return enviar(res, 400, "application/json", JSON.stringify({ error: "historial vacío" }));
        const periodos = Math.min(60, Math.max(1, +j.periodos || 14));

        const fcPy = await pronosticoPython({ historial: j.historial, periodos });
        if (fcPy)
          return enviar(res, 200, "application/json",
            JSON.stringify({ motor: "Prophet (Python)", pronostico: fcPy }));

        return enviar(res, 200, "application/json",
          JSON.stringify({ motor: "JavaScript (tipo Prophet)", pronostico: pronosticoJS(j.historial, periodos) }));
      } catch (e) {
        return enviar(res, 500, "application/json", JSON.stringify({ error: String(e) }));
      }
    });
    return;
  }

  /* API: estado del servidor */
  if (url.pathname === "/api/estado") {
    return enviar(res, 200, "application/json", JSON.stringify({
      app: "EEGG — Agencia de IA", estado: "ok", hora: new Date().toISOString()
    }));
  }

  /* Archivos estáticos */
  let ruta = decodeURIComponent(url.pathname);
  if (ruta === "/" ) ruta = "/index.html";
  const archivo = path.join(ROOT, path.normalize(ruta).replace(/^(\.\.[\/\\])+/, ""));
  if (!archivo.startsWith(ROOT)) return enviar(res, 403, "text/plain", "Prohibido");
  fs.readFile(archivo, (err, datos) => {
    if (err) return enviar(res, 404, "text/plain; charset=utf-8", "404 — No encontrado");
    const tipos = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
      ".png": "image/png", ".svg": "image/svg+xml" };
    enviar(res, 200, tipos[path.extname(archivo)] || "application/octet-stream", datos);
  });
});

server.listen(PORT, () => {
  console.log("==========================================================");
  console.log("  EEGG — Agencia de IA para Empresas Cubanas");
  console.log(`  Servidor activo:  http://localhost:${PORT}`);
  console.log("  Prophet Python :  " + (fs.existsSync(path.join(ROOT, "forecast.py")) ? "disponible (con pandas+prophet)" : "no instalado"));
  console.log("==========================================================");
});
