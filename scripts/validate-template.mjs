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
  ".agents/skills/architecture-guidelines/SKILL.md",
  "css/README.md",
  "html/README.md",
  "img/README.md",
  "ts/README.md",
  "ts/infrastructure/README.md",
  "ts/businesslogic/README.md",
  "ts/userinterface/README.md",
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
