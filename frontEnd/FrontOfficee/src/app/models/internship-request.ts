export interface InternshipRequest {
  id?: number;
  title: string;
  description: string;
  cvPath?: string;
  email?: string; // New field for email
  offerId?: number;
  cv?: File; // Used during form submission
}