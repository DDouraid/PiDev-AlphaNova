import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { InternshipListComponent } from './components/internship-list/internship-list.component';
import { InternshipFormComponent } from './components/internship-form/internship-form.component';
import { InternshipService } from './services/internship.service';
import { InternshipOfferService } from './services/internship-offer.service';
import { InternshipRequestService } from './services/internship-request.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal'; // Import ModalModule for modals
import { AddInternshipOfferComponent } from './components/add-internship-offer/add-internship-offer.component';
import { AddInternshipRequestComponent } from './components/add-internship-request/add-internship-request.component';
import { InternshipOfferListComponent } from './components/internship-offer-list/internship-offer-list.component';
import { InternshipRequestListComponent } from './components/internship-request-list/internship-request-list.component';
import { UserInternshipOfferListComponent } from './components/user-internship-offer-list/user-internship-offer-list.component';
import { OfferDetailsComponent } from './components/offer-details/offer-details.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AlertComponent } from './components/alert/alert.component';
import { CalendarModule, DateAdapter } from 'angular-calendar'; // For calendar functionality
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns'; // Date adapter for angular-calendar

@NgModule({
  declarations: [
    AppComponent,
    InternshipListComponent,
    InternshipFormComponent,
    DashboardComponent,
    AddInternshipOfferComponent,
    AddInternshipRequestComponent,
    InternshipOfferListComponent,
    InternshipRequestListComponent,
    UserInternshipOfferListComponent,
    OfferDetailsComponent,
    CalendarComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    BsDatepickerModule.forRoot(), // Compatible with ngx-bootstrap@10.3.0
    ModalModule.forRoot(), // Add ModalModule for modals
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      preventDuplicates: true
    }),
    CalendarModule.forRoot({ // Configure angular-calendar with date-fns adapter
      provide: DateAdapter,
      useFactory: adapterFactory,
    })
  ],
  providers: [
    InternshipService,
    InternshipOfferService,
    InternshipRequestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }