import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

const staticCopies = [
  { from: "html", to: "." },
  { from: "css", to: "css" },
  { from: "img", to: "img" }
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const copyJob of staticCopies) {
  const source = path.join(root, copyJob.from);
  const target = path.join(dist, copyJob.to);
  await mkdir(target, { recursive: true });

  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "README.md") {
      continue;
    }

    await cp(path.join(source, entry.name), path.join(target, entry.name), {
      recursive: true
    });
  }
}

console.log("Static assets copied to dist/.");
