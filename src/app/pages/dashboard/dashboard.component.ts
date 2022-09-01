import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MesesPipe } from 'src/app/pipes/meses.pipe';
import { HttpService } from '../../services/http.service';
import { Proyecto } from '../../services/interfaces.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  proyectos: any[];
  enProceso = 0;
  pendientes = 0;
  facturado = 0;
  historicoFacturas: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Facturado (Q.)',
        backgroundColor: 'rgba(63, 81, 181,0.2)',
        borderColor: 'rgba(63, 81, 181,1)',
        pointBackgroundColor: 'rgba(63, 81, 181,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(63, 81, 181,0.8)',
        fill: 'start',
      },
    ],
    labels: [],
  };

  graficoLineas: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    plugins: {
      legend: { display: true },
    },
    responsive: true
  };

  graficoDona: ChartConfiguration['options'] = {
    responsive: true
  };

  dataGananciasProyecto: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#4dc9f6',
          '#f67019',
          '#f53794',
          '#537bc4',
          '#acc236',
          '#166a8f',
          '#00a950',
          '#58595b',
          '#8549ba',
        ],
        hoverBackgroundColor: [
          '#4dc9f6',
          '#f67019',
          '#f53794',
          '#537bc4',
          '#acc236',
          '#166a8f',
          '#00a950',
          '#58595b',
          '#8549ba',
        ],
        hoverBorderColor: [
          '#4dc9f6',
          '#f67019',
          '#f53794',
          '#537bc4',
          '#acc236',
          '#166a8f',
          '#00a950',
          '#58595b',
          '#8549ba',
        ]
      },
    ],
  };

  datosProyectos: MatTableDataSource<any>;
  @ViewChild('tablaProyectos', { read: MatSort, static: false })
  sort: MatSort;
  @ViewChild('pagProyectos', { static: false })
  paginator: MatPaginator;
  camposProyectos = [
    'titulo',
    'cliente',
    'fecha_envio',
    'proyecto_estado',
    'cobro_estado',
    'tiempo_estimado'
  ];
  constructor(public httpServ: HttpService, private mesesPipe: MesesPipe) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.httpServ.cargarDatosDashboard().subscribe((datos) => {
      console.log(datos);
      this.facturado = datos.facturado?.facturado || 0;
      // Proyectos
      this.proyectos = datos.proyectos;
      for (const proyecto of this.proyectos) {
        proyecto.tiempo_estimado = Number(proyecto.cotizacion.tiempo_estimado);
        proyecto.titulo = proyecto.cotizacion.titulo;
        proyecto.cliente = proyecto.cotizacion.cliente.nombre;
        if (proyecto.proyecto_estado == 'Pendiente') {
          this.pendientes++;
        } else if (proyecto.proyecto_estado == 'En proceso') {
          this.enProceso++;
        }
      }
      this.mostrarProyectos();
      // Histórico de facturas
      this.graficoHistorico(datos);
      // Facturas por proyecto
      this.graficoProyectos(datos);
    });
  }

  mostrarProyectos() {
    this.datosProyectos = new MatTableDataSource<any>(this.proyectos);
    setTimeout(() => {
      this.datosProyectos.paginator = this.paginator;
      this.datosProyectos.sort = this.sort;
    });
  }

  graficoHistorico(datos: any) {
    for (const mes of datos.historicoFacturas) {
      this.historicoFacturas.labels?.push(this.mesesPipe.transform(mes.mes));
      this.historicoFacturas.datasets[0].data.push(Number(mes.facturado));
    }
  }

  graficoProyectos(datos: any) {
    for (const proyecto of datos.facturas) {
      this.dataGananciasProyecto.labels?.push(proyecto.proyecto);
      this.dataGananciasProyecto.datasets[0].data.push(
        Number(proyecto.facturado)
      );
    }
    console.log(this.dataGananciasProyecto);
  }
}
