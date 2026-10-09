import Papa from "papaparse";
import type { SheetData } from "write-excel-file/universal";

export const LIMITS = {
  bytes: 5 * 1024 * 1024,
  rows: 10000,
  columns: 100,
  cells: 100000,
  cellLength: 32767,
};
export type Mode = "text" | "number";
export type Delimiter = "" | "," | ";" | "\t" | "|";
export type Parsed = {
  rows: string[][];
  delimiter: string;
  columns: number;
  risks: number[];
};

// Refuse lossy conversion rather than guessing locale, dates or identifiers.
export function safeNumber(value: string): number | null {
  if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return null;
  if (value.replace(/[-.]/g, "").replace(/^0+/, "").length > 15) return null;
  if (/\.\d*0$/.test(value) || /^-0(?:\.0+)?$/.test(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function isRisk(value: string): boolean {
  return (
    /^[-+]?0\d/.test(value) ||
    /^\d{16,}$/.test(value) ||
    /^[=+@]/.test(value) ||
    /^-\D/.test(value) ||
    /\d[eE][+-]?\d/.test(value) ||
    /^\d{1,4}[-/]\d{1,2}/.test(value)
  );
}

export function decode(bytes: ArrayBuffer, encoding: string): string {
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(bytes);
  } catch {
    throw new Error("encoding");
  }
}

export function parseCsv(text: string, delimiter: Delimiter = ""): Parsed {
  if (!text.trim()) throw new Error("empty");
  // XML 1.0 cannot represent these characters. Do not silently strip user data.
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/u.test(text))
    throw new Error("binary");
  const rows: string[][] = [];
  let failure = "";
  let columns = 0;
  let usedDelimiter = delimiter as string;
  Papa.parse<string[]>(text.replace(/^\uFEFF/, ""), {
    delimiter,
    dynamicTyping: false,
    skipEmptyLines: false,
    delimitersToGuess: [",", ";", "\t", "|"],
    step(result, parser) {
      usedDelimiter = result.meta.delimiter;
      const error = result.errors.find(
        (e) => e.code !== "UndetectableDelimiter",
      );
      if (error) {
        failure = "malformed";
        parser.abort();
        return;
      }
      const row = result.data;
      if (row.length > LIMITS.columns || rows.length >= LIMITS.rows + 1) {
        failure = "limit";
        parser.abort();
        return;
      }
      if (row.some((cell) => cell.length > LIMITS.cellLength)) {
        failure = "cell";
        parser.abort();
        return;
      }
      columns = Math.max(columns, row.length);
      if ((rows.length + 1) * columns > LIMITS.cells + LIMITS.columns) {
        failure = "limit";
        parser.abort();
        return;
      }
      rows.push(row);
    },
  });
  if (failure) throw new Error(failure);
  // A final line terminator is not an extra record. Internal blank records remain intact.
  if (
    /(?:\r\n|\n|\r)$/.test(text) &&
    rows.at(-1)?.length === 1 &&
    rows.at(-1)?.[0] === ""
  )
    rows.pop();
  if (rows.length > LIMITS.rows || rows.length * columns > LIMITS.cells)
    throw new Error("limit");
  if (!rows.length) throw new Error("empty");
  if (rows.some((row) => row.length !== columns)) throw new Error("ragged");
  const risks = Array.from(
    { length: columns },
    (_, index) => rows.filter((row) => isRisk(row[index])).length,
  );
  return { rows, delimiter: usedDelimiter, columns, risks };
}

export function columnIssue(
  rows: string[][],
  column: number,
  header: boolean,
): number | null {
  for (let r = header ? 1 : 0; r < rows.length; r++) {
    const value = rows[r][column];
    if (value !== "" && safeNumber(value) === null) return r + 1;
  }
  return null;
}

export function toSheet(
  rows: string[][],
  modes: Mode[],
  header: boolean,
): SheetData {
  if (modes.length !== rows[0]?.length) throw new Error("columns");
  return rows.map((row, r) =>
    row.map((value, c) => {
      if (header && r === 0)
        return {
          value,
          type: String,
          fontWeight: "bold",
          backgroundColor: "#EAF0FF",
        };
      if (modes[c] === "text") return { value, type: String, format: "@" };
      if (value === "") return null;
      const number = safeNumber(value);
      if (number === null) throw new Error("number");
      return { value: number, type: Number };
    }),
  );
}

export function outputName(name: string): string {
  return (
    (name
      .replace(/\.[^.]+$/, "")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
      .slice(0, 100) || "table") + "-preserved.xlsx"
  );
}
