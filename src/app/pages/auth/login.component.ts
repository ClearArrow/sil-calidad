import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { Proyecto } from 'src/app/services/interfaces.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  proyectos: Proyecto[] = [];
  constructor(public httpServ: HttpService) { }

  ngOnInit(): void {
    this.httpServ.cargarProyectos().subscribe(proyectos => {
      this.proyectos = proyectos;
    });
  }
  hide = true;
  email = new FormControl('', [Validators.required, Validators.email]);

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }
}