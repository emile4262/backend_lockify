import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { UploadDocumentHandler } from './handlers/upload.handler'
import { UpdateDocumentHandler } from './handlers/update.handler'
import { DeleteDocumentHandler } from './handlers/delete.handler'
import { DocumentRepository } from './repository/document.repository'
import { DocumentEntity, DocumentSchema } from 'src/schema/documents.schema'
import { DocumentsController } from './document.controller'
import { GetDocumentByIdHandler } from './handlers/getOne.handler'
import { ListDocumentsHandler } from './handlers/list.handler'
const CommandHandlers = [
  UploadDocumentHandler,
  UpdateDocumentHandler,
  DeleteDocumentHandler,
]

const QueryHandlers = [
  GetDocumentByIdHandler,
  ListDocumentsHandler,
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
    MulterModule.register({
      storage: memoryStorage(), // fichier en mémoire, tu gères le stockage dans le handler
    }),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class DocumentsModule {}