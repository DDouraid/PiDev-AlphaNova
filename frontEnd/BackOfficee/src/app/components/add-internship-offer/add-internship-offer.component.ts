import { Component } from '@angular/core';
import { InternshipOfferService } from '../../services/internship-offer.service'; // Adjust path as needed
import { InternshipOffer } from '../../models/internship-offer'; // Adjust path as needed
import { NgForm } from '@angular/forms'; // Import NgForm for form handling

@Component({
  selector: 'app-add-internship-offer',
  templateUrl: './add-internship-offer.component.html',
  styleUrls: ['./add-internship-offer.component.css']
})
export class AddInternshipOfferComponent {
  // Model for the internship offer
  internshipOffer: InternshipOffer = {
    title: '',
    description: ''
    // internships array left undefined unless populated
  };

  constructor(private internshipOfferService: InternshipOfferService) {}

  // Submission handler for internship offer
  onSubmitOffer(form: NgForm): void {
    if (form.valid) {
      console.log('Submitting offer:', this.internshipOffer);
      this.internshipOfferService.createInternshipOffer(this.internshipOffer).subscribe({
        next: (response) => {
          console.log('Offer saved:', response);
          this.internshipOffer = { title: '', description: '' }; // Reset form fields
          form.resetForm(); // Reset the form state
        },
        error: (err) => console.error('Error creating offer:', err)
      });
    }
  }
}