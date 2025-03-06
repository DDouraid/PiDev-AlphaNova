import { Component, OnInit } from '@angular/core';
import { InternshipRequestService } from '../../services/internship-request.service';
import { InternshipRequest } from '../../models/internship-request';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-internship-request-list',
  templateUrl: './internship-request-list.component.html',
  styleUrls: ['./internship-request-list.component.css']
})
export class InternshipRequestListComponent implements OnInit {
  internshipRequests: InternshipRequest[] = [];
  selectedInternshipRequest: InternshipRequest = {} as InternshipRequest;

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
        window.alert('Failed to load internship requests. Please try again or contact support.');
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

  selectInternshipRequest(request: InternshipRequest): void {
    this.selectedInternshipRequest = { ...request };
  }

  updateInternshipRequest(): void {
    this.internshipRequestService.updateInternshipRequest(this.selectedInternshipRequest).subscribe(
      () => {
        this.loadInternshipRequests();
        window.alert('Internship request updated successfully!');
      },
      error => {
        console.error('Error updating internship request:', error);
        window.alert('Failed to update internship request. Please try again or contact support.');
      }
    );
  }

  downloadCv(fileName: string): void {
    this.internshipRequestService.downloadCv(fileName).subscribe(
      blob => {
        // Create a URL for the blob and trigger a download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName; // Use the original file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Error downloading CV:', error);
        window.alert('Failed to download CV. Please try again or contact support.');
      }
    );
  }
}