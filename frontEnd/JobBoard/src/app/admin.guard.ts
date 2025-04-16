import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if the user is logged in
    if (!this.authService.isLoggedIn()) {
      // this.router.navigate(['/login']);
      return false;
    }

    // Check if the user has the ADMIN role
    if (this.authService.hasRole('ADMIN')) {
      return true;
    } else {
      // Redirect non-admin users to /access-denied
      this.router.navigate(['/access-denied']);
      return false;
    }
  }
}
