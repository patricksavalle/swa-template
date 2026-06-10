import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const testRoot = path.join(root, "tests");

async function collectTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectTestFiles(fullPath));
      continue;
    }

    if (/\.test\.mjs$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

const testFiles = (await collectTestFiles(testRoot)).sort();
if (testFiles.length === 0) {
  throw new Error("No test files found.");
}

const child = spawn(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
