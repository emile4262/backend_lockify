import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'
import { DocumentEntity, DocumentSchema } from 'src/schema/documents.schema'
import { CategoryEntity, CategorySchema } from 'src/schema/categorie.schema'
import { CategoryController } from './categorie.controller'


const QueryHandlers = [
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: CategoryEntity.name, schema: CategorySchema },
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [CategoryController],
  providers: [
    ...QueryHandlers,
  ],
  exports: [],
})
export class CategoryModule {}