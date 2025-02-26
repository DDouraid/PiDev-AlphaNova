import { Component, OnInit } from '@angular/core';
import { InternshipOfferService } from '../../services/internship-offer.service';
import { InternshipOffer } from '../../models/internship-offer';

@Component({
  selector: 'app-internship-offer-list',
  templateUrl: './internship-offer-list.component.html',
  styleUrls: ['./internship-offer-list.component.css'] // Optional
})
export class InternshipOfferListComponent implements OnInit {
  internshipOffers: InternshipOffer[] = [];

  constructor(private internshipOfferService: InternshipOfferService) {}

  ngOnInit(): void {
    this.loadInternshipOffers();
  }

  loadInternshipOffers(): void {
    this.internshipOfferService.getAllInternshipOffers().subscribe(
      data => {
        this.internshipOffers = data;
      },
      error => {
        console.error('Error fetching internship offers:', error);
      }
    );
  }

  deleteInternshipOffer(id: number): void {
    this.internshipOfferService.deleteInternshipOffer(id).subscribe(
      () => {
        this.loadInternshipOffers(); // Refresh the list after deletion
        console.log('Internship offer deleted successfully');
      },
      error => {
        console.error('Error deleting internship offer:', error);
        alert('Failed to delete internship offer. Please try again or contact support.');
      }
    );
  }
}