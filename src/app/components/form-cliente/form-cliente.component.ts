import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-cliente',
  templateUrl: './form-cliente.component.html',
  styleUrls: ['./form-cliente.component.css'],
})
export class FormClienteComponent implements OnInit {
  nombre = new UntypedFormControl(null, Validators.required);
  direccion = new UntypedFormControl(null);
  email = new UntypedFormControl(null, [Validators.required, Validators.email]);
  telefono = new UntypedFormControl(null);
  nit = new UntypedFormControl(null, Validators.required);
  estado = new UntypedFormControl(null, Validators.required);
  id_cliente = new UntypedFormControl(null, Validators.required);

  formulario: UntypedFormGroup;
  constructor(
    public dialogRef: MatDialogRef<FormClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
    private builder: FormBuilder
  ) {
    if (this.data.crear) {
      this.formulario = this.builder.group({
        nombre: this.nombre,
        direccion: this.direccion,
        email: this.email,
        telefono: this.telefono,
        nit: this.nit,
        estado: this.estado,
      });
      this.estado.setValue(1);
    }
    else if (this.data.editar) {
      this.formulario = this.builder.group({
        nombre: this.nombre,
        direccion: this.direccion,
        email: this.email,
        telefono: this.telefono,
        nit: this.nit,
        estado: this.estado,
        id_cliente: this.id_cliente,
      });
      this.nombre.setValue(this.data.cliente.nombre);
      this.direccion.setValue(this.data.cliente.direccion);
      this.email.setValue(this.data.cliente.email);
      this.telefono.setValue(this.data.cliente.telefono);
      this.nit.setValue(this.data.cliente.nit);
      this.estado.setValue(this.data.cliente.estado);
      this.id_cliente.setValue(this.data.cliente.id_cliente);
    }
  }

  ngOnInit(): void {}

  guardarCambios() {
    if (this.formulario.invalid) {
      return;
    }
    this.dialogRef.close(this.formulario.getRawValue());
  }
}
