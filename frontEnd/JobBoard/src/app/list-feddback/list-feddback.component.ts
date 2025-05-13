import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ServeurService } from '../Serveurs/serveur.service';
import { Feedback } from '../core/models/Feedback';
import { ChangeDetectorRef } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-list-feedback',
  templateUrl: './list-feddback.component.html', // Corrected "feddback" to "feedback"
  styleUrls: ['./list-feddback.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ListFeedbackComponent implements OnInit {
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  listFeedback: Feedback[] = [];
  filteredFeedback: Feedback[] = [];
  newFeedback: Feedback = {
    id: 0,
    comment: '',
    note: 0,
    userId: 0
  };
  isEditMode: boolean = false;
  searchTerm: string = '';
  isLoading: boolean = false;
  showSuccessAlert: boolean = false;
  successMessage: string = '';
  errorMessage: string | null = null;
  currentUserId: number | null = null; // Store current user's ID

  private inappropriateWords = ['putain', 'merde', 'con', 'salope'];

  currentPage: number = 1;
  itemsPerPage: number = 5;
  paginatedFeedback: Feedback[] | undefined;

  constructor(
    private serverService: ServeurService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadFeedback();
  }

  loadCurrentUser(): void {
    this.serverService.getUserDetails(0).subscribe({
      next: (user) => {
        this.currentUserId = user.id;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        this.showAlert('Impossible de récupérer les détails de l\'utilisateur.');
        this.currentUserId = null;
      }
    });
  }

  loadFeedback(): void {
    this.isLoading = true;
    this.serverService.getAllFeedback().subscribe({
      next: (data: Feedback[]) => {
        this.listFeedback = Array.isArray(data) ? data : data ? [data] : [];
        this.filteredFeedback = [...this.listFeedback];
        this.applyFiltersAndPagination();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Erreur lors de la récupération des feedbacks.');
        this.listFeedback = [];
        this.filteredFeedback = [];
        this.applyFiltersAndPagination();
      }
    });
  }

  canEditFeedback(feedback: Feedback): boolean {
    return this.currentUserId !== null && feedback.userId === this.currentUserId;
  }

  prepareNewFeedback(): void {
    this.isEditMode = false;
    this.newFeedback = { id: 0, comment: '', note: 0, userId: 0 };
  }

  prepareEditFeedback(feedback: Feedback): void {
    if (!this.canEditFeedback(feedback)) {
      this.showAlert('Vous n\'êtes pas autorisé à modifier ce feedback.');
      return;
    }
    this.isEditMode = true;
    this.newFeedback = { ...feedback };
  }

  saveFeedback(): void {
    if (this.checkForInappropriateWords(this.newFeedback.comment)) {
      this.showAlert('Le commentaire contient des mots inappropriés.');
      return;
    }

    if (!this.isFeedbackValid(this.newFeedback)) {
      this.showAlert('Veuillez fournir un commentaire valide et une note (1-5).');
      return;
    }

    if (this.isEditMode && !this.canEditFeedback(this.newFeedback)) {
      this.showAlert('Vous n\'êtes pas autorisé à modifier ce feedback.');
      return;
    }

    this.isLoading = true;
    const feedbackToSave = { ...this.newFeedback };

    const saveAction = () => {
      const action = this.isEditMode
        ? this.serverService.updateFeedback(feedbackToSave)
        : this.serverService.createFeedback(feedbackToSave);

      action.subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showAlert(`Feedback ${this.isEditMode ? 'mis à jour' : 'ajouté'} avec succès.`);
          this.closeModal('feedbackModal');
          this.loadFeedback();
          this.prepareNewFeedback();

          // Send email after adding new feedback
          if (!this.isEditMode) {
            const to = 'eya.bouzaiene@sesame.com.tn';
            const subject = 'Nouveau Feedback Ajouté';
            const body = 'Votre feedback est bien ajouté !\n\nDétails du feedback :\n' +
                         `Commentaire : ${this.newFeedback.comment}\n` +
                         `Note : ${this.newFeedback.note}/5\n` +
                         `Utilisateur ID : ${feedbackToSave.userId}`;
            this.serverService.sendEmail(to, subject, body).subscribe({
              next: () => {
                console.log('Email envoyé avec succès.');
              },
              error: (err) => {
                this.showAlert('Erreur lors de l\'envoi de l\'email.');
              }
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert(`Échec de ${this.isEditMode ? 'la mise à jour' : 'l\'ajout'} du feedback.`);
        }
      });
    };

    if (!this.isEditMode) {
      // Fetch user details for new feedback
      this.serverService.getUserDetails(0).subscribe({
        next: (user) => {
          feedbackToSave.userId = user.id;
          saveAction();
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Erreur lors de la récupération des détails de l\'utilisateur.');
        }
      });
    } else {
      saveAction();
    }
  }

  deleteFeedback(id: number): void {
    const feedback = this.listFeedback.find(f => f.id === id);
    if (feedback && !this.canEditFeedback(feedback)) {
      this.showAlert('Vous n\'êtes pas autorisé à supprimer ce feedback.');
      return;
    }

    if (!confirm('Voulez-vous vraiment supprimer ce feedback ?')) return;

    this.isLoading = true;
    this.serverService.deleteFeedback(id).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAlert('Feedback supprimé avec succès.');
        this.loadFeedback();
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Échec de la suppression du feedback.');
      }
    });
  }

  isFeedbackValid(feedback: Feedback): boolean {
    return !!feedback.comment.trim() && feedback.note >= 1 && feedback.note <= 5;
  }

  checkForInappropriateWords(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/);
    return words.some(word => this.inappropriateWords.includes(word));
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  applyFiltersAndPagination(): void {
    let filtered = [...this.listFeedback];

    if (this.searchTerm.trim()) {
      filtered = filtered.filter(feedback =>
        feedback.comment.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredFeedback = filtered;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedFeedback = filtered.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndPagination();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFeedback.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getNoteLabel(note: number): string {
    switch (note) {
      case 1: return 'Pauvre';
      case 2: return 'Passable';
      case 3: return 'Bon';
      case 4: return 'Très Bon';
      case 5: return 'Excellent';
      default: return 'Non noté';
    }
  }

  showAlert(message: string): void {
    this.successMessage = message;
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 3000);
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
}
