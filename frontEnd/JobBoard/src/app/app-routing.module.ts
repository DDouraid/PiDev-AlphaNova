import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListeEventComponent } from './liste-event/liste-event.component';
import { ListSupervisorComponent } from './list-supervisor/list-supervisor.component';

const routes: Routes = [
  {path:"ListeEvent", component: ListeEventComponent},
  {path:"Listesuper", component: ListSupervisorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
