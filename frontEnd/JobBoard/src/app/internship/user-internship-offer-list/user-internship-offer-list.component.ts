import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InternshipOfferService } from '../../internship/services/internship-offer.service';
import { InternshipOffer } from '../../core/models/internship-offer';

@Component({
  selector: 'app-user-internship-offer-list',
  templateUrl: './user-internship-offer-list.component.html',
  styleUrls: ['./user-internship-offer-list.component.css']
})
export class UserInternshipOfferListComponent implements OnInit {
  internshipOffers: InternshipOffer[] = [];
  filteredOffers: InternshipOffer[] = [];
  paginatedOffers: InternshipOffer[] = [];
  searchQuery: string = '';
  selectedLocation: string = '';
  locations: string[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  // Alert properties
  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';

  constructor(
    private internshipOfferService: InternshipOfferService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInternshipOffers();
  }

  loadInternshipOffers(): void {
    this.internshipOfferService.getAllInternshipOffers().subscribe(
      data => {
        this.internshipOffers = data.map(offer => ({
          ...offer,
          datePosted: offer.datePosted ? new Date(offer.datePosted).toISOString() : undefined,
          durationInMonths: offer.durationInMonths !== undefined && offer.durationInMonths !== null
            ? Number(offer.durationInMonths)
            : null
        }));
        this.filteredOffers = [...this.internshipOffers];
        this.locations = [...new Set(this.internshipOffers
          .filter(offer => offer.location)
          .map(offer => offer.location as string))];
        this.locations.unshift('All Locations');
        this.selectedLocation = 'All Locations';
        this.updatePagination();
        console.log('Processed internship offers:', this.internshipOffers);
        console.log('Unique locations:', this.locations);
      },
      error => {
        console.error('Error fetching internship offers:', error);
        this.showCustomAlert('danger', 'Failed to load internship offers. Please try again later.');
      }
    );
  }

  onSearchOrFilter(): void {
    let filtered = [...this.internshipOffers];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(query) ||
        offer.description.toLowerCase().includes(query) ||
        (offer.company && offer.company.toLowerCase().includes(query)) ||
        (offer.location && offer.location.toLowerCase().includes(query)) ||
        (offer.durationInMonths !== null && offer.durationInMonths !== undefined && offer.durationInMonths.toString().includes(query))
      );
    }

    if (this.selectedLocation && this.selectedLocation !== 'All Locations') {
      filtered = filtered.filter(offer =>
        offer.location && offer.location === this.selectedLocation
      );
    }

    this.filteredOffers = filtered;
    this.currentPage = 1;
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
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, this.currentPage - half);
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

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
    this.searchQuery = '';
    this.selectedLocation = 'All Locations';
    this.onSearchOrFilter();
  }

  viewDetails(offer: InternshipOffer): void {
    this.router.navigate(['/offer-details'], {
      queryParams: { offer: JSON.stringify(offer) }
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
