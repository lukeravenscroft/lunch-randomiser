import type { Spot } from '../types';

export function pickRandomSpot(spots: Spot[], excludeId?: string): Spot | null {
  const pool = excludeId ? spots.filter((spot) => spot.id !== excludeId) : spots;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
