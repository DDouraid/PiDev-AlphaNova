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
          window.alert('Internship offer created successfully!');
        },
        error: (err) => {
          console.error('Error creating offer:', err);
          // Show error alert
          window.alert('Failed to create internship offer. Please try again.');
        }
      });
    }
  }
}