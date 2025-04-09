// src/app/core/models/event.ts
export class Event {
    idEvent!: number;  // Matches backend 'idEvent'
    title!: string;    // Changed 'Title' to 'title' for consistency (lowercase convention)
    description!: string; // Matches 'Description'
    date!: Date;       // Matches 'Date'
    location!: string; // Changed 'Location' to 'location' for consistency
  }