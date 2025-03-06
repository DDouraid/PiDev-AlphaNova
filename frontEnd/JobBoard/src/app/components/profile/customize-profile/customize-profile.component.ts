import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CvData } from 'src/models/cv-data';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-customize-profile',
  templateUrl: './customize-profile.component.html',
  styleUrls: ['./customize-profile.component.css']
})
export class CustomizeProfileComponent implements OnInit {
  user = {
    username: '',
    email: '',
    roles: [] as string[],
    profileImage: ''
  };
  cvForm: FormGroup;
  isSaving = false;
  previewVisible = false;
  errorMessage = '';
currentYear: any;
line: any;

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
        this.user.profileImage = response.profileImage || ''; // Store the profile image
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
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font and colors
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80); // Dark blue-gray

    // Add Profile Picture (if available)
    if (this.user.profileImage) {
      try {
        // The profileImage is a base64 string, so we need to specify the format (e.g., JPEG or PNG)
        // Assuming the image is JPEG; you may need to adjust based on your image type
        doc.addImage(this.user.profileImage, 'JPEG', 160, 10, 30, 30, undefined, 'FAST'); // Position: x=160, y=10, width=30mm, height=30mm
      } catch (error) {
        console.error('Error adding profile picture to PDF:', error);
      }
    }

    // Header
    const fullName = this.cvForm.get('personalInfo.fullName')?.value || 'Your Name';
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(fullName, 105, this.user.profileImage ? 45 : 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102); // Gray
    const contactInfo = `${this.user.email || 'email@example.com'} | ${this.cvForm.get('personalInfo.phone')?.value || 'N/A'} | ${this.cvForm.get('personalInfo.address')?.value || 'N/A'}`;
    doc.text(contactInfo, 105, this.user.profileImage ? 53 : 28, { align: 'center' });

    // Divider
    doc.setDrawColor(0, 123, 255); // Blue
    doc.setLineWidth(0.5);
    doc.line(20, this.user.profileImage ? 60 : 35, 190, this.user.profileImage ? 60 : 35);

    let yPosition = this.user.profileImage ? 70 : 45;

    // Education Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 123, 255); // Blue
    doc.text('Education', 20, yPosition);
    yPosition += 2;
    doc.setLineWidth(0.3);
    doc.setDrawColor(224, 224, 224); // Light gray
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51); // Dark gray
    this.educationArray.controls.forEach((education, index) => {
      const degree = education.get('degree')?.value;
      const institution = education.get('institution')?.value;
      const year = education.get('year')?.value;
      doc.setFont('helvetica', 'bold');
      doc.text(`${degree} - ${institution}`, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(year, 190, yPosition, { align: 'right' });
      yPosition += 7;
    });
    if (this.educationArray.length === 0) {
      doc.setTextColor(108, 117, 125); // Muted gray
      doc.text('No education entries added yet.', 20, yPosition);
      yPosition += 7;
    }
    yPosition += 5;

    // Experience Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 123, 255); // Blue
    doc.text('Experience', 20, yPosition);
    yPosition += 2;
    doc.setLineWidth(0.3);
    doc.setDrawColor(224, 224, 224); // Light gray
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51); // Dark gray
    this.experienceArray.controls.forEach((experience, index) => {
      const position = experience.get('position')?.value;
      const company = experience.get('company')?.value;
      const duration = experience.get('duration')?.value;
      const description = experience.get('description')?.value;
      doc.setFont('helvetica', 'bold');
      doc.text(`${position} at ${company}`, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(duration, 190, yPosition, { align: 'right' });
      yPosition += 5;
      if (description) {
        const descriptionLines = doc.splitTextToSize(description, 160);
        descriptionLines.forEach((line: string) => {
          doc.text(line, 25, yPosition);
          yPosition += 5;
        });
      }
      yPosition += 2;
    });
    if (this.experienceArray.length === 0) {
      doc.setTextColor(108, 117, 125); // Muted gray
      doc.text('No experience entries added yet.', 20, yPosition);
      yPosition += 7;
    }
    yPosition += 5;

    // Skills Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 123, 255); // Blue
    doc.text('Skills', 20, yPosition);
    yPosition += 2;
    doc.setLineWidth(0.3);
    doc.setDrawColor(224, 224, 224); // Light gray
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51); // Dark gray
    const skills = (this.cvForm.get('skills')?.value?.split('\n') || []).filter((line: string) => line.trim());
    if (skills.length > 0) {
      skills.forEach((skill: string) => {
        doc.text(`• ${skill.trim()}`, 20, yPosition);
        yPosition += 5;
      });
    } else {
      doc.setTextColor(108, 117, 125); // Muted gray
      doc.text('No skills added yet.', 20, yPosition);
      yPosition += 7;
    }

    // Save the PDF
    doc.save(`cv_${this.user.username || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`);
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
