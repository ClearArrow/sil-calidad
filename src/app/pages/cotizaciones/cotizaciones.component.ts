import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { HttpService } from 'src/app/services/http.service';
import { Cotizacion } from 'src/app/services/interfaces.service';
import { DialogConfirmacionComponent } from '../../components/dialog-confirmacion/dialog-confirmacion.component';
import { PdfService } from '../../services/pdf.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cotizaciones',
  templateUrl: './cotizaciones.component.html',
  styleUrls: ['./cotizaciones.component.css'],
})
export class CotizacionesComponent implements OnInit {
  cotizaciones: Cotizacion[] = [];
  cotizacionesMostradas: Cotizacion[] = [];
  deshabilitarRipple = false;
  textoBuscado = '';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    public httpServ: HttpService,
    private dialog: MatDialog,
    private pdfServ: PdfService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.httpServ.cargarCotizaciones().subscribe((cotizaciones) => {
      this.cotizaciones = cotizaciones;
      if (cotizaciones.length > 5) {
        for (let i = 0; i < 5; i++) {
          this.cotizacionesMostradas.push(this.cotizaciones[i]);
        }
      } else {
        this.cotizacionesMostradas = cotizaciones;
      }
    });
  }

  onPageChange(event: any) {
    console.log(event);
    this.cotizacionesMostradas = this.cotizacionesBuscadas().slice(
      event.pageIndex * event.pageSize,
      event.pageIndex * event.pageSize + event.pageSize
    );
  }

  actualizarPaginas() {
    this.cotizacionesMostradas = this.cotizacionesBuscadas().slice(
      0,
      this.paginator.pageSize
    );
    this.paginator.firstPage();
  }

  eliminarCotizacion(cotizacion: Cotizacion, event: any) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DialogConfirmacionComponent, {
      data: {
        titulo: `Confirmar`,
        mensaje: `¿Eliminar la cotización?`,
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.httpServ.eliminar('cotizacion', cotizacion.id_cotizacion).subscribe(
        (res) => {
          this.toastr.success('Cotización eliminada con éxito', 'Listo');
          for (let i = 0; i < this.cotizaciones.length; i++) {
            if (
              this.cotizaciones[i].id_cotizacion == cotizacion.id_cotizacion
            ) {
              this.cotizaciones.splice(i, 1);
            }
          }
          this.cotizacionesMostradas = this.cotizaciones.slice(0, 5);
        },
        (error) => {
          console.log(error);
          this.toastr.error('Ocurrió un error', 'Error');
        }
      );
    });
  }

  generarPDF(cotizacion: Cotizacion, event: any) {
    event.stopPropagation();
    this.pdfServ.generarPDFCotizacion(cotizacion);
  }

  enviarCotizacion(cotizacion: Cotizacion, event: any, index: number) {
    event.stopPropagation();
    this.cotizacionesMostradas[index].cargando = true;
    this.pdfServ
      .generarPDFCotizacion(cotizacion, true)
      .getDataUrl((dataURL: any) => {
        this.httpServ
          .enviarCorreo({
            sender: 'contabilidad@serviciosil.com',
            replyTo: 'contabilidad@serviciosil.com',
            to: `${cotizacion.cliente.email},contabilidad@serviciosil.com`,
            subject: 'Cotización - Servicios SIL',
            html: `<p>Adjunto la cotización para el proyecto <strong>${cotizacion.titulo}</strong>.</p><p>Servicios Industriales López.</p>`,
            attachments: [
              {
                filename: 'Cotización.pdf',
                content: dataURL.split('base64,')[1],
                encoding: 'base64',
              },
            ],
          })
          .subscribe(
            (res) => {
              this.cotizacionesMostradas[index].cargando = false;
              this.toastr.success('Cotización enviada al cliente con éxito', 'Listo');
            },
            (error) => {
              console.log(error);
              this.cotizacionesMostradas[index].cargando = false;
              this.toastr.error('Ocurrió un error', 'Error');
            }
          );
      });
  }

  cotizacionesBuscadas() {
    if (!this.textoBuscado) {
      return this.cotizaciones;
    }
    return this.cotizaciones.filter(
      (cotizacion) =>
        `${cotizacion.cliente.nombre} ${cotizacion.titulo}`
          .toLocaleLowerCase()
          .indexOf(this.textoBuscado.toLocaleLowerCase()) != -1
    );
  }
}
