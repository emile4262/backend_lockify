import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UnauthorizedException, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { LoginUserCommand } from '../commands/login-user.command'
import { AuthResponseDto } from '../dto/auth.response.dto'
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose'
import { Auth } from 'src/common/schema/auth.schema'
import { ConfigService } from '@nestjs/config'
import { LoginRequestDto } from '../dto/login.request.dto'

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @InjectModel(Auth.name)
    private readonly userModel: Model<any>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}
 

  async execute(cmd: LoginUserCommand): Promise<any> {
    const loginDto = new LoginRequestDto();
    loginDto.email = cmd.email;
    loginDto.password = cmd.password;
    return this.login(loginDto, '', '');
  }

  async login(createAuthDto: LoginRequestDto, ip: string, userAgent: string) {
    // try {
    const user = await this.userModel.findOne({ email: createAuthDto.email });
    if (!user) {
      throw new HttpException('Utilisateur non trouvé', 404);
    }

    if (!user?.password) {
      throw new HttpException('Utilisateur non trouvé', 404);
    }

    const isValid = await bcrypt.compare(createAuthDto.password, user.password);
    if (!isValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 3) {
        user.isLocked = true;
      }
      await user.save();
      throw new HttpException(
        'Identifiants invalides',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.deletedAt) throw new HttpException('Utilisateur supprimé', 406);

    if (user.status === false)
      throw new HttpException('Utilisateur désactivé', 407);

    if (user.mustChangePassword) {
      throw new HttpException(
        'Vous devez changer votre mot de passe avant de vous connecter.',
        408,
      );
    }

    const passwordPolicy = this.configService.get('passwordPolicy') || {};
    if (
      passwordPolicy.maxPasswordAgeDays &&
      passwordPolicy.maxPasswordAgeDays > 0
    ) {
      const passwordAge = user.passwordChangedAt;
      const daysSincePasswordUpdate = Math.floor(
        (Date.now() - passwordAge.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSincePasswordUpdate >= passwordPolicy.maxPasswordAgeDays) {
        console.log('Password expired, sending email notification');
        throw new HttpException(
          'Votre mot de passe a expiré. Veuillez le changer.',
          409,
        );
      }

      // Optionnel : Avertissement si le mot de passe expire bientôt (ex: 7 jours avant)
      const warningDays = 7;
      if (
        daysSincePasswordUpdate >=
        passwordPolicy.maxPasswordAgeDays - warningDays
      ) {
        const daysLeft =
          passwordPolicy.maxPasswordAgeDays - daysSincePasswordUpdate;
        // Vous pouvez logger cet avertissement ou l'inclure dans la réponse
        console.warn(
          `Mot de passe expire dans ${daysLeft} jour(s) pour ${user.email}`,
        );
      }
    }

    // 🔒 Vérifie si une session est déjà active (sauf pour les administrateurs)
    const now = new Date();

    // if (
    //   user.profile !== Profile.ADMINISTRATOR.toString() &&
    //   user.tokenExpiresAt &&
    //   new Date(user.tokenExpiresAt) > now
    // ) {
    //   // Et on suppose qu'un autre appareil essaie de se connecter
    //   throw new HttpException(
    //     'Une session est déjà active sur un autre appareil.',
    //     412,
    //   );
    // }
    // const code = Math.random().toString(36).substring(2, 52);
    const payload = {
      sub: user._id,
      email: user.email,
      // user_agent: code,
      profile: user.profile,
    };
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 10 minutes
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    //updte

    const userfirst = await this.userModel.findById(user._id);

    userfirst.failedLoginAttempts = 0; // Réinitialise les tentatives de connexion échouées
    userfirst.lastActivity = new Date(); // Met à jour la dernière activité
    // userfirst.user_agent = code; // Met à jour le user agent
    userfirst.tokenExpiresAt = tokenExpiresAt; // Met à jour la durée d'expiration du token
    userfirst.token = accessToken; // Met à jour le token
    await userfirst.save();

    // Réinitialise la révocation lors de la reconnexion
    await this.userModel.findByIdAndUpdate(user._id, {
      $unset: { revokedAt: 1 },
    });

    // await this.deviceModel.findOneAndUpdate(
    //   { userId: user._id },
    //   {
    //     $set: {
    //       ip,
    //       type: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
    //       lastSeen: new Date(),
    //       connected: true,
    //     },
    //   },
    //   { upsert: true, new: true },
    // );

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '1d',
    });

    if (user.isLocked) {
      //RETURN 405 et le token

      throw new HttpException('Compte verrouillé après 3 tentatives.', 405);
    }

    // ✅ Si aucune session active ou expirée

    // Mise à jour du user

    await user.save();

    return {
      accessToken,
      refreshToken,
      status: 200,
      user: {
        _id: user._id,
        email: user.email,
        // code: code,
        user: {
          _id: userfirst._id,
          email: userfirst.email,
          failedLoginAttempts: userfirst.failedLoginAttempts,
          lastActivity: userfirst.lastActivity,
          // user_agent: userfirst.user_agent,
          tokenExpiresAt: userfirst.tokenExpiresAt,
          status: userfirst.status,
          isLocked: userfirst.isLocked,
          mustChangePassword: userfirst.mustChangePassword,
          profile: userfirst.profile,
        },
      },
    };
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error; // Si c'est déjà une exception HTTP, on la relance
    //   }
    //   // Sinon, on lance une exception générique
    //   throw new HttpException(
    //     'Erreur lors de la connexion',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

}