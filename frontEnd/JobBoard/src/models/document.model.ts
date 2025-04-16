// Document model to match the backend entity
export enum DocumentType {
  RESUME = 'RESUME',
  REPORT = 'REPORT',
  AGREEMENT = 'AGREEMENT'
}

export interface Document {
  id: number;
  documentType: DocumentType;
  userId: number;
  filePath: string;
  createdDate: string;
}

export interface DocumentResponse {
  content: Blob;
  filename: string;
}

// Document generation request interfaces
export interface ResumeGenerationRequest {
  skills?: string;
  experience?: string;
  education?: string;
  userId: number;
}

export interface ReportGenerationRequest {
  title?: string;
  content?: string;
  userId: number;
}

export interface AgreementGenerationRequest {
  companyName: string;
  duration: string;
  userId: number;
}

// Document filter interfaces
export interface DocumentFilter {
  userId: number;
  type?: DocumentType;
}
