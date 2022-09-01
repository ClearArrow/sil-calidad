import { Injectable } from '@angular/core';
import { Cotizacion, Factura } from './interfaces.service';
const pdfMake = require('pdfmake/build/pdfmake');
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { Observable, Observer } from 'rxjs';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  logoImagen = 'assets/img/logo.png';
  logo: any;

  constructor(private datePipe: DatePipe) {
    this.getBase64ImageFromURL(this.logoImagen).subscribe((base64data) => {
      this.logo = 'data:image  /png;base64,' + base64data;
    });
    pdfMake.fonts = {
      Roboto: {
        normal:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
      },
      Courier: {
        normal: 'assets/fonts/CourierNew-Normal.ttf',
        bold: 'assets/fonts/CourierNew-Normal.ttf',
      },
    };
  }

  generarPDFCotizacion(cotizacion: Cotizacion, comoUrl = false) {
    const documentDefinition = {
      pageOrientation: 'landscape',
      content: [
        {
          columns: [
            {
              image: this.logo,
              width: 200,
              alignment: 'left',
              margin: [0, 0, 0, 20],
            },
            {
              text: 'Cotización No. ' + cotizacion.id_cotizacion,
              bold: true,
              fontSize: 12,
              alignment: 'right',
              font: 'Roboto',
              margin: [0, 0, 0, 0],
            },
          ],
        },
        {
          columns: [
            {
              text: [
                'Cliente: ',
                { text: cotizacion.cliente?.nombre, style: 'bold' },
              ],
              style: 'normal',
              alignment: 'left',
            },
            {
              text: `Guatemala, ${this.datePipe.transform(
                cotizacion.fecha,
                'dd MMM, yyyy'
              )}`,
              style: 'bold',
              alignment: 'right',
            },
          ],
        },
        {
          text: ['Planta: ', { text: cotizacion.planta, style: 'normal' }],
          style: 'normal',
          alignment: 'left',
        },
        {
          text: [
            'Tiempo estimado: ',
            { text: `${cotizacion.tiempo_estimado} días`, style: 'normal' },
          ],
          style: 'normal',
          alignment: 'left',
        },
        {
          text: cotizacion.titulo,
          style: 'header',
          alignment: 'center',
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 5,
              x2: 842 - 2 * 40,
              y2: 5,
              lineWidth: 3,
              lineColor: '#3f51b5',
            },
          ],
          margin: [0, 3, 0, 25],
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          font: 'Roboto',
          margin: [0, 15, 0, 15],
        },
        bold: {
          bold: true,
          font: 'Roboto',
        },
        normal: {
          fontSize: 10,
          font: 'Roboto',
        },
      },
    };
    if (cotizacion.detalles && cotizacion.detalles.length) {
      const tabla: any = {
        layout: 'lightHorizontalLines', // optional
        table: {
          headerRows: 1,
          widths: [300, '*', '*', '*', '*', '*'],
          body: [
            [
              { text: 'Descripción', margin: [0, 0, 0, 5] },
              { text: 'Cantidad', margin: [0, 0, 0, 5] },
              { text: 'Unidad', margin: [0, 0, 0, 5] },
              { text: 'Precio/Unidad', margin: [0, 0, 0, 5] },
              { text: 'Precio con IVA', margin: [0, 0, 0, 5] },
              { text: 'Total', margin: [0, 0, 0, 5] },
            ],
          ],
        },
      };
      let total = 0;
      for (const detalle of cotizacion.detalles) {
        const precioIVA =
          Number(detalle.precio) * 0.12 + Number(detalle.precio);
        const totalFila = precioIVA * detalle.cantidad;
        total += totalFila;
        tabla.table.body.push([
          { text: detalle.detalle, margin: [0, 5, 0, 5] },
          { text: detalle.cantidad.toString(), margin: [0, 5, 0, 5] },
          { text: detalle.unidad, margin: [0, 5, 0, 5] },
          { text: `Q. ${detalle.precio}`, margin: [0, 5, 0, 5] },
          { text: `Q. ${precioIVA.toFixed(2)}`, margin: [0, 5, 0, 5] },
          { text: `Q. ${totalFila.toFixed(2)}`, margin: [0, 5, 0, 5] },
        ]);
      }
      documentDefinition.content.push(tabla);
      tabla.table.body.push([
        {
          text: 'Total: ',
          fontSize: 14,
          style: 'bold',
          margin: [0, 10, 0, 0],
        },
        '',
        '',
        '',
        '',
        {
          text: `Q. ${total.toFixed(2)}`,
          fontSize: 14,
          style: 'bold',
          margin: [0, 10, 0, 0],
        },
      ] as any);
    }
    // Observaciones hasta de último
    if (cotizacion.observaciones) {
      documentDefinition.content.push({
        text: 'Observaciones:',
        style: 'bold',
        alignment: 'left',
        margin: [0, 20, 0, 0],
        fontSize: 15
      } as any,
        {
          text: cotizacion.observaciones,
          style: 'normal',
          alignment: 'left',
          margin: [0, 5, 0, 0],
          fontSize: 14
        } as any);
    }
    if (!comoUrl) {
      return pdfMake.createPdf(documentDefinition).open();
    }
    else {
      return pdfMake.createPdf(documentDefinition);
    }
  }

  generarPDFFactura(factura: Factura, comoUrl = false) {
    const documentDefinition = {
      content: [
        {
          columns: [
            {
              image: this.logo,
              width: 150,
            },
            [
              /*{
                text: 'Factura',
                color: '#333333',
                width: '*',
                fontSize: 28,
                bold: true,
                alignment: 'right',
                margin: [0, 0, 0, 15],
              },*/
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'DTE',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 12,
                        alignment: 'right',
                      },
                      {
                        text: factura.no_DTE,
                        bold: true,
                        color: '#333333',
                        fontSize: 12,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Serie',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 12,
                        alignment: 'right',
                      },
                      {
                        text: factura.serie,
                        bold: true,
                        color: '#333333',
                        fontSize: 12,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Fecha de emisión',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 12,
                        alignment: 'right',
                      },
                      {
                        text: this.datePipe.transform(
                          factura.fecha_emision,
                          'dd MMM, yyyy'
                        ),
                        bold: true,
                        color: '#333333',
                        fontSize: 12,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Estado',
                        color: '#aaaaab',
                        bold: true,
                        fontSize: 12,
                        alignment: 'right',
                        width: '*',
                      },
                      {
                        text: factura.estado_factura?.toLocaleUpperCase(),
                        bold: true,
                        fontSize: 14,
                        alignment: 'right',
                        color: 'green',
                        width: 100,
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
        {
          columns: [
            {
              text: 'Autorización',
              color: '#aaaaab',
              bold: true,
              fontSize: 14,
              alignment: 'left',
              margin: [0, 20, 0, 5],
            },
            {
              text: 'Fecha de autorización',
              color: '#aaaaab',
              bold: true,
              fontSize: 14,
              alignment: 'left',
              margin: [0, 20, 0, 5],
            },
          ],
        },
        {
          columns: [
            {
              text: factura.autorizacion,
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
            {
              text: `${this.datePipe.transform(
                factura.fecha_autorizacion,
                'dd MMM, yyyy'
              )}`,
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
          ],
        },
        {
          columns: [
            {
              text: 'Emisor',
              color: '#aaaaab',
              bold: true,
              fontSize: 14,
              alignment: 'left',
              margin: [0, 5, 0, 5],
            },
            {
              text: 'Receptor',
              color: '#aaaaab',
              bold: true,
              fontSize: 14,
              alignment: 'left',
              margin: [0, 5, 0, 5],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Servicios Industriales López',
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
            {
              text: `${factura.nombre_receptor}`,
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
          ],
        },
        {
          columns: [
            {
              text: 'NIT',
              color: '#aaaaab',
              bold: true,
              margin: [0, 7, 0, 3],
            },
            {
              text: 'NIT',
              color: '#aaaaab',
              bold: true,
              margin: [0, 7, 0, 3],
            },
          ],
        },
        {
          columns: [
            {
              text: '7602324',
              style: 'invoiceBillingAddress',
            },
            {
              text: factura.nit_receptor,
              style: 'invoiceBillingAddress',
            },
          ],
        },
        '\n\n',
        {
          width: '100%',
          alignment: 'center',
          text: 'Detalle de la factura',
          bold: true,
          margin: [0, 10, 0, 10],
          fontSize: 15,
        },
        {
          layout: {
            defaultBorder: false,
            hLineWidth: function (i: any, node: any) {
              return 1;
            },
            vLineWidth: function (i: any, node: any) {
              return 1;
            },
            hLineColor: function (i: any, node: any) {
              if (i === 1 || i === 0) {
                return '#bfdde8';
              }
              return '#eaeaea';
            },
            vLineColor: function (i: any, node: any) {
              return '#eaeaea';
            },
            hLineStyle: function (i: any, node: any) {
              // if (i === 0 || i === node.table.body.length) {
              return null;
              //}
            },
            // vLineStyle: function (i: any, node: any) { return {dash: { length: 10, space: 4 }}; },
            paddingLeft: function (i: any, node: any) {
              return 10;
            },
            paddingRight: function (i: any, node: any) {
              return 10;
            },
            paddingTop: function (i: any, node: any) {
              return 2;
            },
            paddingBottom: function (i: any, node: any) {
              return 2;
            },
            fillColor: function (rowIndex: any, node: any, columnIndex: any) {
              return '#fff';
            },
          },
          table: {
            headerRows: 1,
            widths: ['*', 80],
            body: [
              [
                {
                  text: 'DESCRIPCIÓN',
                  fillColor: '#eaf2f5',
                  border: [false, true, false, true],
                  margin: [0, 5, 0, 5],
                  textTransform: 'uppercase',
                },
                {
                  text: 'TOTAL',
                  border: [false, true, false, true],
                  alignment: 'right',
                  fillColor: '#eaf2f5',
                  margin: [0, 5, 0, 5],
                  textTransform: 'uppercase',
                },
              ],
              [
                {
                  text: factura.descripcion,
                  border: [false, false, false, true],
                  margin: [0, 5, 0, 5],
                  alignment: 'left',
                },
                {
                  border: [false, false, false, true],
                  text: factura.moneda.toUpperCase() + ' ' + factura.precio,
                  fillColor: '#f5f5f5',
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                },
              ],
            ],
          },
        },
        '\n',
        '\n\n',
        {
          layout: {
            defaultBorder: false,
            hLineWidth: function (i: any, node: any) {
              return 1;
            },
            vLineWidth: function (i: any, node: any) {
              return 1;
            },
            hLineColor: function (i: any, node: any) {
              return '#eaeaea';
            },
            vLineColor: function (i: any, node: any) {
              return '#eaeaea';
            },
            hLineStyle: function (i: any, node: any) {
              // if (i === 0 || i === node.table.body.length) {
              return null;
              //}
            },
            // vLineStyle: function (i: any, node: any) { return {dash: { length: 10, space: 4 }}; },
            paddingLeft: function (i: any, node: any) {
              return 10;
            },
            paddingRight: function (i: any, node: any) {
              return 10;
            },
            paddingTop: function (i: any, node: any) {
              return 3;
            },
            paddingBottom: function (i: any, node: any) {
              return 3;
            },
            fillColor: function (rowIndex: any, node: any, columnIndex: any) {
              return '#fff';
            },
          },
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                {
                  text: 'Subtotal',
                  border: [false, true, false, true],
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                },
                {
                  border: [false, true, false, true],
                  text: factura.moneda.toUpperCase() + ' ' + factura.precio,
                  alignment: 'right',
                  fillColor: '#f5f5f5',
                  margin: [0, 5, 0, 5],
                },
              ],
              [
                {
                  text: 'Total',
                  bold: true,
                  fontSize: 20,
                  alignment: 'right',
                  border: [false, false, false, true],
                  margin: [0, 5, 0, 5],
                },
                {
                  text: factura.moneda.toUpperCase() + ' ' + factura.precio,
                  bold: true,
                  fontSize: 20,
                  alignment: 'right',
                  border: [false, false, false, true],
                  fillColor: '#f5f5f5',
                  margin: [0, 5, 0, 5],
                },
              ],
            ],
          },
        },
        '\n\n',
        /*{
          text: 'NOTES',
          style: 'notesTitle',
        },
        {
          text: 'Some notes goes here \n Notes second line',
          style: 'notesText',
        },*/
      ],
      styles: {
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 3],
        },
        notesText: {
          fontSize: 10,
        },
      },
      defaultStyle: {
        columnGap: 20,
        //font: 'Quicksand',
      },
    };
    if (!comoUrl) {
      return pdfMake.createPdf(documentDefinition).open();
    }
    else {
      return pdfMake.createPdf(documentDefinition);
    }
  }

  getBase64ImageFromURL(url: string) {
    return new Observable((observer: Observer<string>) => {
      // create an image object
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      if (!img.complete) {
        // This will call another method that will create image from url
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = (err) => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }

  getBase64Image(img: HTMLImageElement) {
    // We create a HTML canvas object that will create a 2d image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx: any = canvas.getContext('2d');
    // This will draw image
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    const dataURL = canvas.toDataURL('image/png');
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
    // return this.sanitizer.bypassSecurityTrustUrl(canvas.toDataURL('image/png'));
  }
}
