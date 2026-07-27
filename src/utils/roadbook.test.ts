import { describe, expect, it } from 'vitest';
import { buildGpxDocument, buildRoadbookText } from './roadbook';
import type { ManeuverStep, Waypoint } from '../types';

const waypoints: Waypoint[] = [
  {
    id: 'a',
    label: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    stopType: 'must-visit',
  },
  {
    id: 'b',
    label: 'Lyon',
    lat: 45.764,
    lng: 4.8357,
    stopType: 'overnight',
  },
];

const steps: ManeuverStep[] = [
  {
    index: 0,
    instruction: 'Depart onto Rue de Rivoli',
    streetName: 'Rue de Rivoli',
    distanceMeters: 250,
    durationSeconds: 40,
    type: 'depart',
    location: { lat: 48.8566, lng: 2.3522 },
  },
  {
    index: 1,
    instruction: 'Turn right onto A6',
    streetName: 'A6',
    distanceMeters: 12000,
    durationSeconds: 600,
    type: 'turn',
    modifier: 'right',
    location: { lat: 48.8, lng: 2.4 },
  },
];

describe('buildGpxDocument', () => {
  it('includes waypoints, trackpoints, and route points', () => {
    const gpx = buildGpxDocument({
      name: 'Paris → Lyon',
      waypoints,
      track: [
        { lat: 48.8566, lng: 2.3522 },
        { lat: 45.764, lng: 4.8357 },
      ],
      steps,
    });

    expect(gpx).toContain('<?xml version="1.0"');
    expect(gpx).toContain('<gpx version="1.1"');
    expect(gpx).toContain('<wpt lat="48.8566" lon="2.3522">');
    expect(gpx).toContain('<name>Paris</name>');
    expect(gpx).toContain('<trkpt lat="45.764" lon="4.8357">');
    expect(gpx).toContain('<rtept lat="48.8" lon="2.4">');
    expect(gpx).toContain('Turn right onto A6');
  });

  it('escapes XML special characters in labels', () => {
    const gpx = buildGpxDocument({
      name: 'A & B <test>',
      waypoints: [
        {
          ...waypoints[0],
          label: 'Cafe & Bar',
        },
      ],
      track: [],
    });

    expect(gpx).toContain('A &amp; B &lt;test&gt;');
    expect(gpx).toContain('Cafe &amp; Bar');
  });
});

describe('buildRoadbookText', () => {
  it('lists stops and turn-by-turn instructions', () => {
    const text = buildRoadbookText({
      title: 'Paris → Lyon',
      waypoints,
      steps,
      totalDistanceKm: 465,
      totalDurationMinutes: 280,
    });

    expect(text).toContain('Paris → Lyon');
    expect(text).toContain('1. Paris (must-visit)');
    expect(text).toContain('Turn right onto A6');
    expect(text).toContain('12.0 km');
  });
});
