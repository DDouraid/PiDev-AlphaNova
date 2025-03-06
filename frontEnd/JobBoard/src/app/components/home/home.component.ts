// frontend/src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { timer } from 'rxjs'; // Import timer for creating a delay
import { tap } from 'rxjs/operators'; // Import tap for side effects

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
  isLoading: boolean = false; // Loading state
  errorMessage: string = ''; // Error message for user info fetch
  adminMessage: string = ''; // Message to display for admin users during loading
  suggestionMessage: string = ''; // Suggestion message for non-admin users

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

    this.isLoading = true;
    this.errorMessage = '';
    this.adminMessage = '';
    this.suggestionMessage = '';

    // Use timer to ensure the loading state lasts at least 3 seconds
    const loadingDelay$ = timer(3000); // 3000ms = 3 seconds

    this.authService.getCurrentUserFromServer().pipe(
      tap(() => {
        // Ensure the loading state lasts for at least 3 seconds
        loadingDelay$.subscribe(() => {
          this.isLoading = false;
          // Redirect if admin after the delay
          if (this.isAdmin) {
            this.router.navigate(['/dashboard']);
          }
        });
      })
    ).subscribe({
      next: (response) => {
        console.log('User info response:', response);
        this.user.username = response.username;
        this.user.email = response.email;
        this.user.roles = response.roles || [];
        // Check if user has ADMIN role
        this.isAdmin = this.user.roles.some(role => role.toUpperCase() === 'ADMIN');
        console.log('Is Admin:', this.isAdmin);
        // Set admin message during loading
        if (this.isAdmin) {
          this.adminMessage = 'Welcome, Admin! Heading to your dashboard in a moment...';
        } else {
          // Set suggestion message for non-admin users
          this.suggestionMessage = 'Looking to stand out? Customize your profile and upload your CV now to unlock new opportunities!';
        }
      },
      error: (err) => {
        this.errorMessage = 'Error fetching user info: ' + (err.message || 'Unknown error');
        console.error('Error fetching user info:', err);
        // Ensure the loading state lasts for at least 3 seconds even on error
        loadingDelay$.subscribe(() => {
          this.isLoading = false;
          this.router.navigate(['/login']);
        });
      }
    });
  }

  // Navigate to the customize profile page
  goToCustomizeProfile(): void {
    this.router.navigate(['/customize-profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
