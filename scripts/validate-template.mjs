import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  "package.json",
  "docs/infrastructure.md",
  ".github/workflows/ci.yml",
  "api/README.md",
  "app/README.md",
  "infrastructure/README.md",
  "packages/README.md",
  "tests/README.md"
];

const forbiddenTerms = [
  "l-gevity-skills",
  "A.L.C.H.E.M.Y.",
  "alchemy-overview"
];

for (const relativePath of requiredPaths) {
  await access(path.join(root, relativePath));
}

const readme = await readFile(path.join(root, "README.md"), "utf8");
const infrastructure = await readFile(path.join(root, "docs/infrastructure.md"), "utf8");
const combined = `${readme}\n${infrastructure}`;

const leakedTerms = forbiddenTerms.filter((term) => combined.includes(term));
if (leakedTerms.length > 0) {
  throw new Error(`Template contains source-project terms: ${leakedTerms.join(", ")}`);
}

console.log("Template structure validated.");
