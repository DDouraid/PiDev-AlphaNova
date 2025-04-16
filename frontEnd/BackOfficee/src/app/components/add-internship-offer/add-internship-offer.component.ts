import { Component } from '@angular/core';
import { InternshipOfferService } from '../../services/internship-offer.service';
import { InternshipOffer } from '../../models/internship-offer';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-internship-offer',
  templateUrl: './add-internship-offer.component.html',
  styleUrls: ['./add-internship-offer.component.css']
})
export class AddInternshipOfferComponent {
  internshipOffer: InternshipOffer = {
    title: '',
    description: '',
    company: '',
    location: '',
    datePosted: ''
  };

  // Alert properties
  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';

  constructor(private internshipOfferService: InternshipOfferService) {}

  onSubmitOffer(form: NgForm): void {
    if (form.valid) {
      console.log('Submitting offer:', this.internshipOffer);
      this.internshipOfferService.createInternshipOffer(this.internshipOffer).subscribe({
        next: (response) => {
          console.log('Offer saved:', response);
          this.internshipOffer = { title: '', description: '', company: '', location: '', datePosted: '' };
          form.resetForm();
          // Show success alert
          this.showCustomAlert('success', 'Internship offer created successfully!');
        },
        error: (err) => {
          console.error('Error creating offer:', err);
          // Show error alert
          this.showCustomAlert('danger', 'Failed to create internship offer. Please try again.');
        }
      });
    }
  }

  // Method to show the custom alert
  showCustomAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = `alert-${type}`;
    this.alertMessage = message;
    this.showAlert = true;
    // Auto-hide the alert after 5 seconds
    setTimeout(() => this.closeAlert(), 5000);
  }

  // Method to close the alert
  closeAlert(): void {
    this.showAlert = false;
  }
}