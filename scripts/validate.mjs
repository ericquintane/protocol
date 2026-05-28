import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

const schemaPath = join(root, "schema", "protocol.schema.json");

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  strictRequired: false,
  allowUnionTypes: true
});
addFormats(ajv);

const schema = JSON.parse(await readFile(schemaPath, "utf8"));
const validate = ajv.compile(schema);

async function checkDir(dir, label, expectValid) {
  console.log(`\n${label}`);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  let allCorrect = true;
  for (const f of files) {
    const data = JSON.parse(await readFile(join(dir, f), "utf8"));
    const valid = validate(data);
    const correct = valid === expectValid;
    if (correct) {
      const marker = expectValid ? "OK  " : "OK  (rejected as expected)";
      console.log(`  ${marker} ${basename(f)}`);
    } else {
      allCorrect = false;
      const marker = expectValid ? "FAIL" : "FAIL (should have been rejected)";
      console.log(`  ${marker} ${basename(f)}`);
      if (validate.errors) {
        for (const err of validate.errors) {
          console.log(`        ${err.instancePath || "(root)"}  ${err.message}`);
        }
      }
    }
  }
  return allCorrect;
}

const validOk = await checkDir(join(root, "examples"), "valid examples (must pass)", true);
const invalidOk = await checkDir(join(root, "tests", "invalid"), "invalid fixtures (must fail)", false);

console.log();
process.exit(validOk && invalidOk ? 0 : 1);
