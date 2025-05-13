import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Event as EventModel } from '../core/models/Event';
import { ServeurService } from '../Serveurs/serveur.service';

@Component({
  selector: 'app-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.css']
})
export class FrontComponent implements OnInit {
  ListEvent: EventModel[] = [];
  currentPage = 1;
  pageSize = 6;
  totalPages = 0;
  eventImageMap: Map<number, string> = new Map();

  constructor(
    private ms: ServeurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.ms.getAllEvenements().subscribe({
      next: (data: EventModel[]) => {
        this.ListEvent = data.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        this.ListEvent.forEach(event => {
          if (event.idEvent) {
            this.eventImageMap.set(event.idEvent, this.getRandomEventImage());
          }
        });
        this.totalPages = Math.ceil(this.ListEvent.length / this.pageSize);
      },
      error: (err) => console.error('Erreur lors du chargement:', err)
    });
  }

  get paginatedEvents(): EventModel[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.ListEvent.slice(startIndex, startIndex + this.pageSize);
  }

  openEventDetails(event: EventModel): void {
    if (event.idEvent) {
      this.router.navigate(['/events', event.idEvent]);
    }
  }

  getEventImage(eventId?: number): string {
    if (!eventId) return 'assets/default-event.jpg';
    return this.eventImageMap.get(eventId) || 'assets/default-event.jpg';
  }

  private getRandomEventImage(): string {
    const defaultImages = [
      'assets/event1.jpg',
      'assets/event2.jpg',
      'assets/event3.jpg'
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  }

  changePage(page: number): void {
    this.currentPage = page;
    window.scrollTo(0, 0);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo(0, 0);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo(0, 0);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(start + maxVisiblePages - 1, this.totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}