// frontend/src/app/components/register/register.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SignupRequest } from 'src/models/signup-request';
import { AuthService } from 'src/services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signupRequest: SignupRequest = { username: '', email: '', password: '', role: [] };
  errorMessage = '';
  successMessage = '';
  redirectMessage = '';
  isLoading = false;
  countdown = 5;
  currentYear = new Date().getFullYear();
  selectedAvatar: File | null = null; // To store the selected avatar file
  avatarPreview: string | null = null; // To store the preview URL
  showCamera = false;
  @ViewChild('video') video!: ElementRef;
  @ViewChild('canvas') canvas!: ElementRef;

  @ViewChild('registerForm') registerForm!: NgForm;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  onAvatarSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedAvatar = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result; // Set preview URL
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.form.markAllAsTouched();
      this.errorMessage = 'Please fix the form errors before submitting.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.authService.registerWithAvatar(this.signupRequest, this.selectedAvatar).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.errorMessage = '';
        this.isLoading = false;
        this.startRedirectCountdown();
      },
      error: (err) => {
        this.errorMessage = 'Registration failed: ' + (err.error.message || 'Unknown error');
        this.successMessage = '';
        this.redirectMessage = '';
        this.isLoading = false;
      }
    });
  }

  startRedirectCountdown() {
    this.redirectMessage = `Redirecting to login page in ${this.countdown} seconds...`;
    const timer = setInterval(() => {
      this.countdown--;
      this.redirectMessage = `Redirecting to login page in ${this.countdown} seconds...`;
      if (this.countdown <= 0) {
        clearInterval(timer);
        this.router.navigate(['/login']);
        this.redirectMessage = '';
        this.successMessage = '';
        this.countdown = 5;
      }
    }, 1000);
  }

  onRoleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.signupRequest.role = target.value.split(',').map((role: string) => role.trim());
    }
  }

  registerWithGoogle() {
    this.isLoading = true;
    console.log('Register with Google clicked');
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=http://localhost:4200/auth/register-callback&scope=email%20profile';
  }

registerWithGitHub() {
  this.isLoading = true;
  const clientId = 'Ov23liyPX428Fh4qo4fW'; // Replace with your GitHub Client ID
  const redirectUri = 'http://localhost:8088/api/auth/github-callback'; // Backend callback URL
  const scope = 'user:email'; // Request email and basic user info
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  // Redirect to GitHub
  window.location.href = githubAuthUrl;
}

  openCamera() {
    this.showCamera = true;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      this.video.nativeElement.srcObject = stream;
    });
  }

  closeCamera() {
    this.showCamera = false;
    const stream = this.video?.nativeElement?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track: any) => track.stop());
    }
  }

  capturePhoto() {
    const video = this.video.nativeElement;
    const canvas = this.canvas.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob: Blob) => {
      if (blob) {
        this.selectedAvatar = new File([blob], 'avatar.png', { type: 'image/png' });
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.avatarPreview = e.target.result;
        };
        reader.readAsDataURL(this.selectedAvatar);
      }
    }, 'image/png');
    this.closeCamera();
  }
}
