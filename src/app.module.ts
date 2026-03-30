import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bull'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MongooseModule } from '@nestjs/mongoose'
import { CommandBus, CqrsModule } from '@nestjs/cqrs'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './common/features/auth/auth.module'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { UsersModule } from './common/features/users/users.module'
import { DocumentsModule } from './common/features/documents/document.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),  
    AuthModule,
    UsersModule,
    DocumentsModule,

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): any => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT')
            ? Number(config.get('REDIS_PORT') ?? 6379)
            : 6379,
          password: config.get('REDIS_PASSWORD') || '',
        },
      }),
      inject: [ConfigService],
    }),

   MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/lockify_bd')  
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CommandBus,
    // APP_GUARD ici car guard global
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}