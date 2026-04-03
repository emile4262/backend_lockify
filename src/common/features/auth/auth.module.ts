import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthController } from './auth.controller'
import { LoginUserHandler } from './repository/user.repository'
import { UserRepository } from './handlers/login-user.handler'
import { JwtStrategy } from 'src/guards/jwt-strategy'
import { ConfigModule } from '@nestjs/config'
import { Auth, AuthSchema } from 'src/schema/auth.schema'

const CommandHandlers = [
  LoginUserHandler,
]
 
const QueryHandlers = [
]

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key-for-development',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    JwtStrategy,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [],
})
export class AuthModule {}