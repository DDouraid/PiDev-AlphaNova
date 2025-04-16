export interface Interview {
    id?: number;
    interviewDate?: string;
    status?: 'SCHEDULED' | 'ACCEPTED' | 'REJECTED';
    internshipRequest?: {
      id?: number;
      email?: string;
      title?: string;
    };
    userName?: string; // Derived from internshipRequest.email
    internship?: string; // Derived from internshipRequest.title
  }