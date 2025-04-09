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
  selectedInternshipRequest: InternshipRequest | null = null;
  selectedInternshipRequestForAccept: InternshipRequest | null = null;
  acceptForm: { startDate: string; endDate?: string; status: string } = {
    startDate: new Date().toISOString().split('T')[0],
    status: 'IN_PROGRESS'
  };
  types: string[] = ['All', 'spontaneous', 'normal'];
  selectedType: string = 'All';
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  isLoading: boolean = false;
  downloadingCv: { [key: string]: boolean } = {};

  constructor(
    private internshipRequestService: InternshipRequestService,
    private internshipService: InternshipService
  ) {}

  ngOnInit(): void {
    this.loadInternshipRequests();
  }

  loadInternshipRequests(): void {
    this.isLoading = true;
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
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.internshipRequests.filter(request => {
      const matchesType = this.selectedType === 'All' || request.type === this.selectedType;
      const matchesStatus = request.status === 'PENDING' || !request.status;
      return matchesType && matchesStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRequests.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
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
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, this.currentPage - half);
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedType = 'All';
    this.applyFilters();
  }

  downloadCv(fileName: string): void {
    if (!fileName) {
      window.alert('No CV available to download.');
      return;
    }
    this.downloadingCv[fileName] = true;
    this.internshipRequestService.downloadCv(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.split('_').slice(1).join('_');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('CV downloaded:', fileName);
      },
      error: (err) => {
        console.error('Error downloading CV:', err);
        window.alert('Failed to download CV. Please try again.');
      },
      complete: () => {
        this.downloadingCv[fileName] = false;
      }
    });
  }

  selectInternshipRequest(request: InternshipRequest): void {
    this.selectedInternshipRequest = { ...request };
  }

  selectInternshipRequestForAccept(request: InternshipRequest): void {
    this.selectedInternshipRequestForAccept = { ...request };
    this.acceptForm = {
      startDate: request.internship?.startDate || new Date().toISOString().split('T')[0],
      endDate: request.internship?.endDate || undefined,
      status: 'IN_PROGRESS'
    };
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(file.type)) {
        window.alert('Please upload a PDF, DOC, or DOCX file.');
        input.value = '';
        return;
      }
      if (file.size > maxSize) {
        window.alert('File size exceeds 5MB. Please upload a smaller file.');
        input.value = '';
        return;
      }
      if (this.selectedInternshipRequest) {
        this.selectedInternshipRequest.cv = file;
      }
    }
  }

  updateInternshipRequest(): void {
    if (!this.selectedInternshipRequest?.id) {
      window.alert('No internship request selected for update.');
      return;
    }

    this.isLoading = true;
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
      },
      complete: () => {
        this.isLoading = false;
        this.selectedInternshipRequest = null;
      }
    });
  }

  acceptInternshipRequest(): void {
    if (!this.selectedInternshipRequestForAccept?.internship?.id) {
      window.alert('No associated internship found for this request.');
      return;
    }

    const internshipId = this.selectedInternshipRequestForAccept.internship.id;
    const requestId = this.selectedInternshipRequestForAccept.id!;
    const endDate = this.acceptForm.endDate || null;
    const status = 'IN_PROGRESS';

    this.isLoading = true;
    this.internshipService.updateStatusAndEndDate(internshipId, status, endDate).subscribe({
      next: (updatedInternship) => {
        console.log('Internship updated:', updatedInternship);
        this.internshipRequestService.updateInternshipRequestStatus(requestId, 'ACCEPTED').subscribe({
          next: (updatedRequest) => {
            console.log('Internship request status updated to ACCEPTED:', requestId);
            window.alert('Internship request accepted successfully!');
            const index = this.internshipRequests.findIndex(r => r.id === requestId);
            if (index !== -1) {
              this.internshipRequests[index] = updatedRequest;
              this.applyFilters();
            }
          },
          error: (err) => {
            console.error('Error updating internship request status:', err);
            window.alert('Failed to update internship request status. Please try again.');
          },
          complete: () => {
            this.isLoading = false;
            this.selectedInternshipRequestForAccept = null;
          }
        });
      },
      error: (err) => {
        console.error('Error accepting internship request:', err);
        window.alert('Failed to accept internship request. Please try again.');
        this.isLoading = false;
      }
    });
  }

  rejectInternshipRequest(request: InternshipRequest): void {
    if (!request.internship?.id || !request.id) {
      window.alert('No associated internship or request ID found for this request.');
      return;
    }

    const confirmReject = confirm('Are you sure you want to reject this internship request?');
    if (confirmReject) {
      const internshipId = request.internship.id;
      const requestId = request.id;
      const status = 'CANCELED';

      this.isLoading = true;
      this.internshipService.updateStatusAndEndDate(internshipId, status, null).subscribe({
        next: (updatedInternship) => {
          console.log('Internship rejected:', updatedInternship);
          this.internshipRequestService.updateInternshipRequestStatus(requestId, 'REJECTED').subscribe({
            next: (updatedRequest) => {
              console.log('Internship request status updated to REJECTED:', requestId);
              window.alert('Internship request rejected successfully!');
              const index = this.internshipRequests.findIndex(r => r.id === requestId);
              if (index !== -1) {
                this.internshipRequests[index] = updatedRequest;
                this.applyFilters();
              }
            },
            error: (err) => {
              console.error('Error updating internship request status:', err);
              window.alert('Failed to update internship request status. Please try again.');
            },
            complete: () => {
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error rejecting internship request:', err);
          window.alert('Failed to reject internship request. Please try again.');
          this.isLoading = false;
        }
      });
    }
  }

  deleteInternshipRequest(id: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this internship request?');
    if (confirmDelete) {
      this.isLoading = true;
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
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}