import type { AppStatus } from "../businesslogic";

export function readRuntimeStatus(): AppStatus {
  return {
    name: "swa-template",
    environment: "local"
  };
}
