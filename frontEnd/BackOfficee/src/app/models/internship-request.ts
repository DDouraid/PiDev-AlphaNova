import { Internship } from './internship';

export interface InternshipRequest {
  id?: number;
  title: string;
  description: string;
  email?: string;
  cv?: File;
  cvPath?: string;
  type: string;
  status?: string; // Added status field (e.g., "PENDING", "ACCEPTED", "REJECTED")
  internship?: Internship;
}