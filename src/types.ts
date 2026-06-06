export interface Spot {
  id: string;
  name: string;
  address: string;
}

export interface SpotsData {
  spots: Spot[];
}

export interface SpinDayState {
  ukDate: string;
  spinAgainUsed: boolean;
  pickedSpot: Spot | null;
}
