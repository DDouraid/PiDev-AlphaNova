import { InternshipRequest } from './internship-request';

export interface InternshipOffer {
  id?: number;
  title: string;
  description: string;
  company: string;
  location: string;
  datePosted?: string;
  durationInMonths: number | null;
  internshipRequests: any[];
  userId?: number;       // Add user ID
  username?: string;     // Add username
}
