import { Component, OnInit } from '@angular/core';
import { InternshipOfferService } from '../../services/internship-offer.service';
import { InternshipOffer } from '../../models/internship-offer';
import { InternshipRequest } from '../../models/internship-request';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-internship-offer-list',
  templateUrl: './internship-offer-list.component.html',
  styleUrls: ['./internship-offer-list.component.css']
})
export class InternshipOfferListComponent implements OnInit {
  internshipOffers: InternshipOffer[] = [];
  internshipOffer: InternshipOffer = {} as InternshipOffer;
  selectedInternshipOffer: InternshipOffer = {} as InternshipOffer;
  isSubmittingOffer: boolean = false;
  requestsForOffer: InternshipRequest[] = [];
  downloadingCv: { [key: string]: boolean } = {};

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
        window.alert('Failed to load internship offers. Please try again or contact support.');
      }
    );
  }

  onSubmitOffer(form: NgForm): void {
    if (form.valid) {
      this.isSubmittingOffer = true;
      this.internshipOfferService.createInternshipOffer(this.internshipOffer).subscribe(
        () => {
          this.loadInternshipOffers();
          this.internshipOffer = {} as InternshipOffer;
          form.resetForm();
          window.alert('Internship offer created successfully!');
          this.isSubmittingOffer = false;
        },
        error => {
          console.error('Error creating internship offer:', error);
          window.alert('Failed to create internship offer. Please try again or contact support.');
          this.isSubmittingOffer = false;
        }
      );
    }
  }

  selectInternshipOffer(offer: InternshipOffer): void {
    this.selectedInternshipOffer = { ...offer };
  }

  updateInternshipOffer(): void {
    this.internshipOfferService.updateInternshipOffer(this.selectedInternshipOffer).subscribe(
      () => {
        this.loadInternshipOffers();
        window.alert('Internship offer updated successfully!');
      },
      error => {
        console.error('Error updating internship offer:', error);
        window.alert('Failed to update internship offer. Please try again or contact support.');
      }
    );
  }

  deleteInternshipOffer(id: number): void {
    this.internshipOfferService.deleteInternshipOffer(id).subscribe(
      () => {
        this.loadInternshipOffers();
        window.alert('Internship offer deleted successfully!');
      },
      error => {
        console.error('Error deleting internship offer:', error);
        window.alert('Failed to delete internship offer. Please try again or contact support.');
      }
    );
  }

  viewRequestsForOffer(offer: InternshipOffer): void {
    this.selectedInternshipOffer = offer;
    this.internshipOfferService.getRequestsForOffer(offer.id!).subscribe(
      (requests) => {
        this.requestsForOffer = requests;
        console.log('Fetched requests for offer ID ' + offer.id + ':', requests);
      },
      (error) => {
        console.error('Error fetching requests for offer ID ' + offer.id + ':', error);
        window.alert('Failed to load requests for this offer. Please try again.');
        this.requestsForOffer = [];
      }
    );
  }

  downloadCv(fileName: string | undefined): void {
    if (!fileName) {
      window.alert('No CV available to download.');
      return;
    }
    this.downloadingCv[fileName] = true;
    this.internshipOfferService.downloadCv(fileName).subscribe(
      blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.downloadingCv[fileName] = false;
      },
      error => {
        console.error('Error downloading CV:', error);
        window.alert('Failed to download CV. Please try again or contact support.');
        this.downloadingCv[fileName] = false;
      }
    );
  }
}