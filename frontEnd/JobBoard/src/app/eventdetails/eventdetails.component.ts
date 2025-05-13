import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServeurService } from '../Serveurs/serveur.service';
import { Event } from '../core/models/Event';

declare var maplibregl: any;

@Component({
  selector: 'app-eventdetails',
  templateUrl: './eventdetails.component.html',
  styleUrls: ['./eventdetails.component.css']
})
export class EventDetailsComponent implements OnInit, AfterViewInit {
  event: Event | null = null;
  errorMessage: string = '';
  private map: any;
  private marker: any;

  constructor(
    private route: ActivatedRoute,
    private serveurService: ServeurService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEventDetails(+id);
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  loadEventDetails(id: number): void {
    this.serveurService.getEventById(id).subscribe({
      next: (data) => {
        data.date = new Date(data.date);
        this.event = data;
        if (this.map) this.updateMapWithLocation(this.event.location);
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.errorMessage = 'Impossible de charger les détails de l\'événement';
      }
    });
  }

  private async initMap(): Promise<void> {
    try {
      const key = await this.serveurService.getMapTilerApiKey().toPromise();
      if (!key) return;

      await this.loadMapLibre();
      
      this.map = new maplibregl.Map({
        container: 'map',
        style: `https://api.maptiler.com/maps/streets/style.json?key=${key}`,
        center: [10.181667, 36.806389],
        zoom: 12
      });

      this.map.addControl(new maplibregl.NavigationControl());

      if (this.event?.location) {
        this.updateMapWithLocation(this.event.location);
      }

    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }

  private async updateMapWithLocation(location: string): Promise<void> {
    try {
      const key = await this.serveurService.getMapTilerApiKey().toPromise();
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${key}`
      );
      const data = await response.json();

      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;

        if (this.marker) this.marker.remove();

        this.marker = new maplibregl.Marker()
          .setLngLat([lng, lat])
          .addTo(this.map);

        this.map.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true
        });
      }
    } catch (error) {
      console.error('Location update error:', error);
    }
  }

  private loadMapLibre(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof maplibregl !== 'undefined') return resolve();

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.href = 'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  // ============ VOS FONCTIONS EXISTANTES (COPIER-COLLER) ============
  shareEvent(): void {
    if (this.event) {
      const eventDate = new Date(this.event.date).toLocaleDateString();
      const shareText = `${this.event.title}\n\nDate: ${eventDate}\nLieu: ${this.event.location}\n\n${this.event.description}`;
      
      if (navigator.share) {
        navigator.share({
          title: this.event.title,
          text: shareText,
          url: window.location.href
        }).catch(err => {
          console.error('Erreur de partage:', err);
          this.copyToClipboard(shareText);
        });
      } else {
        this.copyToClipboard(shareText);
      }
    }
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Les détails de l\'événement ont été copiés dans le presse-papiers !');
    }).catch(err => {
      console.error('Erreur de copie:', err);
      alert('Impossible de copier les détails. Voici les informations :\n\n' + text);
    });
  }
}
