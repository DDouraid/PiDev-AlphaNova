import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { AddInternshipOfferComponent } from './components/add-internship-offer/add-internship-offer.component';
import { AddInternshipRequestComponent } from './components/add-internship-request/add-internship-request.component';
import { InternshipOfferListComponent } from './components/internship-offer-list/internship-offer-list.component';
import { InternshipRequestListComponent } from './components/internship-request-list/internship-request-list.component';

@NgModule({
  declarations: [
    AppComponent,
    InternshipListComponent,
    InternshipFormComponent,
    DashboardComponent,
    AddInternshipOfferComponent,
    AddInternshipRequestComponent,
    InternshipOfferListComponent,
    InternshipRequestListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule // Ensure this is last to apply routing correctly
  ],
  providers: [
    InternshipService,
    InternshipOfferService,
    InternshipRequestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }