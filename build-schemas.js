import $RefParser from "@apidevtools/json-schema-ref-parser";
import fs from "fs";
import path from "path";

const SRC_ROOT = "catalog";
const DIST_ROOT = "build";

async function buildSchema(inputPath, outputPath) {
  // dereference for example "$ref": "./collection-schema.json"
  const dereferenced = await $RefParser.dereference(inputPath);
  const normalized = normalizeSchema(dereferenced);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2));
}

/**
 * Fully normalize a schema:
 * - flatten allOf transitively also within anyOf
 * - merge object properties & required in allOf branches
 * - recurse into children
 */
function normalizeSchema(schema) {
  if (!schema || typeof schema !== "object") return schema;

  // 1️⃣ Flatten allOf at this level
  if (schema.allOf) {
    schema = flattenAllOf(schema);
  }

  // 2️⃣ Normalize anyOf branches
  if (schema.anyOf) {
    schema.anyOf = schema.anyOf.map(sub => normalizeSchema(sub));
  }

  // 3️⃣ Normalize oneOf branches
  if (schema.oneOf) {
    schema.oneOf = schema.oneOf.map(sub => normalizeSchema(sub));
  }

  // 4️⃣ Recurse into object structure
  if (schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      schema.properties[key] = normalizeSchema(schema.properties[key]);
    }
  }

  if (schema.items) {
    schema.items = normalizeSchema(schema.items);
  }

  if (schema.definitions) {
    for (const key of Object.keys(schema.definitions)) {
      schema.definitions[key] = normalizeSchema(schema.definitions[key]);
    }
  }

  if (schema.$defs) {
    for (const key of Object.keys(schema.$defs)) {
      schema.$defs[key] = normalizeSchema(schema.$defs[key]);
    }
  }

  return schema;
}

/**
 * Merge allOf branches into a single object schema
 */
function flattenAllOf(schema) {
  const merged = {
    ...schema,
    properties: {},
    required: [],
  };

  for (const sub of schema.allOf) {
    const resolvedSub = normalizeSchema(sub);

    if (resolvedSub.properties) {
      Object.assign(merged.properties, resolvedSub.properties);
    }

    if (Array.isArray(resolvedSub.required)) {
      merged.required.push(...resolvedSub.required);
    }
  }

  delete merged.allOf;

  if (merged.required.length > 0) {
    merged.required = [...new Set(merged.required)];
  } else {
    delete merged.required;
  }

  return merged;
}

async function buildAllSchemas() {
  const files = fs.readdirSync(SRC_ROOT);

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const inputPath = path.join(SRC_ROOT, file);
    // to keep the same pages structure catalog/schema.json for backwards compatibility of all data editors
    const outputPath = path.join(DIST_ROOT, SRC_ROOT, file);

    console.log(`Building ${file}`);
    await buildSchema(inputPath, outputPath);
  }
}

await buildAllSchemas();
