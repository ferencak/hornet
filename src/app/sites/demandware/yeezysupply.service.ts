import { Injectable } from '@angular/core';
import { RequestService } from '../../request.service';
const { CookieJar } = require('tough-cookie');
let got = require('got')
import { AppConfig } from './../../../environments/environment'
let db = require('diskdb')

@Injectable({
  providedIn: 'root'
})
export class YeezySupplyService {

  private task: any
  private mouseData: any = null
  private mouseDataDatabase: any
  constructor(
    private requestService: RequestService
  ) { }

  async make(task: any) {
    console.log(task)
    this.task = task
    const cookieJar = new CookieJar()
    this.getCookie(cookieJar, true)

    if(this.task.product.mode == 'safe') {
      this.mouseDataDatabase = db.connect('/hornet/db', ['mousedata'])
      this.mouseData = this.mouseDataDatabase.mousedata.find()
    }

  }

  async getSensorData(cookie: any = false, mousedata: any = false) {
    let response = await got(`${AppConfig.akamai.api.url}/ys/generateSensorData`, { 
      decompress: false,
      headers: {
        'authorization': btoa(`${AppConfig.akamai.api.username}:${AppConfig.akamai.api.password}`),
        'abck-cookie': cookie ? cookie : 'nothing', 
        'mousedata': mousedata ? mousedata : 'nothing'
      }
    })
    return JSON.parse(response.body)
  }

  async getCookie(jar: any, initial: Boolean = false) {
    this.task.info.status = 'other|Getting Cookie'
    let sensorDataResponse: any, form: any, abck: any, validCookie: any
    if(initial) {
      sensorDataResponse = await this.getSensorData()
      form = {
        'sensor_data': sensorDataResponse.sensor_data
      }
      // First request
      let firstRequest = await got(`https://www.yeezysupply.com/static/${AppConfig.akamai.name}`, { 
        cookieJar: jar,
        method: "post",
        json: form,
        decompress: false,
        headers: {
          'origin': 'https://www.yeezysupply.com',
          'referer': 'https://www.yeezysupply.com/',
          'user-agent': sensorDataResponse.user_agent,
          'content-type': 'text/plain',
          'content-length': form.length
        }
      })

			for (let i = 0; i < firstRequest.headers['set-cookie'].length; i++) {
				if (firstRequest.headers['set-cookie'][i].includes('abck')) {
					abck = firstRequest.headers['set-cookie'][i].split(';')[0].replace('_abck=', '')
				}
      }
      let selectedMouseData = this.mouseData[0]
      console.log(selectedMouseData.data)
      sensorDataResponse = await this.getSensorData(abck, JSON.stringify(selectedMouseData.data))
      this.mouseDataDatabase.mousedata.remove({_id: selectedMouseData._id})
      form = {
        'sensor_data': sensorDataResponse.sensor_data
      }
      console.log(`https://www.yeezysupply.com/static/${AppConfig.akamai.name}`)
      let secondRequest = await got(`https://www.yeezysupply.com/static/${AppConfig.akamai.name}`, { 
        cookieJar: jar,
        method: "post",
        json: form,
        decompress: false,
        headers: {
          'origin': 'https://www.yeezysupply.com',
          'referer': 'https://www.yeezysupply.com/',
          'user-agent': sensorDataResponse.user_agent,
          'content-type': 'text/plain',
          'content-length': JSON.stringify(form).length
        }
      })

      for (let i = 0; i < secondRequest.headers['set-cookie'].length; i++) {
        if (secondRequest.headers['set-cookie'][i].includes('abck')) {
          validCookie = secondRequest.headers['set-cookie'][i].split(';')[0].replace('_abck=', '')
        }
      }

      console.log('asd', secondRequest)
      console.log('valid', validCookie)

    }
  }


}