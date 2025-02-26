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
}