import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from 'src/models/login-request';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginRequest: LoginRequest = { username: '', password: '' };
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Login successful!';
        this.errorMessage = '';
        console.log('Login successful, token in localStorage:', localStorage.getItem('token')); // Debug
        setTimeout(() => {
          if (this.authService.hasRole('ADMIN')) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        }, 100);
      },
      error: (err) => {
        this.errorMessage = 'Login failed: ' + (err.error.message || 'Unknown error');
        this.successMessage = '';
        console.error('Login error details:', err); // Debug
      }
    });
  }
}
