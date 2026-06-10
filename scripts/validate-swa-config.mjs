#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv-draft-04";
import addFormats from "ajv-formats";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = resolve(repoRoot, ".github/config/staticwebapp.schema.json");
const target = process.argv[2];

if (!target) {
  console.error("Usage: node scripts/validate-swa-config.mjs <staticwebapp.config.json>");
  process.exit(2);
}

const targetPath = resolve(target);
const [schemaText, configText] = await Promise.all([
  readFile(schemaPath, "utf8"),
  readFile(targetPath, "utf8")
]);

const schema = JSON.parse(schemaText);
const config = JSON.parse(configText);
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
if (!validate(config)) {
  console.error(`[validate-swa-config] FAIL - ${targetPath}`);
  for (const error of validate.errors ?? []) {
    console.error(`  ${error.instancePath || "(root)"} ${error.message}`);
    if (error.params) {
      console.error(`    params: ${JSON.stringify(error.params)}`);
    }
  }
  process.exit(1);
}

console.log(`[validate-swa-config] OK - ${targetPath}`);
