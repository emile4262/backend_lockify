import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { DocumentRepository } from '../repository/document.repository'
import { DocumentListResponseDto } from '../dto/document.response.dto'
import { ListDocumentsQuery } from '../query/list.document'

@QueryHandler(ListDocumentsQuery)
export class ListDocumentsHandler
  implements IQueryHandler<ListDocumentsQuery>
{
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: ListDocumentsQuery): Promise<DocumentListResponseDto> {
    return this.documentRepository.list(query)
  }
}