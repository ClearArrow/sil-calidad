import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpService } from './services/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public httpServ: HttpService, private cdref: ChangeDetectorRef) {}
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }
}
