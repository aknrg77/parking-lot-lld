import { Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import { Car } from './car.model';
import { ParkingSpot } from './parkingSpot.model';

@Injectable()
export class ParkingService {
  private ParkingSpots: ParkingSpot[] = [];
  private CarColorMap = new Map<string, [string, number][]>();
  private CarRegMap = new Map<string, [string, number]>();

  createSlot(no_of_slot: number) {
    this.ParkingSpots = [];
    this.check_no_of_slots(no_of_slot);
    for (let i = 1; i <= no_of_slot; i++) {
      const newParkingSpot = new ParkingSpot(i, true, null);
      this.ParkingSpots.push(newParkingSpot);
    }
    return no_of_slot;
  }

  addSlot(increment_slot: number){
    if(this.ParkingSpots.length === 0){
      throw new BadRequestException("Parking slots not created");
    }
    this.check_no_of_slots(increment_slot);
    let slot = this.ParkingSpots[this.ParkingSpots.length - 1].slotId + 1;
    for (let i = 1; i <= increment_slot; i++) {
      const newParkingSpot = new ParkingSpot(slot, true, null);
      slot += 1;
      this.ParkingSpots.push(newParkingSpot);
    }
    return this.ParkingSpots.length;
  }

  park(car_reg_no: string, car_color: string) {
    const [parkingSpot, parkingSpotIndex] = this.customFind({ isEmpty: true });

    if(this.CarRegMap.get(car_reg_no) !== undefined){
      throw new BadRequestException("Car already Parked");
    }

    const updatedParkingSpot = { ...parkingSpot };
    const newCar = new Car(car_reg_no, car_color);
    updatedParkingSpot.car = newCar;
    updatedParkingSpot.isEmpty = false;
    this.ParkingSpots[parkingSpotIndex] = updatedParkingSpot;

    this.CarRegMap.set(car_reg_no, [car_color, parkingSpotIndex]);
    let carColor = this.CarColorMap.get(car_color);

    if(carColor === undefined){
      this.CarColorMap.set(car_color, [[car_reg_no, parkingSpotIndex]]);
    }else{
      this.CarColorMap.delete(car_color);
      carColor.push([car_reg_no, parkingSpotIndex]);
      this.CarColorMap.set(car_color, carColor);
    }
    
    return this.ParkingSpots[parkingSpotIndex].slotId;
  }

  clear(slot_or_car_reg_no: { slot_id?: number; car_reg_no?: string }) {
    if (
      !('slot_id' in slot_or_car_reg_no) &&
      !('car_reg_no' in slot_or_car_reg_no)
    ) {
      throw new NotFoundException();
    }

    if ('slot_id' in slot_or_car_reg_no) {
      const [parkingSpot, parkingSpotIndex] = this.customFind({
        slot_id: slot_or_car_reg_no.slot_id,
      });
      const updatedParkingSpot = { ...parkingSpot };
      
      if(parkingSpot.isEmpty === true){
        throw new BadRequestException("Parking already freed");
      }

      this.CarRegMap.delete(parkingSpot.car.car_reg_no);
      let carColorList = this.CarColorMap.get(parkingSpot.car.car_color);
      if(carColorList.length === 1){
        this.CarColorMap.delete(parkingSpot.car.car_color);
      }else{
        let p = carColorList.filter((cc) => cc[0] !== parkingSpot.car.car_reg_no)
        this.CarColorMap.delete(parkingSpot.car.car_color);
        this.CarColorMap.set(parkingSpot.car.car_color, p);
      }


      updatedParkingSpot.isEmpty = true;
      updatedParkingSpot.car = null;
      this.ParkingSpots[parkingSpotIndex] = updatedParkingSpot;
      return this.ParkingSpots[parkingSpotIndex].slotId;
    }

    if ('car_reg_no' in slot_or_car_reg_no) {
      const [parkingSpot, parkingSpotIndex] = this.customFind({
        car_reg_no: slot_or_car_reg_no.car_reg_no,
      });
      const updatedParkingSpot = { ...parkingSpot };

      if(parkingSpot.isEmpty === true){
        throw new BadRequestException("Parking already freed");
      }


      this.CarRegMap.delete(parkingSpot.car.car_reg_no);
      let carColorList = this.CarColorMap.get(parkingSpot.car.car_color);
      if(carColorList.length === 1){
        this.CarColorMap.delete(parkingSpot.car?.car_color);
      }else{
        let p = carColorList.filter((cc) => cc[0] !== parkingSpot.car.car_reg_no)
        this.CarColorMap.delete(parkingSpot.car.car_color);
        this.CarColorMap.set(parkingSpot.car.car_color, p);
      }


      updatedParkingSpot.isEmpty = true;
      updatedParkingSpot.car = null;
      this.ParkingSpots[parkingSpotIndex] = updatedParkingSpot;
      return this.ParkingSpots[parkingSpotIndex].slotId;
    }

    throw new NotFoundException('Slot id or car reg no not found');
  }

  getAllCarsWithColor(color: string) {
    let result = this.CarColorMap.get(color.toString());
    if(result === undefined){
      return [];
    }

    let mappedResult = result.map((spot) => spot[0]);
    return mappedResult;
  }

  getAllSlotsWithColor(color: string) {
    let result = this.CarColorMap.get(color.toString());
    if(result === undefined){
      return [];
    }

    let mappedResult = result.map((spot) => spot[1]);
    return mappedResult;
  }

  fetchAllParkingSlots() {
    const result = this.ParkingSpots.filter((spot) => spot.isEmpty === false);
    let mappedResult = result.map((spot) => ({
      slot_id: spot.slotId,
      car_reg_no: spot.car.car_reg_no,
      color: spot.car.car_color,
    }));
    return mappedResult;
  }

  private check_no_of_slots(no_of_slot: number){
    if(isNaN(no_of_slot) || no_of_slot<0){
      throw new BadRequestException("Invalid no_of_slot");
    }
  }

  private customFind(to_find: {
    car_color?: string;
    isEmpty?: boolean;
    slot_id?: number;
    car_reg_no?: string;
  }) {
    let parkingSpotIndex;

    switch (true) {
      case 'car_color' in to_find:
        parkingSpotIndex = this.ParkingSpots.findIndex(
          (spot) => spot.car.car_color === to_find.car_color,
        );
        break;
      case 'isEmpty' in to_find:
        parkingSpotIndex = this.ParkingSpots.findIndex(
          (spot) => spot.isEmpty === to_find.isEmpty,
        );
        break;
      case 'slot_id' in to_find:
        parkingSpotIndex = this.ParkingSpots.findIndex(
          (spot) => spot.slotId === to_find.slot_id,
        );
        break;
      case 'car_reg_no' in to_find:
        parkingSpotIndex = this.ParkingSpots.findIndex(
          (spot) => spot.car.car_reg_no === to_find.car_reg_no,
        );
        break;
      default:
        throw new NotFoundException();
    }
    const parkingSpot = this.ParkingSpots[parkingSpotIndex];
    return [parkingSpot, parkingSpotIndex];
  }
}
