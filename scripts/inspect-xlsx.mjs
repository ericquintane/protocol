import xlsx from "xlsx";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");
const sourceDir = join(root, "examples", "source");

const target = process.argv[2];
const files = target
  ? [target]
  : (await readdir(sourceDir)).filter((f) => f.endsWith(".xlsx"));

for (const f of files) {
  console.log(`\n=== ${basename(f)} ===`);
  const wb = xlsx.readFile(join(sourceDir, f));
  for (const sheetName of wb.SheetNames) {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = wb.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: "" });
    for (const row of rows) {
      const cells = row.map((c) => String(c).slice(0, 80).replace(/\s+/g, " ")).join(" | ");
      if (cells.trim()) console.log(cells);
    }
  }
}
