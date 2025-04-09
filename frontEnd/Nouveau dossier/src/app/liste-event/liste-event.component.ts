import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServeurService } from '../Serveurs/serveur.service';
// Renommez l'import pour éviter le conflit avec Event natif
import { Event as EventModel } from '../core/models/Event';

@Component({
  selector: 'app-liste-event',
  templateUrl: './liste-event.component.html',
  styleUrls: ['./liste-event.component.css']
})
export class ListeEventComponent implements OnInit { // Ajout de l'implémentation d'OnInit

  ListEvent: EventModel[] = []; // Utilisez le type renommé
  newEvent: EventModel = { idEvent: 0, title: '', description: '', date: new Date(), location: '' };

  constructor(
    private ms: ServeurService,
    private rt: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.ms.getAllEvenements().subscribe({
      next: (data: EventModel[]) => this.ListEvent = data,
      error: (err) => console.error('Error fetching events:', err)
    });
  }

  addEvent(): void {
    // Créez une copie pour éviter les problèmes de référence
    const eventToAdd: EventModel = { ...this.newEvent };
    
    // Assurez-vous que la date est correctement formatée
    if (typeof eventToAdd.date === 'string') {
      eventToAdd.date = new Date(eventToAdd.date);
    }
    
    this.ms.addEvenement(eventToAdd).subscribe({
      next: (addedEvent: EventModel) => {
        this.ListEvent.push(addedEvent);
        this.newEvent = { idEvent: 0, title: '', description: '', date: new Date(), location: '' };
        
        // Fermeture du modal plus sécurisée
        const modal = document.getElementById('addEventModal');
        if (modal) {
          modal.classList.remove('show');
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
        }
      },
      error: (err) => console.error('Error adding event:', err)
    });
  }

  deleteEvent(id: number): void {
    this.ms.deleteEvenement(id).subscribe({
      next: () => {
        this.ListEvent = this.ListEvent.filter(event => event.idEvent !== id);
      },
      error: (err) => console.error('Error deleting event:', err)
    });
  }
}