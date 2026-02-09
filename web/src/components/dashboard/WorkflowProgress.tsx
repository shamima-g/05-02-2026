'use client';

import { Check } from 'lucide-react';

const WORKFLOW_STAGES = [
  { key: 'DataPreparation', label: 'Data Prep' },
  { key: 'Level1Pending', label: 'L1' },
  { key: 'Level2Pending', label: 'L2' },
  { key: 'Level3Pending', label: 'L3' },
  { key: 'Approved', label: 'Published' },
] as const;

function getStageIndex(status: string): number {
  const idx = WORKFLOW_STAGES.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

interface WorkflowProgressProps {
  status: string;
}

export function WorkflowProgress({ status }: WorkflowProgressProps) {
  const currentIndex = getStageIndex(status);
  const allCompleted = status === 'Approved';

  return (
    <div
      aria-label="Workflow progress"
      className="flex items-center gap-1 mt-2"
    >
      {WORKFLOW_STAGES.map((stage, i) => {
        let state: 'completed' | 'current' | 'pending';
        if (allCompleted) {
          state = 'completed';
        } else if (i < currentIndex) {
          state = 'completed';
        } else if (i === currentIndex) {
          state = 'current';
        } else {
          state = 'pending';
        }

        return (
          <div
            key={stage.key}
            data-stage-state={state}
            className="flex items-center gap-1"
          >
            {i > 0 && (
              <div
                className={`h-px w-3 ${
                  state === 'pending'
                    ? 'border-t border-dashed border-muted-foreground/40'
                    : 'bg-primary'
                }`}
              />
            )}
            <div
              className={`flex items-center justify-center rounded-full text-xs ${
                state === 'completed'
                  ? 'h-5 w-5 bg-primary text-primary-foreground'
                  : state === 'current'
                    ? 'h-5 w-5 bg-primary/20 text-primary ring-1 ring-primary'
                    : 'h-5 w-5 bg-muted text-muted-foreground'
              }`}
              title={stage.label}
            >
              {state === 'completed' ? (
                <Check className="h-3 w-3" />
              ) : state === 'current' ? (
                <span className="h-2 w-2 rounded-full bg-primary" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              )}
            </div>
            <span
              className={`text-xs ${
                state === 'current'
                  ? 'font-medium text-primary'
                  : state === 'completed'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/60'
              }`}
            >
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
