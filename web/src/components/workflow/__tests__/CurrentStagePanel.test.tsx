/**
 * Tests for CurrentStagePanel Component
 *
 * Tests current stage display panel showing stage name,
 * description, status, next stage, and action buttons.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CurrentStagePanel } from '@/components/workflow/CurrentStagePanel';

// Mock date formatting utilities
vi.mock('@/lib/utils/date-formatting', () => ({
  formatDateTime: vi.fn((dateStr: string) => 'Jan 6, 2026 at 11:30 AM'),
  formatRelativeTime: vi.fn((dateStr: string) => '2 days ago'),
  formatReportDate: vi.fn((dateStr: string) => 'January 2026'),
}));

// Mock ConfirmDataButton component
vi.mock('@/components/batches/ConfirmDataButton', () => ({
  ConfirmDataButton: () => <button>Confirm Data Ready</button>,
}));

describe('CurrentStagePanel', () => {
  describe('Stage Information Display', () => {
    it('displays current stage name for Level 2 Approval', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level2Pending"
          lastUpdated="2026-01-06T11:30:00Z"
          isLocked={false}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(screen.getByText('Level 2 Approval')).toBeInTheDocument();
    });

    it('displays stage description for Data Preparation', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="DataPreparation"
          lastUpdated="2026-01-05T09:00:00Z"
          isLocked={false}
          canConfirm={true}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(
          /All required data must be collected, validated, and confirmed/i,
        ),
      ).toBeInTheDocument();
    });

    it('displays stage description for Level 1 Pending', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level1Pending"
          lastUpdated="2026-01-06T10:00:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Operations approval focusing on file receipt/i),
      ).toBeInTheDocument();
    });

    it('displays stage description for Level 2 Pending', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level2Pending"
          lastUpdated="2026-01-06T11:30:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Portfolio Manager approval focusing on holdings/i),
      ).toBeInTheDocument();
    });

    it('displays stage description for Level 3 Pending', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level3Pending"
          lastUpdated="2026-01-06T14:00:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Executive approval for final sign-off/i),
      ).toBeInTheDocument();
    });
  });

  describe('Status Message Display', () => {
    it('shows status with formatted timestamp for Level 2 Approval', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level2Pending"
          lastUpdated="2026-01-06T11:30:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Awaiting PM approval since Jan 6, 2026 at 11:30 AM/i),
      ).toBeInTheDocument();
    });

    it('shows status with relative time for Data Preparation', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="DataPreparation"
          lastUpdated="2026-01-05T09:00:00Z"
          isLocked={false}
          canConfirm={true}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/In preparation for 2 days/i),
      ).toBeInTheDocument();
    });

    it('shows status for Level 1 Pending', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level1Pending"
          lastUpdated="2026-01-06T10:00:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Awaiting operations approval since/i),
      ).toBeInTheDocument();
    });

    it('shows status for Level 3 Pending', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level3Pending"
          lastUpdated="2026-01-06T14:00:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Awaiting executive approval since/i),
      ).toBeInTheDocument();
    });
  });

  describe('Next Stage Indicator', () => {
    it('shows next stage as Level 1 Approval after Data Preparation', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="DataPreparation"
          lastUpdated="2026-01-05T09:00:00Z"
          isLocked={false}
          canConfirm={true}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Next: Level 1 Approval \(Operations\)/i),
      ).toBeInTheDocument();
    });

    it('shows next stage as Level 2 Approval after Level 1', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level1Pending"
          lastUpdated="2026-01-06T10:00:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Next: Level 2 Approval \(Portfolio Manager\)/i),
      ).toBeInTheDocument();
    });

    it('shows next stage as Level 3 Approval after Level 2', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level2Pending"
          lastUpdated="2026-01-06T11:30:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Next: Level 3 Approval \(Executive\)/i),
      ).toBeInTheDocument();
    });

    it('shows next stage as Approved after Level 3', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level3Pending"
          lastUpdated="2026-01-06T14:00:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByText(/Next: Approved \(Published\)/i),
      ).toBeInTheDocument();
    });

    it('does not show next stage when batch is already Approved', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Approved"
          lastUpdated="2026-01-07T10:00:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(screen.queryByText(/Next:/i)).not.toBeInTheDocument();
    });
  });

  describe('Rejection Alert', () => {
    it('shows rejection alert when lastRejection exists', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="DataPreparation"
          lastUpdated="2026-01-21T09:00:00Z"
          isLocked={false}
          canConfirm={true}
          reportDate="2026-01-31"
          lastRejection={{
            date: '2026-01-20T14:30:00Z',
            level: 'Level 2',
            reason: 'Missing credit ratings for 5 instruments',
          }}
        />,
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Returned to Data Preparation/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Missing credit ratings for 5 instruments/i),
      ).toBeInTheDocument();
    });

    it('shows rejection alert with Level 1 rejection details', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="DataPreparation"
          lastUpdated="2026-01-21T09:00:00Z"
          isLocked={false}
          canConfirm={true}
          reportDate="2026-01-31"
          lastRejection={{
            date: '2026-01-20T14:30:00Z',
            level: 'Level 1',
            reason: 'Data validation failed',
          }}
        />,
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Data validation failed/i)).toBeInTheDocument();
    });

    it('does not show rejection alert when lastRejection is null', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="DataPreparation"
          lastUpdated="2026-01-05T09:00:00Z"
          isLocked={false}
          canConfirm={true}
          reportDate="2026-01-31"
        />,
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('shows Confirm Data Ready button when canConfirm is true', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="DataPreparation"
          lastUpdated="2026-01-05T09:00:00Z"
          isLocked={false}
          canConfirm={true}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.getByRole('button', { name: /Confirm Data Ready/i }),
      ).toBeInTheDocument();
    });

    it('does not show Confirm Data Ready button when canConfirm is false', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level2Pending"
          lastUpdated="2026-01-06T11:30:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(
        screen.queryByRole('button', { name: /Confirm Data Ready/i }),
      ).not.toBeInTheDocument();
    });

    it('shows View Batch Details button', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level2Pending"
          lastUpdated="2026-01-06T11:30:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      const button = screen.getByRole('link', {
        name: /View Batch Details/i,
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', '/batches/1');
    });

    it('links to correct batch details page with batch ID', () => {
      render(
        <CurrentStagePanel
          batchId={42}
          currentStage="DataPreparation"
          lastUpdated="2026-01-05T09:00:00Z"
          isLocked={false}
          canConfirm={true}
          reportDate="2026-01-31"
        />,
      );

      const button = screen.getByRole('link', {
        name: /View Batch Details/i,
      });
      expect(button).toHaveAttribute('href', '/batches/42');
    });
  });

  describe('Panel Structure', () => {
    it('has card header with title', () => {
      render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level2Pending"
          lastUpdated="2026-01-06T11:30:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      expect(screen.getByText('Current Workflow Stage')).toBeInTheDocument();
    });

    it('uses Card component for layout', () => {
      const { container } = render(
        <CurrentStagePanel
          batchId={1}
          currentStage="Level2Pending"
          lastUpdated="2026-01-06T11:30:00Z"
          isLocked={true}
          canConfirm={false}
          reportDate="2026-01-31"
        />,
      );

      // Card component uses data-slot attribute
      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
    });
  });
});
