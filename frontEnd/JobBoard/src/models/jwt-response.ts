export interface JwtResponse {
  accessToken: string; // Changed from 'token' to 'accessToken'
  type?: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}
