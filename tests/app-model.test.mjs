import assert from "node:assert/strict";
import test from "node:test";

import { formatAppStatus } from "../dist/ts/businesslogic/index.js";

test("formatAppStatus renders the app name and environment", () => {
  assert.equal(
    formatAppStatus({ name: "swa-template", environment: "acceptance" }),
    "swa-template is running in acceptance."
  );
});
