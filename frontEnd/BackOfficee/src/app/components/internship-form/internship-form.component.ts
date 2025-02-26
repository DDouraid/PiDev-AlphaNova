import { Component } from '@angular/core';
import { InternshipService } from '../../services/internship.service';
import { Internship, InternStatus } from '../../models/internship';
import { InternshipOfferService } from '../../services/internship-offer.service';
import { InternshipOffer } from '../../models/internship-offer';
import { InternshipRequestService } from '../../services/internship-request.service';
import { InternshipRequest } from '../../models/internship-request';

@Component({
  selector: 'app-internship-form',
  templateUrl: './internship-form.component.html'
})
export class InternshipFormComponent {
  internship: Internship = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: InternStatus.IN_PROGRESS
    // internshipOffer and internshipRequest are optional and left undefined
  };

  internshipOffer: InternshipOffer = {
    title: '',
    description: ''
    // internships array left undefined unless populated
  };

  internshipRequest: InternshipRequest = {
    title: '',
    description: ''
  };

  statuses = Object.values(InternStatus);

  constructor(
    private internshipService: InternshipService,
    private internshipOfferService: InternshipOfferService,
    private internshipRequestService: InternshipRequestService
  ) {}

  onSubmitInternship(): void {
    console.log('Submitting internship:', this.internship);
    this.internshipService.createInternship(this.internship).subscribe({
      next: (response) => {
        console.log('Internship saved:', response);
        this.internship = { title: '', description: '', startDate: '', endDate: '', status: InternStatus.IN_PROGRESS };
      },
      error: (err) => console.error('Error creating internship:', err)
    });
  }

  onSubmitOffer(): void {
    console.log('Submitting offer:', this.internshipOffer);
    this.internshipOfferService.createInternshipOffer(this.internshipOffer).subscribe({
      next: (response) => {
        console.log('Offer saved:', response);
        this.internshipOffer = { title: '', description: '' };
      },
      error: (err) => console.error('Error creating offer:', err)
    });
  }

  onSubmitRequest(): void {
    console.log('Submitting request:', this.internshipRequest);
    this.internshipRequestService.createInternshipRequest(this.internshipRequest).subscribe({
      next: (response) => {
        console.log('Request saved:', response);
        this.internshipRequest = { title: '', description: '' };
      },
      error: (err) => console.error('Error creating request:', err)
    });
  }
}