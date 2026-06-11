#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const failures = [];
const warnings = [];

const requiredCommands = [
  ["git", ["--version"]],
  ["node", ["--version"]],
  ["npm", ["--version"]],
  ["gh", ["--version"]],
  ["az", ["version"]],
  ["az", ["bicep", "version"]]
];

const optionalCommands = [
  ["swa", ["--version"]],
  ["wrangler", ["--version"]]
];

for (const [command, commandArgs] of requiredCommands) {
  await runCheck(`Required tool available: ${command} ${commandArgs.join(" ")}`, async () => {
    await execFileAsync(command, commandArgs);
  });
}

for (const [command, commandArgs] of optionalCommands) {
  await runWarningCheck(`Optional tool available: ${command} ${commandArgs.join(" ")}`, async () => {
    await execFileAsync(command, commandArgs);
  });
}

await runCheck("GitHub CLI is authenticated", async () => {
  await execFileAsync("gh", ["auth", "status"]);
});

await runCheck("Azure CLI has an active account", async () => {
  await execFileAsync("az", ["account", "show"]);
});

if (!args["skip-github-environments"]) {
  await runCheck("GitHub environments and secret names are configured", async () => {
    const scriptPath = path.join(root, "scripts", "verify-github-environments.mjs");
    const repoArgs = args.repo ? ["--repo", args.repo] : [];
    await execFileAsync(process.execPath, [scriptPath, ...repoArgs], {
      cwd: root,
      maxBuffer: 1024 * 1024
    });
  });
}

if (args["dns-evidence"]) {
  await runCheck("Cloudflare DNS dry-run evidence is valid", async () => {
    const evidence = JSON.parse(await readFile(path.resolve(String(args["dns-evidence"])), "utf8"));
    if (evidence.dryRun !== true) {
      throw new Error("Evidence must come from a dry run.");
    }

    if (!Array.isArray(evidence.records) || evidence.records.length < 3) {
      throw new Error("Evidence must include the planned apex, www, and acceptance DNS records.");
    }

    for (const record of evidence.records) {
      if (!record.type || !record.name || !record.content || !record.action) {
        throw new Error("Each DNS evidence record must include type, name, content, and action.");
      }
    }
  });
} else {
  warnings.push("Cloudflare DNS evidence was not checked. Pass --dns-evidence <file> after a DNS dry run.");
}

await runCheck("Template CI command is available", async () => {
  await access(path.join(root, "package.json"));
});

for (const warning of warnings) {
  console.warn(`[warn] ${warning}`);
}

if (failures.length > 0) {
  console.error("Onboarding verification failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Onboarding verification passed.");

async function runCheck(label, check) {
  try {
    await check();
    console.log(`[ok] ${label}`);
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
    console.error(`[fail] ${label}`);
  }
}

async function runWarningCheck(label, check) {
  try {
    await check();
    console.log(`[ok] ${label}`);
  } catch (error) {
    warnings.push(`${label}: ${error.message}`);
    console.warn(`[warn] ${label}`);
  }
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const next = rawArgs[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }
  return parsed;
}
