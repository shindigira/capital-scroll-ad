---
name: skill-builder
description: Creates or audits Cursor Agent Skills with strong frontmatter, clear trigger wording, and actionable step-by-step workflows. Use when the user asks to create a new skill, improve an existing skill, or review skill quality.
---

# Skill Builder

Create and optimize Cursor Agent Skills using practical conventions that improve discovery, reliability, and output quality.

## What This Skill Does

Use this skill when asked to:
- Build a new Cursor skill from scratch
- Convert a non-Cursor skill into Cursor format
- Audit and improve an existing Cursor skill
- Troubleshoot skill discovery or poor skill output

## Cursor Skill Basics

- Skills live in `.cursor/skills/<skill-name>/SKILL.md` for project scope.
- Personal skills live in `~/.cursor/skills/<skill-name>/SKILL.md`.
- Do not create skills in `~/.cursor/skills-cursor/` (reserved system location).
- `name` must match the directory name (lowercase, hyphenated, <= 64 chars).
- `description` must describe both:
  - **What** the skill does
  - **When** the agent should apply it (trigger phrases/intents)

## Mode 1: Build a New Skill

If the user has not provided enough detail, run a short discovery interview first. Ask one round at a time and proceed only after answers are received.

### Discovery Rounds

1. **Goal and Name**
   - What problem does this skill solve?
   - Suggest a skill name (`lowercase-hyphenated`).
2. **Trigger Conditions**
   - What would users say when they need this skill? (collect 2-3 phrases)
   - Should usage be slash command only, natural language only, or both?
   - Does it accept arguments?
3. **Workflow**
   - Define exact steps from invocation to result.
   - Identify where strict instructions are needed vs flexible guidance.
4. **Inputs and Outputs**
   - What files/data are required?
   - What output should be produced and where should it be saved?
5. **Guardrails**
   - What must never happen?
   - What common failure modes should be handled?
   - Any cost/tool side effects to avoid?

If all required information is already present in the request, skip redundant questions.

### Confirmation Template

Before writing files, confirm with:

```markdown
## Skill Summary: <name>

**Goal:** <one sentence>
**Trigger:** /<name> + <2-3 natural language triggers>
**Arguments:** <list or "none">

**Process:**
1. ...
2. ...

**Inputs:** ...
**Outputs:** ...
**Guardrails:** ...
```

Ask: "Does this capture it? Anything to add or change?"

### Build Steps

1. Create `.cursor/skills/<name>/`.
2. Write `SKILL.md` with:
   - YAML frontmatter (`name`, `description`)
   - Clear sections: purpose, workflow, output format, constraints
3. Add supporting files only when needed:
   - `reference.md` for detailed docs
   - `examples.md` for sample inputs/outputs
   - `scripts/` for utility scripts
4. Keep `SKILL.md` concise (target under 500 lines).
5. Ensure all referenced paths are explicit and valid.

## Mode 2: Convert Existing Skill to Cursor

When given a skill from another environment:

1. Preserve original intent and workflow.
2. Rewrite platform-specific language to Cursor equivalents.
3. Update storage paths to Cursor conventions:
   - Project: `.cursor/skills/...`
   - Personal: `~/.cursor/skills/...`
4. Ensure description is third-person and includes trigger terms.
5. Remove or revise unsupported assumptions and stale tool references.
6. Keep examples/output templates if they improve consistency.

## Mode 3: Audit Existing Skill

Read the current `SKILL.md` first, then evaluate:

### Frontmatter Audit
- Name matches directory
- Description is specific, third-person, and includes trigger terms
- No unnecessary metadata fields

### Content Audit
- Clear step-by-step workflow
- Explicit output format/template
- Inputs/outputs and file paths documented
- Edge cases and "do not do" constraints included
- Concise wording; avoid generic filler

### Integration Audit
- Supporting files are linked and actually exist
- Scripts paths are correct and runnable
- No hardcoded secrets or tokens

### Quality Audit
- A new contributor could follow instructions without extra context
- Terminology is consistent
- The skill is focused (not overly broad)

## Authoring Rules

- Prefer specific defaults over many options.
- Use consistent terms throughout the skill.
- Avoid time-sensitive phrasing that will age poorly.
- Keep advanced detail in supporting files, not the main `SKILL.md`.
- If arguments are supported, document how they are interpreted.

## Output Expectations

When completing a build or audit task, provide:
1. Created/updated file paths
2. A short list of key improvements
3. Any open questions or remaining risks

If creating a skill, include a short test plan:
- Trigger via natural language
- Trigger via `/skill-name` (with arguments if applicable)
- Validate output location and format
