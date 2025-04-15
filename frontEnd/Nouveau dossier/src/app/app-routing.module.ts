import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListFeedbackComponent } from './list-feddback/list-feddback.component';
import { ListeEventComponent } from './liste-event/liste-event.component';
import { ListeTasksComponent } from './liste-tasks/liste-tasks.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserTasksComponent } from './user-tasks/user-tasks.component';
import { UserFeedbackComponent } from './user-feedback/user-feedback.component';

const routes: Routes = [
  { path: "ListeFeedback", component: ListFeedbackComponent },
  { path: "ListeEvent", component: ListeEventComponent },
  { path: "ListeTasks", component: ListeTasksComponent },
  { path: "users", component: UserListComponent }, // Route for user list
  { path: "user-tasks/:userId", component: UserTasksComponent }, // Route for user-specific tasks
  { path: "user-feedback/:userId", component: UserFeedbackComponent }, // Route for user-specific feedback
  { path: "", redirectTo: "/users", pathMatch: "full" }, // Default route to user list
  { path: "**", redirectTo: "/users" } // Wildcard route for invalid paths
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }