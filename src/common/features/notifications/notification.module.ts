import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'
import { BullModule } from '@nestjs/bull'
import { NotificationController } from './notification.controller'
import { NotificationRepository } from './repository/notification.repository'
import { NotificationEntity, NotificationSchema } from 'src/schema/notification.schema'
import { DocumentEntity, DocumentSchema } from 'src/schema/documents.schema'
import { CreateNotificationHandler } from './handlers/create.notification'
import { MarquerLueHandler } from './handlers/marquer.lues'
import { MarquerTousLuesHandler } from './handlers/marquer.tous.lues'
import { EnvoiEmailHandler } from './handlers/envoi.email'
import { NotificationAllHandler } from './handlers/notificationAll'
import { NombreNonLuesHandler } from './handlers/nombre.non.lues'
import { AlertesHandler } from './handlers/alertes'

const CommandHandlers = [
  CreateNotificationHandler,
  MarquerLueHandler,
  MarquerTousLuesHandler,
  EnvoiEmailHandler,
]

const QueryHandlers = [
  NotificationAllHandler,
  NombreNonLuesHandler,
  AlertesHandler,
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: NotificationEntity.name, schema: NotificationSchema },
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [NotificationRepository],
})
export class NotificationModule {}