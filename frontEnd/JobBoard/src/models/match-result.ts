import { InternshipOffer } from "./internship-offer";

export interface MatchResult {
  offerId: number;
  matchScore: number;
  offerDetails: InternshipOffer;
}