import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthController } from './auth.controller'
import { JwtStrategy } from 'src/guards/jwt-strategy'
import { ConfigModule } from '@nestjs/config'
import { Auth, AuthSchema } from 'src/schema/auth.schema'
import { User, UserSchema } from 'src/schema/users.schema'
import { MailModule } from 'src/common/mail/mail.module'
import { UsersModule } from '../users/users.module'
import { GenerateOtpHandler } from './handlers/generate-otp.handler'
import { ResetPasswordHandler } from './handlers/reset-password.handler'
import { LoginUserHandler } from './handlers/login-user.handler'
import { AuthRepository } from './repository/auth.repository'
import { AUTH_REPOSITORY } from './repository/auth-interface.repository'
import { JwtService } from '@nestjs/jwt'

const CommandHandlers = [
  LoginUserHandler,
  GenerateOtpHandler,
  ResetPasswordHandler,
]
 
const QueryHandlers = [
]

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: User.name, schema: UserSchema }
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key-for-development',
      signOptions: { expiresIn: '7d' },
    }),
    MailModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtService,
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    JwtStrategy,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [],
})
export class AuthModule {}