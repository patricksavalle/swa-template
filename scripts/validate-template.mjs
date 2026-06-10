import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  "package.json",
  ".eleventyignore",
  "eleventy.config.js",
  "eslint.config.js",
  "eslint.architecture.mjs",
  "swa-cli.config.json",
  "tsconfig.json",
  "INFRASTRUCTURE.md",
  "docs/architecture.md",
  "docs/decisions/0001-template-boundaries.md",
  "docs/decisions/0002-stack-baseline.md",
  "docs/skills.md",
  "docs/seed-secrets.md",
  "infrastructure/main.bicep",
  "infrastructure/environments/acceptance.bicepparam",
  "infrastructure/environments/production.bicepparam",
  "scripts/clean-dist.mjs",
  "scripts/validate-template.mjs",
  "scripts/test-placeholder.mjs",
  ".github/workflows/ci.yml",
  ".github/workflows/provision-azure.yml",
  ".github/workflows/seed-azure-app-settings.yml",
  ".agents/skills/architecture-guidelines/SKILL.md",
  "api/README.md",
  "css/README.md",
  "css/site.css",
  "html/README.md",
  "html/index.html",
  "img/README.md",
  "ts/README.md",
  "ts/infrastructure/README.md",
  "ts/infrastructure/eslint.architecture.mjs",
  "ts/businesslogic/README.md",
  "ts/businesslogic/eslint.architecture.mjs",
  "ts/userinterface/README.md",
  "ts/userinterface/eslint.architecture.mjs",
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

    if (/\.(md|json|yml|yaml|mjs|js|ps1|sh|txt|bicep|bicepparam)$/i.test(entry.name) || entry.name === "AGENTS.md") {
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

const combined = combinedParts.join("\n");

const leakedTerms = forbiddenTerms.filter((term) => combined.includes(term));
if (leakedTerms.length > 0) {
  throw new Error(`Template contains source-project terms: ${leakedTerms.join(", ")}`);
}

console.log("Template structure validated.");
