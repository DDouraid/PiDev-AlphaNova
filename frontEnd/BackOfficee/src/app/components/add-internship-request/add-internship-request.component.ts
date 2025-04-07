import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InternshipRequestService } from '../../services/internship-request.service';
import { InternshipRequest } from '../../models/internship-request';
import { Router } from '@angular/router';
import { InternshipOfferService } from '../../services/internship-offer.service';
import { InternshipOffer } from '../../models/internship-offer';

@Component({
  selector: 'app-add-internship-request',
  templateUrl: './add-internship-request.component.html',
  styleUrls: ['./add-internship-request.component.css']
})
export class AddInternshipRequestComponent implements OnInit {
  requestForm: FormGroup;
  cvFile: File | null = null;
  isSubmitting: boolean = false;
  internshipOffers: InternshipOffer[] = [];

  constructor(
    private fb: FormBuilder,
    private internshipRequestService: InternshipRequestService,
    private internshipOfferService: InternshipOfferService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      offerId: [null], // Optional for spontaneous applications
      description: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cv: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInternshipOffers();
  }

  loadInternshipOffers(): void {
    this.internshipOfferService.getAllInternshipOffers().subscribe({
      next: (offers) => {
        this.internshipOffers = offers;
        console.log('Fetched internship offers:', offers);
      },
      error: (err) => {
        console.error('Error fetching internship offers:', err);
        window.alert('Failed to load internship offers. Please try again.');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      if (file.size > 5 * 1024 * 1024) {
        window.alert('File size exceeds 5MB. Please upload a smaller file.');
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

      // Determine the title based on whether an offer is selected
      let title: string;
      const selectedOffer = this.internshipOffers.find(offer => offer.id === Number(formValue.offerId));
      if (selectedOffer) {
        title = `Application for ${selectedOffer.title}`;
      } else {
        title = 'Spontaneous Application';
      }

      const internshipRequest: InternshipRequest = {
        title: title, // Set the title dynamically
        description: formValue.description,
        email: formValue.email,
        cv: this.cvFile,
        type: 'spontaneous' // Set type to spontaneous
      };
      console.log('Submitting request:', internshipRequest, 'for offerId:', formValue.offerId);
      console.log('CV to upload:', this.cvFile ? this.cvFile.name : 'No CV');
      this.internshipRequestService.createInternshipRequest(internshipRequest, formValue.offerId).subscribe({
        next: (response) => {
          console.log('Request saved:', response);
          this.requestForm.reset();
          this.cvFile = null;
          window.alert('Internship request created successfully!');
          this.isSubmitting = false;
          this.router.navigate(['/listrequests']);
        },
        error: (err) => {
          console.error('Error creating request:', err);
          console.log('Error details:', err.message, err.status, err.error);
          const errorMessage = err.error?.message || err.message || 'Unknown error';
          window.alert('Failed to create internship request: ' + errorMessage);
          this.isSubmitting = false;
        }
      });
    } else {
      if (!this.cvFile) {
        window.alert('Please upload a CV before submitting.');
      }
      if (!this.requestForm.valid) {
        window.alert('Please fill in all required fields correctly.');
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
}