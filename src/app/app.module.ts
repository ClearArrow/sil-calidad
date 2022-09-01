import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData, DatePipe } from '@angular/common';
/*** Angular Material ***/
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MatRippleModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatSortModule } from '@angular/material/sort';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { SETTINGS as AUTH_SETTINGS, USE_DEVICE_LANGUAGE } from '@angular/fire/compat/auth';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';
import { CotizacionesComponent } from './pages/cotizaciones/cotizaciones.component';
import { FacturasComponent } from './pages/facturas/facturas.component';
import { FormFacturaComponent } from './pages/form-factura/form-factura.component';
import { DialogConfirmacionComponent } from './components/dialog-confirmacion/dialog-confirmacion.component';
import { FormCotizacionComponent } from './pages/form-cotizacion/form-cotizacion.component';
import { DetalleCotizacionComponent } from './components/detalle-cotizacion/detalle-cotizacion.component';
import { FormProyectoComponent } from './pages/form-proyecto/form-proyecto.component';
import { LoginComponent } from './pages/auth/login.component';
import { MainComponent } from './main.component';
import { EstadoProyectoComponent } from './components/estado-proyecto/estado-proyecto.component';
import { ProyectoComponent } from './pages/proyecto/proyecto.component';
import { ToastrModule } from 'ngx-toastr';
import { FacturaComponent } from './pages/factura/factura.component';
import { FormRetencionComponent } from './components/form-retencion/form-retencion.component';
import { CorreosFacturaComponent } from './components/correos-factura/correos-factura.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NgChartsModule } from 'ng2-charts';
import { MesesPipe } from './pipes/meses.pipe';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { FormClienteComponent } from './components/form-cliente/form-cliente.component'

registerLocaleData(localeEs, 'es');

const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ProyectosComponent,
    CotizacionesComponent,
    FacturasComponent,
    FormFacturaComponent,
    DialogConfirmacionComponent,
    FormCotizacionComponent,
    DetalleCotizacionComponent,
    FormProyectoComponent,
    LoginComponent,
    FormRetencionComponent,
    MainComponent,
    EstadoProyectoComponent,
    ProyectoComponent,
    FacturaComponent,
    CorreosFacturaComponent,
    DashboardComponent,
    MesesPipe,
    ClientesComponent,
    FormClienteComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatSortModule,
    MatIconModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressBarModule,
    ScrollingModule,
    MatListModule,
    MomentDateModule,
    MatMenuModule,
    MatRippleModule,
    MatDialogModule,
    MatTooltipModule,
    MatTabsModule,
    MatFormFieldModule,
    MatDividerModule,
    HttpClientModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    ToastrModule.forRoot(),
    NgChartsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    DatePipe,
    MesesPipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: AUTH_SETTINGS, useValue: { appVerificationDisabledForTesting: true } },
    { provide: USE_DEVICE_LANGUAGE, useValue: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
