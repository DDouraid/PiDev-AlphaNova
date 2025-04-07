import { Component, OnInit } from '@angular/core';
import { InternshipRequestService } from '../../services/internship-request.service';
import { InternshipRequest } from '../../models/internship-request';
import { InternshipService } from '../../services/internship.service';

@Component({
  selector: 'app-internship-request-list',
  templateUrl: './internship-request-list.component.html',
  styleUrls: ['./internship-request-list.component.css']
})
export class InternshipRequestListComponent implements OnInit {
  internshipRequests: InternshipRequest[] = [];
  filteredRequests: InternshipRequest[] = [];
  paginatedRequests: InternshipRequest[] = [];
  selectedInternshipRequest: InternshipRequest = {} as InternshipRequest;
  selectedInternshipRequestForAccept: InternshipRequest = {} as InternshipRequest;
  acceptForm: { startDate?: string; endDate?: string; status: string } = { status: 'IN_PROGRESS' };
  types: string[] = ['All', 'spontaneous', 'normal'];
  selectedType: string = 'All';
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(
    private internshipRequestService: InternshipRequestService,
    private internshipService: InternshipService
  ) {}

  ngOnInit(): void {
    this.loadInternshipRequests();
  }

  loadInternshipRequests(): void {
    this.internshipRequestService.getAllInternshipRequests().subscribe({
      next: (requests) => {
        this.internshipRequests = requests;
        this.filteredRequests = [...requests];
        this.applyFilters();
        console.log('Fetched internship requests:', requests);
      },
      error: (err) => {
        console.error('Error fetching internship requests:', err);
        window.alert('Failed to load internship requests. Please try again.');
      }
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.internshipRequests.filter(request => {
      const matchesType = this.selectedType === 'All' || request.type === this.selectedType;
      return matchesType;
    });
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRequests.length / this.pageSize);
    this.currentPage = 1;
    this.paginate();
  }

  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRequests = this.filteredRequests.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginate();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedType = 'All';
    this.applyFilters();
  }

  downloadCv(fileName: string): void {
    this.internshipRequestService.downloadCv(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('CV downloaded:', fileName);
      },
      error: (err) => {
        console.error('Error downloading CV:', err);
        window.alert('Failed to download CV. Please try again.');
      }
    });
  }

  selectInternshipRequest(request: InternshipRequest): void {
    this.selectedInternshipRequest = { ...request };
  }

  selectInternshipRequestForAccept(request: InternshipRequest): void {
    this.selectedInternshipRequestForAccept = { ...request };
    // Set default values for the accept form
    this.acceptForm = {
      startDate: request.internship?.startDate || new Date().toISOString().split('T')[0], // Use existing start date or current date
      endDate: '',
      status: 'IN_PROGRESS'
    };
  }

  updateInternshipRequest(): void {
    this.internshipRequestService.updateInternshipRequest(this.selectedInternshipRequest).subscribe({
      next: (updatedRequest) => {
        const index = this.internshipRequests.findIndex(r => r.id === updatedRequest.id);
        if (index !== -1) {
          this.internshipRequests[index] = updatedRequest;
          this.applyFilters();
        }
        console.log('Internship request updated:', updatedRequest);
        window.alert('Internship request updated successfully!');
      },
      error: (err) => {
        console.error('Error updating internship request:', err);
        window.alert('Failed to update internship request. Please try again.');
      }
    });
  }

  acceptInternshipRequest(): void {
    if (!this.selectedInternshipRequestForAccept.internship?.id) {
      window.alert('No associated internship found for this request.');
      return;
    }

    const internshipId = this.selectedInternshipRequestForAccept.internship.id;
    const requestId = this.selectedInternshipRequestForAccept.id;
    const endDate = this.acceptForm.endDate || null;
    const status = 'IN_PROGRESS';

    // First, update the internship status and end date
    this.internshipService.updateStatusAndEndDate(internshipId, status, endDate).subscribe({
      next: (updatedInternship) => {
        console.log('Internship updated:', updatedInternship);
        // Then, delete the internship request
        this.internshipRequestService.deleteInternshipRequest(requestId!).subscribe({
          next: () => {
            console.log('Internship request deleted:', requestId);
            window.alert('Internship request accepted and removed successfully!');
            // Remove the request from the local list
            this.internshipRequests = this.internshipRequests.filter(r => r.id !== requestId);
            this.applyFilters();
          },
          error: (err) => {
            console.error('Error deleting internship request after acceptance:', err);
            window.alert('Failed to delete internship request after acceptance. Please try again.');
          }
        });
      },
      error: (err) => {
        console.error('Error accepting internship request:', err);
        window.alert('Failed to accept internship request. Please try again.');
      }
    });
  }

  rejectInternshipRequest(request: InternshipRequest): void {
    if (!request.internship?.id) {
      window.alert('No associated internship found for this request.');
      return;
    }

    const confirmReject = confirm('Are you sure you want to reject this internship request?');
    if (confirmReject) {
      const internshipId = request.internship.id;
      const requestId = request.id;
      const status = 'CANCELED';

      // First, update the internship status
      this.internshipService.updateStatusAndEndDate(internshipId, status, null).subscribe({
        next: (updatedInternship) => {
          console.log('Internship rejected:', updatedInternship);
          // Then, delete the internship request
          this.internshipRequestService.deleteInternshipRequest(requestId!).subscribe({
            next: () => {
              console.log('Internship request deleted:', requestId);
              window.alert('Internship request rejected and removed successfully!');
              // Remove the request from the local list
              this.internshipRequests = this.internshipRequests.filter(r => r.id !== requestId);
              this.applyFilters();
            },
            error: (err) => {
              console.error('Error deleting internship request after rejection:', err);
              window.alert('Failed to delete internship request after rejection. Please try again.');
            }
          });
        },
        error: (err) => {
          console.error('Error rejecting internship request:', err);
          window.alert('Failed to reject internship request. Please try again.');
        }
      });
    }
  }

  deleteInternshipRequest(id: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this internship request?');
    if (confirmDelete) {
      this.internshipRequestService.deleteInternshipRequest(id).subscribe({
        next: () => {
          this.internshipRequests = this.internshipRequests.filter(r => r.id !== id);
          this.applyFilters();
          console.log('Internship request deleted:', id);
          window.alert('Internship request deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting internship request:', err);
          window.alert('Failed to delete internship request. Please try again.');
        }
      });
    }
  }
}