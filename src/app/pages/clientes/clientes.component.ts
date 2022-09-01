import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Cliente } from '../../services/interfaces.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmacionComponent } from 'src/app/components/dialog-confirmacion/dialog-confirmacion.component';
import { FormClienteComponent } from '../../components/form-cliente/form-cliente.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  datosClientes: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  cargando = false;
  campos = ['nombre', 'email', 'telefono', 'direccion', 'nit'];
  constructor(
    public httpServ: HttpService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.httpServ.cargando = true;
    const intervalo = setInterval(() => {
      if (this.httpServ.clientes.length) {
        this.httpServ.cargando = false;
        this.mostrarClientes();
        clearInterval(intervalo);
      }
    }, 100);
  }

  mostrarClientes() {
    this.clientes = [];
    for (const cliente of this.httpServ.clientes) {
      if (cliente.estado) {
        this.clientes.push(cliente);
      }
    }
    this.datosClientes = new MatTableDataSource<any>(this.clientes);
    setTimeout(() => {
      this.datosClientes.paginator = this.paginator;
      this.datosClientes.sort = this.sort;
    });
  }

  filtrarClientes(filterValue: any) {
    this.datosClientes.filter = filterValue?.value.trim().toLowerCase();
  }

  crearCliente() {
    const dialogRef = this.dialog.open(FormClienteComponent, {
      data: {
        crear: true,
      },
      width: '500px'
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.httpServ
        .insertar('cliente', res)
        .subscribe(
          (nuevo) => {
            this.httpServ.clientes.unshift(nuevo);
            this.mostrarClientes();
            this.toastr.success('Cliente agregado con éxito', 'Listo');
          },
          (error) => {
            console.log(error);
            this.toastr.error('Ocurrió un error', 'Error');
          }
        );
    });
  }

  editarCliente(cliente: Cliente) {
    const dialogRef = this.dialog.open(FormClienteComponent, {
      data: {
        editar: true,
        cliente
      },
      width: '500px'
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.httpServ
      .editar('cliente', cliente.id_cliente, {
        cliente: res,
      })
      .subscribe(
        (nuevo) => {
          for (const i in this.httpServ.clientes) {
            if (cliente.id_cliente == this.httpServ.clientes[i].id_cliente) {
              this.httpServ.clientes[i] = nuevo.cliente;
            }
          }
          this.mostrarClientes();
          this.toastr.success('Cliente actualizado con éxito', 'Listo');
        },
        (error) => {
          console.log(error);
          this.toastr.error('Ocurrió un error', 'Error');
        }
      );
    });
  }

  eliminarCliente(cliente: Cliente) {
    const dialogRef = this.dialog.open(DialogConfirmacionComponent, {
      data: {
        titulo: `Confirmar`,
        mensaje: `¿Inactivar el cliente?`,
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.httpServ
        .editar('cliente', cliente.id_cliente, {
          cliente: {
            id_cliente: cliente.id_cliente,
            estado: 0,
          },
        })
        .subscribe(
          () => {
            for (const i in this.httpServ.clientes) {
              if (cliente.id_cliente == this.httpServ.clientes[i].id_cliente) {
                this.httpServ.clientes[i].estado = 0;
              }
            }
            this.mostrarClientes();
            this.toastr.success('Cliente eliminado con éxito', 'Listo');
          },
          (error) => {
            console.log(error);
            this.toastr.error('Ocurrió un error', 'Error');
          }
        );
    });
  }
}
