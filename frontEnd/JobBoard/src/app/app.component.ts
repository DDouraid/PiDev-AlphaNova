// frontend/src/app/components/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtResponse } from 'src/models/jwt-response';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user = {
    username: '',
    email: '',
    roles: [] as string[],
    profileImage: '',
    displayImage: ''
  };
  isAdmin = false;
  isLoggedIn = true;
  currentPageTitle = 'Home';
  currentYear: number = new Date().getFullYear();

  constructor(public router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isLoggedIn() ? this.loadUserInfo() : this.updateTitle();
    this.router.events.subscribe(() => {
      this.isLoggedIn = this.authService.isLoggedIn();
      if (this.isLoggedIn) {
        this.loadUserInfo();
      }
      this.updateTitle();
    });
  }

  loadUserInfo(): void {
    this.authService.getCurrentUserFromServer().subscribe({
      next: (response: JwtResponse) => {
        this.user.username = response.username;
        this.user.email = response.email;
        this.user.roles = response.roles || [];
        this.user.profileImage = response.profileImage || '';
        this.user.displayImage = response.profileImage && response.profileImage.startsWith('uploads/') ? response.profileImage : 'assets/img/man (1).png';
        this.isAdmin = this.user.roles.some(role => role.toUpperCase() === 'ADMIN');
        console.log('AppComponent - User info loaded:', this.user);
        console.log('AppComponent - Display image URL:', this.user.displayImage);
      },
      error: (err) => console.error('Error fetching user info:', err)
    });
  }

  updateTitle(): void {
    const path = this.router.url.split('/')[1] || 'home';
    this.currentPageTitle = path.charAt(0).toUpperCase() + path.slice(1);
  }

  isAuthRoute(): boolean {
    const currentRoute = this.router.url;
    return currentRoute === '/login' || currentRoute === '/register' || currentRoute === '/reset-password';
  }

  isLoginRoute(): boolean {
    const currentRoute = this.router.url;
    return currentRoute === '/login';
  }

  isRegisterRoute(): boolean {
    const currentRoute = this.router.url;
    return currentRoute === '/register';
  }

  isResetPasswordRoute(): boolean {
    const currentRoute = this.router.url;
    return currentRoute === '/reset-password';
  }

  isFullPageAuthRoute(): boolean {
    return this.isLoginRoute() || this.isRegisterRoute() || this.isResetPasswordRoute();
  }

  isProfileRoute(): boolean {
    const currentRoute = this.router.url;
    return currentRoute === '/profile';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
