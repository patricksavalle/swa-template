import { formatAppStatus } from "../businesslogic/index.js";
import { readRuntimeStatus } from "../infrastructure/index.js";

const statusElement = document.querySelector("#app-status");

if (statusElement) {
  statusElement.textContent = formatAppStatus(readRuntimeStatus());
}
