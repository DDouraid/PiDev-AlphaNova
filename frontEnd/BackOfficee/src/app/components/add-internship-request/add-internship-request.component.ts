import { Component } from '@angular/core';
import { InternshipRequestService } from '../../services/internship-request.service'; // Adjust path as needed
import { InternshipRequest } from '../../models/internship-request'; // Adjust path as needed
import { NgForm } from '@angular/forms'; // Import for form handling

@Component({
  selector: 'app-add-internship-request',
  templateUrl: './add-internship-request.component.html',
  styleUrls: ['./add-internship-request.component.css'] // Optional CSS file
})
export class AddInternshipRequestComponent {
  // Model for the internship request
  internshipRequest: InternshipRequest = {
    title: '',
    description: ''
  };

  constructor(private internshipRequestService: InternshipRequestService) {}

  // Submission handler for internship request
  onSubmitRequest(form: NgForm): void {
    if (form.valid) {
      console.log('Submitting request:', this.internshipRequest);
      this.internshipRequestService.createInternshipRequest(this.internshipRequest).subscribe({
        next: (response) => {
          console.log('Request saved:', response);
          this.internshipRequest = { title: '', description: '' }; // Reset model
          form.resetForm(); // Reset form state
        },
        error: (err) => console.error('Error creating request:', err)
      });
    }
  }
}