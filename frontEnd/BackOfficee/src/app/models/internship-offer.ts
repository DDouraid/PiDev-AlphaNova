import { Internship } from './internship';

export interface InternshipOffer {
  id?: number;
  title: string;
  description: string;
  internships?: Internship[];
}