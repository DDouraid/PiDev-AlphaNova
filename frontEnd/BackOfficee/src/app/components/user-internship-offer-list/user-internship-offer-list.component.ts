import { Component, OnInit } from '@angular/core';
import { InternshipOfferService } from '../../services/internship-offer.service';
import { InternshipRequestService } from '../../services/internship-request.service';
import { InternshipOffer } from '../../models/internship-offer';
import { InternshipRequest } from '../../models/internship-request';

@Component({
  selector: 'app-user-internship-offer-list',
  templateUrl: './user-internship-offer-list.component.html',
  styleUrls: ['./user-internship-offer-list.component.css']
})
export class UserInternshipOfferListComponent implements OnInit {
  internshipOffers: InternshipOffer[] = [];
  filteredOffers: InternshipOffer[] = []; // Filtered offers
  paginatedOffers: InternshipOffer[] = []; // Offers to display on the current page
  searchQuery: string = ''; // Search query input
  selectedLocation: string = ''; // Selected location for filtering
  locations: string[] = []; // Unique locations for the filter dropdown
  selectedOffer: InternshipOffer | null = null;

  // Application form properties
  applicationForm: { email: string, cv: File | null } = { email: '', cv: null };

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 5; // 5 offers per page by default
  totalPages: number = 1;

  constructor(
    private internshipOfferService: InternshipOfferService,
    private internshipRequestService: InternshipRequestService
  ) {}

  ngOnInit(): void {
    this.loadInternshipOffers();
  }

  loadInternshipOffers(): void {
    this.internshipOfferService.getAllInternshipOffers().subscribe(
      data => {
        // Preprocess datePosted to ensure it's in a format the date pipe can handle
        this.internshipOffers = data.map(offer => ({
          ...offer,
          datePosted: offer.datePosted ? new Date(offer.datePosted).toISOString() : undefined
        }));
        this.filteredOffers = [...this.internshipOffers]; // Initialize filtered offers
        // Extract unique locations
        this.locations = [...new Set(this.internshipOffers
          .filter(offer => offer.location) // Filter out null/undefined locations
          .map(offer => offer.location as string))]; // Cast to string
        this.locations.unshift('All Locations'); // Add "All Locations" option
        this.selectedLocation = 'All Locations'; // Set default value
        this.updatePagination(); // Initialize pagination
        console.log('Processed internship offers:', this.internshipOffers);
        console.log('Unique locations:', this.locations);
      },
      error => {
        console.error('Error fetching internship offers:', error);
        alert('Failed to load internship offers. Please try again later.');
      }
    );
  }

  onSearchOrFilter(): void {
    let filtered = [...this.internshipOffers];

    // Apply search query filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(query) ||
        offer.description.toLowerCase().includes(query) ||
        (offer.company && offer.company.toLowerCase().includes(query)) ||
        (offer.location && offer.location.toLowerCase().includes(query))
      );
    }

    // Apply location filter
    if (this.selectedLocation && this.selectedLocation !== 'All Locations') {
      filtered = filtered.filter(offer =>
        offer.location && offer.location === this.selectedLocation
      );
    }

    this.filteredOffers = filtered;
    this.currentPage = 1; // Reset to first page when filters change
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOffers.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedOffers = this.filteredOffers.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5; // Maximum number of page numbers to show
    const half = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, this.currentPage - half);
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if endPage is at the maximum
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  onSearch(): void {
    this.onSearchOrFilter();
  }

  onLocationChange(): void {
    this.onSearchOrFilter();
  }

  clearFilters(): void {
    this.searchQuery = ''; // Clear search query
    this.selectedLocation = 'All Locations'; // Reset location filter
    this.onSearchOrFilter(); // Apply the reset filters
  }

  viewDetails(offer: InternshipOffer): void {
    this.selectedOffer = offer;
    console.log('Viewing details for offer:', offer);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file.');
        input.value = ''; // Clear the input
        this.applicationForm.cv = null;
        return;
      }
      if (file.size > maxSize) {
        alert('File size exceeds 5MB. Please upload a smaller file.');
        input.value = ''; // Clear the input
        this.applicationForm.cv = null;
        return;
      }
      this.applicationForm.cv = file;
    }
  }

  submitApplication(): void {
    if (!this.selectedOffer) {
      console.error('No offer selected');
      alert('No offer selected. Please try again.');
      return;
    }

    if (this.selectedOffer.id === undefined) {
      console.error('Selected offer has no ID');
      alert('Selected offer is invalid. Please try again.');
      return;
    }

    if (!this.applicationForm.email || !this.applicationForm.cv) {
      alert('Please provide both an email address and a CV.');
      return;
    }

    // Create a new internship request
    const internshipRequest: InternshipRequest = {
      title: `Application for ${this.selectedOffer.title}`,
      description: `User applied for the internship offer: ${this.selectedOffer.title} (ID: ${this.selectedOffer.id})\nEmail: ${this.applicationForm.email}\nCV: ${this.applicationForm.cv.name}`
    };

    this.internshipRequestService.createInternshipRequest(internshipRequest, this.selectedOffer.id).subscribe(
      (response) => {
        console.log('Application submitted successfully:', response);
        alert('Application submitted successfully!');
        // Reset the form and close the modal
        this.applicationForm = { email: '', cv: null };
        const modal = document.getElementById('applyOfferModal');
        if (modal) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
          if (bootstrapModal) {
            bootstrapModal.hide();
          }
        }
      },
      (error) => {
        console.error('Error submitting application:', error);
        alert('Failed to submit application. Please try again.');
      }
    );
  }
}