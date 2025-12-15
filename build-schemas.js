import $RefParser from "@apidevtools/json-schema-ref-parser";
import fs from "fs";
import path from "path";

const SRC_ROOT = "catalog";
const DIST_ROOT = "build";

async function buildSchema(inputPath, outputPath) {
  const dereferenced = await $RefParser.dereference(inputPath);
  const merged = mergeAllOf(dereferenced);

  merged.additionalProperties = false;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
}

function mergeAllOf(schema) {
  if (!schema.allOf) return schema;

  const merged = {
    ...schema,
    properties: {},
    required: []
  };

  for (const sub of schema.allOf) {
    if (sub.properties) {
      Object.assign(merged.properties, sub.properties);
    }
    if (sub.required) {
      merged.required.push(...sub.required);
    }
  }

  delete merged.allOf;
  merged.required = [...new Set(merged.required)];

  return merged;
}

async function buildAllSchemas() {
  const files = fs.readdirSync(SRC_ROOT);

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const inputPath = path.join(SRC_ROOT, file);
    const outputPath = path.join(DIST_ROOT, file);

    console.log(`Building ${file}`);
    await buildSchema(inputPath, outputPath);
  }
}

await buildAllSchemas();
