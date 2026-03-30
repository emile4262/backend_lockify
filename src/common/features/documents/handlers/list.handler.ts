import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { DocumentRepository } from '../repository/document.repository'
import { ListDocumentsQuery } from '../query/list.document'
import { PaginationDto } from '../dto/pagination.dto'
import { PaginationService } from 'src/pagination/pagination'
import { DocumentEntity } from 'src/common/schema/documents.schema'

@QueryHandler(ListDocumentsQuery)
export class ListDocumentsHandler
  implements IQueryHandler<ListDocumentsQuery>
{
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: ListDocumentsQuery): Promise<PaginationService<DocumentEntity>> {
    
    return await this.documentRepository.findAllByUsers(query.pagination ?? {}); 
  }
}