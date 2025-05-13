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

  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  filterevent: EventModel[] = [];
  ListEvent: EventModel[] = [];
  newEvent: EventModel = {
    idEvent: 0, title: '', description: '', date: new Date(), location: '',
    userId: 0
  };
  isEditing: boolean = false;
  showSuccessAlert: boolean = false;
  successMessage: string = '';

  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  searchDate: string = '';

  // Statistiques basées sur les dates
  eventDateStats = { passed: 0, current: 0, upcoming: 0, total: 0 };

  // Statistiques basées sur le statut (ajouté pour correspondre au HTML)
  eventStatusStats = { current: 0, upcoming: 0, passed: 0 };

  constructor(
    private ms: ServeurService,
    private rt: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadEventDateStats();
  }

  loadEvents(): void {
    this.ms.getAllEvenements().subscribe({
      next: (data: EventModel[]) => {
        this.ListEvent = data;
        this.filterevent = [...this.ListEvent];
        this.calculateTotalPages();
        this.updateEventStatusStats(); // Calcul des statistiques par statut
      },
      error: (err) => console.error('Erreur lors du chargement des événements:', err)
    });
  }

  loadEventDateStats(): void {
    this.ms.getEventDateStats().subscribe({
      next: (data) => {
        this.eventDateStats = data;
      },
      error: (err) => {
        console.error('Erreur stats date:', err);
        this.eventDateStats = { passed: 0, current: 0, upcoming: 0, total: 0 };
      }
    });
  }

  // Nouvelle méthode pour calculer les statistiques par statut localement
  updateEventStatusStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliser à minuit

    this.eventStatusStats = {
      current: this.ListEvent.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === today.toDateString();
      }).length,
      upcoming: this.ListEvent.filter(event => new Date(event.date) > today).length,
      passed: this.ListEvent.filter(event => new Date(event.date) < today).length
    };
  }

  addEvent(): void {
    const eventToAdd: EventModel = { ...this.newEvent };

    if (typeof eventToAdd.date === 'string') {
      eventToAdd.date = new Date(eventToAdd.date);
    }

    this.ms.addEvenement(eventToAdd).subscribe({
      next: (addedEvent: EventModel) => {
        this.ListEvent.push(addedEvent);
        this.filterevent = [...this.ListEvent];
        this.calculateTotalPages();
        this.updateEventStatusStats(); // Mise à jour après ajout
        this.showAlert('Événement ajouté avec succès !');
        this.closeAndResetForm();
        this.closeModal('eventModal');
        this.loadEventDateStats();
      },
      error: (err) => console.error('Erreur lors de l\'ajout de l\'événement:', err)
    });
  }

  updateEvent(): void {
    const eventToUpdate: EventModel = { ...this.newEvent };

    if (typeof eventToUpdate.date === 'string') {
      eventToUpdate.date = new Date(eventToUpdate.date);
    }

    this.ms.updateEvent(eventToUpdate).subscribe({
      next: (updatedEvent: EventModel) => {
        const index = this.ListEvent.findIndex(event => event.idEvent === this.newEvent.idEvent);
        if (index !== -1) {
          this.ListEvent[index] = { ...eventToUpdate };
          this.filterevent = [...this.ListEvent];
        }
        this.updateEventStatusStats(); // Mise à jour après modification
        this.showAlert('Événement modifié avec succès !');
        this.closeAndResetForm();
        this.closeModal('eventModal');
        this.loadEventDateStats();
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
        this.filterevent = [...this.ListEvent];
        this.calculateTotalPages();
        this.updateEventStatusStats(); // Mise à jour après suppression
        this.showAlert('Événement supprimé avec succès !');
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
        this.loadEventDateStats();
      },
      error: (err) => console.error('Erreur lors de la suppression de l\'événement:', err)
    });
  }

  resetSelectedEvent(): void {
    this.newEvent = { idEvent: 0, title: '', description: '', date: new Date(), location: '', userId: 0 };
  }

  prepareNewEvent(): void {
    this.isEditing = false;
    this.resetSelectedEvent();
  }

  prepareEditEvent(event: EventModel): void {
    this.isEditing = true;
    this.newEvent = { ...event };
    if (this.newEvent.date instanceof Date) {
      this.newEvent.date = this.newEvent.date.toISOString().split('T')[0] as any;
    }
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.pageSize);
  }

  get paginatedEvents(): EventModel[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredEvents.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get filteredEvents(): EventModel[] {
    if (!this.searchDate.trim()) {
      return this.ListEvent;
    }
    const searchDateStr = new Date(this.searchDate).toISOString().split('T')[0];
    return this.filterevent.filter(event => {
      const eventDateStr = new Date(event.date).toISOString().split('T')[0];
      return eventDateStr === searchDateStr;
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
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
    this.resetSelectedEvent();
  }
}