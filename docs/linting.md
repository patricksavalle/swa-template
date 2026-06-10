# Linting

This template uses ESLint flat config with `eslint-plugin-boundaries`.

## Commands

```text
npm run lint
npm run typecheck
npm run ci
```

## Architecture Files

Architecture rules are declared in `eslint.architecture.mjs` files:

```text
eslint.architecture.mjs
ts/
├── infrastructure/eslint.architecture.mjs
├── businesslogic/eslint.architecture.mjs
└── userinterface/eslint.architecture.mjs
```

The root file defines cross-tier rules. Tier files define local components.

Default rule intent:

- `businesslogic` does not import UI, API, or infrastructure implementations.
- `infrastructure` does not import UI or API entrypoints.
- `api` does not import browser-facing UI code.
- runtime code does not import build or release scripts.
