import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import js from "@eslint/js";
import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";

const root = import.meta.dirname;

function findFilesByName(directory, filename) {
  const ignored = new Set([".git", ".swa", "dist", "node_modules", "coverage"]);
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignored.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...findFilesByName(fullPath, filename));
      continue;
    }

    if (entry.name === filename) {
      files.push(fullPath);
    }
  }

  return files;
}

const architectureFiles = findFilesByName(root, "eslint.architecture.mjs")
  .sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);

const architectureModules = await Promise.all(
  architectureFiles.map((file) => import(pathToFileURL(file).href))
);

const architectureComponents = architectureModules.flatMap(
  (module) => module.default.components ?? []
);
const architectureForbidden = architectureModules.flatMap(
  (module) => module.default.forbidden ?? []
);
const componentNames = architectureComponents.map((component) => component.name);

function resolveComponentNames(spec) {
  const specs = Array.isArray(spec) ? spec : [spec];

  return specs.flatMap((entry) => {
    if (entry === "*") {
      return componentNames;
    }

    if (typeof entry === "string" && entry.endsWith("*")) {
      const prefix = entry.slice(0, -1);
      return componentNames.filter((name) => name.startsWith(prefix));
    }

    return entry;
  });
}

function expand(spec, except) {
  if (spec && typeof spec === "object" && !Array.isArray(spec)) {
    return spec;
  }

  const exceptNames = except ? new Set(resolveComponentNames(except)) : new Set();
  const names = resolveComponentNames(spec).filter((name) => !exceptNames.has(name));

  return { type: names.length === 1 ? names[0] : names };
}

const boundaryElements = architectureComponents.map((component) => ({
  type: component.name,
  pattern: component.pattern,
  ...(component.mode ? { mode: component.mode } : {}),
  ...(component.capture ? { capture: component.capture } : {})
}));

const boundaryRules = architectureForbidden.map((edge) => ({
  from: expand(edge.from, edge.except),
  disallow: { to: expand(edge.to, edge.except_to) },
  message: edge.why
}));

const sharedGlobals = {
  console: "readonly",
  process: "readonly",
  Buffer: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  fetch: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly"
};

export default [
  {
    ignores: ["**/dist/**", "node_modules/**", "coverage/**", ".swa/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: sharedGlobals
    },
    rules: {
      "no-console": "off"
    }
  },
  {
    files: ["api/**/*.{js,ts,mjs}", "ts/**/*.{js,ts,mjs}", "tests/**/*.{js,ts,mjs}"],
    plugins: {
      boundaries
    },
    settings: {
      "boundaries/elements": boundaryElements
    },
    rules: {
      "boundaries/dependencies": ["error", { default: "allow", rules: boundaryRules }]
    }
  }
];
