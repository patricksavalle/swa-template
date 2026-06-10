---
name: eslint-fix-protocol
description:
    Safe protocol for fixing ESLint warnings without introducing syntax errors.
    Use when resolving linting issues.
---

# ESLint Fix Protocol

> **TL;DR / Core Directives**
>
> 1. **Never use bulk sed**: NEVER use bulk `sed` replacements for code
>    transformations. They cause syntax errors.
> 2. **Auto-Fix First**: ALWAYS run `npx eslint . --fix` first. It handles most
>    safe fixes natively.
> 3. **Targeted Edits**: For manual fixes, use exact line numbers and tool
>    editing for exact target matching.
> 4. **Verify Build**: ALWAYS run `npm run build` after making ESLint fixes.

## When to use this skill

- When resolving ESLint warnings or errors in the CI or locally.
- **Out of scope:** This is a procedural guide for _fixing_ linting issues, not
  the definition of the coding standard itself (see `coding-standard`).

## Step-by-Step Process

### Step 1: Run Auto-Fix First

```bash
npx eslint . --fix
```

This safely fixes: `prefer-const`, `no-var`, simple `eqeqeq`, `curly`, and
others.

### Step 2: Check Remaining Warnings

```bash
npx eslint . --format json | jq '[.[].messages[]] | group_by(.ruleId) | map({rule: .[0].ruleId, count: length}) | sort_by(-.count)'
```

### Step 3: Fix Remaining Issues Manually

#### For each warning type:

1. **Get exact locations:**
    ```bash
    npx eslint . --format json | jq -r '.[] | .filePath as $f | .messages[] | select(.ruleId == "RULE_NAME") | "\($f):\(.line)"'
    ```
2. **View the exact code** before editing
3. **Make targeted edits** using `replace_file_content` with exact target
   matching

### Step 4: Verify No Syntax Errors

```bash
# Check for parsing errors
npx eslint . --format json | jq '.[] | .messages[] | select(.message | contains("Parsing"))'

# Verify build
npm run build
```

## Handling Specific Rules

### `no-unused-vars` with Interface Parameters

For functions like `calculateHR(value, age, gender)`:

1. **Check if param is used** in the function body
2. **Only prefix with `_`** if the param is truly unused
3. Example: If `age` is used but `gender` isn't →
   `calculateHR(value, age, _gender)`

### `eqeqeq` (== to ===)

**NEVER use:** `sed -i 's/!= null/!== null/g'` (creates `!===`)

**INSTEAD:** Use `npx eslint . --fix` or make targeted single-line edits.

### `no-unsanitized/property`

For trusted innerHTML with template literals:

```javascript
// eslint-disable-next-line no-unsanitized/property -- trusted app data
element.innerHTML = `<div>${value}</div>`;
```

### `no-case-declarations`

Wrap case blocks with braces:

```javascript
case 'example': {
    const value = compute();
    break;
}
```

## What NOT To Do

- ❌ `sed -i 's/pattern/replacement/g' *.js` — Creates syntax errors
- ❌ Prefixing params with `_` without checking if they're used
- ❌ Making changes without verifying build afterwards
- ❌ Editing multiple files in parallel with sed
- ❌ **Using `// eslint-disable-line`** — Code formatters like Prettier move
  these down to their own line during block formatting, rendering them invalid
  and creating phantom errors. **ALWAYS use `// eslint-disable-next-line`**
  before the targeted code instead.
