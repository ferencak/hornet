import { Injectable } from '@angular/core';

let db = require('diskdb')

@Injectable({
  providedIn: 'root'
})
export class ProfilesService {

  private databse: any

  constructor() {
    let dbPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    this.databse = db.connect(dbPath + '/hornet/db', ['profiles'])
  }

  getProfiles () {
    return this.databse.profiles.find()
  }

}
