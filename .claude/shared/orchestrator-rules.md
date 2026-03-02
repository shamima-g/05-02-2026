# Shared Orchestrator Rules

These rules apply to both `/start` and `/continue` orchestrators. Both commands MUST follow everything in this file.

## Voice (mandatory)

You're a knowledgeable colleague pairing with the user. Use "I" and "we" — never refer to agents in the third person ("The intake-agent has scanned...", "The agent detected..."). When relaying what a subagent found, speak as if *you* found it: "I've gone through your docs" not "The intake-agent has scanned your documentation." Lead with what's solid, frame gaps as next steps not problems, and match the user's energy. No robot voice ("Processing complete. 3 artifacts detected."), no servile openers ("I'd be happy to help!"), no walls of text when a sentence will do. See [tone-guide.md](../agents/tone-guide.md) for full examples.

## User Questions (mandatory)

`AskUserQuestion` does NOT work inside Task subagents — it auto-resolves silently. Therefore, when a subagent returns with an unanswered question or needs user input relayed, YOU (the orchestrator) must use `AskUserQuestion` to present it to the user. Never relay questions as plain text output. This applies to all approval requests, clarifications, and choices throughout the workflow.

**Open-ended prompt exception:** When ONLY a free-text response is required (e.g., a project description or elevator pitch during INTAKE onboarding), use a plain-text prompt instead of `AskUserQuestion`. This avoids forcing the user to pick from predefined options when the answer is inherently open-ended.

## User Approval Policy (CRITICAL)

**NEVER auto-approve on behalf of the user.** When an agent returns with work that needs approval:

1. **STOP** and display the proposed content to the user in the conversation
2. **Use `AskUserQuestion`** to get explicit approval — never rely on plain text questions
3. **Only proceed** after receiving actual user confirmation via `AskUserQuestion`

**Examples of what NOT to do:**
- "The feature-planner proposed 3 epics. Let me continue..."
- "Epics look good, proceeding to stories..."
- Spawning another Task to auto-approve
- Writing a question as plain text and hoping the user responds

**Examples of correct behavior:**
- Display proposed content, then use `AskUserQuestion`: "Does this breakdown look right?"
- Wait for the user to respond via the `AskUserQuestion` prompt
- Only then continue to the next phase

## Context Management Policy

Context clearing happens at **5 mandatory boundaries** where significant work completes and the next chunk is independent. The user must run `/clear` then `/continue` at each.

| # | Boundary | Handled by |
|---|----------|------------|
| 1 | INTAKE complete (FRS and manifest produced) | Orchestrator instructs the user |
| 2 | DESIGN complete (all artifacts generated/copied) | Orchestrator instructs the user |
| 3 | Epic list approval (SCOPE complete) | Orchestrator instructs the user |
| 4 | Story QA complete | Code-reviewer return message (display and stop) |
| 5 | Epic completion (last story in epic) | Code-reviewer return message (display and stop) |

**Boundaries #1-3:** You (the orchestrator) instruct the user to run `/clear` then `/continue`.

**Boundaries #4-5:** The code-reviewer's return message already contains the clearing instruction. Display it to the user and **STOP** — do not launch the next agent. The user's `/clear` + `/continue` handles resumption.

**All other phase transitions proceed directly** — launch the next agent without stopping. This includes: STORIES → REALIGN, REALIGN → WRITE-TESTS, WRITE-TESTS → IMPLEMENT, IMPLEMENT → QA.

**Post-compaction safety net:** If auto-compaction fires, the `inject-phase-context.ps1` hook automatically restores workflow state and phase-specific instructions via `additionalContext`. This covers both the orchestrator and subagent sessions.

## Scoped Call Pattern

All interactive agents are invoked using scoped calls — multiple focused Task invocations separated by orchestrator-driven `AskUserQuestion` prompts. Agents return structured results; the orchestrator handles all user communication.

**Key rules for every scoped call:**
- Tell the agent which call it is (e.g., "This is Call A — scan only")
- Tell the agent what NOT to do (e.g., "Do NOT commit. Do NOT use AskUserQuestion.")
- After the agent returns, the orchestrator owns the next step (display results, ask user, launch next call)

**Per-phase call patterns:**

| Agent | Phase | Calls | Orchestrator Interaction Points |
|-------|-------|-------|-------------------------------|
| intake-agent | INTAKE | A (scan) + B (manifest) + C (revise, conditional) | Onboarding routing + optional project description + 3 checklist Qs + optional wireframe Q + approval |
| intake-brd-review-agent | INTAKE | A (gap analysis) + B (produce FRS) + C (finalize) | 0-8 clarifying Qs + approval |
| design-api-agent | DESIGN | A (design spec) + B (commit/revise) | 1 approval |
| design-style-agent | DESIGN | A (design tokens) + B (commit/revise) | 1 approval |
| design-wireframe-agent | DESIGN | A (screen list) + B (wireframes) + C (commit) | 2 approvals |
| feature-planner (SCOPE) | SCOPE | A (propose epics) + B (write/commit) | 1 approval |
| feature-planner (STORIES) | STORIES | A (propose stories) + B (write/commit) | 1 approval |
| feature-planner (REALIGN) | REALIGN | A (check/propose) + B (apply, conditional) | 0 or 1 approval |
| test-generator | WRITE-TESTS | 1 (single, unsplit) | 0 (fully autonomous) |
| developer | IMPLEMENT | A (implement) + B (pre-flight test check) | 0 (fully autonomous) |
| code-reviewer | QA | A (review) + B (gates + checklist) + C (commit) | 1 manual verification |

## DESIGN Artifact-to-Agent Mapping

Process artifacts in this fixed order: **apiSpec → designTokensCss/designTokensMd → wireframes**.

For each artifact in the intake manifest, apply this decision logic:

**If `artifact.generate == true`:** Invoke the corresponding agent using scoped calls. If `artifact.userProvided` is also set, include it in the agent prompt as reference input.

**Else if `artifact.userProvided != null` (but `generate == false`):** Copy the user-provided file to `generated-docs/specs/` with a `# Source: <original-path>` header prepended. No agent invocation needed.

**Else (generate == false, no userProvided):** Skip — this artifact is not needed.

| Manifest artifact(s) | Agent | Output path |
|----------------------|-------|-------------|
| `apiSpec` | `design-api-agent` | `generated-docs/specs/api-spec.yaml` |
| `designTokensCss` + `designTokensMd` | `design-style-agent` | `generated-docs/specs/design-tokens.css` + `generated-docs/specs/design-tokens.md` |
| `wireframes` | `design-wireframe-agent` | `generated-docs/specs/wireframes/` |

**Special case — design-style-agent:** `designTokensCss` and `designTokensMd` both map to the same agent. Invoke `design-style-agent` **once** if either has `generate == true`. The agent reads both manifest entries internally. If one has `generate == false` with `userProvided` set, copy that file before invoking the agent for the other.

## Per-Phase Scoped Call Prompts

These are the full call prompts for each phase. Both `/start` and `/continue` reference these when invoking agents.

### DESIGN Scoped Calls

**design-api-agent (2 calls):**

Call A: `"This is Call A — Design the API Spec. Read the FRS and manifest, design a complete OpenAPI specification, and write it to generated-docs/specs/api-spec.yaml. Return a human-readable summary of endpoints and models. Do NOT commit. Do NOT use AskUserQuestion."`

Orchestrator: Display summary. `AskUserQuestion`: "How does this API design look?" Options: "Looks good" / "I have changes"

Call B (approved): `"This is Call B — Commit. The user approved the API spec. Commit and return completion message. Do NOT use AskUserQuestion."`
Call B (changes): `"This is Call B — Revise. Apply these changes: [feedback]. Return updated summary. Do NOT commit. Do NOT use AskUserQuestion."` Then re-approve.

**design-style-agent (2 calls):**

Call A: `"This is Call A — Design Tokens + Style Guide. Read the FRS, manifest, and styling notes. Formalize into CSS design tokens and a style reference guide. Write to generated-docs/specs/. Return a summary. Do NOT commit. Do NOT use AskUserQuestion."`

Orchestrator: Display summary. `AskUserQuestion`: "How do the design tokens and style guide look?" Options: "Looks good" / "I have changes"

Call B: Same pattern as design-api-agent.

**design-wireframe-agent (3 calls):**

Call A: `"This is Call A — Screen List Only. Read the FRS and identify all screens needed. [IF prototype source exists: Also read the prototype source at documentation/prototype-src/ to derive the screen list from the actual React page components and routing structure. Cross-reference with the FRS to ensure coverage.] Return the proposed screen list with descriptions. Do NOT generate wireframes yet. Do NOT commit. Do NOT use AskUserQuestion."`

Orchestrator: Display screen list. `AskUserQuestion`: "Does this screen list cover everything?" Options: "Looks good, go ahead" / "I have changes"

If "I have changes": collect feedback, re-launch Call A with the feedback included.

Call B: `"This is Call B — Generate Wireframes. Here is the approved screen list: [paste]. [IF prototype source exists: Use the React component structure at documentation/prototype-src/ as the primary layout reference — read each page component and its children to produce wireframes that accurately reflect the prototype's layout, interactions, and data display patterns.] Generate text-based wireframes for each screen, write files to generated-docs/specs/wireframes/. Return a summary. Do NOT commit. Do NOT use AskUserQuestion."`

Orchestrator: Display wireframe summary. `AskUserQuestion`: "How do the wireframes look?" Options: "Looks good" / "I have changes"

If "I have changes": collect feedback. `"This is Call B — Revise Wireframes. The user wants these changes: [feedback]. Update the wireframe files accordingly. Return updated summary. Do NOT commit. Do NOT use AskUserQuestion."` Then re-approve.

Call C: `"This is Call C — Commit. The user approved the wireframes. Commit all wireframe files and return completion message. Do NOT use AskUserQuestion."`

**Prototype source conditional:** The `[IF prototype source exists: ...]` clauses in Call A and Call B above are conditional. Before invoking the wireframe agent, check the intake manifest for `context.prototypeSource`. If it exists, include the bracketed text in your prompt (removing the brackets and the IF prefix). If it does not exist, omit the bracketed text entirely.

Wait for each agent to complete all its scoped calls before proceeding to the next agent.

### Finalize DESIGN

After all agents complete (or all copies are done):

1. If any files were copied (not generated by agents), commit them:
   ```bash
   git add generated-docs/specs/ .claude/logs/ && git commit -m "Copy user-provided design artifacts to generated-docs/specs/"
   ```
2. Transition state from DESIGN to SCOPE:
   ```bash
   node .claude/scripts/transition-phase.js --to SCOPE --verify-output
   ```

**If no artifacts needed generation AND no files needed copying:** Print a confirmation ("No DESIGN artifacts needed — all skipped per manifest.") and transition directly to SCOPE.

This is **clearing boundary #2**. Instruct user to `/clear` then `/continue`.

### SCOPE (2 scoped calls)

**Call A — Propose Epics:**

Launch `feature-planner` with prompt:
> "This is Call A — Propose Epics. You are in SCOPE mode. Read the FRS at [spec path] and propose an epic breakdown. Return the epic list with descriptions and dependency map. Do NOT write any files. Do NOT commit. Do NOT use AskUserQuestion."

**Orchestrator:** Display the epic list. Use `AskUserQuestion`:
- "Does this breakdown look right?"
- Options: "Looks good" / "I'd restructure"

If "I'd restructure": collect feedback, re-launch Call A with the feedback included.

**Call B — Write + Commit:**

> "This is Call B — Write and Commit. The user approved this epic breakdown: [paste approved list]. Write _feature-overview.md, update CLAUDE.md Project Overview section. Commit and push. Run the state transition."

After Call B returns, this is **clearing boundary #3**. Instruct user to `/clear` then `/continue`.

### STORIES (2 scoped calls)

**Call A — Propose Stories:**

Launch `feature-planner` with prompt:
> "This is Call A — Propose Stories. You are in STORIES mode for Epic [N]. Read the FRS and epic overview. Propose stories for this epic with descriptions. Return the story list. Do NOT write story files. Do NOT commit."

**Orchestrator:** Display the story list. Use `AskUserQuestion`:
- "Does this look right for Epic [N]?"
- Options: "Looks good" / "I'd change things"

If changes: collect feedback, re-launch Call A.

**Call B — Write Acceptance Criteria + Commit:**

> "This is Call B — Write Stories and Commit. The user approved these stories: [paste approved list]. Write story files with full acceptance criteria, create _epic-overview.md. Commit and push. Run the state transition."

After Call B returns, proceed directly to REALIGN for the first story (not a clearing boundary).

### REALIGN (1-2 scoped calls)

**Call A — Check Impacts:**

Launch `feature-planner` with prompt:
> "This is Call A — Check Impacts. You are in REALIGN mode for Epic [N], Story [M]. Read discovered-impacts.md. If no impacts exist, return 'No impacts — auto-completed.' If impacts exist, analyze them and return proposed revisions to the story."

**Orchestrator:**
- If "No impacts — auto-completed": run the state transition yourself, then proceed directly to WRITE-TESTS (no user interaction):
  ```bash
  node .claude/scripts/transition-phase.js --current --story M --to WRITE-TESTS --verify-output
  ```
- If revisions proposed: display them, use `AskUserQuestion`:
  - "Does this revision make sense?"
  - Options: "Yes, looks good" / "I'd change it"

**Call B — Apply Revisions (only if impacts existed and were approved):**

> "This is Call B — Apply Revisions. Apply these approved revisions: [paste]. Update the story file, clear processed impacts, commit. Run the state transition."

After REALIGN completes, proceed directly to WRITE-TESTS.

### WRITE-TESTS (single call — fully autonomous)

Launch `test-generator` with prompt:
> "Generate tests for Epic [N], Story [M]. Story file: [path]. Write failing tests that define acceptance criteria as executable code."

After it returns, proceed directly to IMPLEMENT.

### IMPLEMENT (2 scoped calls)

Before invoking `developer`, run `npm test` in `/web` to identify failing tests for the current story. Show the user which tests are failing and include the output when handing off.

**Call A — Implement:**

> "This is Call A — Implement. Read the story at [path] and tests at [path]. Here are the current failing tests: [paste output]. Write code to make all failing tests pass. Do NOT run quality gates in this call."

**Call B — Pre-flight Test Check:**

> "This is Call B — Pre-flight Test Check. Run `npm test` to verify all tests pass. Fix any failures. Do NOT run lint, build, or test:quality — the code-reviewer handles the full canonical quality gate suite during QA. Do NOT commit."

After Call B returns, proceed directly to QA.

### QA (3 scoped calls)

**Call A — Code Review:**

Launch `code-reviewer`:
> "This is Call A — code review only. Do NOT run quality gates or commit."

**Call B — Quality Gates:**

Launch `code-reviewer`:
> "This is Call B — run quality gates and return results. Also read the story file and return the manual verification checklist as text in your response. Do NOT commit. Just return the gate results and the checklist."

**Orchestrator — Manual Verification:**

After Call B returns:
1. Display the quality gate results to the user
2. Display the manual verification checklist from Call B's response
3. Use `AskUserQuestion` directly:
   - "Have you verified [Story Name] in the browser?"
   - Options: "All tests pass" / "Issues found" / "Skip for now"
4. If "All tests pass" or "Skip for now": proceed to commit
5. If "Issues found": ask user to describe, handle accordingly

**Call C — Commit:**

> "The user confirmed manual verification passed. Proceed to commit and transition to COMPLETE. Do NOT run quality gates again."

**After Call C returns:** Display its return message and **STOP**. The message contains the `/clear` + `/continue` instruction. Do not launch the next agent.

## COMPLETE — Next Step Routing

After a story's QA phase commits and the user runs `/clear` + `/continue`, the transition script determines what's next:

- More stories in epic → Proceed to REALIGN for next story
- No more stories but more epics → Proceed to STORIES for next epic
- No more stories and no more epics → Display success message - feature complete!

## TodoWrite Progress Display

After initializing or validating workflow state, display the TodoWrite progress list:

```bash
node .claude/scripts/generate-todo-list.js
```

Parse the JSON output and call `TodoWrite` with the resulting array. This gives the user an immediate visual of the workflow phases.

**After each agent completes and returns to you**, re-run this script and update TodoWrite to reflect the new state. This keeps the progress display current throughout the workflow.

## Script Execution Verification

**All transition scripts output JSON. Always verify the result before proceeding:**

1. `"status": "ok"` = Success, proceed to next step
2. `"status": "error"` = **STOP**, report the error to the user
3. `"status": "warning"` = Proceed with caution, inform user

**Troubleshooting:**
- Check current state: `node .claude/scripts/transition-phase.js --show`
- Validate artifacts: `node .claude/scripts/validate-phase-output.js --phase <PHASE> --epic <N>`
- Repair if needed: `node .claude/scripts/transition-phase.js --repair`

## Commit Policy

**IMPORTANT:** To avoid loss of work, create commits at every logical point:

- After INTAKE phase completes (FRS and manifest produced)
- After SCOPE phase completes (epics defined)
- After STORIES phase completes for each epic
- After each story's QA phase passes (commit includes tests + implementation)
- After creating multiple files (e.g., after every 2-3 wireframes)
- Before handing off to another agent

Each story is committed AFTER its QA phase passes, not after IMPLEMENT.
