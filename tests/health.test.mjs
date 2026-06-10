import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { health } = require("../api/dist/health/index.js");

test("health returns a no-store JSON response with environment context", async () => {
  const previousEnvironment = process.env.APP_ENV;
  process.env.APP_ENV = "acceptance";

  try {
    const logEntries = [];
    const response = await health(
      { log: (...messages) => logEntries.push(messages) },
      { method: "GET" }
    );
    const body = JSON.parse(response.body);

    assert.equal(response.status, 200);
    assert.equal(response.headers["Content-Type"], "application/json");
    assert.equal(response.headers["Cache-Control"], "no-store");
    assert.equal(body.ok, true);
    assert.equal(body.service, "swa-template-api");
    assert.equal(body.environment, "acceptance");
    assert.match(body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(logEntries.length, 1);
    assert.equal(logEntries[0][0], "health check completed");
    assert.equal(logEntries[0][1].outcome, "ok");
  } finally {
    if (previousEnvironment === undefined) {
      delete process.env.APP_ENV;
    } else {
      process.env.APP_ENV = previousEnvironment;
    }
  }
});
