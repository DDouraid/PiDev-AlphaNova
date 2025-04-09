import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServeurService } from '../Serveurs/serveur.service';
import { Event as EventModel } from '../core/models/Event';

@Component({
  selector: 'app-liste-event',
  templateUrl: './liste-event.component.html',
  styleUrls: ['./liste-event.component.css']
})
export class ListeEventComponent implements OnInit {
  
  @ViewChild('closeModalButton') closeModalButton!: ElementRef; // Référence pour fermer le modal

  ListEvent: EventModel[] = [];
  newEvent: EventModel = { idEvent: 0, title: '', description: '', date: new Date(), location: '' };
  isEditing: boolean = false;
  showSuccessAlert: boolean = false;
  successMessage: string = '';

  constructor(
    private ms: ServeurService,
    private rt: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.ms.getAllEvenements().subscribe({
      next: (data: EventModel[]) => {
        this.ListEvent = data;
      },
      error: (err) => console.error('Erreur lors du chargement des événements:', err)
    });
  }

  addEvent(): void {
    const eventToAdd: EventModel = { ...this.newEvent };

    if (typeof eventToAdd.date === 'string') {
      eventToAdd.date = new Date(eventToAdd.date);
    }

    this.ms.addEvenement(eventToAdd).subscribe({
      next: (addedEvent: EventModel) => {
        this.ListEvent.push(addedEvent);
        this.showAlert('Événement ajouté avec succès !');
        this.closeAndResetForm(); // Fermer et nettoyer le formulaire
      },
      error: (err) => console.error('Erreur lors de l\'ajout de l\'événement:', err)
    });
  }

  updateEvent(): void {
    this.ms.updateEvent(this.newEvent).subscribe({
      next: () => {
        this.showAlert('Événement modifié avec succès !');
        this.loadEvents(); // Recharger la liste après modification
        this.closeAndResetForm(); // Fermer et nettoyer le formulaire
        this.closeModal('eventModal');
      },
      error: (error) => {
        console.error('Erreur lors de la modification de l\'événement:', error);
      }
    });
  }

  deleteEvent(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    this.ms.deleteEvenement(id).subscribe({
      next: () => {
        this.ListEvent = this.ListEvent.filter(event => event.idEvent !== id);
        this.showAlert('Événement supprimé avec succès !');
      },
      error: (err) => console.error('Erreur lors de la suppression de l\'événement:', err)
    });
  }

  resetSelectedEvent(): void {
    this.newEvent = { idEvent: 0, title: '', description: '', date: new Date(), location: '' };
  }

  prepareNewEvent(): void {
    this.isEditing = false;
    this.resetSelectedEvent();
  }

  prepareEditEvent(event: EventModel): void {
    this.isEditing = true;
    this.newEvent = { ...event };
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

  showAlert(message: string): void {
    this.successMessage = message;
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 3000);
  }

  closeAlert(): void {
    this.showSuccessAlert = false;
  }

  closeAndResetForm(): void {
    this.resetSelectedEvent(); // Réinitialiser le formulaire
    this.closeModalButton.nativeElement.click(); // Fermer le modal
  }
}
