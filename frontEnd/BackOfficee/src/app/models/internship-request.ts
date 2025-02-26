import { Internship } from './internship';

export interface InternshipRequest {
  id?: number;
  title: string;
  description: string;
  internship?: Internship;
}