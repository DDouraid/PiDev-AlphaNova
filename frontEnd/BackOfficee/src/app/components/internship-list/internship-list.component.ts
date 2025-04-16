import { Component, OnInit } from '@angular/core';
import { InternshipService } from '../../services/internship.service';
import { Internship, InternStatus } from '../../models/internship';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-internship-list',
  templateUrl: './internship-list.component.html',
  styleUrls: ['./internship-list.component.css']
})
export class InternshipListComponent implements OnInit {
  internships: Internship[] = [];
  filteredInternships: Internship[] = [];
  paginatedInternships: Internship[] = [];

  selectedInternship: Internship = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: InternStatus.IN_PROGRESS
  };

  internship: Internship = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: InternStatus.IN_PROGRESS
  };
  statuses = Object.values(InternStatus);
  filterStatuses: string[] = ['All', ...Object.values(InternStatus)];
  selectedStatus: string = 'All';
  isSubmittingInternship = false;
  isLoading = false;

  // Pagination properties for internships
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  // Alert properties
  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';

  constructor(private internshipService: InternshipService) {}

  ngOnInit(): void {
    this.loadInternships();
  }

  loadInternships(): void {
    this.isLoading = true;
    this.internshipService.getAllInternships().subscribe(
      data => {
        this.internships = data;
        this.filteredInternships = [...data];
        this.applyFilters();
      },
      error => {
        console.error('Error fetching internships:', error);
        this.showCustomAlert('danger', 'Failed to load internships. Please try again or contact support.');
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  applyFilters(): void {
    this.filteredInternships = this.internships.filter(internship => {
      return this.selectedStatus === 'All' || internship.status === this.selectedStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredInternships.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.paginate();
  }

  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedInternships = this.filteredInternships.slice(startIndex, endIndex);
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

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedStatus = 'All';
    this.applyFilters();
  }

  deleteInternship(id: number | undefined): void {
    if (id === undefined) {
      console.error('Cannot delete internship: ID is undefined');
      this.showCustomAlert('danger', 'Cannot delete internship: Invalid ID.');
      return;
    }

    this.internshipService.deleteInternship(id).subscribe(
      () => {
        this.loadInternships();
        this.showCustomAlert('success', 'Internship deleted successfully!');
      },
      error => {
        console.error('Error deleting internship:', error);
        this.showCustomAlert('danger', 'Failed to delete internship. Please try again or contact support.');
      }
    );
  }

  selectInternship(internship: Internship): void {
    this.selectedInternship = { ...internship };
  }

  updateInternship(): void {
    if (this.selectedInternship.id === undefined) {
      console.error('Cannot update internship: ID is undefined');
      this.showCustomAlert('danger', 'Cannot update internship: Invalid ID.');
      return;
    }

    this.internshipService.updateInternship(this.selectedInternship).subscribe(
      () => {
        this.loadInternships();
        this.showCustomAlert('success', 'Internship updated successfully!');
      },
      error => {
        console.error('Error updating internship:', error);
        this.showCustomAlert('danger', 'Failed to update internship. Please try again or contact support.');
      }
    );
  }

  onSubmitInternship(form: NgForm): void {
    if (!form.valid) return;

    this.isSubmittingInternship = true;
    this.internshipService.createInternship(this.internship).subscribe({
      next: (response) => {
        console.log('Internship saved:', response);
        this.isSubmittingInternship = false;
        form.resetForm();
        this.internship = { title: '', description: '', startDate: '', endDate: '', status: InternStatus.IN_PROGRESS };
        this.showCustomAlert('success', 'Internship created successfully!');
        const modal = document.getElementById('addInternshipModal');
        if (modal) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
          if (bootstrapModal) {
            bootstrapModal.hide();
          }
        }
        this.loadInternships();
      },
      error: (err) => {
        console.error('Error creating internship:', err);
        this.isSubmittingInternship = false;
        this.showCustomAlert('danger', 'Failed to create internship. Please try again.');
      }
    });
  }

  showCustomAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = `alert-${type}`;
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.closeAlert(), 5000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }
}