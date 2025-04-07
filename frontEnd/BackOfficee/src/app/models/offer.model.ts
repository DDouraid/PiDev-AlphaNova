export interface Offer {
    id?: number; // Optional ID for the offer
    title: string;
    description: string;
    company?: string;
    location?: string;
    datePosted?: string | Date;
  }