import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';
import { CotizacionesComponent } from './pages/cotizaciones/cotizaciones.component';
import { FacturasComponent } from './pages/facturas/facturas.component';
import { FormCotizacionComponent } from './pages/form-cotizacion/form-cotizacion.component';
import { FormProyectoComponent } from './pages/form-proyecto/form-proyecto.component';
import { FormFacturaComponent } from './pages/form-factura/form-factura.component';
import { LoginGuard } from './guards/login.guard';
import { LoginComponent } from './pages/auth/login.component';
import { MainComponent } from './main.component';
import { ProyectoComponent } from './pages/proyecto/proyecto.component';
import { FacturaComponent } from './pages/factura/factura.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientesComponent } from './pages/clientes/clientes.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [LoginGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'proyectos', component: ProyectosComponent },
      { path: 'cotizaciones', component: CotizacionesComponent },
      { path: 'cotizacion/:id', component: FormCotizacionComponent },
      { path: 'form-proyecto/:id', component: FormProyectoComponent },
      { path: 'facturas', component: FacturasComponent },
      { path: 'form-factura/:id', component: FormFacturaComponent },
      { path: 'factura/:id', component: FacturaComponent },
      { path: 'proyecto/:id', component: ProyectoComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
