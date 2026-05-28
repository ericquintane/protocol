import { readdir, mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appRoot = join(__dirname, "..");
const repoRoot = join(appRoot, "..");

await mkdir(join(appRoot, "public", "examples"), { recursive: true });
await mkdir(join(appRoot, "public", "schema"), { recursive: true });

const examplesSrc = join(repoRoot, "examples");
for (const name of await readdir(examplesSrc)) {
  if (name.endsWith(".json")) {
    await copyFile(join(examplesSrc, name), join(appRoot, "public", "examples", name));
  }
}

await copyFile(
  join(repoRoot, "schema", "protocol.schema.json"),
  join(appRoot, "public", "schema", "protocol.schema.json")
);

console.log("Synced examples and schema into app/public/");
