import { Component } from '@angular/core';
import { SignupRequest } from 'src/models/signup-request';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  signupRequest: SignupRequest = { username: '', email: '', password: '', role: [] };
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) { }

  onSubmit() {
    this.authService.register(this.signupRequest).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Registration failed: ' + (err.error.message || 'Unknown error');
        this.successMessage = '';
      }
    });
  }

  onRoleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.signupRequest.role = target.value.split(',');
    }
  }
}
