import type { Spot } from '../types';
import { useGooglePlace } from '../hooks/useGooglePlace';

interface SpotResultProps {
  spot: Spot;
  showSpinAgain: boolean;
  spinAgainUsed: boolean;
  onSpinAgain: () => void;
}

export function SpotResult({ spot, showSpinAgain, spinAgainUsed, onSpinAgain }: SpotResultProps) {
  const { photoUrl, mapUrl, loading, error } = useGooglePlace(spot);
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${spot.name}, ${spot.address}`,
  )}`;

  return (
    <section className="spot-result">
      <p className="eyebrow">Today&apos;s pick</p>
      <h2 className="spot-name">{spot.name}</h2>
      <p className="spot-address">{spot.address}</p>

      {loading && <p className="status-message">Loading from Google Maps…</p>}

      {photoUrl && (
        <img className="spot-photo" src={photoUrl} alt={`${spot.name} on Google Maps`} loading="lazy" />
      )}

      {mapUrl ? (
        <iframe
          className="spot-map"
          title={`Map of ${spot.name}`}
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        !loading && (
          <a className="text-link" href={mapsSearchUrl} target="_blank" rel="noreferrer">
            Open in Google Maps
          </a>
        )
      )}

      {error && <p className="status-message subtle">{error}</p>}

      {showSpinAgain && (
        <div className="action-row">
          <button type="button" className="button button-secondary" onClick={onSpinAgain}>
            Spin again
          </button>
        </div>
      )}

      {spinAgainUsed && (
        <p className="hint">That&apos;s your lunch sorted for today. Come back tomorrow for a new pick.</p>
      )}
    </section>
  );
}
