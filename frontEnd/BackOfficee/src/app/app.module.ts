import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Add this
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
import { AddInternshipOfferComponent } from './components/add-internship-offer/add-internship-offer.component';
import { AddInternshipRequestComponent } from './components/add-internship-request/add-internship-request.component';
import { InternshipOfferListComponent } from './components/internship-offer-list/internship-offer-list.component';
import { InternshipRequestListComponent } from './components/internship-request-list/internship-request-list.component';
import { UserInternshipOfferListComponent } from './components/user-internship-offer-list/user-internship-offer-list.component';
import { NotificationComponent } from './components/notification/notification.component';
import { OfferDetailsComponent } from './components/offer-details/offer-details.component';

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
    NotificationComponent,
    OfferDetailsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Required for ngx-toastr animations
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      preventDuplicates: true // Optional: prevents duplicate toasts
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