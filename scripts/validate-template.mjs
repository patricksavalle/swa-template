import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  ".nvmrc",
  ".node-version",
  "package.json",
  ".eleventyignore",
  "eleventy.config.js",
  "eslint.config.js",
  "eslint.architecture.mjs",
  "swa-cli.config.json",
  "tsconfig.json",
  "INFRASTRUCTURE.md",
  ".agents/workflows/new-project-onboarding.md",
  "docs/architecture.md",
  "docs/decisions/0001-template-boundaries.md",
  "docs/decisions/0002-stack-baseline.md",
  "docs/skills.md",
  "docs/seed-secrets.md",
  "infrastructure/main.bicep",
  "infrastructure/environments/acceptance.bicepparam",
  "infrastructure/environments/production.bicepparam",
  ".htmlhintrc",
  "scripts/clean-dist.mjs",
  "scripts/run-tests.mjs",
  "scripts/validate-template.mjs",
  "scripts/validate-swa-config.mjs",
  "scripts/configure-cloudflare-dns.mjs",
  ".github/actions/resolve-azure-names/action.yml",
  ".github/config/staticwebapp.schema.json",
  ".github/workflows/ci.yml",
  ".github/workflows/deploy-static-web-app.yml",
  ".github/workflows/provision-azure.yml",
  ".github/workflows/seed-azure-app-settings.yml",
  ".agents/skills/architecture-guidelines/SKILL.md",
  "api/package.json",
  "api/host.json",
  "api/tsconfig.json",
  "api/health/function.json",
  "api/src/health/index.ts",
  "api/README.md",
  "css/README.md",
  "css/tailwind.css",
  "css/site.css",
  "html/README.md",
  "html/_includes/components/feature-card.html",
  "html/_includes/components/infrastructure-graph.html",
  "html/index.html",
  "img/README.md",
  "ts/README.md",
  "ts/infrastructure/README.md",
  "ts/infrastructure/eslint.architecture.mjs",
  "ts/businesslogic/README.md",
  "ts/businesslogic/eslint.architecture.mjs",
  "ts/userinterface/README.md",
  "ts/userinterface/eslint.architecture.mjs",
  "tests/app-model.test.mjs",
  "tests/health.test.mjs",
  "tests/README.md"
];

const expectedSkills = [
  "accessibility-audit",
  "architecture-as-code",
  "architecture-as-code-javascript",
  "architecture-as-code-python",
  "architecture-guidelines",
  "ci-cd-reliability-architecture",
  "continuous-improvement",
  "deep-research",
  "defect-shift-left",
  "design-and-refactor",
  "eslint-fix-protocol",
  "functionality-complexity-tradeoff",
  "gdpr-dsgvo-expert",
  "geometric-architecture",
  "issue-refinement",
  "observability-protocol",
  "release-management",
  "request-to-response-pipeline",
  "rest-api-review",
  "skill-creation",
  "structural-simplification",
  "technical-design",
  "swa-authenticate",
  "whitepapers",
  "system-optimization"
];

const forbiddenTerms = [
  ["A", "L", "C", "H", "E", "M", "Y", ""].join("."),
  ["alchemy", "overview"].join("-"),
  ["L", "GEVITY"].join("-"),
  ["l", "gevity"].join("-"),
  ["lg", "evity"].join(""),
  ["bio", "metric"].join(""),
  ["bio", "metrics"].join(""),
  ["eu", "di"].join(""),
  ["wal", "let"].join(""),
  ["verifiable", "credential"].join(" ")
];

const allowedReferences = [
  "https://github.com/l-gevity/l-gevity-skills"
];

for (const relativePath of requiredPaths) {
  await access(path.join(root, relativePath));
}

const skillRoot = path.join(root, ".agents", "skills");
const skillDirectories = await readdir(skillRoot, { withFileTypes: true });
const actualSkills = skillDirectories
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const missingSkills = expectedSkills.filter((skill) => !actualSkills.includes(skill));
if (missingSkills.length > 0) {
  throw new Error(`Missing expected skills: ${missingSkills.join(", ")}`);
}

for (const skill of actualSkills) {
  await access(path.join(skillRoot, skill, "SKILL.md"));
}

const plainJavascriptSourceRoots = ["api/src", "ts"];
const allowedPlainJavascriptSourceFiles = new Set(["eslint.architecture.mjs"]);

async function collectPlainJavascriptSources(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectPlainJavascriptSources(fullPath));
      continue;
    }

    const isPlainJavascript = /\.(mjs|js)$/i.test(entry.name);
    if (isPlainJavascript && !allowedPlainJavascriptSourceFiles.has(entry.name)) {
      files.push(path.relative(root, fullPath));
    }
  }

  return files;
}

const plainJavascriptSources = [];
for (const sourceRoot of plainJavascriptSourceRoots) {
  plainJavascriptSources.push(
    ...await collectPlainJavascriptSources(path.join(root, sourceRoot))
  );
}

if (plainJavascriptSources.length > 0) {
  throw new Error(
    `Application and API source must be TypeScript. Plain JavaScript files found: ${plainJavascriptSources.join(", ")}`
  );
}

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist") {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await collectTextFiles(fullPath));
      continue;
    }

    if (/\.(md|json|yml|yaml|mjs|js|ts|html|css|ps1|sh|txt|bicep|bicepparam)$/i.test(entry.name) || entry.name === "AGENTS.md") {
      files.push(fullPath);
    }
  }

  return files;
}

const textFiles = await collectTextFiles(root);
const combinedParts = [];
for (const file of textFiles) {
  combinedParts.push(await readFile(file, "utf8"));
}

let combined = combinedParts.join("\n");
for (const reference of allowedReferences) {
  combined = combined.replaceAll(reference, "");
}

const leakedTerms = forbiddenTerms.filter((term) => combined.includes(term));
if (leakedTerms.length > 0) {
  throw new Error(`Template contains source-project terms: ${leakedTerms.join(", ")}`);
}

console.log("Template structure validated.");
