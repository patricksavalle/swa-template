import { readFile } from "node:fs/promises";
import path from "node:path";

const infrastructure = await readFile(
  path.join(process.cwd(), "docs/infrastructure.md"),
  "utf8"
);

const requiredSections = [
  "## Target Shape",
  "## Environments",
  "## Resource Inventory",
  "## Deployment Principles",
  "## Open Decisions"
];

const missing = requiredSections.filter((section) => !infrastructure.includes(section));
if (missing.length > 0) {
  throw new Error(`Infrastructure document missing sections: ${missing.join(", ")}`);
}

console.log("Placeholder tests passed.");
