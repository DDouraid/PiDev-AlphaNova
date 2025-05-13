import { Component, OnInit } from '@angular/core';
import { InternshipRequest } from 'src/app/core/models/internship-request';
import { InternshipRequestService } from '../services/internship-request.service';
import { InternshipService } from '../services/internship.service';
import { InterviewService } from '../services/interview.service';
import { Interview } from 'src/app/core/models/interview';


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
  requestIdToDelete: number | null = null;
  acceptForm: { startDate: string; endDate?: string; status: string; interviewDate: string } = {
    startDate: new Date().toISOString().split('T')[0],
    status: 'IN_PROGRESS',
    interviewDate: new Date().toISOString().split('T')[0]
  };
  types: string[] = ['All', 'spontaneous', 'normal'];
  selectedType: string = 'All';
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  isLoading: boolean = false;
  downloadingCv: { [key: string]: boolean } = {};
  interviews: Interview[] = [];
  interviewLoading: boolean = false;
  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';

  constructor(
    private internshipRequestService: InternshipRequestService,
    private internshipService: InternshipService,
    private interviewService: InterviewService
  ) { }

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
      },
      error: (err: any) => {
        this.showCustomAlert('danger', 'Failed to load internship requests. Please try again.');
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

  downloadCv(cvPath: string | undefined): void {
    if (!cvPath) {
      this.showCustomAlert('warning', 'No CV available to download.');
      return;
    }
    this.downloadingCv[cvPath] = true;
    this.internshipRequestService.downloadCv(cvPath).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cvPath.split('_').slice(1).join('_');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.showCustomAlert('danger', 'Failed to download CV. Please try again.');
      },
      complete: () => {
        this.downloadingCv[cvPath] = false;
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
      status: 'IN_PROGRESS',
      interviewDate: new Date().toISOString().split('T')[0]
    };
  }

  selectRequestForDeletion(id: number): void {
    this.requestIdToDelete = id;
  }

  confirmDeleteInternshipRequest(): void {
    if (this.requestIdToDelete === null) {
      this.showCustomAlert('warning', 'No internship request selected for deletion.');
      return;
    }
    this.isLoading = true;
    this.internshipRequestService.deleteInternshipRequest(this.requestIdToDelete).subscribe({
      next: () => {
        this.internshipRequests = this.internshipRequests.filter(r => r.id !== this.requestIdToDelete);
        this.applyFilters();
        this.showCustomAlert('success', 'Internship request deleted successfully!');
      },
      error: (err: any) => {
        this.showCustomAlert('danger', 'Failed to delete internship request. Please try again.');
      },
      complete: () => {
        this.isLoading = false;
        this.requestIdToDelete = null;
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024;
      if (!allowedTypes.includes(file.type)) {
        this.showCustomAlert('warning', 'Please upload a PDF, DOC, or DOCX file.');
        input.value = '';
        return;
      }
      if (file.size > maxSize) {
        this.showCustomAlert('warning', 'File size exceeds 5MB. Please upload a smaller file.');
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
      this.showCustomAlert('warning', 'No internship request selected for update.');
      return;
    }
    this.isLoading = true;
    this.internshipRequestService.updateInternshipRequest(this.selectedInternshipRequest).subscribe({
      next: (updatedRequest: InternshipRequest) => {
        const index = this.internshipRequests.findIndex(r => r.id === updatedRequest.id);
        if (index !== -1) {
          this.internshipRequests[index] = updatedRequest;
          this.applyFilters();
        }
        this.showCustomAlert('success', 'Internship request updated successfully!');
      },
      error: (err: any) => {
        this.showCustomAlert('danger', 'Failed to update internship request. Please try again.');
      },
      complete: () => {
        this.isLoading = false;
        this.selectedInternshipRequest = null;
      }
    });
  }

  acceptInternshipRequest(): void {
    if (!this.selectedInternshipRequestForAccept?.id || !this.acceptForm.interviewDate) {
      this.showCustomAlert('warning', 'Please provide all required fields, including interview date.');
      return;
    }
    this.isLoading = true;
    const requestId = this.selectedInternshipRequestForAccept.id;
    if (typeof requestId !== 'number') {
      this.showCustomAlert('danger', 'Invalid request ID.');
      this.isLoading = false;
      return;
    }
    const interviewDate = new Date(this.acceptForm.interviewDate).toISOString();

    this.internshipRequestService.updateInternshipRequestStatus(requestId, 'ACCEPTED').subscribe({
      next: (updatedRequest: InternshipRequest) => {
        this.interviewService.scheduleInterview(requestId, interviewDate).subscribe({
          next: (interview: Interview) => {
            const index = this.internshipRequests.findIndex(r => r.id === requestId);
            if (index !== -1) {
              this.internshipRequests[index] = updatedRequest;
              this.applyFilters();
            }
            this.showCustomAlert('success', 'Internship request accepted and interview scheduled! Email sent to user.');
          },
          error: (err: any) => this.showCustomAlert('danger', 'Failed to schedule interview. Please try again.')
        });
      },
      error: (err: any) => this.showCustomAlert('danger', 'Failed to accept internship request. Please try again.')
    });
  }


  rejectInternshipRequest(request: InternshipRequest): void {
    if (!request.id) {
      this.showCustomAlert('warning', 'No associated request ID found for this request.');
      return;
    }
    if (typeof request.id !== 'number') {
      this.showCustomAlert('danger', 'Invalid request ID.');
      return;
    }
    this.isLoading = true;
    this.internshipRequestService.updateInternshipRequestStatus(request.id, 'REJECTED').subscribe({
      next: (updatedRequest: InternshipRequest) => {
        this.internshipRequestService.sendEmail(request.id!, 'REJECTED').subscribe({
          next: () => {
            const index = this.internshipRequests.findIndex(r => r.id === request.id);
            if (index !== -1) {
              this.internshipRequests[index] = updatedRequest;
              this.applyFilters();
            }
            this.showCustomAlert('success', 'Internship request rejected and email sent to user.');
          },
          error: () => {
            this.showCustomAlert('danger', 'Failed to send rejection email.');
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.showCustomAlert('danger', 'Failed to reject internship request. Please try again.');
        this.isLoading = false;
      }
    });
  }


  openInterviewList(): void {
    this.interviewLoading = true;
    this.interviewService.getInterviews().subscribe({
      next: (interviews: Interview[]) => {
        this.interviews = interviews.map(interview => ({
          ...interview,
          userName: interview['internshipRequest']?.email?.split('@')[0] || 'Unknown',
          internship: interview['internshipRequest']?.title || 'N/A'
        }));
        this.interviewLoading = false;
      },
      error: (err: any) => {
        this.showCustomAlert('danger', 'Failed to load interviews. Please try again.');
      }
    });
  }

  acceptInterview(interviewId: number): void {
    if (!interviewId || typeof interviewId !== 'number') {
      this.showCustomAlert('warning', 'No or invalid interview ID provided.');
      return;
    }
    this.interviewService.updateInterviewStatus(interviewId, 'ACCEPTED').subscribe({
      next: (updatedInterview: Interview) => {
        this.interviewService.sendEmail(interviewId, 'ACCEPTED', updatedInterview['interviewDate']?.toString() || '').subscribe({
          next: () => {
            const index = this.interviews.findIndex(i => i.id === interviewId);
            if (index !== -1) this.interviews[index] = updatedInterview;
            this.showCustomAlert('success', 'Interview accepted! Email sent to user.');
          },
          error: (err: any) => this.showCustomAlert('danger', 'Failed to send acceptance email.')
        });
      },
      error: (err: any) => this.showCustomAlert('danger', 'Failed to accept interview. Please try again.')
    });
  }

  rejectInterview(interviewId: number): void {
    if (!interviewId || typeof interviewId !== 'number') {
      this.showCustomAlert('warning', 'No or invalid interview ID provided.');
      return;
    }
    this.interviewService.updateInterviewStatus(interviewId, 'REJECTED').subscribe({
      next: (updatedInterview: Interview) => {
        this.interviewService.sendEmail(interviewId, 'REJECTED').subscribe({
          next: () => {
            const index = this.interviews.findIndex(i => i.id === interviewId);
            if (index !== -1) this.interviews[index] = updatedInterview;
            this.showCustomAlert('success', 'Interview rejected! Email sent to user.');
          },
          error: (err: any) => this.showCustomAlert('danger', 'Failed to send rejection email.')
        });
      },
      error: (err: any) => this.showCustomAlert('danger', 'Failed to reject interview. Please try again.')
    });
  }

  showCustomAlert(type: 'success' | 'danger' | 'warning', message: string): void {
    this.alertType = `alert-${type}`;
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.closeAlert(), 5000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }
}
