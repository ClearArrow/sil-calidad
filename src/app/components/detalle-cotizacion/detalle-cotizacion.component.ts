import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-detalle-cotizacion',
  templateUrl: './detalle-cotizacion.component.html',
  styleUrls: ['./detalle-cotizacion.component.css']
})
export class DetalleCotizacionComponent implements OnInit {
  @Input() detalle: string;
  @Input() cantidad: number;
  @Input() precio: number;
  @Input() unidad: number;
  @Output() itemActualizado = new EventEmitter<any>();
  @Output() quitarDetalle = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  actualizar() {
    this.itemActualizado.emit({
      detalle: this.detalle,
      cantidad: this.cantidad,
      precio: this.precio,
      unidad: this.unidad
    });
  }

}
