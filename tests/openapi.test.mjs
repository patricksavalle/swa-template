import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { openApi } = require("../api/dist/openapi/index.js");
const { openApiDocument } = require("../api/dist/openapi/document.js");

test("openapi endpoint returns the source-owned REST contract", async () => {
  const logEntries = [];
  const response = await openApi(
    { log: (...messages) => logEntries.push(messages) },
    { method: "GET" }
  );
  const body = JSON.parse(response.body);

  assert.equal(response.status, 200);
  assert.equal(response.headers["Content-Type"], "application/json; charset=utf-8");
  assert.equal(response.headers["Cache-Control"], "no-store");
  assert.deepEqual(body, openApiDocument);
  assert.equal(body.openapi, "3.1.0");
  assert.equal(body.paths["/api/health"].get.operationId, "getHealth");
  assert.equal(body.paths["/api/resources"].get.operationId, "listAzureResources");
  assert.equal(body.paths["/api/openapi.json"].get.operationId, "getOpenApiDocument");
  assert.equal(
    body.paths["/api/health"].get.responses["200"].content["application/json"].schema.$ref,
    "#/components/schemas/HealthResponse"
  );
  assert.equal(
    body.paths["/api/resources"].get.responses["200"].content["application/json"].schema.$ref,
    "#/components/schemas/AzureResourcesResponse"
  );
  assert.equal(logEntries.length, 1);
  assert.equal(logEntries[0][0], "openapi document served");
  assert.equal(logEntries[0][1].outcome, "ok");
});
