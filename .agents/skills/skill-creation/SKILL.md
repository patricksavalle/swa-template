---
name: skill-creation
description:
    Dictates how to format, organize, and formulate an optimized SKILL file for
    the AI agent. Use this skill whenever you are tasked with creating a new
    SKILL or refactoring/optimizing an existing one.
---

# Skill Creation & Optimization Protocol

This protocol defines the strict structural and stylistic requirements for
formulating an optimized `SKILL.md` file. Agent skills are executable guardrails
and protocols, not passive wiki documentation.

> **TL;DR / Core Directives**
>
> 1. **High Signal-to-Noise**: Dense, concise, minimal. Zero fluff.
> 2. **Progressive Exposure**: TL;DR at the top, deeper details below.
> 3. **Actionable Over Abstract**: Prioritize clear, direct instructions and
>    tables to maintain density.

## When to use this skill

- When creating a new SKILL file.
- When refactoring or optimizing an existing SKILL file.
- **Out of scope:** This skill governs the meta-structure of SKILL files
  themselves. It does not dictate the coding standards or business logic
  contained within them.

---

## 1. File Structure Sequence

An optimized SKILL must follow this exact top-to-bottom sequence:

1. **YAML Frontmatter**:
    - `name`: Clean, kebab-case or Title Case name.
    - `description`: MUST contain a specific "Use this skill when..." trigger
      sentence to help the agent route requests correctly.
2. **H1 Title**: Name of the protocol or standard.
3. **Scope & Cross-References**: A `> blockquote` immediately answering what
   this skill **does not** do, and linking to sibling skills (e.g., "For styling
   rules, see `coding-standard`").
4. **TL;DR / Core Directives**: A numbered list of 3-5 unbreakable rules.
5. **Detailed Sections**: Grouped using `##` and `###` headers.

## 2. Formatting & Wording

- **Minimalist Wording**: Use short bullet points. Avoid paragraphs longer than
  two sentences.
- **Definitive Language**: Use "MUST", "NEVER", "ALWAYS". Avoid soft words like
  "should", "preferably", or "try to".
- **Visual Density**: Use **bold** for key concepts and `inline code` for
  technical references. Use Markdown tables to compare concepts or configuration
  options instead of writing lists.

## 3. Formulating Rules (The Meta-Logic)

- **Zero Redundancy (DRY)**: Never duplicate rules across multiple skill files.
  If an architectural rule applies, reference `architecture-guidelines` rather
  than rewriting it.
- **Root-Cause Focus**: Write rules that target the root cause of an
  anti-pattern, not just the symptom.
- **Shrink, Don't Grow**: When adding a new rule to a SKILL, aggressively look
  for outdated or redundant rules to prune. A SKILL should become sharper and
  denser over time, not an endless, scrolling document.

## 4. Markdown Elements

Use GitHub-flavored alerts for critical callouts to visually break up the
document and alert the agent:

- `> [!IMPORTANT]` for rules that directly prevent regressions or pipeline
  failures.
- `> [!WARNING]` for common anti-patterns or platform traps.
- `> [!NOTE]` for contextual caveats.

## 5. Pre-Save Verification

Before finalizing a new or optimized SKILL file, perform this audit:

- [ ] Does the frontmatter description explicitly state "Use this skill
      when..."?
- [ ] Is there any rule duplicated from another SKILL? (If yes, delete it).
- [ ] Are paragraphs kept under 2-3 sentences?
