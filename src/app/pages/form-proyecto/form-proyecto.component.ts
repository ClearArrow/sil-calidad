import {
  Component,
  OnInit,
  ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR,
} from '@angular/core';
import { HttpService } from '../../services/http.service';
import { ActivatedRoute } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { Cotizacion } from '../../services/interfaces.service';
import { Observable, startWith, map, finalize } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmacionComponent } from 'src/app/components/dialog-confirmacion/dialog-confirmacion.component';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-form-proyecto',
  templateUrl: './form-proyecto.component.html',
  styleUrls: ['./form-proyecto.component.css'],
})
export class FormProyectoComponent implements OnInit {
  id: string | number;
  id_proyecto = new UntypedFormControl(null, [Validators.required]);
  proyecto_estado = new UntypedFormControl('Aprobado', [Validators.required]);
  fecha_envio = new UntypedFormControl(null, Validators.required);
  cobro_estado = new UntypedFormControl(null, [Validators.required]);
  comentarios = new UntypedFormControl(null);
  cotizacion = new UntypedFormControl(null, [
    Validators.required,
    this.cotizacionValida,
  ]);
  formulario: UntypedFormGroup;
  formularioOC: UntypedFormGroup;
  formularioVR: UntypedFormGroup;
  cotizaciones: Cotizacion[] = [];
  cotizacionesFiltradas: Observable<Cotizacion[]>;
  con_orden = false;
  con_vale = false;
  ordenCompra = {
    no_orden_compra: new UntypedFormControl(null),
    fecha_recibida: new UntypedFormControl(null, [Validators.required]),
    nombre_elaborado: new UntypedFormControl(null, [Validators.required]),
    enlace_doc: new UntypedFormControl(null),
  };

  valeRecepcion = {
    vr_numero: new UntypedFormControl(null),
    fecha_recibido: new UntypedFormControl(null, [Validators.required]),
    enlace_doc: new UntypedFormControl(null),
  };

  adjuntoOC: File;
  adjuntoVR: File;

  constructor(
    private ruta: ActivatedRoute,
    public location: Location,
    private builder: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public httpServ: HttpService,
    private dialog: MatDialog,
    public fireServ: FirebaseService
  ) {
    this.ruta.params.subscribe((params) => {
      this.id = params['id'];
      if (this.id == 'nuevo') {
        // Crear nuevo
        this.formulario = builder.group({
          proyecto_estado: this.proyecto_estado,
          fecha_envio: this.fecha_envio,
          cobro_estado: this.cobro_estado,
          comentarios: this.comentarios,
          cotizacion: this.cotizacion,
        });
        this.datosIniciales();
      } else if (Number(this.id)) {
        // Editar
        this.formulario = builder.group({
          proyecto_estado: this.proyecto_estado,
          fecha_envio: this.fecha_envio,
          cobro_estado: this.cobro_estado,
          comentarios: this.comentarios,
          cotizacion: this.cotizacion,
          id_proyecto: this.id_proyecto,
        });
        this.formularioOC = builder.group({
          no_orden_compra: this.ordenCompra.no_orden_compra,
          fecha_recibida: this.ordenCompra.fecha_recibida,
          nombre_elaborado: this.ordenCompra.nombre_elaborado,
          enlace_doc: this.ordenCompra.enlace_doc,
        });
        this.formularioVR = builder.group({
          vr_numero: this.valeRecepcion.vr_numero,
          fecha_recibido: this.valeRecepcion.fecha_recibido,
          enlace_doc: this.valeRecepcion.enlace_doc,
        });
        this.id_proyecto.setValue(Number(this.id));
        this.httpServ.obtenerDatosProyecto(this.id).subscribe((proy) => {
          if (proy) {
            this.proyecto_estado.setValue(proy.proyecto_estado);
            this.fecha_envio.setValue(proy.fecha_envio || null);
            this.cobro_estado.setValue(proy.cobro_estado);
            this.comentarios.setValue(proy.comentarios);
            this.cotizacion.setValue(proy.cotizacion);
            if (proy.orden_compra) {
              this.con_orden = true;
              this.ordenCompra.no_orden_compra.setValue(
                proy.orden_compra.no_orden_compra
              );
              this.ordenCompra.fecha_recibida.setValue(
                proy.orden_compra.fecha_recibida
              );
              this.ordenCompra.nombre_elaborado.setValue(
                proy.orden_compra.nombre_elaborado
              );
              this.ordenCompra.enlace_doc.setValue(
                proy.orden_compra.enlace_doc
              );
            }
            if (proy.vale_recepcion) {
              this.con_vale = true;
              this.valeRecepcion.vr_numero.setValue(
                proy.vale_recepcion.vr_numero
              );
              this.valeRecepcion.fecha_recibido.setValue(
                proy.vale_recepcion.fecha_recibido
              );
              this.valeRecepcion.enlace_doc.setValue(
                proy.vale_recepcion.enlace_doc
              );
            }
            this.datosIniciales();
          } else {
            // No se encontró esa cotización
            this.location.back();
            this.snackBar.open(
              'No se encontró un proyecto con ese ID',
              'Cerrar',
              {
                duration: 4000,
              }
            );
            return;
          }
        });
      } else {
        // No puso número de parámetro
        this.location.back();
        this.snackBar.open('No se encontró un proyecto con ese ID', 'Cerrar', {
          duration: 4000,
        });
        return;
      }
    });
  }

  ngOnInit(): void {}

  datosIniciales() {
    // Cargar las cotizaciones para listarlas
    this.httpServ.cargarCotizaciones(true).subscribe((datos) => {
      this.cotizaciones = datos;
      if (this.id != 'nuevo') {
        this.cotizaciones.push(this.cotizacion.value);
      }
      if (!this.cotizaciones.length) {
        this.snackBar.open(
          'No existen cotizaciones sin proyecto, favor crear una primero',
          'Cerrar',
          {
            duration: 4000,
          }
        );
        this.location.back();
        return;
      }
    });

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
  }

  guardarProyecto() {
    if (
      this.formulario.invalid ||
      (this.con_orden && this.formularioOC.invalid) ||
      (this.con_vale && this.formularioVR.invalid)
    ) {
      console.log(this.formulario);
      return;
    }
    this.httpServ.cargando = true;
    const proyecto = this.formulario.getRawValue();
    proyecto.cotizacion = proyecto.cotizacion.id_cotizacion;
    // Crear
    if (this.id == 'nuevo') {
      this.httpServ.insertar('proyecto', proyecto).subscribe(
        (res) => {
          this.location.back();
          this.snackBar.open('Proyecto creado con éxito', 'Cerrar', {
            duration: 4000,
          });
        },
        (error) => {
          console.log(error);
          this.httpServ.cargando = false;
          this.snackBar.open('Ocurrió un error', 'Cerrar', {
            duration: 4000,
          });
        }
      );
    } else {
      // Actualizar
      this.httpServ.editar('proyecto', this.id, { proyecto }).subscribe(
        (res) => {
          if (!this.con_orden && !this.con_vale) {
            this.location.back();
            this.snackBar.open('Proyecto actualizado con éxito', 'Cerrar', {
              duration: 4000,
            });
          } else if (this.con_orden && !this.con_vale) {
            this.guardarOrdenCompra().subscribe((obs) => {
              if (obs) {
                this.location.back();
                this.snackBar.open('Proyecto actualizado con éxito', 'Cerrar', {
                  duration: 4000,
                });
              } else {
                this.httpServ.cargando = false;
              }
            });
          } else if (!this.con_orden && this.con_vale) {
            this.guardarValeRecepcion().subscribe((obs) => {
              if (obs) {
                this.location.back();
                this.snackBar.open('Proyecto actualizado con éxito', 'Cerrar', {
                  duration: 4000,
                });
              } else {
                this.httpServ.cargando = false;
              }
            });
          } else if (this.con_orden && this.con_vale) {
            this.guardarOrdenCompra().subscribe(() => {
              this.guardarValeRecepcion().subscribe((obs) => {
                if (obs) {
                  this.location.back();
                  this.snackBar.open(
                    'Proyecto actualizado con éxito',
                    'Cerrar',
                    {
                      duration: 4000,
                    }
                  );
                } else {
                  this.httpServ.cargando = false;
                }
              });
            });
          }
        },
        (error) => {
          console.log(error);
          this.httpServ.cargando = false;
          this.snackBar.open('Ocurrió un error', 'Cerrar', {
            duration: 4000,
          });
        }
      );
    }
  }

  guardarOrdenCompra() {
    return new Observable<boolean>((observer) => {
      const orden = this.formularioOC.getRawValue();
      orden.proyecto = this.id;
      // No hay orden de compra y no se adjuntó un archivo
      if (!orden.no_orden_compra && !this.adjuntoOC) {
        this.snackBar.open('Es necesario adjuntar un archivo', 'Cerrar', {
          duration: 4000,
        });
        observer.next(false);
        return;
      }
      // No se adjuntó un archivo pero se editó la orden de compra existente
      else if (!this.adjuntoOC && orden.no_orden_compra) {
        this.httpServ
          .editar('orden_compra', orden.no_orden_compra, {
            orden_compra: orden,
          })
          .subscribe(
            () => {
              observer.next(true);
            },
            (error) => {
              this.snackBar.open(
                'Ocurrió un error con la orden de compra',
                'Cerrar',
                {
                  duration: 4000,
                }
              );
              console.log(error);
              observer.next(false);
            }
          );
      }
      // Se adjuntó un archivo
      else if (this.adjuntoOC) {
        const datosArchivo = this.fireServ.subirArchivo(
          'orden_de_compra',
          this.adjuntoOC
        );
        datosArchivo.uploadTask
          .snapshotChanges()
          .pipe(
            finalize(() => {
              datosArchivo.storageRef.getDownloadURL().subscribe((url) => {
                orden.enlace_doc = url;
                // Crear nueva orden de compra
                if (!orden.no_orden_compra) {
                  this.httpServ.insertar('orden_compra', orden).subscribe(
                    () => {
                      observer.next(true);
                    },
                    (error) => {
                      this.snackBar.open(
                        'Ocurrió un error con la orden de compra',
                        'Cerrar',
                        {
                          duration: 4000,
                        }
                      );
                      console.log(error);
                      observer.next(false);
                    }
                  );
                }
                // Actualizar orden de compra
                else {
                  this.httpServ
                    .editar('orden_compra', orden.no_orden_compra, {
                      orden_compra: orden,
                    })
                    .subscribe(
                      () => {
                        observer.next(true);
                      },
                      (error) => {
                        this.snackBar.open(
                          'Ocurrió un error con la orden de compra',
                          'Cerrar',
                          {
                            duration: 4000,
                          }
                        );
                        console.log(error);
                        observer.next(false);
                      }
                    );
                }
              });
            })
          )
          .subscribe(
            () => null,
            (error) => {
              this.snackBar.open(
                'Ocurrió un error con la orden de compra',
                'Cerrar',
                {
                  duration: 4000,
                }
              );
              console.log(error);
              observer.next(false);
            }
          );
      }
    });
  }

  guardarValeRecepcion() {
    return new Observable<boolean>((observer) => {
      const vale = this.formularioVR.getRawValue();
      vale.proyecto = this.id;
      // No hay vale de recepción y no se adjuntó un archivo
      if (!vale.vr_numero && !this.adjuntoVR) {
        this.snackBar.open('Es necesario adjuntar un archivo', 'Cerrar', {
          duration: 4000,
        });
        observer.next(false);
        this.httpServ.cargando = false;
      }
      // No se adjuntó un archivo pero se editó el vale de recepción existente
      else if (!this.adjuntoVR && vale.vr_numero) {
        this.httpServ
          .editar('vale_recepcion', vale.vr_numero, { vale_recepcion: vale })
          .subscribe(
            () => {
              observer.next(true);
            },
            (error) => {
              this.snackBar.open(
                'Ocurrió un error con el vale de recepción',
                'Cerrar',
                {
                  duration: 4000,
                }
              );
              console.log(error);
              observer.next(false);
            }
          );
      }
      // Se adjuntó un archivo
      else if (this.adjuntoVR) {
        const datosArchivo = this.fireServ.subirArchivo(
          'vale_de_recepcion',
          this.adjuntoVR
        );
        datosArchivo.uploadTask
          .snapshotChanges()
          .pipe(
            finalize(() => {
              datosArchivo.storageRef.getDownloadURL().subscribe((url) => {
                vale.enlace_doc = url;
                // Crear nueva orden de compra
                if (!vale.no_orden_compra) {
                  this.httpServ.insertar('vale_recepcion', vale).subscribe(
                    () => {
                      observer.next(true);
                    },
                    (error) => {
                      this.snackBar.open(
                        'Ocurrió un error con el vale de recepción',
                        'Cerrar',
                        {
                          duration: 4000,
                        }
                      );
                      console.log(error);
                      observer.next(false);
                    }
                  );
                }
                // Actualizar orden de compra
                else {
                  this.httpServ
                    .editar('vale_recepcion', vale.vr_numero, {
                      vale_recepcion: vale,
                    })
                    .subscribe(
                      () => {
                        observer.next(true);
                      },
                      (error) => {
                        this.snackBar.open(
                          'Ocurrió un error con el vale de recepción',
                          'Cerrar',
                          {
                            duration: 4000,
                          }
                        );
                        console.log(error);
                        observer.next(false);
                      }
                    );
                }
              });
            })
          )
          .subscribe(
            () => null,
            (error) => {
              this.snackBar.open(
                'Ocurrió un error con el vale de recepción',
                'Cerrar',
                {
                  duration: 4000,
                }
              );
              console.log(error);
              observer.next(false);
            }
          );
      }
    });
  }

  eliminar(tipo: string) {
    if (tipo == 'OC') {
      // Orden de compra
      const dialogRef = this.dialog.open(DialogConfirmacionComponent, {
        data: {
          titulo: `Confirmar`,
          mensaje: `¿Eliminar la orden de compra?`,
        },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (!res) {
          return;
        }
        this.con_orden = false;
        if (this.ordenCompra.no_orden_compra.value) {
          this.httpServ
            .eliminar('orden_compra', this.ordenCompra.no_orden_compra.value)
            .subscribe(
              () => {
                this.snackBar.open('Orden de compra eliminada', 'Cerrar', {
                  duration: 4000,
                });
              },
              (error) => {
                console.log(error);
                this.snackBar.open('Ocurrió un error', 'Cerrar', {
                  duration: 4000,
                });
              }
            );
        }
      });
    } else if (tipo == 'VR') {
      // Vale de recepción
      const dialogRef = this.dialog.open(DialogConfirmacionComponent, {
        data: {
          titulo: `Confirmar`,
          mensaje: `¿Eliminar el vale de recepción?`,
        },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (!res) {
          return;
        }
        this.con_vale = false;
        if (this.valeRecepcion.vr_numero.value) {
          this.httpServ
            .eliminar('vale_recepcion', this.valeRecepcion.vr_numero.value)
            .subscribe(
              () => {
                this.snackBar.open('Vale de recepción eliminado', 'Cerrar', {
                  duration: 4000,
                });
              },
              (error) => {
                console.log(error);
                this.snackBar.open('Ocurrió un error', 'Cerrar', {
                  duration: 4000,
                });
              }
            );
        }
      });
    }
  }

  adjuntarArchivo(tipo: string, event: any) {
    if (tipo == 'OC') {
      this.adjuntoOC = event.target.files[0];
    } else if (tipo == 'VR') {
      this.adjuntoVR = event.target.files[0];
    }
  }

  mostrarTitulo(cotizacion: Cotizacion): string {
    return cotizacion && cotizacion.titulo ? cotizacion.titulo : '';
  }

  cotizacionValida(control: UntypedFormControl) {
    if (typeof control.value == 'object') {
      return null;
    }
    return {
      noExiste: true,
    };
  }

  private _filtrar(nombre: string): Cotizacion[] {
    const filterValue = nombre.toLowerCase();

    return this.cotizaciones.filter((option) =>
      option.titulo.toLowerCase().includes(filterValue)
    );
  }

  abrirDocumento(enlace: string) {
    window.open(enlace, '_blank');
  }
}
