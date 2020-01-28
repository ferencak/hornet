import { AppConfig } from './../../environments/environment';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss']
})
export class VersionComponent implements OnInit {

  public environment: any = AppConfig
  
  constructor() { }

  ngOnInit() {
  }

}
