import { useCallback, useEffect, useState } from 'react';
import type { Spot, SpotsData } from '../types';

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpots = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/spots.json?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Could not load lunch spots.');
      }

      const data = (await response.json()) as SpotsData;
      setSpots(data.spots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSpots();
  }, [fetchSpots]);

  const addSpotLocally = useCallback((spot: Spot) => {
    setSpots((current) => [...current, spot]);
  }, []);

  return { spots, loading, error, fetchSpots, addSpotLocally };
}
