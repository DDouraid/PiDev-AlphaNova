import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServeurService } from '../Serveurs/serveur.service';
import { supervisor } from '../core/models/Supervisor';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-liste-supervisor',
  templateUrl: './list-supervisor.component.html',
  styleUrls: ['./list-supervisor.component.css']
})
export class ListSupervisorComponent implements OnInit {
  filterSupervisor: supervisor[] = []; //Liste filtrée des superviseurs (utilisée pour la recherche).
  supervisors: supervisor[] = [];
  newSupervisor: supervisor = { idSup: 0, name: '', email: '', speciality: '' }; //crud
  selectedSupervisor: supervisor | null = null;

  isEditing = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  emailError: string | null = null;
  nameError: string | null = null;
  specialityError: string | null = null;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;

  // Recherche stocke ce que l’utilisateur tape 
  searchTerm: string = '';

  // Propriétés pour la génération de PDF dynamique 
  pdfData: any = {
    title: '',
    subject: '',
    objective: '',
    studentName: '',
    academicLevel: ''
  };
  previewVisible: boolean = false;



  constructor(
    private supervisorService: ServeurService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


//au démarrage pour charger la liste des superviseurs.
  ngOnInit(): void {
    this.loadSupervisors();
  }

  private loadSupervisors(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.supervisorService.getAllSupervisor().subscribe({
      next: (data: supervisor[]) => {
        this.supervisors = data;
        this.filterSupervisor = [...this.supervisors];
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError(err, 'charger les superviseurs');
        this.isLoading = false; // S'assurer que isLoading est réinitialisé
      }
    });
  }

  // Pagination
  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredSupervisors.length / this.pageSize);
  }

  //Getter qui retourne une sous-liste des superviseurs

  get paginatedSupervisors(): supervisor[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredSupervisors.slice(startIndex, endIndex);
  }

  

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  //[1, 2, 3]
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Recherche Si searchTerm est vide, retourne la liste complète
  get filteredSupervisors(): supervisor[] {
    if (!this.searchTerm.trim()) {
      return this.supervisors;
    }
    return this.filterSupervisor.filter(supervisor =>
      supervisor.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  //retourne au page 1 quand recherche change

  onSearchChange(): void {
    this.currentPage = 1;
  }

//Ajout d’un Superviseur

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
        this.filterSupervisor = [...this.supervisors]; // Mettre à jour la liste filtrée
        this.calculateTotalPages();
        this.successMessage = 'Superviseur ajouté avec succès !';
        this.resetForm();
        this.closeModal('addSupervisorModal');
        this.isLoading = false; // Réinitialiser isLoading
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: (err) => {
        this.handleError(err, 'ajouter');
        this.isLoading = false; // Réinitialiser isLoading en cas d'erreur
      }
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
        this.filterSupervisor = [...this.supervisors]; // Mettre à jour la liste filtrée
        this.calculateTotalPages();
        this.successMessage = 'Superviseur supprimé avec succès !';
        this.isLoading = false; // Réinitialiser isLoading
        setTimeout(() => (this.successMessage = null), 3000);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
      },
      error: (err) => {
        this.handleError(err, 'supprimer');
        this.isLoading = false; // Réinitialiser isLoading en cas d'erreur
      }
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
          this.filterSupervisor = [...this.supervisors]; // Mettre à jour la liste filtrée
        }
        this.successMessage = 'Superviseur mis à jour avec succès !';
        this.resetForm();
        this.closeModal('updateSupervisorModal');
        this.isLoading = false; // Réinitialiser isLoading
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: (err) => {
        this.handleError(err, 'modifier');
        this.isLoading = false; // Réinitialiser isLoading en cas d'erreur
      }
    });
  }


  //controle de saisie 
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
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
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
    this.isLoading = false; // S'assurer que isLoading est réinitialisé
  }


  //Préparation des Formulaires 
  //Initialise un nouveau superviseur pour l'ajout.
  prepareNewSupervisor(): void {
    this.isEditing = false;
    this.newSupervisor = { idSup: 0, name: '', email: '', speciality: '' };
    this.errorMessage = null;
    this.emailError = null;
    this.nameError = null;
    this.specialityError = null;
  }
//Prépare un superviseur existant pour la modification et valide les champs.
  prepareEditSupervisor(supervisor: supervisor): void {
    this.isEditing = true;
    this.newSupervisor = { ...supervisor };
    this.selectedSupervisor = supervisor;
    this.errorMessage = null;
    this.emailError = null;
    this.nameError = null;
    this.specialityError = null;
    this.validateEmail();
    this.validateField('name');
    this.validateField('speciality');
  }

  //Réinitialise le formulaire.

  resetForm(): void {
    this.newSupervisor = { idSup: 0, name: '', email: '', speciality: '' };
    this.selectedSupervisor = null;
    this.isEditing = false;
    this.errorMessage = null;
    this.emailError = null;
    this.nameError = null;
    this.specialityError = null;
  }

  // Méthodes pour la génération de PDF
  prepareGeneratePdf(): void {
    this.pdfData = {
      title: '',
      subject: '',
      objective: '',
      studentName: '',
      academicLevel: ''
    };
    this.previewVisible = false;
    this.errorMessage = null;
  }

  //Réinitialise les données du PDF.

  resetPdfForm(): void {
    this.pdfData = {
      title: '',
      subject: '',
      objective: '',
      studentName: '',
      academicLevel: ''
    };
    this.previewVisible = false;
    this.errorMessage = null;
  }

  onPreview(): void {
    this.previewVisible = true;
  }



  generatePdf(): void {
    try {
      const doc = new jsPDF();
      let yPosition = 20; // Position initiale en Y

      // Fonction pour ajouter du texte et gérer le saut de ligne
      const addText = (text: string, x: number, y: number, bold: boolean = false) => {
        if (bold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        const splitText = doc.splitTextToSize(text, 180); // Largeur maximale de 180 pour éviter le débordement
        doc.text(splitText, x, y);
        return y + (splitText.length * 7); // Ajuster la position Y en fonction du nombre de lignes
      };

      // Ajouter le contenu au PDF
      yPosition = addText('À l’aimable attention de la Direction Générale', 10, yPosition);
      yPosition += 7; // Saut de ligne

      yPosition = addText(`OBJET: ${this.pdfData.title}`, 10, yPosition, true);
      yPosition += 7;

      yPosition = addText('Madame, Monsieur,', 10, yPosition);
      yPosition += 7;

      yPosition = addText(
        'L’École Supérieure Privée d’Ingénierie et de Technologies, ESPRIT SA, est un établissement d’enseignement supérieur privé ayant pour objet principal, la formation d’ingénieurs dans les domaines des technologies de l’information et de la communication.',
        10,
        yPosition
      );
      yPosition += 7;

      yPosition = addText(
        'Notre objectif consiste à former des ingénieurs opérationnels au terme de leur formation.',
        10,
        yPosition
      );
      yPosition += 7;

      yPosition = addText(
        'Dès lors, nous encourageons nos élèves à mettre en pratique le savoir et les compétences qu’ils ont acquis au cours de leur cursus universitaire.',
        10,
        yPosition
      );
      yPosition += 7;

      yPosition = addText(
        'C’est également dans le but de les amener à s’intégrer dans l’environnement de l’entreprise que nous vous demandons de bien vouloir accepter :',
        10,
        yPosition
      );
      yPosition += 7;

      yPosition = addText(`L’étudiant(e) : ${this.pdfData.studentName}`, 10, yPosition, true);
      yPosition += 7;

      yPosition = addText(`Inscrit(e) en : ${this.pdfData.academicLevel}`, 10, yPosition, true);
      yPosition += 7;

      yPosition = addText(
        'Pour effectuer un stage obligatoire, au sein de votre honorable société.',
        10,
        yPosition
      );
      yPosition += 7;

      yPosition = addText(
        'Nous restons à votre entière disposition pour tout renseignement complémentaire.',
        10,
        yPosition
      );
      yPosition += 7;

      yPosition = addText(
        'En vous remerciant pour votre précieux soutien, nous vous prions d’agréer, Madame, Monsieur, l’expression de nos salutations distinguées.',
        10,
        yPosition
      );
      yPosition += 14; // Saut de ligne plus grand avant la signature

      yPosition = addText('Majdi GHARBI', 10, yPosition);
      yPosition = addText('Département des Stages', 10, yPosition);

      // Sauvegarder et télécharger le PDF
      doc.save('document.pdf');

      // Afficher un message de succès
      this.successMessage = 'PDF généré avec succès !';
      this.resetPdfForm();
      this.closeModal('generatePdfModal');
      this.isLoading = false; // Réinitialiser isLoading
      setTimeout(() => (this.successMessage = null), 3000);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      this.errorMessage = 'Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.';
      this.isLoading = false; // Réinitialiser isLoading en cas d'erreur
    }
  }
}