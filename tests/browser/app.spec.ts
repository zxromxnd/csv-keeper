import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";

test("sample exports real XLSX under production CSP without data requests", async ({
  page,
}) => {
  const errors: string[] = [];
  const outbound: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (req) => {
    if (
      !req.url().startsWith("http://127.0.0.1:4173/") ||
      ["POST", "PUT"].includes(req.method())
    )
      outbound.push(req.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.locator("#preview-table")).toContainText("001234");
  await page.locator("#mode-0").selectOption("number");
  await expect(page.locator("#save")).toBeDisabled();
  await expect(page.locator("#issue-0")).toContainText("Row: 2");
  await page.locator("#mode-0").selectOption("text");
  await page.locator("#mode-3").selectOption("number");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Excel" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("example-preserved.xlsx");
  const data = await readFile((await download.path())!);
  const zip = unzipSync(data);
  const xml = Object.values(zip)
    .map((bytes) => strFromU8(bytes))
    .join("\n");
  expect(xml).toContain("001234");
  expect(xml).toContain("12345678901234567890");
  expect(xml).not.toMatch(/<f[ >]/);
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.locator("#workspace")).toBeHidden();
  expect(errors).toEqual([]);
  expect(outbound).toEqual([]);
});

test("malformed CSV fails closed and literal HTML is never rendered", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#file").setInputFiles({
    name: "broken.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("a,b\n1,2,3"),
  });
  await expect(page.locator("#status")).toContainText(
    "different column counts",
  );
  await expect(page.locator("#workspace")).toBeHidden();
  await page.locator("#file").setInputFiles({
    name: "literal.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("name,value\n<img src=x onerror=alert(1)>,00123"),
  });
  await expect(page.locator("#preview-table")).toContainText(
    "<img src=x onerror=alert(1)>",
  );
  await expect(page.locator("#preview-table img")).toHaveCount(0);
});

test("mobile layout, language switching and header toggle preserve state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "УКР" }).click();
  await page.getByRole("button", { name: "Спробувати на прикладі" }).click();
  await expect(page.locator("#workspace")).toBeVisible();
  await page.locator("#header").uncheck();
  await expect(page.locator("#preview-table tbody")).toContainText(
    "Product code",
  );
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("#header")).not.toBeChecked();
  await expect(page.locator("#preview-table")).toContainText("001234");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
