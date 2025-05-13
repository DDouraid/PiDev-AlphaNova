export interface Feedback {
    id: number;
    comment: string;
    note: number;
    userId?: number; // Added to associate with the authenticated user
  }
