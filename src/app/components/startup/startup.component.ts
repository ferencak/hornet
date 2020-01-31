import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { AppConfig } from './../../../environments/environment'
import { MemberService } from '../../member.service'
import { Component, OnInit } from '@angular/core'
import { RestApiService } from '../../restapi.service'
import * as fs from 'fs'

let db = require('diskdb')

@Component({
  selector: 'app-startup',
  templateUrl: './startup.component.html',
  styleUrls: ['./startup.component.scss']
})
export class StartupComponent implements OnInit {

  public environment: any = AppConfig
  public memberStatus: any = 'await'
  public hasKey: boolean
  public isError: boolean = false

  /**
   * undefined = startup loading
   * 1         = checking for updates
   * 2         = updating
   * 3         = starting
   */
  public loadingStage: Number
  public loadedMessage: String
  public form: FormGroup

  private dbConfig: any

  constructor(
    private restapi: RestApiService,
    private member: MemberService,
    private formBuilder: FormBuilder,
  ) { }

  async ngOnInit () {

    if (!fs.existsSync('/hornet')) {
      await fs.mkdirSync('/hornet')
      await fs.mkdirSync('/hornet/db')
    }

    let dbPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    this.dbConfig = db.connect(dbPath + '/hornet/db', ['config'])
    let config = this.dbConfig.config.find()
    if (config.length == 0) {
      this.dbConfig.config.save({ license: null })

      this.memberStatus = 'license'
      this.form = this.formBuilder.group({
        license: ['', [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
      })

    } else if (config.length == 1) {
      if (config[0].license == null) {
        this.memberStatus = 'license'
        this.form = this.formBuilder.group({
          license: ['', [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
        })
      } else {
        let response = await this.restapi.emit('member/license', { decompress: false }, config[0].license)
        response.body == 'true' ? this.continue() : this.abort()
      }
    } else {
      // Corrupted
    }

  }

  async checkLicense (license = false) {
    let response = await this.restapi.emit('member/license', { decompress: false }, this.form.value.license)
    response.body == 'true' ? this.registerLicense() : this.abort()
  }

  registerLicense () {
    this.dbConfig.config.update({ license: null }, { license: this.form.value.license }, { multi: false, upsert: false })
    this.continue()
  }

  abort () {
    this.memberStatus = 'license'
    this.form = this.formBuilder.group({
      license: ['', [Validators.required, Validators.minLength(36), Validators.maxLength(36)]]
    })
    this.isError = true
  }

  async continue () {
    this.isError = false
    await setTimeout(async () => {
      this.memberStatus = await this.restapi.emit('member/valid', { decompress: false })
      this.checkForUpdates()
    }, 1500)
  }

  async checkForUpdates () {
    await setTimeout(async () => {
      this.loadingStage = 1

      let response: any = await this.restapi.emit('application/version', { decompress: false });
      if (response.body.replace('.', '') > AppConfig.version.replace('.', '')) {
        this.loadedMessage = 'Updating...'
      } else {
        this.loadedMessage = 'Launching interface...'
        setTimeout(() => {
          const remote = require('electron').remote
          const BrowserWindow = remote.BrowserWindow
          var win = new BrowserWindow({
            width: 1200,
            height: 750,
            minWidth: 800,
            minHeight: 700,
            webPreferences: {
              nodeIntegration: true,
            },
            frame: false,
            center: true
          })

          /*win.loadURL(url.format({
            pathname: path.join(__dirname, './index.html'),
            protocol: 'file:',
            slashes: true,
            hash: '/dashboard'
          }));*/

          win.loadURL('http://localhost:4200/#/dashboard')
          remote.getCurrentWindow().close()
          win.show()
        }, 1000)
      }
    }, 1000)
  }

}