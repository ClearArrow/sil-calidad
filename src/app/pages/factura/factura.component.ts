import { Component, OnInit } from '@angular/core';
import { Factura, Proyecto } from '../../services/interfaces.service';
import { HttpService } from '../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DialogConfirmacionComponent } from '../../components/dialog-confirmacion/dialog-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css'],
})
export class FacturaComponent implements OnInit {
  factura: Factura;
  id: string | number;
  proyecto: Proyecto | null;
  cargando = false;
  constructor(
    public httpServ: HttpService,
    private pdfServ: PdfService,
    private ruta: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ruta.params.subscribe((params) => {
      this.id = params['id'];
    });
    this.httpServ.cargando = true;
    // Esperar por si todavía se está subiendo la retención
    const intervalo = setInterval(() => {
      if (!this.httpServ.subiendoRetencion) {
        clearInterval(intervalo);
        this.httpServ.obtenerDatosFactura(this.id).subscribe(
          (factura) => {
            if (!factura) {
              this.toastr.error('No se encontró la factura', 'No existe');
              this.router.navigateByUrl('/facturas');
              return;
            }
            this.factura = factura;
            this.proyecto = factura.cotizacion.proyectos?.length
              ? factura.cotizacion.proyectos[0]
              : null;
          },
          (error) => {
            this.toastr.error('Ocurrió un error', 'Error');
            console.log(error);
            this.router.navigateByUrl('/facturas');
          }
        );
      }
    }, 500);
  }

  anularFactura(factura: Factura) {
    const dialogRef = this.dialog.open(DialogConfirmacionComponent, {
      data: {
        titulo: `Confirmar`,
        mensaje: `¿Anular la factura?`,
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.httpServ
        .editar('factura', factura.no_DTE, {
          factura: {
            no_DTE: factura.no_DTE,
            estado_factura: 'anulada',
          },
        })
        .subscribe(
          () => {
            this.factura.estado_factura = 'anulada';
            this.toastr.success('Factura anulada con éxito', 'Listo');
          },
          (error) => {
            console.log(error);
            this.toastr.error('Ocurrió un error', 'Error');
          }
        );
    });
  }

  enviarFactura(factura: Factura) {
    this.cargando = true;
    this.pdfServ.generarPDFFactura(factura, true).getDataUrl((dataURL: any) => {
      this.httpServ
        .enviarCorreo({
          sender: 'contabilidad@serviciosil.com',
          replyTo: 'contabilidad@serviciosil.com',
          to: `${factura.cotizacion.cliente.email},contabilidad@serviciosil.com`,
          subject: `Factura #${factura.no_DTE} - Servicios SIL`,
          html: `<p>Adjunto la factura para el proyecto <strong>${factura.cotizacion.titulo}</strong>.</p><p>Servicios Industriales López.</p>`,
          attachments: [
            {
              filename: `Factura ${factura.no_DTE}.pdf`,
              content: dataURL.split('base64,')[1],
              encoding: 'base64',
            },
          ],
        })
        .subscribe(
          (res) => {
            this.httpServ
              .editar('factura', factura.no_DTE, {
                factura: {
                  no_DTE: factura.no_DTE,
                  estado_factura: 'enviada',
                },
              })
              .subscribe(() => {
                this.cargando = false;
                this.toastr.success(
                  'Factura enviada al cliente con éxito',
                  'Listo'
                );
              });
          },
          (error) => {
            console.log(error);
            this.cargando = false;
            this.toastr.error('Ocurrió un error', 'Error');
          }
        );
    });
  }

  imprimirFactura(factura: Factura) {
    this.pdfServ.generarPDFFactura(factura);
  }
}
