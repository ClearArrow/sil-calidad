import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from '../../services/http.service';
import { Cliente } from '../../services/interfaces.service';
import { Observable, startWith, map } from 'rxjs';

@Component({
  selector: 'app-form-cotizacion',
  templateUrl: './form-cotizacion.component.html',
  styleUrls: ['./form-cotizacion.component.css'],
})
export class FormCotizacionComponent implements OnInit {
  id: string | number;
  id_cotizacion = new UntypedFormControl(null);
  cliente = new UntypedFormControl(null, [Validators.required, this.clienteValido]);
  id_usuario = new UntypedFormControl(null);
  titulo = new UntypedFormControl(null, Validators.required);
  planta = new UntypedFormControl(null, Validators.required);
  tiempo_estimado = new UntypedFormControl(null, [Validators.required, this.esNumero]);
  fecha = new UntypedFormControl(null, Validators.required);
  observaciones = new UntypedFormControl(null);
  enlace_doc = new UntypedFormControl(null);
  detalles: any[] = [];
  formulario: UntypedFormGroup;
  clientesFiltrados: Observable<Cliente[]>;

  constructor(
    private ruta: ActivatedRoute,
    public location: Location,
    private builder: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public httpServ: HttpService
  ) { }

  ngOnInit(): void {
    this.ruta.params.subscribe((params) => {
      this.id = params['id'];
      if (this.id == 'nueva') { // Crear nueva
        this.formulario = this.builder.group({
          cliente: this.cliente,
          id_usuario: this.id_usuario,
          titulo: this.titulo,
          planta: this.planta,
          tiempo_estimado: this.tiempo_estimado,
          fecha: this.fecha,
          enlace_doc: this.enlace_doc,
          observaciones: this.observaciones
        });
        this.fecha.setValue(new Date());
        this.detalles.push([{
          detalle: null,
          cantidad: 1,
          unidad: null,
          precio: null
        }]);
      } else if (Number(this.id)) { // Editar
        this.formulario = this.builder.group({
          cliente: this.cliente,
          id_usuario: this.id_usuario,
          titulo: this.titulo,
          planta: this.planta,
          tiempo_estimado: this.tiempo_estimado,
          fecha: this.fecha,
          enlace_doc: this.enlace_doc,
          observaciones: this.observaciones,
          id_cotizacion: this.id_cotizacion,
        });

        this.id_cotizacion.setValue(Number(this.id));
        this.httpServ.obtenerDatosCotizacion(this.id).subscribe(coti => {
          if (coti) {
            this.cliente.setValue(coti.cliente);
            this.id_usuario.setValue(coti.id_usuario);
            this.titulo.setValue(coti.titulo);
            this.planta.setValue(coti.planta);
            this.tiempo_estimado.setValue(coti.tiempo_estimado);
            this.fecha.setValue(coti.fecha);
            this.observaciones.setValue(coti.observaciones);
            this.enlace_doc.setValue(coti.enlace_doc);
            this.id_cotizacion.setValue(coti.id_cotizacion);
            this.detalles = coti.detalles || [];
            console.log(coti);
          }
          else { // No se encontró esa cotización
            this.location.back();
            this.snackBar.open('No se encontró una cotización con ese ID', 'Cerrar', {
              duration: 4000,
            });
          }
        });
      } else { // No puso número de parámetro
        this.location.back();
        this.snackBar.open('No se encontró una cotización con ese ID', 'Cerrar', {
          duration: 4000,
        });
        return;
      }
      /* Filtrar clientes */
      this.clientesFiltrados = this.cliente.valueChanges.pipe(
        startWith(''),
        map(valor => {
          const nombre = typeof valor === 'string' ? valor : valor?.nombre;
          return nombre ? this._filtrar(nombre as string) : this.httpServ.clientes.slice();
        }),
      );
    });
  }

  guardarCotizacion() {
    if (this.formulario.invalid || !this.detalles.length) {
      console.log(this.formulario);
      if (!this.detalles.length) {
        this.snackBar.open('Agregar al menos un detalle', 'Cerrar', {
          duration: 4000,
        });
      }
      return;
    }
    for (const det of this.detalles) {
      if ((isNaN(det.precio) || !det.precio) || (isNaN(det.cantidad) || !det.cantidad) || !det.detalle) {
        this.snackBar.open('Revisar si los valores de los detalles están correctos', 'Cerrar', {
          duration: 4000
        });
        return;
      }
    }
    const cotizacion = this.formulario.getRawValue();
    cotizacion.detalles = this.detalles;
    cotizacion.cliente = cotizacion.cliente.id_cliente;
    // Crear
    if (this.id == 'nueva') {
      this.httpServ.insertar('cotizacion', cotizacion).subscribe(res => {
        this.location.back();
        this.snackBar.open('Cotización creada con éxito', 'Cerrar', {
          duration: 4000,
        });
      }, (error) => {
        console.log(error);
        this.snackBar.open('Ocurrió un error', 'Cerrar', {
          duration: 4000,
        });
      });
    }
    else { // Actualizar
      this.httpServ.editar('cotizacion', this.id, { cotizacion }).subscribe(res => {
        this.location.back();
        this.snackBar.open('Cotización actualizada con éxito', 'Cerrar', {
          duration: 4000,
        });
      }, (error) => {
        console.log(error);
        this.snackBar.open('Ocurrió un error', 'Cerrar', {
          duration: 4000,
        });
      });
    }
  }

  agregarDetalle() {
    this.detalles.push({
      detalle: null,
      cantidad: 1,
      unidad: null,
      precio: null
    });
  }

  actualizarDetalles(datos: any, index: number) {
    this.detalles[index] = datos;
  }

  quitarDetalle(index: number) {
    this.detalles.splice(index, 1);
  }

  mostrarNombre(cliente: Cliente): string {
    return cliente && cliente.nombre ? cliente.nombre : '';
  }

  private _filtrar(nombre: string): Cliente[] {
    const filterValue = nombre.toLowerCase();

    return this.httpServ.clientes.filter(option => option.nombre.toLowerCase().includes(filterValue));
  }


  clienteValido(control: UntypedFormControl) {
    if (typeof control.value == 'object') {
      return null;
    }
    return {
      noExiste: true
    };
  }

  esNumero(control: UntypedFormControl) {
    if (isNaN(control.value)) {
      return {
        noNumero: true
      };
    }
    return null;
  }

  trackIndex(index: number) {
    return index;
  }
}
