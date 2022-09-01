import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirmacion',
  templateUrl: './dialog-confirmacion.component.html',
  styleUrls: ['./dialog-confirmacion.component.css'],
})
export class DialogConfirmacionComponent implements OnInit {
  titulo: string;
  mensaje: string;
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.titulo = data.titulo;
    this.mensaje = data.mensaje;
  }

  ngOnInit(): void {}
}
