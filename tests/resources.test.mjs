import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { resources } = require("../api/dist/resources/index.js");

const resourceEnvironment = {
  APP_ENV: "acceptance",
  PROJECT_NAME: "swa-template",
  STATIC_WEB_APP_NAME: "swa-swa-template-acc",
  COSMOS_ACCOUNT_NAME: "cosmos-swa-template-acc",
  COSMOS_ENDPOINT: "https://cosmos-swa-template-acc.documents.azure.com:443/",
  COSMOS_DATABASE_NAME: "app",
  COSMOS_CONTAINER_NAMES: "items",
  LOG_ANALYTICS_WORKSPACE_NAME: "law-swa-template-acc",
  APPLICATION_INSIGHTS_NAME: "appi-swa-template-acc",
  APPLICATIONINSIGHTS_CONNECTION_STRING: "InstrumentationKey=00000000-0000-0000-0000-000000000000",
  CIAM_CLIENT_ID: "00000000-0000-0000-0000-000000000000",
  CIAM_TENANT_ID: "11111111-1111-1111-1111-111111111111",
  CIAM_TENANT_NAME: "example-ciam"
};

test("resources returns no-store Azure resource readiness without identifiers", async () => {
  const previousEnvironment = new Map(
    Object.keys(resourceEnvironment).map((key) => [key, process.env[key]])
  );

  for (const [key, value] of Object.entries(resourceEnvironment)) {
    process.env[key] = value;
  }

  try {
    const logEntries = [];
    const response = await resources(
      { log: (...messages) => logEntries.push(messages) },
      { method: "GET" }
    );
    const body = JSON.parse(response.body);

    assert.equal(response.status, 200);
    assert.equal(response.headers["Content-Type"], "application/json; charset=utf-8");
    assert.equal(response.headers["Cache-Control"], "no-store");
    assert.equal(body.environment, "acceptance");
    assert.equal(body.resources.length, 5);
    assert.deepEqual(
      body.resources.map((resource) => resource.kind),
      [
        "Azure Static Web App",
        "Azure Cosmos DB for NoSQL",
        "Log Analytics workspace",
        "Application Insights",
        "CIAM / Entra External ID app registration"
      ]
    );
    assert.equal(body.resources[0].name, "configured");
    assert.equal(body.resources[0].settings.environment, "acceptance");
    assert.equal(body.resources[1].name, "configured");
    assert.equal(body.resources[1].settings.endpointStatus, "configured");
    assert.equal(body.resources[1].settings.databaseStatus, "configured");
    assert.equal(body.resources[1].settings.containerCount, "1");
    assert.equal("endpoint" in body.resources[1].settings, false);
    assert.equal("databaseName" in body.resources[1].settings, false);
    assert.equal("containerNames" in body.resources[1].settings, false);
    assert.equal(body.resources[3].name, "configured");
    assert.equal(body.resources[3].settings.connectionStatus, "configured");
    assert.equal(body.resources[4].name, "configured");
    assert.equal(body.resources[4].settings.clientStatus, "configured");
    assert.equal(body.resources[4].settings.tenantStatus, "configured");
    assert.equal(JSON.stringify(body).includes("secret"), false);
    for (const rawValue of [
      "swa-swa-template-acc",
      "cosmos-swa-template-acc",
      "cosmos-swa-template-acc.documents.azure.com",
      "items",
      "law-swa-template-acc",
      "appi-swa-template-acc",
      "InstrumentationKey",
      "00000000-0000-0000-0000-000000000000",
      "11111111-1111-1111-1111-111111111111",
      "example-ciam"
    ]) {
      assert.equal(JSON.stringify(body).includes(rawValue), false);
    }
    assert.equal(logEntries.length, 1);
    assert.equal(logEntries[0][0], "azure resources listed");
    assert.equal(logEntries[0][1].outcome, "ok");
    assert.equal(logEntries[0][1].resourceCount, 5);
  } finally {
    for (const [key, value] of previousEnvironment.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});
