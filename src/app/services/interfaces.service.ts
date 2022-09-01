import { Injectable } from '@angular/core';

export interface Proyecto {
  id_proyecto: number;
  id_cotizacion?: number;
  OC?: number;
  vr?: number;
  dte_factura?: number;
  proyecto_estado: string;
  fecha_envio?: Date;
  cobro_estado?: string;
  comentarios?: string;
  cotizacion: Cotizacion;
  fecha_estimada?: Date;
  dias_restantes?: number;
  orden_compra?: OrdenCompra;
  vale_recepcion?: ValeRecepcion;
}

export interface Cotizacion {
  id_cotizacion: number;
  id_cliente: number;
  id_usuario?: string;
  titulo: string;
  planta?: string;
  tiempo_estimado: number;
  fecha: Date;
  enlace_doc?: string;
  observaciones?: string;
  cliente: Cliente;
  proyectos?: Proyecto[];
  detalles?: DetalleCotizacion[];
  cargando?: boolean;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  email: string;
  telefono: string;
  nit?: string;
  direccion?: string;
  estado: number;
  cotizaciones?: Cotizacion[];
}

export interface DetalleCotizacion {
  id_detalle_cotizacion: number;
  detalle: string;
  cantidad: number;
  precio: number;
  cotizacion: Cotizacion;
  unidad: string;
}

export interface OrdenCompra {
  no_orden_compra: number;
  fecha_recibida: Date;
  enlace_doc: string;
  nombre_elaborado: string;
}

export interface ValeRecepcion {
  vr_numero: number;
  fecha_recibido: Date;
  enlace_doc: string;
}

export interface Factura {
  no_DTE: number;
  serie: string;
  autorizacion: string;
  fecha_autorizacion: Date;
  fecha_emision: Date;
  nit_receptor: string;
  nombre_receptor: string;
  moneda: string;
  cantidad: number;
  precio: number;
  estado_factura?: string;
  cotizacion: Cotizacion;
  enlace_doc?: string;
  retenciones: any;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})

export class InterfacesService {

  constructor() { }
}
