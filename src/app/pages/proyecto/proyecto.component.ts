import { Component, OnInit } from '@angular/core';
import { Proyecto } from '../../services/interfaces.service';
import { HttpService } from 'src/app/services/http.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-proyecto',
  templateUrl: './proyecto.component.html',
  styleUrls: ['./proyecto.component.css']
})
export class ProyectoComponent implements OnInit {
  proyecto: Proyecto;
  id: string | number;
  constructor(public httpServ: HttpService, private ruta: ActivatedRoute) {
    
  }

  ngOnInit(): void {
    this.ruta.params.subscribe((params) => {
      this.id = params['id'];
      this.httpServ.obtenerDatosProyecto(this.id).subscribe(proyecto => {
        this.proyecto = proyecto;
      });
    });
  }

}
