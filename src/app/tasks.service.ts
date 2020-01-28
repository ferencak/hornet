import { Injectable } from '@angular/core';

let db = require('diskdb')

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  
  private databse: any
  
  constructor() {
    this.databse = db.connect('/hornet/db', ['tasks'])
  }

  getTasks() {
    return this.databse.tasks.find()
  }

}
