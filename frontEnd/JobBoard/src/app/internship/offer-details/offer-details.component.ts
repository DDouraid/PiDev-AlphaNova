import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InternshipOffer } from 'src/models/internship-offer';
import { InternshipRequestService } from '../services/internship-request.service';
import { InternshipRequest } from 'src/app/core/models/internship-request';


@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.css']
})
export class OfferDetailsComponent implements OnInit {
  offer: InternshipOffer | null = null;
  applicationForm: { email: string, cv: File | null } = { email: '', cv: null };

  // Alert properties
  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private internshipRequestService: InternshipRequestService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['offer']) {
        const parsedOffer = JSON.parse(params['offer']);
        this.offer = {
          ...parsedOffer,
          durationInMonths: parsedOffer.durationInMonths !== undefined && parsedOffer.durationInMonths !== null
            ? Number(parsedOffer.durationInMonths)
            : null
        };
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(file.type)) {
        this.showCustomAlert('warning', 'Please upload a PDF, DOC, or DOCX file.');
        input.value = '';
        this.applicationForm.cv = null;
        return;
      }
      if (file.size > maxSize) {
        this.showCustomAlert('warning', 'File size exceeds 5MB. Please upload a smaller file.');
        input.value = '';
        this.applicationForm.cv = null;
        return;
      }
      this.applicationForm.cv = file;
    }
  }

  submitApplication(): void {
    if (!this.offer) {
      console.error('No offer selected');
      this.showCustomAlert('danger', 'No offer selected. Please try again.');
      return;
    }

    if (this.offer.id === undefined) {
      console.error('Selected offer has no ID');
      this.showCustomAlert('danger', 'Selected offer is invalid. Please try again.');
      return;
    }

    if (!this.applicationForm.email || !this.applicationForm.cv) {
      this.showCustomAlert('warning', 'Please provide both an email address and a CV.');
      return;
    }

    const internshipRequest: InternshipRequest = {
      title: `Application for ${this.offer.title}`,
      description: `User applied for the internship offer: ${this.offer.title} (ID: ${this.offer.id})\nEmail: ${this.applicationForm.email}\nCV: ${this.applicationForm.cv.name}`,
      email: this.applicationForm.email,
      cv: this.applicationForm.cv,
      type: 'normal'
    };

    this.internshipRequestService.createInternshipRequest(internshipRequest, this.offer.id).subscribe(
      (response) => {
        console.log('Application submitted successfully:', response);
        this.showCustomAlert('success', 'Application submitted successfully!');
        this.applicationForm = { email: '', cv: null };
      },
      (error) => {
        console.error('Error submitting application:', error);
        this.showCustomAlert('danger', 'Failed to submit application. Please try again.');
      }
    );
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
