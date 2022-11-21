import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { freeParkingReq } from './freeParkingRequest';
import { ParkingService } from './parking.service';

@Controller()
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}
  @Post('parking_lot')
  addSlots(@Body('no_of_slot') no_of_slot: number) {
    const generatedSlots = this.parkingService.createSlot(no_of_slot);
    return { total_slots: generatedSlots };
  }

  @Patch('parking_lot')
  incrementSlots(@Body('increment_slot') increment_slot: number) {
    const incrementedSlots = this.parkingService.addSlot(increment_slot);
    return { total_slots: incrementedSlots };
  }

  @Post('park')
  addParking(@Body('car_reg_no') car_reg_no: string, @Body('car_color') car_color: string){
    const parked = this.parkingService.park(car_reg_no, car_color);
    return { allocated_slot_number: parked};
  }

  @Get('registration_numbers/:color')
  getCarsWithColors(@Param('color') color: string){
    return this.parkingService.getAllCarsWithColor(color);
  }

  @Get('slot_numbers/:color')
  getSlotsWithColors(@Param('color') color: string){
    return this.parkingService.getAllSlotsWithColor(color);
  }

  @Post('clear')
  unPark(@Body('slot_number') slot_id: number, @Body('car_registeration_no') car_reg_no: string){
    const freed_slot = this.parkingService.clear(new freeParkingReq(slot_id, car_reg_no));
    return {freed_slot_number: freed_slot};
  }

  @Get('status')
    getStatus(){
        return this.parkingService.fetchAllParkingSlots();
    }
}
