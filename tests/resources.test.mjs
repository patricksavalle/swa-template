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
  CIAM_CLIENT_ID: "00000000-0000-0000-0000-000000000000",
  CIAM_TENANT_ID: "11111111-1111-1111-1111-111111111111",
  CIAM_TENANT_NAME: "example-ciam"
};

test("resources returns no-store Azure resource metadata without secrets", async () => {
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
    assert.equal(body.resources[0].name, "swa-swa-template-acc");
    assert.deepEqual(body.resources[1].settings.containerNames, ["items"]);
    assert.equal(body.resources[4].settings.tenantName, "example-ciam");
    assert.equal(JSON.stringify(body).includes("secret"), false);
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
