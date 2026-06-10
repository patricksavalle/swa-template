---
name: swa-authenticate
description: >-
    Authenticate a Playwright browser session against an Azure Static Web Apps
    preview deployment using Entra External ID and an ephemeral Graph-created
    test user. Use for visual review or browser verification of protected SWA
    preview URLs.
---

# SWA Authentication

Authenticate a `playwright-cli` browser session against an Azure Static Web Apps
preview deployment using Entra External ID. Creates an ephemeral test user via
Graph API, signs in through the browser, and cleans up afterwards.

## Parameters

You need these values before starting:

- **Session name**: the playwright-cli session to authenticate (e.g. `pr-99`)
- **Preview URL**: the base URL of the SWA preview deployment

## Step 1: Create Ephemeral Test User

Run the test user creation script to get credentials:

```bash
node --input-type=module -e "
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createTestUser, generatePassword } from './e2e/helpers/entra-test-user.js';
const password = generatePassword();
const user = await createTestUser({
  displayName: 'Visual Review Bot',
  email: 'visual-review-' + Date.now() + '@example.test',
  password,
});
console.log(JSON.stringify({ userId: user.id, email: user.email, password }));
"
```

This requires `ENTRA_GRAPH_TENANT_ID`, `ENTRA_GRAPH_CLIENT_ID`, and
`ENTRA_GRAPH_CLIENT_SECRET` in `.env.local`.

Save the returned `userId`, `email`, and `password` — you need them for login
and cleanup.

**SECURITY**: Never log or output the password value in PR comments or review
results. Only use it in `playwright-cli fill` commands.

## Step 2: Navigate to Login

```
playwright-cli -s=<session> goto <preview-url>/.auth/login/aad
```

Take a snapshot to see the login form:

```
playwright-cli -s=<session> snapshot
```

## Step 3: Complete the Sign-In Flow

The Entra External ID sign-in page may look different from standard Azure AD.
Use the snapshot to identify form fields and buttons, then:

1. Find the email/username input field and fill it with the test user's email
2. Click the "Next" / "Volgende" button
3. Snapshot and find the password field
4. Fill the password field
5. Click the submit button
6. Snapshot and handle any post-login prompts (consent, "stay signed in", etc.)

**Adaptive approach**: Always snapshot after each action. The page structure may
vary — use the snapshot to determine what's on screen and act accordingly. Do
not assume specific selectors exist; find them from the snapshot.

## Step 4: Verify Authentication

Navigate to the auth endpoint:

```
playwright-cli -s=<session> goto <preview-url>/.auth/me
```

Snapshot the result. The page should contain `clientPrincipal` with user
details. If `clientPrincipal` is `null`, authentication failed.

Navigate back to the preview URL so the session is ready for use:

```
playwright-cli -s=<session> goto <preview-url>
```

## Step 5: Cleanup (after review is complete)

Delete the test user after the visual review is done:

```bash
node --input-type=module -e "
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { deleteTestUser } from './e2e/helpers/entra-test-user.js';
await deleteTestUser('<userId>');
"
```

Replace `<userId>` with the ID returned in Step 1. Always clean up, even if
authentication or the review failed.

## Result

After completing the flow:

- **Success**: Continue with authenticated test steps
- **Failure**: Record auth-dependent steps as `SKIPPED — authentication failed`
  and continue with non-auth steps. Still run Step 5 cleanup.

## Error Handling

- If any step times out, retry once before failing
- If the password field never appears after trying all options, fail with
  details
- If the sign-in page shows an error message, capture it via snapshot and report
- NEVER retry with different credentials — report the failure immediately
- ALWAYS run cleanup (Step 5) regardless of success or failure

## Safety Rules

- **NEVER** log, echo, or output passwords in PR comments or review results
- **NEVER** interact with anything outside the login flow
- **ALWAYS** delete the test user when done (Step 5)
- Only navigate to the preview URL domain and Microsoft login domains
