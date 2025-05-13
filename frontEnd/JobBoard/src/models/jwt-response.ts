export interface JwtResponse {
  substring(arg0: number, arg1: number): unknown;
  token: JwtResponse;
  headline: string;
  currentPosition: string;
  industry: string;
  locationCountry: string;
  locationCity: string;
  website: string;
  namePronunciation: string;
  additionalName: string;
  lastName: string;
  firstName: string;
  bannerImage: string;
  accessToken: string; // Changed from 'token' to 'accessToken'
  type?: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  profileImage: string; // Add profileImage field (optional, as it might be null initially)
  cvFile?: string; // Add cvFile field (optional, as it might be null initially)
}
