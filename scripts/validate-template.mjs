import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  "package.json",
  "docs/skills.md",
  "docs/infrastructure.md",
  ".github/workflows/ci.yml",
  "api/README.md",
  "app/README.md",
  "infrastructure/README.md",
  "packages/README.md",
  "skills/architecture-guidelines/SKILL.md",
  "tests/README.md"
];

const expectedSkills = [
  "architecture-as-code",
  "architecture-as-code-javascript",
  "architecture-as-code-python",
  "architecture-guidelines",
  "ci-cd-reliability-architecture",
  "continuous-improvement",
  "defect-shift-left",
  "design-and-refactor",
  "functionality-complexity-tradeoff",
  "geometric-architecture",
  "structural-simplification",
  "system-optimization"
];

const forbiddenTerms = [
  ["L", "GEVITY"].join("-"),
  ["l", "gevity"].join("-"),
  ["l", "gevity", "skills"].join("-"),
  ["A", "L", "C", "H", "E", "M", "Y", ""].join("."),
  ["alchemy", "overview"].join("-")
];

for (const relativePath of requiredPaths) {
  await access(path.join(root, relativePath));
}

const skillDirectories = await readdir(path.join(root, "skills"), { withFileTypes: true });
const actualSkills = skillDirectories
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const missingSkills = expectedSkills.filter((skill) => !actualSkills.includes(skill));
if (missingSkills.length > 0) {
  throw new Error(`Missing expected skills: ${missingSkills.join(", ")}`);
}

for (const skill of actualSkills) {
  await access(path.join(root, "skills", skill, "SKILL.md"));
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

    if (/\.(md|json|yml|yaml|mjs|js|ps1|sh|txt)$/i.test(entry.name) || entry.name === "AGENTS.md") {
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
