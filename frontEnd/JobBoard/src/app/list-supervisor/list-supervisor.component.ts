import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServeurService } from '../Serveurs/serveur.service';
import { supervisor } from '../core/models/Supervisor';

@Component({
  selector: 'app-liste-supervisor',
  templateUrl: './list-supervisor.component.html',
  styleUrls: ['./list-supervisor.component.css']
})
export class ListSupervisorComponent implements OnInit {
  supervisors: supervisor[] = [];
  newSupervisor: supervisor = { idSup: 0, name: '', email: '', speciality: '' };
  selectedSupervisor: supervisor | null = null;

  isEditing = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  emailError: string | null = null;
  nameError: string | null = null;
  specialityError: string | null = null;

  constructor(
    private supervisorService: ServeurService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadSupervisors();
  }

  private loadSupervisors(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.supervisorService.getAllSupervisor().subscribe({
      next: (data: supervisor[]) => {
        this.supervisors = data;
        this.isLoading = false;
      },
      error: (err) => this.handleError(err, 'charger les superviseurs')
    });
  }

  saveSupervisor(): void {
    if (!this.isValidSupervisor(this.newSupervisor)) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs requis.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.supervisorService.addSupervisor(this.newSupervisor).subscribe({
      next: (addedSupervisor: supervisor) => {
        this.supervisors.push(addedSupervisor);
        this.successMessage = 'Superviseur ajouté avec succès !';
        this.resetForm();
        this.closeModal('addSupervisorModal');
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: (err) => this.handleError(err, 'ajouter')
    });
  }

  deleteSupervisor(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce superviseur ?')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.supervisorService.deleteSupervisor(id).subscribe({
      next: () => {
        this.supervisors = this.supervisors.filter(sup => sup.idSup !== id);
        this.successMessage = 'Superviseur supprimé avec succès !';
        setTimeout(() => (this.successMessage = null), 3000);
        this.isLoading = false;
      },
      error: (err) => this.handleError(err, 'supprimer')
    });
  }

  updateSupervisor(): void {
    if (!this.newSupervisor || !this.isValidSupervisor(this.newSupervisor)) {
      this.errorMessage = 'Veuillez fournir des détails valides pour le superviseur.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.supervisorService.updateSupervisor(this.newSupervisor).subscribe({
      next: (updatedSupervisor) => {
        const index = this.supervisors.findIndex(sup => sup.idSup === updatedSupervisor.idSup);
        if (index !== -1) {
          this.supervisors[index] = updatedSupervisor;
        }
        this.successMessage = 'Superviseur mis à jour avec succès !';
        this.resetForm();
        this.closeModal('updateSupervisorModal');
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: (err) => this.handleError(err, 'modifier')
    });
  }

  private isValidSupervisor(supervisor: supervisor): boolean {
    return !!(
      supervisor.name.trim() &&
      supervisor.name.length >= 3 &&
      supervisor.email.trim() &&
      this.isValidEmail(supervisor.email) &&
      supervisor.speciality.trim() &&
      supervisor.speciality.length >= 3
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateEmail(): void {
    const email = this.newSupervisor.email;
    if (!email) {
      this.emailError = 'L\'email est obligatoire.';
    } else if (!this.isValidEmail(email)) {
      this.emailError = 'Adresse email invalide.';
    } else {
      this.emailError = null;
    }
  }

  validateField(field: string): void {
    if (field === 'name') {
      const name = this.newSupervisor.name;
      if (!name) {
        this.nameError = 'Le nom est obligatoire.';
      } else if (name.length < 3) {
        this.nameError = 'Le nom doit contenir au moins 3 caractères.';
      } else {
        this.nameError = null;
      }
    } else if (field === 'speciality') {
      const speciality = this.newSupervisor.speciality;
      if (!speciality) {
        this.specialityError = 'La spécialité est obligatoire.';
      } else if (speciality.length < 3) {
        this.specialityError = 'La spécialité doit contenir au moins 3 caractères.';
      } else {
        this.specialityError = null;
      }
    }
  }

  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      (document.querySelector('.modal-backdrop') as HTMLElement)?.remove();
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }

  private handleError(err: any, operation: string): void {
    this.errorMessage = `Échec de ${operation}. Veuillez réessayer.`;
    if (err.status === 404) {
      this.errorMessage += ' (Superviseur non trouvé)';
    } else if (err.status === 400) {
      this.errorMessage += ' (Données invalides)';
    }
    console.error(`Erreur lors de ${operation}:`, err);
    this.isLoading = false;
  }

  prepareNewSupervisor(): void {
    this.isEditing = false;
    this.newSupervisor = { idSup: 0, name: '', email: '', speciality: '' };
    this.errorMessage = null;
    this.emailError = null;
    this.nameError = null;
    this.specialityError = null;
  }

  prepareEditSupervisor(supervisor: supervisor): void {
    this.isEditing = true;
    this.newSupervisor = { ...supervisor };
    this.selectedSupervisor = supervisor;
    this.errorMessage = null;
    this.emailError = null;
    this.nameError = null;
    this.specialityError = null;
    // Valider immédiatement les champs lors de l'édition
    this.validateEmail();
    this.validateField('name');
    this.validateField('speciality');
  }

  resetForm(): void {
    this.newSupervisor = { idSup: 0, name: '', email: '', speciality: '' };
    this.selectedSupervisor = null;
    this.isEditing = false;
    this.errorMessage = null;
    this.emailError = null;
    this.nameError = null;
    this.specialityError = null;
  }
}