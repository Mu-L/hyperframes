# Blueprint Authoring Guide

For agents writing or rewriting a blueprint in this directory. If you are _using_ a blueprint to build a scene, read the blueprint itself — this file is about how to _write_ one.

## What a blueprint is

A blueprint is the **orchestration notes** for one specific scene: how to weave N atomic rules into a coherent narrative. It is consumed by another agent who is composing that scene.

It is **not**:

- a copy of the rules' HTML/CSS/JS — rules already have those
- a tutorial on a single motion pattern — that's a rule
- a spec — agents need judgment cues, not requirements lists

## The blueprint–rule boundary

The single most important rule when writing a blueprint:

> Before writing any sentence, ask: **"Would this sentence still be true if I dropped it into a different blueprint that references the same rule?"**
>
> - **Yes, it's universally true** → it belongs in the rule, not here. Either the rule already has it (don't repeat) or the rule is missing it (flag it; the rule should be updated).
> - **No, it only makes sense in this scene** → it belongs in the blueprint. Keep it.

| Belongs in the rule                                       | Belongs in the blueprint                              |
| --------------------------------------------------------- | ----------------------------------------------------- |
| HTML / CSS / JS templates                                 | The scene's narrative arc / emotional shape           |
| Standard parameter ranges (e.g. `BOUNCE_FACTOR: 1.4–2.8`) | Why you picked **this rule** for this phase           |
| The rule's own Critical Constraints                       | Which **variation** of the rule is used here, and why |
| Color tokens, font weights as defaults                    | **Seams** between rules (A's output feeds B's input)  |
| Universal HF contract (`paused: true`, registry key)      | The scene's unique math / derivations                 |
| `transition` / `animation` prohibitions                   | Parameters that only exist in this scene              |

## Required content

A blueprint must answer these five questions, in roughly this order. Section names can vary; the _answers_ cannot be missing.

### 1. What story is this scene telling?

Opening paragraph, ≤5 lines. Describe the **emotional arc**, not the mechanics. Use phrases like "context → focus → idle" or "scarcity → relief," not "element A fades in then element B fades out."

This is the only place where prose may sound "creative" rather than technical. The rest of the document is operational.

### 2. When to use / when not to use

A short list of trigger conditions and anti-patterns. Helps an agent who already matched on a trigger keyword do a second-pass filter.

### 3. Orchestration: which rule per phase, and why this variation?

The largest section. Walks through each phase and states:

- which rule (or `inline`) drives it
- which **variation** of that rule, if the rule has multiple
- why this variation rather than the rule's default — usually because of something _specific to this scene_ (no typos here, scale must compose with a later phase, etc.)

This section does **not** include the rule's code. Link to the rule for code; spend your words on the _selection rationale_.

### 4. Phase timing + seams

Two parts:

**Timing**: a compact table mapping each phase to `Start ≥`, internal duration, and a short note. Followed by **prose that explains the gap values** — every `+ 0.1s` / `+ 0.2s` / `+ 0.3s` has a reason (spring tail settling, visual landing, sine-vs-spring contention). Without the reasons, agents copy the numbers blindly and break them on the next composition.

**Seams**: the blueprint's unique value. For each non-trivial transition between phases, document the handoff — what value Phase A computes, how it flows into Phase B, what derivation is needed if it's not standard. This is content rules cannot cover, because rules are context-free.

### 5. Critical constraints, ordered by failure frequency

A bulleted list. Two rules for this section:

- **Order by likelihood of failure**, not by phase. Agents read this as a self-check before declaring the scene done — the highest-risk items should be at the top.
- **List only constraints unique to this blueprint.** Universal HF constraints, GSAP transform allowlist, etc. live in `hyperframes-core` and in each rule's own constraints section. Don't restate.

## Optional content

- **Initial DOM nesting**: include only when the nesting structure is non-obvious or carries semantic meaning specific to this scene (e.g. brand-reveal needs three wrappers because two rules each demand a transform layer). An ASCII tree is usually clearer than full HTML. **Do not paste a full HTML template** — agents go to the rule or the golden sample for that.
- **Key values to choose**: only the parameters this blueprint _introduces_. If a parameter's range is already in a referenced rule, do not duplicate it; reference the rule.
- **Spring → ease selection / runtime adapter notes**: useful when the blueprint uses several different feels in different phases. Keep it to a 3–4 line list, not a full mapping table — the full table lives in `SKILL.md`.
- **Golden sample link**: every blueprint should link to its runnable example in `examples/<id>.html`.

## Frontmatter

The English version (`<id>.md`) carries a YAML frontmatter consumed by `blueprints-index.md` and the router:

```yaml
---
id: blueprint-id
role: brand-reveal | hook | cta | proof | demo | …
duration_seconds: [min, max]
phases: N
visual_arc: "wide → close → idle"
uses_rules: [rule-id-1, rule-id-2, …]
element_roles:
  name: short description
when_to_use:
  - …
when_not_to_use:
  - …
triggers: [keyword, keyword, …]
---
```

Localized versions (`<id>.zh.md`, etc.) do **not** carry frontmatter — they are translations, not separate index entries.

## Style

- Write like you're briefing a colleague on a design choice, not like you're writing a spec
- Sentences with judgments are good: "we picked X here because Y," "this is the most common point of failure," "tune by eye"
- Avoid bullet pyramids. The orchestration section should be prose with embedded code where needed, not a wall of nested lists
- Skip prose summaries of what you just said. Agents skim — the next section's heading is the summary
- One-line opening paragraph for the whole document; one-line closing for each section. No throat-clearing

## Length

There is no hard cap, but a rough heat-map:

- **Below ~80 lines**: probably missing seam details or constraints — check that handoffs between rules are covered
- **80–200 lines**: healthy range for a 4–6 phase blueprint
- **Above 250 lines**: almost certainly repeating rule content — re-read with the "would this be true in another blueprint?" test and cut anything that is

A reference data point: `brand-reveal-assemble-zoom.md` rewritten to this standard is ~160 lines (excluding frontmatter) for 5 phases referencing 3 rules with non-trivial seams. The previous version was 428 lines; the difference was almost entirely rule content that didn't belong.

## Self-check before declaring a blueprint done

Run these three questions over the draft:

1. **If an agent reads this without the linked rules, can they build the scene?** Should be **no** — they need to follow the rule links for code.
2. **If an agent reads only the linked rules without this blueprint, can they build the scene?** Should also be **no** — the seams and the rationale for picking variations live here.
3. **Is there any sentence in this blueprint that would still be true if pasted into a blueprint referencing the same rule for a different scene?** Should be **almost none**. If you find such sentences, they belong in the rule.

If all three answers are correct, the blueprint is in the right shape.

## When you spot rule gaps while writing a blueprint

If you find yourself wanting to explain how to use a rule in a way the rule itself doesn't cover — for example, brand-reveal uses a monotonic `tl.set` form of `discrete-text-sequence` that the rule barely mentions — the right response is **not** to fully explain it in the blueprint. The right response is:

1. In the blueprint, briefly state which variation is being used (one sentence) and link the rule
2. Flag the gap: the rule is missing this variation
3. Surface the gap when reviewing rules later (do not modify the rule as a side effect of writing the blueprint, unless explicitly asked)

The blueprint should not become a workaround for a rule's missing content.

## See also

- `blueprints-index.md` — the canonical index of blueprints by role and trigger
- `SKILL.md` — animation skill entry point, runtime selection, universal animation-craft constraints
- `../rules/` — atomic motion recipes referenced by blueprints
- Any existing well-formed blueprint (e.g. `brand-reveal-assemble-zoom.md`) — the running reference for this standard
