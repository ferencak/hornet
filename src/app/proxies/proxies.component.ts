import { Component, OnInit } from '@angular/core'
import * as $ from 'jquery'
import 'jqueryui'

@Component({
  selector: 'app-proxies',
  templateUrl: './proxies.component.html',
  styleUrls: ['./proxies.component.scss']
})
export class ProxiesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $("#proxy-sortable").sortable({
      delay: 0,
      handle: '.drag-icon', 
      helper: 'clone',
      revert: 250
    })
    $("#proxy-sortable").disableSelection()
  }

}
