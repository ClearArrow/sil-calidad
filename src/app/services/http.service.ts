import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, take } from 'rxjs';
import { Proyecto, Cotizacion, Cliente, Factura } from './interfaces.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  clientes: Cliente[] = [];
  cargando = true;
  subiendoRetencion = false;
  constructor(private http: HttpClient) {
    this.cargarClientes().subscribe((clientes) => {
      this.clientes = clientes;
    });
    /*this.enviarCorreo({
      sender: 'webmaster@serviciosil.com',
      replyTo: 'webmaster@serviciosil.com',
      to: 'jsagastumej@miumg.edu.gt',
      subject: 'Prueba',
      html: 'Prueba desde la aplicación',
      attachments: []
    }).subscribe(res => {
      console.log(res);
    });*/
  }

  /*** Proyectos ***/
  cargarProyectos() {
    this.cargando = true;
    return this.http.get(`${environment.backend}/proyecto`).pipe(
      map((proyectos: any) => {
        this.cargando = false;
        const temp: Proyecto[] = proyectos;
        return temp;
      }),
      take(1)
    );
  }

  obtenerDatosProyecto(id: string | number) {
    this.cargando = true;
    return this.http.get(`${environment.backend}/proyecto/id/${id}`).pipe(
      map((proyecto: any) => {
        this.cargando = false;
        const temp: Proyecto = proyecto;
        temp.fecha_envio = temp.fecha_envio
          ? new Date(temp.fecha_envio)
          : undefined;
        return temp;
      }),
      take(1)
    );
  }

  /*** Cotizaciones ***/
  cargarCotizaciones(sinProyecto = false, soloConProyectos = false) {
    this.cargando = true;
    return this.http
      .get(
        `${environment.backend}/cotizacion${
          sinProyecto ? '?sinProyecto=true' : ''
        }${soloConProyectos ? '?soloConProyectos=true' : ''}`
      )
      .pipe(
        map((cotizaciones: any) => {
          this.cargando = false;
          const temp: Cotizacion[] = cotizaciones;
          return temp;
        }),
        take(1)
      );
  }

  obtenerDatosCotizacion(id: string | number) {
    this.cargando = true;
    return this.http.get(`${environment.backend}/cotizacion/id/${id}`).pipe(
      map((cotizacion: any) => {
        this.cargando = false;
        const temp: Cotizacion = cotizacion;
        return temp;
      }),
      take(1)
    );
  }

  /*** Clientes ***/
  cargarClientes() {
    return this.http.get(`${environment.backend}/cliente`).pipe(
      map((clientes: any) => {
        this.cargando = false;
        const temp: Cliente[] = clientes;
        return temp;
      }),
      take(1)
    );
  }

  /*** Facturas ***/
  cargarFacturas() {
    return this.http.get(`${environment.backend}/factura`).pipe(
      map((facturas: any) => {
        this.cargando = false;
        const temp: Factura[] = facturas;
        return temp;
      }),
      take(1)
    );
  }

  obtenerDatosFactura(id: string | number, modificar_cargando = true) {
    if (modificar_cargando) {
      this.cargando = true;
    }
    return this.http.get(`${environment.backend}/factura/id/${id}`).pipe(
      map((factura: any) => {
        this.cargando = false;
        const temp: Factura = factura;
        return temp;
      }),
      take(1)
    );
  }

  /*** Datos para el dashboard ***/
  cargarDatosDashboard() {
    return this.http.get(`${environment.backend}/resumen_dashboard`).pipe(
      map((datos: any) => {
        return datos;
      }),
      take(1)
    );
  }

  /*** Operaciones ***/
  insertar(tabla: string, datos: any) {
    return this.http.post(`${environment.backend}/${tabla}`, datos).pipe(
      map((res: any) => {
        return res;
      }),
      take(1)
    );
  }

  editar(tabla: string, id: number | string, datos: any) {
    return this.http.put(`${environment.backend}/${tabla}/${id}`, datos).pipe(
      map((res: any) => {
        return res;
      }),
      take(1)
    );
  }

  eliminar(tabla: string, id: any) {
    return this.http.delete(`${environment.backend}/${tabla}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      take(1)
    );
  }

  enviarCorreo(datos: any) {
    return this.http.post(`${environment.backend}/enviar_correo`, datos).pipe(
      map((res: any) => {
        return res;
      }),
      take(1)
    );
  }
}
