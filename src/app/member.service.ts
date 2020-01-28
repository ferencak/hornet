import { Injectable } from '@angular/core';
import { machineIdSync } from 'node-machine-id';
import { RestApiService } from './restapi.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  public logged: any = false

  constructor() { }

  async load() {
    //this.logged = await this.restapi.emit('is member logged', {})
  }

  getMachineId() {
    return machineIdSync(true)
  }

}
