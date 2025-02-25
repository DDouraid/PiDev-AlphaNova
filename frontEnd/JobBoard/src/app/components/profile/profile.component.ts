import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile = {
    username: '',
    email: '',
    roles: [] as string[]
  };
  isAdmin: boolean = false; // Flag to track if user is admin

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    console.log('Loading profile, isLoggedIn:', this.authService.isLoggedIn(), 'Token:', this.authService.getToken());
    if (!this.authService.isLoggedIn()) {
      console.log('Not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getCurrentUserFromServer().subscribe({
      next: (response) => {
        console.log('Profile response:', response);
        this.profile.username = response.username;
        this.profile.email = response.email;
        this.profile.roles = response.roles || [];
        // Check if user has ADMIN role
        this.isAdmin = this.profile.roles.some(role => role.toUpperCase() === 'ADMIN');
        console.log('Is Admin:', this.isAdmin);
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
