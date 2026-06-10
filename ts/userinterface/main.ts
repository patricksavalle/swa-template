import { formatAppStatus } from "../businesslogic";
import { readRuntimeStatus } from "../infrastructure";

const statusElement = document.querySelector("#app-status");

if (statusElement) {
  statusElement.textContent = formatAppStatus(readRuntimeStatus());
}
