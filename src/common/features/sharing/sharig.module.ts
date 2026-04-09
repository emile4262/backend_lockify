import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'
import { SharingController } from './sharing.controller'
import { SharingRepository } from './repository/sharing.repository'

// Command Handlers
import { GenererSharingHandler } from './handlers/generer.handlers'
import { RevoquerSharingHandler } from './handlers/revoquer.handlers'
import { ExpirationSharingHandler } from './handlers/expiration.handlers'
import { TelechargementSharingHandler } from './handlers/telechargement.handlers'

// Query Handlers
import { GetSharingHandler } from './handlers/get.sharing.handlers'
import { GetAllHistoriqueHandler } from './handlers/getAll.historique.handlers'
import { DocumentEntity, DocumentSchema } from 'src/schema/documents.schema'
import { SharingEntity, SharingSchema } from 'src/schema/sharing.schema'

const CommandHandlers = [
  GenererSharingHandler,
  RevoquerSharingHandler,
  ExpirationSharingHandler,
  TelechargementSharingHandler,
]

const QueryHandlers = [
  GetSharingHandler,
  GetAllHistoriqueHandler,
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: SharingEntity.name, schema: SharingSchema },
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [SharingController],
  providers: [
    SharingRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [SharingRepository],
})
export class SharingModule {}