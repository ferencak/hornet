import { Injectable } from '@angular/core';

let db = require('diskdb')

@Injectable({
  providedIn: 'root'
})
export class ProfilesService {
  
  private databse: any
  
  constructor() {
    this.databse = db.connect('/hornet/db', ['profiles'])
  }

  getProfiles() {
    return this.databse.profiles.find()
  }

}
