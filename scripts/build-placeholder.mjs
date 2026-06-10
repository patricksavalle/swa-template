import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
await mkdir(dist, { recursive: true });

await writeFile(
  path.join(dist, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>swa-template</title>
  </head>
  <body>
    <main>
      <h1>swa-template</h1>
      <p>Replace this placeholder with the selected frontend build output.</p>
    </main>
  </body>
</html>
`,
  "utf8"
);

console.log("Placeholder artifact written to dist/.");
