import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Factura } from '../../services/interfaces.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-retencion',
  templateUrl: './form-retencion.component.html',
  styleUrls: ['./form-retencion.component.css'],
})
export class FormRetencionComponent implements OnInit {
  impuesto_tipo: string;
  numero_retencion: number;
  factura: number;
  impuesto: number;
  fecha_recibido: Date;
  enlace_doc: string;
  estado = 'Realizada';
  id_retencion: number;
  adjunto: File;
  tieneIVA = false;
  tieneISR = false;

  constructor(
    public dialogRef: MatDialogRef<FormRetencionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
  ) {
    if (data.impuesto_tipo) {
      this.id_retencion = data.id_retencion || null;
      this.impuesto_tipo = data.impuesto_tipo;
      this.factura = data.factura.no_DTE;
      this.numero_retencion = data.numero_retencion;
      this.impuesto = data.impuesto;
      this.fecha_recibido = data.fecha_recibido;
      this.enlace_doc = data.enlace_doc;
      this.estado = data.estado;
    } else if (data.factura) {
      const factura: Factura = data.factura;
      this.fecha_recibido = factura.fecha_emision;
      this.factura = factura.no_DTE;
      console.log(data.factura);
      if (data.factura.isr) {
        this.tieneISR = true;
      }
      else if (data.factura.iva) {
        this.tieneIVA = true;
      }
      console.log(this.tieneISR, this.tieneIVA);
    }
  }

  ngOnInit(): void {}

  guardarCambios() {
    if (isNaN(this.numero_retencion) || isNaN(this.impuesto) || this.impuesto < 0) {
      this.toastr.error(
        'Verificar si el impuesto o el número de retención están correctos',
        'Error'
      );
      return;
    }
    if (!this.adjunto && !this.enlace_doc) {
      this.toastr.error('Es necesario adjuntar un archivo', 'Error');
      return;
    }
    this.dialogRef.close({
      impuesto_tipo: this.impuesto_tipo,
      numero_retencion: this.numero_retencion,
      factura: this.factura,
      impuesto: this.impuesto,
      fecha_recibido: this.fecha_recibido,
      enlace_doc: this.enlace_doc,
      estado: this.estado,
      id_retencion: this.id_retencion,
      adjunto: this.adjunto
    });
  }

  calcularImpuesto(tipo: string) {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,      
      maximumFractionDigits: 2,
   });
    if (tipo == 'ISR' && this.data.factura) {
      this.impuesto = Number(formatter.format((this.data.factura.precio / 1.12) * 0.05));
    } else if (tipo == 'IVA' && this.data.factura) {
      let iva = (this.data.factura.precio / 1.12) * 0.15 * 0.12;
      if (this.data.factura.nit_receptor == '31244017') {
        iva = iva * 2;
      }
      this.impuesto = Number(formatter.format(iva));
    }
  }

  adjuntarArchivo(event: any) {
    this.adjunto = event.target.files[0];
  }

  abrirDocumento(enlace_doc: string) {
    window.open(enlace_doc, '_blank');
  }
}
