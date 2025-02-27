import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CvData } from 'src/models/cv-data';

@Component({
  selector: 'app-customize-profile',
  templateUrl: './customize-profile.component.html',
  styleUrls: ['./customize-profile.component.css']
})
export class CustomizeProfileComponent implements OnInit {
  user = {
    username: '',
    email: '',
    roles: [] as string[]
  };
  cvForm: FormGroup;
  isSaving = false;
  previewVisible = false;
  errorMessage = '';
currentYear: any;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    // Initialize the form with validation
    this.cvForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        phone: ['', [Validators.pattern('^[0-9]{10}$')]],
        address: ['']
      }),
      education: this.fb.array([
        this.fb.group({
          institution: ['', [Validators.required, Validators.maxLength(100)]],
          degree: ['', [Validators.required, Validators.maxLength(100)]],
          year: ['', [Validators.required, Validators.pattern('^[0-9]{4}$'), Validators.min(1900), Validators.max(new Date().getFullYear())]]
        })
      ]),
      experience: this.fb.array([
        this.fb.group({
          company: ['', [Validators.required, Validators.maxLength(100)]],
          position: ['', [Validators.required, Validators.maxLength(100)]],
          duration: ['', [Validators.required, Validators.maxLength(50)]],
          description: ['', Validators.maxLength(500)]
        })
      ]),
      skills: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.authService.getCurrentUserFromServer().subscribe({
      next: (response) => {
        this.user.username = response.username;
        this.user.email = response.email;
        this.user.roles = response.roles || [];
        this.cvForm.patchValue({ personalInfo: { fullName: this.user.username } });
        console.log('User info loaded for customize profile:', this.user);
      },
      error: (err) => {
        this.errorMessage = 'Error fetching user info: ' + (err.message || 'Unknown error');
        console.error('Error fetching user info:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  // Explicitly typed getters for FormArray
  get educationArray(): FormArray {
    return this.cvForm.get('education') as FormArray;
  }

  get experienceArray(): FormArray {
    return this.cvForm.get('experience') as FormArray;
  }

  addEducation(): void {
    const educationGroup = this.fb.group({
      institution: ['', [Validators.required, Validators.maxLength(100)]],
      degree: ['', [Validators.required, Validators.maxLength(100)]],
      year: ['', [Validators.required, Validators.pattern('^[0-9]{4}$'), Validators.min(1900), Validators.max(new Date().getFullYear())]]
    });
    this.educationArray.push(educationGroup);
  }

  removeEducation(index: number): void {
    this.educationArray.removeAt(index);
  }

  addExperience(): void {
    const experienceGroup = this.fb.group({
      company: ['', [Validators.required, Validators.maxLength(100)]],
      position: ['', [Validators.required, Validators.maxLength(100)]],
      duration: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', Validators.maxLength(500)]
    });
    this.experienceArray.push(experienceGroup);
  }

  removeExperience(index: number): void {
    this.experienceArray.removeAt(index);
  }

  saveCV(): void {
    if (this.cvForm.valid) {
      this.isSaving = true;
      const cvData: CvData = this.cvForm.value;
      console.log('Saving CV data:', cvData);
      this.authService.saveCV(cvData).subscribe({
        next: (response) => {
          console.log('CV saved:', response);
          this.isSaving = false;
          this.errorMessage = '';
          alert('CV saved successfully!');
        },
        error: (err) => {
          this.errorMessage = 'Error saving CV: ' + (err.message || 'Unknown error');
          console.error('Error saving CV:', err);
          this.isSaving = false;
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.cvForm.markAllAsTouched(); // Highlight all invalid fields
      console.log('Form is invalid:', this.cvForm.errors);
    }
  }

  togglePreview(): void {
    this.previewVisible = !this.previewVisible;
  }

  downloadCV(): void {
    const cvText = this.generateCVText();
    const blob = new Blob([cvText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv_${this.user.username || 'user'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  public generateCVText(): string {
    const formValue = this.cvForm.value;
    let cv = `=== CV ===\n\n`;
    cv += `Name: ${formValue.personalInfo.fullName}\n`;
    cv += `Email: ${this.user.email}\n`;
    cv += `Phone: ${formValue.personalInfo.phone || 'N/A'}\n`;
    cv += `Address: ${formValue.personalInfo.address || 'N/A'}\n\n`;
    cv += `=== Education ===\n`;
    formValue.education.forEach((edu: any, index: number) => {
      cv += `${index + 1}. ${edu.degree} - ${edu.institution} (${edu.year})\n`;
    });
    cv += `\n=== Experience ===\n`;
    formValue.experience.forEach((exp: any, index: number) => {
      cv += `${index + 1}. ${exp.position} at ${exp.company} (${exp.duration})\n`;
      if (exp.description) cv += `   ${exp.description}\n`;
    });
    cv += `\n=== Skills ===\n`;
    cv += formValue.skills.split('\n').filter((line: string) => line.trim()).map((skill: string, index: number) => `${index + 1}. ${skill.trim()}`).join('\n');
    return cv;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
