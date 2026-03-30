import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
 constructor(
  private configService: ConfigService,
) {
   const secret = configService.get<string>('JWT_SECRET') || 'fallback-secret-key-for-development';
   super({
     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
     ignoreExpiration: false,
     secretOrKey: secret
   });
}

async validate(payload: { sub: string; email: string; role: string }): Promise<
{ userId: string; email: string; role: string }
> {
  if (!payload.role) {
    throw new UnauthorizedException('Information de rôle manquante');
  }

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
}
