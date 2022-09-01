import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Cliente, Cotizacion } from '../../services/interfaces.service';
import { Observable, startWith, map, finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { FormRetencionComponent } from '../../components/form-retencion/form-retencion.component';
import { FirebaseService } from '../../services/firebase.service';
declare var $: any;

@Component({
  selector: 'app-form-factura',
  templateUrl: './form-factura.component.html',
  styleUrls: ['./form-factura.component.css'],
})
export class FormFacturaComponent implements OnInit {
  id: string | number;
  hayAdjunto = false;
  no_DTE = new UntypedFormControl(null, [Validators.required, this.esNumero]);
  serie = new UntypedFormControl(null, Validators.required);
  autorizacion = new UntypedFormControl(null, Validators.required);
  fecha_autorizacion = new UntypedFormControl(null, Validators.required);
  fecha_emision = new UntypedFormControl(null, Validators.required);
  descripcion = new UntypedFormControl(null, Validators.required);
  nit_receptor = new UntypedFormControl(null, Validators.required);
  nombre_receptor = new UntypedFormControl(null, Validators.required);
  moneda = new UntypedFormControl(null, Validators.required);
  cantidad = new UntypedFormControl(null, [
    Validators.required,
    this.esNumero,
    Validators.min(0),
  ]);
  precio = new UntypedFormControl(null, [
    Validators.required,
    this.esNumero,
    Validators.min(0),
  ]);
  estado_factura = new UntypedFormControl(null, Validators.required);
  enlace_doc = new UntypedFormControl(null);
  iva = new UntypedFormControl(null);
  isr = new UntypedFormControl(null);
  cotizacion = new UntypedFormControl(null, [
    Validators.required,
    this.cotiValido,
  ]);
  formulario: UntypedFormGroup;
  cotizaciones: Cotizacion[] = [];
  cotizacionesFiltradas: Observable<Cotizacion[]>;

  datosXML = {
    fechaEmision: '',
    fechaCertificacion: '',
    moneda: '',
    numeroAutorizacion: '',
    serie: '',
    numeroDTE: '',
    nombreReceptor: '',
    nitReceptor: '',
    noItem: '',
    bienServicio: '',
    cantidad: '',
    descripcion: '',
    precioUnitario: '',
    descuento: '',
    tipoImpuesto: '',
    impuestos: '',
    total: '',
  };

  constructor(
    private ruta: ActivatedRoute,
    public location: Location,
    private builder: UntypedFormBuilder,
    public httpServ: HttpService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    public fireServ: FirebaseService
  ) {}

  ngOnInit(): void {
    this.ruta.params.subscribe((params) => {
      this.id = params['id'];
      if (this.id == 'nueva') {
        // Crear nueva
        this.formulario = this.builder.group({
          no_DTE: this.no_DTE,
          serie: this.serie,
          autorizacion: this.autorizacion,
          fecha_autorizacion: this.fecha_autorizacion,
          fecha_emision: this.fecha_emision,
          nit_receptor: this.nit_receptor, // ok
          nombre_receptor: this.nombre_receptor, // ok
          moneda: this.moneda,
          descripcion: this.descripcion,
          cantidad: this.cantidad, // ok
          precio: this.precio, // ok
          estado_factura: this.estado_factura,
          enlace_doc: this.enlace_doc, // ok
          cotizacion: this.cotizacion,
          iva: this.iva,
          isr: this.isr,
        });
        this.datosIniciales();
      } else if (Number(this.id)) {
        // Editar
        this.formulario = this.builder.group({
          no_DTE: this.no_DTE,
          serie: this.serie,
          autorizacion: this.autorizacion,
          fecha_autorizacion: this.fecha_autorizacion,
          fecha_emision: this.fecha_emision,
          nit_receptor: this.nit_receptor, // ok
          nombre_receptor: this.nombre_receptor, // ok
          moneda: this.moneda,
          descripcion: this.descripcion,
          cantidad: this.cantidad, // ok
          precio: this.precio, // ok
          estado_factura: this.estado_factura,
          enlace_doc: this.enlace_doc, // ok
          cotizacion: this.cotizacion,
          iva: this.iva,
          isr: this.isr,
        });
        this.no_DTE.setValue(Number(this.id));
        this.httpServ.obtenerDatosFactura(this.id).subscribe((factura) => {
          if (factura) {
            this.serie.setValue(factura.serie);
            this.autorizacion.setValue(factura.autorizacion);
            this.fecha_autorizacion.setValue(factura.fecha_autorizacion);
            this.fecha_emision.setValue(factura.fecha_emision);
            this.nit_receptor.setValue(factura.nit_receptor);
            this.nombre_receptor.setValue(factura.nombre_receptor);
            this.moneda.setValue(factura.moneda);
            this.descripcion.setValue(factura.descripcion);
            this.cantidad.setValue(factura.cantidad);
            this.precio.setValue(factura.precio);
            this.estado_factura.setValue(factura.estado_factura);
            this.enlace_doc.setValue(factura.enlace_doc);
            this.cotizacion.setValue(factura.cotizacion);
            console.log(factura);
            for (const retencion of factura.retenciones) {
              retencion.factura = this.id
              if (retencion.impuesto_tipo == 'IVA') {
                this.iva.setValue(retencion);
              } else if (retencion.impuesto_tipo == 'ISR') {
                this.isr.setValue(retencion);
              }
            }
            this.datosIniciales();
          } else {
            this.location.back();
            this.toastr.error(
              'No se encontró una factura con ese DTE',
              'Error'
            );
            return;
          }
        });
      } else {
        // No puso número de parámetro
        this.location.back();
        this.toastr.error('No se encontró una factura con ese DTE', 'Error');
        return;
      }
    });
  }

  procesarXML() {
    let readXml = null;
    this.datosXML.fechaEmision = '';
    this.datosXML.fechaCertificacion = '';
    this.datosXML.moneda = '';
    this.datosXML.numeroAutorizacion = '';
    this.datosXML.serie = '';
    this.datosXML.numeroDTE = '';
    this.datosXML.nombreReceptor = '';
    this.datosXML.nitReceptor = '';
    this.datosXML.noItem = '';
    this.datosXML.bienServicio = '';
    this.datosXML.cantidad = '';
    this.datosXML.descripcion = '';
    this.datosXML.precioUnitario = '';
    this.datosXML.descuento = '';
    this.datosXML.tipoImpuesto = '';
    this.datosXML.impuestos = '';
    this.datosXML.total = '';
    let selectedFile = (<HTMLInputElement>document.getElementById('input'))
      .files![0];
    let reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        readXml = e.target.result;
        let parser = new DOMParser();
        let doc = parser.parseFromString(readXml, 'application/xml');
        // console.log(doc.all)
        // datos obtenidos del xml
        this.datosXML.fechaEmision =
          doc.all[2].children[0].children[0].attributes[1].value;
        this.datosXML.fechaCertificacion =
          doc.all[2].children[0].children[0].attributes[1].value;
        this.datosXML.moneda =
          doc.all[2].children[0].children[0].attributes[0].value;
        this.datosXML.numeroAutorizacion =
          doc.all[1].children[0].children[1].children[2].innerHTML;
        this.datosXML.serie =
          doc.all[1].children[0].children[1].children[2].attributes[1].value;
        this.datosXML.numeroDTE =
          doc.all[1].children[0].children[1].children[2].attributes[0].value;
        this.datosXML.nombreReceptor = doc.all[12].attributes[2].value;
        this.datosXML.nitReceptor = doc.all[12].attributes[1].value;
        this.datosXML.noItem = '1';
        this.datosXML.bienServicio =
          doc.all[16].attributes[0].value === 'S' ? 'Servicio' : 'Bien';
        this.datosXML.cantidad = doc.all[16].children[0].innerHTML;
        this.datosXML.descripcion = doc.all[16].children[1].innerHTML;
        this.datosXML.precioUnitario = doc.all[16].children[2].innerHTML;
        // var precio = doc.all[16].children[3].innerHTML;
        this.datosXML.descuento = doc.all[16].children[4].innerHTML;
        this.datosXML.tipoImpuesto = doc.all[23].children[0].innerHTML;
        this.datosXML.impuestos = doc.all[23].children[3].innerHTML;
        this.datosXML.total = doc.all[16].children[6].innerHTML;
        this.no_DTE.setValue(this.datosXML.numeroDTE);
        this.serie.setValue(this.datosXML.serie);
        this.autorizacion.setValue(this.datosXML.numeroAutorizacion);
        this.fecha_autorizacion.setValue(
          new Date(this.datosXML.fechaCertificacion)
        );
        this.fecha_emision.setValue(new Date(this.datosXML.fechaEmision));
        this.nit_receptor.setValue(this.datosXML.nitReceptor);
        this.nombre_receptor.setValue(this.datosXML.nombreReceptor);
        this.descripcion.setValue(this.datosXML.descripcion);
        this.moneda.setValue(this.datosXML.moneda);
        this.cantidad.setValue(this.datosXML.cantidad);
        this.precio.setValue(this.datosXML.precioUnitario);
        this.estado_factura.setValue('emitida');
        // this.enlace_doc.setValue('');
        // this.cotizacion.setValue(null);
        console.log(
          this.datosXML.fechaEmision,
          this.datosXML.fechaCertificacion,
          this.datosXML.moneda,
          this.datosXML.numeroAutorizacion,
          this.datosXML.serie,
          this.datosXML.numeroDTE,
          this.datosXML.nombreReceptor,
          this.datosXML.nitReceptor,
          this.datosXML.noItem,
          this.datosXML.bienServicio,
          this.datosXML.cantidad,
          this.datosXML.descripcion,
          this.datosXML.precioUnitario,
          this.datosXML.descuento,
          this.datosXML.tipoImpuesto,
          this.datosXML.impuestos,
          this.datosXML.total
        );
      } catch (err) {
        console.log(err);
        this.toastr.error('Archivo no válido', 'Error');
      }
    };
    reader.readAsText(selectedFile);
  }

  retencion(datosRetencion?: any) {
    let data: any = {};
    if (datosRetencion) {
      data = datosRetencion;
      data.factura = this.formulario.getRawValue();
    } else {
      data.factura = this.formulario.getRawValue();
    }
    const dialogRef = this.dialog.open(FormRetencionComponent, {
      data,
      width: '370px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      if (res.impuesto_tipo == 'ISR') {
        this.isr.setValue(res);
      } else if (res.impuesto_tipo == 'IVA') {
        this.iva.setValue(res);
      }
    });
  }

  guardarFactura() {
    if (this.formulario.invalid) {
      console.log(this.formulario);
      return;
    }
    const factura = this.formulario.getRawValue();
    factura.cotizacion = factura.cotizacion.id_cotizacion;
    const iva = factura.iva || null;
    const isr = factura.isr || null;
    // Temporal
    delete factura.iva;
    delete factura.isr;

    if (this.id == 'nueva') {
      this.httpServ.insertar('factura', factura).subscribe(
        (res) => {
          this.location.back();
          this.toastr.success('Factura creada con éxito', 'Éxito');
          if (iva) {
            this.guardarRetencion(iva);
          }
          if (isr) {
            this.guardarRetencion(isr);
          }
        },
        (error) => {
          console.log(error);
          this.toastr.error('Ocurrió un error', 'Error');
        }
      );
    } else {
      // Actualizar
      this.httpServ.editar('factura', this.id, { factura }).subscribe(
        (res) => {
          this.location.back();
          this.toastr.success('Factura actualizada con éxito', 'Éxito');
          if (iva) {
            this.guardarRetencion(iva);
          }
          if (isr) {
            this.guardarRetencion(isr);
          }
        },
        (error) => {
          console.log(error);
          this.toastr.error('Ocurrió un error', 'Error');
        }
      );
    }
  }

  guardarRetencion(datos: any) {
    datos.factura = datos.factura.no_DTE || datos.factura;
    if (datos.adjunto) {
      this.httpServ.subiendoRetencion = true;
      let tipo = datos.impuesto_tipo == 'IVA' ? 'retencion_iva' : 'retencion_isr';
      const datosArchivo = this.fireServ.subirArchivo(tipo, datos.adjunto);
      datosArchivo.uploadTask
        .snapshotChanges()
        .pipe(
          finalize(() => {
            datosArchivo.storageRef.getDownloadURL().subscribe((url) => {
              datos.enlace_doc = url;
              // Insertar nueva
              if (!datos.id_retencion) {
                this.httpServ.insertar('retencion', datos).subscribe(
                  (res) => this.httpServ.subiendoRetencion = false,
                  (error) => {
                    console.log(error);
                    this.httpServ.subiendoRetencion = false
                    this.toastr.error('Ocurrió un error con la retención', 'Error');
                  }
                );
              } else {
                // Actualizar
                this.httpServ
                  .editar('retencion', datos.id_retencion, { retencion: datos })
                  .subscribe(
                    (res) => this.httpServ.subiendoRetencion = false,
                    (error) => {
                      console.log(error);
                      this.httpServ.subiendoRetencion = false
                      this.toastr.error('Ocurrió un error con la retención', 'Error');
                    }
                  );
              }
            });
          })
        )
        .subscribe(
          () => null,
          (error) => {
            this.toastr.error('Ocurrió un error con la retención', 'Error');
            this.httpServ.subiendoRetencion = false
            console.log(error);
          }
        );
    }
    else {
      if (!datos.id_retencion) {
        this.httpServ.insertar('retencion', datos).subscribe(
          (res) => null,
          (error) => {
            console.log(error);
            this.toastr.error('Ocurrió un error con la retención', 'Error');
          }
        );
      } else {
        // Actualizar
        this.httpServ
          .editar('retencion', datos.id_retencion, { retencion: datos })
          .subscribe(
            (res) => null,
            (error) => {
              console.log(error);
              this.toastr.error('Ocurrió un error con la retención', 'Error');
            }
          );
      }
    }
  }

  eliminarRetencion(retencion: any) {
    if (retencion.value.id_retencion) {
      this.httpServ.eliminar('retencion', retencion.value.id_retencion).subscribe(() => {
        this.toastr.success('Se eliminó la retención', 'Listo');
        retencion.setValue(null);
      }, (error) => {
        console.log(error);
        this.toastr.error('Ocurrió un error con la retención', 'Error');
      });
    }
    else {
      retencion.setValue(null);
      this.toastr.success('Se eliminó la retención', 'Listo');
    }
  }

  cotiValido(control: UntypedFormControl) {
    if (typeof control.value == 'object') {
      return null;
    }
    return {
      noExiste: true,
    };
  }

  datosIniciales() {
    // Cargar las cotizaciones para listarlas
    this.httpServ.cargarCotizaciones(false, true).subscribe((datos) => {
      this.cotizaciones = datos;
      /* Filtrar cotizaciones */
      this.cotizacionesFiltradas = this.cotizacion.valueChanges.pipe(
        startWith(''),
        map((valor) => {
          const titulo = typeof valor === 'string' ? valor : valor?.titulo;
          return titulo
            ? this._filtrar(titulo as string)
            : this.cotizaciones.slice();
        })
      );
    });
  }

  private _filtrar(nombre: string): Cotizacion[] {
    const filterValue = nombre.toLowerCase();

    return this.cotizaciones.filter((option) =>
      option.titulo.toLowerCase().includes(filterValue)
    );
  }

  esNumero(control: UntypedFormControl) {
    if (isNaN(control.value)) {
      return {
        noNumero: true,
      };
    }
    return null;
  }

  mostrarTitulo(cotizacion: Cotizacion): string {
    return cotizacion && cotizacion.titulo ? cotizacion.titulo : '';
  }
}
