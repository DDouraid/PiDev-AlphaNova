import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component'; // Import DashboardComponent
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { CustomizeProfileComponent } from './components/profile/customize-profile/customize-profile.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AdminGuard } from './admin.guard';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { MatchingComponent } from './components/matching/matching.component';
import { ListeEventComponent } from './liste-event/liste-event.component';
import { ListSupervisorComponent } from './list-supervisor/list-supervisor.component';
import { FrontComponent } from './front/front.component';
import { EventDetailsComponent } from './eventdetails/eventdetails.component';
import { ListFeedbackComponent } from './list-feddback/list-feddback.component';
import { ListeTasksComponent } from './liste-tasks/liste-tasks.component';
import { GroupComponent } from './group/group.component';
import { MessageListComponent } from './message-list/message-list.component';
import { GroupMemberListComponent } from './group-member-list/group-member-list.component';
import { InterviewComponent } from './interview/interview.component';
import { PaymentComponent } from './payment/payment.component';
import { AddInternshipOfferComponent } from './internship/add-internship-offer/add-internship-offer.component';
import { InternshipListComponent } from './internship/internship-list/internship-list.component';
import { InternshipFormComponent } from './internship/internship-form/internship-form.component';
import { AddInternshipRequestComponent } from './internship/add-internship-request/add-internship-request.component';
import { InternshipOfferListComponent } from './internship/internship-offer-list/internship-offer-list.component';
import { InternshipRequestListComponent } from './internship/internship-request-list/internship-request-list.component';
import { UserInternshipOfferListComponent } from './internship/user-internship-offer-list/user-internship-offer-list.component';
import { OfferDetailsComponent } from './internship/offer-details/offer-details.component';
import { CalendarComponent } from './internship/calendar/calendar.component';

const routes: Routes = [
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent,canActivate: [AdminGuard] }, // Protect dashboard route  { path: 'profile', component: ProfileComponent }, // Add profile route
  { path: 'reset-password', component: ResetPasswordComponent }, // Add reset-password route
  { path: 'home', component: HomeComponent }, // Add home route // Add dashboard route
  { path: 'customize-profile', component: CustomizeProfileComponent }, // Add this route
  { path: 'profile', component: ProfileComponent}, // Protect profile route
  { path: 'matching', component: MatchingComponent },
  {path:"ListeEvent", component: ListeEventComponent},
  {path:"Listesuper", component: ListSupervisorComponent},
  {path:"FrontEvent", component: FrontComponent},
  {path:"events/:id", component: EventDetailsComponent},
  {path: "ListeFeedback", component: ListFeedbackComponent},
  {path:"ListeTasks", component: ListeTasksComponent},
  { path: 'group', component: GroupComponent },
  { path: 'messages', component: MessageListComponent },
  { path: 'interview', component: InterviewComponent },
  {path: 'payment', component: PaymentComponent },
  { path: 'group-members', component: GroupMemberListComponent },
  { path: 'ListeInternship', component: InternshipListComponent },
  { path: 'add', component: InternshipFormComponent },
  { path: 'addoffer', component: AddInternshipOfferComponent },
  { path: 'addrequest', component: AddInternshipRequestComponent },
  { path: 'listeoffers', component: InternshipOfferListComponent },
  { path: 'listrequests', component: InternshipRequestListComponent },
  { path: 'user/listeoffers', component: UserInternshipOfferListComponent },
  { path: 'calendar', component: CalendarComponent, canActivate: [AdminGuard] },
  { path: 'offer-details', component: OfferDetailsComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'access-denied', component: AccessDeniedComponent } // Add access-denied route
 // { path: '**', redirectTo: '/login' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
