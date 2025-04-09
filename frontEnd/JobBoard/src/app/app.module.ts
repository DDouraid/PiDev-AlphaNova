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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Add this
import { CommonModule } from '@angular/common';


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
    MatchingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Add this
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    CommonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
