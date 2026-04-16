export interface IOtpRecord {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
}

export interface IResetTokenRecord {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
}

export interface IAuthRepository {
  // OTP
  saveOtp(email: string, otpHash: string, expiresAt: Date): Promise<void>;
  findOtp(email: string): Promise<IOtpRecord | null>;
  deleteOtp(email: string): Promise<void>;
  incrementOtpAttempts(email: string): Promise<void>;

  // Reset Token
  saveResetToken(email: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findResetToken(email: string): Promise<IResetTokenRecord | null>;
  markResetTokenUsed(email: string): Promise<void>;

  // User
  findUserByEmail(email: string): Promise<{ id: string; email: string; password: string } | null>;
  updatePassword(email: string, newPassword: string): Promise<void>;

  // Business Logic Methods
  generateAndSendOtp(email: string, mailService: any): Promise<{ message: string; expiresIn: number }>;
  authenticateUser(email: string, password: string): Promise<any>;
  // verifyOtpAndGenerateResetToken(email: string, otp: string): Promise<{ resetToken: string }>;
  resetPasswordWithToken(email: string, lastPassword: string, newPassword: string): Promise<{ message: string }>;
}

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');