import {
  decode,
  parseCsv,
  LIMITS,
  type Delimiter,
  type Mode,
  type Parsed,
} from "./core";
import { exportXlsx } from "./xlsx";

let parsed: Parsed | null = null;
self.onmessage = async (event: MessageEvent) => {
  const message = event.data;
  try {
    if (message.type === "parse") {
      parsed = null;
      if (message.bytes.byteLength > LIMITS.bytes) throw new Error("limit");
      parsed = parseCsv(
        decode(message.bytes, message.encoding),
        message.delimiter as Delimiter,
      );
      self.postMessage({ type: "parsed", parsed });
    } else if (message.type === "export" && parsed) {
      const blob = await exportXlsx(
        parsed.rows,
        message.modes as Mode[],
        message.header,
      );
      self.postMessage({ type: "exported", blob });
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      code: error instanceof Error ? error.message : "unknown",
    });
  }
};
