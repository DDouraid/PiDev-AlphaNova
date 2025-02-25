import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user = {
    username: '',
    email: '',
    roles: [] as string[]
  };
  isAdmin: boolean = false; // Flag to track if user is admin

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    console.log('Loading user info, isLoggedIn:', this.authService.isLoggedIn(), 'Token:', this.authService.getToken());
    if (!this.authService.isLoggedIn()) {
      console.log('Not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getCurrentUserFromServer().subscribe({
      next: (response) => {
        console.log('User info response:', response);
        this.user.username = response.username;
        this.user.email = response.email;
        this.user.roles = response.roles || [];
        // Check if user has ADMIN role
        this.isAdmin = this.user.roles.some(role => role.toUpperCase() === 'ADMIN');
        console.log('Is Admin:', this.isAdmin);
      },
      error: (err) => {
        console.error('Error fetching user info:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
