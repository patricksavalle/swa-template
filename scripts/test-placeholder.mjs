import { readFile } from "node:fs/promises";
import path from "node:path";

const infrastructure = await readFile(
  path.join(process.cwd(), "INFRASTRUCTURE.md"),
  "utf8"
);

const requiredSections = [
  "## Infrastructure Hierarchy",
  "## Project Structure",
  "## Environments",
  "## Azure Resources",
  "## GitHub Environments",
  "## GitHub Workflows",
  "## Seed Settings",
  "## Manual Verification",
  "## Known Limitations"
];

const missing = requiredSections.filter((section) => !infrastructure.includes(section));
if (missing.length > 0) {
  throw new Error(`Infrastructure document missing sections: ${missing.join(", ")}`);
}

console.log("Placeholder tests passed.");
