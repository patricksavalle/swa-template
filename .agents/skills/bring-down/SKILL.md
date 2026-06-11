---
name: bring-down
description: >-
    Moves bespoke, duplicated, or over-local code down into reusable
    capabilities outside the immediate implementation: framework-native
    features, approved libraries, internal platform products, managed services, or
    external standards. Use when assessing whether custom code should be
    replaced by a lower-level capability, especially an external library or
    service; when reducing bespoke wrappers around commodity behavior; or when
    designing an improvement roadmap for reuse and platform leverage. Skip
    purely in-codebase componentization or patternization unless the target is
    an approved external library, framework capability, platform product, or
    managed service.
---

# Bring-Down

> **Purpose**: Lower maintenance ownership. Move custom-maintained code toward
> the lowest responsible reusable capability outside the immediate
> implementation.

> **Improvement Trio**
>
> - `defect-shift-left`: move defect detection earlier.
> - `push-out`: move recurring operational work outward.
> - `bring-down`: move bespoke code down into reusable capability.

> **Core Directives**
>
> 1. **Prove maintenance burden before replacement.** Repetition raises
>    priority, but one costly custom implementation can still be worth
>    outsourcing.
> 2. **Bring down to the lowest responsible level.** Stop when the target level
>    absorbs real duplication without hiding necessary variation.
> 3. **Do not platformize uncertainty.** A premature platform multiplies cost.
> 4. **Preserve escape hatches.** Lower-level capability must not block valid
>    local needs.
> 5. **Measure adoption and deletion.** Bring-down succeeds when custom code
>    retires, not when another abstraction exists.
> 6. **Search the current stack first.** Prefer framework-native features,
>    approved libraries, platform products, and already-approved services
>    before surveying the external market.

> **Scope Boundary**
>
> Purely internal moves from local code to shared modules, components,
> templates, or architecture patterns belong to the architecture skills. Use
> `bring-down` for those levels only when the move consumes an external or
> platform capability, such as a framework feature, approved third-party
> library, internal self-service platform product, or managed service.

---

## 1. Bring-Down Scale

The scale measures maintenance ownership: high means custom-maintained in this
codebase; low means responsibility has moved to an approved library, standard,
internal platform product, or external service.

| Level | Acronym | Name | Code lives as | Evidence |
| ----- | ------- | ---- | ------------- | -------- |
| **L4** | **CODE** | Custom code | Local implementation maintained by this codebase/team | Bespoke logic, wrappers, scripts, or repeated copies |
| **L3** | **LIB** | Library/framework | Approved package, framework/library API, or shared capability | Consumers import/call one maintained implementation |
| **L2** | **STD** | Standard path | External standard, framework convention, generator, policy, or reference architecture | New instances start from the standard path |
| **L1** | **PLP** | Platform product | Internal self-service capability maintained outside this codebase | Teams consume it with validation, observability, and support |
| **L0** | **SRVC** | External service | External SaaS, PaaS, managed cloud service, or commodity provider with minimal custom code | Local implementation is gone or only integration remains |

```
bring-down distance = current level - target level
```

In reports, name levels as `<level> <acronym>` (for example, `L3 LIB`) and
reserve the full prose name for narrative explanation.

`L1 PLP` means an internal platform product: a supported self-service
capability owned outside this codebase, such as a reusable deployment workflow,
auth gateway, logging pipeline, hosted data module, or policy-enforced cloud
resource. It is not just a shared module in the repo.

`L0 SRVC` means an external service or managed commodity: SaaS, PaaS, managed
cloud service, or provider-owned capability where this codebase keeps only the
integration.

Lower is not automatically better. The target is the lowest level that removes
real duplication while preserving legitimate variation.

---

## 2. Outsourcing Triggers

| Signal | Default action |
| ------ | -------------- |
| **Commodity custom code** | Search for framework/library/platform/service replacement |
| **High maintenance burden** | Consider outsourcing even with one instance |
| **2+ repeated copies** | Raise priority; document common behavior and variation |
| **3+ repeated copies** | Strong signal to replace with library/platform/service, or hand off to architecture skills for internal extraction |
| **High-risk single instance** | Consider early standard/platform/service if failure cost is high |
| **Many divergent copies** | Outsource the stable commodity core; keep local variation explicit |

Repetition is evidence, not the point of the skill. If repeated copies solve
materially different domain problems, do not force a shared abstraction; look
for commodity sub-capabilities that can be outsourced safely.

---

## 3. Target-Level Heuristics

| Condition | Target |
| --------- | ------ |
| Differentiating or feature-specific behavior | L4 CODE |
| Repeated shape but variation still unclear | L4 CODE, or hand off for internal architecture work |
| Stable commodity logic covered by an approved library/framework | L3 LIB |
| Stable creation workflow covered by a standard/generator/policy | L2 STD |
| Cross-team operational capability with policy needs | L1 PLP |
| Non-differentiating commodity function | L0 SRVC |

Use `functionality-complexity-tradeoff` before replacing code: if the duplicated
functionality is unnecessary, delete it instead of bringing it down.

---

## 4. Current-Stack Survey

The first bring-down move is discovery inside the current technology stack.
Look for a lower placement or alternative that already exists before creating
or buying anything. If the best move is only a repo-local component, module, or
template, stop and use the architecture skills instead.

Search for:

| Target | Signals |
| ------ | ------- |
| **Approved library/framework capability** | Package, framework API, SDK feature, plugin, or built-in behavior |
| **Existing standard/pattern** | External standard, framework convention, generator, reference architecture, ADR, code owner convention |
| **Existing platform product** | Internal service, reusable workflow, paved-road module, self-service control |
| **Already-approved managed service** | Provider/service already used, security-approved, contracted, or supported |
| **Framework-native capability** | Built-in feature that replaces local wrapper or custom code |

Prefer stack-native and locally adopted options over new abstractions. A new
external library, template, platform product, or service is justified only
when the current stack has no suitable lower placement.

---

## 5. Service Survey

Browse only after L0 SRVC is plausible and the current-stack survey has not
found a suitable already-approved alternative. Do not use internet search to
justify replacement, deletion, or abstraction; use it only to compare current
external service alternatives.

1. **Confirm commodity shape.** The capability is non-differentiating, broadly
   available as a service, or mostly operational burden.
2. **Define constraints.** Record data sensitivity, compliance, latency,
   region, cost model, lock-in tolerance, operational model, migration needs,
   and rollback needs.
3. **Search current alternatives.** Use primary sources where possible:
   official docs, pricing pages, SLA pages, security/compliance pages, and
   migration guides.
4. **Compare adjacent levels.** Include "keep local", L3 LIB, L1 PLP, and
   current-stack alternatives in the comparison.
5. **Recommend only with proof.** L0 SRVC wins only when it reduces code,
   operations, risk, or maintenance without violating constraints.

When the user asks for specific service alternatives, browse. Provider
capabilities, pricing, SLAs, regions, and compliance posture are time-sensitive.

---

## 6. Bring-Down Protocol

1. **Define scope.** Name the repos, modules, services, teams, or workflows
   under review.
2. **Inventory candidates.** Find custom-maintained commodity behavior,
   copy/paste code, repeated scripts, repeated PR shapes, local wrappers, and
   one-off infra/app patterns.
3. **Question necessity.** Delete obsolete or non-problem-solving code first.
4. **Search the current stack.** Look for existing lower placements:
   framework-native capabilities, approved libraries, standards, platform
   products, or approved services.
5. **Compare variation.** List what is common, what differs, and why.
6. **Assign current level.** Use the scale with evidence.
7. **Choose target level.** Pick the lowest responsible level by maintenance
   burden, commodity fit, risk, and variation.
8. **Compute distance.** Current level - target level.
9. **Choose one move.** Move down one level unless the intermediate level is
   already satisfied. If the move is purely internal componentization or
   patternization, hand off to architecture skills.
10. **Prove and retire.** Migrate at least one real consumer and remove the old
   duplicate path.

Prioritize by:

```
priority = bring-down distance x maintenance burden x repetition x churn x blast radius
```

If the improvement is mainly about human execution rather than code shape, use
`push-out`. If it is mainly about check timing, use `defect-shift-left`.

---

## 7. Move Patterns

| Move | Use when | Action |
| ---- | -------- | ------ |
| **L4 CODE to L3 LIB** | Approved library/framework capability fits | Replace bespoke code with that capability |
| **L3 LIB to L2 STD** | New instances repeat setup and a standard path exists | Adopt generator, policy, framework convention, or reference architecture |
| **L2 STD to L1 PLP** | Teams need a governed capability | Use or build a platform product with validation, observability, and support |
| **L1 PLP to L0 SRVC** | Capability is commodity | Replace with external service or managed commodity |

Each move must include migration and deletion criteria. A new abstraction with
all old copies still alive is inventory, not simplification.

---

## 8. Do Not Confuse With Placement

`bring-down` changes reuse/specificity altitude. It does not assign domain,
tier, layer, or dependency direction.

When the best answer is to componentize or patternize inside the codebase, use
`geometric-architecture`, `architecture-guidelines`, and `architecture-as-code`
instead. Use `structural-simplification` to verify any externalization or
platform move actually reduces complexity.

Here, "down" means less bespoke and more systemic, not lower in the dependency
graph.

---

## 9. Anti-Patterns

| Anti-pattern | Correction |
| ------------ | ---------- |
| Replacing custom code only because it exists | Prove commodity fit, maintenance burden, risk reduction, or repetition |
| Shared abstraction hiding real variation | Split stable core from explicit extension points |
| Building a new shared thing before looking locally | Search the current stack for existing lower placements first |
| Triggering bring-down for repo-local componentization | Use architecture skills unless the target is an external/library/platform capability |
| Platform product without adoption | Measure consumers, escape hatches, and support load |
| Template with no enforcement | Add lint, generator checks, or review gate where feasible |
| Managed service for differentiating logic | Keep local or componentized where domain value lives |
| Service selection from stale memory | Browse current primary sources before recommending alternatives |
| Wrapper around commodity service with no added policy | Delete wrapper or state the invariant it enforces |
| Replacement without deleting custom code | Require migration and retirement criteria |
| Treating bring-down as layer movement | Use `geometric-architecture` for placement and dependency direction |

---

## 10. Output Contract

Emit results in this shape:

```
Scope:          <repos/modules/services/teams/workflows>
Mode:           Assessment | Improvement | Roadmap
Summary:        <2-4 sentences: main duplication, best bring-down move, key risk>

Candidates:
| Candidate | Current | Target | Distance | Existing lower placement | Repetition evidence | Variation | Service candidates | Confidence | Next action |
| --------- | ------- | ------ | -------- | ------------------------ | ------------------- | --------- | ------------------ | ---------- | ----------- |

Priorities:
| Rank | Candidate | Why now | Bring-down move | Migration proof | Duplicate to retire |
| ---- | --------- | ------- | --------------- | --------------- | ------------------- |

Gaps:
<Missing evidence, unclear ownership, unproven repetition, variation risks, or excluded candidates>

Service comparison:
| Service option | Fit | Gaps | Lock-in | Migration cost | Rollback path |
| -------------- | --- | ---- | ------- | -------------- | ------------- |
```

---

## 11. See Also

- **`functionality-complexity-tradeoff`** - decide whether the functionality should exist before replacing it.
- **`structural-simplification`** - verify the externalization actually reduces component kinds, edges, depth, or count.
- **`geometric-architecture`** - place the resulting component after bring-down chooses the reuse level.
- **`push-out`** - move recurring operational work outward.
- **`defect-shift-left`** - move defect detection earlier.
- **`architecture-as-code`** - enforce accepted patterns as code.
