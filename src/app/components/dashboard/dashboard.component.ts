import { RequestService } from './../../request.service'
import { YeezySupplyService } from '../../sites/demandware/yeezysupply.service'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { FooterComponent } from './../../footer/footer.component'
import { MenuComponent } from './../../menu/menu.component'
import { Component, OnInit } from '@angular/core'
import * as $ from 'jquery'
import 'jqueryui'
import { ProfilesService } from '../../profiles.service'
import { TasksService } from '../../tasks.service'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { SupremeService } from '../../supreme.service'

const { shell } = window.require('electron')

let db = require('diskdb')
let cheerio = require('cheerio')

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public addTaskToggle: Boolean = false
  private database: any
  private loadedProfiles: any = []
  private loadedTasks: any = []

  value: Observable<number>
  tagSuggestions = ['google', 'apple', 'microsoft']

  public form: FormGroup

  constructor(
    private tasksService: TasksService,
    private profilesService: ProfilesService,
    private formBuilder: FormBuilder,
    private router: Router,
    private requestService: RequestService,

    private yeezySupplyService: YeezySupplyService,
    private supremeService: SupremeService
  ) {
    this.tasksService.getTasks().forEach((task) => {
      task.product.toggledName = task.product.name
      this.loadedTasks.push(task)
    })
    this.profilesService.getProfiles().forEach((profile) => {
      this.loadedProfiles.push(profile)
    })
  }

  ngOnInit () {
    $("#task-sortable").sortable({
      delay: 0,
      handle: '.drag-icon',
      helper: 'clone',
      revert: 250
    })
    $("#task-sortable").disableSelection()

    let dbPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    this.database = db.connect(dbPath + '/hornet/db', ['tasks'])
  }

  routeTo (path: String) {
    this.router.navigate([path])
  }

  addTask () {

    if (this.loadedProfiles.length == 0) {
      $(document).ready(function () {
        $("#form *").attr('disabled', 'disabled')
      })
    }
    this.form = this.formBuilder.group({
      searchType: ['url', Validators.required],
      typeValue: ['', Validators.required],
      size: ['3', Validators.required],
      site: ['supreme_eu', Validators.required],
      profile: ['', Validators.required],
      proxy: [''],
      tasksCount: ['1', Validators.required],
      tags: [['dog', 'cat', 'bird']],
      taskProductID: ['XX0000', ''],
      taskReleaseType: ['product', ''],
      taskMode: ['safe', '']
    })

    this.value = this.form.controls.tags.valueChanges

    this.addTaskToggle = this.addTaskToggle != true
    let buttonElement = document.getElementById("add-task")
    if (this.addTaskToggle) {
      buttonElement.classList.add('active')
      buttonElement.classList.remove('deactive')
    } else {
      buttonElement.classList.add('deactive')
      buttonElement.classList.remove('active')
    }
  }

  async create () {
    let productName
    if (this.form.value.searchType == 'url') {
      switch (this.form.value.site.split('|')[0]) {
        case 'shopify':
          break
        case 'demandware':
          productName = this.form.value.taskProductID
          break
        case 'footsites': break
        case 'supreme':
          productName = $(".protect").first().text() + ' ' + $(".style.protect").text()
          break
        default:
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate(['dashboard']))
      }
    }
    for (let i = 0; i < this.form.value.tasksCount; i++) {
      this.database.tasks.save({
        uniqueId: Math.random().toString(36).substring(9),
        typeValue: this.form.value.typeValue,
        profile: this.form.value.profile,
        proxy: this.form.value.proxy,
        tags: this.form.value.tags,
        product: {
          searchType: this.form.value.searchType,
          size: this.form.value.size,
          site: this.form.value.site,
          name: productName,
          id: this.form.value.taskProductID,
          releastType: this.form.value.taskReleaseType,
          mode: this.form.value.taskMode
        },
        info: {
          status: 'ready'
        }
      })
    }
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate(['dashboard']))
  }

  startTask (taskId: any, task: any) {
    let selectedTask = this.loadedTasks.find(r => r._id == taskId)
    selectedTask.info.status = 'waiting'
    if (task.product.site.includes('demandware')) {
      this.yeezySupplyService.make(task)
    } else if (task.product.site.includes('supreme')) {
      this.supremeService.make(task)
    } else if (task.product.site.includes('footsites')) {

    } else {
      console.error('Error', 'Unknown site')
    }
  }

  removeTask (taskId: any) {
    this.database.tasks.remove({ _id: this.loadedTasks[taskId]._id })
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate(['dashboard']))
  }

  openHarvester () {
    let remote = require('electron').remote
    let BrowserWindow = remote.BrowserWindow
    let win = new BrowserWindow({
      width: 300,
      height: 400,
      minWidth: 300,
      minHeight: 400,
      maxWidth: 300,
      maxHeight: 400,
      webPreferences: {
        nodeIntegration: true,
      },
      frame: false,
    })
    win.loadURL('http://localhost:4200/#/harvester')
    win.show()
  }

  toggleTask (taskId: any) {
    shell.openExternal(this.loadedTasks[taskId].typeValue)
  }

}