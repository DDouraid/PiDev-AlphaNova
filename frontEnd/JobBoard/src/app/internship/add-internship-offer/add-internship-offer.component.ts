import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { InternshipOfferService } from '../services/internship-offer.service';
import { InternshipOffer } from 'src/app/core/models/internship-offer';

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
    datePosted: '',
    userId: this.getCurrentUserId(),
    username: this.getCurrentUsername(),
    durationInMonths: null,
    internshipRequests: []
  };

  // Alert properties
  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';

  constructor(private internshipOfferService: InternshipOfferService) {}

  private getCurrentUserId(): number {
    // Get user ID from JWT token or user service
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user?.id || 0;
  }

  private getCurrentUsername(): string {
    // Get username from JWT token or user service
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user?.username || '';
  }

  onSubmitOffer(form: NgForm): void {
    if (form.valid) {
      // Ensure user details are set
      this.internshipOffer.userId = this.getCurrentUserId();
      this.internshipOffer.username = this.getCurrentUsername();

      console.log('Submitting offer:', this.internshipOffer);
      this.internshipOfferService.createInternshipOffer(this.internshipOffer).subscribe({
        next: (response) => {
          console.log('Offer saved:', response);
          this.resetForm(form);
          this.showCustomAlert('success', 'Internship offer created successfully!');
        },
        error: (err) => {
          console.error('Error creating offer:', err);
          this.showCustomAlert('danger', 'Failed to create internship offer. Please try again.');
        }
      });
    }
  }

  private resetForm(form: NgForm): void {
    this.internshipOffer = {
      title: '',
      description: '',
      company: '',
      location: '',
      datePosted: '',
      userId: this.getCurrentUserId(),
      username: this.getCurrentUsername(),
      durationInMonths: null,
      internshipRequests: []
    };
    form.resetForm();
  }

  showCustomAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = `alert-${type}`;
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.closeAlert(), 5000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }
}
