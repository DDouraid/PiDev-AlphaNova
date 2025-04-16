export interface JwtResponse {
  accessToken: string; // Changed from 'token' to 'accessToken'
  type?: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  profileImage: string; // Add profileImage field (optional, as it might be null initially)
  cvFile?: string; // Add cvFile field (optional, as it might be null initially)
}
