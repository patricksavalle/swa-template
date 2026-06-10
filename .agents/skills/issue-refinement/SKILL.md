---
name: issue-refinement
description:
    Playbook for refining raw GitHub issues into structured,
    implementation-ready specs. Use this skill when a team triages and
    normalizes milestone issues for handoff to implementers.
---

# Issue Refinement

This skill defines the process, format, and quality criteria for transforming
raw GitHub issues into implementation-ready specs. It is the canonical reference
for teams that use GitHub issues as implementation contracts.

> **TL;DR / Core Directives**
>
> 1. **Complete Structure**: Every issue MUST have Problem, Acceptance Criteria
>    (AC), Technical Approach, Dependencies, Test Plan, and Complexity.
> 2. **Testable ACs**: Each criterion must be independently verifiable. No vague
>    language.
> 3. **Bidirectional Dependencies**: Blockers and blocked-by must be linked in
>    both issues.
> 4. **Concrete Approach**: Technical approach must reference real files and
>    existing patterns.

## When to use this skill

- When refining a milestone's issues for implementation.
- When reviewing whether an issue is ready for a PR.
- When triaging new issues into the backlog.
- **Out of scope:** This skill governs issue structure and completeness, not
  implementation. For code-level patterns, use the local architecture, API,
  testing, and coding standards.

---

## 1. Refined Issue Format

Every refined issue MUST contain all of the following sections. If the project
has a GitHub issue template, align the headings with that template.

### Problem Statement

- **What** problem does this solve?
- **Why** now: what milestone goal does it serve?
- Must be concrete. Reject vague motivations like "improve developer
  experience" without specific pain points.

### Acceptance Criteria

- Testable checkbox list (`- [ ] ...`)
- Each criterion must be **independently verifiable**: avoid combining multiple
  conditions in one item.
- Use observable outcomes: "the API returns 200 with a JSON body containing
  `{ status: 'ok' }`" not "the API works correctly".
- Include edge cases and error conditions where applicable.

### Technical Approach

- Which **directories or modules** are affected (`api/`, `ts/`, `html/`,
  `css/`, `infrastructure/`, etc.).
- Which **files** to create or modify, using real paths.
- Which **design patterns** to follow, referencing existing implementation
  patterns or project-local skills.
- Key **implementation decisions** and trade-offs.
- Must reference real files and patterns: no hypothetical architectures.

### Dependencies

- **Blocked by**: issues that must complete before this one can start.
- **Blocks**: issues that cannot start until this one completes.
- Dependencies must be **bidirectional**: if #10 blocks #12, then #12 must list
  "blocked by #10" and #10 must list "blocks #12".

### Test Plan

- Testable checkbox list.
- Categories: unit tests, integration tests, manual verification, staging
  checks.
- Must cover the acceptance criteria: every criterion needs at least one
  corresponding test plan item.

### Complexity

- **S**: single file, straightforward change (< 100 lines).
- **M**: multi-file, moderate logic (100-500 lines).
- **L**: cross-module, significant design decisions (500+ lines).

---

## 2. Refinement Rules by Issue Type

### Title-only issues

Issues with just a title and no body or a minimal body.

1. **Research the codebase**: search for related files, existing patterns, and
   prior art.
2. **Infer intent** from the title, milestone context, and related issues.
3. **Draft a full spec** following the refined issue format.
4. **Flag ambiguities** when intent is unclear. Do not guess at requirements.
5. Mark assumptions explicitly: _"Assumption: this uses the existing request
   pipeline. Confirm?"_

### Design-doc issues

Issues that contain prose descriptions, design documents, or partial specs.

1. **Extract** acceptance criteria from the prose: convert narrative
   requirements into testable checkboxes.
2. **Identify** the technical approach from any architecture descriptions.
3. **Fill gaps**: design docs often omit test plans, dependencies, and
   complexity. Research the codebase to complete these sections.
4. **Validate** that referenced files, APIs, and patterns still exist.
5. Preserve the original design doc as context but restructure into the
   canonical format.

### Full-plan issues

Issues that already have a structured plan or detailed implementation notes.

1. **Validate completeness**: check that all six sections are present and
   filled.
2. **Check for stale references**: do the files, APIs, and patterns mentioned
   still exist?
3. **Tighten acceptance criteria**: ensure each criterion is independently
   testable, not vague.
4. **Verify dependencies**: are declared dependencies still accurate? Are there
   undeclared ones?
5. **Confirm complexity**: does the estimate match the actual scope?

---

## 3. Dependency Mapping Rules

Dependencies arise from:

| Signal | Example |
| --- | --- |
| **Shared files** | Two issues both modify `pipeline.js`: order may matter. |
| **Shared services** | Issue A adds a new service that issue B consumes. |
| **Data model changes** | Issue A changes a schema that issue B reads. |
| **API contracts** | Issue A creates an endpoint that issue B calls. |
| **Build/config changes** | Issue A modifies `eleventy.config.js` affecting issue B's pages. |

### Rules

- Dependencies must be **bidirectional**: update both the blocker and the
  blocked issue.
- **Minimize chains**: prefer parallel work. Only declare a dependency when the
  blocked issue genuinely cannot proceed without the blocker's output.
- **Be specific**: state why the dependency exists.
- When two issues touch the same file but different sections, evaluate whether
  they can be merged or done in parallel with clear boundaries.

---

## 4. Review Criteria

The reviewer checks each refined issue against these criteria:

### Mandatory

- [ ] All six sections present and non-empty.
- [ ] Acceptance criteria are testable with a concrete action and expected
      outcome.
- [ ] No vague language: "should work", "properly handles", and "improved UX"
      are rejected without concrete definitions.
- [ ] Technical approach references real files and patterns that exist in the
      current codebase.
- [ ] Dependencies are bidirectional and checked against the other issues in
      the milestone.
- [ ] Test plan covers every acceptance criterion.
- [ ] Complexity estimate is justified and consistent with the technical
      approach.

### Advisory

- Acceptance criteria could be more granular.
- Technical approach could reference additional existing patterns.
- Test plan could include more edge cases.
- Issue could be split into smaller pieces.

### Feedback Format

```markdown
## Review: #<issue-number> - <title>

### MUST FIX
- [ ] AC #3 is not testable: "works correctly" -> specify expected output.
- [ ] Technical approach references `old-pipeline.js`, which was renamed to `pipeline.js`.

### SUGGESTIONS
- Consider adding an AC for the error case when the API returns 404.
- Complexity could be S instead of M: only one file changes.
```

---

## 5. Cross-References

Consult these skills when refining issues in their domains:

| Domain | SKILL | When |
| --- | --- | --- |
| Architecture | `architecture-guidelines` | When evaluating technical approach against project principles. |
| Dependency rules | `architecture-as-code` | When the issue adds or changes module boundaries. |
| Request flow | `request-to-response-pipeline` | When the issue spans browser, API, auth, and storage. |
| REST API | `rest-api-review` | When the issue changes API contracts. |
| Accessibility | `accessibility-audit` | When the issue affects UI behavior or markup. |
