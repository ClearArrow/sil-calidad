import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  template: `<div class="d-md-flex d-block" >
  <app-navbar></app-navbar>
  <div class="container mt-3" style="overflow:auto; max-height:calc(100vh - 1rem);">
    <router-outlet></router-outlet>
  </div>
</div>
`,
  styles: [
  ]
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
