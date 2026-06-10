import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

console.log("Cleaned dist/.");
