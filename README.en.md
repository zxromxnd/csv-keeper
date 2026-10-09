# CSV Keeper

[Українська](README.md) | English

A free CSV and TSV to Excel converter. Keeps leading zeros, long identifiers and text without automatically turning them into numbers or dates.

[Open the app](https://csv-keeper.netlify.app/) · [Test CSV](public/examples/check.csv)

## Usage

1. Select or drop a CSV/TSV file, or try the built-in example.
2. Review the table. Adjust the delimiter, encoding and header setting if needed.
3. Keep codes and identifiers as text. Choose the numeric column type for quantities or other numbers.
4. Download XLSX and open it in Excel or LibreOffice Calc.

Runs in a modern browser on Windows, Linux and macOS. No installation is needed to convert files. The interface supports Ukrainian and English.

## Test file

Download [check.csv](public/examples/check.csv). Select UTF-8, comma and the first row as a header. Keep all columns as text except `Quantity`, which can be converted to numbers.

Check the result:

- `001234` and `000007` keep their leading zeros.
- `12345678901234567890` keeps every digit.
- `Кава`, `Чай, зелений` and `Він сказав "привіт"` remain unchanged.
- `=1+1` stays literal text rather than becoming a calculation.
- The empty cell stays empty. The line break inside a note is preserved; enable text wrapping in your spreadsheet editor to see it.

## Limits

- Up to 5 MiB, 10,000 rows including the header, 100 columns and 100,000 cells.
- Up to 32,767 UTF-16 code units per cell.
- Encodings: UTF-8, Windows-1251 and UTF-16LE. Delimiters: comma, semicolon, tab and `|`.
- Rows must have the same field count. Malformed quoting and uneven rows are rejected.
- Numeric columns accept decimal numbers with a dot, up to 15 significant digits. Values with leading zeros, exponents or ambiguous formatting must stay as text.
- Dates stay as text. XLS/XLSX input is not supported. Digits already lost in the original file cannot be recovered.

## Data handling

Files are processed in browser memory. Their contents are not sent to a server or saved in local storage. No accounts, advertising or analytics. The hosting provider receives normal requests to load the page.

Formula-like values are written to XLSX as text. CSV values are never executed as HTML. Clearing the table stops processing and removes the loaded table.

## Development

Requires Git and Node.js 22 or newer. Commands for Linux, macOS and Windows:

```sh
git clone https://github.com/zxromxnd/csv-keeper.git
cd csv-keeper
npm ci
npm run dev
```

Open the URL printed by Vite. If PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`.

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Linux browser tests may need system dependencies: `npx playwright install --with-deps chromium`. To test with installed Edge on Windows, set `$env:PLAYWRIGHT_CHANNEL="msedge"`.

| File | Purpose |
| --- | --- |
| `index.html` | HTML page and entry point |
| `src/main.ts` | UI, translations, events and state |
| `src/style.css` | Styling and responsive layout |
| `src/core.ts` | CSV parsing, validation and cell types |
| `src/worker.ts` | Processing outside the main thread |
| `src/xlsx.ts` | XLSX generation |
| `tests/` | Data and browser tests |

Built with TypeScript, Vite, Papa Parse, write-excel-file and fflate. No application server or database required.

`npm run build` creates `dist` for static hosting. For Netlify, upload its contents, including `_headers`. The build also creates a source code archive.

## License

[MIT](LICENSE). Author: Yevhen Briukhovetskyi.

Dependency licenses: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
