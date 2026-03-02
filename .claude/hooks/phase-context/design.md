<!-- Source: .claude/agents/design-api-agent.md, .claude/agents/design-style-agent.md, .claude/agents/design-wireframe-agent.md — keep in sync when agent process steps change -->

## DESIGN Phase — Generate Derived Artifacts

**Purpose:** Generate derived artifacts (API spec, design tokens, wireframes) from the Feature Requirements Specification produced during INTAKE. The orchestrator reads the intake manifest and invokes agents conditionally — only when their artifact needs generation.

**Execution order:** API → Style → Wireframe (sequential, each may reference prior artifacts)

## Agent Stages and Key Files

### Stage 1: design-api-agent

- **Agent:** `.claude/agents/design-api-agent.md`
- **Input:** `generated-docs/specs/feature-requirements.md`, `generated-docs/context/intake-manifest.json` (roles, data source), user-provided API material (if any)
- **Output:** `generated-docs/specs/api-spec.yaml`
- **Process:** Call A: read FRS and manifest, design OpenAPI spec, return summary → Orchestrator: get approval → Call B: commit or revise
- **Runs when:** `manifest.artifacts.apiSpec.generate == true`

### Stage 2: design-style-agent

- **Agent:** `.claude/agents/design-style-agent.md`
- **Input:** `generated-docs/specs/feature-requirements.md`, `generated-docs/context/intake-manifest.json` (styling notes), `web/src/app/globals.css` (current token names), user-provided style material (if any)
- **Output:** `generated-docs/specs/design-tokens.css`, `generated-docs/specs/design-tokens.md`
- **Process:** Call A: read FRS, manifest, and current tokens, design CSS overrides and style guide, return summary → Orchestrator: get approval → Call B: integrate into globals.css, commit or revise
- **Runs when:** `manifest.artifacts.designTokensCss.generate == true` OR `manifest.artifacts.designTokensMd.generate == true`

### Stage 3: design-wireframe-agent

- **Agent:** `.claude/agents/design-wireframe-agent.md`
- **Input:** `generated-docs/specs/feature-requirements.md`, user-provided wireframes from `documentation/wireframes/` (if any), `generated-docs/specs/api-spec.yaml` (if generated)
- **Output:** `generated-docs/specs/wireframes/`
- **Process:** Call A: read FRS, return screen list → Orchestrator: approve screen list → Call B: generate wireframes, return summary → Orchestrator: approve wireframes → Call C: commit
- **Runs when:** `manifest.artifacts.wireframes.generate == true`

### Orchestrator copy logic

When an artifact has `generate == false` but `userProvided != null`, the orchestrator copies the user-provided file to `generated-docs/specs/` with a `# Source: <original-path>` header. No agent is invoked for that artifact.

## Determining Current Stage After Compaction

Check these files to determine which sub-agent to resume:

| API spec exists? | Design tokens exist? | Wireframes exist? | Current stage |
|------------------|---------------------|--------------------|---------------|
| No (and needed) | — | — | **Stage 1** — Resume design-api-agent |
| Yes (or not needed) | No (and needed) | — | **Stage 2** — Resume design-style-agent |
| Yes (or not needed) | Yes (or not needed) | No (and needed) | **Stage 3** — Resume design-wireframe-agent |
| All present | All present | All present | **DESIGN complete** — Transition to SCOPE |

**"Needed" means:** `manifest.artifacts.<key>.generate == true` OR `manifest.artifacts.<key>.userProvided != null`

**File paths to check:**
- Manifest: `generated-docs/context/intake-manifest.json`
- API spec: `generated-docs/specs/api-spec.yaml`
- CSS tokens: `generated-docs/specs/design-tokens.css`
- Style guide: `generated-docs/specs/design-tokens.md`
- Wireframes: `generated-docs/specs/wireframes/` (contains `.md` files)

## What Happens Next

- After all DESIGN agents complete (or all copies done), the orchestrator transitions to SCOPE
- SCOPE phase: feature-planner reads all artifacts from `generated-docs/specs/` and defines epics
- Then STORIES → per-story cycle
