import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Interview } from 'src/models/interviewR.model';
import { InterviewService } from 'src/services/interviewR.service';

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.css']
})
export class InterviewComponent implements OnInit {
  interviews: Interview[] = [];
  newInterview: Interview = { reference: '', link: '', status: '' };
  currentPage: number = 1;
  itemsPerPage: number = 5;
  searchTerm = '';
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
Math: any;

  constructor(
    private interviewService: InterviewService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
    });
  }

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.isLoading = true;
    this.interviewService.getInterviews().subscribe({
      next: (data) => {
        this.interviews = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError('Error loading interviews', err);
      }
    });
  }

  addInterview(): void {
    if (!this.newInterview.reference || !this.newInterview.link || !this.newInterview.status) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isLoading = true;
    this.interviewService.addInterview(this.newInterview).subscribe({
      next: () => {
        this.handleSuccess('Interview added successfully');
        this.newInterview = { reference: '', link: '', status: '' };
        this.loadInterviews();
      },
      error: (err) => {
        this.handleError('Error adding interview', err);
      }
    });
  }

  deleteInterview(id: number): void {
    if (!confirm('Are you sure you want to delete this interview?')) return;

    this.isLoading = true;
    this.interviewService.deleteInterview(id).subscribe({
      next: () => {
        this.handleSuccess('Interview deleted successfully');
        this.loadInterviews();
      },
      error: (err) => {
        this.handleError('Error deleting interview', err);
      }
    });
  }

  filteredRows() {
    if (!this.searchTerm) {
      return this.interviews;
    }
    return this.interviews.filter(row =>
      row.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      row.link.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      row.status.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get paginatedRows() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRows().slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get totalPages() {
    return Math.ceil(this.filteredRows().length / this.itemsPerPage);
  }

  private handleSuccess(message: string): void {
    this.isLoading = false;
    this.successMessage = message;
    this.errorMessage = null;
    setTimeout(() => this.successMessage = null, 3000);
  }

  private handleError(context: string, error: any): void {
    console.error(`${context}:`, error);
    this.isLoading = false;
    this.errorMessage = `${context}: ${error.message || 'Unknown error'}`;
    this.successMessage = null;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
