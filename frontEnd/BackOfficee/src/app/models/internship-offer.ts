import { InternshipRequest } from './internship-request'; // Import the InternshipRequest model

export interface InternshipOffer {
  id?: number;
  title: string;
  description: string;
  company?: string;
  location?: string;
  datePosted?: string; // Consider using Date if you parse dates
  internshipRequests?: InternshipRequest[]; // Renamed from 'internships' to 'internshipRequests' for clarity
}