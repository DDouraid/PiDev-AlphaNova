export interface CvData {
  personalInfo: {
    fullName: string;
    phone: string;
    address: string;
  };
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  skills: string;
}
