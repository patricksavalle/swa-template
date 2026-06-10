import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import ts from "typescript";

const root = process.cwd();
const apiRoot = path.join(root, "api");
const openApiSourcePath = path.join(apiRoot, "src", "openapi", "document.ts");
const httpMethods = new Set(["get", "put", "post", "patch", "delete", "options", "head", "trace"]);

const openApiDocument = await loadOpenApiDocument(openApiSourcePath);
validateOpenApiShape(openApiDocument);

const functionRoutes = await collectHttpFunctionRoutes(apiRoot);
validateFunctionRoutes(openApiDocument, functionRoutes);
validateHealthContract(openApiDocument);

console.log("API contract validated.");

async function loadOpenApiDocument(filePath) {
  const source = await readFile(filePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true
    },
    fileName: filePath
  });

  const module = { exports: {} };
  const exports = module.exports;
  const evaluate = new Function("exports", "module", transpiled.outputText);
  evaluate(exports, module);

  return module.exports.openApiDocument;
}

function validateOpenApiShape(document) {
  assert(document && typeof document === "object", "OpenAPI document must be an object.");
  assert(document.openapi === "3.1.0", "OpenAPI document must use version 3.1.0.");
  assert(document.info && typeof document.info.title === "string", "OpenAPI info.title is required.");
  assert(document.info && typeof document.info.version === "string", "OpenAPI info.version is required.");
  assert(document.paths && typeof document.paths === "object", "OpenAPI paths object is required.");

  const operationIds = new Set();
  for (const [route, pathItem] of Object.entries(document.paths)) {
    assert(route.startsWith("/api/"), `OpenAPI route must start with /api/: ${route}`);
    assert(pathItem && typeof pathItem === "object", `OpenAPI path item must be an object: ${route}`);

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!httpMethods.has(method)) {
        continue;
      }

      assert(operation && typeof operation === "object", `${method.toUpperCase()} ${route} must be an object.`);
      assert(
        typeof operation.operationId === "string" && operation.operationId.length > 0,
        `${method.toUpperCase()} ${route} must declare operationId.`
      );
      assert(!operationIds.has(operation.operationId), `Duplicate operationId: ${operation.operationId}`);
      operationIds.add(operation.operationId);
      assert(operation.responses && typeof operation.responses === "object", `${operation.operationId} must declare responses.`);
      assert(operation.responses["200"], `${operation.operationId} must declare a 200 response.`);
    }
  }
}

async function collectHttpFunctionRoutes(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const routes = new Map();

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const functionDirectory = path.join(directory, entry.name);
    const functionJsonPath = path.join(functionDirectory, "function.json");
    let definition;

    try {
      definition = JSON.parse(await readFile(functionJsonPath, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") {
        continue;
      }

      throw error;
    }

    const trigger = definition.bindings?.find((binding) => binding.type === "httpTrigger" && binding.direction === "in");
    if (!trigger) {
      continue;
    }

    const route = `/api/${String(trigger.route ?? entry.name).replace(/^\/+|\/+$/g, "")}`;
    const methods = trigger.methods ?? [];
    assert(Array.isArray(methods) && methods.length > 0, `${functionJsonPath} must declare explicit HTTP methods.`);
    validateFunctionSource(apiRoot, definition, functionJsonPath);

    for (const method of methods) {
      const routeKey = `${String(method).toLowerCase()} ${route}`;
      assert(!routes.has(routeKey), `Duplicate Function route: ${routeKey}`);
      routes.set(routeKey, functionJsonPath);
    }
  }

  assert(routes.size > 0, "At least one HTTP Function route must be declared.");
  return routes;
}

function validateFunctionSource(apiDirectory, definition, functionJsonPath) {
  assert(typeof definition.scriptFile === "string", `${functionJsonPath} must declare scriptFile.`);
  assert(typeof definition.entryPoint === "string", `${functionJsonPath} must declare entryPoint.`);

  const sourcePath = path.join(
    apiDirectory,
    definition.scriptFile.replace(/^..\/dist\//, "src/").replace(/\.js$/, ".ts")
  );
  const source = readSourceFileSync(sourcePath);
  assert(
    source.includes(`export async function ${definition.entryPoint}`),
    `${functionJsonPath} entryPoint ${definition.entryPoint} must be exported from ${path.relative(root, sourcePath)}.`
  );
}

function validateFunctionRoutes(document, routes) {
  const documentedRoutes = new Set();

  for (const [route, pathItem] of Object.entries(document.paths)) {
    for (const method of Object.keys(pathItem)) {
      if (httpMethods.has(method)) {
        documentedRoutes.add(`${method} ${route}`);
      }
    }
  }

  for (const route of routes.keys()) {
    assert(documentedRoutes.has(route), `Function route is missing from OpenAPI document: ${route}`);
  }

  for (const route of documentedRoutes) {
    assert(routes.has(route), `OpenAPI route is missing a Function descriptor: ${route}`);
  }
}

function validateHealthContract(document) {
  const healthResponse = document.paths["/api/health"]?.get?.responses?.["200"];
  const jsonResponse = healthResponse?.content?.["application/json"];
  assert(
    jsonResponse?.schema?.$ref === "#/components/schemas/HealthResponse",
    "GET /api/health 200 application/json response must reference HealthResponse."
  );

  const schema = document.components?.schemas?.HealthResponse;
  assert(schema?.type === "object", "HealthResponse must be an object schema.");
  assert(schema.additionalProperties === false, "HealthResponse must reject additional properties.");
  assertArraysEqual(
    schema.required,
    ["ok", "service", "environment", "timestamp"],
    "HealthResponse required properties changed without validator update."
  );
  assert(schema.properties?.ok?.const === true, "HealthResponse.ok must be const true.");
  assert(schema.properties?.service?.type === "string", "HealthResponse.service must be a string.");
  assert(schema.properties?.environment?.type === "string", "HealthResponse.environment must be a string.");
  assert(schema.properties?.timestamp?.format === "date-time", "HealthResponse.timestamp must use date-time format.");
}

function readSourceFileSync(filePath) {
  const source = ts.sys.readFile(filePath);
  assert(source, `Expected source file to exist: ${path.relative(root, filePath)}`);
  return source;
}

function assertArraysEqual(actual, expected, message) {
  assert(Array.isArray(actual), message);
  assert(actual.length === expected.length, message);
  for (const value of expected) {
    assert(actual.includes(value), message);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[validate-api-contract] ${message}`);
  }
}
