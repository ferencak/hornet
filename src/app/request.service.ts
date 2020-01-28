import { Injectable } from '@angular/core';
let got = require('got')

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor() { }

  async post(url: string, args: any) {
    try {
      return await got.post(url, args)
    } catch ( error ) {
      console.error('Error', error)
    }
  }

  async get(url: string, args: any) {
    try {
      return await got(url, args)
    } catch ( error ) {
      console.error('Error', error)
    }
  }

}
