---
description: Resume interrupted TDD workflow
---

You are helping a developer resume the TDD workflow from where it was interrupted.

## Workflow Reminder

The TDD workflow has three stages:

1. **One-time setup**: DESIGN (optional) → SCOPE (define all epics, no stories yet)
2. **Per-epic**: STORIES (define stories for the current epic only)
3. **Per-story iteration**: REALIGN → SPECIFY → IMPLEMENT → REVIEW → VERIFY → commit → (next story)

After VERIFY passes for a story:
- If more stories in epic → REALIGN for next story
- If no more stories but more epics → STORIES for next epic
- If no more stories and no more epics → Feature complete!

## Step 1: Validate Workflow State

First, check if workflow state exists and is valid:



```bash
node .claude/scripts/transition-phase.js --show
```

### If `status: "no_state"` or state appears stale:

**Automatically attempt to repair the state first:**
```bash
node .claude/scripts/transition-phase.js --repair
```

If repair succeeds, show the user the detected state and ask them to confirm before proceeding.

If repair fails (no artifacts found), ask the user:
> "No workflow state or artifacts found. Would you like to start fresh with `/start`, or describe the current state so I can help you continue?"

**Important:** After repair, check the **confidence level** in the output:
- `"confidence": "high"` - State is reliable, show summary and proceed
- `"confidence": "medium"` - Show the `detected` and `assumed` arrays, ask user to confirm
- `"confidence": "low"` - **REQUIRE** user to verify before proceeding, show warning prominently

The repair output includes:
- `detected`: What was clearly found in artifacts
- `assumed`: What was inferred (may be wrong)
- `confidenceReason`: Explanation of confidence level

### If state exists:

Display a brief summary:
```
Current State:
- Epic: [N] - [name]
- Story: [M] - [title] (if in per-story phases)
- Phase: [phase]
```

Ask the user to confirm this is correct before proceeding. If they say it's wrong, use `--repair` or ask them to describe the correct state.

## Step 2: Detect Detailed State (if needed)

For additional context, run the detection script:

```bash
node .claude/scripts/detect-workflow-state.js json
```

This provides:
- `spec`: Path to feature specification
- `epics[]`: Array with each epic's name, phase, story/test counts, acceptance test progress
- `resume.epic`: Which epic to resume
- `resume.phase`: Detected phase from artifacts

**Note:** The `workflow-state.json` file is authoritative. The detection script provides supplementary information but should not override the state file.

## Step 3: Resume with Appropriate Agent

Based on `workflow-state.json`, determine the agent and context:

| Phase | Agent | Context to Provide |
|-------|-------|-------------------|
| SCOPE | `feature-planner` | Spec path |
| DESIGN | `ui-ux-designer` | Spec path |
| STORIES | `feature-planner` | Epic number, spec path |
| REALIGN | `feature-planner` | Epic number, story number, discovered-impacts.md path |
| SPECIFY | `test-generator` | Epic number, story number, story file path |
| IMPLEMENT | `developer` | Epic, story, test file path, failing tests (see below) |
| REVIEW | `code-reviewer` | Epic number, story number, files changed |
| VERIFY | `quality-gate-checker` | Epic number, story number |
| COMPLETE | — | Check next action from transition output |

Always provide: current epic number/name, current story number/name (from state), relevant file paths.

### For IMPLEMENT phase:

Before invoking `developer`, run `npm test` in `/web` to identify failing tests for the current story:
- Show the user which tests are failing
- Include the failing test output when handing off to the developer agent

### For COMPLETE phase:

The transition script determines what's next:
- More stories in epic → Proceed to REALIGN for next story
- No more stories but more epics → Proceed to STORIES for next epic
- No more stories and no more epics → Display success message - feature complete!

## Step 5: Remind Agent to Update State

**Critical:** Before handing off to an agent, remind them:

> "When you complete this phase, you MUST update the workflow state by running:
> ```bash
> # For epic-level phases (SCOPE, STORIES):
> node .claude/scripts/transition-phase.js --epic [N] --to [NEXT_PHASE]
>
> # For story-level phases (REALIGN, SPECIFY, IMPLEMENT, REVIEW, VERIFY):
> node .claude/scripts/transition-phase.js --epic [N] --story [M] --to [NEXT_PHASE]
> ```
> Do not proceed to the next phase without running this command."

## Error Handling

- **State file missing:** Use `--repair` to reconstruct from artifacts
- **State appears wrong:** Ask user to confirm or correct
- **Script fails:** Ask user to describe current state manually
- **Invalid transition:** Show allowed transitions and ask user what to do

## Script Execution Verification

**All transition scripts output JSON. Always verify the result before proceeding:**

1. `"status": "ok"` = Success, proceed to next step
2. `"status": "error"` = **STOP**, report the error to the user
3. `"status": "warning"` = Proceed with caution, inform user

**For repair operations**, check the confidence level (see Step 1 for details).

Example error handling:
```
# If script output shows:
{ "status": "error", "message": "Invalid transition..." }

# Then STOP and tell the user:
"The workflow transition failed: [message]. Please check the current state with /status."
```

## DO

- Always validate state at the start of the session
- Ask user to confirm state before proceeding
- Commit work before handing off to the next agent
- Remind agents to use the transition script

## DON'T

- Auto-approve anything on behalf of the user
- Skip state validation
- Trust artifact detection over the state file
- Proceed if the user says the state is wrong

## Related Commands

- `/start` - Start TDD workflow from the beginning
- `/status` - Show current progress without resuming
- `/quality-check` - Validate all 5 quality gates
