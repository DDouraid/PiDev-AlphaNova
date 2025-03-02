// frontend/src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { MessageResponse } from 'src/models/message-response';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile = {
    username: '',
    email: '',
    roles: [] as string[],
    profileImage: '',
    displayImage: '', // Track the URL to display (data URL or backend path)
    cvFile: ''
  };
  isAdmin: boolean = false;
  isEditing: boolean = false;
  editProfile = {
    username: '',
    email: '',
    roles: [] as string[]
  };
  errorMessage = '';
  successMessage = '';
  selectedImage: File | null = null;
  selectedCV: File | null = null;
  timestamp: number = Date.now();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  onRolesInput($event: Event) {
    throw new Error('Method not implemented.');
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
        console.log('Received profileImage:', response.profileImage);
        this.profile.username = response.username;
        this.profile.email = response.email;
        this.profile.roles = response.roles || [];
        this.profile.profileImage = response.profileImage || '';
        this.profile.displayImage = response.profileImage && response.profileImage.startsWith('uploads/') ? response.profileImage : 'assets/img/man (1).png';
        this.profile.cvFile = response.cvFile || '';
        this.isAdmin = this.profile.roles.some(role => role.toUpperCase() === 'ADMIN');
        console.log('Is Admin:', this.isAdmin);
        console.log('Set profileImage:', this.profile.profileImage);
        console.log('Set displayImage:', this.profile.displayImage);
        console.log('Constructed image URL:', this.profile.displayImage && this.profile.displayImage.startsWith('uploads/') ? 'http://localhost:8088/' + this.profile.displayImage : 'Default');

        this.editProfile.username = this.profile.username;
        this.editProfile.email = this.profile.email;
        this.editProfile.roles = [...this.profile.roles];
        this.timestamp = Date.now();
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.displayImage = e.target.result; // Preview the image
      };
      reader.readAsDataURL(file);
    }
  }

  onCVSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedCV = file;
    }
  }

  saveProfile(): void {
    if (!this.editProfile.username || !this.editProfile.email) {
      this.errorMessage = 'Username and email are required.';
      return;
    }

    const updateProfileRequest: { username?: string; email?: string; roles?: string[] } = {
      username: this.editProfile.username !== this.profile.username ? this.editProfile.username : undefined,
      email: this.editProfile.email !== this.profile.email ? this.editProfile.email : undefined,
      roles: this.isAdmin && JSON.stringify(this.editProfile.roles) !== JSON.stringify(this.profile.roles) ? this.editProfile.roles : undefined
    };

    const filteredRequest = Object.fromEntries(
      Object.entries(updateProfileRequest).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(filteredRequest).length === 0 && !this.selectedImage && !this.selectedCV) {
      this.errorMessage = 'No changes detected.';
      return;
    }

    if (Object.keys(filteredRequest).length > 0) {
      this.authService.updateUserProfile(filteredRequest).subscribe({
        next: (response: MessageResponse) => {
          this.successMessage = response.message;
          this.errorMessage = '';
          if (typeof filteredRequest['username'] === 'string') this.profile.username = filteredRequest['username'];
          if (typeof filteredRequest['email'] === 'string') this.profile.email = filteredRequest['email'];
          if (filteredRequest['roles']) {
            this.profile.roles = Array.isArray(filteredRequest['roles']) ? filteredRequest['roles'] : [];
            this.isAdmin = this.profile.roles.some(role => role.toUpperCase() === 'ADMIN');
          }
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to update profile: ' + (err.message || 'Unknown error');
          this.successMessage = '';
        }
      });
    }

    if (this.selectedImage) {
      this.authService.uploadProfileImage(this.selectedImage).subscribe({
        next: (response: MessageResponse) => {
          this.successMessage = this.successMessage ? `${this.successMessage} ${response.message}` : response.message;
          this.errorMessage = '';
          this.selectedImage = null;
          setTimeout(() => {
            this.loadUserProfile();
          }, 1000);
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to upload image: ' + (err.message || 'Unknown error');
          this.successMessage = '';
        }
      });
    }

    if (this.selectedCV) {
      this.authService.uploadCV(this.selectedCV).subscribe({
        next: (response: MessageResponse) => {
          this.successMessage = this.successMessage ? `${this.successMessage} ${response.message}` : response.message;
          this.errorMessage = '';
          this.selectedCV = null;
          setTimeout(() => {
            this.loadUserProfile();
          }, 1000);
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to upload CV: ' + (err.message || 'Unknown error');
          this.successMessage = '';
        }
      });
    }

    this.isEditing = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
