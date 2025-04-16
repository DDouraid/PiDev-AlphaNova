import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InternshipRequestService } from '../../services/internship-request.service';
import { InternshipRequest } from '../../models/internship-request';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-internship-request',
  templateUrl: './add-internship-request.component.html',
  styleUrls: ['./add-internship-request.component.css']
})
export class AddInternshipRequestComponent implements OnInit {
  requestForm: FormGroup;
  cvFile: File | null = null;
  isSubmitting: boolean = false;

  // Alert properties
  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private internshipRequestService: InternshipRequestService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cv: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      if (file.size > 5 * 1024 * 1024) {
        this.showCustomAlert('warning', 'File size exceeds 5MB. Please upload a smaller file.');
        this.cvFile = null;
        input.value = '';
        this.requestForm.get('cv')?.setValue(null);
        this.requestForm.get('cv')?.markAsTouched();
        return;
      }
      this.cvFile = file;
      this.requestForm.get('cv')?.setValue(file);
      this.requestForm.get('cv')?.markAsTouched();
    } else {
      console.log('No file selected.');
      this.cvFile = null;
      this.requestForm.get('cv')?.setValue(null);
      this.requestForm.get('cv')?.markAsTouched();
    }
  }

  onSubmitRequest(): void {
    console.log('Form submitted. Form valid:', this.requestForm.valid);
    console.log('Form value:', this.requestForm.value);
    console.log('CV file:', this.cvFile);

    if (this.requestForm.valid && this.cvFile) {
      this.isSubmitting = true;
      const formValue = this.requestForm.value;

      const internshipRequest: InternshipRequest = {
        title: formValue.title,
        description: formValue.description,
        email: formValue.email,
        cv: this.cvFile,
        type: 'spontaneous'
      };
      console.log('Submitting request:', internshipRequest);
      console.log('CV to upload:', this.cvFile ? this.cvFile.name : 'No CV');
      this.internshipRequestService.createInternshipRequest(internshipRequest).subscribe({
        next: (response) => {
          console.log('Request saved:', response);
          this.requestForm.reset();
          this.cvFile = null;
          this.showCustomAlert('success', 'Internship request created successfully!');
          this.isSubmitting = false;
          this.router.navigate(['/listrequests']);
        },
        error: (err) => {
          console.error('Error creating request:', err);
          console.log('Error details:', err.message, err.status, err.error);
          const errorMessage = err.error?.message || err.message || 'Unknown error';
          this.showCustomAlert('danger', 'Failed to create internship request: ' + errorMessage);
          this.isSubmitting = false;
        }
      });
    } else {
      if (!this.cvFile) {
        this.showCustomAlert('warning', 'Please upload a CV before submitting.');
      }
      if (!this.requestForm.valid) {
        this.showCustomAlert('warning', 'Please fill in all required fields correctly.');
        console.log('Form errors:', this.requestForm.errors);
        Object.keys(this.requestForm.controls).forEach(key => {
          const control = this.requestForm.get(key);
          if (control?.invalid) {
            console.log(`Field ${key} is invalid. Errors:`, control.errors);
          }
        });
      }
    }
  }

  resetForm(): void {
    this.requestForm.reset();
    this.cvFile = null;
    this.router.navigate(['/listrequests']);
  }

  showCustomAlert(type: 'success' | 'danger' | 'warning', message: string): void {
    this.alertType = `alert-${type}`;
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.closeAlert(), 5000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }
}