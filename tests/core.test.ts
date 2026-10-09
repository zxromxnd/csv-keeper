import test from "node:test";
import assert from "node:assert/strict";
import {
  parseCsv,
  safeNumber,
  toSheet,
  columnIssue,
  decode,
  LIMITS,
} from "../src/core";
import writeXlsxFile from "write-excel-file/universal";
import { unzipSync, strFromU8 } from "fflate";
import { exportXlsx } from "../src/xlsx";

test("preserves literal SpreadsheetML escapes and carriage returns", async () => {
  const blob = await exportXlsx(
    [["value"], ["_x0041_"], ["a\r\nb"], ["  spaces  "]],
    ["text"],
    true,
  );
  const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  const strings = strFromU8(files["xl/sharedStrings.xml"]);
  assert.match(strings, /_x005F_x0041_/);
  assert.match(strings, /a&#13;\nb/);
  assert.match(strings, /xml:space="preserve">  spaces  /);
});

test("CSV preserves zeros, long IDs, quotes, Unicode and embedded newlines", () => {
  const result = parseCsv(
    '\uFEFFid;name;note\r\n00123;Київ;"line 1\nline 2"\r\n12345678901234567890;"a; b";"say ""hello"""\r\n',
  );
  assert.equal(result.delimiter, ";");
  assert.deepEqual(result.rows, [
    ["id", "name", "note"],
    ["00123", "Київ", "line 1\nline 2"],
    ["12345678901234567890", "a; b", 'say "hello"'],
  ]);
});
test("blank cells, spaces and internal blank records are preserved", () => {
  assert.deepEqual(parseCsv("a,b\n ,\n,x\n").rows, [
    ["a", "b"],
    [" ", ""],
    ["", "x"],
  ]);
  assert.deepEqual(parseCsv("a\n\nb\n", ",").rows, [["a"], [""], ["b"]]);
});
test("rejects malformed quotes, ragged rows and binary data", () => {
  assert.throws(() => parseCsv('a,b\n"never ends,b'), /malformed/);
  assert.throws(() => parseCsv("a,b\n1,2,3"), /ragged/);
  assert.throws(() => parseCsv("a\u0000b"), /binary/);
  assert.throws(() => parseCsv("  "), /empty/);
});
test("enforces row, column and cell limits without silently truncating", () => {
  assert.throws(() => parseCsv("x".repeat(32768)), /cell/);
  assert.throws(() => parseCsv(Array(101).fill("x").join(",")), /limit/);
  assert.throws(() => parseCsv(Array(10001).fill("x").join("\n")), /limit/);
  assert.equal(
    parseCsv(Array(LIMITS.rows).fill("x").join("\n")).rows.length,
    LIMITS.rows,
  );
});
test("numeric opt-in rejects IDs, formulas, dates, whitespace and ambiguous decimals", () => {
  for (const value of [
    "00123",
    "1234567890123456",
    "=1+1",
    "+12",
    "@x",
    "1e3",
    "12,5",
    "1.20",
    "-0",
    " 12",
    "01-02",
  ])
    assert.equal(safeNumber(value), null, value);
  assert.equal(safeNumber("12"), 12);
  assert.equal(safeNumber("-12.25"), -12.25);
  assert.equal(safeNumber("0.125"), 0.125);
  assert.equal(columnIssue([["id"], ["00123"]], 0, true), 2);
  assert.throws(() => toSheet([["00123"]], ["number"], false), /number/);
});
test("strict decoder rejects wrong encoding; Windows-1251 is explicit", () => {
  assert.throws(
    () => decode(new Uint8Array([0xff]).buffer, "utf-8"),
    /encoding/,
  );
  assert.equal(
    decode(new Uint8Array([0xcf, 0xf0]).buffer, "windows-1251"),
    "Пр",
  );
});
test("export produces actual XLSX string cells, not executable formulas", async () => {
  const rows = [
    ["id", "payload", "qty"],
    ["00123", '=HYPERLINK("https://example.com")', "12"],
    ["12345678901234567890", "<script>alert(1)</script>", "3"],
  ];
  const blob = await writeXlsxFile(
    toSheet(rows, ["text", "text", "number"], true),
  ).toBlob();
  const zip = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  const xml = Object.entries(zip)
    .filter(([name]) => name.endsWith(".xml"))
    .map(([, bytes]) => strFromU8(bytes))
    .join("\n");
  assert.match(xml, /00123/);
  assert.match(xml, /12345678901234567890/);
  assert.match(xml, /HYPERLINK/);
  assert.match(xml, /&lt;script&gt;/);
  assert.doesNotMatch(xml, /<f[ >]/);
  assert.match(strFromU8(zip["xl/worksheets/sheet1.xml"]), /<v>12<\/v>/);
});
