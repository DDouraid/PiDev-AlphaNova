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
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'access-denied', component: AccessDeniedComponent } // Add access-denied route
 // { path: '**', redirectTo: '/login' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
