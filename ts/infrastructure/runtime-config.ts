import type { AppStatus } from "../businesslogic/index.js";

export function readRuntimeStatus(): AppStatus {
  return {
    name: "swa-template",
    environment: "local"
  };
}
