import type { Spot } from '../types';
import { useSpinLimit } from '../hooks/useSpinLimit';
import { pickRandomSpot } from '../utils/random';
import { SpotResult } from './SpotResult';

interface RandomiserProps {
  spots: Spot[];
}

export function Randomiser({ spots }: RandomiserProps) {
  const { todaySpot, canPickToday, canSpinAgain, recordPick, recordSpinAgain } = useSpinLimit();

  const handleHungry = () => {
    if (!canPickToday) return;

    const pick = pickRandomSpot(spots);
    if (pick) recordPick(pick);
  };

  const handleSpinAgain = () => {
    if (!todaySpot || !canSpinAgain) return;

    const pick = pickRandomSpot(spots, todaySpot.id);
    if (pick) recordSpinAgain(pick);
  };

  const hasAlternativeSpots = todaySpot
    ? spots.some((spot) => spot.id !== todaySpot.id)
    : false;

  if (spots.length === 0) {
    return (
      <section className="panel">
        <p className="status-message">No lunch spots yet. Add one to get started.</p>
      </section>
    );
  }

  if (!todaySpot) {
    return (
      <section className="panel centre">
        <button type="button" className="button button-primary button-large" onClick={handleHungry}>
          I&apos;m hungry
        </button>
      </section>
    );
  }

  return (
    <SpotResult
      spot={todaySpot}
      showSpinAgain={canSpinAgain && hasAlternativeSpots}
      spinAgainUsed={!canSpinAgain}
      onSpinAgain={handleSpinAgain}
    />
  );
}
