import type {
  BorderCrossing,
  RouteSegment,
  Waypoint,
} from '../types';

export interface ItineraryDay {
  dayNumber: number;
  label: string;
  startWaypoint: Waypoint;
  endWaypoint: Waypoint;
  stops: Waypoint[];
  segments: RouteSegment[];
  distanceKm: number;
  durationMinutes: number;
  borderCrossings: BorderCrossing[];
  endsWithOvernight: boolean;
}

/**
 * Group the trip into daily legs using overnight stops and the driving cap.
 * A new day starts after an overnight waypoint, or when cumulative drive time
 * for the open day would exceed `drivingCapHours` after adding the next leg.
 */
export function buildDailyItinerary(
  waypoints: Waypoint[],
  segments: RouteSegment[],
  drivingCapHours: number,
): ItineraryDay[] {
  if (waypoints.length === 0) return [];

  const waypointById = new Map(waypoints.map((wp) => [wp.id, wp]));
  const capMinutes = drivingCapHours * 60;
  const days: ItineraryDay[] = [];

  let dayNumber = 1;
  let daySegments: RouteSegment[] = [];
  let dayStops: Waypoint[] = [waypoints[0]];
  let dayDistance = 0;
  let dayDuration = 0;
  let dayBorders: BorderCrossing[] = [];

  const flushDay = (endWaypoint: Waypoint, endsWithOvernight: boolean) => {
    days.push({
      dayNumber,
      label: `Day ${dayNumber}`,
      startWaypoint: dayStops[0],
      endWaypoint,
      stops: [...dayStops],
      segments: [...daySegments],
      distanceKm: Math.round(dayDistance * 100) / 100,
      durationMinutes: Math.round(dayDuration),
      borderCrossings: [...dayBorders],
      endsWithOvernight,
    });
    dayNumber += 1;
    daySegments = [];
    dayStops = [endWaypoint];
    dayDistance = 0;
    dayDuration = 0;
    dayBorders = [];
  };

  for (const segment of segments) {
    const to = waypointById.get(segment.toWaypointId);
    if (!to) continue;

    const wouldExceed =
      dayDuration > 0 && dayDuration + segment.durationMinutes > capMinutes;

    if (wouldExceed && daySegments.length > 0) {
      const previousEnd = dayStops[dayStops.length - 1];
      flushDay(previousEnd, previousEnd.stopType === 'overnight');
    }

    daySegments.push(segment);
    dayStops.push(to);
    dayDistance += segment.distanceKm;
    dayDuration += segment.durationMinutes;
    dayBorders.push(...segment.borderCrossings);

    const isLast = segment.toWaypointId === waypoints[waypoints.length - 1]?.id;
    if (to.stopType === 'overnight' && !isLast) {
      flushDay(to, true);
    }
  }

  if (daySegments.length > 0 || dayStops.length > 1) {
    const end = dayStops[dayStops.length - 1];
    flushDay(end, end.stopType === 'overnight');
  } else if (days.length === 0 && waypoints.length === 1) {
    days.push({
      dayNumber: 1,
      label: 'Day 1',
      startWaypoint: waypoints[0],
      endWaypoint: waypoints[0],
      stops: [waypoints[0]],
      segments: [],
      distanceKm: 0,
      durationMinutes: 0,
      borderCrossings: [],
      endsWithOvernight: false,
    });
  }

  return days;
}

/** Cumulative drive minutes to reach each waypoint (index-aligned). */
export function cumulativeDriveMinutes(
  waypoints: Waypoint[],
  segments: RouteSegment[],
): number[] {
  const totals = waypoints.map(() => 0);
  let running = 0;
  const indexById = new Map(waypoints.map((wp, i) => [wp.id, i]));

  for (const segment of segments) {
    running += segment.durationMinutes;
    const idx = indexById.get(segment.toWaypointId);
    if (idx !== undefined) {
      totals[idx] = running;
    }
  }

  return totals;
}
