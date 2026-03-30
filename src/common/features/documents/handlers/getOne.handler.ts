import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { DocumentRepository } from '../repository/document.repository'
import { DocumentResponseDto } from '../dto/document.response.dto'
import { GetDocumentByIdQuery } from '../query/getOne.document'

@QueryHandler(GetDocumentByIdQuery)
export class GetDocumentByIdHandler
  implements IQueryHandler<GetDocumentByIdQuery>
{
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: GetDocumentByIdQuery): Promise<DocumentResponseDto> {
    return await this.documentRepository.getById(query.Id)
  }
}