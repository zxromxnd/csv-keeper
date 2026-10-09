// Production-like local test server: apply the same CSP/headers as Pages.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist");
const lines = (await readFile("dist/_headers", "utf8"))
  .split("\n")
  .slice(1)
  .filter((line) => line.trim());
const headers = Object.fromEntries(
  lines.map((line) => {
    const i = line.indexOf(":");
    return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
  }),
);
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = resolve(root, "." + (path === "/" ? "/index.html" : path));
    if (!file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    const content = await readFile(file);
    const mime =
      {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
      }[extname(file)] || "application/octet-stream";
    res.writeHead(200, { ...headers, "Content-Type": mime });
    res.end(content);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(4173, "127.0.0.1");
