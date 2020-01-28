import { Injectable } from '@angular/core';
import { RequestService } from '../../request.service';
const { CookieJar } = require('tough-cookie');
let got = require('got')
import { AppConfig } from './../../../environments/environment'
let db = require('diskdb')
const unzipResponse = require('unzip-response');

@Injectable({
  providedIn: 'root'
})
export class YeezySupplyService {

  private cookieJar = new CookieJar()
  private task: any
  private mouseData: any = null
  private mouseDataDatabase: any
  private validCookie: String
  private userAgent: string

  constructor(
    private requestService: RequestService
  ) { }

  async make(task: any) {
    this.task = task

    if(this.task.product.mode == 'safe') {
      this.mouseDataDatabase = db.connect('/hornet/db', ['mousedata'])
      this.mouseData = this.mouseDataDatabase.mousedata.find()
    }
    this.task.info.status = 'other|Getting Cookie'
    await this.getCookie(this.cookieJar, true)

    this.task.info.status = 'other|Finding product'
    await this.checkProduct()
  
  }

  async checkProduct() {
    console.log(`https://www.yeezysupply.com/api/products/${this.task.product.id}/availability`)
    let response = await got(`https://www.yeezysupply.com/api/products/${this.task.product.id}/availability`, {
      decompress: false,
      method: 'GET',
      cookieJar: this.cookieJar,
      gzip: true, 
      headers: {
        'user-agent': this.userAgent,
        'origin': 'http://www.yeezysupply.com',
				'referer': `https://www.yeezysupply.com/product/${this.task.product.id}/`,
        'content-type': 'application/json',
				'accept': 'application/json',
				'accept-encoding': 'gzip, deflate',
				'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin'
      }
    })
    let res = unzipResponse(response)
    console.log(res)
  }

  async getSensorData(cookie: any = false, mousedata: any = false) {
    let response = await got(`${AppConfig.akamai.api.url}/ys/generateSensorData`, { 
      decompress: false,
      headers: {
        'authorization': btoa(`${AppConfig.akamai.api.username}:${AppConfig.akamai.api.password}`),
        'abck-cookie': cookie ? cookie : 'false', 
        'mousedata': mousedata ? mousedata : 'false'
      }
    })
    return JSON.parse(response.body)
  }

  async getCookie(jar: any, initial: Boolean = false) {
    let sensorDataResponse: any, form: any, abck: any, validCookie: any
    if(initial) {
      sensorDataResponse = await this.getSensorData()
      form = {
        'sensor_data': sensorDataResponse.sensor_data
      }
      this.userAgent = sensorDataResponse.user_agent
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
      sensorDataResponse = await this.getSensorData(abck, JSON.stringify(selectedMouseData.data))
      this.mouseDataDatabase.mousedata.remove({_id: selectedMouseData._id})

      form = {
        'sensor_data': sensorDataResponse.sensor_data
      }

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
          'content-length': form.length
        }
      })

      for (let i = 0; i < secondRequest.headers['set-cookie'].length; i++) {
        if (secondRequest.headers['set-cookie'][i].includes('abck')) {
          validCookie = secondRequest.headers['set-cookie'][i].split(';')[0].replace('_abck=', '')
        }
      }

      this.validCookie = validCookie

    }
  }

  async addToCart() {

  }


}