import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InternshipListComponent } from './components/internship-list/internship-list.component';
import { InternshipFormComponent } from './components/internship-form/internship-form.component';
import { AddInternshipOfferComponent } from './components/add-internship-offer/add-internship-offer.component';
import { AddInternshipRequestComponent } from './components/add-internship-request/add-internship-request.component';
import { InternshipOfferListComponent } from './components/internship-offer-list/internship-offer-list.component';
import { InternshipRequestListComponent } from './components/internship-request-list/internship-request-list.component';
import { UserInternshipOfferListComponent } from './components/user-internship-offer-list/user-internship-offer-list.component';
import { OfferDetailsComponent } from './components/offer-details/offer-details.component';
import { CalendarComponent } from './components/calendar/calendar.component'; // Import CalendarComponent

const routes: Routes = [
  { path: 'ListeInternship', component: InternshipListComponent },
  { path: 'add', component: InternshipFormComponent },
  { path: 'addoffer', component: AddInternshipOfferComponent },
  { path: 'addrequest', component: AddInternshipRequestComponent },
  { path: 'listeoffers', component: InternshipOfferListComponent },
  { path: 'listrequests', component: InternshipRequestListComponent },
  { path: '', redirectTo: '/ListeInternship', pathMatch: 'full' },
  { path: 'user/listeoffers', component: UserInternshipOfferListComponent },
  { path: 'offer-details', component: OfferDetailsComponent },
  { path: 'calendar', component: CalendarComponent } // Add the new route for Calendar
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }