import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component'; // Import DashboardComponent
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { CustomizeProfileComponent } from './components/profile/customize-profile/customize-profile.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent }, // Add profile route
  { path: 'home', component: HomeComponent }, // Add home route // Add dashboard route
  { path: 'customize-profile', component: CustomizeProfileComponent }, // Add this route
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
