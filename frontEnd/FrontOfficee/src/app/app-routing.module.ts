import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InternshipFormComponent } from './components/internship-form/internship-form.component';
import { AddInternshipRequestComponent } from './components/add-internship-request/add-internship-request.component';
import { UserInternshipOfferListComponent } from './components/user-internship-offer-list/user-internship-offer-list.component';

const routes: Routes = [
  { path: 'add', component: InternshipFormComponent }, 
  { path: 'addrequest', component: AddInternshipRequestComponent }, 
  { path: 'user/listeoffers', component: UserInternshipOfferListComponent }, // For the user version
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }