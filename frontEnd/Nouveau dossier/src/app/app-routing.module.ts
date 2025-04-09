import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListFeedbackComponent } from './list-feddback/list-feddback.component';
import { ListeEventComponent } from './liste-event/liste-event.component';
import { ListeTasksComponent } from './liste-tasks/liste-tasks.component';

const routes: Routes = [
  {path: "ListeFeedback", component: ListFeedbackComponent},
  {path:"ListeEvent", component: ListeEventComponent},
  {path:"ListeTasks", component: ListeTasksComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
