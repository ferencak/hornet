import { Component, OnInit } from '@angular/core'
import * as $ from 'jquery'
import 'jqueryui'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
let hostile = require('hostile')
import { NgxCaptchaModule } from 'ngx-captcha';
import express from 'express'

@Component({
  selector: 'app-harvester',
  templateUrl: './harvester.component.html',
  styleUrls: ['./harvester.component.scss']
})
export class HarvesterComponent implements OnInit {
  
  public selected: Boolean = false
  public site: String
  public step: Number = 0

  protected aFormGroup: FormGroup;
 
  constructor(private formBuilder: FormBuilder) {}
 

  ngOnInit() {
    this.step = 0
    this.aFormGroup = this.formBuilder.group({
      recaptcha: ['', Validators.required]
    });
  }
  
  select(site: String) {
    this.step = 1
    $("#setup").fadeOut(250, () => {
      $("#loading").fadeIn(500, () => {
        setTimeout(() => {
          this.selected = true
          this.site = site
          this.setup()
        }, 1250)
      })
    })
  }

  back() {
    this.step = 0
    console.log('A')
    $("#loading").fadeOut(250, () => {
      $("#setup").fadeIn(500, () => {
        this.selected = false
      })
    })
  }

  add() {
    let remote = require('electron').remote
    let BrowserWindow = remote.BrowserWindow
    let win = new BrowserWindow({ 
      width: 400,
      height: 550,
      minWidth: 400,
      minHeight: 550,
      maxWidth:400,
      maxHeight:550,
      webPreferences: {
        nodeIntegration: true,
      },
      frame:false,
    })
    win.loadURL('http://localhost:4200/#/harvester')
    win.show()
  }

  setup() {
    hostile.set('127.0.0.1', `hornetaio.${this.site}`, function (err) {
      if (err) {
        return
      }
    })
    this.step = 2

  
  }

}
