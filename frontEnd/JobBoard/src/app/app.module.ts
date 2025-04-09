import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddFeedbackComponent } from './add-feedback/add-feedback.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ListFeedbackComponent } from './list-feddback/list-feddback.component';
import { ListeEventComponent } from './liste-event/liste-event.component';
import { ListeTasksComponent } from './liste-tasks/liste-tasks.component';
import { ListSupervisorComponent } from './list-supervisor/list-supervisor.component';

@NgModule({
  declarations: [
    AppComponent,
    AddFeedbackComponent,
    DashboardComponent,
    ListFeedbackComponent,
    ListeEventComponent,
    ListeTasksComponent,
    ListSupervisorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
