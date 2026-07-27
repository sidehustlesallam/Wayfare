import type { ReactNode } from 'react';
import { vi } from 'vitest';

vi.mock('leaflet', () => {
  class MockLatLngBounds {
    extend() {
      return this;
    }
  }

  class MockMap {
    setView() {
      return this;
    }
    fitBounds() {
      return this;
    }
    remove() {
      return this;
    }
  }

  return {
    default: {
      map: vi.fn(() => new MockMap()),
      tileLayer: vi.fn(() => ({ addTo: vi.fn(), remove: vi.fn() })),
      marker: vi.fn(() => ({
        addTo: vi.fn(),
        bindPopup: vi.fn(),
        bindTooltip: vi.fn(),
        remove: vi.fn(),
      })),
      polyline: vi.fn(() => ({ addTo: vi.fn(), remove: vi.fn() })),
      divIcon: vi.fn((options: { html?: string }) => options),
      icon: vi.fn((options: unknown) => options),
      latLngBounds: vi.fn(() => new MockLatLngBounds()),
      LatLngBounds: MockLatLngBounds,
    },
    LatLngBounds: MockLatLngBounds,
  };
});

vi.mock('react-leaflet', () => {
  const Passthrough = ({
    children,
  }: {
    children?: ReactNode;
  }): ReactNode => children ?? null;

  return {
    MapContainer: Passthrough,
    TileLayer: () => null,
    Marker: Passthrough,
    Popup: Passthrough,
    Tooltip: Passthrough,
    Polyline: () => null,
    CircleMarker: Passthrough,
    useMap: () => ({
      setView: vi.fn(),
      fitBounds: vi.fn(),
    }),
  };
});
