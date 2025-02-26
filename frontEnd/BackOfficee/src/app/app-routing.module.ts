import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InternshipListComponent } from './components/internship-list/internship-list.component';
import { InternshipFormComponent } from './components/internship-form/internship-form.component';
import { AddInternshipOfferComponent } from './components/add-internship-offer/add-internship-offer.component';
import { AddInternshipRequestComponent } from './components/add-internship-request/add-internship-request.component';
import { InternshipOfferListComponent } from './components/internship-offer-list/internship-offer-list.component';
import { InternshipRequestListComponent } from './components/internship-request-list/internship-request-list.component';

const routes: Routes = [
  { path: 'ListeInternship', component: InternshipListComponent }, 
  { path: 'add', component: InternshipFormComponent }, 
  { path: 'addoffer', component: AddInternshipOfferComponent }, 
  { path: 'addrequest', component: AddInternshipRequestComponent }, 
  { path: 'listeoffers', component: InternshipOfferListComponent }, // New route for offers list
  { path: 'listrequests', component: InternshipRequestListComponent }, // New route for requests list
  { path: '', redirectTo: '/ListeInternship', pathMatch: 'full' } // Optional: Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }