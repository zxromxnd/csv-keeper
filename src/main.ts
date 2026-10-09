import "./style.css";
import {
  LIMITS,
  columnIssue,
  outputName,
  type Parsed,
  type Mode,
} from "./core";

const words = {
  uk: {
    privacy: "Файли залишаються на вашому пристрої",
    title: "CSV → Excel. Кожна цифра на місці.",
    intro:
      "Збережіть початкові нулі, довгі номери та коди. Без реєстрації. Без завантаження файлів на сервер.",
    open: "Вибрати CSV",
    drop: "або перетягніть файл сюди",
    sample: "Спробувати на прикладі",
    limits:
      "CSV / TSV · до 5 МіБ · 10 000 рядків · 100 стовпців · 100 000 комірок",
    how: "Як це працює",
    step1: "Відкрийте оригінальний CSV",
    step2: "Перевірте стовпці та попередній перегляд",
    step3: "Збережіть готовий файл Excel",
    settings: "Налаштування читання",
    delimiter: "Роздільник",
    auto: "Автоматично",
    comma: "Кома (,)",
    semicolon: "Крапка з комою (;)",
    tab: "Табуляція",
    pipe: "Вертикальна риска (|)",
    encoding: "Кодування",
    header: "Перший рядок — назви стовпців",
    columns: "Типи стовпців",
    columnsHelp:
      "За замовчуванням усе — текст. Для сум і кількостей можна вибрати «Число». Коди, дати та телефони залишайте текстом.",
    text: "Текст — зберегти точно",
    number: "Число — для обчислень",
    col: "Стовпець",
    risk: "значень варто залишити текстом",
    preview: "Попередній перегляд",
    previewNote: "Показано до 12 рядків. В експорт потрапляє вся таблиця.",
    rows: "рядків",
    cols: "стовпців",
    save: "Завантажити Excel",
    reset: "Очистити",
    cancel: "Скасувати",
    ready: "Файл прочитано. Перевірте таблицю перед експортом.",
    reading: "Читаємо файл…",
    writing: "Створюємо Excel…",
    done: "Файл Excel створено. Завантаження розпочато.",
    invalid:
      "Не можна перетворити без зміни значення. Поверніть «Текст». Рядок:",
    savedAs:
      "Текстові комірки Excel можуть мати індикатор «число збережено як текст». Для ідентифікаторів це правильно.",
    note: "Працюйте з оригіналом: уже втрачені цифри відновити неможливо. У текстових стовпцях формули не виконуються.",
    about: "Про інструмент",
    aboutText:
      "CSV Keeper — незалежний безкоштовний інструмент. Обробка відбувається у вашому браузері. Ми не додаємо аналітику, рекламу чи сховище файлів. Після очищення або закриття сторінки дані не зберігаються застосунком; завантажені вами файли залишаються на пристрої.",
    privacyNote:
      "Хостинг отримує звичайні запити на відкриття сторінки, але не вміст обраних таблиць.",
    source: "Вихідний код та автор",
    sourceText: "Автор: Євген Брюховецький · Версія 0.1 · Ліцензія MIT.",
    downloadSource: "Завантажити вихідний код",
    cancelled: "Операцію скасовано. Дані очищено.",
    errors: {
      empty: "Файл порожній. Виберіть CSV із даними.",
      encoding:
        "Не вдалося прочитати кодування. Спробуйте Windows-1251 або UTF-16LE, якщо файл створено в старій програмі.",
      binary:
        "Файл містить символи, які Excel не може зберегти. Потрібен текстовий CSV/TSV, а не XLS/XLSX чи PDF.",
      malformed:
        "Пошкоджені лапки в CSV. Виправте оригінал або перевірте роздільник. Нічого не експортовано.",
      ragged:
        "У рядках різна кількість стовпців. Перевірте роздільник або структуру вихідного CSV.",
      limit:
        "Файл перевищує обмеження. Максимум: 5 МіБ, 10 000 рядків, 100 стовпців і 100 000 комірок.",
      cell: "Одна з комірок містить понад 32 767 символів — це більше за ліміт Excel.",
      number:
        "Один зі стовпців не можна безпечно перетворити на числа. Залиште його текстом.",
      timeout: "Операція тривала надто довго. Спробуйте менший файл.",
      unknown:
        "Не вдалося обробити файл. Спробуйте ще раз або скористайтеся прикладом.",
    },
  },
  en: {
    privacy: "Your files stay on your device",
    title: "CSV → Excel. Every digit intact.",
    intro:
      "Keep leading zeros, long IDs and codes. No account. No file uploads.",
    open: "Choose a CSV",
    drop: "or drop a file here",
    sample: "Try an example",
    limits:
      "CSV / TSV · up to 5 MiB · 10,000 rows · 100 columns · 100,000 cells",
    how: "How it works",
    step1: "Open the original CSV",
    step2: "Check columns and the preview",
    step3: "Save your Excel file",
    settings: "Reading settings",
    delimiter: "Delimiter",
    auto: "Automatic",
    comma: "Comma (,)",
    semicolon: "Semicolon (;)",
    tab: "Tab",
    pipe: "Pipe (|)",
    encoding: "Encoding",
    header: "First row contains column names",
    columns: "Column types",
    columnsHelp:
      "Everything starts as text. Choose “Number” for amounts or quantities. Keep codes, dates and phone numbers as text.",
    text: "Text — preserve exactly",
    number: "Number — for calculations",
    col: "Column",
    risk: "values best kept as text",
    preview: "Preview",
    previewNote: "Showing up to 12 rows. The export includes the entire table.",
    rows: "rows",
    cols: "columns",
    save: "Download Excel",
    reset: "Clear",
    cancel: "Cancel",
    ready: "File read. Check the table before exporting.",
    reading: "Reading file…",
    writing: "Creating Excel…",
    done: "Excel file created. Download started.",
    invalid:
      "Cannot convert without changing a value. Switch back to Text. Row:",
    savedAs:
      "Excel may flag text cells as “number stored as text”. For identifiers, this is intentional.",
    note: "Use the original: digits already lost cannot be recovered. Formulas in text columns are not executed.",
    about: "About this tool",
    aboutText:
      "CSV Keeper is an independent, free tool. Files are processed in your browser. No analytics, ads or file storage are included. The app does not retain data after clearing or closing the page; files you download remain on your device.",
    privacyNote:
      "The hosting provider receives normal page requests, but not the contents of your selected tables.",
    source: "Source code & author",
    sourceText: "Created by Yevhen Briukhovetskyi · Version 0.1 · MIT license.",
    downloadSource: "Download source code",
    cancelled: "Operation cancelled. Data cleared.",
    errors: {
      empty: "This file is empty. Choose a CSV with data.",
      encoding:
        "Cannot decode this file. Try Windows-1251 or UTF-16LE if it comes from an older application.",
      binary:
        "This file contains characters Excel cannot store. Choose a text CSV/TSV, not XLS/XLSX or PDF.",
      malformed:
        "The CSV has broken quotes. Fix the original or check the delimiter. Nothing was exported.",
      ragged:
        "Rows have different column counts. Check the delimiter or the original CSV structure.",
      limit:
        "File exceeds a limit: 5 MiB, 10,000 rows, 100 columns or 100,000 cells.",
      cell: "A cell exceeds Excel’s 32,767-character limit.",
      number: "A column cannot safely become numbers. Keep it as text.",
      timeout: "This took too long. Try a smaller file.",
      unknown: "Could not process this file. Try again or use the example.",
    },
  },
};
type Language = keyof typeof words;
let language: Language =
  navigator.language.startsWith("uk") || navigator.language.startsWith("ru")
    ? "uk"
    : "en";
let file: File | null = null;
let parsed: Parsed | null = null;
let modes: Mode[] = [];
let worker: Worker | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let busy = false;
let serial = 0;
let hasHeader = true;
let separator = "";
let encoding = "utf-8";
const root = document.querySelector<HTMLDivElement>("#app")!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;

function status(message: string, error = false) {
  $("status").textContent = message;
  $("status").classList.toggle("error", error);
}

function setBusy(value: boolean) {
  busy = value;
  root.setAttribute("aria-busy", String(value));
  root
    .querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>(
      "input, select, button",
    )
    .forEach((el) => {
      if (el.id !== "reset" && el.id !== "cancel") el.disabled = value;
    });
  $("cancel").hidden = !value;
  if (!value) validate();
}

function stop() {
  serial++;
  clearTimeout(timer);
  worker?.terminate();
  worker = null;
}

function clear() {
  stop();
  file = null;
  parsed = null;
  modes = [];
  busy = false;
  separator = "";
  encoding = "utf-8";
  hasHeader = true;
  render();
}

function fail(code: string) {
  stop();
  parsed = null;
  modes = [];
  $("workspace").hidden = true;
  setBusy(false);
  const errors = words[language].errors;
  status(errors[code as keyof typeof errors] || errors.unknown, true);
}

function deadline() {
  clearTimeout(timer);
  timer = setTimeout(() => fail("timeout"), 30000);
}

async function load(next: File) {
  stop();
  file = next;
  parsed = null;
  modes = [];
  $("workspace").hidden = true;
  $("filename").textContent = next.name;
  $("reading-settings").hidden = false;
  if (next.size > LIMITS.bytes) {
    fail("limit");
    return;
  }
  setBusy(true);
  status(words[language].reading);
  deadline();
  const current = serial;
  try {
    const bytes = await next.arrayBuffer();
    if (current !== serial) return;
    worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onerror = () => {
      if (current === serial) fail("unknown");
    };
    worker.onmessage = (event) => {
      if (current !== serial) return;
      clearTimeout(timer);
      if (event.data.type === "error") {
        fail(event.data.code);
        return;
      }
      if (event.data.type === "parsed") {
        parsed = event.data.parsed;
        modes = Array(parsed!.columns).fill("text");
        setBusy(false);
        showData();
        status(words[language].ready);
      } else if (event.data.type === "exported") {
        const url = URL.createObjectURL(event.data.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = outputName(file!.name);
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        setBusy(false);
        status(words[language].done);
      }
    };
    worker.postMessage(
      { type: "parse", bytes, encoding, delimiter: separator },
      [bytes],
    );
  } catch {
    if (current === serial) fail("unknown");
  }
}

function validate() {
  let valid = !!parsed;
  if (parsed)
    modes.forEach((mode, column) => {
      const row =
        mode === "number" ? columnIssue(parsed!.rows, column, hasHeader) : null;
      const hint = document.getElementById(`issue-${column}`);
      if (hint)
        hint.textContent =
          row === null ? "" : `${words[language].invalid} ${row}`;
      document
        .getElementById(`mode-${column}`)
        ?.setAttribute("aria-invalid", String(row !== null));
      if (row !== null) valid = false;
    });
  const save = document.getElementById("save") as HTMLButtonElement | null;
  if (save) save.disabled = busy || !valid;
}

function showData() {
  if (!parsed) return;
  const t = words[language];
  $("workspace").hidden = false;
  $("stats").textContent =
    `${parsed.rows.length} ${t.rows} · ${parsed.columns} ${t.cols}`;
  const list = $("column-list");
  list.replaceChildren();
  for (let c = 0; c < parsed.columns; c++) {
    const box = document.createElement("div");
    box.className = "column";
    const label = document.createElement("label");
    label.htmlFor = `mode-${c}`;
    label.textContent =
      hasHeader && parsed.rows[0][c] ? parsed.rows[0][c] : `${t.col} ${c + 1}`;
    label.title = label.textContent;
    const meta = document.createElement("span");
    meta.className = "column-meta";
    meta.textContent = `${String(c + 1).padStart(2, "0")} / ${parsed.risks[c]} ${t.risk}`;
    const select = document.createElement("select");
    select.id = `mode-${c}`;
    select.setAttribute("aria-describedby", `issue-${c}`);
    for (const [value, text] of [
      ["text", t.text],
      ["number", t.number],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.append(option);
    }
    select.value = modes[c];
    select.addEventListener("change", () => {
      modes[c] = select.value as Mode;
      validate();
    });
    const issue = document.createElement("small");
    issue.id = `issue-${c}`;
    issue.className = "error";
    issue.setAttribute("aria-live", "polite");
    box.append(meta, label, select, issue);
    list.append(box);
  }
  const table = $("preview-table");
  table.replaceChildren();
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = t.preview;
  table.append(caption);
  const head = document.createElement("thead");
  const tr = document.createElement("tr");
  const number = document.createElement("th");
  number.textContent = "#";
  number.scope = "col";
  tr.append(number);
  for (let c = 0; c < parsed.columns; c++) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = hasHeader ? parsed.rows[0][c] : `${t.col} ${c + 1}`;
    tr.append(th);
  }
  head.append(tr);
  table.append(head);
  const body = document.createElement("tbody");
  parsed.rows
    .slice(hasHeader ? 1 : 0, (hasHeader ? 1 : 0) + 12)
    .forEach((row, index) => {
      const tr = document.createElement("tr");
      const number = document.createElement("th");
      number.scope = "row";
      number.textContent = String(index + (hasHeader ? 2 : 1));
      tr.append(number);
      row.forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.append(td);
      });
      body.append(tr);
    });
  table.append(body);
  validate();
}

function render() {
  const t = words[language];
  document.documentElement.lang = language;
  root.innerHTML = `
    <header class="top"><a class="brand" href="./" aria-label="CSV Keeper">CSV<span>Keeper</span><span class="version">0.1</span></a>
      <div class="languages" aria-label="Language"><button id="uk" aria-pressed="${language === "uk"}">УКР</button><button id="en" aria-pressed="${language === "en"}">EN</button></div></header>
    <main>
      <div class="intro"><p class="eyebrow">CSV / TSV → XLSX</p><h1>${t.title}</h1><p class="lead">${t.intro}</p></div>
      <section id="dropzone" class="upload" aria-label="${t.open}">
        <div class="upload-icon" aria-hidden="true">↥</div><div class="upload-actions"><button class="primary" id="choose">${t.open}</button><button class="secondary" id="sample">${t.sample}</button></div>
        <input id="file" class="sr-only" type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" tabindex="-1" />
        <p>${t.drop}</p><small>${t.limits}</small><p class="privacy"><span aria-hidden="true">●</span> ${t.privacy}</p>
      </section>
      <div class="status-line"><p id="status" role="status" aria-live="polite"></p><button id="cancel" class="text-button" hidden>${t.cancel}</button></div>
      <section id="reading-settings" class="panel" hidden><div class="panel-title"><h2>${t.settings}</h2><button id="reset" class="text-button">${t.reset}</button></div><p id="filename" class="filename"></p>
        <div class="settings"><label>${t.delimiter}<select id="delimiter"><option value="">${t.auto}</option><option value=",">${t.comma}</option><option value=";">${t.semicolon}</option><option value="\t">${t.tab}</option><option value="|">${t.pipe}</option></select></label>
        <label>${t.encoding}<select id="encoding"><option value="utf-8">UTF-8</option><option value="windows-1251">Windows-1251</option><option value="utf-16le">UTF-16LE</option></select></label>
        <label class="checkbox"><input type="checkbox" id="header" checked />${t.header}</label></div></section>
      <div id="workspace" hidden>
        <section class="panel"><div class="panel-title"><h2>${t.columns}</h2><span id="stats" class="badge"></span></div><p class="helper">${t.columnsHelp}</p><div id="column-list" class="columns"></div></section>
        <section class="panel preview"><h2>${t.preview}</h2><p class="helper">${t.previewNote}</p><div class="table-scroll" tabindex="0" role="region" aria-label="${t.preview}"><table id="preview-table"></table></div>
          <div class="export"><div><p>${t.savedAs}</p><small>${t.note}</small></div><button id="save" class="primary">${t.save} <span aria-hidden="true">↓</span></button></div></section>
      </div>
      <section class="steps" aria-label="${t.how}"><div><span>01</span>${t.step1}</div><div><span>02</span>${t.step2}</div><div><span>03</span>${t.step3}</div></section>
      <details><summary>${t.about}</summary><p>${t.aboutText}</p><p>${t.privacyNote}</p></details>
      <footer><span>CSV Keeper · 2026</span><details><summary>${t.source}</summary><p>${t.sourceText}</p><p><a href="https://github.com/zxromxnd/csv-keeper">GitHub</a> · <a href="./source.zip" download>${t.downloadSource}</a> · <a href="./examples/check.csv" download>${language === "uk" ? "Тестовий CSV" : "Test CSV"}</a> · <a href="./third-party-licenses.txt">Third-party licenses</a></p></details></footer>
    </main>`;
  for (const lang of ["uk", "en"] as Language[])
    $(lang).onclick = () => {
      language = lang;
      render();
      if (file) {
        $("reading-settings").hidden = false;
        $("filename").textContent = file.name;
      }
      if (parsed) showData();
    };
  $("choose").onclick = () => $<HTMLInputElement>("file").click();
  $<HTMLInputElement>("file").onchange = (event) => {
    const selected = (event.target as HTMLInputElement).files?.[0];
    if (selected) void load(selected);
  };
  $("sample").onclick = () => {
    separator = "";
    encoding = "utf-8";
    render();
    void load(
      new File(
        [
          'Product code,Long ID,Name,Quantity,Literal text\r\n001234,12345678901234567890,Кава,12,=1+1\r\n000007,98765432109876543210,"Tea, green",3,+380001112233\r\n004200,10000000000000000001,Notebook,25,03-04\r\n',
        ],
        "example.csv",
        { type: "text/csv" },
      ),
    );
  };
  $("reset").onclick = () => {
    clear();
    $("choose").focus();
  };
  $("cancel").onclick = () => {
    clear();
    status(words[language].cancelled);
    $("choose").focus();
  };
  const dropzone = $("dropzone");
  dropzone.ondragover = (event) => {
    event.preventDefault();
    if (!busy) dropzone.classList.add("drag");
  };
  dropzone.ondragleave = () => dropzone.classList.remove("drag");
  dropzone.ondrop = (event) => {
    event.preventDefault();
    dropzone.classList.remove("drag");
    if (!busy && event.dataTransfer?.files[0])
      void load(event.dataTransfer.files[0]);
  };
  $<HTMLSelectElement>("delimiter").value = separator;
  $<HTMLSelectElement>("encoding").value = encoding;
  $("delimiter").onchange = (event) => {
    separator = (event.target as HTMLSelectElement).value;
    if (file) void load(file);
  };
  $("encoding").onchange = (event) => {
    encoding = (event.target as HTMLSelectElement).value;
    if (file) void load(file);
  };
  $<HTMLInputElement>("header").checked = hasHeader;
  $("header").onchange = (event) => {
    hasHeader = (event.target as HTMLInputElement).checked;
    showData();
  };
  $("save").onclick = () => {
    if (!parsed || !worker || busy) return;
    setBusy(true);
    status(t.writing);
    deadline();
    worker.postMessage({ type: "export", modes, header: hasHeader });
  };
}
render();
