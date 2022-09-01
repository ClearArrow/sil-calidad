import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { Proyecto } from 'src/app/services/interfaces.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EstadoProyectoComponent } from '../../components/estado-proyecto/estado-proyecto.component';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.css'],
})
export class ProyectosComponent implements OnInit {
  deshabilitarRipple = false;
  proyectos: Proyecto[] = [];
  proyectosMostrados: Proyecto[] = [];
  proyectosEnProceso: Proyecto[] = [];
  textoBuscado = '';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    public httpServ: HttpService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.httpServ.cargarProyectos().subscribe((proyectos) => {    
      this.ordernarProyectos(proyectos);
    });
  }

  onPageChange(event: any) {
    this.proyectosMostrados = this.proyectos.slice(
      event.pageIndex * event.pageSize,
      event.pageIndex * event.pageSize + event.pageSize
    );
  }

  actualizarPaginas() {
    this.proyectosMostrados = this.proyectosBuscados().slice(0, this.paginator.pageSize);
    this.paginator.firstPage();
  }

  ordernarProyectos(proyectos: any) {
    const temp = [];
    this.proyectosMostrados = [];
    this.proyectosEnProceso = [];
    for (const proyecto of proyectos) {
      if (proyecto.fecha_envio && proyecto.proyecto_estado == 'En proceso') {
        proyecto.fecha_envio = new Date(proyecto.fecha_envio);
        // Fecha estimada en base a la fecha de envío + los días estimados en la cotización
        proyecto.fecha_estimada = new Date(
          new Date(proyecto.fecha_envio).setDate(
            proyecto.fecha_envio.getDate() +
              proyecto.cotizacion.tiempo_estimado
          )
        );
        // Calcular los días restantes entre la fecha estimada y la fecha de hoy
        proyecto.dias_restantes = Math.ceil((proyecto.fecha_estimada.getTime() - new Date().getTime()) // Milisegundos
        / 1000 / 3600 / 24);
        proyecto.dias_restantes = proyecto.dias_restantes > 0 ? proyecto.dias_restantes : 0;
      }
      temp.push(proyecto);
      if (proyecto.proyecto_estado == 'En proceso') {
        this.proyectosEnProceso.push(proyecto);
      }
    }
    this.proyectos = temp;
    if (proyectos.length > 5) {
      for (let i = 0; i < 5; i++) {
        this.proyectosMostrados.push(this.proyectos[i]);
      }
    } else {
      this.proyectosMostrados = this.proyectos;
    }
    if (this.paginator.hasPreviousPage()) {
      this.paginator.previousPage();
      this.paginator.nextPage();
    }
    else {
      this.paginator.firstPage();
    }
  }

  actualizarEstado(proyecto: Proyecto, event: any) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(EstadoProyectoComponent, {
      data: {
        estado: proyecto.proyecto_estado,
      },
    });
    dialogRef.afterClosed().subscribe((estado: string) => {
      console.log(estado);
      if (!estado) {
        return;
      }
      this.httpServ
        .editar('proyecto', proyecto.id_proyecto, {
          proyecto: {
            proyecto_estado: estado,
            id_proyecto: proyecto.id_proyecto,
          },
        })
        .subscribe(
          () => {
            this.snackBar.open('Proyecto actualizado con éxito', 'Cerrar', {
              duration: 4000,
            });
            for (const proy of this.proyectos) {
              if (proyecto.id_proyecto == proy.id_proyecto) {
                proy.proyecto_estado = estado;
              }
            }
            this.ordernarProyectos(this.proyectos);
          },
          (error) => {
            console.log(error);
            this.snackBar.open('Ocurrió un error', 'Cerrar', {
              duration: 4000,
            });
          }
        );
    });
  }

  proyectosBuscados() {
    if (!this.textoBuscado) {
      return this.proyectos;
    }
    return this.proyectos.filter(proyecto => 
      `${proyecto.cotizacion.cliente.nombre} ${proyecto.cotizacion.titulo}`.toLocaleLowerCase().indexOf(this.textoBuscado.toLocaleLowerCase()) != -1
    );
  }

  enProcesoBuscados() {
    if (!this.textoBuscado) {
      return this.proyectosEnProceso;
    }
    return this.proyectosEnProceso.filter(proyecto => 
      `${proyecto.cotizacion.cliente.nombre} ${proyecto.cotizacion.titulo}`.toLocaleLowerCase().indexOf(this.textoBuscado.toLocaleLowerCase()) != -1
    );
  }
}
