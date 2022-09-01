import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-estado-proyecto',
  templateUrl: './estado-proyecto.component.html',
  styleUrls: ['./estado-proyecto.component.css']
})
export class EstadoProyectoComponent implements OnInit {
  estado = '';
  constructor(
    public dialogRef: MatDialogRef<EstadoProyectoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.estado = data.estado;
  }

  ngOnInit(): void {
  }

}
