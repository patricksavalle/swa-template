#!/usr/bin/env node

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const requiredEnvironments = ["acceptance", "production"];
const requiredSecrets = [
  "AZURE_CLIENT_ID",
  "AZURE_TENANT_ID",
  "AZURE_SUBSCRIPTION_ID",
  "CIAM_TENANT_ID",
  "CIAM_TENANT_NAME",
  "CIAM_CLIENT_ID",
  "CIAM_CLIENT_SECRET"
];

const args = parseArgs(process.argv.slice(2));
const repo = args.repo ?? await resolveRepository();
const failures = [];

await runCheck("GitHub CLI authentication", async () => {
  await execFileAsync("gh", ["auth", "status"]);
});

for (const environment of requiredEnvironments) {
  await runCheck(`GitHub environment exists: ${environment}`, async () => {
    await ghApi(`repos/${repo}/environments/${environment}`);
  });

  await runCheck(`GitHub environment secrets exist: ${environment}`, async () => {
    const secretData = await ghApi(`repos/${repo}/environments/${environment}/secrets`);
    const actualSecrets = new Set((secretData.secrets ?? []).map((secret) => secret.name));
    const missingSecrets = requiredSecrets.filter((secret) => !actualSecrets.has(secret));

    if (missingSecrets.length > 0) {
      throw new Error(`Missing secrets: ${missingSecrets.join(", ")}`);
    }
  });
}

if (failures.length > 0) {
  console.error(`GitHub environment verification failed for ${repo}.`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`GitHub environments verified for ${repo}. Secret values were not read.`);

async function resolveRepository() {
  const { stdout } = await execFileAsync("gh", [
    "repo",
    "view",
    "--json",
    "nameWithOwner",
    "--jq",
    ".nameWithOwner"
  ]);
  return stdout.trim();
}

async function ghApi(path) {
  const { stdout } = await execFileAsync("gh", ["api", path]);
  return JSON.parse(stdout);
}

async function runCheck(label, check) {
  try {
    await check();
    console.log(`[ok] ${label}`);
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
    console.error(`[fail] ${label}`);
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
