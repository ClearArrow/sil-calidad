import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { Cotizacion } from 'src/app/services/interfaces.service';
import { DialogConfirmacionComponent } from '../../components/dialog-confirmacion/dialog-confirmacion.component';
import { PdfService } from '../../services/pdf.service';
import { Factura } from '../../services/interfaces.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-facuras',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css'],
})
export class FacturasComponent implements OnInit {
  facturas: any[] = [];
  deshabilitarRipple = false;
  datosFacturas: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  cargando = false;
  campos = [
    'no_DTE',
    'serie',
    'fecha_autorizacion',
    'fecha_emision',
    'nombre_receptor',
    'estado_factura',
    'precio',
    'proyecto',
  ];
  constructor(
    public httpServ: HttpService,
    private dialog: MatDialog,
    private pdfServ: PdfService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.mostrarFacturas();
  }

  mostrarFacturas() {
    this.httpServ.cargarFacturas().subscribe((facturas) => {
      for (const factura of facturas) {
        const temp: any = factura;
        temp.fecha_autorizacion = new Date(temp.fecha_autorizacion);
        temp.fecha_emision = new Date(temp.fecha_emision);
        if (factura.cotizacion.proyectos?.length) {
          temp.proyecto = factura.cotizacion.proyectos[0].id_proyecto;
        }
        this.facturas.push(temp);
      }
      this.datosFacturas = new MatTableDataSource<any>(this.facturas);
      setTimeout(() => {
        this.datosFacturas.paginator = this.paginator;
        this.datosFacturas.sort = this.sort;
      });
    });
  }

  filtrarFacturas(filterValue: any) {
    this.datosFacturas.filter = filterValue?.value.trim().toLowerCase();
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
            this.toastr.success('Factura anulada con éxito', 'Listo');
            for (let i = 0; i < this.facturas.length; i++) {
              if (this.facturas[i].no_DTE == factura.no_DTE) {
                this.facturas[i].estado_factura = 'anulada';
              }
            }
            this.datosFacturas = new MatTableDataSource<any>(this.facturas);
            setTimeout(() => {
              this.datosFacturas.paginator = this.paginator;
              this.datosFacturas.sort = this.sort;
            });
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
                for (let i = 0; i < this.facturas.length; i++) {
                  if (this.facturas[i].no_DTE == factura.no_DTE) {
                    this.facturas[i].estado_factura = 'enviada';
                  }
                }
                this.datosFacturas = new MatTableDataSource<any>(this.facturas);
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
