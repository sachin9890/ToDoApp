---
name: plan-generator
description: Generate implementation plans in a strict, machine-readable Markdown syntax with a YAML header, numbered phases, and typed task lines. Use this skill whenever the user asks for a plan, an implementation plan, a work breakdown, a migration plan, a rollout plan, a spec-to-tasks breakdown, a "plan file", or asks to plan out a feature, refactor, bug fix, or upgrade — even if they don't say the word "plan" explicitly (e.g. "break this ticket into steps", "how should we approach this", "give me the steps to ship X"). Also use it when updating, extending, or re-emitting an existing plan file so the syntax stays consistent.
---

# Plan Generator

Produce plans in one fixed markup so they can be read by a human, diffed in git, and parsed by tooling. The value of this skill is consistency: every plan looks the same, so a script that reads one plan reads all of them.

## Workflow

1. **Establish scope.** If the goal, the codebase/system, or the definition of done is unclear, ask 1–2 questions before writing. Don't ask about things you can infer from the conversation.
2. **Decompose into phases.** A phase is a milestone that leaves the system in a working state. Aim for 2–6 phases. If you only have one phase, the work is probably a single phase of tasks, not a plan.
3. **Write tasks.** Each task is one reviewable unit of work — roughly one commit or one PR-sized change. If a task can't be described in one line, split it.
4. **Emit the plan** using the syntax below, exactly. No prose outside the plan block.
5. **Deliver it as a file** (`<slug>-plan.md`) when the user will act on it or check it in; inline in chat only for short throwaway plans.

## Plan syntax

Every plan is a Markdown file with three parts, in this order: front matter, phases, and an optional appendix.

````markdown
---
plan: <kebab-case-id>
title: <One line, imperative>
owner: <name or team, or TBD>
status: draft | active | blocked | done
created: <YYYY-MM-DD>
risk: low | medium | high
---

# <Title>

## Goal
<1–3 sentences. What is true when this is finished.>

## Non-goals
- <Explicitly out of scope>

## Phase 1 — <Phase name>
> exit: <observable condition that ends this phase>

- [ ] P1.1 (code) <task> @<owner> ~<estimate>
      - needs: <P#.#, ...>
      - files: <path, path>
      - note: <constraint, gotcha, or decision>
- [ ] P1.2 (test) <task>

## Phase 2 — <Phase name>
> exit: <...>

- [ ] P2.1 (infra) <task>
      - needs: P1.2

## Risks
- <risk> → <mitigation>

## Open questions
- <question> (blocks: P#.#)
````

### Rules that matter

- **Task IDs are `P<phase>.<n>`** and are stable. When editing a plan, never renumber existing tasks — append new ones, and mark removed ones `[~]` rather than deleting, so references from other documents don't break.
- **Checkbox states:** `[ ]` todo, `[x]` done, `[>]` in progress, `[!]` blocked, `[~]` dropped.
- **Type tag** in parentheses, always one of: `code`, `test`, `infra`, `data`, `design`, `docs`, `review`, `spike`. If nothing fits, use `code`. A consistent vocabulary is what makes the file filterable.
- **Sub-attributes** (`needs:`, `files:`, `note:`, `verify:`) are indented six spaces under the task and are all optional. Include `needs:` whenever ordering is not obvious from the numbering, since that's what turns the plan into a dependency graph.
- **`> exit:`** on every phase. A phase without a checkable exit condition is a wish, not a plan.
- **Estimates** use `~30m`, `~2h`, `~1d`, `~3d`. Skip them entirely rather than guessing wildly — a wrong estimate is worse than none.
- Owners are `@handle`. Use `@unassigned` rather than omitting when the plan has owners elsewhere.

### Worked example

Request: "Plan the migration of our auth from session cookies to JWT."

````markdown
---
plan: jwt-auth-migration
title: Migrate authentication from session cookies to JWT
owner: platform
status: draft
created: 2026-09-08
risk: high
---

# Migrate authentication from session cookies to JWT

## Goal
All API requests authenticate via short-lived JWTs with refresh tokens, with no
session table reads on the hot path. Existing logged-in users are not signed out.

## Non-goals
- Changing the identity provider
- SSO / SAML support

## Phase 1 — Issue tokens alongside sessions
> exit: login returns both a session cookie and a JWT; nothing consumes the JWT yet

- [ ] P1.1 (code) Add token signing service with key rotation support @unassigned ~1d
      - files: src/auth/tokens.ts
      - note: RS256, keys from env; do not commit test keys
- [ ] P1.2 (code) Issue access + refresh token on successful login ~4h
      - needs: P1.1
- [ ] P1.3 (test) Contract tests for token claims and expiry
      - needs: P1.2

## Phase 2 — Dual-read verification
> exit: middleware accepts either a valid session or a valid JWT

- [ ] P2.1 (code) JWT verification middleware with session fallback ~1d
      - needs: P1.3
      - verify: existing e2e suite passes unchanged
- [ ] P2.2 (infra) Ship behind `AUTH_JWT_ENABLED` flag, default off

## Phase 3 — Cutover
> exit: session table is read by nothing; flag removed

- [ ] P3.1 (infra) Enable flag per environment, staged
      - needs: P2.2
- [ ] P3.2 (code) Remove session middleware and table reads
- [ ] P3.3 (docs) Update API auth docs

## Risks
- Refresh token theft has a longer blast radius than session revocation → rotate on
  use and keep a revocation list keyed on token family
- Clock skew across services causes spurious 401s → allow 60s leeway

## Open questions
- Where do refresh tokens live: httpOnly cookie or client storage? (blocks: P1.2)
````

## When to deviate

If the user has an existing plan file with a different shape, match theirs — consistency within their repo beats consistency with this skill. If they ask for a different serialization (YAML, JSON, XML), keep the same conceptual model (front matter → phases with exit conditions → typed tasks with IDs and dependencies) and just change the encoding.

See `references/syntax.md` for the full grammar and a parsing regex, and `assets/plan-template.md` for a blank template to copy.
