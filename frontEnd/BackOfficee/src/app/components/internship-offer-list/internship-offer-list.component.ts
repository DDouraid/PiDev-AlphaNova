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
  internshipOffer: InternshipOffer;
  selectedInternshipOffer: InternshipOffer = {
    title: '',
    description: '',
    company: '',
    location: '',
    datePosted: undefined,
    durationInMonths: null
  };
  offerIdToDelete: number | null = null;
  isSubmittingOffer: boolean = false;
  isLoading: boolean = false;
  requestsForOffer: InternshipRequest[] = [];
  downloadingCv: { [key: string]: boolean } = {};

  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';

  constructor(private internshipOfferService: InternshipOfferService) {
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    this.internshipOffer = {
      title: '',
      description: '',
      company: '',
      location: '',
      datePosted: todayFormatted,
      durationInMonths: null
    };
  }

  ngOnInit(): void {
    this.loadInternshipOffers();
  }

  loadInternshipOffers(): void {
    this.isLoading = true;
    this.internshipOfferService.getAllInternshipOffers().subscribe({
      next: (data) => {
        this.internshipOffers = data.map(offer => ({
          ...offer,
          datePosted: offer.datePosted ? new Date(offer.datePosted).toISOString().split('T')[0] : undefined,
          durationInMonths: offer.durationInMonths !== undefined ? offer.durationInMonths : null
        }));
      },
      error: (error) => {
        console.error('Error fetching internship offers:', error);
        this.showCustomAlert('danger', 'Failed to load internship offers. Please try again or contact support.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSubmitOffer(form: NgForm): void {
    if (form.valid) {
      this.isSubmittingOffer = true;
      const offerToSubmit: InternshipOffer = {
        ...this.internshipOffer,
        datePosted: this.internshipOffer.datePosted ? new Date(this.internshipOffer.datePosted).toISOString().split('T')[0] : undefined
      };
      console.log('Submitting offer:', offerToSubmit);
      this.internshipOfferService.createInternshipOffer(offerToSubmit).subscribe({
        next: () => {
          this.loadInternshipOffers();
          const today = new Date();
          const todayFormatted = today.toISOString().split('T')[0];
          this.internshipOffer = {
            title: '',
            description: '',
            company: '',
            location: '',
            datePosted: todayFormatted,
            durationInMonths: null
          };
          form.resetForm(this.internshipOffer);
          this.showCustomAlert('success', 'Internship offer created successfully!');
        },
        error: (error) => {
          console.error('Error creating internship offer:', error);
          this.showCustomAlert('danger', 'Failed to create internship offer. Please try again or contact support.');
        },
        complete: () => {
          this.isSubmittingOffer = false;
        }
      });
    } else {
      console.log('Form is invalid:', form.value);
      this.showCustomAlert('warning', 'Please fill in all required fields correctly.');
    }
  }

  selectInternshipOffer(offer: InternshipOffer): void {
    this.selectedInternshipOffer = {
      ...offer,
      datePosted: offer.datePosted ? new Date(offer.datePosted).toISOString().split('T')[0] : undefined
    };
  }

  selectOfferForDeletion(id: number | undefined): void {
    if (id === undefined) {
      this.showCustomAlert('warning', 'Invalid offer ID.');
      return;
    }
    this.offerIdToDelete = id;
  }

  confirmDeleteInternshipOffer(): void {
    if (this.offerIdToDelete === null) {
      this.showCustomAlert('warning', 'No internship offer selected for deletion.');
      return;
    }

    this.internshipOfferService.deleteInternshipOffer(this.offerIdToDelete).subscribe({
      next: () => {
        this.loadInternshipOffers();
        this.showCustomAlert('success', 'Internship offer deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting internship offer:', error);
        this.showCustomAlert('danger', 'Failed to delete internship offer. Please try again or contact support.');
      },
      complete: () => {
        this.offerIdToDelete = null;
      }
    });
  }

  updateInternshipOffer(): void {
    if (!this.selectedInternshipOffer.id) {
      this.showCustomAlert('warning', 'No internship offer selected for update.');
      return;
    }

    const offerToUpdate: InternshipOffer = {
      ...this.selectedInternshipOffer,
      datePosted: this.selectedInternshipOffer.datePosted ? new Date(this.selectedInternshipOffer.datePosted).toISOString().split('T')[0] : undefined
    };
    console.log('Updating offer:', offerToUpdate);
    this.internshipOfferService.updateInternshipOffer(offerToUpdate).subscribe({
      next: () => {
        this.loadInternshipOffers();
        this.showCustomAlert('success', 'Internship offer updated successfully!');
      },
      error: (error) => {
        console.error('Error updating internship offer:', error);
        this.showCustomAlert('danger', 'Failed to update internship offer. Please try again or contact support.');
      }
    });
  }

  viewRequestsForOffer(offer: InternshipOffer): void {
    if (!offer.id) {
      this.showCustomAlert('warning', 'Invalid offer ID.');
      return;
    }
    this.selectedInternshipOffer = offer;
    this.internshipOfferService.getRequestsForOffer(offer.id).subscribe({
      next: (requests) => {
        this.requestsForOffer = requests;
        console.log('Fetched requests for offer ID ' + offer.id + ':', requests);
      },
      error: (error) => {
        console.error('Error fetching requests for offer ID ' + offer.id + ':', error);
        this.showCustomAlert('danger', 'Failed to load requests for this offer. Please try again.');
        this.requestsForOffer = [];
      }
    });
  }

  downloadCv(fileName: string | undefined): void {
    if (!fileName) {
      this.showCustomAlert('warning', 'No CV available to download.');
      return;
    }
    this.downloadingCv[fileName] = true;
    this.internshipOfferService.downloadCv(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.split('_').slice(1).join('_');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading CV:', error);
        this.showCustomAlert('danger', 'Failed to download CV. Please try again or contact support.');
      },
      complete: () => {
        this.downloadingCv[fileName] = false;
      }
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