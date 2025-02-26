import { InternshipOffer } from "./internship-offer";
import { InternshipRequest } from "./internship-request";

export interface Internship {
    id?: number;
    title: string;
    description: string;
    startDate: string; // Use string for simplicity, convert Date in service
    endDate: string;
    status: InternStatus;
    internshipOffer?: InternshipOffer;
    internshipRequest?: InternshipRequest;
  }
  
  export enum InternStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED'
  }