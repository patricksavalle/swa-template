---
name: accessibility-audit
description:
    Decides which accessibility check belongs at which gate (component unit,
    page integration, deploy preview, release), interprets the different tool
    outputs, and pins the WCAG 2.2 AA target the site commits to. Use when
    adding/auditing a UI component or page, when a PR's accessibility check
    fails, when wiring a new automated accessibility step, or when scoping
    manual review. Semantic-HTML, design-token, and template guidance may live
    in project-local skills or docs; this skill governs only the audit layer.
---

# Accessibility Audit

How the project verifies WCAG 2.2 AA. Three tools, three gates, one target.

> [!IMPORTANT] Automated tools catch ~30–40% of real WCAG violations. The other
> 60% require keyboard testing, screen-reader spot checks, and judgment. Treat a
> green CI as a floor, not a ceiling.

> **TL;DR / Core Directives**
>
> 1. **Target = WCAG 2.2 AA.** Pages can aspire to AAA; nothing ships knowingly
>    below AA. Review every UI PR against AA even when the implementation aims
>    higher.
> 2. **Three layers, three jobs.** `vitest-axe` for component rules in unit
>    tests; `@axe-core/playwright` inside the `visual-review` agent for rendered
>    pages; Lighthouse CI on the PR preview for the holistic score.
> 3. **Failures are bugs, not warnings.** A `serious` or `critical` axe
>    violation blocks the PR. `moderate` is a tracked issue; `minor` is
>    discretionary.
> 4. **Never `aria-` a native element.** If `<button>` works, do not
>    re-implement it with `<div role="button">` + handlers.
> 5. **Declare the page language.** Every page MUST set the correct `lang` on
>    `<html>` and mark mixed-language fragments with their own `lang`.
>    Screen readers depend on this for pronunciation.

---

## 1. When to use this skill

- Adding or modifying any component under `ts/userinterface/`, `html/`, or the
  project-specific component tree.
- Adding/editing pages under `html/` or any static-site page/content tree.
- A CI accessibility check fails — to know which layer reported it and what to
  do.
- Wiring a new automated check or extending an existing one.
- Reviewing a PR for accessibility before merge.

**Out of scope:**

- Semantic HTML rules (heading order, label/input pairing, `<button>` vs `<a>`)
  unless the audit reveals a violation.
- Color-token design decisions, except when a token fails contrast.
- Specific layout or shortcode conventions owned by the application.

---

## 2. The Three Layers

| Layer     | Tool                   | What it catches                                                        | Where it runs                         |
| --------- | ---------------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| **Unit**  | `vitest-axe`           | Per-component aria/role/label violations in isolated DOM.              | Vitest (alongside engine tests).      |
| **Page**  | `@axe-core/playwright` | Whole-page violations: contrast, focus order, landmark structure.      | `visual-review` agent on PR previews. |
| **Score** | `lighthouse-ci`        | Aggregate accessibility score; flags regressions in landmark coverage. | Dedicated workflow on PR previews.    |

> [!WARNING] **Layer overlap is intentional.** Lighthouse runs ~50 axe rules;
> standalone axe runs ~96. Component-level tests catch issues that page-level
> scans cannot localize. Don't dedupe the layers — the cost is cheap, the catch
> rate compounds.

### 2.1 What to assert at each layer

| Layer | Assertion                                                                            |
| ----- | ------------------------------------------------------------------------------------ |
| Unit  | `expect(await axe(element)).toHaveNoViolations()` — zero violations of any severity. |
| Page  | Zero `serious` or `critical` axe violations; `moderate` reported but not blocking.   |
| Score | Accessibility ≥ 0.95 (Lighthouse CI `minScore`).                                     |

---

## 3. Severity Triage

Axe reports four severities. Project policy:

| Severity   | PR action                                                    |
| ---------- | ------------------------------------------------------------ |
| `critical` | **Block merge.** Fix in the PR.                              |
| `serious`  | **Block merge.** Fix in the PR.                              |
| `moderate` | Open a follow-up issue; merge allowed with an inline note.   |
| `minor`    | Discretionary. Track only if it touches a high-traffic page. |

> [!NOTE] Axe occasionally reports `color-contrast` as `serious` on text that is
> intentionally decorative (e.g., watermark backgrounds). If suppressing a rule,
> do it per-element via `data-axe-disabled-rules` with a comment explaining why
> — never globally in axe config.

---

## 4. Manual Spot-Checks (Per PR Touching UI)

Automated tools miss these. Every UI PR description MUST tick:

- [ ] **Keyboard-only navigation** — Tab through every interactive element on
      the changed page. Focus must be visible and follow reading order.
- [ ] **`Esc` closes modals/menus** — Catches custom drawer/popover regressions.
- [ ] **Screen reader announces the page title and first heading** (NVDA or
      VoiceOver, 30 s spot check).
- [ ] **`prefers-reduced-motion`** respected for any new animation or
      auto-advance carousel.
- [ ] **Zoom to 200%** — content reflows; no horizontal scroll on narrow
      viewports.

Five checks. ~3 minutes. Catches more than another layer of tooling would.

---

## 5. Web Component Specifics

Custom elements (`app-*` or project-specific prefixes) inherit no implicit semantics. Reviewers MUST
verify:

- The element either **wraps a native semantic element** (e.g.,
  `app-alert-link` contains an `<a>`) or **explicitly declares `role`** on
  the host.
- Tab order is not broken by `tabindex="-1"` on the host.
- If the component renders a Shadow DOM, internal labels reach the outside world
  via `aria-labelledby` or slotted content — not by reaching into
  `host.shadowRoot` from the page.
- `connectedCallback` does not synchronously focus an element on every render
  (steals focus from keyboard users).

---

## 6. WCAG 2.2 Additions Worth Remembering

WCAG 2.2 added nine criteria over 2.1. Three commonly bite this stack:

| Criterion                           | Practical rule                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| **2.4.11 Focus Not Obscured**       | Sticky headers/footers MUST NOT cover the focused element. Verify on small screens. |
| **2.5.7 Dragging Movements**        | Any drag interaction needs a tap/click alternative. Affects sliders, radar editors. |
| **3.3.8 Accessible Authentication** | Don't gate sign-in behind cognitive tests (math captchas, memory). CIAM is fine.    |

---

## 7. Interpreting a Failure

```
[critical] color-contrast: Element ratio 3.2:1, needs 4.5:1
  selector: .metric-card-label
```

Action sequence:

1. Reproduce on the PR-preview URL.
2. Locate the source — `.metric-card-label` lives in `css/site.css` or a
   component stylesheet.
3. Adjust the **token**, not the local rule. If the token is wrong, fix the
   design token and let the change propagate.
4. Re-run the visual-review check via the agent — do not just trust the local
   diff.

---

## 8. Anti-Patterns

- **Adding `aria-label` to mask a missing native element.** Fix the HTML.
- **Suppressing an axe rule globally** to make CI green.
- **Testing a Web Component in isolation but never on the page that hosts it.**
  Both layers exist for a reason.
- **Manual checks performed only at release time.** They must happen per PR.
- **Treating a Lighthouse score of 100 as proof of accessibility.** It proves
  the automated subset passes; it says nothing about screen readers.
