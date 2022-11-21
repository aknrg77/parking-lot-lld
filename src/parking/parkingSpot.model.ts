import { Car } from './car.model';
export class ParkingSpot {
  constructor(
    public slotId: number,
    public isEmpty: boolean,
    public car: Car | null,
  ) {}
}
