// frontend/src/models/reset-password-request.ts
export interface ResetPasswordRequest {
  email: string;
  otp?: string;
  newPassword?: string;
}
