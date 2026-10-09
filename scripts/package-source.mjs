// Explicit allowlist: never package user CSVs, environment files or parent documents.
import { readFile, readdir, writeFile } from "node:fs/promises";
import { zipSync } from "fflate";
const entries = {};
async function add(path) {
  entries[`csv-keeper/${path}`] = new Uint8Array(await readFile(path));
}
async function directory(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) await directory(child);
    else if (entry.isFile()) await add(child);
  }
}
for (const path of [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "playwright.config.ts",
  "index.html",
  "README.md",
  "README.en.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  ".gitignore",
])
  await add(path);
for (const path of ["src", "tests", "scripts", "public"]) await directory(path);
await writeFile("dist/source.zip", zipSync(entries));
