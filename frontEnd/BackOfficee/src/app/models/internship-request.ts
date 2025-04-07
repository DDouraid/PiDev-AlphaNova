import { Internship } from './internship';

export interface InternshipRequest {
  id?: number;
  title: string;
  description: string;
  email?: string;
  cv?: File;
  cvPath?: string;
  type: string;
  internship?: Internship; // Add reference to the associated Internship
}