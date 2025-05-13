import { InternshipOffer } from "./internship-offer";

export interface MatchResult {
  offerId: number;
  matchScore: number;
  offerDetails: {
    id: number;
    title: string;
    description: string;
    company: string;
    location: string;
    datePosted: string;
  };
  admissionPrediction?: {
    probability: number;
    recommendedUniversity?: string;
    cluster?: number;
  };
}