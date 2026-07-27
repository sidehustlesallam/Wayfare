import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { WaypointList } from './WaypointList';
import type { Waypoint } from '../../types';
import '../../test/mocks/leaflet';

vi.mock('@dnd-kit/core', async () => {
  const actual =
    await vi.importActual<typeof import('@dnd-kit/core')>('@dnd-kit/core');

  return {
    ...actual,
    DndContext: ({
      children,
      onDragEnd,
    }: {
      children: ReactNode;
      onDragEnd?: (event: DragEndEvent) => void;
    }) => (
      <div data-testid="dnd-context">
        <button
          type="button"
          data-testid="simulate-reorder"
          onClick={() =>
            onDragEnd?.({
              active: { id: 'wp_1' },
              over: { id: 'wp_2' },
            } as DragEndEvent)
          }
        >
          Simulate reorder
        </button>
        {children}
      </div>
    ),
  };
});

const sampleWaypoints: Waypoint[] = [
  {
    id: 'wp_1',
    label: 'Paris',
    lat: 48.85,
    lng: 2.35,
    stopType: 'must-visit',
  },
  {
    id: 'wp_2',
    label: 'Lyon',
    lat: 45.75,
    lng: 4.85,
    stopType: 'must-visit',
  },
];

describe('WaypointList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles stop type and reports removals', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onStopTypeChange = vi.fn();
    const onReorder = vi.fn();

    render(
      <WaypointList
        waypoints={sampleWaypoints}
        onRemove={onRemove}
        onStopTypeChange={onStopTypeChange}
        onReorder={onReorder}
      />,
    );

    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Lyon')).toBeInTheDocument();

    const overnightButtons = screen.getAllByRole('button', {
      name: /overnight/i,
    });
    await user.click(overnightButtons[0]);
    expect(onStopTypeChange).toHaveBeenCalledWith('wp_1', 'overnight');

    const mustVisitButtons = screen.getAllByRole('button', {
      name: /must visit/i,
    });
    await user.click(mustVisitButtons[1]);
    expect(onStopTypeChange).toHaveBeenCalledWith('wp_2', 'must-visit');

    await user.click(screen.getByLabelText('Remove Paris'));
    expect(onRemove).toHaveBeenCalledWith('wp_1');
  });

  it('propagates drag-and-drop reorder events to onReorder', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();

    render(
      <WaypointList
        waypoints={sampleWaypoints}
        onRemove={vi.fn()}
        onStopTypeChange={vi.fn()}
        onReorder={onReorder}
      />,
    );

    await user.click(screen.getByTestId('simulate-reorder'));
    expect(onReorder).toHaveBeenCalledWith(0, 1);
  });
});
