import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mon_secret_jwt_par_defaut',
      signOptions: { expiresIn: '48h' },
    }),
  ],
  controllers: [],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthConfigModule {}

