export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export class OtpResponseDto {
  message: string;
  expiresIn: number; // secondes
}

export class ResetPasswordResponseDto {
  message: string;
  success: boolean;
}