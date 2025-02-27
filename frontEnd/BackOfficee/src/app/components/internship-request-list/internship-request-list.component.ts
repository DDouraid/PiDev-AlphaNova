import { Component, OnInit } from '@angular/core';
import { InternshipRequestService } from '../../services/internship-request.service';
import { InternshipRequest } from '../../models/internship-request';

@Component({
  selector: 'app-internship-request-list',
  templateUrl: './internship-request-list.component.html',
  styleUrls: ['./internship-request-list.component.css'] // Optional
})
export class InternshipRequestListComponent implements OnInit {
  internshipRequests: InternshipRequest[] = [];
  selectedInternshipRequest: InternshipRequest = {} as InternshipRequest; // Holds the request being updated

  constructor(private internshipRequestService: InternshipRequestService) {}

  ngOnInit(): void {
    this.loadInternshipRequests();
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

  deleteInternshipRequest(id: number): void {
    this.internshipRequestService.deleteInternshipRequest(id).subscribe(
      () => {
        this.loadInternshipRequests(); // Refresh the list after deletion
        console.log('Internship request deleted successfully');
      },
      error => {
        console.error('Error deleting internship request:', error);
        alert('Failed to delete internship request. Please try again or contact support.');
      }
    );
  }

  // Select the internship request to update
  selectInternshipRequest(request: InternshipRequest): void {
    this.selectedInternshipRequest = { ...request }; // Create a copy to avoid direct mutation
  }

  // Update the internship request
  updateInternshipRequest(): void {
    this.internshipRequestService.updateInternshipRequest(this.selectedInternshipRequest).subscribe(
      () => {
        this.loadInternshipRequests(); // Refresh the list after update
        console.log('Internship request updated successfully');
      },
      error => {
        console.error('Error updating internship request:', error);
        alert('Failed to update internship request. Please try again or contact support.');
      }
    );
  }
}