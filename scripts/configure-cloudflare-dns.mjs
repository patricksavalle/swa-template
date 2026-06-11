#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const apiBase = "https://api.cloudflare.com/client/v4";
const args = parseArgs(process.argv.slice(2));
const token = process.env.CLOUDFLARE_API_TOKEN;

if (!token) {
  fail("CLOUDFLARE_API_TOKEN is required. Use a short-lived token scoped to Zone:Read and DNS:Edit for this zone.");
}

const zoneName = requiredArg(args, "zone");
const productionHostname = requiredArg(args, "production-host");
const acceptanceHostname = requiredArg(args, "acceptance-host");
const proxied = args.proxied === "true" || args.proxied === true;
const dryRun = args["dry-run"] === "true" || args["dry-run"] === true;
const evidenceFile = args["evidence-file"];

if (evidenceFile === true) {
  fail("--evidence-file requires a file path.");
}

if (evidenceFile && !dryRun) {
  fail("--evidence-file is only supported with --dry-run.");
}

await verifyToken();
const zone = await getZone(zoneName);

const records = [
  {
    type: "CNAME",
    name: zoneName,
    content: productionHostname,
    proxied,
    comment: "Production apex for Azure Static Web Apps"
  },
  {
    type: "CNAME",
    name: `www.${zoneName}`,
    content: productionHostname,
    proxied,
    comment: "Production www for Azure Static Web Apps"
  },
  {
    type: "CNAME",
    name: `acceptance.${zoneName}`,
    content: acceptanceHostname,
    proxied,
    comment: "Acceptance for Azure Static Web Apps"
  }
];

const evidenceRecords = [];
for (const record of records) {
  evidenceRecords.push(await upsertRecord(zone.id, record));
}

if (evidenceFile) {
  const evidencePath = resolve(evidenceFile);
  await mkdir(dirname(evidencePath), { recursive: true });
  await writeFile(
    evidencePath,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      zone: zoneName,
      dryRun,
      proxied,
      records: evidenceRecords
    }, null, 2)}\n`,
    "utf8"
  );
  console.log(`Wrote DNS dry-run evidence to ${evidencePath}`);
}

async function verifyToken() {
  const result = await cloudflareFetch("/user/tokens/verify");
  if (result.status !== "active") {
    fail(`Cloudflare token is not active. Status: ${result.status ?? "unknown"}`);
  }
}

async function getZone(name) {
  const result = await cloudflareFetch(`/zones?name=${encodeURIComponent(name)}`);
  if (result.length !== 1) {
    fail(`Expected exactly one Cloudflare zone for ${name}; found ${result.length}.`);
  }
  return result[0];
}

async function upsertRecord(zoneId, record) {
  const existing = await cloudflareFetch(
    `/zones/${zoneId}/dns_records?type=${record.type}&name=${encodeURIComponent(record.name)}`
  );

  const payload = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: 1,
    proxied: record.proxied,
    comment: record.comment
  };

  if (dryRun) {
    const action = existing.length > 0 ? "update" : "create";
    console.log(`[dry-run] ${action} ${record.type} ${record.name} -> ${record.content}`);
    return {
      ...record,
      action
    };
  }

  if (existing.length > 0) {
    await cloudflareFetch(`/zones/${zoneId}/dns_records/${existing[0].id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    console.log(`Updated ${record.type} ${record.name} -> ${record.content}`);
    return {
      ...record,
      action: "update"
    };
  }

  await cloudflareFetch(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  console.log(`Created ${record.type} ${record.name} -> ${record.content}`);
  return {
    ...record,
    action: "create"
  };
}

async function cloudflareFetch(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    const messages = (data.errors ?? []).map((error) => error.message).join("; ");
    fail(`Cloudflare API request failed: ${messages || response.statusText}`);
  }
  return data.result;
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) {
      fail(`Unexpected argument: ${arg}`);
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

function requiredArg(argsMap, name) {
  const value = argsMap[name];
  if (!value || value === true) {
    fail(`--${name} is required.`);
  }
  return value;
}

function fail(message) {
  console.error(`[configure-cloudflare-dns] ${message}`);
  process.exit(1);
}
