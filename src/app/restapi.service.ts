import { MemberService } from './member.service';
import { Injectable } from '@angular/core';
let got = require('got')

@Injectable({
  providedIn: 'root'
})
export class RestApiService {

  constructor(
    private member: MemberService
  ) { }

  async emit(event: string, args: any, next = false) {
    try {
      return await got(`http://89.203.249.215:3344/1.0/${event}/${this.member.getMachineId()}/${ next ? next : '' }`, args)
    } catch ( error ) {
      console.error('Error', error)
    }
  }

}
