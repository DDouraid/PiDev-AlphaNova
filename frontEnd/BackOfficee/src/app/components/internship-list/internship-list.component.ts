import { Component, OnInit } from '@angular/core';
import { InternshipService } from '../../services/internship.service';
import { Internship } from '../../models/internship';
import { InternshipOfferService } from '../../services/internship-offer.service';
import { InternshipOffer } from '../../models/internship-offer';
import { InternshipRequestService } from '../../services/internship-request.service';
import { InternshipRequest } from '../../models/internship-request';

@Component({
  selector: 'app-internship-list',
  templateUrl: './internship-list.component.html'
})
export class InternshipListComponent implements OnInit {
  internships: Internship[] = [];
  internshipOffers: InternshipOffer[] = [];
  internshipRequests: InternshipRequest[] = [];
  selectedInternship: Internship = {} as Internship; // Holds the internship being updated
  statuses = ['IN_PROGRESS', 'COMPLETED', 'CANCELED']; // Define statuses for the dropdown

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
      }
    );
  }

  deleteInternship(id: number): void {
    this.internshipService.deleteInternship(id).subscribe(
      () => {
        this.loadInternships(); // Refresh the list after deletion
        console.log('Internship deleted successfully');
      },
      error => {
        console.error('Error deleting internship:', error);
        alert('Failed to delete internship. Please try again or contact support.');
      }
    );
  }

  deleteInternshipOffer(id: number): void {
    this.internshipOfferService.deleteInternshipOffer(id).subscribe(
      () => {
        this.loadInternshipOffers();
      },
      error => {
        console.error('Error deleting internship offer:', error);
      }
    );
  }

  deleteInternshipRequest(id: number): void {
    this.internshipRequestService.deleteInternshipRequest(id).subscribe(
      () => {
        this.loadInternshipRequests();
      },
      error => {
        console.error('Error deleting internship request:', error);
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
        console.log('Internship updated successfully');
      },
      error => {
        console.error('Error updating internship:', error);
        alert('Failed to update internship. Please try again or contact support.');
      }
    );
  }
}