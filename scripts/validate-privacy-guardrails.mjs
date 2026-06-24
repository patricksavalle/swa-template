#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const errors = [];

function fail(message) {
  errors.push(message);
}

function parseCsp(policy) {
  const directives = new Map();

  for (const rawPart of policy.split(";")) {
    const part = rawPart.trim();
    if (!part) {
      continue;
    }

    const [name, ...values] = part.split(/\s+/);
    directives.set(name, values);
  }

  return directives;
}

async function collectFiles(directory, matcher) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath, matcher));
      continue;
    }

    if (matcher(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

const configPath = path.join(root, "staticwebapp.config.json");
const config = JSON.parse(await readFile(configPath, "utf8"));
const headers = config.globalHeaders ?? {};

const requiredHeaders = [
  "Content-Security-Policy",
  "Permissions-Policy",
  "Referrer-Policy",
  "X-Content-Type-Options",
  "X-Frame-Options"
];

for (const header of requiredHeaders) {
  if (typeof headers[header] !== "string" || headers[header].trim().length === 0) {
    fail(`staticwebapp.config.json must define ${header}.`);
  }
}

const csp = parseCsp(headers["Content-Security-Policy"] ?? "");
const requiredCspDirectives = [
  ["default-src", "'self'"],
  ["base-uri", "'self'"],
  ["object-src", "'none'"],
  ["frame-ancestors", "'none'"],
  ["form-action", "'self'"],
  ["script-src", "'self'"],
  ["style-src", "'self'"],
  ["connect-src", "'self'"],
  ["font-src", "'self'"]
];

for (const [directive, requiredValue] of requiredCspDirectives) {
  const values = csp.get(directive);
  if (!values?.includes(requiredValue)) {
    fail(`Content-Security-Policy must include ${directive} ${requiredValue}.`);
  }
}

const permissionsPolicy = headers["Permissions-Policy"] ?? "";
const disabledFeatures = [
  "camera",
  "display-capture",
  "geolocation",
  "gyroscope",
  "microphone",
  "payment",
  "usb"
];

for (const feature of disabledFeatures) {
  if (!permissionsPolicy.includes(`${feature}=()`)) {
    fail(`Permissions-Policy must disable ${feature}.`);
  }
}

const apiSourceFiles = await collectFiles(
  path.join(root, "api", "src"),
  (name) => /\.(ts|js|mjs)$/i.test(name)
);

const forbiddenApiPatterns = [
  {
    pattern: /\bconsole\.(log|info|debug|warn|error)\s*\(/,
    reason: "Use the API logger, not console.*, inside api/src."
  },
  {
    pattern: /JSON\.stringify\s*\(\s*request\b/,
    reason: "Do not serialize whole request objects into logs or responses."
  },
  {
    pattern: /\b(context\.log|logger\.\w+|log\.\w+)\s*\([^)]*\b(request|response)\.(body|json|text|formData|arrayBuffer)\b/s,
    reason: "Do not log request or response payloads."
  },
  {
    pattern: /\b(context\.log|logger\.\w+|log\.\w+)\s*\([^)]*\b(headers?|authorization|cookie)\b/is,
    reason: "Do not log raw headers, authorization values, or cookies."
  },
  {
    pattern: /\b(CIAM_CLIENT_SECRET|COSMOS_CONNECTION_STRING)\b/,
    reason: "API source must not read or expose high-risk secret settings directly."
  }
];

for (const file of apiSourceFiles) {
  const text = await readFile(file, "utf8");
  const relativePath = path.relative(root, file);

  for (const { pattern, reason } of forbiddenApiPatterns) {
    if (pattern.test(text)) {
      fail(`${relativePath}: ${reason}`);
    }
  }
}

if (errors.length > 0) {
  console.error("[validate-privacy-guardrails] FAIL");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log("[validate-privacy-guardrails] OK");
