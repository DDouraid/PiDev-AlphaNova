import { Component, OnInit } from '@angular/core';
import { ServeurService, Feedback } from '../Serveurs/serveur.service';
import { ChangeDetectorRef } from '@angular/core';
declare var bootstrap: any; // Pour accéder à l'API Bootstrap

@Component({
  selector: 'app-list-feedback',
  templateUrl: './list-feddback.component.html',
  styleUrls: ['./list-feddback.component.css']
})
export class ListFeedbackComponent implements OnInit {
  listFeedback: Feedback[] = [];
  newFeedback: Feedback = {
    id: 0,
    comment: '',
    note: 0
  };
  selectedFeedback: Feedback = {
    id: 0,
    comment: '',
    note: 0
  };
  addModalInstance: any;
  updateModalInstance: any;

  constructor(private serverService: ServeurService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadFeedback();
  }

  openModal(): void {
    const modal = document.getElementById('addFeedbackModal');
    if (modal) {
      this.addModalInstance = new bootstrap.Modal(modal);
      this.addModalInstance.show();
    }
  }

  closeModal(): void {
    if (this.addModalInstance) {
      this.addModalInstance.hide();
      // Ensure the modal and backdrop are fully removed with a delay
      setTimeout(() => {
        document.body.focus(); // Return focus to the body
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove(); // Remove the backdrop if it exists
          // Ensure body scroll is enabled
          document.body.style.overflow = 'auto';
          document.body.style.position = ''; // Reset any positioning
        }
        // Force Angular to detect changes to ensure the UI updates
        this.cdr.detectChanges(); // Assuming you’ve imported ChangeDetectorRef
      }, 300); // Increase delay to ensure Bootstrap animation completes (300ms is Bootstrap’s default animation duration)
    } else {
      console.error('Update Modal instance not found');
    }
  }

  openUpdateModal(): void {
    const modal = document.getElementById('updateFeedbackModal');
    if (modal) {
      this.updateModalInstance = new bootstrap.Modal(modal);
      this.updateModalInstance.show();
    }
  }

  closeUpdateModal(): void {
    if (this.updateModalInstance) {
      this.updateModalInstance.hide();
      // Ensure the modal and backdrop are fully removed with a delay
      setTimeout(() => {
        document.body.focus(); // Return focus to the body
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove(); // Remove the backdrop if it exists
          // Ensure body scroll is enabled
          document.body.style.overflow = 'auto';
          document.body.style.position = ''; // Reset any positioning
        }
        // Force Angular to detect changes to ensure the UI updates
        this.cdr.detectChanges(); // Assuming you’ve imported ChangeDetectorRef
      }, 300); // Increase delay to ensure Bootstrap animation completes (300ms is Bootstrap’s default animation duration)
    } else {
      console.error('Update Modal instance not found');
    }
  }

  selectFeedbackForUpdate(feedback: Feedback): void {
    this.selectedFeedback = { ...feedback }; // Create a copy to avoid mutating the original
    this.openUpdateModal();
  }

  deleteFeedback(id: number): void {
    if (confirm('Are you sure you want to delete this feedback?')) {
      this.serverService.deleteFeedback(id).subscribe(
        () => {
          console.log('Feedback deleted successfully');
          this.loadFeedback();
        },
        error => {
          console.error('Error deleting feedback:', error);
          alert('Failed to delete feedback. Please try again or contact support.');
        }
      );
    }
  }

  addFeedback(): void {
    if (!this.newFeedback.comment.trim() || this.newFeedback.note < 1 || this.newFeedback.note > 5) {
      alert('Please provide a valid comment and rating (1-5).');
      return;
    }

    this.serverService.createFeedback(this.newFeedback).subscribe(
      response => {
        console.log('Feedback added successfully:', response);
        if (this.addModalInstance) {
          this.addModalInstance.hide();
        }
        this.loadFeedback();
        this.resetForm();
      },
      error => {
        console.error('Error adding feedback:', error);
        let errorMessage = 'Failed to add feedback. Please try again or contact support.';
        if (error.status === 404) {
          errorMessage += ' (Endpoint not found)';
        } else if (error.status === 400) {
          errorMessage += ' (Invalid data)';
        }
        alert(errorMessage);
      }
    );
  }

  updateFeedback(): void {
    if (!this.selectedFeedback.comment.trim() || this.selectedFeedback.note < 1 || this.selectedFeedback.note > 5) {
      alert('Please provide a valid comment and rating (1-5).');
      return;
    }

    this.serverService.updateFeedback(this.selectedFeedback).subscribe(
      response => {
        console.log('Feedback updated successfully:', response);
        if (this.updateModalInstance) {
          this.updateModalInstance.hide();
        }
        this.loadFeedback();
        this.resetSelectedFeedback();
      },
      error => {
        console.error('Error updating feedback:', error);
        let errorMessage = 'Failed to update feedback. Please try again or contact support.';
        if (error.status === 404) {
          errorMessage += ' (Endpoint not found)';
        } else if (error.status === 400) {
          errorMessage += ' (Invalid data)';
        }
        alert(errorMessage);
      }
    );
  }

  resetForm(): void {
    this.newFeedback = {
      id: 0,
      comment: '',
      note: 0
    };
  }

  resetSelectedFeedback(): void {
    this.selectedFeedback = {
      id: 0,
      comment: '',
      note: 0
    };
  }

  loadFeedback(): void {
    this.serverService.getAllFeedback().subscribe(
      data => {
        console.log('Feedback data:', data);
        this.listFeedback = Array.isArray(data) ? data : data ? [data] : [];
      },
      error => {
        console.error('Error fetching feedback:', error);
        this.listFeedback = [];
      }
    );
  }


  
}