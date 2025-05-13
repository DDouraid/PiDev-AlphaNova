// frontend/src/models/cv-data.ts
export interface CvData {
  personalInfo: {
    fullName: string;
    firstName: string;
    lastName: string;
    additionalName: string;
    namePronunciation: string;
    phone: string;
    address: string;
    headline: string;
    currentPosition: string;
    industry: string;
    locationCountry: string;
    locationCity: string;
    website: string;
    about: string;
  };
  education: {
    institution: string;
    degree: string;
    year: string;
    showInIntro: boolean;
  }[];
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  skills: string;
  languages: string;
  certifications: {
    name: string;
    issuer: string;
    issueDate: string;
  }[];
  projects: {
    name: string;
    description: string;
    url: string;
  }[];
  publications: {
    title: string;
    publisher: string;
    publicationDate: string;
    url: string;
  }[];
}