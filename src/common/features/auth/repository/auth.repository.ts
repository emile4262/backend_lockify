import { Injectable, Inject, BadRequestException, UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from 'src/schema/auth.schema';
import { User, UserDocument } from 'src/schema/users.schema';
import { IAuthRepository, IOtpRecord, IResetTokenRecord } from './auth-interface.repository';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

// Constants
const OTP_CONFIG = {
  TTL_SECONDS: 300, // 5 minutes
  MAX_ATTEMPTS: 5,
  LENGTH: 6,
} as const;

const RESET_TOKEN_CONFIG = {
  TTL_SECONDS: 600, // 10 minutes
  LENGTH: 32, // bytes
} as const;

const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
} as const;

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectModel(Auth.name)
    private readonly otpModel: Model<AuthDocument>,
    @InjectModel(Auth.name)
    private readonly resetTokenModel: Model<AuthDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // Utilitaires privés
  private generateOtpCode(): string {
    return crypto.randomInt(10 ** (OTP_CONFIG.LENGTH - 1), 10 ** OTP_CONFIG.LENGTH - 1).toString();
  }

  private generateResetToken(): string {
    return crypto.randomBytes(RESET_TOKEN_CONFIG.LENGTH).toString('hex');
  }

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  private async compareHash(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }

  private createJwtPayload(user: { id: string; email: string }) {
    return { sub: user.id, email: user.email };
  }

  private isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  // OTP Methods
  async saveOtp(email: string, otpHash: string, expiresAt: Date): Promise<void> {
    await this.otpModel.findOneAndUpdate(
      { email },
      { email, otpHash, expiresAt, attempts: 0 },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async findOtp(email: string): Promise<IOtpRecord | null> {
    return this.otpModel.findOne({ email });
  }

  async deleteOtp(email: string): Promise<void> {
    await this.otpModel.deleteOne({ email });
  }

  async incrementOtpAttempts(email: string): Promise<void> {
    await this.otpModel.updateOne(
      { email },
      { $inc: { attempts: 1 } },
    );
  }

  // Reset Token Methods
  async saveResetToken(email: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.resetTokenModel.findOneAndUpdate(
      { email },
      { email, tokenHash, expiresAt, used: false },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async findResetToken(email: string): Promise<IResetTokenRecord | null> {
    return this.resetTokenModel.findOne({
      email,
      used: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async markResetTokenUsed(email: string): Promise<void> {
    await this.resetTokenModel.updateOne(
      { email },
      { $set: { used: true } },
    );
  }

  // User Methods
  async findUserByEmail(email: string): Promise<{ id: string; email: string; password: string } | null> {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) return null;
    
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password
    };
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    await this.userModel.updateOne(
      { email },
      { $set: { password: newPassword } }
    );
  }

  // Business Logic Methods
  async generateAndSendOtp(email: string, mailService: any): Promise<{ message: string; expiresIn: number }> {
    // Vérifier si l'utilisateur existe
    const user = await this.findUserByEmail(email); 
    if (!user) {
    throw new NotFoundException('Utilisateur non trouvé');
    }

    // Générer et hasher l'OTP
    const otp = this.generateOtpCode();
    const otpHash = await this.hashData(otp);
    const expiresAt = new Date(Date.now() + OTP_CONFIG.TTL_SECONDS * 1000);

    await this.saveOtp(email, otpHash, expiresAt);

    // Envoyer l'email avec template HTML
    await mailService.sendMail(
      email,
      'Votre code de réinitialisation',
      this.buildOtpEmailTemplate(otp),
    );

    // Retourner un objet vide pour correspondre au type de retour attendu
    return {
      message: 'Code de réinitialisation envoyé',
      expiresIn: OTP_CONFIG.TTL_SECONDS
    } 
   
  }

  private buildOtpEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Réinitialisation du mot de passe</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; padding: 30px; border-radius: 8px;">
                <tr>
                  <td align="center" style="font-size: 24px; font-weight: bold; color: #333333;">
                    Réinitialisation du mot de passe 
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 0; font-size: 16px; color: #555555;">
                    Bonjour utilisateur,
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 16px; color: #555555;">
                    Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de vérification :
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <div style="font-size: 28px; font-weight: bold; color: #007bff; background-color: #e9f0fb; padding: 12px 24px; display: inline-block; border-radius: 4px;">
                      ${otp}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #999999;">
                    Ce code expirera dans <strong>10 minutes</strong>.
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 20px; font-size: 14px; color: #999999;">
                    Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 30px; font-size: 14px; color: #555555;">
                    Merci,<br/>
                    L'équipe Lockify
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async authenticateUser(email: string, password: string): Promise<any> {
    // 1. Validation des entrées
    if (!email || !password) {
      throw new BadRequestException('Email et mot de passe sont obligatoires');
    }

    // 2. Récupérer l'utilisateur
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 3. Vérifier le mot de passe
    const isPasswordValid = await this.compareHash(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 4. Créer le payload JWT
    const payload = this.createJwtPayload(user);

    // 5. Générer les tokens avec fallback pour le secret
    const jwtSecret = process.env.JWT_SECRET || 'Lockify10@';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'lockify';

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, { 
          secret: jwtSecret,
          expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN 
        }),
        this.jwtService.signAsync(payload, { 
          secret: jwtRefreshSecret,
          expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN 
        }),
      ]);

      return {
        accessToken,
        refreshToken,
        user: { 
          id: user.id, 
          email: user.email
        }
      };
    } catch (error) {
      console.error('Erreur lors de la génération des tokens JWT:', error);
      throw new InternalServerErrorException('Erreur lors de l\'authentification');
    }
  }

  // async verifyOtpAndGenerateResetToken(email: string, otp: string): Promise<{ resetToken: string }> {
  //   const record = await this.findOtp(email);
  //   if (!record) {
  //     throw new BadRequestException('OTP non trouvé');
  //   }

  //   // Vérifier les tentatives
  //   if (record.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
  //     await this.deleteOtp(email);
  //     throw new BadRequestException('Trop de tentatives. Veuillez demander un nouvel OTP.');
  //   }

  //   // Vérifier l'expiration
  //   if (this.isExpired(record.expiresAt)) {
  //     await this.deleteOtp(email);
  //     throw new BadRequestException('OTP expiré');
  //   }

  //   // Vérifier la validité de l'OTP
  //   const isOtpValid = await this.compareHash(otp, record.otpHash);
  //   if (!isOtpValid) {
  //     await this.incrementOtpAttempts(email);
  //     const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - record.attempts - 1;
  //     throw new BadRequestException(`OTP invalide. Tentatives restantes: ${remainingAttempts}`);
  //   }

  //   // Générer et sauvegarder le reset token
  //   const resetToken = this.generateResetToken();
  //   const resetTokenHash = await this.hashData(resetToken);
  //   const expiresAt = new Date(Date.now() + RESET_TOKEN_CONFIG.TTL_SECONDS * 1000);

  //   await Promise.all([
  //     this.saveResetToken(email, resetTokenHash, expiresAt),
  //     this.deleteOtp(email),
  //   ]);

  //   return { resetToken };
  // }

  async resetPasswordWithToken(email: string, lastPassword: string, newPassword: string): Promise<{ message: string }> {
    // 1. Validation des entrées
    if (!email || !lastPassword || !newPassword) {
      throw new BadRequestException('Tous les champs sont obligatoires');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    if (newPassword === lastPassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    // 2. Récupérer l'utilisateur et vérifier l'ancien mot de passe
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // 3. Vérifier que l'ancien mot de passe est correct
    const isOldPasswordValid = await this.compareHash(lastPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('L\'ancien mot de passe est incorrect');
    }

    // 4. Hasher le nouveau mot de passe
    const hashedPassword = await this.hashData(newPassword);

    // 5. Mettre à jour le mot de passe et nettoyer les tokens
    await this.updatePassword(email, hashedPassword);

    return { 
      message: 'Mot de passe mis à jour avec succès'
    };
  }
}
