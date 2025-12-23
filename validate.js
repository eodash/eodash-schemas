import fs from "fs";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { parse } from "json-source-map";

const SCHEMA_DIR = "./build/catalog";
const DATA_DIR = "../eodashboard-catalog/collections";

const ajv = new Ajv({
  allErrors: true,
  strict: false
});

addFormats(ajv);

// --- preload schemas ---
for (const file of fs.readdirSync(SCHEMA_DIR)) {
  if (!file.endsWith(".json")) continue;
  const schema = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), "utf8"));
  ajv.addSchema(schema, schema.$id);
}

const validate = ajv.getSchema(
  "https://eodash.github.io/eodash-schemas/catalog/eodashboard-collection-schema.json"
);

let hasErrors = false;

for (const file of fs.readdirSync(DATA_DIR)) {
  if (!file.endsWith(".json")) continue;

  const filePath = path.join(DATA_DIR, file);
  const text = fs.readFileSync(filePath, "utf8");

  const { data, pointers } = parse(text);

  const valid = validate(data);

  if (!valid) {
    hasErrors = true;
    console.error(`❌ ${file}`);

    for (const err of validate.errors) {
      const loc = findBestPointer(pointers, err.instancePath);

      const location = loc
        ? `:${loc.line + 1}:${loc.column + 1}`
        : "";

      console.error(
        `  → ${file}${location} ${err.instancePath || "/"} ${err.message}`
      );
    }
  } else {
    console.log(`✅ ${file}`);
  }
}

process.exit(hasErrors ? 1 : 0);

// --- helper ---
function findBestPointer(pointers, instancePath) {
  let path = instancePath || "/";
  while (path.length > 1) {
    if (pointers[path]?.value) return pointers[path].value;
    path = path.replace(/\/[^/]+$/, "");
  }
  return pointers["/"]?.value ?? null;
}
