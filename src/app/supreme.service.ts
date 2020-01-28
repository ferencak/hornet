import { RequestService } from './request.service'
import { Injectable } from '@angular/core'
const esprima = require('esprima')
const { CookieJar } = require('tough-cookie')
let cheerio = require('cheerio')
let got = require('got')

@Injectable({
  providedIn: 'root'
})
export class SupremeService {
  
  private body: any
  private pookieFileURI: any

  constructor(
    private requestService: RequestService
  ) { }

  async make(task: any) {
    const cookieJar = new CookieJar()
    console.log(task)
    let response = await this.requestService.get(task.typeValue, {
      cookieJar: cookieJar,
      decompress: false
    })
    /*
    KW
    let mobileStock = await this.requestService.get('https://www.supremenewyork.com/mobile_stock.json', {
      cookieJar: cookieJar, 
      decompress: false
    })
    */
    let $ = cheerio.load(response.body)

    this.body = response. body
    this.pookieInit()

    let formData = {
      utf8: '✓', 
      style: null,
      size: null, 
      commit: 'add to basket' 
    }

    $('select[name="size"]').find('option').each((i,op) => {
      if($(op).text() == 'XLarge' && task.product.size == 'xl') {
        formData.size = Number($(op).val())
      } else if($(op).text() == 'Large' && task.product.size == 'l') {
        formData.size = Number($(op).val())
      } else if($(op).text() == 'Medium' && task.product.size == 'm') {
        formData.size = Number($(op).val())
      } else if($(op).text() == 'Small' && task.product.size == 's') {
        formData.size = Number($(op).val())
      } else {
        // Size weren't found
      }
   })
   formData.style = Number($('input[name="style"]').val())
   let post = await got(`https://www.supremenewyork.com${$("form").attr('action')}`, {
     cookieJar: cookieJar, 
     body: formData, 
     form: true,
     decompress: false,
     headers: {
       'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
       'x-csrf-token': $("meta[name='csrf-token']").attr('content'), 
       'x-requested-with': 'XMLHttpRequest',
       'referer': task.typeValue,
       'origin': 'https://www.supremenewyork.com',
       'Accept-Encoding': 'gzip, deflate, br',
       'Accept-Language': 'cs-CZ,cs;q=0.9',
       'Accept': '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
     }
   })

   if(post.statusCode == 200) {

   } else {
     
   }
  }

  async pookieInit() {
    this.body = "<script src='https://d17ol771963kd3.cloudfront.net/assets/pooky.min.3bdfd7c34bd126e2a302.js'></script>" + this.body
    const $ = cheerio.load(this.body)
    
    $('script').each((id, element) => {
      element = $(element).attr('src')
      if(element && element.includes('pooky')) {
       this.pookieFileURI = element
      }
    })  
    this.pookieParse()
  }

  async pookieParse() {
    let response = await this.requestService.get(this.pookieFileURI, {})
    let tokenize = esprima.tokenize(response.body)
    console.log(tokenize)
  }
}
