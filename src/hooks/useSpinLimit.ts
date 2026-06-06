import { useCallback, useState } from 'react';
import type { Spot, SpinDayState } from '../types';
import { getUkDateString } from '../utils/ukDate';

const STORAGE_KEY = 'lunch-randomiser-spin';

function createFreshState(): SpinDayState {
  return {
    ukDate: getUkDateString(),
    spinAgainUsed: false,
    pickedSpot: null,
  };
}

function readState(): SpinDayState {
  const today = getUkDateString();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createFreshState();
    }

    const parsed = JSON.parse(raw) as SpinDayState;
    if (parsed.ukDate !== today) {
      return createFreshState();
    }

    return {
      ukDate: today,
      spinAgainUsed: Boolean(parsed.spinAgainUsed),
      pickedSpot: parsed.pickedSpot ?? null,
    };
  } catch {
    return createFreshState();
  }
}

function writeState(state: SpinDayState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useSpinLimit() {
  const [state, setState] = useState(() => readState());

  const saveState = useCallback((next: SpinDayState) => {
    writeState(next);
    setState(next);
  }, []);

  const recordPick = useCallback(
    (spot: Spot) => {
      saveState({
        ukDate: getUkDateString(),
        spinAgainUsed: false,
        pickedSpot: spot,
      });
    },
    [saveState],
  );

  const recordSpinAgain = useCallback(
    (spot: Spot) => {
      saveState({
        ukDate: getUkDateString(),
        spinAgainUsed: true,
        pickedSpot: spot,
      });
    },
    [saveState],
  );

  const canPickToday = state.pickedSpot === null;
  const canSpinAgain = state.pickedSpot !== null && !state.spinAgainUsed;

  return {
    todaySpot: state.pickedSpot,
    canPickToday,
    canSpinAgain,
    recordPick,
    recordSpinAgain,
  };
}
