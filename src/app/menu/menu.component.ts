import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  
  @Input() activePage: string
  
  constructor(
    private router: Router
  ) {}

  async ngOnInit() {
    let element = document.getElementById(this.activePage).firstElementChild
    element.setAttribute('id', 'active')
  }

  route(path) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
    this.router.navigate([path]))
  }

}
