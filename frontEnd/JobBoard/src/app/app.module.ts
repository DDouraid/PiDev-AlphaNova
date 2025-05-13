import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CustomizeProfileComponent } from './components/profile/customize-profile/customize-profile.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { AppRoutingModule } from './app-routing.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatchingComponent } from './components/matching/matching.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ListeEventComponent } from './liste-event/liste-event.component';
import { ListSupervisorComponent } from './list-supervisor/list-supervisor.component';
import { FrontComponent } from './front/front.component';
import { EventDetailsComponent } from './eventdetails/eventdetails.component';
import { ListFeedbackComponent } from './list-feddback/list-feddback.component';
import { ListeTasksComponent } from './liste-tasks/liste-tasks.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FilterByStatusPipe } from './core/pipes/filter-by-status.pipe';
import { F } from '@angular/cdk/scrolling-module.d-aa3aedaa';
import { MessageListComponent } from './message-list/message-list.component';
import { GroupComponent } from './group/group.component';
import { GroupMemberListComponent } from './group-member-list/group-member-list.component';
import { InterviewComponent } from './interview/interview.component';
import { PaymentComponent } from './payment/payment.component';
import { AddInternshipOfferComponent } from './internship/add-internship-offer/add-internship-offer.component';
import { InternshipOfferListComponent } from './internship/internship-offer-list/internship-offer-list.component';
import { UserInternshipOfferListComponent } from './internship/user-internship-offer-list/user-internship-offer-list.component';
import { InternshipListComponent } from './internship/internship-list/internship-list.component';
import { InternshipFormComponent } from './internship/internship-form/internship-form.component';
import { AddInternshipRequestComponent } from './internship/add-internship-request/add-internship-request.component';
import { InternshipRequestListComponent } from './internship/internship-request-list/internship-request-list.component';
import { OfferDetailsComponent } from './internship/offer-details/offer-details.component';
import { CalendarComponent } from './internship/calendar/calendar.component';
import { AlertComponent } from './internship/alert/alert.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { InternshipService } from './internship/services/internship.service';
import { InternshipOfferService } from './internship/services/internship-offer.service';
import { InternshipRequestService } from './internship/services/internship-request.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PredictionComponent } from './components/matching/prediction/prediction.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    HomeComponent,
    ProfileComponent,
    AuthCallbackComponent,
    CustomizeProfileComponent,
    ResetPasswordComponent,
    AccessDeniedComponent,
    MatchingComponent,
    MessageListComponent,
    GroupComponent,
    GroupMemberListComponent,
    DashboardComponent,

    ListeEventComponent,
    ListSupervisorComponent,
    FrontComponent,
    EventDetailsComponent,
    ListFeedbackComponent,
    ListeTasksComponent,
    FilterByStatusPipe,
    InterviewComponent,
    PaymentComponent,
    AddInternshipOfferComponent,
    InternshipOfferListComponent,
    UserInternshipOfferListComponent,
    InternshipListComponent,
    InternshipFormComponent,
    AddInternshipRequestComponent,
    InternshipRequestListComponent,
    OfferDetailsComponent,
    CalendarComponent,
    AlertComponent,
    PredictionComponent


  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    ModalModule.forRoot(),
  ],
  providers: [
    InternshipService,
    // InternshipOfferService,
    InternshipRequestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
