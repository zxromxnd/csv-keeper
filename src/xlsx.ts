import writeXlsxFile from "write-excel-file/universal";
import { toSheet, type Mode } from "./core";
import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";

export async function exportXlsx(
  rows: string[][],
  modes: Mode[],
  header: boolean,
): Promise<Blob> {
  const blob = await writeXlsxFile(toSheet(rows, modes, header), {
    sheet: "Data",
    columns: modes.map(() => ({ width: 24 })),
  }).toBlob();
  // Modify only our own generated archive, never an uploaded ZIP/XLSX.
  const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  const path = "xl/sharedStrings.xml";
  files[path] = strToU8(
    strFromU8(files[path])
      .replace(/_x(?=[0-9a-fA-F]{4}_)/g, "_x005F_x")
      .replace(/\r/g, "&#13;"),
  );
  return new Blob([new Uint8Array(zipSync(files))], { type: blob.type });
}
