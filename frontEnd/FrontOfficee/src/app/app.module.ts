import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { InternshipFormComponent } from './components/internship-form/internship-form.component';
import { InternshipService } from './services/internship.service';
import { InternshipOfferService } from './services/internship-offer.service';
import { InternshipRequestService } from './services/internship-request.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';
import { AddInternshipRequestComponent } from './components/add-internship-request/add-internship-request.component';
import { UserInternshipOfferListComponent } from './components/user-internship-offer-list/user-internship-offer-list.component';

@NgModule({
  declarations: [
    AppComponent,
    InternshipFormComponent,
    DashboardComponent,
    AddInternshipRequestComponent,
    UserInternshipOfferListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule, 
    ReactiveFormsModule,
    AppRoutingModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
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