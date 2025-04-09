import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatchResult } from 'src/models/match-result';
import { MatchingService } from 'src/services/matching.service';
import { trigger, style, animate, transition, keyframes } from '@angular/animations';

// Declare maplibregl as a global variable
declare var maplibregl: any;

@Component({
  selector: 'app-match',
  templateUrl: './matching.component.html',
  styleUrls: ['./matching.component.css'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px) scale(0.8)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        ),
      ]),
    ]),
    trigger('noMatchesAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate(
          '800ms ease-in-out',
          keyframes([
            style({ opacity: 0, transform: 'scale(0.5)', offset: 0 }),
            style({ opacity: 1, transform: 'scale(1.1)', offset: 0.7 }),
            style({ opacity: 1, transform: 'scale(1)', offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('sadFaceAnimation', [
      transition(':enter', [
        animate(
          '1s ease-in-out',
          keyframes([
            style({ transform: 'rotate(0deg)', offset: 0 }),
            style({ transform: 'rotate(5deg)', offset: 0.2 }),
            style({ transform: 'rotate(-5deg)', offset: 0.4 }),
            style({ transform: 'rotate(5deg)', offset: 0.6 }),
            style({ transform: 'rotate(-5deg)', offset: 0.8 }),
            style({ transform: 'rotate(0deg)', offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class MatchingComponent implements OnInit, AfterViewInit {
  matches: MatchResult[] = [];
  showCelebration: boolean = false;
  private shouldTriggerCelebration: boolean = false;
  mapTilerApiKey: string | null = null;
  maps: { [offerId: number]: any } = {};
  markers: { [offerId: number]: any } = {};
  errorMessage: string | null = null; // To display errors to the user

  @ViewChild('celebrationContainer', { static: false }) celebrationContainer!: ElementRef<HTMLDivElement>;

  constructor(private matchingService: MatchingService) {}

  ngOnInit(): void {
    this.matchingService.getMapTilerApiKey().subscribe({
      next: (key) => {
        console.log('MapTiler API Key:', key);
        this.mapTilerApiKey = key;
        this.fetchMatches();
      },
      error: (err) => {
        console.error('Failed to fetch MapTiler API key:', err);
        this.errorMessage = 'Failed to load map API key. Maps will not be available.';
        this.fetchMatches();
      },
    });
  }

  fetchMatches(): void {
    this.matchingService.matchCvWithOffers().subscribe({
      next: (matches) => {
        console.log('Received matches:', matches);
        this.matches = matches;
        if (matches.length > 0) {
          this.showCelebration = true;
          this.shouldTriggerCelebration = true;
        } else {
          this.showCelebration = false;
          this.shouldTriggerCelebration = false;
        }
        // Initialize maps after matches are fetched, but only if API key is available
        if (this.mapTilerApiKey) {
          setTimeout(() => this.initializeMaps(), 0);
        }
      },
      error: (err) => {
        console.error('Error fetching matches:', err);
        this.matches = [];
        this.showCelebration = false;
        this.shouldTriggerCelebration = false;
        this.errorMessage = 'Failed to load matches. Please try again later.';
      },
    });
  }

  ngAfterViewInit(): void {
    if (this.shouldTriggerCelebration) {
      this.triggerCelebration();
    }
    // Remove the direct call to initializeMaps from here
  }

  async initializeMaps(): Promise<void> {
    if (!this.mapTilerApiKey) {
      console.error('MapTiler API key not available');
      this.errorMessage = 'MapTiler API key not available. Maps cannot be displayed.';
      return;
    }

    // Load MapLibre GL library
    await this.loadMapLibre();

    for (const match of this.matches) {
      const location = match.offerDetails.location || 'Unknown Location';
      if (location === 'Unknown Location') {
        console.log(`Skipping map for offer ${match.offerId}: Location is 'Unknown Location'`);
        continue;
      }

      const mapElement = document.getElementById(`map-${match.offerId}`);
      if (!mapElement) {
        console.error(`Map container for offer ${match.offerId} not found in DOM`);
        continue;
      }
      console.log(`Map container for offer ${match.offerId} found:`, mapElement);

      try {
        // Initialize the map with a default center (Tunis coordinates as fallback)
        const map = new maplibregl.Map({
          container: `map-${match.offerId}`,
          style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${this.mapTilerApiKey}`,
          center: [10.181667, 36.806389], // Default center (Tunis)
          zoom: 12,
        });

        // Add navigation controls
        map.addControl(new maplibregl.NavigationControl());

        // Geocode the location and update the map
        await this.updateMapWithLocation(match.offerId, location, map);

        this.maps[match.offerId] = map;
      } catch (error) {
        console.error(`Failed to initialize map for offer ${match.offerId}:`, error);
        this.errorMessage = 'Failed to initialize maps. Please try again later.';
      }
    }
  }

  private async updateMapWithLocation(offerId: number, location: string, map: any): Promise<void> {
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${this.mapTilerApiKey}`
      );
      if (!response.ok) {
        throw new Error(`Geocoding failed with status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Geocoding response for ${location}:`, data);

      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        console.log(`Coordinates for ${location}: [${lat}, ${lng}]`);

        // Remove existing marker if any
        if (this.markers[offerId]) {
          this.markers[offerId].remove();
        }

        // Add a new marker
        const marker = new maplibregl.Marker()
          .setLngLat([lng, lat])
          .addTo(map);

        // Fly to the location
        map.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true,
        });

        this.markers[offerId] = marker;
      } else {
        console.error(`No geocoding results for location: ${location}`);
      }
    } catch (error) {
      console.error(`Failed to update map with location for offer ${offerId}:`, error);
    }
  }

  private loadMapLibre(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof maplibregl !== 'undefined') {
        return resolve();
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.href = 'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        resolve();
      };
      script.onerror = (error) => {
        console.error('Failed to load MapLibre GL script:', error);
        this.errorMessage = 'Failed to load map library. Maps cannot be displayed.';
        resolve(); // Resolve anyway to avoid blocking, but maps won't work
      };
      document.head.appendChild(script);
    });
  }

  triggerCelebration(): void {
    if (!this.celebrationContainer || !this.celebrationContainer.nativeElement) {
      console.error('Celebration container not found');
      return;
    }

    const celebrationContainer = this.celebrationContainer.nativeElement;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.classList.add('celebration-particle');

      const shape = this.getRandomShape();
      particle.classList.add(shape);

      particle.style.left = '50vw';
      particle.style.top = '50vh';

      const angle = Math.random() * 360;
      const distance = Math.random() * 300 + 100;
      const x = Math.cos((angle * Math.PI) / 180) * distance;
      const y = Math.sin((angle * Math.PI) / 180) * distance;

      particle.style.setProperty('--x', `${x}px`);
      particle.style.setProperty('--y', `${y}px`);
      particle.style.backgroundColor = this.getRandomColor();
      particle.style.animationDuration = `${Math.random() * 1 + 1}s`;
      particle.style.animationDelay = `${Math.random() * 0.5}s`;

      celebrationContainer.appendChild(particle);
    }

    setTimeout(() => {
      celebrationContainer.innerHTML = '';
      this.showCelebration = false;
    }, 3000);
  }

  getRandomColor(): string {
    const colors = ['#fc5130', '#f7b733', '#8a2387', '#00cc00', '#ff69b4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getRandomShape(): string {
    const shapes = ['circle', 'star', 'heart'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  getMatchScore(offerId: number): number {
    const match = this.matches.find((m) => m.offerId === offerId);
    return match ? match.matchScore * 100 : 0;
  }

  acceptMatch(offerId: number): void {
    console.log(`Accepted match with Offer ID: ${offerId}`);
  }

  rejectMatch(offerId: number): void {
    console.log(`Rejected match with Offer ID: ${offerId}`);
    this.matches = this.matches.filter((m) => m.offerId !== offerId);
    if (this.matches.length === 0) {
      this.showCelebration = false;
    }
  }

  ngOnDestroy(): void {
    Object.keys(this.maps).forEach((offerId) => {
      const map = this.maps[+offerId];
      const marker = this.markers[+offerId];
      if (marker) {
        marker.remove();
      }
      if (map) {
        map.remove();
      }
    });
    this.maps = {};
    this.markers = {};
  }
}