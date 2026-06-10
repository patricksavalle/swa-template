# TypeScript

TypeScript source lives in three tiers:

```text
ts/
├── infrastructure/
├── businesslogic/
└── userinterface/
```

- `infrastructure/` adapts external systems, browser APIs, storage, HTTP, and
  platform services.
- `businesslogic/` holds deterministic domain and application decisions.
- `userinterface/` renders screens, components, and interaction flows.

Default dependency direction:

```text
userinterface -> businesslogic -> infrastructure contracts
infrastructure -> businesslogic contracts
```

Do not let business logic depend on concrete UI or platform implementations.
