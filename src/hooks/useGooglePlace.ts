import { useEffect, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import type { Spot } from '../types';

interface PlaceDetails {
  photoUrl: string | null;
  mapUrl: string | null;
}

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
let mapsConfigured = false;

function ensureMapsConfigured() {
  if (!mapsConfigured && apiKey) {
    setOptions({ key: apiKey, v: 'weekly' });
    mapsConfigured = true;
  }
}

function buildMapEmbedUrl(query: string): string | null {
  if (!apiKey) return null;
  const params = new URLSearchParams({ key: apiKey, q: query });
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}

function buildMapsLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function useGooglePlace(spot: Spot | null) {
  const [details, setDetails] = useState<PlaceDetails>({ photoUrl: null, mapUrl: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spot) {
      setDetails({ photoUrl: null, mapUrl: null });
      setLoading(false);
      setError(null);
      return;
    }

    const query = `${spot.name}, ${spot.address}`;
    const mapUrl = buildMapEmbedUrl(query);
    const mapsLink = buildMapsLink(query);

    if (!apiKey) {
      setDetails({ photoUrl: null, mapUrl });
      setLoading(false);
      setError('Google Maps API key is not configured.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetails({ photoUrl: null, mapUrl });

    ensureMapsConfigured();

    void importLibrary('places')
      .then((places) => {
        const container = document.createElement('div');
        const service = new places.PlacesService(container);

        return new Promise<google.maps.places.PlaceResult | null>((resolve) => {
          service.findPlaceFromQuery(
            {
              query,
              fields: ['photos', 'name', 'formatted_address'],
            },
            (results, status) => {
              if (status === places.PlacesServiceStatus.OK && results?.[0]) {
                resolve(results[0]);
                return;
              }
              resolve(null);
            },
          );
        });
      })
      .then((place) => {
        if (cancelled) return;

        const photoRef = place?.photos?.[0]?.getUrl({ maxWidth: 800, maxHeight: 500 }) ?? null;

        setDetails({ photoUrl: photoRef, mapUrl });
        setError(place ? null : `Could not find this place on Google Maps. Open in Maps: ${mapsLink}`);
      })
      .catch(() => {
        if (cancelled) return;
        setDetails({ photoUrl: null, mapUrl });
        setError(`Could not load place details. Open in Maps: ${mapsLink}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [spot]);

  return { ...details, loading, error };
}
