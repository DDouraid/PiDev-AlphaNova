import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServeurService } from '../Serveurs/serveur.service';
import { Feedback } from '../core/models/Feedback';
import { ChangeDetectorRef } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-user-feedback',
  templateUrl: './user-feedback.component.html',
  styleUrls: ['./user-feedback.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UserFeedbackComponent implements OnInit {
  userId: number;
  listFeedback: Feedback[] = [];
  filteredFeedback: Feedback[] = [];
  paginatedFeedback: Feedback[] = [];
  newFeedback: Feedback = {
    id: 0,
    comment: '',
    note: 0,
    userId: 0
  };
  isEditMode: boolean = false;
  addModalInstance: any;
  updateModalInstance: any;
  searchTerm: string = '';
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  private inappropriateWords = ['putain', 'merde', 'con', 'salope'];

  currentPage: number = 1;
  itemsPerPage: number = 5;

  @ViewChild('addFeedbackModal', { static: false }) addModal!: ElementRef;
  @ViewChild('updateFeedbackModal', { static: false }) updateModal!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private serverService: ServeurService,
    private cdr: ChangeDetectorRef
  ) {
    this.userId = +this.route.snapshot.paramMap.get('userId')!;
    this.newFeedback.userId = this.userId;
  }

  ngOnInit(): void {
    this.loadFeedback();
  }

  prepareNewFeedback(): void {
    this.isEditMode = false;
    this.newFeedback = { id: 0, comment: '', note: 0, userId: this.userId };
  }

  prepareEditFeedback(feedback: Feedback): void {
    this.isEditMode = true;
    this.newFeedback = { ...feedback };
  }

  openModal(modalId: string, setInstance: (instance: any) => void): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      setInstance(modalInstance);
      modalInstance.show();
    }
  }

  closeModal(modalInstance: any): void {
    if (modalInstance) {
      modalInstance.hide();
      setTimeout(() => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        this.cdr.detectChanges();
      }, 300);
    }
  }

  isFeedbackValid(feedback: Feedback): boolean {
    return !!feedback.comment.trim() && feedback.note >= 1 && feedback.note <= 5;
  }

  checkForInappropriateWords(feedback: string): boolean {
    const words = feedback.toLowerCase().split(/\s+/);
    return words.some(word => this.inappropriateWords.includes(word));
  }

  saveFeedback(): void {
    if (this.checkForInappropriateWords(this.newFeedback.comment)) {
      this.errorMessage = 'Le commentaire contient des mots inappropriés.';
      setTimeout(() => this.errorMessage = null, 2000);
      return;
    }

    if (!this.isFeedbackValid(this.newFeedback)) {
      this.errorMessage = 'Veuillez fournir un commentaire valide et une note (1-5).';
      setTimeout(() => this.errorMessage = null, 2000);
      return;
    }

    this.isLoading = true;
    const action = this.isEditMode
      ? this.serverService.updateFeedback(this.newFeedback)
      : this.serverService.createFeedback(this.newFeedback);

    action.subscribe(
      response => {
        this.isLoading = false;
        this.successMessage = `Feedback ${this.isEditMode ? 'mis à jour' : 'ajouté'} avec succès.`;
        this.closeModal(this.isEditMode ? this.updateModalInstance : this.addModalInstance);
        this.loadFeedback();

        // Envoi de l'email après l'ajout (uniquement pour un nouveau feedback)
        if (!this.isEditMode) {
          const to = 'eya.bouzaiene@sesame.com.tn';
          const subject = 'Nouveau Feedback Ajouté';
          const body = 'Votre feedback est bien ajouté !\n\nDétails du feedback :\n' +
                       `Commentaire : ${this.newFeedback.comment}\n` +
                       `Note : ${this.newFeedback.note}/5\n` +
                       `Utilisateur ID : ${this.userId}`;
          this.serverService.sendEmail(to, subject, body).subscribe({
            next: (emailResponse) => {
              console.log('Email envoyé : ', emailResponse);
            },
            error: (err) => {
              this.errorMessage = 'Erreur lors de l\'envoi de l\'email : ' + err.message;
              setTimeout(() => this.errorMessage = null, 2000);
            }
          });
        }

        this.newFeedback = { id: 0, comment: '', note: 0, userId: this.userId };
        setTimeout(() => this.successMessage = null, 3000);
      },
      error => {
        this.isLoading = false;
        this.errorMessage = `Échec de ${this.isEditMode ? 'la mise à jour' : 'l\'ajout'} du feedback. Veuillez réessayer ou contacter le support.`;
        setTimeout(() => this.errorMessage = null, 2000);
      }
    );
  }

  deleteFeedback(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce feedback ?')) {
      this.isLoading = true;
      this.serverService.deleteFeedback(id).subscribe(
        () => {
          this.isLoading = false;
          this.successMessage = 'Feedback supprimé avec succès.';
          this.loadFeedback();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error => {
          this.isLoading = false;
          this.errorMessage = 'Échec de la suppression du feedback. Veuillez réessayer ou contacter le support.';
          setTimeout(() => this.errorMessage = null, 2000);
        }
      );
    }
  }

  loadFeedback(): void {
    this.isLoading = true;
    this.serverService.getFeedbackByUser(this.userId).subscribe(
      data => {
        this.listFeedback = Array.isArray(data) ? data : data ? [data] : [];
        this.filteredFeedback = [...this.listFeedback];
        this.applyFiltersAndPagination();
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la récupération des feedbacks. Veuillez réessayer.';
        this.listFeedback = [];
        this.filteredFeedback = [];
        this.paginatedFeedback = [];
        setTimeout(() => this.errorMessage = null, 2000);
      }
    );
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
    const total = this.totalPages;
    for (let i = 1; i <= total; i++) {
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
}