export class freeParkingReq {
    slot_id?: number;
    car_reg_no?: string;
    constructor(slot_id: null | number, car_reg_no: null | string){
        if(slot_id){
            this.slot_id = slot_id;
        }else{
            this.car_reg_no = car_reg_no;
        }
    }
}
  