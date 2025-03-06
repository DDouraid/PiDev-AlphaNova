import { Component, OnInit } from '@angular/core';
import { InternshipService } from '../../services/internship.service';
import { InternshipOfferService } from '../../services/internship-offer.service';
import { InternshipRequestService } from '../../services/internship-request.service';
import { Internship, InternStatus } from '../../models/internship'; // Import InternStatus
import { InternshipOffer } from '../../models/internship-offer';
import { InternshipRequest } from '../../models/internship-request';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-internship-list',
  templateUrl: './internship-list.component.html',
  styleUrls: ['./internship-list.component.css']
})
export class InternshipListComponent implements OnInit {
  internships: Internship[] = [];
  internshipOffers: InternshipOffer[] = [];
  internshipRequests: InternshipRequest[] = [];
  selectedInternship: Internship = {} as Internship; // Holds the internship being updated

  // Internship form properties
  internship: Internship = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: InternStatus.IN_PROGRESS
  };
  statuses = Object.values(InternStatus); // Use the enum values
  isSubmittingInternship = false;

  constructor(
    private internshipService: InternshipService,
    private internshipOfferService: InternshipOfferService,
    private internshipRequestService: InternshipRequestService
  ) {}

  ngOnInit(): void {
    this.loadInternships();
    this.loadInternshipOffers();
    this.loadInternshipRequests();
  }

  loadInternships(): void {
    this.internshipService.getAllInternships().subscribe(
      data => {
        this.internships = data;
      },
      error => {
        console.error('Error fetching internships:', error);
        window.alert('Failed to load internships. Please try again or contact support.');
      }
    );
  }

  loadInternshipOffers(): void {
    this.internshipOfferService.getAllInternshipOffers().subscribe(
      data => {
        this.internshipOffers = data;
      },
      error => {
        console.error('Error fetching internship offers:', error);
        window.alert('Failed to load internship offers. Please try again or contact support.');
      }
    );
  }

  loadInternshipRequests(): void {
    this.internshipRequestService.getAllInternshipRequests().subscribe(
      data => {
        this.internshipRequests = data;
      },
      error => {
        console.error('Error fetching internship requests:', error);
        window.alert('Failed to load internship requests. Please try again or contact support.');
      }
    );
  }

  deleteInternship(id: number): void {
    this.internshipService.deleteInternship(id).subscribe(
      () => {
        this.loadInternships(); // Refresh the list after deletion
        window.alert('Internship deleted successfully!');
      },
      error => {
        console.error('Error deleting internship:', error);
        window.alert('Failed to delete internship. Please try again or contact support.');
      }
    );
  }

  deleteInternshipOffer(id: number): void {
    this.internshipOfferService.deleteInternshipOffer(id).subscribe(
      () => {
        this.loadInternshipOffers();
        window.alert('Internship offer deleted successfully!');
      },
      error => {
        console.error('Error deleting internship offer:', error);
        window.alert('Failed to delete internship offer. Please try again or contact support.');
      }
    );
  }

  deleteInternshipRequest(id: number): void {
    this.internshipRequestService.deleteInternshipRequest(id).subscribe(
      () => {
        this.loadInternshipRequests();
        window.alert('Internship request deleted successfully!');
      },
      error => {
        console.error('Error deleting internship request:', error);
        window.alert('Failed to delete internship request. Please try again or contact support.');
      }
    );
  }

  // Select the internship to update
  selectInternship(internship: Internship): void {
    this.selectedInternship = { ...internship }; // Create a copy to avoid direct mutation
  }

  // Update the internship
  updateInternship(): void {
    this.internshipService.updateInternship(this.selectedInternship).subscribe(
      () => {
        this.loadInternships(); // Refresh the list after update
        window.alert('Internship updated successfully!');
      },
      error => {
        console.error('Error updating internship:', error);
        window.alert('Failed to update internship. Please try again or contact support.');
      }
    );
  }

  // Add internship form submission
  onSubmitInternship(form: NgForm): void {
    if (!form.valid) return;

    this.isSubmittingInternship = true;
    this.internshipService.createInternship(this.internship).subscribe({
      next: (response) => {
        console.log('Internship saved:', response);
        this.isSubmittingInternship = false;
        form.resetForm();
        this.internship = { title: '', description: '', startDate: '', endDate: '', status: InternStatus.IN_PROGRESS };
        window.alert('Internship created successfully!');
        // Close the modal
        const modal = document.getElementById('addInternshipModal');
        if (modal) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
          if (bootstrapModal) {
            bootstrapModal.hide();
          }
        }
        // Refresh the internship list
        this.loadInternships();
      },
      error: (err) => {
        console.error('Error creating internship:', err);
        this.isSubmittingInternship = false;
        window.alert('Failed to create internship. Please try again.');
      }
    });
  }
}