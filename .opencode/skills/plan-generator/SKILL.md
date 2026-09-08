---
name: plan-generator
description: plan generator
---
Generate implementation plans in a strict, machine-readable Markdown syntax with a YAML header, numbered phases, and typed task lines. Use this skill whenever the user asks for a plan, an implementation plan, a work breakdown, a migration plan, a rollout plan, a spec-to-tasks breakdown, a "plan file", or asks to plan out a feature, refactor, bug fix, or upgrade — even if they don't say the word "plan" explicitly (e.g. "break this ticket into steps", "how should we approach this", "give me the steps to ship X"). Also use it when updating, extending, or re-emitting an existing plan file so the syntax stays consistent.

Plan Generator

Produce plans in one fixed markup so they can be read by a human, diffed in git, and parsed by tooling. The value of this skill is consistency: every plan looks the same, so a script that reads one plan reads all of them.

Workflow
Establish scope. If the goal, the codebase/system, or the definition of done is unclear, ask 1–2 questions before writing. Don't ask about things you can infer from the conversation.
Decompose into phases. A phase is a milestone that leaves the system in a working state. Aim for 2–6 phases. If you only have one phase, the work is probably a single phase of tasks, not a plan.
Write tasks. Each task is one reviewable unit of work — roughly one commit or one PR-sized change. If a task can't be described in one line, split it.
Emit the plan using the syntax below, exactly. No prose outside the plan block.
Deliver it as a file (<slug>-plan.md) when the user will act on it or check it in; inline in chat only for short throwaway plans.
Plan syntax

Every plan is a Markdown file with three parts, in this order: front matter, phases, and an optional appendix.
